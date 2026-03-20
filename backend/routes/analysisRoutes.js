import express from 'express';
import multer from 'multer';
import { uploadResume, analyzeResume, getRoles } from '../controllers/analysisController.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// GET /api/roles - Get all available job roles
router.get('/roles', getRoles);

// POST /api/upload-resume - Upload and extract text from PDF
router.post('/upload-resume', upload.single('resume'), uploadResume);

// POST /api/analyze - Analyze resume against role
router.post('/analyze', analyzeResume);

export default router;
