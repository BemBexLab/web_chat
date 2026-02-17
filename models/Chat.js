import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'senderModel', // Can be 'Admin' or 'User'
    },
    senderModel: {
      type: String,
      enum: ['Admin', 'User'],
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'receiverModel',
    },
    receiverModel: {
      type: String,
      enum: ['Admin', 'User'],
      required: true,
    },
    receiverName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    conversationId: {
      type: String,
      required: true,
      index: true, // For faster queries
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      default: null,
    },
    fileType: {
      type: String,
      default: null,
    },
    voiceUrl: {
      type: String,
      default: null,
    },
    voiceDuration: {
      type: Number,
      default: null,
    },
    messageType: {
      type: String,
      enum: ['text', 'file', 'voice'],
      default: 'text',
    },
  },
  { timestamps: true }
);

// Index for faster queries
chatSchema.index({ conversationId: 1, createdAt: -1 });
chatSchema.index({ senderId: 1, receiverId: 1 });
chatSchema.index({ receiverId: 1, isRead: 1 });
chatSchema.index({ conversationId: 1, receiverId: 1, isRead: 1 });

export default mongoose.model('Chat', chatSchema);
