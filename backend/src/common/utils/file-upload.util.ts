import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export function ensureUploadDir(uploadPath: string) {
  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
  }
}

export function imageFileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
    return callback(
      new BadRequestException('Solo se permiten imágenes (jpg, png, gif, webp)'),
      false,
    );
  }
  callback(null, true);
}

export function createImageStorage(uploadPath: string, prefix: string) {
  ensureUploadDir(uploadPath);
  return diskStorage({
    destination: uploadPath,
    filename: (_req, file, callback) => {
      const unique = `${prefix}-${Date.now()}${extname(file.originalname)}`;
      callback(null, unique);
    },
  });
}

export function buildFileUrl(filename: string) {
  return `/uploads/${filename}`;
}

export function getUploadPath() {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return '/tmp/uploads';
  }
  return process.env.UPLOAD_PATH || join(process.cwd(), 'uploads');
}