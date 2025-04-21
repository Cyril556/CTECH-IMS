
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PackageCheck, ShoppingCart, Users, Activity, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useState } from "react";
import { fetchInventorySummary, fetchOrderSummary, fetchSuppliers } from "@/lib/supabase";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const showRecommendations = searchParams.get("section") === "recommendations";

  // Dynamic stats state
  const [inventoryStats, setInventoryStats] = useState({
    lowStockItems: 0,
    outOfStockItems: 0,
    totalItems: 0,
  });
  const [orderStats, setOrderStats] = useState({
    pendingOrders: 0,
    processingOrders: 0,
    completedTodayOrders: 0,
    totalOrders: 0,
  });
  const [supplierStats, setSupplierStats] = useState({
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    if (showRecommendations) {
      const recommendationsSection = document.getElementById("recommendations");
      if (recommendationsSection) {
        recommendationsSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [showRecommendations]);

  // Fetch dashboard dynamic stats on mount
  useEffect(() => {
    async function fetchAllStats() {
      const inv = await fetchInventorySummary();
      setInventoryStats(inv);

      const orders = await fetchOrderSummary();
      setOrderStats(orders);

      // Fetch suppliers from Supabase (not /api/suppliers) for dashboard counts
      const all = await fetchSuppliers();
      setSupplierStats({
        active: all.filter(s => String(s.status).toLowerCase() === "active").length,
        inactive: all.filter(s => String(s.status).toLowerCase() === "inactive").length,
      });

      // LH44 product check (dev/demo: log)
      const LH44 = all.find(s => s.name === "LH44");
      if (LH44) {
        console.log("LH44 supplier found, id:", LH44.id);
        // In actual deployment, DB population of products for LH44 should be handled by admin.
        // Here, you could call a seed function or instruct user to add via UI.
      }
    }
    fetchAllStats();
  }, []);

  const quickActions = [
    { title: "Manage Inventory", icon: PackageCheck, path: "/inventory", description: "Check stock levels and add new products" },
    { title: "Process Orders", icon: ShoppingCart, path: "/orders", description: "View and fulfill customer orders" },
    { title: "Supplier Management", icon: Users, path: "/suppliers", description: "Manage your product suppliers" },
    { title: "View Reports", icon: BarChart3, path: "/reports", description: "Analytics and performance metrics" }
  ];
  
  const recommendedActions = [
    {
      title: "Low Stock Items",
      description: "4 products need reordering",
      icon: AlertTriangle, 
      path: "/inventory?filter=low_stock",
      variant: "warning"
    },
    {
      title: "Pending Orders",
      description: "3 orders require processing",
      icon: ShoppingCart,
      path: "/orders?status=pending",
      variant: "default"
    },
    {
      title: "Supplier Review",
      description: "2 suppliers are due for performance review",
      icon: Users,
      path: "/suppliers?status=review",
      variant: "default"
    }
  ];
  
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to C TECH Inventory Management</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Your complete solution for managing inventory, orders, and suppliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Quick access to all your tools and metrics in one place.</p>
        </CardContent>
      </Card>

      {/* Recommended Actions */}
      <div id="recommendations" className="space-y-3">
        <h2 className="text-xl font-semibold">Recommended Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {recommendedActions.map((action, index) => (
            <Card key={index} className={`border-l-4 ${action.variant === "warning" ? "border-l-yellow-500" : "border-l-primary"} transition-all hover:shadow-md`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  {action.title}
                  <action.icon className={`h-5 w-5 ${action.variant === "warning" ? "text-yellow-500" : "text-primary"}`} />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="text-sm text-gray-700">{action.description}</CardDescription>
                <Link to={action.path}>
                  <Button variant="outline" size="sm" className="w-full">
                    Take Action
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Quick Access</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <Link to={action.path} key={index}>
              <Card className="h-full transition-all hover:border-primary hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{action.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats/Activity Section */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Current Status</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>Inventory Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Low Stock Items</span>
                  <span className="text-yellow-500 font-medium">{inventoryStats.lowStockItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Out of Stock</span>
                  <span className="text-red-500 font-medium">{inventoryStats.outOfStockItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Products</span>
                  <span className="font-medium">{inventoryStats.totalItems}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Recent Orders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="text-yellow-500 font-medium">{orderStats.pendingOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing</span>
                  <span className="text-blue-500 font-medium">{orderStats.processingOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed Today</span>
                  <span className="text-green-500 font-medium">{orderStats.completedTodayOrders}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Supplier Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Suppliers</span>
                  <span className="text-green-500 font-medium">{supplierStats.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inactive Suppliers</span>
                  <span className="text-gray-500 font-medium">{supplierStats.inactive}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

