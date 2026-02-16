# Chat Web API - Complete Express.js Server

A **production-ready Express.js REST API** with complete admin authentication, user management, and user authentication system.

## ✨ Features at a Glance

- 🔐 **Admin Authentication** - Secure email/password login with JWT tokens
- 👥 **User Management** - Full CRUD operations (Create, Read, Update, Delete)
- 🔑 **User Authentication** - Users login with admin-provided credentials
- 🛡️ **Security** - bcryptjs password hashing, JWT tokens, HTTP-only cookies
- 🗄️ **MongoDB** - Mongoose ODM with data validation
- 📝 **Middleware** - Role-based access control (admin vs user)
- 🚀 **Production Ready** - Error handling, validation, logging

## 📁 Quick Navigation

| Document | Purpose |
|----------|---------|
| **[QUICK_START.md](./QUICK_START.md)** | ⭐ Start here! Setup & getting started |
| **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** | Complete API reference with examples |
| **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** | Detailed project structure & file descriptions |
| **[EXAMPLE_USAGE.js](./EXAMPLE_USAGE.js)** | JavaScript code examples for all endpoints |
| **[Postman_Collection.json](./Postman_Collection.json)** | Import into Postman for easy testing |

## 🚀 Quick Start (30 seconds)

```bash
# 1. Install dependencies
npm install

# 2. Start MongoDB (in another terminal)
mongod

# 3. Start the server (in this terminal)
npm run dev

# 4. Test the API (in another terminal)
node test-api.js
```

✅ Server running on `http://localhost:5000`  
✅ Default admin: `admin@example.com` / `admin123`

## 📊 API Overview

### Admin Endpoints (8 endpoints)
```
POST   /api/admin/login              - Admin login
POST   /api/admin/logout             - Admin logout
POST   /api/admin/users              - Create user ✨
GET    /api/admin/users              - Get all users
GET    /api/admin/users/:id          - Get specific user
PUT    /api/admin/users/:id          - Update user ✨
DELETE /api/admin/users/:id          - Delete user ✨
PATCH  /api/admin/users/:id/password - Reset user password
```

### User Endpoints (5 endpoints)
```
POST   /api/user/login               - User login
POST   /api/user/logout              - User logout
GET    /api/user/profile             - Get profile
PUT    /api/user/profile             - Update profile ✨
PATCH  /api/user/password            - Change password
```

### Health Check
```
GET    /api/health                   - Server health check
```

## 🗂️ Project Structure

```
server/
├── models/                  # Database schemas
│   ├── Admin.js
│   └── User.js
├── controllers/             # Business logic
│   ├── adminController.js
│   └── userController.js
├── routes/                  # API routes
│   ├── adminRoutes.js
│   └── userRoutes.js
├── middleware/              # Auth & validation
│   └── authMiddleware.js
├── utils/                   # Helper functions
│   ├── jwtUtils.js
│   └── database.js
├── server.js                # Entry point
├── .env                     # Environment variables
└── package.json             # Dependencies
```

## 🔑 Key Technologies

| Technology | Version | Purpose |
|----------|---------|---------|
| Express.js | 5.1.0 | Web framework |
| MongoDB | 6.17.0 | Database |
| Mongoose | 8.16.0 | ODM |
| JWT | 9.0.2 | Authentication |
| bcryptjs | 3.0.2 | Password hashing |
| CORS | 2.8.5 | Cross-origin support |
| Dotenv | 17.0.0 | Environment variables |

## 🔐 Authentication Details

### How It Works

1. **Admin logs in** → JWT token generated → Token in secure cookie
2. **Admin creates users** → Email, password, username stored → Password hashed
3. **User logs in** → Token generated → Can access user endpoints
4. **Protected routes** → Middleware verifies token → Returns 401 if invalid

### Security Features

✅ Passwords hashed with bcryptjs (salt rounds: 10)  
✅ JWT tokens signed with secret key  
✅ Tokens stored in HTTP-only secure cookies  
✅ Token expiration: 7 days  
✅ Role-based access control (admin vs user)  
✅ Email validation  
✅ Input validation in models  

## 📝 Environment Variables

Create or update `.env` file:

```env
PORT=5000                              # Server port (default: 5000)
MONGODB_URI=mongodb://localhost:27017/chatapp  # MongoDB connection
JWT_SECRET=your_secret_key_here        # ⚠️ Change for production!
JWT_EXPIRE=7d                          # Token expiration time
SESSION_SECRET=your_secret_here        # ⚠️ Change for production!
NODE_ENV=development                   # development or production
ADMIN_EMAIL=admin@example.com          # Default admin email
ADMIN_PASSWORD=admin123                # ⚠️ Change for production!
```

