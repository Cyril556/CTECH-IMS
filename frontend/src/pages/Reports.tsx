import { useState, useEffect } from "react";
import { 
  Calendar, 
  Download, 
  BarChart3, 
  PieChart, 
  LineChart as LineChartIcon,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { fetchInventoryByCategory, fetchSupplierPerformance } from "@/lib/supabase";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface CategoryData {
  name: string;
  value: number;
}

interface InsightItem {
  title: string;
  description: string;
  type: "warning" | "success" | "info";
}

interface ActionItem {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

interface SalesDataItem {
  month: string;
  sales: number;
  target: number;
}

interface SupplierPerformanceData {
  month: string;
  [key: string]: string | number;
}

interface Supplier {
  id: string;
  name: string;
}

interface SupplierPerformanceResult {
  suppliers: Supplier[];
  performanceData: SupplierPerformanceData[];
}

const Reports = () => {
  const [dateRange, setDateRange] = useState("last30days");
  const [activeTab, setActiveTab] = useState("overview");
  const [salesData, setSalesData] = useState<SalesDataItem[]>([]);
  const [inventoryData, setInventoryData] = useState<CategoryData[]>([]);
  const [supplierData, setSupplierData] = useState<SupplierPerformanceData[]>([]);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [dateRange, activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const inventoryDistribution = await fetchInventoryByCategory();
      const typedInventoryData: CategoryData[] = inventoryDistribution.map(item => ({
        name: item.name as string,
        value: Number(item.value)
      }));
      setInventoryData(typedInventoryData);

      const result = await fetchSupplierPerformance() as SupplierPerformanceResult;
      let filteredPerformanceData = [...result.performanceData];

      if (dateRange === "last7days") {
        filteredPerformanceData = filteredPerformanceData.slice(-2);
      } else if (dateRange === "last30days") {
        filteredPerformanceData = filteredPerformanceData.slice(-4);
      } else if (dateRange === "lastQuarter") {
        filteredPerformanceData = filteredPerformanceData.slice(-3);
      } else if (dateRange === "lastYear") {
        filteredPerformanceData = [...result.performanceData];
      }

      setSupplierData(filteredPerformanceData);

      let maxCategory: CategoryData = { name: "", value: 0 };
      typedInventoryData.forEach(category => {
        if (category.value > maxCategory.value) {
          maxCategory = category;
        }
      });

      const lowStockInsight: InsightItem = {
        title: `Low stock alert for ${typedInventoryData.length} products`,
        description: "Several products are running low on stock and may need reordering.",
        type: "warning",
      };

      const categoryInsight: InsightItem = {
        title: `${maxCategory.name} category has the most items`,
        description: "Consider diversifying your inventory across more categories.",
        type: "info",
      };

      const outOfStockInsight: InsightItem = {
        title: `Some items may be out of stock`,
        description: "Check your inventory for items that need immediate restocking.",
        type: "warning",
      };

      setInsights([lowStockInsight, categoryInsight, outOfStockInsight]);

      const newActions: ActionItem[] = [
        {
          title: "Review low stock items",
          description: "Several products are running low and may need reordering.",
          priority: "high",
        },
        {
          title: `Balance ${maxCategory.name} category inventory`,
          description: "This category may be overrepresented in your inventory.",
          priority: "medium",
        },
        {
          title: "Check supplier performance",
          description: "Some suppliers are showing less than optimal delivery times.",
          priority: "low",
        },
      ];

      setActions(newActions);

      let mockSalesData: SalesDataItem[] = [
        { month: "Jan", sales: 4000, target: 3000 },
        { month: "Feb", sales: 3000, target: 3000 },
        { month: "Mar", sales: 5000, target: 3500 },
        { month: "Apr", sales: 4500, target: 4000 },
        { month: "May", sales: 6000, target: 4500 },
        { month: "Jun", sales: 7000, target: 5000 },
        { month: "Jul", sales: 8000, target: 5500 },
        { month: "Aug", sales: 7500, target: 6000 },
        { month: "Sep", sales: 9000, target: 6500 },
        { month: "Oct", sales: 8500, target: 7000 },
        { month: "Nov", sales: 10000, target: 7500 },
        { month: "Dec", sales: 12000, target: 8000 },
      ];

      if (dateRange === "last7days") {
        mockSalesData = mockSalesData.slice(-2);
      } else if (dateRange === "last30days") {
        mockSalesData = mockSalesData.slice(-4);
      } else if (dateRange === "lastQuarter") {
        mockSalesData = mockSalesData.slice(-3);
      }

      setSalesData(mockSalesData);

      toast({
        title: "Report Data Loaded",
        description: "All report data has been successfully loaded.",
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-destructive";
      case "medium":
        return "bg-yellow-100 text-warning";
      case "low":
        return "bg-blue-100 text-primary";
      default:
        return "";
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "info":
        return <Info className="h-5 w-5 text-primary" />;
      default:
        return null;
    }
  };

  const handleExportData = () => {
    let dataToExport: any[] = [];
    let fileName = "report";

    if (activeTab === "overview") {
      dataToExport = salesData;
      fileName = "sales_report";
    } else if (activeTab === "inventory") {
      dataToExport = inventoryData;
      fileName = "inventory_distribution";
    } else if (activeTab === "suppliers") {
      dataToExport = supplierData;
      fileName = "supplier_performance";
    }

    if (dataToExport.length === 0) {
      toast({ title: "No data to export", description: "There is no data in this report tab." });
      return;
    }

    const headers = Object.keys(dataToExport[0]).join(',');
    const rows = dataToExport.map(item => Object.values(item).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_${dateRange}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast({
      title: "Export Complete",
      description: `Report data has been exported to ${fileName}_${dateRange}.csv`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="lastQuarter">Last quarter</SelectItem>
              <SelectItem value="lastYear">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading report data...</p>
        </div>
      ) : (
        <>
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">
                <BarChart3 className="mr-2 h-4 w-4" />
                Sales Overview
              </TabsTrigger>
              <TabsTrigger value="inventory">
                <PieChart className="mr-2 h-4 w-4" />
                Inventory Distribution
              </TabsTrigger>
              <TabsTrigger value="suppliers">
                <LineChartIcon className="mr-2 h-4 w-4" />
                Supplier Performance
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="sales" name="Sales ($)" fill="#3b82f6" />
                        <Bar dataKey="target" name="Target ($)" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="inventory" className="mt-6">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Inventory Distribution by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={inventoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {inventoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} items`, "Count"]} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="suppliers" className="mt-6">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Supplier Performance (On-time Delivery %)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={supplierData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[60, 100]} />
                        <Tooltip />
                        <Legend />
                        {supplierData.length > 0 && Object.keys(supplierData[0])
                          .filter(key => key !== 'month')
                          .map((supplier, index) => (
                            <Line
                              key={supplier}
                              type="monotone"
                              dataKey={supplier}
                              stroke={COLORS[index % COLORS.length]}
                              strokeWidth={2}
                            />
                          ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div key={index} className="flex space-x-4">
                      <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                      <div>
                        <h3 className="font-medium">{insight.title}</h3>
                        <p className="text-sm text-gray-500">{insight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover" id="recommended-actions">
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {actions.map((action, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <Zap className="h-5 w-5 mt-0.5 text-primary" />
                        <div>
                          <h3 className="font-medium">{action.title}</h3>
                          <p className="text-sm text-gray-500">{action.description}</p>
                        </div>
                      </div>
                      <Badge className={getPriorityClass(action.priority)}>
                        {action.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <Button variant="ghost" className="w-full justify-between">
                  View All Recommendations
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
