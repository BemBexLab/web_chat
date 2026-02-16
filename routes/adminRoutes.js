import express from 'express';
import {
  adminLogin,
  adminLogout,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserPassword,
} from '../controllers/adminController.js';
import { authenticate, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.post('/login', adminLogin);

// Protected routes (Admin only)
router.post('/logout', authenticate, adminOnly, adminLogout);

// User CRUD operations (Admin only)
router.post('/users', authenticate, adminOnly, createUser);
router.get('/users', authenticate, adminOnly, getAllUsers);
router.get('/users/:id', authenticate, adminOnly, getUserById);
router.put('/users/:id', authenticate, adminOnly, updateUser);
router.delete('/users/:id', authenticate, adminOnly, deleteUser);
router.patch('/users/:id/password', authenticate, adminOnly, updateUserPassword);

export default router;
