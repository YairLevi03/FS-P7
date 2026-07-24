import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import pool from '../config/db.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file_path = `/uploads/${req.file.filename}`;
    
    // Save to DB
    const [result] = await pool.query(
      'INSERT INTO uploads (user_id, file_path, file_type, related_entity) VALUES (?, ?, ?, ?)',
      [req.user.id, file_path, req.file.mimetype, req.body.related_entity || null]
    );

    res.status(201).json({ message: 'File uploaded successfully', url: file_path, id: result.insertId });
  } catch (error) {
    next(error);
  }
});

export default router;
