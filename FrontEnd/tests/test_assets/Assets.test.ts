import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Ruta a tu carpeta de assets (ajusta según tu estructura de proyecto)
const assetsPath = path.join(__dirname, '../../src/assets');

describe('Assets Folder', () => {
  it('should contain flower_dark.png', () => {
    const filePath = path.join(assetsPath, 'flower_dark.png');
    expect(fs.existsSync(filePath)).toBeTruthy();
  });

  it('should contain flower_light.png', () => {
    const filePath = path.join(assetsPath, 'flower_light.png');
    expect(fs.existsSync(filePath)).toBeTruthy();
  });
});