import { useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { ArrowDown, ArrowUpRight, ArrowRight, Play } from "lucide-react";

const steps = [
  {
    icon: <ArrowDown className="h-6 w-6" />,
    title: "Local Recording",
    description: "Record high-quality video directly on your device, eliminating internet lag issues.",
    delay: 0.1
  },
  {
    icon: <ArrowUpRight className="h-6 w-6" />,
    title: "Cloud Upload",
    description: "Securely upload your recordings to our cloud storage platform.",
    delay: 0.2
  },
  {
    icon: <ArrowRight className="h-6 w-6" />,
    title: "Stream Merging",
    description: "Our backend worker merges individual streams for perfect synchronization.",
    delay: 0.3
  },
  {
    icon: <ArrowDown className="h-6 w-6" />,
    title: "Downloads",
    description: "Access both raw individual recordings and final merged output.",
    delay: 0.4
  }
];

const HowItWorksSection = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  return (
    <section id="how-it-works" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-black/50 to-background"></div>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
      </div>
      
      <motion.div 
        className="absolute top-40 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.1, 0.05]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
          }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <motion.div 
            className="inline-block mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-white/10 rounded-full">
              Simple Process
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">How It Works</h2>
          <p className="text-lg text-muted-foreground">
            Our platform combines local recording quality with cloud convenience,
            giving you the best of both worlds.
          </p>
        </motion.div>

        {/* Flowing timeline design with proper spacing */}
        <div className="max-w-5xl mx-auto relative">
          {/* Center line for desktop */}
          <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-px bg-gradient-to-b from-white/5 via-white/30 to-white/5"></div>
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.6, delay: step.delay }
                }
              }}
              className="mb-10 last:mb-0 relative"
            >
              {/* Content placement based on even/odd */}
              <div className={`flex flex-col ${index % 2 === 0 ? 'md:ml-0 md:mr-auto md:items-start' : 'md:ml-auto md:mr-0 md:items-end'} items-center`}>
                {/* Step number with animated circle */}
                <motion.div 
                  className="relative mb-6"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div 
                    className="w-20 h-20 rounded-full bg-white/5 border border-white/20 flex items-center justify-center relative z-10"
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                    animate={{
                      boxShadow: [
                        "0 0 0 rgba(255,255,255,0.1)",
                        "0 0 20px rgba(255,255,255,0.2)",
                        "0 0 0 rgba(255,255,255,0.1)"
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <span className="text-2xl font-bold">{index + 1}</span>
                  </motion.div>
                </motion.div>
                
                {/* Content block - title and description grouped together */}
                <div className={`max-w-xs md:max-w-sm ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
                  {/* Title with icon */}
                  <div className={`flex items-center mb-3 gap-3 text-white ${
                    index % 2 !== 0 ? 'justify-end' : ''
                  }`}>
                    <motion.div 
                      className={`h-10 w-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 ${
                        index % 2 !== 0 ? 'order-last' : ''
                      }`}
                      whileHover={{ 
                        rotate: 15,
                        scale: 1.1,
                        backgroundColor: "rgba(255,255,255,0.15)" 
                      }}
                    >
                      {step.icon}
                    </motion.div>
                    <h3 className="text-2xl font-bold">{step.title}</h3>
                  </div>
                  
                  {/* Description directly below its title */}
                  <p className="text-muted-foreground text-lg">{step.description}</p>
                  
                  {/* Flowing arrow between steps */}
                  {index < steps.length - 1 && (
                    <motion.div
                      className={`hidden md:flex mt-6 ${
                        index % 2 === 0 ? 'justify-end' : 'justify-start'
                      }`}
                      animate={{ 
                        x: index % 2 === 0 ? [0, 10, 0] : [0, -10, 0],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        repeatType: "reverse" 
                      }}
                    >
                      <ArrowRight className={`h-6 w-6 text-white/50 transform ${
                        index % 2 !== 0 ? 'rotate-180' : ''
                      }`} />
                    </motion.div>
                  )}
                </div>
              </div>
              
              {/* Vertical connector for mobile */}
              {index < steps.length - 1 && (
                <motion.div
                  className="absolute left-1/2 transform -translate-x-1/2 top-24 h-16 w-px bg-gradient-to-b from-white/40 to-transparent md:hidden"
                  animate={{ 
                    height: [50, 60, 50],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.5 } }
          }}
          className="mt-32 mx-auto max-w-4xl"
        >
          <div className="relative bg-gradient-to-b from-background via-black/50 to-background">
            <motion.div 
              className="absolute -inset-0.5 bg-white/10 rounded-xl blur-xl"
              animate={{
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            ></motion.div>
            
            <div className="backdrop-blur-lg p-1 rounded-xl overflow-hidden relative">
              <div className="bg-black rounded-lg aspect-video">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="backdrop-blur-sm p-8 rounded-lg max-w-md text-center">
                    <h3 className="text-xl font-semibold mb-3">See it in action</h3>
                    <p className="text-muted-foreground mb-6">
                      Watch our detailed walkthrough to see how RiverSide works from start to finish.
                    </p>
                    <motion.button 
                      className="inline-flex items-center justify-center rounded-full bg-white text-background hover:bg-white/90 transition-colors px-6 py-3 text-sm font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="mr-2 h-4 w-4" /> Watch Demo
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;