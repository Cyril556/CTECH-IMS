
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Inventory", icon: Package, path: "/inventory" },
    { name: "Orders", icon: ShoppingCart, path: "/orders" },
    { name: "Suppliers", icon: Users, path: "/suppliers" },
    { name: "Reports", icon: BarChart3, path: "/reports" },
  ];

  return (
    <div
      className={cn(
        "bg-white shadow-md border-r border-gray-100 flex flex-col h-full transition-all duration-300 z-30",
        isOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <Link to="/" className={cn("flex items-center", isOpen ? "justify-start" : "justify-center w-full")}>
          {isOpen ? (
            <h1 className="formula1 text-2xl font-bold text-c-tech-red tracking-tight">C TECH</h1>
          ) : (
            <h1 className="formula1 text-2xl font-bold text-c-tech-red">CT</h1>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className={cn("text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100", !isOpen && "hidden")}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={toggleSidebar}
          className={cn("text-gray-500 hover:text-gray-700 w-full flex justify-center p-1 rounded-full hover:bg-gray-100", isOpen && "hidden")}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              {isOpen ? (
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center p-2 rounded-lg transition-all",
                    location.pathname === item.path
                      ? "bg-c-tech-red text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  <span className="ml-3 font-medium">{item.name}</span>
                </Link>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center justify-center p-2 rounded-lg transition-all",
                          location.pathname === item.path
                            ? "bg-c-tech-red text-white shadow-sm"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <item.icon size={20} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
