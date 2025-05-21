
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { MoveUpRight } from "lucide-react";
import { verifyToken } from "../utils/verifyToken";

const HeroSection = () => {
  
  return (
    <section className="relative min-h-screen pt-28 pb-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 hero-gradient"></div>
      <motion.div 
        className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div 
        className="absolute bottom-10 left-10 w-96 h-96 bg-white/3 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.05, 0.1, 0.05]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 1
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center max-w-6xl mx-auto">
          {/* Left column - Text content */}
          <motion.div 
            className="flex-1 text-center lg:text-left lg:pr-8 z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-4 inline-block"
            >
              <span className="px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-white/10 rounded-full">
                New Technology v1.0
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <span className="text-gradient">Record Locally.</span>
              <br />
              <div className="mt-2">Stream Globally.</div>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              High-quality video and voice conferencing that records directly on your device, 
              eliminating quality issues related to internet lag.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Button size="lg" className="bg-white text-background hover:bg-white/80 px-8 font-medium">
                Join Waitlist <MoveUpRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 font-medium border-white/20 backdrop-blur-sm"
                onClick={() => {
                  const verify = verifyToken(localStorage.getItem("token"));
                  if (verify) {
                    window.location.href = "/dashboard";
                  } else {
                    window.location.href = "/signin";
                  }
                }}
              >
                Dashboard
              </Button>
            </motion.div>
            
            <motion.div 
              className="mt-8 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              No credit card required • Free 14-day trial • Cancel anytime
            </motion.div>
          </motion.div>
          
          {/* Right column - Illustration/Image */}
          <motion.div 
            className="flex-1 mt-12 lg:mt-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="relative">
              <motion.div 
                className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-white/10 rounded-xl blur-xl"
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              ></motion.div>
              
              <motion.div 
                className="glass p-2 rounded-xl overflow-hidden relative"
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="relative rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=800&h=500"
                    alt="Video conferencing interface" 
                    className="rounded-lg w-full h-auto"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent"></div>
                  
                  {/* UI Elements overlay */}
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 p-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        <motion.div 
                          className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                          whileHover={{ scale: 1.15 }}
                        >
                          <span className="text-xs font-medium">JD</span>
                        </motion.div>
                        <motion.div 
                          className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center"
                          whileHover={{ scale: 1.15 }}
                        >
                          <span className="text-xs font-medium">MS</span>
                        </motion.div>
                        <motion.div 
                          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                          whileHover={{ scale: 1.15 }}
                        >
                          <span className="text-xs font-medium">AL</span>
                        </motion.div>
                      </div>
                      
                      <motion.div
                        animate={{ 
                          scale: [1, 1.05, 1],
                          backgroundColor: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.15)", "rgba(255,255,255,0.1)"]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          repeatType: "reverse" 
                        }}
                        className="text-xs px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm"
                      >
                        <div className="flex items-center">
                          <span className="inline-block w-2 h-2 bg-white rounded-full mr-1.5 pulse-slow"></span>
                          Recording Locally
                        </div>
                      </motion.div>
                    </div>
                    
                    <motion.div 
                      className="mt-6 mb-2 bg-white/5 backdrop-blur-md rounded-lg p-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.4 }}
                    >
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-white/20 flex-shrink-0"></div>
                        <div className="ml-2 h-2 bg-white/20 rounded-full w-40"></div>
                        <div className="ml-auto">
                          <div className="px-2 py-1 rounded bg-white/10 text-xs">HD</div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Floating UI elements */}
              <motion.div
                className="absolute -right-4 -top-4 bg-white/10 backdrop-blur-lg rounded-lg p-2.5 border border-white/10"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.5 }}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 0 20px rgba(255,255,255,0.15)"
                }}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full pulse-slow"></div>
                </div>
              </motion.div>
              
              <motion.div
                className="absolute -left-4 -bottom-4 bg-white/10 backdrop-blur-lg rounded-lg px-3 py-1.5 border border-white/10"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.7 }}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 0 20px rgba(255,255,255,0.15)"
                }}
              >
                <span className="text-xs whitespace-nowrap">100% Local Quality</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
