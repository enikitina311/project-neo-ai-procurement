const fs = require('fs');
const path = require('path');

/**
 * Генератор README.md файла на основе контроллеров и package.json
 */
class ReadmeGenerator {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.controllers = [];
        this.packageJson = null;
        this.dtoSchemas = {}; // Кеш для DTO схем
    }

    /**
     * Основной метод генерации
     */
    generate() {
        console.log('🚀 Генерация документации...\n');

        // Загружаем package.json
        this.loadPackageJson();

        // Сканируем контроллеры
        this.scanControllers();

        // Генерируем отдельные файлы API спецификаций
        this.generateApiSpecifications();

        // Генерируем основной README
        const readme = this.buildReadme();

        // Сохраняем файл
        this.saveReadme(readme);

        console.log('\n✅ Вся документация успешно сгенерирована!');
    }

    /**
     * Загрузка package.json
     */
    loadPackageJson() {
        const packagePath = path.join(this.projectRoot, 'package.json');
        this.packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
        console.log(`📦 Загружен package.json: ${this.packageJson.name} v${this.packageJson.version}`);
    }

    /**
     * Сканирование всех контроллеров
     */
    scanControllers() {
        console.log('🔍 Сканирование контроллеров...\n');

        // Основные контроллеры в core
        const coreControllersPath = path.join(this.projectRoot, 'core', 'src', 'main', 'java', 'ru', 'korusconsulting', 'projectneo', 'core', 'controllers');
        this.scanDirectory(coreControllersPath, 'Core');

        // Контроллеры в модулях
        const modulesPath = path.join(this.projectRoot, 'modules');
        if (fs.existsSync(modulesPath)) {
            const modules = fs.readdirSync(modulesPath).filter(f => {
                const stat = fs.statSync(path.join(modulesPath, f));
                return stat.isDirectory();
            });

            modules.forEach(moduleName => {
                const moduleControllersPath = path.join(modulesPath, moduleName, 'src', 'main', 'java');
                if (fs.existsSync(moduleControllersPath)) {
                    this.scanDirectory(moduleControllersPath, `Module: ${moduleName}`);
                }
            });

            // Дополнительно: рекурсивно учитываем nested модули в modules/ai
            const aiRoot = path.join(modulesPath, 'ai');
            if (fs.existsSync(aiRoot)) {
                const javaDirs = this.findJavaSourceDirs(aiRoot);
                javaDirs.forEach(javaDir => {
                    // Формируем категорию: Module: ai/<submodule>
                    const rel = path.relative(modulesPath, javaDir); // e.g., ai/questions/app/src/main/java
                    const segments = rel.split(path.sep);
                    const srcIdx = segments.indexOf('src');
                    const beforeSrc = srcIdx > 0 ? segments.slice(0, srcIdx) : segments;
                    let category = 'Module: ai';
                    if (beforeSrc.length >= 2) {
                        category = `Module: ${beforeSrc[0]}/${beforeSrc[1]}`;
                    }
                    this.scanDirectory(javaDir, category);
                });
            }
        }

        console.log(`\n✅ Найдено контроллеров: ${this.controllers.length}\n`);
    }

    /**
     * Рекурсивное сканирование директории
     */
    scanDirectory(dir, category) {
        if (!fs.existsSync(dir)) {
            return;
        }

        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                this.scanDirectory(filePath, category);
            } else if (file.endsWith('.java')) {
                const content = fs.readFileSync(filePath, 'utf-8');
                
                // Проверяем, является ли файл контроллером
                if (this.isController(content)) {
                    const controller = this.parseController(content, file, category);
                    if (controller && controller.endpoints.length > 0) {
                        this.controllers.push(controller);
                        console.log(`  📄 ${controller.name} (${controller.endpoints.length} endpoints)`);
                    }
                }
            }
        });
    }

    /**
     * Проверка, является ли файл контроллером
     */
    isController(content) {
        return content.includes('@RestController') || 
               content.includes('extends BaseControllerComponent') ||
               content.includes('@ApiPost') || 
               content.includes('@ApiGet') ||
               content.includes('@ApiPut') ||
               content.includes('@ApiDelete') ||
               content.includes('@ApiPatch');
    }

    /**
     * Парсинг контроллера
     */
    parseController(content, fileName, category) {
        const lines = content.split('\n');
        
        // Извлекаем имя класса
        const classMatch = content.match(/public\s+class\s+(\w+)/);
        const className = classMatch ? classMatch[1] : fileName.replace('.java', '');

        // Извлекаем @Tag аннотацию для группировки
        let tagName = category;
        let tagDescription = '';
        const tagMatch = content.match(/@Tag\(name\s*=\s*"([^"]+)"(?:,\s*description\s*=\s*"([^"]+)")?\)/);
        if (tagMatch) {
            tagName = tagMatch[1];
            tagDescription = tagMatch[2] || '';
        }

        // Извлекаем базовый путь из @RequestMapping
        let basePath = '';
        const requestMappingMatch = content.match(/@RequestMapping\("([^"]+)"\)/);
        if (requestMappingMatch) {
            basePath = requestMappingMatch[1];
        }

        const controller = {
            name: className,
            category: category,
            tagName: tagName,
            tagDescription: tagDescription,
            basePath: basePath,
            endpoints: [],
            content: content  // Сохраняем весь контент для парсинга сигнатур методов
        };

        // Парсим эндпоинты - собираем весь блок аннотации
        let i = 0;
        while (i < lines.length) {
            const line = lines[i].trim();

            // Ищем аннотации @Api*
            if (line.match(/@Api(Get|Post|Put|Delete|Patch)\(/)) {
                const endpoint = {
                    method: '',
                    path: '',
                    summary: '',
                    description: '',
                    requireAuth: true,
                    requestBody: null,
                    responses: []
                };

                // Определяем HTTP метод
                if (line.includes('@ApiGet')) endpoint.method = 'GET';
                else if (line.includes('@ApiPost')) endpoint.method = 'POST';
                else if (line.includes('@ApiPut')) endpoint.method = 'PUT';
                else if (line.includes('@ApiDelete')) endpoint.method = 'DELETE';
                else if (line.includes('@ApiPatch')) endpoint.method = 'PATCH';

                // Собираем весь блок аннотации до закрывающей скобки метода
                let annotationBlock = line;
                let bracketCount = (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
                
                while (bracketCount > 0 && i < lines.length - 1) {
                    i++;
                    const nextLine = lines[i].trim();
                    annotationBlock += ' ' + nextLine;
                    bracketCount += (nextLine.match(/\(/g) || []).length;
                    bracketCount -= (nextLine.match(/\)/g) || []).length;
                }

                // Извлекаем параметры из полного блока
                const pathMatch = annotationBlock.match(/path\s*=\s*"([^"]+)"/);
                if (pathMatch) {
                    endpoint.path = pathMatch[1];
                }

                const summaryMatch = annotationBlock.match(/summary\s*=\s*"([^"]+)"/);
                if (summaryMatch) {
                    endpoint.summary = summaryMatch[1];
                }

                const descMatch = annotationBlock.match(/description\s*=\s*"([^"]+)"/);
                if (descMatch) {
                    endpoint.description = descMatch[1];
                }

                const authMatch = annotationBlock.match(/requireAuth\s*=\s*(true|false)/);
                if (authMatch) {
                    endpoint.requireAuth = authMatch[1] === 'true';
                }

                // Парсим requestBody
                const requestBodyMatch = annotationBlock.match(/requestBody\s*=\s*@ApiOperation\.RequestBody\(([^)]+(?:\([^)]*\)[^)]*)*)\)/);
                if (requestBodyMatch) {
                    const requestBodyContent = requestBodyMatch[1];
                    const reqDescMatch = requestBodyContent.match(/description\s*=\s*"([^"]+)"/);
                    const reqRequiredMatch = requestBodyContent.match(/required\s*=\s*(true|false)/);
                    const reqSchemaMatch = requestBodyContent.match(/schema\s*=\s*(\w+)\.class/);
                    const reqExampleMatch = requestBodyContent.match(/example\s*=\s*"""([\s\S]*?)"""/);
                    
                    endpoint.requestBody = {
                        description: reqDescMatch ? reqDescMatch[1] : '',
                        required: reqRequiredMatch ? reqRequiredMatch[1] === 'true' : true,
                        schema: reqSchemaMatch ? reqSchemaMatch[1] : '',
                        example: reqExampleMatch ? reqExampleMatch[1].trim() : ''
                    };
                }

                // Парсим responses - улучшенная версия
                const responsesMatch = annotationBlock.match(/responses\s*=\s*\{([\s\S]*?)\}(?=\s*\))/);
                if (responsesMatch) {
                    const responsesBlock = responsesMatch[1];
                    // Более гибкий паттерн для вложенных скобок
                    const responsePattern = /@ApiOperation\.Response\s*\(([^@]*?)(?=\),|\)$)/g;
                    let respMatch;
                    
                    while ((respMatch = responsePattern.exec(responsesBlock)) !== null) {
                        let respContent = respMatch[1];
                        // Убираем лишние пробелы и переносы строк
                        respContent = respContent.replace(/\s+/g, ' ').trim();
                        
                        const codeMatch = respContent.match(/code\s*=\s*"([^"]+)"/);
                        // Улучшенное извлечение description - поддержка текста в скобках
                        const descMatch = respContent.match(/description\s*=\s*"([^"]*(?:\([^)]*\)[^"]*)*)"/);
                        const schemaMatch = respContent.match(/schema\s*=\s*(\w+)\.class/);
                        const exampleMatch = respContent.match(/example\s*=\s*"([^"]+)"/);
                        
                        // Проверяем флаг isDefaultSchema (по умолчанию true если указан schema)
                        const isDefaultSchemaMatch = respContent.match(/isDefaultSchema\s*=\s*(true|false)/);
                        const isDefaultSchema = isDefaultSchemaMatch 
                            ? isDefaultSchemaMatch[1] === 'true' 
                            : (schemaMatch !== null); // По умолчанию true только если указан schema класс
                        
                        endpoint.responses.push({
                            code: codeMatch ? codeMatch[1] : '',
                            description: descMatch ? descMatch[1] : '',
                            // Schema используется только если isDefaultSchema=false
                            schema: (schemaMatch && !isDefaultSchema) ? schemaMatch[1] : '',
                            example: exampleMatch ? exampleMatch[1] : '',
                            isDefaultSchema: isDefaultSchema,
                            hasSchemaClass: schemaMatch !== null // Флаг указывающий что schema класс был указан
                        });
                    }
                }

                if (endpoint.path) {
                    // Парсим сигнатуру метода для извлечения типа возврата
                    const returnTypeInfo = this.parseMethodSignature(content, i);
                    if (returnTypeInfo) {
                        endpoint.returnType = returnTypeInfo.type;
                        endpoint.returnIsArray = returnTypeInfo.isArray;
                        
                        // Парсим схему для автоматически определенного типа
                        const schema = this.parseDtoSchema(returnTypeInfo.type);
                        if (schema) {
                            endpoint.autoInferredSchema = schema;
                        }
                    }
                    
                    controller.endpoints.push(endpoint);
                }
            }

            i++;
        }

        return controller;
    }

    /**
     * Парсинг сигнатуры метода для извлечения типа возврата
     */
    parseMethodSignature(content, lineIndex) {
        try {
            const lines = content.split('\n');
            // Ищем объявление метода после аннотации (обычно через 1-3 строки)
            for (let i = lineIndex + 1; i < Math.min(lineIndex + 10, lines.length); i++) {
                const line = lines[i].trim();
                
                // Пропускаем пустые строки и аннотации
                if (!line || line.startsWith('@')) continue;
                
                // Ищем сигнатуру метода: public Type methodName(...)
                // Используем более надежный подход для извлечения типа с вложенными generic
                const methodMatch = line.match(/public\s+(?:static\s+)?(?:final\s+)?(\S+)\s+\w+\s*\(/);
                if (methodMatch) {
                    let returnType = methodMatch[1];
                    
                    // Если это ResponseEntity<Type>, извлекаем Type с учетом вложенных <>
                    if (returnType.startsWith('ResponseEntity<')) {
                        // Извлекаем содержимое между внешними < и >
                        let depth = 0;
                        let start = returnType.indexOf('<') + 1;
                        let end = -1;
                        
                        for (let j = start; j < returnType.length; j++) {
                            if (returnType[j] === '<') depth++;
                            else if (returnType[j] === '>') {
                                if (depth === 0) {
                                    end = j;
                                    break;
                                }
                                depth--;
                            }
                        }
                        
                        if (end > start) {
                            returnType = returnType.substring(start, end);
                        }
                    }
                    
                    // Если это List<Type> или Collection<Type>, извлекаем Type и помечаем как массив
                    const listMatch = returnType.match(/^(?:List|Collection|Set)<(.+)>$/);
                    if (listMatch) {
                        return {
                            type: listMatch[1],
                            isArray: true
                        };
                    }
                    
                    // Игнорируем примитивные и базовые типы
                    const ignoredTypes = ['void', 'String', 'Integer', 'Long', 'Boolean', 'Double', 'Float', 'int', 'long', 'boolean', 'double', 'float'];
                    if (ignoredTypes.includes(returnType)) {
                        return null;
                    }
                    
                    return {
                        type: returnType,
                        isArray: false
                    };
                }
            }
        } catch (error) {
            console.error('Error parsing method signature:', error);
        }
        return null;
    }

    /**
     * Построение README
     */
    buildReadme() {
        const lines = [];
        const projectName = this.packageJson.name?.toUpperCase() || 'PROJECT-NEO-AI-QUESTIONS';
        const description = this.packageJson.description || 'Сервис ответов на вопросы на базе ИИ для Project Neo';
        const version = this.packageJson.version || '0.1.0';
        const author = this.packageJson.author || 'Korus Consulting';

        // Заголовок
        lines.push(`# ${projectName} Version: ${version} by ${author}`);
        lines.push('');
        lines.push(`> ${description}`);
        lines.push('');

        // Оглавление
        lines.push('## Содержание');
        lines.push('');
        lines.push('- [Документация модуля](#документация-модуля)');
        lines.push('- [API](#api)');
        lines.push('- [Сборка и развертывание](#сборка-и-развертывание)');
        lines.push('- [Примечания](#примечания)');
        lines.push('');

        lines.push('## Документация модуля');
        lines.push('');
        lines.push('| Раздел | Описание | Документ |');
        lines.push('|--------|----------|----------|');
        lines.push('| Обзор сервиса | Архитектура, основные сценарии и интеграции | [service_overview.md](./__documentation/service_overview.md) |');
        lines.push('| Схема данных | Таблицы и структура хранения procurement-модуля | [db_schema.md](./__documentation/db_schema.md) |');
        lines.push('| Smoke checklist | Ручные проверки после изменений backend/frontend | [manual_smoke_checklist.md](./__documentation/manual_smoke_checklist.md) |');
        lines.push('');

        lines.push('## API');
        lines.push('');
        if (this.controllers.length === 0) {
            lines.push('Сервис собирается как PF4J plugin и публикует свои маршруты через общий OpenAPI backend-приложения после загрузки plugin в backend.');
            lines.push('');
            lines.push('Отдельных `RestController` в этом репозитории не обнаружено, поэтому детальные спецификации API по контроллерам не генерируются.');
            lines.push('');
            lines.push('Основные runtime-контракты для procurement-сценариев описаны в [service_overview.md](./__documentation/service_overview.md).');
            lines.push('');
        } else {
            lines.push('API документация разделена по функциональным группам. Выберите нужную группу для просмотра детальной спецификации.');
            lines.push('');

            const tagGroups = {};
            this.controllers.forEach(controller => {
                const tagName = controller.tagName || controller.category;
                if (!tagGroups[tagName]) {
                    tagGroups[tagName] = {
                        description: controller.tagDescription,
                        controllers: []
                    };
                }
                tagGroups[tagName].controllers.push(controller);
            });

            lines.push('| Группа | Описание | Эндпоинтов | Документация |');
            lines.push('|--------|----------|------------|--------------|');

            Object.keys(tagGroups).sort().forEach(tagName => {
                const group = tagGroups[tagName];
                const endpointCount = group.controllers.reduce((sum, c) => sum + c.endpoints.length, 0);
                const fileName = `api_${this.sanitizeFileName(tagName)}_specification.md`;
                const groupDescription = group.description || 'API endpoints';

                lines.push(`| **${tagName}** | ${groupDescription} | ${endpointCount} | [Документация](./__documentation/${fileName}) |`);
            });

            lines.push('');
            lines.push('### Быстрый обзор эндпоинтов');
            lines.push('');

            Object.keys(tagGroups).sort().forEach(tagName => {
                const group = tagGroups[tagName];
                const fileName = `api_${this.sanitizeFileName(tagName)}_specification.md`;

                lines.push(`### ${tagName}`);
                lines.push('');

                group.controllers.forEach(controller => {
                    controller.endpoints.forEach(endpoint => {
                        const methodBadge = this.getMethodBadge(endpoint.method);
                        const authBadge = endpoint.requireAuth ? '🔒' : '🔓';
                        const fullPath = controller.basePath + endpoint.path;

                        lines.push(`- ${methodBadge} ${authBadge} \`${fullPath}\` - ${endpoint.summary}`);
                    });
                });

                lines.push('');
                lines.push(`[Полная спецификация](./__documentation/${fileName})`);
                lines.push('');
            });
        }

        // Сборка и развертывание
        lines.push('## Сборка и развертывание');
        lines.push('');

        // Установка зависимостей
        lines.push('### Установка зависимостей');
        lines.push('');
        lines.push('Проект использует Maven для Java-зависимостей и npm для вспомогательных скриптов.');
        lines.push('');
        lines.push('```bash');
        lines.push('npm install');
        lines.push('```');
        lines.push('');

        lines.push('### Сборка plugin');
        lines.push('');
        lines.push('Этот сервис собирается как отдельный PF4J plugin и требует опубликованный артефакт `core` из основного backend-проекта.');
        lines.push('');
        lines.push('```bash');
        lines.push('cd ../project-neo-be-release-4');
        lines.push('mvn -pl core -am install -DskipTests');
        lines.push('');
        lines.push('cd ../project-neo-be-procurement');
        lines.push('npm run build:plugin');
        lines.push('```');
        lines.push('');
        lines.push('После сборки plugin-jar появляется в `target/` и затем публикуется в volume основного backend-контейнера `/app/plugins`.');
        lines.push('');

        lines.push('### Полезные команды');
        lines.push('');
        lines.push('```bash');
        lines.push('npm run build');
        lines.push('npm run build:plugin');
        lines.push('npm run docs:readme');
        lines.push('npm run docs:validate-api-docs');
        lines.push('npm run docs:dbschema');
        lines.push('npm run clean');
        lines.push('```');
        lines.push('');
        lines.push('### Runtime-контракт');
        lines.push('');
        lines.push('- сервис не подключается через `project-neo-be-release-4/modules`;');
        lines.push('- jar доставляется во внешний plugins staging каталог backend;');
        lines.push('- backend загружает plugin только из `/app/plugins`;');
        lines.push('- новая версия подхватывается после recreate/restart backend-контейнера.');
        lines.push('');

        // Футер
        lines.push('## Примечания');
        lines.push('');
        lines.push('- Этот README сгенерирован автоматически с помощью `__tools/generate-readme.js`');
        lines.push('- Для обновления документации запустите: `npm run docs:readme`');
        lines.push('');

        return lines.join('\n');
    }

    /**
     * Получить бейдж для HTTP метода
     */
    getMethodBadge(method) {
        const badges = {
            'GET': '`GET`',
            'POST': '`POST`',
            'PUT': '`PUT`',
            'DELETE': '`DELETE`',
            'PATCH': '`PATCH`'
        };
        return badges[method] || '`???`';
    }

    /**
     * Получить эмодзи для статус кода
     */
    getStatusEmoji(code) {
        const statusCode = parseInt(code);
        if (statusCode >= 200 && statusCode < 300) return '✅';
        if (statusCode >= 300 && statusCode < 400) return '↪️';
        if (statusCode >= 400 && statusCode < 500) return '⚠️';
        if (statusCode >= 500) return '❌';
        return '📄';
    }

    /**
     * Получить описание для path параметра
     */
    getParamDescription(paramName) {
        const descriptions = {
            'id': 'Unique identifier (UUID)',
            'username': 'Username of the user',
            'roleName': 'Name of the role',
            'name': 'Name parameter'
        };
        return descriptions[paramName] || 'Path parameter';
    }

    /**
     * Парсинг DTO класса для извлечения схемы
     */
    parseDtoSchema(schemaClassName) {
        // Проверяем кеш
        if (this.dtoSchemas[schemaClassName]) {
            return this.dtoSchemas[schemaClassName];
        }

        // Ищем файл DTO в проекте
        const searchPaths = [
            path.join(this.projectRoot, 'core', 'src', 'main', 'java'),
            path.join(this.projectRoot, 'modules')
        ];

        let dtoFilePath = null;
        for (const searchPath of searchPaths) {
            const foundPath = this.findDtoFile(searchPath, schemaClassName);
            if (foundPath) {
                dtoFilePath = foundPath;
                break;
            }
        }

        if (!dtoFilePath) {
            return null;
        }

        // Читаем и парсим файл
        const content = fs.readFileSync(dtoFilePath, 'utf-8');
        const schema = {
            className: schemaClassName,
            fields: []
        };

        // Парсим объявление класса, чтобы найти родительский класс
        const classMatch = content.match(/public\s+class\s+\w+\s+extends\s+(\w+)/);
        let parentClassName = null;
        if (classMatch) {
            parentClassName = classMatch[1];
        }

        // Если есть родительский класс, загружаем его поля первыми
        if (parentClassName) {
            const parentSchema = this.parseDtoSchema(parentClassName);
            if (parentSchema && parentSchema.fields) {
                schema.fields = [...parentSchema.fields];
            }
        }

        // Парсим все private поля (с аннотациями и без)
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Ищем поля с @Schema аннотацией
            if (line.includes('@Schema(')) {
                // Собираем всю аннотацию @Schema
                let schemaAnnotation = line;
                let bracketCount = (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
                
                while (bracketCount > 0 && i < lines.length - 1) {
                    i++;
                    const nextLine = lines[i].trim();
                    schemaAnnotation += ' ' + nextLine;
                    bracketCount += (nextLine.match(/\(/g) || []).length;
                    bracketCount -= (nextLine.match(/\)/g) || []).length;
                }

                // Ищем следующее поле
                i++;
                while (i < lines.length && !lines[i].trim().startsWith('private')) {
                    i++;
                }

                if (i < lines.length) {
                    const fieldLine = lines[i].trim();
                    const fieldMatch = fieldLine.match(/private\s+(\w+(?:<[^>]+>)?)\s+(\w+);/);
                    
                    if (fieldMatch) {
                        const fieldType = fieldMatch[1];
                        const fieldName = fieldMatch[2];
                        
                        // Извлекаем параметры из @Schema
                        const descMatch = schemaAnnotation.match(/description\s*=\s*"([^"]+)"/);
                        const exampleMatch = schemaAnnotation.match(/example\s*=\s*"([^"]+)"/);
                        const requiredMatch = schemaAnnotation.match(/required\s*=\s*(true|false)|requiredMode\s*=\s*Schema\.RequiredMode\.REQUIRED/);
                        
                        const newField = {
                            name: fieldName,
                            type: fieldType,
                            description: descMatch ? descMatch[1] : '',
                            example: exampleMatch ? exampleMatch[1] : this.getDefaultExample(fieldType),
                            required: requiredMatch ? true : false
                        };

                        // Обновляем поле если оно уже есть (переопределение из родителя), иначе добавляем новое
                        const existingIndex = schema.fields.findIndex(f => f.name === fieldName);
                        if (existingIndex >= 0) {
                            schema.fields[existingIndex] = newField;
                        } else {
                            schema.fields.push(newField);
                        }
                    }
                }
            }
            // Парсим поля без @Schema (для Lombok @Data классов)
            else if (line.startsWith('private ')) {
                // Пропускаем static и final поля
                if (line.includes('static ') || line.includes('final ')) continue;
                
                const fieldMatch = line.match(/private\s+(\w+(?:<[^>]+>)?)\s+(\w+);/);
                if (fieldMatch) {
                    const fieldType = fieldMatch[1];
                    const fieldName = fieldMatch[2];
                    
                    // Проверяем, не был ли этот field уже добавлен через @Schema или из родителя
                    if (!schema.fields.find(f => f.name === fieldName)) {
                        schema.fields.push({
                            name: fieldName,
                            type: fieldType,
                            description: '',
                            example: this.getDefaultExample(fieldType),
                            required: false
                        });
                    }
                }
            }
        }

        // Кешируем результат
        this.dtoSchemas[schemaClassName] = schema;
        return schema;
    }

    /**
     * Рекурсивный поиск DTO файла
     */
    findDtoFile(dir, className) {
        if (!fs.existsSync(dir)) {
            return null;
        }

        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                const found = this.findDtoFile(filePath, className);
                if (found) return found;
            } else if (file === `${className}.java`) {
                return filePath;
            }
        }

        return null;
    }

    /**
     * Получить пример значения по умолчанию для типа
     */
    getDefaultExample(type) {
        const defaults = {
            'String': 'string',
            'Integer': 0,
            'int': 0,
            'Long': 0,
            'long': 0,
            'Boolean': true,
            'boolean': true,
            'Double': 0.0,
            'double': 0.0,
            'UUID': '00000000-0000-0000-0000-000000000000',
            'Instant': '2024-01-01T00:00:00Z',
            'LocalDate': '2024-01-01',
            'LocalDateTime': '2024-01-01T00:00:00',
            'CoreRole': '{...}',
            'List': '[]',
            'Set': '[]',
            'Map': '{}'
        };
        
        // Проверяем на generic типы
        if (type.includes('<')) {
            const baseType = type.substring(0, type.indexOf('<'));
            return defaults[baseType] || '[]';
        }
        
        return defaults[type] || 'value';
    }

    /**
     * Сгенерировать JSON пример из схемы
     */
    generateJsonExample(schema) {
        if (!schema || !schema.fields || schema.fields.length === 0) {
            return null;
        }

        const example = {};
        schema.fields.forEach(field => {
            example[field.name] = field.example;
        });

        return JSON.stringify(example, null, 2);
    }

    /**
     * Сгенерировать таблицу полей схемы
     */
    generateSchemaTable(schema) {
        if (!schema || !schema.fields || schema.fields.length === 0) {
            return null;
        }

        const lines = [];
        lines.push('| Field | Type | Required | Description | Example |');
        lines.push('|-------|------|----------|-------------|---------|');
        
        schema.fields.forEach(field => {
            const required = field.required ? '✅ Yes' : '❌ No';
            lines.push(`| \`${field.name}\` | \`${field.type}\` | ${required} | ${field.description} | \`${field.example}\` |`);
        });

        return lines.join('\n');
    }

    /**
     * Конвертация текста в якорь (anchor)
     */
    toAnchor(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
    }

    /**
     * Рекурсивный поиск директорий с исходниками Java (src/main/java)
     */
    findJavaSourceDirs(dir) {
        const results = [];
        if (!fs.existsSync(dir)) return results;

        // Если текущая директория содержит src/main/java — добавляем
        const javaPath = path.join(dir, 'src', 'main', 'java');
        if (fs.existsSync(javaPath)) {
            results.push(javaPath);
        }

        // Рекурсивный обход подпапок
        const entries = fs.readdirSync(dir);
        entries.forEach(entry => {
            const full = path.join(dir, entry);
            const stat = fs.statSync(full);
            if (stat.isDirectory()) {
                // Пропускаем стандартные директории src/main/java, чтобы не углубляться лишний раз
                if (entry === 'src') return;
                results.push(...this.findJavaSourceDirs(full));
            }
        });

        return results;
    }

    /**
     * Получить описание для скрипта
     */
    getScriptDescription(scriptKey) {
        const descriptions = {
            'build:core': 'Сборка core модуля',
            'build:api': 'Сборка webapi',
            'build:modules': 'Сборка всех модулей (плагинов)',
            'build:ai-service': 'Сборка AI Service модуля',
            'build:example-ai-service': 'Сборка Example AI Service модуля'
        };
        return descriptions[scriptKey] || `Выполнение ${scriptKey}`;
    }

    /**
     * Сохранение README
     */
    saveReadme(content) {
        const readmePath = path.join(this.projectRoot, 'README.md');
        fs.writeFileSync(readmePath, content, 'utf-8');
        console.log(`\n💾 README.md сохранен: ${readmePath}`);
    }

    /**
     * Генерация отдельных файлов API спецификаций по тегам
     */
    generateApiSpecifications() {
        console.log('\n📄 Генерация API спецификаций по тегам...\n');

        if (this.controllers.length === 0) {
            console.log('ℹ️ Контроллеры не найдены, генерация __documentation пропущена.');
            return;
        }

        // Создаем папку __documentation если её нет
        const docPath = path.join(this.projectRoot, '__documentation');
        if (!fs.existsSync(docPath)) {
            fs.mkdirSync(docPath, { recursive: true });
        }

        // Группируем по tagName
        const tagGroups = {};
        this.controllers.forEach(controller => {
            const tagName = controller.tagName || controller.category;
            if (!tagGroups[tagName]) {
                tagGroups[tagName] = {
                    description: controller.tagDescription,
                    controllers: []
                };
            }
            tagGroups[tagName].controllers.push(controller);
        });

        // Генерируем файл для каждого тега
        const generatedFiles = [];
        Object.keys(tagGroups).sort().forEach(tagName => {
            const group = tagGroups[tagName];
            const fileName = `api_${this.sanitizeFileName(tagName)}_specification.md`;
            const filePath = path.join(docPath, fileName);
            
            const content = this.buildApiSpecificationForTag(tagName, group);
            fs.writeFileSync(filePath, content, 'utf-8');
            
            generatedFiles.push({
                fileName: fileName,
                tagName: tagName,
                description: group.description || 'API endpoints',
                endpointCount: group.controllers.reduce((sum, c) => sum + c.endpoints.length, 0)
            });
            
            console.log(`  ✅ ${fileName}`);
        });

        // Генерируем индексный файл
        this.generateDocumentationIndex(docPath, generatedFiles);

        console.log('\n✅ Все API спецификации сгенерированы!');
    }

    /**
     * Генерация индексного файла для папки __documentation
     */
    generateDocumentationIndex(docPath, generatedFiles) {
        const lines = [];
        const today = new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });

        lines.push('# 📚 API Documentation');
        lines.push('');
        lines.push('This folder contains detailed API specifications for PROJECT-NEO platform, organized by functional groups.');
        lines.push('');
        lines.push('## 📑 Available Specifications');
        lines.push('');

        generatedFiles.forEach(file => {
            lines.push(`### [${file.tagName} API](./${file.fileName})`);
            lines.push(`**${file.description}**`);
            lines.push(`- ${file.endpointCount} endpoint${file.endpointCount > 1 ? 's' : ''}`);
            lines.push('');
        });

        lines.push('---');
        lines.push('');
        lines.push('## 🔄 How to Update');
        lines.push('');
        lines.push('This documentation is automatically generated from code annotations. To update:');
        lines.push('');
        lines.push('```bash');
        lines.push('node __tools/generate-readme.js');
        lines.push('```');
        lines.push('');
        lines.push('The generator will:');
        lines.push('1. Scan all controllers for `@ApiPost`, `@ApiGet`, `@ApiPut`, `@ApiPatch`, `@ApiDelete` annotations');
        lines.push('2. Extract `@Tag`, `@ApiOperation`, `@RequestBody`, and `@Response` metadata');
        lines.push('3. Parse DTO classes to generate field tables and JSON examples');
        lines.push('4. Generate separate specification files for each tag group');
        lines.push('5. Update the main README.md with links to specifications');
        lines.push('');
        lines.push('---');
        lines.push('');
        lines.push('## 📖 Documentation Format');
        lines.push('');
        lines.push('Each API specification file includes:');
        lines.push('');
        lines.push('- **Table of Contents** - Quick navigation to all endpoints');
        lines.push('- **Endpoint Details** - HTTP method, path, summary, and description');
        lines.push('- **Authentication** - 🔒 Required or 🔓 Public');
        lines.push('- **Request Body** - Schema, fields table, and JSON examples');
        lines.push('- **Path Parameters** - Description of URL parameters');
        lines.push('- **Responses** - All status codes with schemas and examples');
        lines.push('');
        lines.push('---');
        lines.push('');
        lines.push('## 🌐 Interactive Documentation');
        lines.push('');
        lines.push('For interactive API testing, use Swagger UI:');
        lines.push('');
        lines.push('```');
        lines.push('http://localhost:5000/swagger-ui/index.html');
        lines.push('```');
        lines.push('');
        lines.push('Swagger UI provides:');
        lines.push('- Live API testing');
        lines.push('- Request/response examples');
        lines.push('- Schema validation');
        lines.push('- Authentication testing');
        lines.push('');
        lines.push('---');
        lines.push('');
        lines.push(`*Last updated: ${today}*`);

        const indexPath = path.join(docPath, 'README.md');
        fs.writeFileSync(indexPath, lines.join('\n'), 'utf-8');
        console.log('  ✅ README.md (documentation index)');
    }

    /**
     * Санитизация имени файла
     */
    sanitizeFileName(name) {
        return name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '_')
            .replace(/:_/g, '_');
    }

    /**
     * Построение API спецификации для одного тега
     */
    buildApiSpecificationForTag(tagName, group) {
        const lines = [];

        // Заголовок
        lines.push(`# ${tagName} API`);
        if (group.description) {
            lines.push(`> ${group.description}`);
        }
        lines.push('');
        lines.push('---');
        lines.push('');

        // Оглавление
        lines.push('## 📑 Содержание');
        lines.push('');
        
        group.controllers.forEach(controller => {
            controller.endpoints.forEach(endpoint => {
                const anchor = this.toAnchor(`${endpoint.method} ${controller.basePath}${endpoint.path}`);
                lines.push(`- [\`${endpoint.method}\` ${controller.basePath}${endpoint.path}](#${anchor}) - ${endpoint.summary}`);
            });
        });
        lines.push('');
        lines.push('---');
        lines.push('');

        // Эндпоинты
        group.controllers.forEach(controller => {
            if (group.controllers.length > 1) {
                lines.push(`## ${controller.name}`);
                lines.push('');
            }

            if (controller.basePath) {
                lines.push(`**Base Path:** \`${controller.basePath}\``);
                lines.push('');
            }

            controller.endpoints.forEach(endpoint => {
                // HTTP метод и путь
                const methodBadge = this.getMethodBadge(endpoint.method);
                const authBadge = endpoint.requireAuth ? '🔒' : '🔓';
                const fullPath = controller.basePath + endpoint.path;
                
                lines.push(`## ${methodBadge} ${authBadge} \`${fullPath}\``);
                lines.push('');

                // Summary
                if (endpoint.summary) {
                    lines.push(`**${endpoint.summary}**`);
                    lines.push('');
                }

                // Description
                if (endpoint.description) {
                    lines.push(endpoint.description);
                    lines.push('');
                }

                // Auth info
                if (endpoint.requireAuth) {
                    lines.push('> 🔒 **Требуется аутентификация** - передайте Bearer token в заголовке `Authorization`');
                } else {
                    lines.push('> 🔓 **Публичный эндпоинт** - не требует аутентификации');
                }
                lines.push('');

                // Request Body
                if (endpoint.requestBody && endpoint.requestBody.schema) {
                    lines.push('### 📤 Request Body');
                    lines.push('');
                    if (endpoint.requestBody.description) {
                        lines.push(`**${endpoint.requestBody.description}**`);
                        lines.push('');
                    }
                    lines.push(`- **Schema:** \`${endpoint.requestBody.schema}\``);
                    lines.push(`- **Required:** ${endpoint.requestBody.required ? '✅ Yes' : '❌ No'}`);
                    lines.push('');
                    
                    // Парсим DTO и генерируем таблицу полей
                    const dtoSchema = this.parseDtoSchema(endpoint.requestBody.schema);
                    if (dtoSchema) {
                        const schemaTable = this.generateSchemaTable(dtoSchema);
                        if (schemaTable) {
                            lines.push('**Fields:**');
                            lines.push('');
                            lines.push(schemaTable);
                            lines.push('');
                        }

                        // Генерируем JSON пример
                        const jsonExample = this.generateJsonExample(dtoSchema);
                        if (jsonExample) {
                            lines.push('**Example:**');
                            lines.push('```json');
                            lines.push(jsonExample);
                            lines.push('```');
                            lines.push('');
                        }
                    } else if (endpoint.requestBody.example) {
                        lines.push('**Example:**');
                        lines.push('```json');
                        lines.push(endpoint.requestBody.example);
                        lines.push('```');
                        lines.push('');
                    }
                }

                // Path Parameters
                const pathParams = endpoint.path.match(/\{([^}]+)\}/g);
                if (pathParams && pathParams.length > 0) {
                    lines.push('### 📝 Path Parameters');
                    lines.push('');
                    pathParams.forEach(param => {
                        const paramName = param.replace(/[{}]/g, '');
                        lines.push(`- **\`${paramName}\`** - ${this.getParamDescription(paramName)}`);
                    });
                    lines.push('');
                }

                // Responses
                if (endpoint.responses && endpoint.responses.length > 0) {
                    lines.push('### 📥 Responses');
                    lines.push('');
                    
                    endpoint.responses.forEach(response => {
                        const statusEmoji = this.getStatusEmoji(response.code);
                        lines.push(`#### ${statusEmoji} ${response.code} - ${response.description}`);
                        lines.push('');
                        
                        // Выводим детальную схему только в двух случаях:
                        // 1. isDefaultSchema=true И hasSchemaClass=true (явно указан schema класс)
                        // 2. isDefaultSchema=false И явно задан класс schema
                        
                        if (response.isDefaultSchema && response.hasSchemaClass && endpoint.autoInferredSchema) {
                            // Случай 1: Автоматически определенная схема из сигнатуры метода
                            // Используем схему из аннотации если она есть, иначе из метода
                            const typeName = endpoint.returnIsArray ? `Array<${endpoint.returnType}>` : endpoint.returnType;
                            lines.push(`**Schema:** \`${typeName}\` *(определено автоматически)*`);
                            lines.push('');
                            
                            const schemaTable = this.generateSchemaTable(endpoint.autoInferredSchema);
                            if (schemaTable) {
                                lines.push('<details>');
                                lines.push('<summary>View Response Fields</summary>');
                                lines.push('');
                                lines.push(schemaTable);
                                lines.push('');
                                lines.push('</details>');
                                lines.push('');
                            }
                        } else if (!response.isDefaultSchema && response.schema) {
                            // Случай 2: Явно указанная schema (isDefaultSchema=false)
                            lines.push(`**Schema:** \`${response.schema}\``);
                            lines.push('');
                            
                            // Парсим DTO схему для response
                            const responseSchema = this.parseDtoSchema(response.schema);
                            if (responseSchema) {
                                const schemaTable = this.generateSchemaTable(responseSchema);
                                if (schemaTable) {
                                    lines.push('<details>');
                                    lines.push('<summary>View Response Fields</summary>');
                                    lines.push('');
                                    lines.push(schemaTable);
                                    lines.push('');
                                    lines.push('</details>');
                                    lines.push('');
                                }
                            }
                        }
                        // В остальных случаях (нет schema класса) ничего не выводим
                        
                        if (response.example) {
                            lines.push('**Example:**');
                            lines.push('```json');
                            lines.push(response.example);
                            lines.push('```');
                            lines.push('');
                        }
                    });
                }

                lines.push('---');
                lines.push('');
            });
        });

        return lines.join('\n');
    }
}

// Запуск генератора
const generator = new ReadmeGenerator();
generator.generate();
