import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import logoImg from "@assets/_Cyber_Security_Logo_1768903029110.png";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/game", label: "Game" },
    { href: "/chatbot", label: "Assistant" },
    { href: "/detection", label: "Detection" },
    { href: "/radar", label: "Scam Radar" },
    { href: "/safety", label: "Safety" },
    { href: "/deepfake-demo", label: "Deepfake AI" },
  ];

  const NavLink = ({ href, label, mobile = false }: { href: string; label: string; mobile?: boolean }) => {
    const isActive = location === href;
    return (
      <Link 
        href={href} 
        className={`
          transition-all duration-300 font-medium relative group
          ${isActive 
            ? "text-primary font-bold drop-shadow-[0_0_8px_rgba(183,80,255,0.4)]" 
            : "text-white/60 hover:text-white"}
          ${mobile ? "text-lg py-2" : "text-sm"}
        `}
        onClick={() => mobile && setIsOpen(false)}
      >
        {label}
        {!mobile && (
          <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`} />
        )}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-md transition-all group-hover:drop-shadow-[0_0_8px_rgba(183,80,255,0.8)]" />
          <span className="text-xl font-bold tracking-tight text-white font-heading">
            AISafetyNet
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
          
          <div className="ml-4 pl-4 border-l border-border">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-5 w-5 text-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.firstName || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => window.location.href = "/auth"} size="sm" className="bg-primary hover:bg-primary/90">
                Login
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-black/95 border-white/10 backdrop-blur-xl">
              <div className="flex flex-col gap-6 mt-6">
                {navLinks.map((link) => (
                  <NavLink key={link.href} {...link} mobile />
                ))}
                <div className="border-t border-white/10 pt-6">
                  {isAuthenticated ? (
                    <Button onClick={() => logout()} variant="outline" className="w-full justify-start text-white/60 hover:text-white border-white/10 hover:bg-white/5">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  ) : (
                    <Button onClick={() => window.location.href = "/auth"} className="w-full bg-primary hover:bg-primary/90">
                      Login
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