## 🧪 Testing

### Option 1: Using Node.js Test Script
```bash
npm run dev    # In terminal 1
node test-api.js  # In terminal 2 (after server starts)
```

### Option 2: Using cURL
```bash
# Admin Login
curl -X POST ${BASE_URL:-http://localhost:5000}/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Create User (replace TOKEN with response token)
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"email":"user@test.com","password":"pass123","username":"john"}'
```

### Option 3: Using Postman
1. Download [Postman](https://www.postman.com)
2. Import `Postman_Collection.json`
3. Set `base_url` variable to your server URL (e.g. `http://localhost:5000` or whatever you have in your .env)
4. Run requests with auto token management

## 📖 Example: Complete Login Workflow

```javascript
// 1. Admin logs in
const adminResponse = await fetch(`${process.env.BASE_URL || 'http://localhost:5000'}/api/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'admin123'
  })
});
const { token: adminToken } = await adminResponse.json();

// 2. Admin creates a user
const createResponse = await fetch(`${process.env.BASE_URL || 'http://localhost:5000'}/api/admin/users`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'securePass123',
    username: 'john_doe'
  })
});

// 3. User logs in with provided credentials
const userLoginResponse = await fetch('http://localhost:5000/api/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'securePass123'
  })
});
const { token: userToken } = await userLoginResponse.json();

// 4. User accesses their profile
const profileResponse = await fetch('http://localhost:5000/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});
```

## ✅ Checklist: Before Production

- [ ] Change `JWT_SECRET` in `.env`
- [ ] Change `SESSION_SECRET` in `.env`
- [ ] Change default admin email/password
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas or secure MongoDB instance
- [ ] Enable HTTPS
- [ ] Set up proper error logging (Sentry, etc.)
- [ ] Add rate limiting
- [ ] Add input sanitization
- [ ] Enable monitoring/observability
- [ ] Set up automated backups
- [ ] Configure CORS properly

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
**Solution**: Start MongoDB with `mongod` or update `MONGODB_URI` in `.env`

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution**: Change `PORT` in `.env` or kill process on port 5000

### Token Errors
```
Invalid or expired token
```
**Solution**: Log in again to get a fresh token (expires after 7 days)

### CORS Errors
**Solution**: Ensure your frontend is on allowed origin (default: localhost:3000 in dev)

## 📚 Documentation Files

### QUICK_START.md
Step-by-step setup guide with common issues and solutions

### API_DOCUMENTATION.md
Complete API reference with:
- All endpoint descriptions
- Request/response examples
- Authentication details
- Error codes
- Environment variables explained

### PROJECT_STRUCTURE.md
Detailed breakdown of:
- Every file and its purpose
- Complete route list
- Database schema structure
- Dependencies information
- Workflow examples

### EXAMPLE_USAGE.js
JavaScript code examples for:
- Admin endpoints (login, CRUD users)
- User endpoints (login, profile)
- Error handling
- Export for browser use

### Postman_Collection.json
Pre-configured Postman collection with:
- All 13 API endpoints
- Dynamic variable management
- Auto token extraction
- Ready-to-test requests

## 🎯 Next Steps

1. **Setup**: Follow [QUICK_START.md](./QUICK_START.md)
2. **Understand**: Review [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
3. **Test**: Run `node test-api.js` or import Postman collection
4. **Integrate**: Use [EXAMPLE_USAGE.js](./EXAMPLE_USAGE.js) as reference
5. **Deploy**: Check production checklist above
6. **Extend**: Add features like email verification, password reset, etc.

## 🚀 Running the Server

### Development
```bash
npm run dev
```
- Auto-restarts on file changes
- Detailed logging
- Hot reloading

### Production
```bash
npm start
```
- Optimized performance
- Minimal logging
- Process management recommended

## 📞 Support Resources

- **Getting Started**: [QUICK_START.md](./QUICK_START.md)
- **API Reference**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Code Examples**: [EXAMPLE_USAGE.js](./EXAMPLE_USAGE.js)
- **File Structure**: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- **Testing**: `node test-api.js`

## 📄 License

ISC

---

**Ready to start?** → Open [QUICK_START.md](./QUICK_START.md) 🚀
