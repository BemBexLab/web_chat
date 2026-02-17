import mongoose from 'mongoose';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { getIO } from '../socket.js';

// Generate conversation ID (consistent ordering)
const generateConversationId = (id1, id2) => {
  const ids = [id1.toString(), id2.toString()].sort();
  return `${ids[0]}-${ids[1]}`;
};

// Send Message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, voiceDuration } = req.body;
    const senderId = req.user.id;
    const senderType = req.user.type; // 'admin' or 'user'

    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver ID is required' });
    }

    // If sender is a suspended user, block sending
    if (senderType === 'user') {
      const senderUser = await User.findById(senderId).select('suspended');
      if (senderUser && senderUser.suspended) {
        return res.status(403).json({ message: 'Your account is suspended and cannot send messages' });
      }
    }

    // Check if this is a file, voice, or text message
    let messageType = 'text';
    let fileUrl = null;
    let fileName = null;
    let fileSize = null;
    let fileType = null;
    let voiceUrl = null;
    let voiceDurationVal = null;
    let messageText = message || '';

    if (req.file) {
      // File upload
      messageType = 'file';
      fileUrl = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = req.file.size;
      fileType = req.file.mimetype;
    } else if (req.body.voiceBlob && req.file) {
      // Voice note (handled as file)
      messageType = 'voice';
      voiceUrl = `/uploads/${req.file.filename}`;
      voiceDurationVal = voiceDuration ? parseInt(voiceDuration) : 0;
    } else if (!message) {
      return res.status(400).json({ message: 'Message, file, or voice is required' });
    }

    // Get sender info
    const senderModel = senderType === 'admin' ? Admin : User;
    const sender = await senderModel.findById(senderId);

    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Get receiver info - try User first, then Admin (don't assume by sender type)
    let receiver = await User.findById(receiverId);
    let receiverIsAdmin = false;
    if (!receiver) {
      receiver = await Admin.findById(receiverId);
      receiverIsAdmin = !!receiver;
    }

    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Generate conversation ID
    const conversationId = generateConversationId(senderId, receiverId);

    // Create message
    const chat = new Chat({
      senderId,
      senderModel: senderType === 'admin' ? 'Admin' : 'User',
      senderName: senderType === 'admin' ? sender.email : sender.username,
      receiverId,
      receiverModel: receiverIsAdmin ? 'Admin' : 'User',
      receiverName: receiverIsAdmin ? receiver.email : receiver.username,
      message: messageText,
      conversationId,
      messageType,
      fileUrl,
      fileName,
      fileSize,
      fileType,
      voiceUrl,
      voiceDuration: voiceDurationVal,
    });

    await chat.save();

    // Emit the new message to the conversation room (if socket server available)
    try {
      const io = getIO();
      if (io) {
        console.log('Emitting new_message to conversation room and receiver sockets:', conversationId, 'receiver:', receiverId.toString());
        io.to(conversationId).emit('new_message', chat);
        // Also emit directly to receiver sockets so users not joined to the room get notified
        try {
          const userSockets = global.userSockets && global.userSockets.get(receiverId.toString());
          if (userSockets && userSockets.size > 0) {
            userSockets.forEach((socketId) => {
              io.to(socketId).emit('new_message', chat);
            });
          }
        } catch (innerErr) {
          console.error('Error emitting to receiver sockets:', innerErr.message);
        }
      }
    } catch (err) {
      console.error('Error emitting socket event:', err.message);
    }

    res.status(201).json({
      message: 'Message sent successfully',
      chat: {
        id: chat._id,
        senderId: chat.senderId,
        senderName: chat.senderName,
        message: chat.message,
        messageType: chat.messageType,
        fileUrl: chat.fileUrl,
        fileName: chat.fileName,
        fileSize: chat.fileSize,
        voiceUrl: chat.voiceUrl,
        voiceDuration: chat.voiceDuration,
        timestamp: chat.createdAt,
        conversationId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Conversation (messages with one person/admin)
export const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const userType = req.user.type;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip = (page - 1) * limit;

    // If requester is a suspended user, block access to conversation
    if (userType === 'user' && req.user.isSuspended) {
      return res.status(403).json({ message: 'Your account is suspended and cannot view messages' });
    }
    
    // Verify user is part of this conversation
    const conversationParts = conversationId.split('-');
    const isPartOfConversation =
      conversationParts.includes(userId.toString()) ||
      conversationParts.includes(userId) ||
      conversationId.includes(userId.toString());

    if (!isPartOfConversation) {
      return res.status(403).json({ message: 'You do not have access to this conversation' });
    }

    // Get paginated messages
    const [messages, total] = await Promise.all([
      Chat.find({ conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean(),
      Chat.countDocuments({ conversationId })
    ]);

    // Mark messages as read (non-blocking)
    Chat.updateMany(
      { conversationId, receiverId: userId, isRead: false },
      { isRead: true }
    ).catch(err => console.error('Mark as read error:', err));

    res.status(200).json({
      message: 'Conversation retrieved successfully',
      conversationId,
      messages: messages.reverse(),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Conversations (list of users to chat with)
export const getConversations = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    // Block suspended users from listing conversations
    if (req.user.type === 'user' && req.user.isSuspended) {
      return res.status(403).json({ message: 'Your account is suspended and cannot view conversations' });
    }

    const conversations = await Chat.aggregate([
      {
        $match: {
          $or: [
            { senderId: userId },
            { receiverId: userId }
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$message' },
          lastMessageTime: { $first: '$createdAt' },
          otherUserId: {
            $first: {
              $cond: [
                { $eq: ['$senderId', userId] },
                '$receiverId',
                '$senderId'
              ],
            },
          },
          otherUserName: {
            $first: {
              $cond: [
                { $eq: ['$senderId', userId] },
                '$receiverName',
                '$senderName',
              ],
            },
          },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', userId] },
                    { $eq: ['$isRead', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    res.status(200).json({
      message: 'Conversations retrieved successfully',
      total: conversations.length,
      conversations,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Get All Users (for admin to chat with)
export const getAllUsersForChat = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({ isActive: true })
        .select('_id username email createdAt suspended')
        .sort({ username: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ isActive: true })
    ]);

    const usersWithConversations = users.map((user) => {
      const conversationId = generateConversationId(req.user.id, user._id);
      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        conversationId,
      };
    });

    res.status(200).json({
      message: 'Users retrieved successfully',
      total,
      users: usersWithConversations,
      pagination: { page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Admin (for users to chat with)
export const getAdminForChat = async (req, res) => {
  try {
    const admin = await Admin.findOne().select('_id email');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const conversationId = generateConversationId(req.user.id, admin._id);

    res.status(200).json({
      message: 'Admin retrieved successfully',
      admin: {
        _id: admin._id,
        email: admin.email,
        conversationId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark Messages as Read
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    // Prevent suspended users from marking messages as read
    if (req.user.type === 'user' && req.user.isSuspended) {
      return res.status(403).json({ message: 'Your account is suspended and cannot perform this action' });
    }

    const result = await Chat.updateMany(
      { conversationId, receiverId: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(messageId);

    if (!chat) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete their message
    if (chat.senderId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own messages' });
    }

    await Chat.findByIdAndDelete(messageId);

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Unread Count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Chat.countDocuments({
      receiverId: userId,
      isRead: false,
    });

    res.status(200).json({
      message: 'Unread count retrieved',
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Member Conversation (admin only - view conversation between any two users)
export const getMemberConversation = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    // Verify both users exist
    const user1 = await User.findById(userId1);
    const user2 = await User.findById(userId2);

    if (!user1 || !user2) {
      return res.status(404).json({ message: 'One or both users not found' });
    }

    // Generate conversation ID
    const conversationId = generateConversationId(userId1, userId2);

    // Get all messages in conversation
    const messages = await Chat.find({ conversationId })
      .sort({ createdAt: 1 })
      .select('-__v');

    res.status(200).json({
      message: 'Member conversation retrieved successfully',
      conversationId,
      user1: { _id: user1._id, username: user1.username, email: user1.email },
      user2: { _id: user2._id, username: user2.username, email: user2.email },
      messages,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
