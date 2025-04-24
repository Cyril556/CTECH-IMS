
import { Mail, MapPin, Phone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { Tables } from "@/types/Database.types";
import SupplierStatusToggle from "./SupplierStatusToggle";
import { deleteSupplier } from "@/lib/supabase";
import { useState } from "react";

type Supplier = Tables<'suppliers'>;
type SupplierProduct = Tables<'supplier_products'>;

interface SuppliersTableProps {
  suppliers: Supplier[];
  supplierProducts: SupplierProduct[];
  onStatusChange: (supplierId: string, newStatus: string) => void;
  onSupplierClick: (supplier: Supplier) => void;
  onDeleteSuccess?: () => void;
}

export function SuppliersTable({
  suppliers,
  supplierProducts,
  onStatusChange,
  onSupplierClick,
  onDeleteSuccess,
}: SuppliersTableProps) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-200 text-gray-700">Inactive</Badge>;
      case "pending":
        return <Badge className="bg-orange-100 text-orange-700">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };



  const handleDeleteClick = (e: React.MouseEvent, supplierId: string) => {
    e.stopPropagation();
    setSupplierToDelete(supplierId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;

    try {
      await deleteSupplier(supplierToDelete);

      toast({
        title: "Supplier Deleted",
        description: "Supplier has been successfully removed.",
      });

      // Call the onDeleteSuccess callback if provided
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem deleting the supplier. Please try again.",
      });
    }

    setDeleteDialogOpen(false);
    setSupplierToDelete(null);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Supplier</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow
              key={supplier.id}
              className="cursor-pointer"
              onClick={() => navigate(`/suppliers/${supplier.id}`)}
            >
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell>{supplier.contact_person}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-3 w-3" />
                    <span>{supplier.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-3 w-3" />
                    <span>{supplier.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-3 w-3" />
                    <span>{supplier.address}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(supplier.status)}</TableCell>
              <TableCell>
                {supplierProducts.filter(p => p.supplier_id === supplier.id).length}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <SupplierStatusToggle
                    supplierId={supplier.id}
                    initialStatus={supplier.status}
                    onStatusChange={(newStatus) => onStatusChange(supplier.id, newStatus)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteClick(e, supplier.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the supplier
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
