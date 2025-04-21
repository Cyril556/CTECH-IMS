
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PackageCheck, ShoppingCart, Users, Activity } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const quickActions = [
    { title: "Manage Inventory", icon: PackageCheck, path: "/inventory", description: "Check stock levels and add new products" },
    { title: "Process Orders", icon: ShoppingCart, path: "/orders", description: "View and fulfill customer orders" },
    { title: "Supplier Management", icon: Users, path: "/suppliers", description: "Manage your product suppliers" },
    { title: "View Reports", icon: BarChart3, path: "/reports", description: "Analytics and performance metrics" }
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

      {/* Quick Access Grid */}
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

      {/* Stats/Activity Section */}
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
                <span className="text-yellow-500 font-medium">4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Out of Stock</span>
                <span className="text-red-500 font-medium">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Products</span>
                <span className="font-medium">127</span>
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
                <span className="text-yellow-500 font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing</span>
                <span className="text-blue-500 font-medium">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed Today</span>
                <span className="text-green-500 font-medium">8</span>
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
                <span className="text-green-500 font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inactive Suppliers</span>
                <span className="text-gray-500 font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending Review</span>
                <span className="text-blue-500 font-medium">2</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
