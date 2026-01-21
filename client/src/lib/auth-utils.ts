export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

// Local redirect - since we are no longer using /api/login
export function redirectToLogin(toast?: (options: { title: string; description: string; variant: string }) => void) {
  if (toast) {
    toast({
      title: "Authentication Required",
      description: "Please login to continue.",
      variant: "destructive",
    });
  }
  // Instead of window.location.href = "/api/login", we use the app route
  // For this specific app, the login is often handled on the Home page or a dedicated /login route
  // If no /login route exists, we'll assume Home page handles auth state
  window.location.href = "/";
}
