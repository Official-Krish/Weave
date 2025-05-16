
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowUpRight } from "lucide-react";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-28 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto rounded-xl overflow-hidden"
        >
          <div className="relative">
            {/* Background decoration */}
            <motion.div 
              className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.15, 0.1]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            ></motion.div>
            <motion.div 
              className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.05, 0.1, 0.05]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1
              }}
            ></motion.div>
            
            <div className="backdrop-blur-lg rounded-xl bg-gradient-to-b from-white/15 to-white/5 p-0.5">
              <div className="bg-card rounded-lg relative z-10 p-10 md:p-14 text-center">
                <motion.h2 
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Ready to transform your video conferencing?
                </motion.h2>
                
                <motion.p 
                  className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Join thousands of teams who have already upgraded their remote collaboration 
                  with RiverSide's revolutionary local recording platform.
                </motion.p>
                
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <motion.div
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)" 
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="lg" 
                      className="px-8 font-medium text-background bg-white hover:bg-white/90"
                    >
                      Start Free Trial <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: "rgba(255, 255, 255, 0.1)" 
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="px-8 font-medium border-white/20"
                    >
                      Schedule Demo
                    </Button>
                  </motion.div>
                </motion.div>
                
                <motion.div 
                  className="mt-8 text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  No credit card required • Free 14-day trial • Cancel anytime
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
