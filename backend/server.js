const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Sample data (in a real app, this would come from a database)
const inventoryItems = [
  { id: 1, name: 'Racing Wheel', sku: 'RW-001', category: 'Accessories', quantity: 15, price: 299.99, status: 'in-stock' },
  { id: 2, name: 'Carbon Fiber Spoiler', sku: 'CFS-100', category: 'Body Parts', quantity: 8, price: 599.99, status: 'in-stock' },
  { id: 3, name: 'Performance Brake Kit', sku: 'PBK-200', category: 'Brakes', quantity: 5, price: 899.99, status: 'low-stock' },
  { id: 4, name: 'LED Headlight Set', sku: 'LHS-300', category: 'Lighting', quantity: 0, price: 450.00, status: 'out-of-stock' }
];

const suppliers = [
  { id: 1, name: 'LH44 Racing Supplies', contact_person: 'Lewis Hamilton', email: 'lewis@lh44racing.com', phone: '555-123-4567', status: 'active' },
  { id: 2, name: 'VER1 Performance Parts', contact_person: 'Max Verstappen', email: 'max@ver1performance.com', phone: '555-987-6543', status: 'active' },
  { id: 3, name: 'Ferrari Aftermarket', contact_person: 'Charles Leclerc', email: 'charles@ferrariparts.com', phone: '555-789-1234', status: 'inactive' }
];

const orders = [
  { id: 1, order_number: 'ORD-2025-001', customer_name: 'Toto Wolff', status: 'completed', total_amount: 1499.95, order_date: '2025-04-01T10:30:00Z' },
  { id: 2, order_number: 'ORD-2025-002', customer_name: 'Christian Horner', status: 'processing', total_amount: 2199.98, order_date: '2025-04-15T14:45:00Z' },
  { id: 3, order_number: 'ORD-2025-003', customer_name: 'Zak Brown', status: 'pending', total_amount: 899.99, order_date: '2025-04-20T09:15:00Z' }
];

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'C TECH IMS API is running' });
});

// Inventory endpoints
app.get('/api/inventory', (req, res) => {
  res.json({ items: inventoryItems });
});

app.get('/api/inventory/:id', (req, res) => {
  const item = inventoryItems.find(item => item.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json(item);
});

app.post('/api/inventory', (req, res) => {
  const { name, sku, category, quantity, price } = req.body;

  // Validate required fields
  if (!name || !sku || !category) {
    return res.status(400).json({ error: 'Name, SKU, and category are required' });
  }

  // Check if SKU already exists
  if (inventoryItems.some(item => item.sku === sku)) {
    return res.status(400).json({ error: 'SKU already exists' });
  }

  // Create new item
  const newItem = {
    id: inventoryItems.length > 0 ? Math.max(...inventoryItems.map(item => item.id)) + 1 : 1,
    name,
    sku,
    category,
    quantity: quantity || 0,
    price: price || 0,
    status: quantity > 10 ? 'in-stock' : quantity > 0 ? 'low-stock' : 'out-of-stock'
  };

  inventoryItems.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/inventory/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = inventoryItems.findIndex(item => item.id === id);

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const { name, sku, category, quantity, price } = req.body;

  // Update item
  const updatedItem = {
    ...inventoryItems[itemIndex],
    name: name || inventoryItems[itemIndex].name,
    sku: sku || inventoryItems[itemIndex].sku,
    category: category || inventoryItems[itemIndex].category,
    quantity: quantity !== undefined ? quantity : inventoryItems[itemIndex].quantity,
    price: price !== undefined ? price : inventoryItems[itemIndex].price
  };

  // Update status based on quantity
  updatedItem.status = updatedItem.quantity > 10 ? 'in-stock' : updatedItem.quantity > 0 ? 'low-stock' : 'out-of-stock';

  inventoryItems[itemIndex] = updatedItem;
  res.json(updatedItem);
});

app.delete('/api/inventory/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = inventoryItems.findIndex(item => item.id === id);

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const deletedItem = inventoryItems.splice(itemIndex, 1)[0];
  res.json({ message: 'Item deleted successfully', item: deletedItem });
});

// Suppliers endpoints
app.get('/api/suppliers', (req, res) => {
  res.json({ suppliers });
});

app.get('/api/suppliers/:id', (req, res) => {
  const supplier = suppliers.find(supplier => supplier.id === parseInt(req.params.id));
  if (!supplier) {
    return res.status(404).json({ error: 'Supplier not found' });
  }
  res.json(supplier);
});

