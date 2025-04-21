
import { Users, Activity, Package } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tables } from "@/types/Database.types";

type Supplier = Tables<'suppliers'>;
type SupplierProduct = Tables<'supplier_products'>;

interface SupplierStatsProps {
  suppliers: Supplier[];
  supplierProducts: SupplierProduct[];
}

export function SupplierStats({ suppliers, supplierProducts }: SupplierStatsProps) {
  const activeSuppliers = suppliers.filter(s => s.status.toLowerCase() === "active").length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{suppliers.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
          <Activity className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSuppliers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{supplierProducts.length}</div>
        </CardContent>
      </Card>
    </div>
  );
}
