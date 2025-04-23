import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/types/Database.types';

// Re-export the supabase client
export { supabase };

// Inventory API functions
export const fetchInventoryItems = async () => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select(`
      *,
      categories:category_id(id, name),
      suppliers:supplier_id(id, name)
    `);

  if (error) {
    console.error('Error fetching inventory items:', error);
    throw error;
  }

  return data || [];
};

export const deleteInventoryItem = async (id: string) => {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }

  return true;
};

// Categories API functions
export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*');

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data || [];
};

// Suppliers API functions
export const fetchSuppliers = async () => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*');

  if (error) {
    console.error('Error fetching suppliers:', error);
    throw error;
  }

  return data || [];
};

export const deleteSupplier = async (id: string) => {
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting supplier:', error);
    throw error;
  }

  return true;
};

// Supplier Products API functions
export const fetchSupplierProducts = async (supplierId?: string) => {
  let query = supabase.from('supplier_products').select('*');

  if (supplierId) {
    query = query.eq('supplier_id', supplierId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching supplier products:', error);
    throw error;
  }

  return data || [];
};

// Orders API functions
export const fetchOrders = async () => {
  // Modified this to use the generic type parameter since 'orders' is not in the Tables type constraint
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      suppliers:supplier_id(id, name)
    `);

  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }

  return data || [];
};

export const updateOrderStatus = async (id: string, status: string) => {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }

  return true;
};

export const fetchOrderSummary = async () => {
  // Fetch live summary stats for dashboard (pending, processing, completed, total)
  const { data, error } = await supabase
    .from('orders')
    .select('*');

  if (error) {
    console.error('Error fetching order summary:', error);
    throw error;
  }

  const totalOrders = data.length;
  const pendingOrders = data.filter(o => o.status === 'Pending').length;
  const processingOrders = data.filter(o => o.status === 'Processing').length;
  const completedTodayOrders = data.filter(o => {
    const completed = o.status === 'Completed';
    const today = new Date(o.updated_at).toDateString() === new Date().toDateString();
    return completed && today;
  }).length;

  return {
    totalOrders,
    pendingOrders,
    processingOrders,
    completedTodayOrders,
  };
};

// Reports API functions
export const fetchInventoryByCategory = async () => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select(`
      *,
      categories:category_id(id, name)
    `);

  if (error) {
    console.error('Error fetching inventory distribution:', error);
    throw error;
  }

  // Process data for chart display
  const categoryTotals: Record<string, number> = {};

  data?.forEach(item => {
    const categoryName = item.categories?.name || 'Uncategorized';
    if (!categoryTotals[categoryName]) {
      categoryTotals[categoryName] = 0;
    }
    categoryTotals[categoryName]++;
  });

  const processedData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value
  }));

  return processedData || [];
};

export const fetchInventorySummary = async () => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*');

  if (error) {
    console.error('Error fetching inventory summary:', error);
    throw error;
  }

  const totalItems = data.length;
  const lowStockItems = data.filter(item => item.stock > 0 && item.stock <= 10).length;
  const outOfStockItems = data.filter(item => item.stock <= 0).length;

  return {
    totalItems,
    lowStockItems,
    outOfStockItems
  };
};

export const fetchSupplierPerformance = async () => {
  const { data: suppliers, error: suppliersError } = await supabase
    .from('suppliers')
    .select('*')
    .eq('status', 'Active')
    .limit(3);

  if (suppliersError) {
    console.error('Error fetching suppliers:', suppliersError);
    throw suppliersError;
  }

  // Generate mock performance data since we don't have real metrics yet
  // In a real app, this would come from actual supplier performance data
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const mockPerformanceData = months.map(month => {
    const dataPoint: Record<string, string | number> = { month };
    suppliers?.forEach(supplier => {
      // Random on-time delivery percentage between 75 and 95
      dataPoint[supplier.name] = Math.floor(Math.random() * 20) + 75;
    });
    return dataPoint;
  });

  return {
    suppliers,
    performanceData: mockPerformanceData
  };
};

// Helper function to test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('inventory_items').select('count').single();
    if (error) throw error;
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};
