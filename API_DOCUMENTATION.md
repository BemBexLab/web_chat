# Chat Web API - Complete Express.js Server

A complete Express.js REST API with admin authentication, user management, and user authentication system.

## Features

- **Admin Authentication**: Email/password login with JWT tokens
- **Admin User Management**: Full CRUD operations for users
- **User Authentication**: Users login with credentials provided by admin
- **Password Hashing**: Using bcryptjs for secure password storage
- **JWT Tokens**: Token-based authentication with HTTP-only cookies
- **MongoDB Integration**: Using Mongoose ODM
- **Session Management**: Express-session support
- **CORS Support**: Cross-origin resource sharing enabled

## Project Structure

```
server/
├── models/
│   ├── Admin.js          # Admin model
│   └── User.js           # User model
├── controllers/
│   ├── adminController.js # Admin logic (login, CRUD users)
│   └── userController.js  # User logic (login, profile)
├── routes/
│   ├── adminRoutes.js    # Admin endpoints
│   └── userRoutes.js     # User endpoints
├── middleware/
│   └── authMiddleware.js # Authentication & authorization
├── utils/
│   ├── jwtUtils.js       # JWT token utilities
│   └── database.js       # MongoDB connection
├── .env                  # Environment variables
├── package.json          # Dependencies
└── server.js             # Main entry point
```

## Setup Instructions

### 1. Install Dependencies

The dependencies are already listed in `package.json`. Install them:

```bash
npm install
```

### 2. Configure Environment Variables

The `.env` file is already created with default values. Update it as needed:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=7d
SESSION_SECRET=your_super_secret_session_key_change_this_in_production_secret123
NODE_ENV=development
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

**Important**: Change these values in production!

### 3. Start MongoDB

Make sure MongoDB is running:

```bash
# Using MongoDB locally
mongod

# Or using MongoDB Atlas (update MONGODB_URI in .env)
```

### 4. Run the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will:
- Connect to MongoDB
- Create a default admin account if it doesn't exist
- Start listening on the configured port (default: 5000)

## API Endpoints

### Admin Endpoints

#### Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "admin": {
    "id": "507f...",
    "email": "admin@example.com"
  }
}
```

#### Logout
```http
POST /api/admin/logout
Authorization: Bearer <token>
```

#### Create User
```http
POST /api/admin/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "john_doe"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "507f...",
    "email": "user@example.com",
    "username": "john_doe",
    "createdAt": "2024-02-16T10:00:00Z"
  }
}
```

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Users retrieved successfully",
  "total": 5,
  "users": [
    {
      "_id": "507f...",
      "email": "user@example.com",
      "username": "john_doe",
      "isActive": true,
      "createdAt": "2024-02-16T10:00:00Z"
    }
  ]
}
```

#### Get User by ID
```http
GET /api/admin/users/:id
Authorization: Bearer <token>
```

#### Update User
```http
PUT /api/admin/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newemail@example.com",
  "username": "new_username",
  "isActive": true
}
```

#### Delete User
```http
DELETE /api/admin/users/:id
Authorization: Bearer <token>
```

#### Update User Password (by Admin)
```http
PATCH /api/admin/users/:id/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "newPassword": "newPassword123"
}
```

### User Endpoints

#### Login
```http
POST /api/user/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f...",
    "email": "user@example.com",
    "username": "john_doe"
  }
}
```

#### Logout
```http
POST /api/user/logout
Authorization: Bearer <token>
```

#### Get Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Profile retrieved successfully",
  "user": {
    "_id": "507f...",
    "email": "user@example.com",
    "username": "john_doe",
    "isActive": true,
    "createdAt": "2024-02-16T10:00:00Z"
  }
}
```

#### Update Profile
```http
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "new_username"
}
```

#### Change Password
```http
PATCH /api/user/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

## Authentication

- **JWT Tokens**: Issued upon successful login, valid for 7 days
- **HTTP-Only Cookies**: Token stored in secure, HTTP-only cookies
- **Bearer Token**: Can also pass token in Authorization header
- **Middleware Protection**: All protected routes require valid token
- **Role-Based Access**: Separate middleware for admin and user routes

## Error Handling

All errors return appropriate HTTP status codes:

- `400`: Bad Request (missing/invalid fields)
- `401`: Unauthorized (invalid credentials/expired token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

## Security Features

1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Verification**: Token validation on protected routes
3. **HTTP-Only Cookies**: Prevents XSS attacks
4. **CORS Protection**: Configurable origin restrictions
5. **Email Validation**: Pattern matching for email fields
6. **Input Validation**: Required fields validation in models

## Development Tips

### Testing with cURL

```bash
# Admin Login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Create User
curl -X POST http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","username":"john"}'
```

### Using Postman

1. Import the API endpoints
2. Use the token from login response in Authorization header
3. Or let the cookie be handled automatically by Postman

## Environment Variables Explained

| Variable | Description | Default |
|----------|-----------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/chatapp |
| `JWT_SECRET` | Secret for JWT signing | (generated) |
| `JWT_EXPIRE` | Token expiration time | 7d |
| `SESSION_SECRET` | Session secret key | (generated) |
| `NODE_ENV` | Environment (development/production) | development |
| `ADMIN_EMAIL` | Default admin email | admin@example.com |
| `ADMIN_PASSWORD` | Default admin password | admin123 |

## Common Issues

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in `.env` file
- Verify network connectivity

### Token Errors
- Token might be expired (7 days validity)
- Try logging in again to get a new token
- Check if JWT_SECRET is changed (will invalidate old tokens)

### CORS Issues
- Ensure CLIENT_URL is set in `.env` for production
- Check that frontend is using correct origin
- Verify credentials flag is set in fetch requests

## Production Checklist

- [ ] Change `JWT_SECRET` and `SESSION_SECRET` in `.env`
- [ ] Change default `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas or secured MongoDB instance
- [ ] Enable HTTPS
- [ ] Set proper CORS origin
- [ ] Add rate limiting
- [ ] Add input sanitization
- [ ] Enable logging system
- [ ] Set up error monitoring (Sentry, etc.)

## License

ISC
