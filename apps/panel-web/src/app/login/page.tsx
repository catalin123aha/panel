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

    if (code && !isRedirecting) {
      setIsRedirecting(true);
      login(code, '')
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
      alert('API-ul backend nu este disponibil momentan. Asigură-te că panel-api rulează pe portul 4000.');
    }
  };

  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">Se încarcă...</p>
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
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
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
