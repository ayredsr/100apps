import fs from 'fs-extra';
import path from 'path';
import { generateAppData } from './generator.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const CORE_BASE_DIR = path.join(ROOT_DIR, 'flutter_templates', 'core_base');
const GENERATED_APPS_DIR = path.join(ROOT_DIR, 'flutter_templates', 'generated_apps');

async function parsePlanningMD() {
    const planningPath = path.join(ROOT_DIR, 'PLANNING.md');
    const content = await fs.readFile(planningPath, 'utf8');

    const lines = content.split('\n');
    const apps = [];
    let currentCategory = '';

    for (let line of lines) {
        // Match category headers like "### 1. Eğitim ve Öğrenim (Education & Learning)"
        const categoryMatch = line.match(/^###\s+\d+\.\s+(.*?)\s+\((.*?)\)$/);
        if (categoryMatch) {
            currentCategory = categoryMatch[2]; // Use the English part inside parentheses
            continue;
        }

        // Match app list items like "1. Dil Öğrenme Günlüğü: Yeni kelime öğrenimi..."
        const appMatch = line.match(/^\d+\.\s+(.*?):/);
        if (appMatch && currentCategory) {
            apps.push({
                name: appMatch[1].trim(),
                category: currentCategory
            });
        }
    }

    return apps;
}

async function buildApp(appInfo, index) {
    const appId = `app_${index.toString().padStart(3, '0')}`;
    const appDir = path.join(GENERATED_APPS_DIR, appId);

    console.log(`\n[${appId}] Building: ${appInfo.name} (${appInfo.category})`);

    // 1. Generate Config Data
    console.log(`  -> Generating AI configuration...`);
    const configData = await generateAppData(appInfo.name, appInfo.category);

    // 2. Copy Template
    console.log(`  -> Copying core_base template...`);
    await fs.copy(CORE_BASE_DIR, appDir, {
        filter: (src) => {
            const relative = path.relative(CORE_BASE_DIR, src);
            // Ignore build artifacts and dev folders during copy
            if (relative.startsWith('build') || relative.startsWith('.dart_tool') || relative.startsWith('.git')) {
                return false;
            }
            return true;
        }
    });

    // 3. Inject Config
    console.log(`  -> Injecting assets/config.json...`);
    const assetsDir = path.join(appDir, 'assets');
    await fs.ensureDir(assetsDir);
    await fs.writeJson(path.join(assetsDir, 'config.json'), configData, { spaces: 2 });

    console.log(`[${appId}] Successfully built!`);
}

async function main() {
    console.log("Starting App Generation Automation...");
    await fs.ensureDir(GENERATED_APPS_DIR);

    const appsToGenerate = await parsePlanningMD();
    console.log(`Found ${appsToGenerate.length} apps to generate.`);

    for (let i = 0; i < appsToGenerate.length; i++) {
        await buildApp(appsToGenerate[i], i + 1);
    }

    console.log("\nAutomation Complete!");
}

main().catch(console.error);
