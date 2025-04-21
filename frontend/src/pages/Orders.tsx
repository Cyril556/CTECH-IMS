
import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { fetchOrders, updateOrderStatus } from "@/lib/supabase";
import { Tables } from "@/types/Database.types";

// Status types
const statuses = ["All", "Completed", "Processing", "Pending", "Cancelled"];

// Define the Order type that extends the base Tables type with the joined suppliers data
type Order = {
  id: string;
  order_number: string;
  supplier_id: string;
  status: string;
  items_count: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
  suppliers?: {
    id: string;
    name: string;
  } | null;
};

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedSupplier, setSelectedSupplier] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 5;
  
  // State for order detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [confirmActionDialog, setConfirmActionDialog] = useState<{
    open: boolean;
    action: 'complete' | 'cancel' | null;
    orderId: string | null;
  }>({
    open: false,
    action: null,
    orderId: null
  });

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const data = await fetchOrders();
        setOrders(data as Order[]);
        
        // Extract unique suppliers
        const uniqueSuppliers = Array.from(
          new Set(data.map(order => order.suppliers?.name || "Unknown"))
        );
        setSuppliers(["All", ...uniqueSuppliers]);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading orders:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load orders. Please try again."
        });
        setIsLoading(false);
      }
    };
    
    loadOrders();
  }, []);

  // Filter orders based on search query, status, and supplier
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (order.suppliers?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "All" || order.status === selectedStatus;
    const matchesSupplier = selectedSupplier === "All" || order.suppliers?.name === selectedSupplier;
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // Status badge and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "Completed":
        return { 
          class: "bg-green-100 text-green-800", 
          icon: <CheckCircle className="h-4 w-4 mr-1 text-green-800" /> 
        };
      case "Processing":
        return { 
          class: "bg-yellow-100 text-yellow-800", 
          icon: <Clock className="h-4 w-4 mr-1 text-yellow-800" /> 
        };
      case "Pending":
        return { 
          class: "bg-blue-100 text-blue-800", 
          icon: <AlertCircle className="h-4 w-4 mr-1 text-blue-800" /> 
        };
      case "Cancelled":
        return { 
          class: "bg-red-100 text-red-800", 
          icon: <XCircle className="h-4 w-4 mr-1 text-red-800" /> 
        };
      default:
        return { class: "", icon: null };
    }
  };

  // View order details
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Mark order as completed
  const handleMarkAsCompleted = (orderId: string) => {
    setConfirmActionDialog({
      open: true,
      action: 'complete',
      orderId
    });
  };

  // Cancel order
  const handleCancelOrder = (orderId: string) => {
    setConfirmActionDialog({
      open: true,
      action: 'cancel',
      orderId
    });
  };

  // Confirm action
  const confirmAction = async () => {
    if (!confirmActionDialog.orderId || !confirmActionDialog.action) return;
    
    try {
      const newStatus = confirmActionDialog.action === 'complete' ? 'Completed' : 'Cancelled';
      await updateOrderStatus(confirmActionDialog.orderId, newStatus);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.id === confirmActionDialog.orderId) {
            return {
              ...order,
              status: newStatus
            };
          }
          return order;
        })
      );
      
      toast({
        title: confirmActionDialog.action === 'complete' ? "Order Completed" : "Order Cancelled",
        description: `Order has been ${confirmActionDialog.action === 'complete' ? 'marked as completed' : 'cancelled'}.`
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status. Please try again."
      });
    }

    setConfirmActionDialog({ open: false, action: null, orderId: null });
  };

  const handleExportData = () => {
    // Create CSV content
    const headers = ["Order ID", "Date", "Supplier", "Items", "Total", "Status"];
    const rows = filteredOrders.map(order => [
      order.order_number,
      new Date(order.created_at).toLocaleDateString(),
      order.suppliers?.name || "Unknown",
      order.items_count,
      `$${order.total_amount.toFixed(2)}`,
      order.status
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders_export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Export Complete",
      description: "Orders data has been exported to CSV.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
        <Button onClick={handleExportData}>Export Data</Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search by order ID or supplier..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Loading orders data...</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.length > 0 ? (
                      paginatedOrders.map((order) => {
                        const statusInfo = getStatusInfo(order.status);
                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.order_number}</TableCell>
                            <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>{order.suppliers?.name || "Unknown"}</TableCell>
                            <TableCell className="text-right">{order.items_count}</TableCell>
                            <TableCell className="text-right">${order.total_amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge className={statusInfo.class}>
                                <div className="flex items-center">
                                  {statusInfo.icon}
                                  {order.status}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    Actions
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  {order.status !== "Completed" && order.status !== "Cancelled" && (
                                    <DropdownMenuItem onClick={() => handleMarkAsCompleted(order.id)}>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Mark as Completed
                                    </DropdownMenuItem>
                                  )}
                                  {order.status !== "Cancelled" && order.status !== "Completed" && (
                                    <DropdownMenuItem onClick={() => handleCancelOrder(order.id)}>
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Cancel Order
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No orders found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm">
                    Page {currentPage} of {totalPages || 1}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information about order {selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                  <p>{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p>{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Supplier</p>
                  <p>{selectedOrder.suppliers?.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={getStatusInfo(selectedOrder.status).class}>
                    <div className="flex items-center">
                      {getStatusInfo(selectedOrder.status).icon}
                      {selectedOrder.status}
                    </div>
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Items</p>
                  <p>{selectedOrder.items_count}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p>${selectedOrder.total_amount.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="pt-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Order Actions</p>
                <div className="flex gap-2">
                  {selectedOrder.status !== "Completed" && selectedOrder.status !== "Cancelled" && (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowOrderDetails(false);
                          handleMarkAsCompleted(selectedOrder.id);
                        }}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Completed
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowOrderDetails(false);
                          handleCancelOrder(selectedOrder.id);
                        }}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Order
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Confirm Action Dialog */}
      <Dialog open={confirmActionDialog.open} onOpenChange={(open) => 
        setConfirmActionDialog(prev => ({ ...prev, open }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmActionDialog.action === 'complete' 
                ? 'Mark Order as Completed' 
                : 'Cancel Order'
              }
            </DialogTitle>
            <DialogDescription>
              {confirmActionDialog.action === 'complete'
                ? `Are you sure you want to mark this order as completed?`
                : `Are you sure you want to cancel this order?`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => 
              setConfirmActionDialog({ open: false, action: null, orderId: null })
            }>
              Cancel
            </Button>
            <Button 
              variant={confirmActionDialog.action === 'cancel' ? "destructive" : "default"}
              onClick={confirmAction}
            >
              {confirmActionDialog.action === 'complete' ? 'Complete Order' : 'Cancel Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
