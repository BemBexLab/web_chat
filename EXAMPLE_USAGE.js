/**
 * Example usage of the Chat Web API
 * 
 * This file demonstrates how to interact with the API
 * using fetch (browser) or Node.js
 */

const BASE_URL = 'http://localhost:5000/api';

// ============================================
// ADMIN ENDPOINTS EXAMPLES
// ============================================

/**
 * Admin Login
 * This should be called first to get the authentication token
 */
async function adminLogin() {
  try {
    const response = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
      }),
    });

    const data = await response.json();
    console.log('Admin Login Response:', data);
    
    // Store token for subsequent requests
    return data.token;
  } catch (error) {
    console.error('Admin Login Error:', error);
  }
}

/**
 * Create a new user (Admin only)
 */
async function createUser(token, userData) {
  try {
    const response = await fetch(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log('Create User Response:', data);
    return data.user;
  } catch (error) {
    console.error('Create User Error:', error);
  }
}

/**
 * Get all users (Admin only)
 */
async function getAllUsers(token) {
  try {
    const response = await fetch(`${BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();
    console.log('Get All Users Response:', data);
    return data.users;
  } catch (error) {
    console.error('Get All Users Error:', error);
  }
}

/**
 * Get user by ID (Admin only)
 */
async function getUserById(token, userId) {
  try {
    const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();
    console.log('Get User By ID Response:', data);
    return data.user;
  } catch (error) {
    console.error('Get User By ID Error:', error);
  }
}

/**
 * Update user (Admin only)
 */
async function updateUser(token, userId, updateData) {
  try {
    const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(updateData),
    });

    const data = await response.json();
    console.log('Update User Response:', data);
    return data.user;
  } catch (error) {
    console.error('Update User Error:', error);
  }
}

/**
 * Delete user (Admin only)
 */
async function deleteUser(token, userId) {
  try {
    const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();
    console.log('Delete User Response:', data);
    return data;
  } catch (error) {
    console.error('Delete User Error:', error);
  }
}

/**
 * Update user password (Admin only)
 */
async function updateUserPassword(token, userId, newPassword) {
  try {
    const response = await fetch(`${BASE_URL}/admin/users/${userId}/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ newPassword }),
    });

    const data = await response.json();
    console.log('Update User Password Response:', data);
    return data;
  } catch (error) {
    console.error('Update User Password Error:', error);
  }
}

/**
 * Admin Logout
 */
async function adminLogout(token) {
  try {
    const response = await fetch(`${BASE_URL}/admin/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();
    console.log('Admin Logout Response:', data);
    return data;
  } catch (error) {
    console.error('Admin Logout Error:', error);
  }
}

// ============================================
// USER ENDPOINTS EXAMPLES
// ============================================

/**
 * User Login
 * Users use credentials provided by admin
 */
async function userLogin(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('User Login Response:', data);
    return data.token;
  } catch (error) {
    console.error('User Login Error:', error);
  }
}

/**
 * Get user profile
 */
async function getUserProfile(token) {
  try {
    const response = await fetch(`${BASE_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();
    console.log('Get User Profile Response:', data);
    return data.user;
  } catch (error) {
    console.error('Get User Profile Error:', error);
  }
}

/**
 * Update user profile
 * User can only update their own profile
 */
async function updateUserProfile(token, updateData) {
  try {
    const response = await fetch(`${BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(updateData),
    });

    const data = await response.json();
    console.log('Update User Profile Response:', data);
    return data.user;
  } catch (error) {
    console.error('Update User Profile Error:', error);
  }
}

/**
 * Change user password
 * User provides current password and new password
 */
async function changePassword(token, currentPassword, newPassword) {
  try {
    const response = await fetch(`${BASE_URL}/user/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();
    console.log('Change Password Response:', data);
    return data;
  } catch (error) {
    console.error('Change Password Error:', error);
  }
}

/**
 * User Logout
 */
async function userLogout(token) {
  try {
    const response = await fetch(`${BASE_URL}/user/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();
    console.log('User Logout Response:', data);
    return data;
  } catch (error) {
    console.error('User Logout Error:', error);
  }
}

// ============================================
// EXAMPLE USAGE WORKFLOW
// ============================================

/**
 * Complete workflow example
 * Uncomment to run
 */
async function exampleWorkflow() {
  console.log('=== ADMIN WORKFLOW ===\n');

  // 1. Admin Login
  console.log('1. Admin Login...');
  const adminToken = await adminLogin();
  console.log('\n');

  // 2. Create Users
  console.log('2. Creating Users...');
  const user1 = await createUser(adminToken, {
    email: 'john@example.com',
    password: 'password123',
    username: 'john_doe',
  });
  const user2 = await createUser(adminToken, {
    email: 'jane@example.com',
    password: 'password456',
    username: 'jane_doe',
  });
  console.log('\n');

  // 3. Get All Users
  console.log('3. Getting All Users...');
  await getAllUsers(adminToken);
  console.log('\n');

  // 4. Get Specific User
  console.log('4. Getting Specific User...');
  if (user1) {
    await getUserById(adminToken, user1.id);
  }
  console.log('\n');

  // 5. Update User
  console.log('5. Updating User...');
  if (user1) {
    await updateUser(adminToken, user1.id, {
      username: 'john_updated',
    });
  }
  console.log('\n');

  console.log('=== USER WORKFLOW ===\n');

  // 6. User Login
  console.log('6. User Login...');
  const userToken = await userLogin('john@example.com', 'password123');
  console.log('\n');

  // 7. Get User Profile
  console.log('7. Getting User Profile...');
  await getUserProfile(userToken);
  console.log('\n');

  // 8. Update User Profile
  console.log('8. Updating User Profile...');
  await updateUserProfile(userToken, {
    username: 'john_new_name',
  });
  console.log('\n');

  // 9. Change User Password
  console.log('9. Changing User Password...');
  await changePassword(userToken, 'password123', 'newpassword123');
  console.log('\n');

  // 10. User Logout
  console.log('10. User Logout...');
  await userLogout(userToken);
  console.log('\n');

  // 11. Delete User
  console.log('11. Deleting User (as Admin)...');
  if (user2) {
    await deleteUser(adminToken, user2.id);
  }
  console.log('\n');

  // 12. Admin Logout
  console.log('12. Admin Logout...');
  await adminLogout(adminToken);
}

// ============================================
// EXPORT FOR USE IN BROWSER
// ============================================

export {
  adminLogin,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserPassword,
  adminLogout,
  userLogin,
  getUserProfile,
  updateUserProfile,
  changePassword,
  userLogout,
  exampleWorkflow,
};
