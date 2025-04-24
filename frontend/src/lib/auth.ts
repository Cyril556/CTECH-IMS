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
  // In a real app, we would use Supabase Auth, but for this demo we'll query the users table directly
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password) // Note: In a real app, passwords would be hashed
    .eq('status', 'active')
    .single();

  if (error || !data) {
    throw new Error('Invalid email or password');
  }

  // Create user object to store in localStorage
  const user: AuthUser = {
    id: data.id,
    email: data.email,
    full_name: data.full_name,
    role: data.role,
    status: data.status,
    isLoggedIn: true
  };

  // Store user in localStorage
  localStorage.setItem('user', JSON.stringify(user));

  // Log the login event
  await logAuditEvent('user_login', user.id);

  return user;
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
  
  // Insert the new user
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: userData.email,
      password: userData.password,
      full_name: userData.full_name || null,
      role: userData.role,
      status: userData.status,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating user:', error);
    throw new Error(error.message);
  }
  
  // Log the user creation event
  await logAuditEvent('user_creation', currentUser.id, data.id);
  
  return data;
};

// Update a user's status (admin only)
export const updateUserStatus = async (userId: string, status: string): Promise<User> => {
  const currentUser = getCurrentUser();
  
  // Check if the current user is an admin
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Only admins can update user status');
  }
  
  // Update the user
  const { data, error } = await supabase
    .from('users')
    .update({ status })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user status:', error);
    throw new Error(error.message);
  }
  
  // Log the user update event
  await logAuditEvent('user_status_update', currentUser.id, userId, { status });
  
  return data;
};

// Force password reset for a user (admin only)
export const forcePasswordReset = async (userId: string): Promise<User> => {
  const currentUser = getCurrentUser();
  
  // Check if the current user is an admin
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Only admins can force password resets');
  }
  
  // Update the user
  const { data, error } = await supabase
    .from('users')
    .update({ password_reset_required: true })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error forcing password reset:', error);
    throw new Error(error.message);
  }
  
  // Log the password reset event
  await logAuditEvent('password_reset_forced', currentUser.id, userId);
  
  return data;
};

// Get all users (admin only)
export const getAllUsers = async (): Promise<User[]> => {
  const currentUser = getCurrentUser();
  
  // Check if the current user is an admin
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Only admins can view all users');
  }
  
  // Get all users
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching users:', error);
    throw new Error(error.message);
  }
  
  return data || [];
};

// Get audit logs (admin only)
export const getAuditLogs = async (limit = 50): Promise<Tables<'audit_logs'>[]> => {
  const currentUser = getCurrentUser();
  
  // Check if the current user is an admin
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Only admins can view audit logs');
  }
  
  // Get audit logs
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      users:user_id(id, email, full_name),
      target_users:target_user_id(id, email, full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching audit logs:', error);
    throw new Error(error.message);
  }
  
  return data || [];
};

// Log an audit event
export const logAuditEvent = async (
  eventType: string,
  userId?: string,
  targetUserId?: string,
  details?: any
): Promise<void> => {
  try {
    await supabase.from('audit_logs').insert({
      event_type: eventType,
      user_id: userId || null,
      target_user_id: targetUserId || null,
      details: details || null,
      ip_address: 'client' // In a real app, we would get the IP from the request
    });
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
};
