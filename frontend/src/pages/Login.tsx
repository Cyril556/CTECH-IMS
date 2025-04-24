
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Info, ArrowRight, ShieldCheck, Lock, PackageCheck, ShoppingCart, Users, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { initializeDefaultData } from "@/utils/defaultData";
import { Separator } from "@/components/ui/separator";
import { login } from "@/lib/auth";

// Demo credentials
const DEMO_STAFF_EMAIL = "demo@ctech.com";
const DEMO_STAFF_PASSWORD = "demo123";
const DEMO_ADMIN_EMAIL = "admin@ctech.com";
const DEMO_ADMIN_PASSWORD = "admin123";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
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
    setLoginError("");

    try {
      // Initialize default data for new users (in a real app, this would be done on the server)
      initializeDefaultData();

      // Authenticate user with our auth service
      const user = await login(email, password);

      // Show success toast
      toast({
        title: "Login successful",
        description: `Welcome to C TECH Inventory Management System${user.role === 'admin' ? ' (Admin)' : ''}`,
      });

      // Add login notification
      addLoginNotification(user.role);

      // Trigger custom event to update notifications in other components
      window.dispatchEvent(new Event("notificationsUpdated"));

      // Redirect to dashboard
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Invalid email or password. Try using the hint.");

      toast({
        title: "Login failed",
        description: "Invalid email or password. Try using the hint.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addLoginNotification = (role: string) => {
    // Get existing notifications from localStorage
    const existingNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");

    // Add new notification
    const newNotification = {
      id: Date.now(),
      title: "New Login",
      message: `Login detected from ${email} (${role})`,
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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Brand section */}
      <div className="bg-c-tech-red md:w-1/2 p-8 flex flex-col justify-center items-center text-white">
        <div className="max-w-md mx-auto text-center">
          <h1 className="formula1 text-5xl font-bold mb-4">C TECH</h1>
          <h2 className="text-2xl font-light mb-6">Inventory Management System</h2>
          <p className="text-white/80 mb-8">
            Streamline your inventory operations with our comprehensive management solution.
            Track products, manage suppliers, and optimize your supply chain.
          </p>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/10 p-4 rounded-lg">
              <PackageCheck className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Inventory Tracking</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Order Management</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Supplier Relations</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <BarChart3 className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Analytics & Reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="md:w-1/2 bg-white p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 rounded-full bg-c-tech-red/10 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-c-tech-red" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {loginError && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <div className="flex gap-2 text-xs">
                      <div
                        className="text-blue-600 flex items-center cursor-pointer group gap-1"
                        onClick={() => setEmail(DEMO_STAFF_EMAIL)}
                      >
                        <Info className="h-3 w-3" />
                        <span className="underline-offset-2 group-hover:underline">Staff</span>
                      </div>
                      <div
                        className="text-c-tech-red flex items-center cursor-pointer group gap-1"
                        onClick={() => setEmail(DEMO_ADMIN_EMAIL)}
                      >
                        <ShieldCheck className="h-3 w-3" />
                        <span className="underline-offset-2 group-hover:underline">Admin</span>
                      </div>
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
                    <div className="flex gap-2 text-xs">
                      <div
                        className="text-blue-600 flex items-center cursor-pointer group gap-1"
                        onClick={() => setPassword(DEMO_STAFF_PASSWORD)}
                      >
                        <Info className="h-3 w-3" />
                        <span className="underline-offset-2 group-hover:underline">Staff</span>
                      </div>
                      <div
                        className="text-c-tech-red flex items-center cursor-pointer group gap-1"
                        onClick={() => setPassword(DEMO_ADMIN_PASSWORD)}
                      >
                        <ShieldCheck className="h-3 w-3" />
                        <span className="underline-offset-2 group-hover:underline">Admin</span>
                      </div>
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
                    className="w-full h-11 shadow-sm bg-c-tech-red hover:bg-c-tech-red/90 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? "Authenticating..." : "Sign In"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </div>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col pt-4">
              <Separator className="mb-4" />
              <p className="text-xs text-center text-muted-foreground">
                This is a demo application. Use the provided credentials to login.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
