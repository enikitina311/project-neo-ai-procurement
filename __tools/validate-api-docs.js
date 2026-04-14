const fs = require('fs');
const path = require('path');

/**
 * Валидатор контроллеров - проверяет наличие документации
 */
class ControllerValidator {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.issues = [];
    }

    validate() {
        console.log('🔍 Валидация документации контроллеров...\n');

        this.scanControllers();

        if (this.issues.length === 0) {
            console.log('✅ Все контроллеры корректно задокументированы!');
            return 0;
        } else {
            console.log(`\n❌ Найдено проблем: ${this.issues.length}\n`);
            this.issues.forEach(issue => {
                console.log(`  ${issue.severity === 'error' ? '❌' : '⚠️'} ${issue.file}`);
                console.log(`     ${issue.message}\n`);
            });
            return this.issues.filter(i => i.severity === 'error').length;
        }
    }

    scanControllers() {
        // Core контроллеры
        const coreControllersPath = path.join(this.projectRoot, 'core', 'src', 'main', 'java', 'ru', 'korusconsulting', 'projectneo', 'core', 'controllers');
        this.scanDirectory(coreControllersPath);

        // Контроллеры модулей
        const modulesPath = path.join(this.projectRoot, 'modules');
        if (fs.existsSync(modulesPath)) {
            const modules = fs.readdirSync(modulesPath).filter(f => {
                const stat = fs.statSync(path.join(modulesPath, f));
                return stat.isDirectory();
            });

            modules.forEach(moduleName => {
                const moduleControllersPath = path.join(modulesPath, moduleName, 'src', 'main', 'java');
                if (fs.existsSync(moduleControllersPath)) {
                    this.scanDirectory(moduleControllersPath);
                }
            });
        }
    }

    scanDirectory(dir) {
        if (!fs.existsSync(dir)) {
            return;
        }

        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                this.scanDirectory(filePath);
            } else if (file.endsWith('.java')) {
                const content = fs.readFileSync(filePath, 'utf-8');
                
                if (this.isController(content)) {
                    this.validateController(content, filePath);
                }
            }
        });
    }

    isController(content) {
        return content.includes('@RestController') || 
               content.includes('extends BaseControllerComponent') ||
               content.includes('@ApiPost') || 
               content.includes('@ApiGet');
    }

    validateController(content, filePath) {
        const relativePath = path.relative(this.projectRoot, filePath);
        const lines = content.split('\n');

        let i = 0;
        let lineNumber = 0;
        
        while (i < lines.length) {
            const line = lines[i].trim();
            lineNumber = i + 1;

            // Ищем аннотации @Api*
            if (line.match(/@Api(Get|Post|Put|Delete|Patch)\(/)) {
                let annotationBlock = line;
                let bracketCount = (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
                
                while (bracketCount > 0 && i < lines.length - 1) {
                    i++;
                    const nextLine = lines[i].trim();
                    annotationBlock += ' ' + nextLine;
                    bracketCount += (nextLine.match(/\(/g) || []).length;
                    bracketCount -= (nextLine.match(/\)/g) || []).length;
                }

                // Проверяем обязательные поля
                const pathMatch = annotationBlock.match(/path\s*=\s*"([^"]+)"/);
                const summaryMatch = annotationBlock.match(/summary\s*=\s*"([^"]+)"/);
                const descriptionMatch = annotationBlock.match(/description\s*=\s*"([^"]+)"/);

                if (!pathMatch) {
                    this.issues.push({
                        severity: 'error',
                        file: relativePath,
                        line: lineNumber,
                        message: `Отсутствует параметр 'path' в аннотации (строка ${lineNumber})`
                    });
                }

                if (!summaryMatch) {
                    this.issues.push({
                        severity: 'warning',
                        file: relativePath,
                        line: lineNumber,
                        message: `Отсутствует параметр 'summary' в аннотации для '${pathMatch ? pathMatch[1] : '???'}' (строка ${lineNumber})`
                    });
                }

                if (!descriptionMatch) {
                    this.issues.push({
                        severity: 'warning',
                        file: relativePath,
                        line: lineNumber,
                        message: `Отсутствует параметр 'description' в аннотации для '${pathMatch ? pathMatch[1] : '???'}' (строка ${lineNumber})`
                    });
                }
            }

            i++;
        }
    }
}

// Запуск валидатора
const validator = new ControllerValidator();
const exitCode = validator.validate();
process.exit(exitCode);
