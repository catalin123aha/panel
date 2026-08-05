'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getDiscordAuthUrl } from '@/lib/auth';
import { Button } from '@bot-hosting/ui';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state && !isRedirecting) {
      setIsRedirecting(true);
      login(code, state)
        .then(() => {
          router.push('/dashboard');
        })
        .catch((error) => {
          console.error('Login failed:', error);
          setIsRedirecting(false);
        });
    }
  }, [searchParams, login, router, isRedirecting]);

  const handleDiscordLogin = async () => {
    try {
      const url = await getDiscordAuthUrl();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
    }
  };

  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-md w-full mx-4">
        <div className="glass-card p-8 rounded-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Discord Bot Hosting</h1>
            <p className="text-slate-300">Platformă gratuită pentru găzduirea bot-urilor Discord</p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleDiscordLogin}
              className="w-full h-12 text-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.92.376 1.32 1.32 0 0 0 .54.317.19.791 19.791 0 0 0-4.885 1.515.074.074 0 0 0-.92.376-1.32-1.32 0 0 0 .54-.317 19.791 19.791 0 0 0 4.885-1.515c.074-.074.376-.92.376-1.32-.54-.317-.317-.54-.376-.92 1.32-1.32 1.32-1.32 0 0 0 1.515 4.885c.074.074.376.92.376 1.32.54.317.317.54.376.92 1.32 1.32 1.32 0 0 0 .54-.317 19.791 19.791 0 0 0 1.515-4.885c.074-.074.376-.92.376-1.32-.54-.317-.317-.54-.376-.92-1.32-1.32-1.32 0 0 0-1.515-4.885c-.074-.074-.376-.92-.92-1.32-.54-.317-.317-.54-.376-.92-1.32a19.791 19.791 0 0 0-4.885 1.515.074.074 0 0 0-.92.376-1.32-1.32 0 0 0 .54-.317 19.791 19.791 0 0 0 4.885-1.515c.074-.074.376-.92.376-1.32.54-.317.317-.54.376-.92 1.32-1.32 1.32 0 0 0 .54-.317 19.791 19.791 0 0 0 1.515 4.885c.074.074.376.92.376 1.32.54.317.317.54.376.92 1.32 1.32 1.32 0 0 0 .54-.317 19.791 19.791 0 0 0 1.515-4.885c.074-.074.376-.92.376-1.32-.54-.317-.317-.54-.376-.92-1.32-1.32 0 0 0-1.515-4.885c-.074-.074-.376-.92-.92-1.32-.54-.317-.317-.54-.376-.92-1.32a19.791 19.791 0 0 0-4.885 1.515.074.074 0 0 0-.92.376-1.32-1.32 0 0 0 .54-.317 19.791 19.791 0 0 0 4.885-1.515c.074-.074.376-.92.376-1.32.54-.317.317-.54.376-.92 1.32-1.32 1.32 0 0 0 .54-.317 19.791 19.791 0 0 0 1.515 4.885c.074.074.376.92.376 1.32.54.317.317.54.376.92 1.32 1.32 1.32 0 0 0 .54-.317 19.791 19.791 0 0 0 1.515-4.885c.074-.074.376-.92.376-1.32-.54-.317-.317-.54-.376-.92-1.32-1.32 0 0 0-1.515-4.885c-.074-.074-.376-.92-.92-1.32-.54-.317-.317-.54-.376-.92-1.32a19.791 19.791 0 0 0-4.885 1.515zM12 22C6.477 22 2 17.523 2 12S6.477 2 12 6.477 2 12 6.477 22 12 17.523 22 12 22 17.523 22 12 17.523 22 12zm0-3.5c-2.485 0-4.5-2.015-4.5-4.5S9.515 10 12 10s4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5z"/>
              </svg>
              Login cu Discord
            </Button>

            <div className="text-center text-sm text-slate-400">
              <p>În continuare vei fi redirecționat către Discord</p>
              <p className="mt-2">Returnează după autorizare</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="text-center text-xs text-slate-500">
              <p>Platformă complet gratuită • Fără plăți • Fără abonamente</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
