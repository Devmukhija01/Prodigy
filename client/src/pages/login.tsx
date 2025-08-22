import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "../../../server/context/Authcontext"; 
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // const onSubmit = async (data: FormData) => {
  //   setIsLoading(true);
  
  //   try {
  //     const response = await axios.post("http://https://prodigy-59mg.onrender.com/api/login", {
  //       email: data.email,
  //       password: data.password,
  //     }, {
  //       withCredentials: true
  //     });
  
  //     const token = response.data?.token || "fake-token";
  //     login(token);
  
  //     // ✅ Safe and logged storage
  //     const userId = response.data?.user?._id;
  //     if (userId && userId.length === 24) {
  //       localStorage.setItem("userId", userId);
  //       console.log("✅ userId saved to localStorage:", userId);
  //     } else {
  //       console.warn("⚠️ Invalid userId received:", userId);
  //       toast({
  //         title: "Login Warning",
  //         description: "Invalid user ID received from server. Some features may not work.",
  //         variant: "destructive"
  //       });
  //     }

  //     // ✅ Store user data including avatar
  //     const userData = response.data?.user;
  //     if (userData) {
  //       // Add additional fields that might be missing
  //       const completeUserData = {
  //         ...userData,
  //         id: userData._id, // Ensure id field exists
  //         registerId: response.data?.registerId // Add registerId from response
  //       };
  //       localStorage.setItem("userData", JSON.stringify(completeUserData));
      
  //     // Dispatch custom event to notify other components about login
  //     window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { userId } }));
  //     }
  
  //     navigate("/");
  
  //     toast({
  //       title: "Login Successful 🎉",
  //       description: "Welcome to SocialConnect Pro!",
  //     });
  
  //   } catch (err: any) {
  //     if (err.response) {
  //       alert("❌ " + err.response.data.message);
  //     } else {
  //       alert("❌ Login failed. Try again.");
  //     }
  //   }
  
  //   setIsLoading(false);
  // };
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
  
    try {
      const response = await axios.post("http://https://prodigy-59mg.onrender.com/api/login", {
        email: data.email,
        password: data.password,
      }, {
        withCredentials: true
      });
  
      const token = response.data?.token || "fake-token";
      login(token);
  
      // ✅ Store token persistently for Chat
      localStorage.setItem("authToken", token);
  
      // ✅ Safe and logged storage
      const userId = response.data?.user?._id;
      if (userId && userId.length === 24) {
        localStorage.setItem("userId", userId);
        console.log("✅ userId saved to localStorage:", userId);
      }
  
      // ✅ Store user data including avatar
      const userData = response.data?.user;
      if (userData) {
        const completeUserData = {
          ...userData,
          id: userData._id,
          registerId: response.data?.registerId
        };
        localStorage.setItem("userData", JSON.stringify(completeUserData));
  
        // Notify chat system
        window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { userId } }));
      }
  
      navigate("/chats"); // 👈 redirect to chat after login
  
      toast({
        title: "Login Successful 🎉",
        description: "Welcome to SocialConnect Pro!",
      });
  
    } catch (err: any) {
      if (err.response) {
        alert("❌ " + err.response.data.message);
      } else {
        alert("❌ Login failed. Try again.");
      }
    }
  
    setIsLoading(false);
  };
  
  return (
    <div className="min-h-screen flex">
      {/* Left Section - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-400">Sign in to your SocialConnect Pro account</p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Enter your email"
                              className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Remember me
                      </label>
                    </div>
                    <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Don't have an account?{" "}
                      <Link to="/register" className="text-blue-600 hover:text-blue-500 font-semibold">
                        Sign up
                      </Link>
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Section - 3D Animation */}
      <div className="flex-1 bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            {/* Floating circles */}
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
            
            {/* Geometric shapes */}
            <div className="absolute top-20 right-20 w-32 h-32 border-2 border-white/20 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
            <div className="absolute bottom-20 left-20 w-24 h-24 border-2 border-white/20 rotate-45 animate-pulse" />
            <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-white/20 transform rotate-12 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>

          {/* Main Content */}
          <div className="relative z-10 text-center text-white px-12 max-w-lg">
            <div className="mb-8">
              {/* 3D-style logo/icon */}
              <div className="inline-block p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-white to-white/80 rounded-xl flex items-center justify-center transform rotate-12 shadow-lg">
                  <div className="text-indigo-600 font-bold text-2xl">PGY</div>
                </div>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-6 leading-tight">
            Streamline Your Task Management
            </h2>
            
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
            Join thousands of professionals who trust Prodigy to stay organized, collaborate with teams, and meet deadlines.
            </p>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="text-left">
                  <div className="font-semibold">Smart Task Lists</div>
                  <div className="text-sm text-white/80">Keep all your tasks organised</div>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="text-left">
                  <div className="font-semibold">Real-time Chat</div>
                  <div className="text-sm text-white/80">Collaborate with your team instantly</div>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="text-left">
                  <div className="font-semibold">Project Tracking</div>
                  <div className="text-sm text-white/80">Monitor progress and meet deadlines</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}