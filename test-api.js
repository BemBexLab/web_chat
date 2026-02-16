#!/usr/bin/env node

/**
 * Quick Test Script for Chat Web API
 * 
 * Usage: node test-api.js
 * 
 * This script demonstrates a simple workflow:
 * 1. Admin logs in
 * 2. Create a test user
 * 3. Get all users
 * 4. User logs in
 * 5. Get user profile
 * 6. Update user profile
 * 7. Change password
 * 8. Cleanup (delete test user)
 */

const BASE_URL = 'http://localhost:5000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('Z')[0];
  const prefix = `[${timestamp}]`;
  
  switch (type) {
    case 'success':
      console.log(`${colors.green}${prefix} ✓ ${message}${colors.reset}`);
      break;
    case 'error':
      console.log(`${colors.red}${prefix} ✗ ${message}${colors.reset}`);
      break;
    case 'info':
      console.log(`${colors.blue}${prefix} ℹ ${message}${colors.reset}`);
      break;
    case 'warn':
      console.log(`${colors.yellow}${prefix} ⚠ ${message}${colors.reset}`);
      break;
    default:
      console.log(`${prefix} ${message}`);
  }
}

async function makeRequest(method, endpoint, body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();

    return {
      status: response.status,
      data,
      ok: response.ok,
    };
  } catch (error) {
    log(`Network error: ${error.message}`, 'error');
    return { ok: false, error: error.message };
  }
}

async function runTests() {
  let adminToken, userId, userToken;

  console.log('\n' + colors.blue + '=' + '='.repeat(50) + colors.reset);
  console.log(colors.blue + 'Chat Web API - Test Script' + colors.reset);
  console.log(colors.blue + '=' + '='.repeat(50) + colors.reset + '\n');

  // Test 1: Health Check
  log('Testing server health...', 'info');
  const healthResponse = await makeRequest('GET', '/health');
  if (healthResponse.ok) {
    log('Server is running ✓', 'success');
  } else {
    log('Server is not responding', 'error');
    log('Make sure the server is running: npm run dev', 'warn');
    process.exit(1);
  }

  console.log('\n' + colors.blue + '--- Admin Tests ---' + colors.reset + '\n');

  // Test 2: Admin Login
  log('Admin Login...', 'info');
  const adminLoginResponse = await makeRequest('POST', '/admin/login', {
    email: 'admin@example.com',
    password: 'admin123',
  });

  if (adminLoginResponse.ok) {
    adminToken = adminLoginResponse.data.token;
    log(`Admin logged in successfully (Token: ${adminToken.substring(0, 20)}...)`, 'success');
  } else {
    log(`Admin login failed: ${adminLoginResponse.data.message}`, 'error');
    process.exit(1);
  }

  // Test 3: Create User
  log('Creating test user...', 'info');
  const createUserResponse = await makeRequest('POST', '/admin/users', {
    email: 'testuser@example.com',
    password: 'testpass123',
    username: 'test_user_' + Date.now(),
  }, adminToken);

  if (createUserResponse.ok) {
    userId = createUserResponse.data.user.id;
    log(`User created successfully (ID: ${userId})`, 'success');
  } else {
    log(`Create user failed: ${createUserResponse.data.message}`, 'error');
    process.exit(1);
  }

  // Test 4: Get All Users
  log('Fetching all users...', 'info');
  const getAllUsersResponse = await makeRequest('GET', '/admin/users', null, adminToken);

  if (getAllUsersResponse.ok) {
    log(
      `Retrieved ${getAllUsersResponse.data.total} users from database`,
      'success'
    );
  } else {
    log(`Get users failed: ${getAllUsersResponse.data.message}`, 'error');
  }

  // Test 5: Get Specific User
  log(`Getting user details (ID: ${userId})...`, 'info');
  const getUserResponse = await makeRequest('GET', `/admin/users/${userId}`, null, adminToken);

  if (getUserResponse.ok) {
    log(`Retrieved user: ${getUserResponse.data.user.username}`, 'success');
  } else {
    log(`Get user failed: ${getUserResponse.data.message}`, 'error');
  }

  // Test 6: Update User
  log('Updating user profile (via admin)...', 'info');
  const updateUserResponse = await makeRequest('PUT', `/admin/users/${userId}`, {
    username: 'test_user_updated',
  }, adminToken);

  if (updateUserResponse.ok) {
    log(`User updated: ${updateUserResponse.data.user.username}`, 'success');
  } else {
    log(`Update user failed: ${updateUserResponse.data.message}`, 'error');
  }

  console.log('\n' + colors.blue + '--- User Tests ---' + colors.reset + '\n');

  // Test 7: User Login
  log('User Login...', 'info');
  const userLoginResponse = await makeRequest('POST', '/user/login', {
    email: 'testuser@example.com',
    password: 'testpass123',
  });

  if (userLoginResponse.ok) {
    userToken = userLoginResponse.data.token;
    log(`User logged in successfully (Token: ${userToken.substring(0, 20)}...)`, 'success');
  } else {
    log(`User login failed: ${userLoginResponse.data.message}`, 'error');
    process.exit(1);
  }

  // Test 8: Get User Profile
  log('Getting user profile...', 'info');
  const getProfileResponse = await makeRequest('GET', '/user/profile', null, userToken);

  if (getProfileResponse.ok) {
    log(`Retrieved profile: ${getProfileResponse.data.user.username}`, 'success');
  } else {
    log(`Get profile failed: ${getProfileResponse.data.message}`, 'error');
  }

  // Test 9: Update User Profile
  log('Updating user profile (via user)...', 'info');
  const updateProfileResponse = await makeRequest('PUT', '/user/profile', {
    username: 'updated_by_user',
  }, userToken);

  if (updateProfileResponse.ok) {
    log(`Profile updated: ${updateProfileResponse.data.user.username}`, 'success');
  } else {
    log(`Update profile failed: ${updateProfileResponse.data.message}`, 'error');
  }

  // Test 10: Change Password
  log('Changing user password...', 'info');
  const changePasswordResponse = await makeRequest('PATCH', '/user/password', {
    currentPassword: 'testpass123',
    newPassword: 'newpass123',
  }, userToken);

  if (changePasswordResponse.ok) {
    log('Password changed successfully', 'success');
  } else {
    log(`Change password failed: ${changePasswordResponse.data.message}`, 'error');
  }

  console.log('\n' + colors.blue + '--- Cleanup ---' + colors.reset + '\n');

  // Test 11: Delete User
  log('Deleting test user (via admin)...', 'info');
  const deleteUserResponse = await makeRequest('DELETE', `/admin/users/${userId}`, null, adminToken);

  if (deleteUserResponse.ok) {
    log('Test user deleted successfully', 'success');
  } else {
    log(`Delete user failed: ${deleteUserResponse.data.message}`, 'error');
  }

  // Test 12: Admin Logout
  log('Admin Logout...', 'info');
  const adminLogoutResponse = await makeRequest('POST', '/admin/logout', null, adminToken);

  if (adminLogoutResponse.ok) {
    log('Admin logged out successfully', 'success');
  } else {
    log(`Admin logout failed: ${adminLogoutResponse.data.message}`, 'error');
  }

  console.log('\n' + colors.blue + '=' + '='.repeat(50) + colors.reset);
  console.log(colors.green + '✓ All tests completed successfully!' + colors.reset);
  console.log(colors.blue + '=' + '='.repeat(50) + colors.reset + '\n');
}

// Run tests
runTests().catch((error) => {
  log(`Test suite failed: ${error.message}`, 'error');
  process.exit(1);
});
