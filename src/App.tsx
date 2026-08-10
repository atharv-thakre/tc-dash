import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from './contexts/ThemeContext';
import { ApiConfigProvider } from './contexts/ApiConfigContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { AccountsPage } from './pages/AccountsPage';
import { OAuthLinksPage } from './pages/OAuthLinksPage';
import { SessionsPage } from './pages/SessionsPage';
import { OtpPage } from './pages/OtpPage';
import { ConfigPage } from './pages/ConfigPage';
import { ProfilePage } from './pages/ProfilePage';
import { OAuthCallbackPage } from './pages/OAuthCallbackPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppRouter() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const pathname = window.location.pathname;
    const search = window.location.search;
    if (
      pathname.includes('/callback') ||
      pathname.includes('/oauth') ||
      search.includes('access_token=') ||
      search.includes('code=')
    ) {
      if (pathname.includes('github')) return '/github/callback';
      if (pathname.includes('google')) return '/google/callback';
      return '/oauth/callback';
    }
    return pathname && pathname !== '/' ? pathname : '/dashboard';
  });

  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      setCurrentPath(pathname && pathname !== '/' ? pathname : '/login');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const { account } = useAuth();

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
  };

  // Render standalone Auth pages if navigating to login/signup or when not authenticated
  if (currentPath === '/login') {
    return <LoginPage onNavigate={handleNavigate} />;
  }

  if (currentPath === '/signup') {
    return <SignupPage onNavigate={handleNavigate} />;
  }

  if (
    currentPath === '/google/callback' ||
    currentPath === '/github/callback' ||
    currentPath === '/oauth/callback' ||
    currentPath.includes('/callback')
  ) {
    const provider = currentPath.includes('github') ? 'github' : 'google';
    return <OAuthCallbackPage provider={provider} onNavigate={handleNavigate} />;
  }

  // If not logged in and requesting protected pages, show Login Page directly
  if (!account) {
    return <LoginPage onNavigate={handleNavigate} />;
  }

  return (
    <AppLayout activePath={currentPath} onNavigate={handleNavigate}>
      {currentPath === '/dashboard' && <DashboardPage onNavigate={handleNavigate} />}
      {currentPath === '/accounts' && (
        <ProtectedRoute requireSuperAdmin>
          <AccountsPage />
        </ProtectedRoute>
      )}
      {currentPath === '/oauth-links' && (
        <ProtectedRoute requireSuperAdmin>
          <OAuthLinksPage />
        </ProtectedRoute>
      )}
      {currentPath === '/sessions' && (
        <ProtectedRoute requireSuperAdmin>
          <SessionsPage />
        </ProtectedRoute>
      )}
      {currentPath === '/otp' && (
        <ProtectedRoute requireSuperAdmin>
          <OtpPage />
        </ProtectedRoute>
      )}
      {currentPath === '/config' && (
        <ProtectedRoute requireSuperAdmin>
          <ConfigPage />
        </ProtectedRoute>
      )}
      {currentPath === '/profile' && <ProfilePage onNavigate={handleNavigate} />}
    </AppLayout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ApiConfigProvider>
          <AuthProvider>
            <AppRouter />
            <Toaster position="top-right" richColors closeButton />
          </AuthProvider>
        </ApiConfigProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
