const express = require('express');
const {
  uploadNote,
  getNotes,
  getMyUploads,
  getNoteById,
  reviewNote,
  downloadNote,
  deleteNote
} = require('../controllers/noteController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', protect, getNotes);
router.get('/my-uploads', protect, getMyUploads);
router.get('/:id', protect, getNoteById);
router.post('/', protect, upload.single('pdf'), uploadNote);
router.patch('/:id/review', protect, authorizeRoles('admin'), reviewNote);
router.get('/:id/download', protect, downloadNote);
router.delete('/:id', protect, deleteNote);

module.exports = router;
