const express = require('express');
const {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getSubjects);
router.post('/', protect, authorizeRoles('admin'), createSubject);
router.put('/:id', protect, authorizeRoles('admin'), updateSubject);
router.delete('/:id', protect, authorizeRoles('admin'), deleteSubject);

module.exports = router;
