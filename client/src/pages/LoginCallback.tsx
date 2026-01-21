import { useEffect } from "react";
import { useLocation } from "wouter";

// This file is a placeholder for the legacy Replit auth callback.
// It redirects to home to ensure no users get stuck here.
export default function LoginCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/");
  }, [setLocation]);

  return null;
}
