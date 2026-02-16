import express from 'express';
import {
  sendMessage,
  getConversation,
  getConversations,
  getAllUsersForChat,
  getAdminForChat,
  markAsRead,
  deleteMessage,
  getUnreadCount,
  getMemberConversation,
} from '../controllers/chatController.js';
import { authenticate, adminOnly } from '../middleware/authMiddleware.js';
import { uploadSingleFile } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Send Message (with optional file upload)
router.post('/send', uploadSingleFile, sendMessage);

// Get all conversations for current user
router.get('/conversations', getConversations);

// Get messages in a specific conversation
router.get('/conversations/:conversationId', getConversation);

// Mark messages as read
router.patch('/conversations/:conversationId/read', markAsRead);

// Delete a specific message
router.delete('/messages/:messageId', deleteMessage);

// Get unread message count
router.get('/unread-count', getUnreadCount);

// Public: Get all active users (for users to start chats)
router.get('/users', getAllUsersForChat);

// Admin only: Get all active users for chat
router.get('/admin/users', adminOnly, getAllUsersForChat);

// User only: Get admin info
router.get('/admin', getAdminForChat);

// Admin only: View conversation between any two members
router.get('/admin/members/:userId1/:userId2', adminOnly, getMemberConversation);

export default router;
