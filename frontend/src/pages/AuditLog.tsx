import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  Clock, 
  User, 
  Shield, 
  FileText,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { getAuditLogs, isAdmin } from "@/lib/auth";
import { Tables } from "@/types/Database.types";

type AuditLog = Tables<'audit_logs'> & {
  users?: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
  target_users?: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
};

const AuditLog = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (!isAdmin()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [navigate]);

  // Fetch audit logs on component mount
  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Filter logs when search query or event type filter changes
  useEffect(() => {
    let filtered = logs;

    // Apply event type filter
    if (eventTypeFilter !== "all") {
      filtered = filtered.filter(log => log.event_type === eventTypeFilter);
    }

    // Apply search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => {
        const userEmail = log.users?.email?.toLowerCase() || "";
        const targetUserEmail = log.target_users?.email?.toLowerCase() || "";
        const eventType = log.event_type.toLowerCase();
        
        return (
          userEmail.includes(query) ||
          targetUserEmail.includes(query) ||
          eventType.includes(query)
        );
      });
    }

    setFilteredLogs(filtered);
  }, [searchQuery, eventTypeFilter, logs]);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const data = await getAuditLogs(100); // Get the last 100 logs
      setLogs(data);
      setFilteredLogs(data);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch audit logs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case "user_login":
        return "Login";
      case "user_logout":
        return "Logout";
      case "user_creation":
        return "User Created";
      case "user_status_update":
        return "Status Updated";
      case "password_reset_forced":
        return "Password Reset";
      default:
        return eventType.replace(/_/g, " ");
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case "user_login":
        return <User className="h-4 w-4" />;
      case "user_logout":
        return <User className="h-4 w-4" />;
      case "user_creation":
        return <Shield className="h-4 w-4" />;
      case "user_status_update":
        return <RefreshCw className="h-4 w-4" />;
      case "password_reset_forced":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getEventTypeVariant = (eventType: string): "default" | "outline" | "secondary" | "destructive" => {
    switch (eventType) {
      case "user_login":
        return "default";
      case "user_logout":
        return "secondary";
      case "user_creation":
        return "outline";
      case "user_status_update":
        return "secondary";
      case "password_reset_forced":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getUniqueEventTypes = () => {
    const eventTypes = new Set<string>();
    logs.forEach(log => eventTypes.add(log.event_type));
    return Array.from(eventTypes);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Audit Log</h2>
        <Button onClick={fetchAuditLogs} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
          <CardDescription>
            View a log of important system events and user activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search logs..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-[200px]">
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by event" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {getUniqueEventTypes().map(eventType => (
                    <SelectItem key={eventType} value={eventType}>
                      {getEventTypeLabel(eventType)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading audit logs...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-gray-400" />
                          <span>{formatDateTime(log.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEventTypeVariant(log.event_type)}>
                          {getEventTypeIcon(log.event_type)}
                          <span className="ml-1">{getEventTypeLabel(log.event_type)}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.users ? (
                          <div className="flex flex-col">
                            <span>{log.users.email}</span>
                            {log.users.full_name && (
                              <span className="text-xs text-gray-500">{log.users.full_name}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.target_users ? (
                          <div className="flex flex-col">
                            <span>{log.target_users.email}</span>
                            {log.target_users.full_name && (
                              <span className="text-xs text-gray-500">{log.target_users.full_name}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.details ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <FileText className="h-4 w-4" />
                                  <span className="ml-1">View</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <pre className="text-xs whitespace-pre-wrap">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLog;
