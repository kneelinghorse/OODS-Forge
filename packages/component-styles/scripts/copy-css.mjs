import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
fs.mkdirSync(path.join(packageRoot, 'dist'), { recursive: true });
fs.copyFileSync(path.join(packageRoot, 'src/components.css'), path.join(packageRoot, 'dist/components.css'));
