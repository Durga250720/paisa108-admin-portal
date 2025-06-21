
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Keep this import
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Eye, EyeOff } from 'lucide-react'; // Import Eye and EyeOff
import { useToast } from '@/hooks/use-toast';
import { config } from '@/config/environment'; // Import config for baseURL

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      email: username, // Assuming the 'username' field in the form is the email
      password: password,
    };

    try {
      const response = await fetch(config.baseURL + `admin-staff/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Attempt to parse error message from API if available
        let apiErrorMessage = "Invalid credentials or server error.";
        try {
          const errorData = await response.json();
          apiErrorMessage = errorData?.message || apiErrorMessage;
        } catch (parseError) {
          // If parsing error response fails, use a generic message
          console.error("Failed to parse error response:", parseError);
        }
        throw new Error(apiErrorMessage);
      }

      const responseData = await response.json();

      if (responseData) {
        localStorage.setItem('authToken', responseData.data.id);
        localStorage.setItem('username', responseData.data.name || username);

        toast({
          title: "Login Successful",
          description: "Welcome to Paisa108 Admin Dashboard",
          duration: 3000,
        });
        // navigate('/dashboard');
        navigate('/dashboard/applications')
      } else {
        // Handle cases where API responds with 200 OK but no token
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid response from server. Please try again.",
          duration: 3000,
        });
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <img 
            src="/paisa-108/main-logo.png"
            alt="Paisa108 Logo" 
            className="h-16 w-auto"
          />
        </div>

        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className={`text-xl font-normal text-gray-800 mb-2`}>Login</CardTitle>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Secure, simple, 100% paperless</span>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  User Name
                </Label>
                <input
                  id="username"
                  type="text"
                  placeholder="Please Enter Your User Name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="inputField"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative"> {/* Wrapper for input and icon */}
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'} // Toggle type based on state
                    placeholder="Please Enter Your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="inputField pl-10 pr-4" // Add padding-left for the icon
                    required
                  />
                  <button
                    type="button" // Important: prevent form submission
                    onClick={() => setShowPassword(!showPassword)} // Toggle visibility on click
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} {/* Conditional icon */}
                  </button>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 text-white font-normal text-sm transition-all duration-200 transform hover:scale-105"
                style={{
                  backgroundColor: 'var(--primary-color)',
                  color: 'white'
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
