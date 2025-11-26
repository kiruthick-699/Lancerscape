/**
 * backend/src/middleware/upload.ts
 * 
 * Multer configuration for secure evidence file uploads
 */

import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';
import crypto from 'crypto';

// Allowed MIME types for evidence files
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf', '.zip'];

// Rejected extensions (executables and scripts)
const REJECTED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.js', '.mjs', '.cjs',
  '.py', '.rb', '.php', '.asp', '.aspx', '.jsp',
  '.dll', '.so', '.dylib', '.app', '.deb', '.rpm',
];

// Storage configuration
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    // Use absolute path to prevent path traversal
    const uploadDir = path.resolve(__dirname, '../../uploads');
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    // Generate secure random filename to prevent collisions and path traversal
    const randomName = crypto.randomBytes(16).toString('hex');
    // Sanitize original extension
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Validate extension is in allowed list
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error('Invalid file extension'), '');
    }
    
    cb(null, `${randomName}${ext}`);
  },
});

// File filter for security
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Reject executable files
  if (REJECTED_EXTENSIONS.includes(ext)) {
    return cb(new Error('Executable files are not allowed'));
  }
  
  // Check file extension
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error('Invalid file type. Only images (jpg/png), PDF, and ZIP are allowed'));
  }
  
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Invalid MIME type. Only images, PDF, and ZIP are allowed'));
  }
  
  cb(null, true);
};

// Configure multer instance
export const uploadEvidence = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5, // Max 5 files per request
  },
});
