
import { useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { MoveDown, MoveUpRight, MoveRight, MoveVertical } from "lucide-react";

const features = [
  {
    icon: <MoveVertical className="h-6 w-6" />,
    title: "Local Recording",
    description: "High-quality video and audio captured directly on your device, eliminating internet lag issues that plague traditional conferencing tools."
  },
  {
    icon: <MoveUpRight className="h-6 w-6" />,
    title: "Cloud Storage",
    description: "Securely store your recordings in our cloud platform with easy access and management through our intuitive dashboard."
  },
  {
    icon: <MoveDown className="h-6 w-6" />,
    title: "Raw & Final Files",
    description: "Access both individual raw recordings from each participant and the professionally merged final output for maximum flexibility."
  },
  {
    icon: <MoveRight className="h-6 w-6" />,
    title: "Enterprise Security",
    description: "End-to-end encryption, access controls, and compliance-ready features to keep your sensitive meetings secure."
  }
];

const FeatureCard = ({ icon, title, description, index }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.6, delay: index * 0.1 + 0.2 }
        }
      }}
      whileHover={{ y: -5 }}
      className="p-1"
    >
      <div className="h-full backdrop-blur-lg rounded-xl bg-gradient-to-b from-white/10 to-white/5 p-0.5">
        <div className="h-full bg-card rounded-lg p-6">
          <div className="flex gap-5">
            <motion.div 
              className="h-14 w-14 rounded-xl bg-white/5 flex-shrink-0 flex items-center justify-center border border-white/10"
              whileHover={{ 
                rotate: 5,
                scale: 1.05,
                backgroundColor: "rgba(255,255,255,0.1)" 
              }}
            >
              {icon}
            </motion.div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-muted-foreground">{description}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  return (
    <section id="features" className="py-28 relative">
      {/* Background elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      
      <motion.div 
        className="absolute bottom-40 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.08, 0.05]
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
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div 
            className="inline-block mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-white/10 rounded-full">
              Why Choose Us
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">Key Features</h2>
          <p className="text-lg text-muted-foreground">
            Our platform offers unique capabilities designed to solve the common frustrations
            with traditional conferencing tools.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
