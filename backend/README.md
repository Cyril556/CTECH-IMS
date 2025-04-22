# C TECH IMS Backend API

This directory contains the backend API for the C TECH Inventory Management System.

## API Endpoints

### Health Check
- `GET /api/health` - Check if the API is running

### Inventory
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/:id` - Get a specific inventory item
- `POST /api/inventory` - Create a new inventory item
- `PUT /api/inventory/:id` - Update an inventory item
- `DELETE /api/inventory/:id` - Delete an inventory item

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get a specific supplier
- `POST /api/suppliers` - Create a new supplier
- `PUT /api/suppliers/:id` - Update a supplier
- `DELETE /api/suppliers/:id` - Delete a supplier

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get a specific order
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id` - Update an order
- `DELETE /api/orders/:id` - Delete an order

### Dashboard
- `GET /api/dashboard/summary` - Get summary statistics for the dashboard

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration.

4. Start the development server:
   ```
   npm run dev
   ```

## Deployment to Render

### Prerequisites
- A [Render](https://render.com) account
- Git repository with your code

### Steps to Deploy

1. Log in to your Render account

2. Click on "New" and select "Web Service"

3. Connect your GitHub repository

4. Configure the service:
   - **Name**: c-tech-ims-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free (or select a paid plan for production)

5. Add environment variables:
   - Click on "Environment" and add all variables from your `.env` file

6. Click "Create Web Service"

7. Wait for the deployment to complete

8. Your API will be available at the URL provided by Render

## Connecting Frontend to Backend

Update your frontend to use the deployed API URL:

```javascript
// Example in frontend code
const API_URL = 'https://your-render-api-url.onrender.com';

// Fetch inventory
const fetchInventory = async () => {
  const response = await fetch(`${API_URL}/api/inventory`);
  const data = await response.json();
  return data;
};
```

## Development

For local development, you can run the backend and frontend separately:

1. Start the backend:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```
   cd frontend
   npm run dev
   ```

The backend will run on http://localhost:5000 and the frontend will run on http://localhost:8080.
