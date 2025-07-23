
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const testimonials = [
  {
    quote: "Weave has completely transformed our remote podcast production. We get studio-quality recordings without requiring our guests to have professional setups.",
    author: "Jessica Wong",
    position: "Podcast Producer",
    company: "Digital Insights Media"
  },
  {
    quote: "As a virtual event organizer, the ability to have high-quality recordings of each speaker has been a game-changer for our post-event content strategy.",
    author: "Michael Rodriguez",
    position: "Events Director",
    company: "Global Conferences Inc."
  },
  {
    quote: "The local recording feature saves our design reviews from quality issues when team members have unstable internet connections. The final merged video is always perfect.",
    author: "David Chen",
    position: "Product Design Lead",
    company: "Creative Solutions"
  }
];

const useCases = [
  "Remote Podcasting",
  "Virtual Events",
  "Webinars and Workshops",
  "Remote Team Meetings",
  "Customer Interviews",
  "Educational Content"
];

const TestimonialCard = ({ quote, author, position, company, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
    whileHover={{ 
      y: -5,
      transition: { duration: 0.2 }
    }}
    className="backdrop-blur-lg rounded-xl bg-gradient-to-b from-white/10 to-white/5 p-0.5"
  >
    <div className="bg-card rounded-lg p-6 h-full">
      <div className="mb-4 flex">
        {[...Array(5)].map((_, i) => (
          <motion.span 
            key={i} 
            className="text-white text-lg mr-1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            ★
          </motion.span>
        ))}
      </div>
      <blockquote className="mb-6">
        <p className="text-muted-foreground italic">"{quote}"</p>
      </blockquote>
      <div className="border-t border-white/10 pt-4 mt-auto">
        <p className="font-medium">{author}</p>
        <p className="text-sm text-muted-foreground">{position}, {company}</p>
      </div>
    </div>
  </motion.div>
);

const UseCaseTag = ({ label, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
    className="backdrop-blur-lg py-3 px-6 rounded-lg text-center border border-white/10 bg-white/5"
  >
    <span className="text-gradient font-medium">{label}</span>
  </motion.div>
);

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="use-cases" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-black/50 to-background"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      
      <motion.div 
        className="absolute top-40 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"
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
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
          ref={ref}
        >
          <motion.div 
            className="inline-block mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-white/10 rounded-full">
              Success Stories
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">Use Cases & Testimonials</h2>
          <p className="text-lg text-muted-foreground">
            Discover how Weave is helping businesses and creators across industries 
            improve their remote collaboration and content production.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-20">
          {useCases.map((useCase, index) => (
            <UseCaseTag key={index} label={useCase} index={index} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
