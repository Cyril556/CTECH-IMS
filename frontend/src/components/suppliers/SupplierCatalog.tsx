
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/types/Database.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { ShoppingCart, Plus, Minus, Package, Truck, ArrowLeft, ShoppingCart as ShoppingCartIcon, PackageCheck, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Supplier = Tables<'suppliers'>;
type SupplierProduct = Tables<'supplier_products'>;

const SupplierCatalog: React.FC = () => {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate cart totals
  const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return sum + (product?.price || 0) * quantity;
  }, 0);

  // Update cart quantity
  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart(prev => ({
      ...prev,
      [productId]: Math.max(0, quantity)
    }));
  };

  // Increment quantity
  const incrementQuantity = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  // Decrement quantity
  const decrementQuantity = (productId: string) => {
    setCart(prev => {
      const currentQty = prev[productId] || 0;
      if (currentQty <= 1) {
        const newCart = { ...prev };
        delete newCart[productId];
        return newCart;
      }
      return {
        ...prev,
        [productId]: currentQty - 1
      };
    });
  };

  const openCheckout = () => {
    if (cartItemCount === 0) {
      toast({
        variant: 'destructive',
        title: 'Empty Cart',
        description: 'Please add items to your cart before checkout'
      });
      return;
    }
    setIsCheckoutOpen(true);
  };

  const createOrder = async () => {
    setIsSubmitting(true);

    try {
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
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          supplier_id: supplierId,
          order_number: orderNumber,
          status: 'Pending',
          total_amount: totalAmount,
          items_count: orderItems.reduce((sum, item) => sum + item.quantity, 0)
        })
        .select('id')
        .single();

      if (orderError) {
        throw new Error('Failed to create order');
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
        throw new Error('Failed to add order items');
      }

      toast({
        title: 'Order Created',
        description: `Order ${orderNumber} created successfully`
      });

      // Clear cart and close checkout dialog
      setCart({});
      setIsCheckoutOpen(false);

      // Navigate to orders page
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create order'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!supplier) return <div className="flex justify-center items-center h-64">Loading supplier details...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/suppliers')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Suppliers
          </Button>
          <h1 className="text-2xl font-bold">{supplier.name} Catalog</h1>
          {supplier.status === 'Active' ? (
            <Badge className="bg-green-100 text-green-700">Active</Badge>
          ) : (
            <Badge className="bg-gray-200 text-gray-700">Inactive</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="relative"
            onClick={openCheckout}
            disabled={cartItemCount === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart
            {cartItemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-c-tech-red text-white h-5 w-5 flex items-center justify-center p-0 rounded-full">
                {cartItemCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-gray-500 mt-2">
            {searchQuery ? 'Try a different search term' : 'This supplier has no products yet'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{product.product_name}</CardTitle>
                <CardDescription>
                  {product.description || 'No description available'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between items-center">
                  <p className="text-2xl font-bold">${product.price?.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Per Unit</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                {cart[product.id] ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => decrementQuantity(product.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{cart[product.id]}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => incrementQuantity(product.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => incrementQuantity(product.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>
              Review your order from {supplier.name} before submitting.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Product</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Price</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Qty</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {Object.entries(cart)
                    .filter(([_, qty]) => qty > 0)
                    .map(([productId, quantity]) => {
                      const product = products.find(p => p.id === productId);
                      if (!product) return null;
                      return (
                        <tr key={productId}>
                          <td className="px-4 py-3 text-sm">{product.product_name}</td>
                          <td className="px-4 py-3 text-sm text-right">${product.price?.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-right">{quantity}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            ${(product.price * quantity).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-sm font-medium text-right">Total:</td>
                    <td className="px-4 py-3 text-sm font-bold text-right">${cartTotal.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Truck className="h-4 w-4" />
              <span>Order will be processed and sent to {supplier.name} for fulfillment.</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={createOrder}
              disabled={isSubmitting || cartItemCount === 0}
              className="bg-c-tech-red hover:bg-c-tech-red/90"
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierCatalog;
