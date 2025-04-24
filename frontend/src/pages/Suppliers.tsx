
import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { SupplierStats } from "@/components/suppliers/SupplierStats";
import { SuppliersTable } from "@/components/suppliers/SuppliersTable";
import { SupplierProductsDialog } from "@/components/suppliers/SupplierProductsDialog";
import AddSupplierForm from "@/components/suppliers/AddSupplierForm";
import { fetchSuppliers, fetchSupplierProducts } from "@/lib/supabase";
import { Tables } from "@/types/Database.types";

type Supplier = Tables<'suppliers'>;
type SupplierProduct = Tables<'supplier_products'>;

const Suppliers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddSupplierDialog, setShowAddSupplierDialog] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showProductsDialog, setShowProductsDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const suppliersData = await fetchSuppliers();
        setSuppliers(suppliersData);

        const productsData = await fetchSupplierProducts();
        setSupplierProducts(productsData);

        toast({
          title: "Data Loaded",
          description: `Loaded ${suppliersData.length} suppliers successfully.`,
        });
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load supplier data. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);

  const handleStatusChange = (supplierId: string, newStatus: string) => {
    setSuppliers(suppliers.map(supplier =>
      supplier.id === supplierId
        ? { ...supplier, status: newStatus }
        : supplier
    ));
  };

  const handleViewProducts = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowProductsDialog(true);
  };

  return (
    <div className="space-y-6">
      <SupplierStats
        suppliers={suppliers}
        supplierProducts={supplierProducts}
      />

      <Card>
        <CardHeader>
          <CardTitle>Suppliers</CardTitle>
          <CardDescription>
            Manage your suppliers, add new partners, and track supplier performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <div className="relative flex-1 sm:w-64 sm:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search suppliers..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setShowAddSupplierDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Loading supplier data...</p>
            </div>
          ) : (
            <>
              <SuppliersTable
                suppliers={paginatedSuppliers}
                supplierProducts={supplierProducts}
                onStatusChange={handleStatusChange}
                onSupplierClick={handleViewProducts}
                onDeleteSuccess={() => {
                  fetchSuppliers().then(data => setSuppliers(data));
                  toast({
                    title: "Supplier Deleted",
                    description: "The supplier has been removed successfully."
                  });
                }}
              />

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredSuppliers.length)} of {filteredSuppliers.length} suppliers
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddSupplierDialog} onOpenChange={setShowAddSupplierDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>
              Fill in the form below to add a new supplier to your inventory management system.
            </DialogDescription>
          </DialogHeader>
          <AddSupplierForm
            onSuccess={() => {
              setShowAddSupplierDialog(false);
              fetchSuppliers().then(data => setSuppliers(data));
            }}
          />
        </DialogContent>
      </Dialog>

      <SupplierProductsDialog
        supplier={selectedSupplier}
        products={supplierProducts}
        open={showProductsDialog}
        onClose={() => setShowProductsDialog(false)}
      />
    </div>
  );
};

export default Suppliers;
