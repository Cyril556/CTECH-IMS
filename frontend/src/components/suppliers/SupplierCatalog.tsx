
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/types/Database.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

type Supplier = Tables<'suppliers'>;
type SupplierProduct = Tables<'supplier_products'>;

const SupplierCatalog: React.FC = () => {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [cart, setCart] = useState<{ [productId: string]: number }>({});

  useEffect(() => {
    const fetchSupplierDetails = async () => {
      if (!supplierId) return;

      const { data: supplierData, error: supplierError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', supplierId)
        .single();

      const { data: productsData, error: productsError } = await supabase
        .from('supplier_products')
        .select('*')
        .eq('supplier_id', supplierId);

      if (supplierError || productsError) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch supplier details'
        });
        return;
      }

      setSupplier(supplierData);
      setProducts(productsData || []);
    };

    fetchSupplierDetails();
  }, [supplierId]);

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart(prev => ({
      ...prev,
      [productId]: Math.max(0, quantity)
    }));
  };

  const createOrder = async () => {
    const orderItems = Object.entries(cart)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return {
          product_id: productId,
          product_name: product?.product_name || '',
          quantity,
          price: product?.price || 0
        };
      });

    if (orderItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Your cart is empty'
      });
      return;
    }

    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        supplier_id: supplierId,
        order_number: `ORD-${Date.now()}`,
        status: 'Pending',
        total_amount: totalAmount,
        items_count: orderItems.reduce((sum, item) => sum + item.quantity, 0)
      })
      .select('id')
      .single();

    if (orderError) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create order'
      });
      return;
    }

    const orderItemsToInsert = orderItems.map(item => ({
      order_id: orderData.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (orderItemsError) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add order items'
      });
      return;
    }

    toast({
      title: 'Order Created',
      description: `Order ${orderData.id} created successfully`
    });

    navigate('/orders');
  };

  if (!supplier) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{supplier.name} Catalog</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {products.map(product => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.product_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{product.description || 'No description available'}</p>
              <p className="font-bold">${product.price?.toLocaleString()}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  type="number"
                  min="0"
                  value={cart[product.id] || 0}
                  onChange={(e) => updateCartQuantity(product.id, Number(e.target.value))}
                  className="w-20"
                />
                <span>Qty</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={createOrder}>Create Order</Button>
      </div>
    </div>
  );
};

export default SupplierCatalog;
