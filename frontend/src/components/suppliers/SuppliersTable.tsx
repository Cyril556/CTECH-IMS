
import { Mail, MapPin, Phone, Star, Trash2 } from "lucide-react";
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
import { Tables } from "@/types/Database.types";
import SupplierStatusToggle from "./SupplierStatusToggle";

type Supplier = Tables<'suppliers'>;
type SupplierProduct = Tables<'supplier_products'>;

interface SuppliersTableProps {
  suppliers: Supplier[];
  supplierProducts: SupplierProduct[];
  onStatusChange: (supplierId: string, newStatus: string) => void;
  onSupplierClick: (supplier: Supplier) => void;
}

export function SuppliersTable({
  suppliers,
  supplierProducts,
  onStatusChange,
  onSupplierClick,
}: SuppliersTableProps) {
  const navigate = useNavigate();

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

  const getRatingStars = (rating: number | null) => {
    if (rating === null) return "Not rated";
    const fullStars = Math.floor(rating);
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    
    return <div className="flex">{stars}</div>;
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
            <TableHead>Rating</TableHead>
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
              <TableCell>{getRatingStars(supplier.rating)}</TableCell>
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
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
