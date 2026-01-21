import { LucideIcon, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  color: "primary" | "secondary" | "accent";
}

export function FeatureCard({ icon: Icon, title, description, href, color }: FeatureCardProps) {
  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ y: -5 }}
        className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 shadow-sm transition-all hover:shadow-[0_0_30px_rgba(183,80,255,0.15)] hover:border-primary/50 cursor-pointer backdrop-blur-xl"
      >
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 bg-primary/10 border border-primary/20 group-hover:shadow-[0_0_15px_rgba(183,80,255,0.3)]">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mb-2 text-xl font-bold font-heading text-white group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-white/60 mb-6 group-hover:text-white/80 transition-colors">{description}</p>
        
        <div className="flex items-center text-sm font-medium text-primary transition-all group-hover:gap-2">
          Explore Feature <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </motion.div>
    </Link>
  );
}
