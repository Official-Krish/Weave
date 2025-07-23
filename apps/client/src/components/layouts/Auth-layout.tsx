
import { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Brand Side */}
        <div className="md:block md:w-1/2 lg:w-3/5 bg-gradient-to-br from-black to-studio-gray p-4 text-white flex flex-col justify-center items-center mt-20">
          <div className="max-w-md mx-auto space-y-16">
            <div className="text-center md:text-left">
              <p className="text-xl mb-4 text-white/80">Revolutionizing Remote Video Collaboration</p>
              <div className="h-1 w-20 bg-white mb-8 mx-auto md:mx-0"></div>
            </div>
            
            <div className="space-y-8">
              <div className="glass-card p-6 transform transition-all duration-500 hover:scale-105">
                <h3 className="text-xl font-semibold mb-2 text-white">Local Recording Power</h3>
                <p className="text-white/70">
                  Record directly on your device to eliminate quality issues caused by internet lag and compression.
                </p>
              </div>
              
              <div className="glass-card p-6 transform transition-all duration-500 hover:scale-105">
                <h3 className="text-xl font-semibold mb-2 text-white">Smart Stream Merging</h3>
                <p className="text-white/70">
                  Our backend worker intelligently combines individual streams for perfect final renders.
                </p>
              </div>
              
              <div className="glass-card p-6 transform transition-all duration-500 hover:scale-105">
                <h3 className="text-xl font-semibold mb-2 text-white">Raw Access</h3>
                <p className="text-white/70">
                  Get full access to both final rendered video and individual raw recordings.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Auth Form Side */}
        <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 bg-black backdrop-blur-lg">
          {children}
        </div>
      </div>
      
      {/* Mobile version of benefits - visible only on mobile */}
      <div className="md:hidden px-4 py-8 space-y-6 bg-black">
        <h2 className="text-xl font-bold text-center mb-4">Why Choose Weave?</h2>
        
        <div className="space-y-4">
          <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-lg font-semibold mb-1 text-white">Local Recording</h3>
            <p className="text-sm text-white/70">
              Record on your device to ensure highest quality.
            </p>
          </div>
          
          <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-lg font-semibold mb-1 text-white">Smart Merging</h3>
            <p className="text-sm text-white/70">
              Our backend combines streams perfectly.
            </p>
          </div>
          
          <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h3 className="text-lg font-semibold mb-1 text-white">Raw Access</h3>
            <p className="text-sm text-white/70">
              Access both final video and raw recordings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;