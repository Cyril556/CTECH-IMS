import { supabase } from './supabase';
import { Tables } from '@/types/Database.types';

export type User = Tables<'users'>;

export type AuthUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  isLoggedIn: boolean;
};

// Login with email and password
export const login = async (email: string, password: string): Promise<AuthUser> => {
  // For demo purposes, we'll use the mock users table in localStorage
  const mockUsersTable = JSON.parse(localStorage.getItem('mock_users_table') || '[]');

  // Find the user with matching email and password
  const user = mockUsersTable.find((u: any) =>
    u.email === email &&
    u.password === password &&
    u.status === 'active'
  );

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Create user object to store in localStorage
  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    status: user.status,
    isLoggedIn: true
  };

  // Store user in localStorage
  localStorage.setItem('user', JSON.stringify(authUser));

  // Log the login event
  await logAuditEvent('user_login', authUser.id);

  return authUser;
};

// Logout the current user
export const logout = async (): Promise<void> => {
  const user = getCurrentUser();
  if (user) {
    // Log the logout event
    await logAuditEvent('user_logout', user.id);
  }

  // Remove user from localStorage
  localStorage.removeItem('user');
};

// Get the current user from localStorage
export const getCurrentUser = (): AuthUser | null => {
  try {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;

    const user = JSON.parse(userJson) as AuthUser;
    return user.isLoggedIn ? user : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

// Check if the current user is authenticated
export const isAuthenticated = (): boolean => {
  const user = getCurrentUser();
  return !!user;
};

// Check if the current user is an admin
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return !!user && user.role === 'admin';
};

// Create a new user (admin only)
export const createUser = async (userData: {
  email: string;
  password: string;
  full_name?: string;
  role: string;
  status: string;
}): Promise<User> => {
  const currentUser = getCurrentUser();

  // Check if the current user is an admin
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Only admins can create users');
  }

  // Get the mock users table
  const mockUsersTable = JSON.parse(localStorage.getItem('mock_users_table') || '[]');

  // Check if email already exists
  if (mockUsersTable.some((u: any) => u.email === userData.email)) {
    throw new Error('Email already exists');
  }

  // Create new user
  const newUser = {
    id: String(mockUsersTable.length + 1),
    email: userData.email,
    password: userData.password,
    full_name: userData.full_name || null,
    role: userData.role,
    status: userData.status,
    password_reset_required: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Add to mock users table
  mockUsersTable.push(newUser);
  localStorage.setItem('mock_users_table', JSON.stringify(mockUsersTable));

  // Log the user creation event
  await logAuditEvent('user_creation', currentUser.id, newUser.id);

  return newUser;
};

// Update a user's status (admin only)
export const updateUserStatus = async (userId: string, status: string): Promise<User> => {
  const currentUser = getCurrentUser();

  // Check if the current user is an admin
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Only admins can update user status');
  }

  // Get the mock users table
  const mockUsersTable = JSON.parse(localStorage.getItem('mock_users_table') || '[]');

  // Find the user
  const userIndex = mockUsersTable.findIndex((u: any) => u.id === userId);
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  // Update the user
  mockUsersTable[userIndex].status = status;
  mockUsersTable[userIndex].updated_at = new Date().toISOString();

  // Save the updated users table
  localStorage.setItem('mock_users_table', JSON.stringify(mockUsersTable));

  // Log the user update event
  await logAuditEvent('user_status_update', currentUser.id, userId, { status });

  return mockUsersTable[userIndex];
};

// Force password reset for a user (admin only)
export const forcePasswordReset = async (userId: string): Promise<User> => {
  const currentUser = getCurrentUser();

  // Check if the current user is an admin
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Only admins can force password resets');
  }

  // Get the mock users table
  const mockUsersTable = JSON.parse(localStorage.getItem('mock_users_table') || '[]');

  // Find the user
  const userIndex = mockUsersTable.findIndex((u: any) => u.id === userId);
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  // Update the user
  mockUsersTable[userIndex].password_reset_required = true;
  mockUsersTable[userIndex].updated_at = new Date().toISOString();

  // Save the updated users table
  localStorage.setItem('mock_users_table', JSON.stringify(mockUsersTable));

  // Log the password reset event
  await logAuditEvent('password_reset_forced', currentUser.id, userId);

  return mockUsersTable[userIndex];
};

// Get all users (admin only)
export const getAllUsers = async (): Promise<User[]> => {
  const currentUser = getCurrentUser();

  // Check if the current user is an admin
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Only admins can view all users');
  }

  // Get the mock users table
  const mockUsersTable = JSON.parse(localStorage.getItem('mock_users_table') || '[]');

  // Sort by created_at in descending order
  return [...mockUsersTable].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

// Get audit logs (admin only)
export const getAuditLogs = async (limit = 50): Promise<Tables<'audit_logs'>[]> => {
  const currentUser = getCurrentUser();

  // Check if the current user is an admin
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Only admins can view audit logs');
  }

  // Get the mock audit logs
  const mockAuditLogs = JSON.parse(localStorage.getItem('mock_audit_logs') || '[]');

  // Get the mock users table for joining user data
  const mockUsersTable = JSON.parse(localStorage.getItem('mock_users_table') || '[]');

  // Join user data to audit logs
  const logsWithUserData = mockAuditLogs.map((log: any) => {
    const user = mockUsersTable.find((u: any) => u.id === log.user_id);
    const targetUser = mockUsersTable.find((u: any) => u.id === log.target_user_id);

    return {
      ...log,
      users: user ? {
        id: user.id,
        email: user.email,
        full_name: user.full_name
      } : null,
      target_users: targetUser ? {
        id: targetUser.id,
        email: targetUser.email,
        full_name: targetUser.full_name
      } : null
    };
  });

  // Sort by created_at in descending order and limit
  return logsWithUserData
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
};

// Log an audit event
export const logAuditEvent = async (
  eventType: string,
  userId?: string,
  targetUserId?: string,
  details?: any
): Promise<void> => {
  try {
    // Get the mock audit logs
    const mockAuditLogs = JSON.parse(localStorage.getItem('mock_audit_logs') || '[]');

    // Create new audit log entry
    const newLog = {
      id: String(Date.now()),
      event_type: eventType,
      user_id: userId || null,
      target_user_id: targetUserId || null,
      details: details || null,
      ip_address: 'client', // In a real app, we would get the IP from the request
      created_at: new Date().toISOString()
    };

    // Add to mock audit logs
    mockAuditLogs.push(newLog);
    localStorage.setItem('mock_audit_logs', JSON.stringify(mockAuditLogs));
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
};
