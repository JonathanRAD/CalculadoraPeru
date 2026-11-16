import fs from 'fs';
import os from 'os';
import path from 'path';

// Cada archivo de pruebas usa su propia carpeta de datos temporal.
process.env.CALCULAPERU_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'calculaperu-test-'));
