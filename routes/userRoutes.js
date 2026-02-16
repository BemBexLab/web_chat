import express from 'express';
import {
  userLogin,
  userLogout,
  getUserProfile,
  updateUserProfile,
  changePassword,
} from '../controllers/userController.js';
import { authenticate, userAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.post('/login', userLogin);

// Protected routes (User only)
router.post('/logout', authenticate, userAuth, userLogout);
router.get('/profile', authenticate, userAuth, getUserProfile);
router.put('/profile', authenticate, userAuth, updateUserProfile);
router.patch('/password', authenticate, userAuth, changePassword);

export default router;
