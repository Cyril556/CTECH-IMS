
// Default notifications for new users
export const defaultNotifications = [
  {
    id: 1000,
    title: "Welcome to C TECH IMS",
    message: "Welcome to the C TECH Inventory Management System",
    time: new Date().toLocaleString(),
    read: false,
    icon: "User",
    action: "/"
  },
  {
    id: 1001,
    title: "Low Stock Alert",
    message: "4 items are running low on stock",
    time: new Date(Date.now() - 30 * 60000).toLocaleString(), // 30 minutes ago
    read: false,
    icon: "Package",
    action: "/?section=recommendations"
  },
  {
    id: 1002,
    title: "New Order Received",
    message: "Order #1234 needs processing",
    time: new Date(Date.now() - 60 * 60000).toLocaleString(), // 1 hour ago
    read: false,
    icon: "ShoppingCart",
    action: "/orders?status=pending"
  }
];

// Default users for demo
export const defaultUsers = [
  {
    id: "1",
    email: "admin@ctech.com",
    password: "admin123",
    full_name: "Admin User",
    role: "admin",
    status: "active",
    password_reset_required: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    email: "demo@ctech.com",
    password: "demo123",
    full_name: "Demo User",
    role: "staff",
    status: "active",
    password_reset_required: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Initialize default data for new users
export const initializeDefaultData = () => {
  // Check if notifications already exist
  if (!localStorage.getItem("notifications")) {
    localStorage.setItem("notifications", JSON.stringify(defaultNotifications));
  }

  // Mock the users table in localStorage for demo purposes
  // In a real app, this would be in a database
  if (!localStorage.getItem("mock_users_table")) {
    localStorage.setItem("mock_users_table", JSON.stringify(defaultUsers));
  }
};
