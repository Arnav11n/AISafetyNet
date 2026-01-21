import { Navbar } from "@/components/Navbar";
import { FeatureCard } from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { Shield, Brain, Eye, Activity, BookOpen, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-black font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-black to-black"></div>
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-center space-y-8"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <Shield className="mr-1 h-3.5 w-3.5" />
                  Official Fraud Awareness Portal
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-heading text-white">
                  Stay Safe in the <br/>
                  <span className="text-primary drop-shadow-[0_0_15px_rgba(183,80,255,0.5)]">Age of AI</span>
                </h1>
                <p className="max-w-[600px] text-white/60 md:text-xl leading-relaxed">
                  Protect yourself from deepfakes, financial scams, and identity theft. 
                  Learn through interactive games, detect fraud with AI, and report suspicious activity.
                </p>
              </div>
              <div className="flex flex-col gap-3 min-[400px]:flex-row">
                <Link href="/detection">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 h-12 px-8 text-base shadow-[0_0_20px_rgba(183,80,255,0.4)]">
                    Detect Deepfakes
                  </Button>
                </Link>
                <Link href="/game">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base border-primary/50 text-white hover:bg-primary/10">
                    Play Awareness Game
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative mx-auto w-full max-w-[500px] lg:max-w-none"
            >
              {/* Abstract Graphic representing security/AI */}
              <div className="aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-2xl relative">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="h-32 w-32 text-white/90 drop-shadow-lg" />
                </div>
                {/* Decorative floating elements */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute top-10 right-10 p-3 bg-white/10 backdrop-blur rounded-lg border border-white/20"
                >
                  <AlertTriangle className="text-yellow-300 h-6 w-6" />
                </motion.div>
                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 5 }}
                  className="absolute bottom-10 left-10 p-3 bg-white/10 backdrop-blur rounded-lg border border-white/20"
                >
                  <Eye className="text-blue-300 h-6 w-6" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white/5 backdrop-blur-sm">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white font-heading sm:text-4xl">Comprehensive Protection</h2>
            <p className="mt-4 text-white/60 md:text-lg">Tools and resources designed to keep you one step ahead.</p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard 
              icon={Brain}
              title="Fraud Awareness Game"
              description="Learn to identify scams through realistic role-playing scenarios. Earn points and climb the leaderboard."
              href="/game"
              color="primary"
            />
            <FeatureCard 
              icon={Eye}
              title="Deepfake Detection"
              description="Upload suspicious images, audio, or video to analyze them for AI manipulation using advanced algorithms."
              href="/detection"
              color="secondary"
            />
            <FeatureCard 
              icon={Activity}
              title="Scam Radar"
              description="Real-time dashboard of reported scams in your area. Report incidents and view trends."
              href="/radar"
              color="accent"
            />
            <FeatureCard 
              icon={Brain}
              title="AI Assistant"
              description="Chat with our AI safety expert to get instant advice on suspicious messages or calls."
              href="/chatbot"
              color="secondary"
            />
            <FeatureCard 
              icon={BookOpen}
              title="Safety Center"
              description="Access helpline numbers, emergency checklists, and educational guides on digital safety."
              href="/safety"
              color="primary"
            />
          </div>
        </div>
      </section>

    </div>
  );
}
