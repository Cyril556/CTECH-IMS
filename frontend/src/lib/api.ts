// API service for connecting to the backend on Render
import { API_URL } from '@/config';

// Inventory API functions
export const fetchInventoryItems = async () => {
  try {
    const response = await fetch(`${API_URL}/api/inventory`);
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    throw error;
  }
};

export const fetchInventoryItem = async (id: number) => {
  try {
    const response = await fetch(`${API_URL}/api/inventory/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching inventory item ${id}:`, error);
    throw error;
  }
};

export const createInventoryItem = async (item: any) => {
  try {
    const response = await fetch(`${API_URL}/api/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
};

export const updateInventoryItem = async (id: number, item: any) => {
  try {
    const response = await fetch(`${API_URL}/api/inventory/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error updating inventory item ${id}:`, error);
    throw error;
  }
};

export const deleteInventoryItem = async (id: number) => {
  try {
    const response = await fetch(`${API_URL}/api/inventory/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error deleting inventory item ${id}:`, error);
    throw error;
  }
};

// Suppliers API functions
export const fetchSuppliers = async () => {
  try {
    const response = await fetch(`${API_URL}/api/suppliers`);
    const data = await response.json();
    return data.suppliers || [];
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    throw error;
  }
};

export const fetchSupplier = async (id: number) => {
  try {
    const response = await fetch(`${API_URL}/api/suppliers/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching supplier ${id}:`, error);
    throw error;
  }
};

export const createSupplier = async (supplier: any) => {
  try {
    const response = await fetch(`${API_URL}/api/suppliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supplier),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating supplier:', error);
    throw error;
  }
};

export const updateSupplier = async (id: number, supplier: any) => {
  try {
    const response = await fetch(`${API_URL}/api/suppliers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supplier),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error updating supplier ${id}:`, error);
    throw error;
  }
};

export const deleteSupplier = async (id: number) => {
  try {
    const response = await fetch(`${API_URL}/api/suppliers/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error deleting supplier ${id}:`, error);
    throw error;
  }
};

// Orders API functions
export const fetchOrders = async () => {
  try {
    const response = await fetch(`${API_URL}/api/orders`);
    const data = await response.json();
    return data.orders || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const fetchOrder = async (id: number) => {
  try {
    const response = await fetch(`${API_URL}/api/orders/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};

export const createOrder = async (order: any) => {
  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrder = async (id: number, order: any) => {
  try {
    const response = await fetch(`${API_URL}/api/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error updating order ${id}:`, error);
    throw error;
  }
};

export const deleteOrder = async (id: number) => {
  try {
    const response = await fetch(`${API_URL}/api/orders/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error deleting order ${id}:`, error);
    throw error;
  }
};

// Dashboard API functions
export const fetchDashboardSummary = async () => {
  try {
    const response = await fetch(`${API_URL}/api/dashboard/summary`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
};

// Health check function
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API health check failed:', error);
    throw error;
  }
};
