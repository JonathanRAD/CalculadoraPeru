import path from 'path';

/**
 * Carpeta donde los repositorios locales guardan sus archivos JSON.
 * Se puede cambiar con CALCULAPERU_DATA_DIR; las pruebas usan una carpeta temporal por archivo
 * para no pisarse entre sí ni modificar los datos del servidor de desarrollo.
 */
export function getDataDir(): string {
  return process.env.CALCULAPERU_DATA_DIR || path.join(process.cwd(), '.data');
}
