
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

// Initialize default data for new users
export const initializeDefaultData = () => {
  // Check if notifications already exist
  if (!localStorage.getItem("notifications")) {
    localStorage.setItem("notifications", JSON.stringify(defaultNotifications));
  }
};
