# Quick Start Guide

## Step 1: Install Dependencies

Open your terminal in the `server` directory and run:

```bash
npm install
```

This will install all the required packages listed in `package.json`.

## Step 2: Start MongoDB

Make sure MongoDB is running. You have two options:

### Option A: Local MongoDB
```bash
mongod
```

### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get your connection string
3. Update the `MONGODB_URI` in `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp
   ```

## Step 3: Configure Environment Variables

The `.env` file is already created with default values. You can update them:

```env
PORT=5000                                          # Server port
MONGODB_URI=mongodb://localhost:27017/chatapp    # MongoDB connection
JWT_SECRET=your_secret_key_here                   # Change this!
ADMIN_EMAIL=admin@example.com                     # Admin email
ADMIN_PASSWORD=admin123                           # Admin password (change!)
```

## Step 4: Start the Server

### Development (with auto-reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will:
- ✅ Connect to MongoDB
- ✅ Create default admin account (if not exists)
- ✅ Start listening on http://localhost:5000

## Step 5: Test the API

### Option A: Using cURL
```bash
# Admin Login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Option B: Using Postman
1. Download [Postman](https://www.postman.com)
2. Import the API endpoints from [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. Start testing!

### Option C: Using Node.js
```bash
# In a Node.js environment, you can import and use functions from EXAMPLE_USAGE.js
node --input-type=module --eval "import('./EXAMPLE_USAGE.js').then(m => m.exampleWorkflow())"
```

## API Overview

### Admin Features
- ✅ Login with email/password
- ✅ Create users
- ✅ Read all users or specific user
- ✅ Update user details
- ✅ Delete users
- ✅ Reset user passwords
- ✅ Logout

### User Features
- ✅ Login with credentials from admin
- ✅ View own profile
- ✅ Update own profile
- ✅ Change own password
- ✅ Logout

## Common Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/admin/login` | Admin login |
| POST | `/api/admin/users` | Create user |
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/users/:id` | Get specific user |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| POST | `/api/user/login` | User login |
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update user profile |
| PATCH | `/api/user/password` | Change user password |

## Default Credentials

The API creates a default admin on first run:

- **Email**: `admin@example.com`
- **Password**: `admin123`

⚠️ **Change these in `.env` for production!**

## Troubleshooting

### MongoDB Connection Error
```
Error: connection refused
```
- Make sure MongoDB is running
- Check MONGODB_URI in `.env`
- For local: try `mongod`
- For Atlas: verify connection string

### Port Already in Use
```
Error: listen EADDRINUSE
```
- Change `PORT` in `.env` to another number (e.g., 5001)
- Or kill the process using port 5000

### Token Errors
```
Invalid or expired token
```
- Log out and log back in
- Token expires after 7 days (configurable)
- Check if JWT_SECRET was changed

## Next Steps

1. ✅ Start the server
2. ✅ Login as admin
3. ✅ Create some users
4. ✅ Login as a user
5. ✅ Check out [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API reference
6. ✅ See [EXAMPLE_USAGE.js](./EXAMPLE_USAGE.js) for code examples

## Need Help?

- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API docs
- Review [EXAMPLE_USAGE.js](./EXAMPLE_USAGE.js) for code examples
- Check server logs for errors
- Verify MongoDB connection
- Ensure all dependencies are installed: `npm install`

## Security Reminders for Production

- 🔐 Change `JWT_SECRET` and `SESSION_SECRET`
- 🔐 Change default admin credentials
- 🔐 Use environment-specific `.env` files
- 🔐 Enable HTTPS
- 🔐 Set `NODE_ENV=production`
- 🔐 Use MongoDB Atlas or secured MongoDB
- 🔐 Add rate limiting
- 🔐 Enable logging and monitoring
