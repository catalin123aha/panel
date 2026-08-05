'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@bot-hosting/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@bot-hosting/ui';
import { Input } from '@bot-hosting/ui';
import sdk from '@/lib/auth';
import { BotRuntime, BotLibrary } from '@bot-hosting/types';

export default function CreateBotPage() {
  const router = useRouter();
  const { user, accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    runtime: 'nodejs' as BotRuntime,
    runtimeVersion: '20',
    library: 'discordjs' as BotLibrary,
  });

  const runtimes = [
    { value: 'nodejs', label: 'Node.js', versions: ['18', '20', '21'] },
    { value: 'python', label: 'Python', versions: ['3.10', '3.11', '3.12'] },
    { value: 'java', label: 'Java', versions: ['17', '21', '22'] },
    { value: 'go', label: 'Go', versions: ['1.21', '1.22'] },
    { value: 'rust', label: 'Rust', versions: ['1.75', '1.80'] },
  ];

  const libraries = [
    { value: 'discordjs', label: 'Discord.js', runtime: 'nodejs' },
    { value: 'discordpy', label: 'discord.py', runtime: 'python' },
    { value: 'pycord', label: 'Pycord', runtime: 'python' },
    { value: 'nextcord', label: 'Nextcord', runtime: 'python' },
    { value: 'disnake', label: 'Disnake', runtime: 'python' },
    { value: 'jda', label: 'JDA', runtime: 'java' },
    { value: 'serenity', label: 'Serenity', runtime: 'rust' },
    { value: 'blank', label: 'Proiect Gol', runtime: 'nodejs' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      sdk.setAccessToken(accessToken || '');
      const bot = await sdk.createBot(formData);
      router.push(`/bots/${bot.id}`);
    } catch (error) {
      console.error('Failed to create bot:', error);
      alert('Eroare la crearea botului. Încearcă din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLibraries = libraries.filter((lib) => lib.runtime === formData.runtime);

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
        <div className="max-w-2xl mx-auto">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Creează Bot Nou</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nume Bot *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Numele bot-ului tău"
                    required
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Descriere
                  </label>
                  <Input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descriere bot-ului tău (opțional)"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Runtime *
                  </label>
                  <select
                    value={formData.runtime}
                    onChange={(e) => setFormData({ ...formData, runtime: e.target.value as BotRuntime, library: 'blank' as BotLibrary })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2"
                  >
                    {runtimes.map((runtime) => (
                      <option key={runtime.value} value={runtime.value}>
                        {runtime.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Versiune Runtime *
                  </label>
                  <select
                    value={formData.runtimeVersion}
                    onChange={(e) => setFormData({ ...formData, runtimeVersion: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2"
                  >
                    {runtimes
                      .find((r) => r.value === formData.runtime)
                      ?.versions.map((version) => (
                        <option key={version} value={version}>
                          {version}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Bibliotecă *
                  </label>
                  <select
                    value={formData.library}
                    onChange={(e) => setFormData({ ...formData, library: e.target.value as BotLibrary })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2"
                  >
                    {filteredLibraries.map((library) => (
                      <option key={library.value} value={library.value}>
                        {library.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    disabled={isLoading}
                  >
                    Anulează
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Se creează...' : 'Creează Bot'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
