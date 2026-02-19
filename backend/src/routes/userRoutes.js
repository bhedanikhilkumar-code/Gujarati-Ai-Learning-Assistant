const express = require('express');
const { getUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, authorizeRoles('admin'), getUsers);
router.patch('/:id/role', protect, authorizeRoles('admin'), updateUserRole);
router.delete('/:id', protect, authorizeRoles('admin'), deleteUser);

module.exports = router;
