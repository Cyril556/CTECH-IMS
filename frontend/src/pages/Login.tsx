
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Info, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { initializeDefaultData } from "@/utils/defaultData";
import { Separator } from "@/components/ui/separator";

// Demo credentials
const DEMO_EMAIL = "demo@ctech.com";
const DEMO_PASSWORD = "demo123";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in on page load
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user && JSON.parse(user).isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, we would validate and authenticate with Supabase
      // For this demo, we're just checking against hardcoded credentials
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        // Initialize default data for new users
        initializeDefaultData();
        
        // Simulate successful login
        localStorage.setItem("user", JSON.stringify({ email, isLoggedIn: true }));
        
        // Show success toast
        toast({
          title: "Login successful",
          description: "Welcome to C TECH Inventory Management System",
        });
        
        // Add login notification
        addLoginNotification();
        
        // Trigger custom event to update notifications in other components
        window.dispatchEvent(new Event("notificationsUpdated"));
        
        // Redirect to dashboard
        navigate("/");
      } else {
        // Show error toast for invalid credentials
        toast({
          title: "Login failed",
          description: "Invalid email or password. Try using the hint.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addLoginNotification = () => {
    // Get existing notifications from localStorage
    const existingNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
    
    // Add new notification
    const newNotification = {
      id: Date.now(),
      title: "New Login",
      message: `Login detected from ${email}`,
      time: new Date().toLocaleString(),
      read: false,
      icon: "User",
      action: "/?section=account"
    };
    
    // Save to localStorage
    localStorage.setItem("notifications", 
      JSON.stringify([newNotification, ...existingNotifications])
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-50 to-white p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="formula1 text-4xl font-bold text-c-tech-red">C TECH</h1>
          <p className="text-gray-500 mt-2">Inventory Management System</p>
        </div>

        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 pb-0">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div 
                    className="text-xs text-c-tech-red flex items-center cursor-pointer group gap-1"
                    onClick={() => setEmail(DEMO_EMAIL)}
                  >
                    <Info className="h-3 w-3" />
                    <span className="underline-offset-2 group-hover:underline">Use: {DEMO_EMAIL}</span>
                  </div>
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div 
                    className="text-xs text-c-tech-red flex items-center cursor-pointer group gap-1"
                    onClick={() => setPassword(DEMO_PASSWORD)}
                  >
                    <Info className="h-3 w-3" />
                    <span className="underline-offset-2 group-hover:underline">Use: {DEMO_PASSWORD}</span>
                  </div>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-11 shadow-sm bg-c-tech-red hover:bg-c-tech-red/90 flex items-center gap-2" 
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col pt-6">
            <Separator className="mb-4" />
            <p className="text-xs text-center text-muted-foreground">
              This is a demo application. Use the provided credentials to login.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
