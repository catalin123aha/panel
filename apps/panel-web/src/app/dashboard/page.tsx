'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  restartCount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, accessToken, logout } = useAuth();
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchBots();
  }, [user, router]);

  const fetchBots = async () => {
    if (!accessToken) return;

    try {
      sdk.setAccessToken(accessToken);
      const botsData = await sdk.listBots();
      setBots(botsData);
    } catch (error) {
      console.error('Failed to fetch bots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Discord Bot Hosting</h1>
              <Badge variant="secondary">Beta</Badge>
            </div>
            <div className="flex items-center space-x-4">
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
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Bots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{bots.length}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                {bots.filter((b) => b.status === 'RUNNING').length}
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Oprite</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-400">
                {bots.filter((b) => b.status === 'STOPPED').length}
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Max Bots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">{user?.maxBots || 5}</div>
            </CardContent>
          </Card>
        </div>

        {/* Create Bot Button */}
        <div className="mb-8">
          <Button
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
            onClick={() => router.push('/bots/create')}
          >
            + Creează Bot Nou
          </Button>
        </div>

        {/* Bots List */}
        <div className="space-y-4">
          {bots.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <CardContent>
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0h6"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Nu ai niciun bot</h3>
                <p className="text-slate-400 mb-4">
                  Creează primul tău bot Discord pentru a începe
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/bots/create')}
                >
                  Creează Bot
                </Button>
              </CardContent>
            </Card>
          ) : (
            bots.map((bot) => (
              <Card key={bot.id} className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{bot.name}</h3>
                        <Badge variant={getStatusColor(bot.status)}>
                          {getStatusText(bot.status)}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">
                        {bot.description || 'Fără descriere'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>{bot.runtime}</span>
                        <span>•</span>
                        <span>{bot.library}</span>
                        <span>•</span>
                        <span>Restarts: {bot.restartCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/bots/${bot.id}`)}
                      >
                        Gestionează
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
