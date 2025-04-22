import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { checkApiHealth, fetchInventoryItems, fetchSuppliers, fetchOrders } from '@/lib/api';
import { API_URL } from '@/config';

const ApiTest = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const testApiHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await checkApiHealth();
      setHealthStatus(result);
    } catch (err) {
      setError('Failed to check API health. Make sure your backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const testInventoryApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchInventoryItems();
      setInventory(items);
    } catch (err) {
      setError('Failed to fetch inventory items.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const testSuppliersApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSuppliers();
      setSuppliers(data);
    } catch (err) {
      setError('Failed to fetch suppliers.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const testOrdersApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      setError('Failed to fetch orders.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
          <CardDescription>
            Test the connection to your backend API running on Render
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium">API URL:</p>
              <p className="text-sm text-muted-foreground">{API_URL}</p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md">
                {error}
              </div>
            )}

            {healthStatus && (
              <div className="bg-green-100 p-3 rounded-md">
                <p className="font-medium">Health Check Result:</p>
                <pre className="text-sm mt-2 bg-slate-100 p-2 rounded">
                  {JSON.stringify(healthStatus, null, 2)}
                </pre>
              </div>
            )}

            {inventory.length > 0 && (
              <div className="bg-blue-100 p-3 rounded-md">
                <p className="font-medium">Inventory Items:</p>
                <pre className="text-sm mt-2 bg-slate-100 p-2 rounded max-h-40 overflow-auto">
                  {JSON.stringify(inventory.slice(0, 3), null, 2)}
                  {inventory.length > 3 && '... (more items)'}
                </pre>
              </div>
            )}

            {suppliers.length > 0 && (
              <div className="bg-purple-100 p-3 rounded-md">
                <p className="font-medium">Suppliers:</p>
                <pre className="text-sm mt-2 bg-slate-100 p-2 rounded max-h-40 overflow-auto">
                  {JSON.stringify(suppliers.slice(0, 3), null, 2)}
                  {suppliers.length > 3 && '... (more items)'}
                </pre>
              </div>
            )}

            {orders.length > 0 && (
              <div className="bg-amber-100 p-3 rounded-md">
                <p className="font-medium">Orders:</p>
                <pre className="text-sm mt-2 bg-slate-100 p-2 rounded max-h-40 overflow-auto">
                  {JSON.stringify(orders.slice(0, 3), null, 2)}
                  {orders.length > 3 && '... (more items)'}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button onClick={testApiHealth} disabled={loading}>
            {loading ? 'Testing...' : 'Test Health Endpoint'}
          </Button>
          <Button onClick={testInventoryApi} disabled={loading} variant="outline">
            Test Inventory API
          </Button>
          <Button onClick={testSuppliersApi} disabled={loading} variant="outline">
            Test Suppliers API
          </Button>
          <Button onClick={testOrdersApi} disabled={loading} variant="outline">
            Test Orders API
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ApiTest;
