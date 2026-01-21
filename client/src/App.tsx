import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";

import Home from "@/pages/Home";
import Game from "@/pages/Game";
import Chatbot from "@/pages/Chatbot";
import Detection from "@/pages/Detection";
import Radar from "@/pages/Radar";
import Safety from "@/pages/Safety";
import DeepfakeDemo from "@/pages/DeepfakeDemo";
import AuthPage from "@/pages/AuthPage";
import { Footer } from "@/components/Footer";
import { AuroraBackground } from "@/components/AuroraBackground";
import ScrollToTop from "@/components/ScrollToTop";

// Import the logo image to use as favicon
import logoImg from "@assets/_Cyber_Security_Logo_1768903029110.png";

function MouseGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="mouse-glow"
      style={{
        transform: `translate(${position.x - 200}px, ${position.y - 200}px)`,
      }}
    />
  );
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen relative z-10 bg-black">
      <ScrollToTop />
      <AuroraBackground />
      <MouseGlow />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/game" component={Game} />
          <Route path="/chatbot" component={Chatbot} />
          <Route path="/detection" component={Detection} />
          <Route path="/radar" component={Radar} />
          <Route path="/safety" component={Safety} />
          <Route path="/deepfake-demo" component={DeepfakeDemo} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  // Effect to set the favicon dynamically to match the logo
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = logoImg;
    } else {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = logoImg;
      document.head.appendChild(newLink);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
