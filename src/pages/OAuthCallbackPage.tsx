import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, LOCAL_STORAGE_TOKEN_KEY } from '../services/apiClient';

interface OAuthCallbackPageProps {
  provider: 'google' | 'github';
  onNavigate: (path: string) => void;
}

export const OAuthCallbackPage: React.FC<OAuthCallbackPageProps> = ({ provider, onNavigate }) => {
  const { refetchMe } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (!code) {
        setStatus('error');
        setErrorMessage('Missing OAuth authorization code in callback URL.');
        return;
      }

      try {
        const res = await apiClient.get(`/${provider}/callback?code=${encodeURIComponent(code)}`);
        if (res.data?.access_token) {
          localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, res.data.access_token);
          await refetchMe();
          setStatus('success');
          toast.success(`Successfully authenticated with ${provider}`);
          setTimeout(() => onNavigate('/dashboard'), 1000);
        } else {
          throw new Error('No access token returned in OAuth payload');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || `Failed to complete ${provider} OAuth authentication.`);
      }
    };

    processCallback();
  }, [provider]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl">
        {status === 'processing' && (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Authenticating with {provider === 'google' ? 'Google' : 'GitHub'}...
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Exchanging authorization token code with <code className="font-mono text-indigo-500">/tc-auth/{provider}/callback</code>
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Authentication Successful</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Session established. Redirecting to your dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400">OAuth Exchange Failed</h2>
            <p className="text-xs text-gray-600 dark:text-gray-300">{errorMessage}</p>
            <button
              onClick={() => onNavigate('/login')}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
