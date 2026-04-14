const fs = require('fs');
const path = require('path');

/**
 * Генератор markdown-файла с описанием схемы БД на основе Liquibase databaseChangeLog.
 */
class DbSchemaGenerator {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.outputDir = path.join(this.projectRoot, '__documentation');
        this.outputFile = path.join(this.outputDir, 'db_schema.md');
        this.tables = new Map(); // tableName -> { tableName, sources:Set, columns:[], fks:[], indexes:[] }
        this.skippedFiles = [];
    }

    generate() {
        console.log('🚀 Генерация схемы БД...');
        const changelogFiles = this.findChangelogFiles();
        console.log(`📄 Найдено файлов databaseChangeLog: ${changelogFiles.length}`);

        changelogFiles.forEach(file => this.parseChangelog(file));

        const markdown = this.buildMarkdown();
        this.writeOutput(markdown);
        console.log(`✅ Готово: ${path.relative(this.projectRoot, this.outputFile)}`);
        if (this.skippedFiles.length > 0) {
            console.log('\n⚠️ Пропущены файлы (не удалось распарсить createTable):');
            this.skippedFiles.forEach(f => console.log(` - ${path.relative(this.projectRoot, f)}`));
        }
    }

    /**
     * Рекурсивный поиск всех XML-файлов, содержащих databaseChangeLog.
     */
    findChangelogFiles() {
        const files = [];
        const excludeDirs = new Set(['.git', 'node_modules', 'target', '.idea', '.vscode', '__documentation']);

        const walk = dir => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            entries.forEach(entry => {
                const full = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    if (!excludeDirs.has(entry.name)) {
                        walk(full);
                    }
                    return;
                }
                if (!entry.name.endsWith('.xml')) return;
                const content = fs.readFileSync(full, 'utf-8');
                if (content.includes('<databaseChangeLog')) {
                    files.push(full);
                }
            });
        };

        walk(this.projectRoot);
        return files;
    }

    parseChangelog(filePath) {
        const xml = fs.readFileSync(filePath, 'utf-8');
        const rel = path.relative(this.projectRoot, filePath);

        let parsedSomething = false;

        // Parse createTable blocks
        const tableRegex = /<createTable[^>]*tableName="([^"]+)"[^>]*>([\s\S]*?)<\/createTable>/g;
        let tableMatch;
        while ((tableMatch = tableRegex.exec(xml)) !== null) {
            parsedSomething = true;
            const tableName = tableMatch[1];
            const body = tableMatch[2];
            const table = this.ensureTable(tableName);
            table.sources.add(rel);
            const columns = this.parseColumns(body);
            table.columns.push(...columns);
        }

        // Parse addForeignKeyConstraint blocks
        const fkRegex = /<addForeignKeyConstraint[^>]*baseTableName="([^"]+)"[^>]*baseColumnNames="([^"]+)"[^>]*referencedTableName="([^"]+)"[^>]*referencedColumnNames="([^"]+)"[^>]*([^>]*)>/g;
        let fkMatch;
        while ((fkMatch = fkRegex.exec(xml)) !== null) {
            parsedSomething = true;
            const baseTable = fkMatch[1];
            const baseColumns = fkMatch[2];
            const refTable = fkMatch[3];
            const refColumns = fkMatch[4];
            const tail = fkMatch[5] || '';
            const attrs = this.parseAttributes(tail);
            const name = attrs.constraintName || '';
            const onDelete = attrs.onDelete || '';
            const fk = {
                name,
                baseColumns,
                refTable,
                refColumns,
                onDelete,
            };
            const table = this.ensureTable(baseTable);
            table.sources.add(rel);
            table.fks.push(fk);
        }

        // Parse createIndex blocks
        const idxRegex = /<createIndex[^>]*indexName="([^"]+)"[^>]*tableName="([^"]+)"[^>]*>([\s\S]*?)<\/createIndex>/g;
        let idxMatch;
        while ((idxMatch = idxRegex.exec(xml)) !== null) {
            parsedSomething = true;
            const indexName = idxMatch[1];
            const tableName = idxMatch[2];
            const body = idxMatch[3];
            const columns = [];
            const colRegex = /<column[^>]*name="([^"]+)"[^>]*\/>/g;
            let colMatch;
            while ((colMatch = colRegex.exec(body)) !== null) {
                columns.push(colMatch[1]);
            }
            const idx = { name: indexName, columns };
            const table = this.ensureTable(tableName);
            table.sources.add(rel);
            table.indexes.push(idx);
        }

        if (!parsedSomething) {
            this.skippedFiles.push(filePath);
        }
    }

    parseColumns(body) {
        const columns = [];
        const colRegex = /<column\s+([^>]*?)(?:\/>|>([\s\S]*?)<\/column>)/g;
        let match;
        while ((match = colRegex.exec(body)) !== null) {
            const attrString = match[1];
            const inner = match[2] || '';
            const attrs = this.parseAttributes(attrString);
            const constraints = this.parseConstraints(inner);

            const col = {
                name: attrs.name || '',
                type: attrs.type || '',
                defaultValue: attrs.defaultValue || attrs.defaultValueBoolean || attrs.defaultValueComputed || '',
                nullable: constraints.nullable !== undefined ? constraints.nullable : true,
                primaryKey: constraints.primaryKey || false,
                unique: constraints.unique || false,
            };
            columns.push(col);
        }
        return columns;
    }

    parseConstraints(inner) {
        const result = {};
        const constraintsRegex = /<constraints\s+([^>]*?)\/>/g;
        let match;
        while ((match = constraintsRegex.exec(inner)) !== null) {
            const attrs = this.parseAttributes(match[1]);
            if (attrs.nullable !== undefined) {
                result.nullable = attrs.nullable !== 'false';
            }
            if (attrs.primaryKey !== undefined) {
                result.primaryKey = attrs.primaryKey === 'true';
            }
            if (attrs.unique !== undefined) {
                result.unique = attrs.unique === 'true';
            }
        }
        return result;
    }

    parseAttributes(attrString) {
        const attrs = {};
        const attrRegex = /(\w+)\s*=\s*"([^"]*)"/g;
        let match;
        while ((match = attrRegex.exec(attrString)) !== null) {
            attrs[match[1]] = match[2];
        }
        return attrs;
    }

    ensureTable(tableName) {
        if (!this.tables.has(tableName)) {
            this.tables.set(tableName, {
                tableName,
                sources: new Set(),
                columns: [],
                fks: [],
                indexes: [],
            });
        }
        return this.tables.get(tableName);
    }

    buildMarkdown() {
        const lines = [];
        const allTables = Array.from(this.tables.values()).sort((a, b) => a.tableName.localeCompare(b.tableName));

        lines.push('# Database Schema');
        lines.push('');
        lines.push(`Generated at ${new Date().toISOString()}`);
        lines.push('');
        lines.push('> Автоматически сгенерировано из Liquibase databaseChangeLog файлов.');
        lines.push('');
        lines.push('## Tables');
        lines.push('');
        lines.push('| Table | Columns | Source Files |');
        lines.push('|-------|---------|--------------|');
        allTables.forEach(t => {
            const sourceList = Array.from(t.sources).map(s => '`' + s.replace(/\\/g, '/') + '`').join('<br>');
            lines.push(`| \`${t.tableName}\` | ${t.columns.length} | ${sourceList} |`);
        });
        lines.push('');

        allTables.forEach(table => {
            lines.push(`## ${table.tableName}`);
            lines.push('');
            lines.push(`Sources: ${Array.from(table.sources).map(s => '`' + s.replace(/\\/g, '/') + '`').join(', ')}`);
            lines.push('');
            if (table.columns.length > 0) {
                lines.push('| Column | Type | PK | Nullable | Unique | Default |');
                lines.push('|--------|------|----|----------|--------|---------|');
                table.columns.forEach(col => {
                    const pk = col.primaryKey ? '✅' : '';
                    const nullable = col.nullable ? '✅' : '❌';
                    const unique = col.unique ? '✅' : '';
                    const def = col.defaultValue ? '\`' + col.defaultValue + '\`' : '';
                    lines.push(`| \`${col.name}\` | \`${col.type}\` | ${pk} | ${nullable} | ${unique} | ${def} |`);
                });
                lines.push('');
            }

            if (table.fks.length > 0) {
                lines.push('**Foreign Keys**');
                table.fks.forEach(fk => {
                    const name = fk.name ? `\`${fk.name}\`` : 'FK';
                    const onDelete = fk.onDelete ? ` onDelete=${fk.onDelete}` : '';
                    lines.push(`- ${name}: \`${fk.baseColumns}\` -> \`${fk.refTable}\`(\`${fk.refColumns}\`)${onDelete}`);
                });
                lines.push('');
            }

            if (table.indexes.length > 0) {
                lines.push('**Indexes**');
                table.indexes.forEach(idx => {
                    lines.push(`- \`${idx.name}\`: ${idx.columns.map(c => '\`' + c + '\`').join(', ')}`);
                });
                lines.push('');
            }

            lines.push('---');
            lines.push('');
        });

        // Mermaid ER diagram built from foreign keys
        lines.push('## Diagram');
        lines.push('');
        lines.push(this.buildMermaid(allTables));
        lines.push('');

        return lines.join('\n');
    }

    /**
     * Собирает Mermaid ER-диаграмму по таблицам и FK.
     */
    buildMermaid(allTables) {
        const lines = [];
        lines.push('```mermaid');
        lines.push('erDiagram');

        // Определяем таблицы и их колонки
        allTables.forEach(table => {
            lines.push(`  ${this.escapeMermaid(table.tableName)} {`);
            table.columns.forEach(col => {
                const type = this.escapeMermaidType(col.type || 'TYPE');
                const name = col.name;
                const pk = col.primaryKey ? ' PK' : '';
                const fk = table.fks.some(f => f.baseColumns === name) ? ' FK' : '';
                lines.push(`    ${type} ${name}${pk}${fk}`);
            });
            lines.push('  }');
        });

        // Связи по внешним ключам
        const rendered = new Set();
        allTables.forEach(table => {
            table.fks.forEach(fk => {
                const from = this.escapeMermaid(fk.refTable);
                const to = this.escapeMermaid(table.tableName);
                const key = `${from}|${to}`;
                if (rendered.has(key)) return;
                rendered.add(key);
                // refTable (one) to baseTable (many)
                lines.push(`  ${from} ||--o{ ${to} : ""`);
            });
        });

        lines.push('```');
        return lines.join('\n');
    }

    escapeMermaid(name) {
        return name.replace(/[^A-Za-z0-9_]/g, '_');
    }

    escapeMermaidType(type) {
        // Убираем пробелы и спецсимволы из типов для Mermaid
        return type.replace(/\s+/g, '_').replace(/[()]/g, '').toUpperCase();
    }

    writeOutput(content) {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
        fs.writeFileSync(this.outputFile, content, 'utf-8');
    }
}

if (require.main === module) {
    const generator = new DbSchemaGenerator();
    generator.generate();
}
