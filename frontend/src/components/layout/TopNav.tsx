
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  CheckCircle,
  AlarmClock,
  Package,
  ShoppingCart,
  LogOut,
  Search,
  Shield,
  FileText,
  Settings,
  UserCog
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { isAdmin, logout } from "@/lib/auth";

interface TopNavProps {
  toggleSidebar: () => void;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  action: string;
}

const getModuleName = (pathname: string): string => {
  switch (pathname) {
    case "/":
      return "Dashboard";
    case "/inventory":
      return "Inventory";
    case "/orders":
      return "Orders";
    case "/suppliers":
      return "Suppliers";
    case "/reports":
      return "Reports";
    default:
      return "";
  }
};

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "Package":
      return Package;
    case "ShoppingCart":
      return ShoppingCart;
    case "AlarmClock":
      return AlarmClock;
    case "User":
      return User;
    default:
      return Bell;
  }
};

const TopNav = ({ toggleSidebar }: TopNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const moduleName = getModuleName(location.pathname);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const loadNotifications = () => {
      try {
        const storedNotifications = localStorage.getItem("notifications");
        if (storedNotifications) {
          setNotifications(JSON.parse(storedNotifications));
        }
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };

    loadNotifications();

    window.addEventListener("storage", loadNotifications);
    window.addEventListener("notificationsUpdated", loadNotifications);

    return () => {
      window.removeEventListener("storage", loadNotifications);
      window.removeEventListener("notificationsUpdated", loadNotifications);
    };
  }, []);

  const handleNotificationClick = (notification: Notification, index: number) => {
    if (!notification.read) {
      const updatedNotifications = [...notifications];
      updatedNotifications[index].read = true;
      setNotifications(updatedNotifications);
      localStorage.setItem("notifications", JSON.stringify(updatedNotifications));

      window.dispatchEvent(new Event("notificationsUpdated"));
    }

    navigate(notification.action);
  };

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));

    window.dispatchEvent(new Event("notificationsUpdated"));

    toast("All notifications marked as read");
  };

  const handleLogout = async () => {
    try {
      // Add logout notification
      const newNotification = {
        id: Date.now(),
        title: "Logged Out",
        message: "You have been logged out successfully",
        time: new Date().toLocaleString(),
        read: false,
        icon: "User",
        action: "/login"
      };

      const updatedNotifications = [newNotification, ...notifications];
      localStorage.setItem("notifications", JSON.stringify(updatedNotifications));

      // Use the auth service to log out
      await logout();

      toast("Logged out successfully");

      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast("Error logging out. Please try again.");
    }
  };

  const getUser = () => {
    try {
      const userJson = localStorage.getItem("user");
      if (userJson) {
        return JSON.parse(userJson);
      }
      return { email: "user@ctech.com", role: "staff" };
    } catch (error) {
      return { email: "user@ctech.com", role: "staff" };
    }
  };

  const user = getUser();
  const userEmail = user.email;
  const userRole = user.role;
  const userInitials = userEmail.substring(0, 2).toUpperCase();
  const isUserAdmin = isAdmin();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <h1 className="formula1 text-xl font-bold text-c-tech-red hidden md:block">C TECH</h1>
          {moduleName && (
            <div className="hidden sm:block pl-4 ml-4 border-l border-gray-200">
              <h2 className="font-semibold text-gray-800 text-lg">{moduleName}</h2>
            </div>
          )}
        </div>



        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full w-9 h-9 hover:bg-gray-100"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] text-xs text-white bg-c-tech-red rounded-full px-1 border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2">
              <DropdownMenuLabel className="flex items-center justify-between px-4 py-2">
                <span className="text-base">Notifications</span>
                <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={handleMarkAllAsRead}>
                  Mark all as read
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length > 0 ? (
                  <>
                    {notifications.map((notification, index) => {
                      const IconComponent = getIconComponent(notification.icon);
                      return (
                        <DropdownMenuItem
                          key={notification.id}
                          className={`flex flex-col items-start p-3 cursor-pointer ${notification.read ? '' : 'bg-gray-50'}`}
                          onClick={() => handleNotificationClick(notification, index)}
                        >
                          <div className="flex w-full">
                            <div className={`p-2 rounded-full ${notification.read ? 'bg-gray-100' : 'bg-c-tech-red/10'} mr-3`}>
                              <IconComponent className={`h-4 w-4 ${notification.read ? 'text-gray-500' : 'text-c-tech-red'}`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-c-tech-red rounded-full self-start mt-2" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No new notifications</p>
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex justify-center text-sm text-c-tech-red font-medium py-2"
                    onClick={() => navigate("/notifications")}
                  >
                    View all notifications
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full overflow-hidden border border-gray-200"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder.svg" alt="Avatar" />
                  <AvatarFallback className="bg-c-tech-red/10 text-c-tech-red font-medium">{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="font-medium">My Account</span>
                    {isUserAdmin && (
                      <Badge variant="destructive" className="ml-2 px-1.5 py-0 h-5">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">{userEmail}</span>
                </div>
              </DropdownMenuLabel>
              {isUserAdmin && (
                <>
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Admin Controls
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate("/user-management")} className="cursor-pointer">
                    <UserCog className="mr-2 h-4 w-4" />
                    <span>User Management</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/audit-log")} className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Audit Log</span>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-c-tech-red cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopNav;

import { Settings } from "lucide-react";
