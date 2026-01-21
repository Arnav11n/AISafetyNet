import { Link, useLocation } from "wouter";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10 relative z-10">
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 justify-center md:justify-start group">
              <Shield className="h-8 w-8 text-primary group-hover:drop-shadow-[0_0_8px_rgba(183,80,255,0.8)] transition-all" />
              <span className="text-xl font-bold tracking-tight font-heading">
                AI<span className="text-primary">Safety</span>Net
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              Empowering citizens with AI-driven tools to detect, report, and prevent cyber fraud.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white uppercase tracking-widest text-xs">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/game" className="text-white/40 hover:text-primary transition-colors">Safety Game</Link></li>
              <li><Link href="/radar" className="text-white/40 hover:text-primary transition-colors">Scam Radar</Link></li>
              <li><Link href="/detection" className="text-white/40 hover:text-primary transition-colors">Deepfake Detection</Link></li>
              <li><Link href="/safety" className="text-white/40 hover:text-primary transition-colors">Safety Guides</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white uppercase tracking-widest text-xs">Emergency Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-white/40">National Helpline: <span className="text-primary font-bold">1930</span></li>
              <li className="text-white/40">Portal: <span className="text-primary font-bold">cybercrime.gov.in</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-white/20">
          <p>(c) 2026 Arnav Narang, Bhavya Gupta. All rights reserved. For public welfare.</p>
        </div>
      </div>
    </footer>
  );
}