app.post('/api/suppliers', (req, res) => {
  const { name, contact_person, email, phone, status } = req.body;

  // Validate required fields
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Check if email already exists
  if (suppliers.some(supplier => supplier.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  // Create new supplier
  const newSupplier = {
    id: suppliers.length > 0 ? Math.max(...suppliers.map(supplier => supplier.id)) + 1 : 1,
    name,
    contact_person: contact_person || '',
    email,
    phone: phone || '',
    status: status || 'active'
  };

  suppliers.push(newSupplier);
  res.status(201).json(newSupplier);
});

app.put('/api/suppliers/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const supplierIndex = suppliers.findIndex(supplier => supplier.id === id);

  if (supplierIndex === -1) {
    return res.status(404).json({ error: 'Supplier not found' });
  }

  const { name, contact_person, email, phone, status } = req.body;

  // Update supplier
  const updatedSupplier = {
    ...suppliers[supplierIndex],
    name: name || suppliers[supplierIndex].name,
    contact_person: contact_person !== undefined ? contact_person : suppliers[supplierIndex].contact_person,
    email: email || suppliers[supplierIndex].email,
    phone: phone !== undefined ? phone : suppliers[supplierIndex].phone,
    status: status || suppliers[supplierIndex].status
  };

  suppliers[supplierIndex] = updatedSupplier;
  res.json(updatedSupplier);
});

app.delete('/api/suppliers/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const supplierIndex = suppliers.findIndex(supplier => supplier.id === id);

  if (supplierIndex === -1) {
    return res.status(404).json({ error: 'Supplier not found' });
  }

  const deletedSupplier = suppliers.splice(supplierIndex, 1)[0];
  res.json({ message: 'Supplier deleted successfully', supplier: deletedSupplier });
});

// Orders endpoints
app.get('/api/orders', (req, res) => {
  res.json({ orders });
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(order => order.id === parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

app.post('/api/orders', (req, res) => {
  const { customer_name, customer_email, items } = req.body;

  // Validate required fields
  if (!customer_name || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Customer name and at least one item are required' });
  }

  // Calculate total amount
  let total_amount = 0;
  for (const item of items) {
    const inventoryItem = inventoryItems.find(invItem => invItem.id === item.id);
    if (!inventoryItem) {
      return res.status(400).json({ error: `Item with ID ${item.id} not found` });
    }
    if (item.quantity > inventoryItem.quantity) {
      return res.status(400).json({ error: `Not enough stock for item ${inventoryItem.name}` });
    }
    total_amount += inventoryItem.price * item.quantity;
  }

  // Generate order number
  const orderDate = new Date();
  const orderNumber = `ORD-${orderDate.getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;

  // Create new order
  const newOrder = {
    id: orders.length > 0 ? Math.max(...orders.map(order => order.id)) + 1 : 1,
    order_number: orderNumber,
    customer_name,
    customer_email: customer_email || '',
    status: 'pending',
    total_amount,
    order_date: orderDate.toISOString()
  };

  orders.push(newOrder);

  // Update inventory quantities
  for (const item of items) {
    const inventoryItem = inventoryItems.find(invItem => invItem.id === item.id);
    inventoryItem.quantity -= item.quantity;
    inventoryItem.status = inventoryItem.quantity > 10 ? 'in-stock' : inventoryItem.quantity > 0 ? 'low-stock' : 'out-of-stock';
  }

  res.status(201).json(newOrder);
});

app.put('/api/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const orderIndex = orders.findIndex(order => order.id === id);

  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { customer_name, customer_email, status } = req.body;

  // Update order
  const updatedOrder = {
    ...orders[orderIndex],
    customer_name: customer_name || orders[orderIndex].customer_name,
    customer_email: customer_email !== undefined ? customer_email : orders[orderIndex].customer_email,
    status: status || orders[orderIndex].status
  };

  orders[orderIndex] = updatedOrder;
  res.json(updatedOrder);
});

app.delete('/api/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const orderIndex = orders.findIndex(order => order.id === id);

  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const deletedOrder = orders.splice(orderIndex, 1)[0];
  res.json({ message: 'Order deleted successfully', order: deletedOrder });
});

// Dashboard summary endpoint
app.get('/api/dashboard/summary', (req, res) => {
  const lowStockItems = inventoryItems.filter(item => item.status === 'low-stock').length;
  const outOfStockItems = inventoryItems.filter(item => item.status === 'out-of-stock').length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const processingOrders = orders.filter(order => order.status === 'processing').length;

  res.json({
    inventory: {
      total: inventoryItems.length,
      lowStock: lowStockItems,
      outOfStock: outOfStockItems
    },
    orders: {
      total: orders.length,
      pending: pendingOrders,
      processing: processingOrders
    },
    suppliers: {
      total: suppliers.length,
      active: suppliers.filter(s => s.status === 'active').length,
      inactive: suppliers.filter(s => s.status === 'inactive').length
    }
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to C TECH IMS API' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
