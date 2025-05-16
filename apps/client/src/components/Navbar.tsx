
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/70 backdrop-blur-lg border-b border-white/10" : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-4 py-5 flex justify-between items-center">
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <a href="#" className="text-2xl font-bold text-white">
            River<span className="text-gradient">Side</span>
          </a>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <motion.div 
            className="flex items-center space-x-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-white transition-colors">
              Features
            </a>
            <a href="#use-cases" className="text-sm text-muted-foreground hover:text-white transition-colors">
              Use Cases
            </a>
          </motion.div>

          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white/20 hover:bg-white/10"
            >
              Log In
            </Button>
            <Button 
              size="sm" 
              className="bg-white text-background hover:bg-white/90"
            >
              Get Started
            </Button>
          </motion.div>
        </div>

        {/* Mobile Menu Button */}
        <motion.div 
          className="md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white"
          >
            <div className="w-6 flex flex-col items-center justify-center gap-1.5">
              <span className={`block h-0.5 w-full bg-current transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-full bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-full bg-current transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </Button>
        </motion.div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-card/95 backdrop-blur-lg border-b border-white/10"
          >
            <div className="container mx-auto px-4 py-5 flex flex-col space-y-4">
              <a 
                href="#how-it-works" 
                className="text-white/90 hover:text-white py-2 transition-colors text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a 
                href="#features" 
                className="text-white/90 hover:text-white py-2 transition-colors text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#use-cases" 
                className="text-white/90 hover:text-white py-2 transition-colors text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Use Cases
              </a>
              <div className="flex flex-col space-y-3 pt-2">
                <Button variant="outline" className="w-full border-white/20">Log In</Button>
                <Button className="w-full bg-white text-background hover:bg-white/90">Get Started</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
