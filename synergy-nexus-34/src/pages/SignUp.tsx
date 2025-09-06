import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast({
        title: "Terms Agreement Required",
        description: "Please agree to the Terms of Use and Privacy Policy to continue.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password, `${firstName} ${lastName}`);

      if (error) {
        toast({
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account."
        });
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
      <nav className="py-6">
        <div className="container flex items-center justify-between">
          <Link to="/" className="text-white font-semibold text-xl">
            SynergySphere
          </Link>
          <div className="flex items-center gap-8">
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
              <Button variant="ghost" className="text-white font-normal">Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container flex-grow flex items-center justify-center py-12">
        <motion.div 
          className="w-full max-w-md mx-auto space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-semibold text-white">Create an account</h1>
            <Link to="/login" className="text-[#7C3AED] text-sm hover:text-[#6D28D9] inline-block">
              log in instead
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="firstName" className="text-gray-300 text-sm">First name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="bg-black border-gray-800 text-white h-12 rounded-md"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="lastName" className="text-gray-300 text-sm">Last name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="bg-black border-gray-800 text-white h-12 rounded-md"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-gray-300 text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-black border-gray-800 text-white h-12 rounded-md"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-gray-300 text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-black border-gray-800 text-white h-12 rounded-md"
              />
            </div>

            <div className="flex items-start gap-3 mt-2">
              <Checkbox 
                id="terms" 
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1.5 border-gray-600"
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-400 leading-relaxed"
              >
                By checking an account, I agree to our{' '}
                <Link to="/terms" className="text-[#7C3AED] hover:text-[#6D28D9]">Terms of use</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-[#7C3AED] hover:text-[#6D28D9]">Privacy Policy</Link>
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white h-12 mt-8 rounded-md text-base font-medium" 
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create an account'}
            </Button>
          </form>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-800">
        <div className="container py-12 grid grid-cols-4 gap-8">
          {/* Company Banner */}
          <div className="col-span-1">
            <Link to="/" className="text-lg font-semibold text-white">SynergySphere</Link>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              Streamline your workflow and boost productivity
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="mb-4 text-sm font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/features" className="text-gray-400 hover:text-white">Features</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h3 className="mb-4 text-sm font-semibold text-white">Company</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-white">Careers</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Connect with us */}
          <div className="col-span-1">
            <h3 className="mb-4 text-sm font-semibold text-white">Connect with us</h3>
            <ul className="space-y-2.5 text-sm">
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

export default SignUp;
