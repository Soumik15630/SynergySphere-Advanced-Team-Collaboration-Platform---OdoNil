import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          title: "Login Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to SynergySphere."
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Navigation */}
      <nav className="py-4">
        <div className="container flex items-center justify-between">
          <Link to="/" className="text-white font-semibold text-xl">
            SynergySphere
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-300 hover:text-white text-sm">
              Home
            </Link>
            <Link to="/solutions" className="text-gray-300 hover:text-white text-sm">
              Solutions
            </Link>
            <Link to="/work" className="text-gray-300 hover:text-white text-sm">
              Work
            </Link>
            <Link to="/about" className="text-gray-300 hover:text-white text-sm">
              About
            </Link>
            <Link to="/login">
              <Button variant="ghost" className="text-white">Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container flex-grow flex items-center">
        <motion.div 
          className="w-full max-w-md mx-auto space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Login into account</h1>
            <Link to="/signup" className="inline-block text-[#7C3AED] text-sm hover:text-[#6D28D9]">
              signup instead
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-black border-gray-800 text-white h-12"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-red-500 hover:text-red-400"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black border-gray-800 text-white h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white h-12" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Login'}
            </Button>
          </form>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-800">
        <div className="container py-6 grid grid-cols-4">
          {/* Company Banner */}
          <div className="col-span-1">
            <Link to="/" className="text-lg font-bold text-white">SynergySphere</Link>
            <p className="mt-2 text-sm text-gray-400">
              Streamline your workflow and boost productivity
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="mb-3 text-sm font-semibold text-white">Quick Links</h3>
            <ul className="space-y-1.5 text-sm">
              <li><Link to="/features" className="text-gray-400 hover:text-white">Features</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h3 className="mb-3 text-sm font-semibold text-white">Company</h3>
            <ul className="space-y-1.5 text-sm">
              <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-white">Careers</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Connect with us */}
          <div className="col-span-1">
            <h3 className="mb-3 text-sm font-semibold text-white">Connect with us</h3>
            <ul className="space-y-1.5 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white">Twitter</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">LinkedIn</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">GitHub</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
