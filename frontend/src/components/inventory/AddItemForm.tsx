
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { AddItemFormProps } from "./AddItemFormProps";
import { fetchSuppliers, fetchSupplierProducts, supabase } from "@/lib/supabase";
import { Tables } from "@/types/Database.types";

const categories = ["Electronics", "Accessories", "Audio", "Storage", "Other"];

interface Supplier {
  id: string;
  name: string;
}

interface SupplierProduct {
  id: string;
  product_name: string;
  price: number;
  description?: string;
  supplier_id: string;
}

const AddItemForm = ({ onSuccess, editMode = false, itemData }: AddItemFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: editMode && itemData ? itemData.name : "",
    sku: editMode && itemData ? itemData.sku : "",
    category: editMode && itemData && itemData.categories ? itemData.categories.name : "",
    stock: editMode && itemData ? String(itemData.stock) : "",
    price: editMode && itemData ? String(itemData.price) : "",
    supplier_id: editMode && itemData ? itemData.supplier_id || "" : "",
    product_id: "",
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SupplierProduct | null>(null);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const data = await fetchSuppliers();
        setSuppliers(data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    
    loadSuppliers();
  }, []);

  useEffect(() => {
    const loadSupplierProducts = async () => {
      if (formData.supplier_id) {
        try {
          const data = await fetchSupplierProducts(formData.supplier_id);
          setSupplierProducts(data);
        } catch (error) {
          console.error("Error fetching supplier products:", error);
        }
      } else {
        setSupplierProducts([]);
      }
    };
    
    loadSupplierProducts();
  }, [formData.supplier_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSupplierChange = (value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      supplier_id: value,
      // Reset product selection when supplier changes
      product_id: "" 
    }));
    setSelectedProduct(null);
  };

  const handleProductChange = (value: string) => {
    const product = supplierProducts.find(p => p.id === value);
    if (product) {
      setSelectedProduct(product);
      setFormData((prev) => ({ 
        ...prev, 
        product_id: value,
        name: product.product_name,
        price: String(product.price)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create a new inventory item
      const itemToSave = {
        name: formData.name,
        sku: formData.sku,
        category_id: formData.category, // This would need to be updated to use actual category ID
        stock: parseInt(formData.stock),
        price: parseFloat(formData.price),
        supplier_id: formData.supplier_id || null,
      };

      let savedItem;
      
      if (editMode && itemData) {
        // Update existing item
        const { data, error } = await supabase
          .from("inventory_items")
          .update(itemToSave)
          .eq("id", itemData.id)
          .select();
        
        if (error) throw error;
        savedItem = data?.[0];
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from("inventory_items")
          .insert(itemToSave)
          .select();
        
        if (error) throw error;
        savedItem = data?.[0];
        
        // Create corresponding order if it's a new item
        if (savedItem) {
          const orderNumber = `ORD-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
          
          const { error: orderError } = await supabase
            .from("orders")
            .insert({
              order_number: orderNumber,
              supplier_id: formData.supplier_id,
              items_count: 1,
              total_amount: parseFloat(formData.price),
              status: "Pending"
            });
          
          if (orderError) {
            console.error("Error creating order:", orderError);
          }
        }
      }
      
      toast({
        title: editMode ? "Item Updated" : "Item Added",
        description: `${formData.name} has been ${editMode ? "updated" : "added"} to inventory.`,
      });
  
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form if not editing
      if (!editMode) {
        setFormData({
          name: "",
          sku: "",
          category: "",
          stock: "",
          price: "",
          supplier_id: "",
          product_id: "",
        });
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error("Error saving item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${editMode ? "update" : "add"} item. Please try again.`,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          <Select 
            value={formData.supplier_id} 
            onValueChange={handleSupplierChange}
          >
            <SelectTrigger id="supplier">
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {formData.supplier_id && (
          <div className="space-y-2">
            <Label htmlFor="product">Supplier Product</Label>
            <Select 
              value={formData.product_id} 
              onValueChange={handleProductChange}
            >
              <SelectTrigger id="product">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {supplierProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.product_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter product name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            name="sku"
            placeholder="Enter SKU"
            value={formData.sku}
            onChange={handleChange}
            required
            readOnly={editMode} // Don't allow changing SKU when editing
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select 
            value={formData.category} 
            onValueChange={handleCategoryChange}
            required
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock Quantity</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            placeholder="Enter quantity"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price ($)</Label>
        <Input
          id="price"
          name="price"
          type="number"
          placeholder="Enter price"
          value={formData.price}
          onChange={handleChange}
          step="0.01"
          min="0"
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit">{editMode ? "Update" : "Add"} Item</Button>
      </div>
    </form>
  );
};

export default AddItemForm;
