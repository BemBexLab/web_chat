import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './utils/database.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import Admin from './models/Admin.js';
import { createServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { setIO } from './socket.js';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
dotenv.config();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();

// Middleware - optimize for Vercel
app.use(cors({
  origin: true, // accept any origin
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve uploads directory as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to database
await connectDB();

// Initialize admin (create default admin if not exists)
const initializeAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (!adminExists) {
      const admin = new Admin({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      });
      
      await admin.save();
      console.log('Default admin created successfully');
      console.log(`Email: ${process.env.ADMIN_EMAIL}`);
      console.log(`Password: ${process.env.ADMIN_PASSWORD}`);
    } else {
      console.log('Admin already exists');
    }
  } catch (error) {
    console.error('Error initializing admin:', error.message);
  }
};

await initializeAdmin();

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

// Start server (attach Socket.IO)
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new IOServer(httpServer, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'], // Use both for better compatibility
  serveClient: false,
  pingInterval: 25000,
  pingTimeout: 60000,
  upgradeTimeout: 10000,
  maxHttpBufferSize: 1e6, // 1MB limit
});

// expose io to controllers
setIO(io);

io.on('connection', (socket) => {
  // Track which user (id) is associated with each socket and maintain online sets
  socket.on('identify', ({ id, type }) => {
    try {
      socket.data.userId = id;
      socket.data.userType = type;

      // add socket id to user's set
      if (!global.userSockets) global.userSockets = new Map();
      const set = global.userSockets.get(id) || new Set();
      set.add(socket.id);
      global.userSockets.set(id, set);

      // mark online and broadcast presence
      if (!global.onlineUsers) global.onlineUsers = new Set();
      const wasOnline = global.onlineUsers.has(id);
      global.onlineUsers.add(id);

      // send current presence list to this socket
      socket.emit('presence_list', Array.from(global.onlineUsers));

      // broadcast presence update if newly online
      if (!wasOnline) {
        io.emit('presence_update', { userId: id, status: 'online', type });
      }
    } catch (err) {
      console.error('identify error', err.message);
    }
  });

  socket.on('join', (conversationId) => {
    if (conversationId) socket.join(conversationId);
  });

  socket.on('leave', (conversationId) => {
    if (conversationId) socket.leave(conversationId);
  });

  socket.on('disconnect', () => {
    try {
      const id = socket.data?.userId;
      if (id) {
        const set = global.userSockets && global.userSockets.get(id);
        if (set) {
          set.delete(socket.id);
          if (set.size === 0) {
            // user fully offline
            global.userSockets.delete(id);
            if (global.onlineUsers) {
              global.onlineUsers.delete(id);
              io.emit('presence_update', { userId: id, status: 'offline' });
            }
          } else {
            global.userSockets.set(id, set);
          }
        }
      }
    } catch (err) {
      console.error('disconnect error', err.message);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Health Check: http://localhost:${PORT}/api/health`);
});
