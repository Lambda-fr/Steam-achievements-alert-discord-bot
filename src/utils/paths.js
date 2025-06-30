import { resolve } from 'path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ASSETS_PATH = resolve(__dirname, '..', '..', 'assets');

export default {
    ASSETS_PATH
};