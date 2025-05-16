
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { useToast } from "../components/ui/use-toast";
import AuthLayout from "../components/layouts/Auth-layout";
import axios from "axios";
import { BACKEND_URL } from "../config";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try{
      const res = await axios.post(`${BACKEND_URL}/user/signup`, formData);
      if (res.status === 200) {
        localStorage.setItem("token", `Bearer ${res.data.token}`);
        toast({
          title: "Account created",
          description: "We've created your account for you.",
        });
        setIsLoading(false);
        navigate("/dashboard");
      };
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "An error occurred while creating your account.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md px-4 animate-fade-in">
        <Card className="glass-card shadow-xl border-white/10 hover:border-white/20 transition-all duration-300">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between pb-6">
              <Link to="/" className="flex items-center text-sm hover:text-white transition-colors group">
                <ChevronLeft size={16} className="mr-1 group-hover:transform group-hover:-translate-x-1 transition-transform" />
                Back to home
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription className="text-white/60">
              Enter your information to get started
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  className="bg-white/5 border-white/10 text-white focus:border-white focus:ring-white placeholder:text-white/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="bg-white/5 border-white/10 text-white focus:border-white focus:ring-white placeholder:text-white/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    className="bg-white/5 border-white/10 text-white focus:border-white focus:ring-white pr-10 placeholder:text-white/30"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-white hover:bg-white/90 text-black transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
              <p className="text-sm text-white/60">
                Already have an account?{" "}
                <Link to="/signin" className="text-white hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AuthLayout>
  );
};

export default SignUp;