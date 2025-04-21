-- C TECH Inventory Management System Database Schema

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(50) UNIQUE,
  category VARCHAR(100),
  price DECIMAL(10, 2),
  cost DECIMAL(10, 2),
  quantity INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data
INSERT INTO products (name, description, sku, category, price, cost, quantity, reorder_level)
VALUES 
  ('Racing Wheel', 'Professional racing wheel for simulators', 'RW-001', 'Accessories', 299.99, 180.00, 15, 5),
  ('Carbon Fiber Spoiler', 'Lightweight carbon fiber spoiler', 'CFS-100', 'Body Parts', 599.99, 350.00, 8, 3),
  ('Performance Brake Kit', 'High-performance brake system', 'PBK-200', 'Brakes', 899.99, 550.00, 5, 2);

INSERT INTO suppliers (name, contact_name, email, phone, address)
VALUES 
  ('LH44 Racing Supplies', 'Lewis Hamilton', 'lewis@lh44racing.com', '555-123-4567', '44 Champion Road, Monaco'),
  ('VER1 Performance Parts', 'Max Verstappen', 'max@ver1performance.com', '555-987-6543', '1 Bull Street, Netherlands'),
  ('Ferrari Aftermarket', 'Charles Leclerc', 'charles@ferrariparts.com', '555-789-1234', '16 Maranello Ave, Monaco');
