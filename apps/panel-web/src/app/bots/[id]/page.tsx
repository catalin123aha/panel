'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@bot-hosting/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@bot-hosting/ui';
import { Badge } from '@bot-hosting/ui';
import sdk from '@/lib/auth';

interface Bot {
  id: string;
  name: string;
  description: string | null;
  status: string;
  runtime: string;
  library: string;
  createdAt: string;
  lastStartedAt: string | null;
  lastStoppedAt: string | null;
  restartCount: number;
  uptimeSeconds: number;
  cpuLimit: number;
  memoryLimit: number;
  diskLimit: number;
}

export default function BotDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, accessToken } = useAuth();
  const [bot, setBot] = useState<Bot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'console' | 'files' | 'env' | 'logs' | 'stats'>('console');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchBot();
  }, [user, router, params.id]);

  const fetchBot = async () => {
    if (!accessToken || !params.id) return;

    try {
      sdk.setAccessToken(accessToken);
      const botData = await sdk.getBot(params.id as string);
      setBot(botData);
    } catch (error) {
      console.error('Failed to fetch bot:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async () => {
    if (!bot) return;
    try {
      sdk.setAccessToken(accessToken || '');
      await sdk.startBot(bot.id);
      fetchBot();
    } catch (error) {
      console.error('Failed to start bot:', error);
      alert('Eroare la pornirea bot-ului');
    }
  };

  const handleStop = async () => {
    if (!bot) return;
    try {
      sdk.setAccessToken(accessToken || '');
      await sdk.stopBot(bot.id);
      fetchBot();
    } catch (error) {
      console.error('Failed to stop bot:', error);
      alert('Eroare la oprirea bot-ului');
    }
  };

  const handleRestart = async () => {
    if (!bot) return;
    try {
      sdk.setAccessToken(accessToken || '');
      await sdk.restartBot(bot.id);
      fetchBot();
    } catch (error) {
      console.error('Failed to restart bot:', error);
      alert('Eroare la repornirea bot-ului');
    }
  };

  const handleDelete = async () => {
    if (!bot) return;
    if (!confirm(`Ești sigur că vrei să ștergi botul "${bot.name}"?`)) {
      return;
    }

    try {
      sdk.setAccessToken(accessToken || '');
      await sdk.deleteBot(bot.id);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to delete bot:', error);
      alert('Eroare la ștergerea bot-ului');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'success';
      case 'STOPPED':
        return 'secondary';
      case 'CRASHED':
        return 'destructive';
      case 'CREATING':
      case 'RESTARTING':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'Activ';
      case 'STOPPED':
        return 'Oprit';
      case 'CRASHED':
        return 'Eroare';
      case 'CREATING':
        return 'Se creează';
      case 'RESTARTING':
        return 'Repornește';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Botul nu a fost găsit</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/dashboard')}
          >
            Înapoi la Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="text-white hover:text-slate-300"
            >
              ← Înapoi la Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              {user?.avatar && (
                <img
                  src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-white">{user?.username}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Bot Header */}
          <Card className="glass-card mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{bot.name}</h1>
                    <Badge variant={getStatusColor(bot.status)}>
                      {getStatusText(bot.status)}
                    </Badge>
                  </div>
                  <p className="text-slate-400">{bot.description || 'Fără descriere'}</p>
                  <div className="flex items-center space-x-4 text-sm text-slate-500 mt-2">
                    <span>{bot.runtime}</span>
                    <span>•</span>
                    <span>{bot.library}</span>
                    <span>•</span>
                    <span>Restarts: {bot.restartCount}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {bot.status === 'RUNNING' ? (
                    <Button variant="outline" size="sm" onClick={handleStop}>
                      Oprește
                    </Button>
                  ) : (
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                      onClick={handleStart}
                    >
                      Pornește
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleRestart}>
                    Repornește
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                  >
                    Șterge
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 border-b border-slate-700">
            {['console', 'files', 'env', 'logs', 'stats'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-white border-b-2 border-[#5865F2]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <Card className="glass-card">
            <CardContent className="p-6">
              {activeTab === 'console' && (
                <div className="bg-slate-900 rounded-lg p-4 h-96">
                  <div className="text-green-400 font-mono text-sm">
                    <p>Terminalul va fi disponibil curând botul este activ.</p>
                    <p className="mt-2 text-slate-400">
                      Conectează WebSocket-ul pentru streaming în timp real.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'files' && (
                <div className="text-center py-12">
                  <div className="text-slate-400 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-4 4V5a2 2 0 002 2h6a2 2 0 002-2v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2v-6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Manager de Fișiere</h3>
                  <p className="text-slate-400 mb-4">
                    Vizualizează și editează fișierele bot-ului tău
                  </p>
                  <Button variant="outline">În curând de dezvoltare</Button>
                </div>
              )}

              {activeTab === 'env' && (
                <div className="text-center py-12">
                  <div className="text-slate-400 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 20l4-16m4 4l-4-4m4 4h11"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Variabile de Mediu</h3>
                  <p className="text-slate-400 mb-4">
                    Configurează variabilele de mediu pentru bot
                  </p>
                  <Button variant="outline">În curând de dezvoltare</Button>
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="text-center py-12">
                  <div className="text-slate-400 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2 2v5a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 01-2-2h-2m-6 2a2 2 0 002 2v10a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Jurnal de Activitate</h3>
                  <p className="text-slate-400 mb-4">
                    Vezi log-urile bot-ului în timp real
                  </p>
                  <Button variant="outline">În curând de dezvoltare</Button>
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="text-center py-12">
                  <div className="text-slate-400 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2-2v-6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Statistici</h3>
                  <p className="text-slate-400 mb-4">
                    Monitorizează utilizarea resurselor bot-ului
                  </p>
                  <Button variant="outline">În curând de dezvoltare</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
