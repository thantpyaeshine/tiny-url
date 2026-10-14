import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const outputDirectory = path.join('dist', 'src', 'lib');

await mkdir(outputDirectory, { recursive: true });
await copyFile(
    path.join('src', 'lib', 'index.html'),
    path.join(outputDirectory, 'index.html'),
);