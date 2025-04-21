
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tables } from "@/types/Database.types";

type Supplier = Tables<'suppliers'>;
type SupplierProduct = Tables<'supplier_products'>;

interface SupplierProductsDialogProps {
  supplier: Supplier | null;
  products: SupplierProduct[];
  open: boolean;
  onClose: () => void;
}

export function SupplierProductsDialog({
  supplier,
  products,
  open,
  onClose,
}: SupplierProductsDialogProps) {
  const supplierProducts = products.filter(
    (product) => product.supplier_id === supplier?.id
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center justify-between">
            <span>Products from {supplier?.name}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {supplierProducts.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.product_name}</TableCell>
                    <TableCell>{product.description || "No description"}</TableCell>
                    <TableCell>${product.price?.toFixed(2) || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center text-muted-foreground">
            No products available from this supplier
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
