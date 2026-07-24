'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Lucide from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// ---------------------------------------------------------------------------
// Backend — inline, no separate api client. Every route on main-3.py sits
// behind Depends(verify_user), which reads a Supabase JWT from the
// Authorization header, so every call below fetches the current session
// first and attaches it.
// ---------------------------------------------------------------------------
const API_BASE_URL = 'https://playful-4.onrender.com';

interface BackendGame {
  game_name: string;
  preview_url: string;
  is_favorite: boolean;
  last_updated: string;
}

interface JobStatus {
  status: 'queued' | 'initializing' | 'generating' | 'deploying' | 'committing' | 'completed' | 'failed' | string;
  message: string;
  progress?: number;
}

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not signed in');
  return { Authorization: `Bearer ${token}` };
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = { 'Content-Type': 'application/json', ...(await authHeader()), ...(init.headers ?? {}) };
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    let detail = res.statusText;
    try { detail = (await res.json()).detail ?? detail; } catch {}
    throw new Error(detail);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

// GET /api/v3/games
async function fetchGames(): Promise<BackendGame[]> {
  const data = await apiFetch<{ games: BackendGame[] }>('/api/v3/games');
  return data.games ?? [];
}

// POST /api/v3/generate-game — kicks off the async build, returns a job_id
async function createGame(gameName: string, prompt: string): Promise<{ job_id: string }> {
  return apiFetch('/api/v3/generate-game', { method: 'POST', body: JSON.stringify({ game_name: gameName, prompt }) });
}

// GET /status/{job_id}
async function getJobStatus(jobId: string): Promise<JobStatus> {
  return apiFetch(`/status/${jobId}`);
}

// POST /toggle-favorite
async function setFavorite(gameName: string, isFavorite: boolean): Promise<void> {
  await apiFetch('/toggle-favorite', { method: 'POST', body: JSON.stringify({ game_name: gameName, is_favorite: isFavorite }) });
}

// POST /deletegame
async function deleteGame(gameName: string): Promise<void> {
  await apiFetch('/deletegame', { method: 'POST', body: JSON.stringify({ game_name: gameName }) });
}

// POST /edit-game-name
async function renameGame(oldName: string, newName: string): Promise<void> {
  await apiFetch('/edit-game-name', { method: 'POST', body: JSON.stringify({ old_game_name: oldName, new_game_name: newName }) });
}

// Polls /status/{job_id} every intervalMs until the job finishes.
function pollJob(jobId: string, onUpdate: (status: JobStatus) => void, intervalMs = 2000): () => void {
  let stopped = false;
  const tick = async () => {
    if (stopped) return;
    try {
      const status = await getJobStatus(jobId);
      onUpdate(status);
      if (status.status === 'completed' || status.status === 'failed') return;
    } catch {
      // transient network hiccup — keep polling until the caller stops us
    }
    if (!stopped) setTimeout(tick, intervalMs);
  };
  tick();
  return () => { stopped = true; };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Game {
  name: string;          // = game_name, also the stable key the backend uses everywhere
  previewUrl: string;
  favorite: boolean;
  lastUpdated: string;   // backend only gives us a label ("In Repo"), not a real date
}

interface Profile {
  username: string;
  email: string;
  plan: string;
  credits: number;
}

interface BuildingJob {
  gameName: string;
  prompt: string;
  jobId: string;
  progress: number;
  message: string;
  failed: boolean;
}

// Rough plan credit ceilings for the progress bar — the `users` table has no
// max_credits column, so this mirrors Playful's plan tiers. Adjust here if
// pricing changes.
const PLAN_CREDIT_CAP: Record<string, number> = {
  free: 50,
  creator: 500,
  studio: 2000,
};

const NAV_ITEMS: { label: string; icon: keyof typeof Lucide }[] = [
  { label: 'Dashboard', icon: 'LayoutDashboard' },
  { label: 'Search', icon: 'Search' },
  { label: 'All projects', icon: 'Folder' },
  { label: 'Favourites', icon: 'Star' },
  { label: 'Settings', icon: 'Settings' },
];

function slugifyGameName(prompt: string): string {
  const base = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join('-') || 'game';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`.slice(0, 50);
}

function toGame(g: BackendGame): Game {
  return { name: g.game_name, previewUrl: g.preview_url, favorite: g.is_favorite, lastUpdated: g.last_updated };
}

export default function Dashboard() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [games, setGames] = useState<Game[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [gamesError, setGamesError] = useState<string | null>(null);

  const [prompt, setPrompt] = useState('');
  const [building, setBuilding] = useState<BuildingJob | null>(null);
  const stopPollRef = useRef<(() => void) | undefined>(undefined);

  const [favoriteBusy, setFavoriteBusy] = useState<Set<string>>(new Set());
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<Game | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Game | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // ---- data loading -------------------------------------------------------
  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace('/auth');
      return;
    }
    const { data, error } = await supabase
      .from('users')
      .select('username, plan, credits')
      .eq('id', session.user.id)
      .single();
    if (!error && data) {
      setProfile({
        username: data.username ?? session.user.email?.split('@')[0] ?? 'creator',
        email: session.user.email ?? '',
        plan: data.plan ?? 'free',
        credits: data.credits ?? 0,
      });
    }
    setProfileLoading(false);
  }, [router]);

  const loadGames = useCallback(async () => {
    try {
      setGamesLoading(true);
      setGamesError(null);
      const backendGames = await fetchGames();
      setGames(backendGames.map(toGame));
    } catch (err: any) {
      setGamesError(err.message ?? 'Could not load your games');
    } finally {
      setGamesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadGames();
  }, [loadProfile, loadGames]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace('/auth');
    });
    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => () => stopPollRef.current?.(), []);

  // ---- actions --------------------------------------------------------------
  const handleBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || building) return;

    const gameName = slugifyGameName(trimmed);
    setPrompt('');
    setBuilding({ gameName, prompt: trimmed, jobId: '', progress: 0, message: 'Queuing your build…', failed: false });

    try {
      const { job_id } = await createGame(gameName, trimmed);
      setBuilding((b) => (b ? { ...b, jobId: job_id } : b));
      stopPollRef.current = pollJob(job_id, (status: JobStatus) => {
        setBuilding((b) => b ? {
          ...b,
          progress: status.progress ?? b.progress,
          message: status.message ?? b.message,
          failed: status.status === 'failed',
        } : b);
        if (status.status === 'completed') {
          loadGames();
          setTimeout(() => setBuilding(null), 1500);
        }
      });
    } catch (err: any) {
      setBuilding((b) => b ? { ...b, message: err.message ?? 'Failed to start build', failed: true } : b);
    }
  };

  const handleToggleFavorite = async (game: Game) => {
    setFavoriteBusy((prev) => new Set(prev).add(game.name));
    const next = !game.favorite;
    setGames((prev) => prev.map((g) => (g.name === game.name ? { ...g, favorite: next } : g)));
    try {
      await setFavorite(game.name, next);
    } catch {
      setGames((prev) => prev.map((g) => (g.name === game.name ? { ...g, favorite: !next } : g)));
    } finally {
      setFavoriteBusy((prev) => {
        const s = new Set(prev);
        s.delete(game.name);
        return s;
      });
    }
  };

  const handleRename = async () => {
    if (!renameTarget || !renameValue.trim() || renameValue === renameTarget.name) {
      setRenameTarget(null);
      return;
    }
    try {
      await renameGame(renameTarget.name, renameValue.trim());
      await loadGames();
    } catch (err: any) {
      alert(err.message ?? 'Could not rename that game');
    } finally {
      setRenameTarget(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteGame(deleteTarget.name);
      setGames((prev) => prev.filter((g) => g.name !== deleteTarget.name));
    } catch (err: any) {
      alert(err.message ?? 'Could not delete that game');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const recents = games.slice(0, 3);
  const creditsPct = profile ? Math.min(100, (profile.credits / (PLAN_CREDIT_CAP[profile.plan] ?? 100)) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_rgba(79,70,229,0.08)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(at_bottom_right,_rgba(236,72,153,0.06)_0%,transparent_50%)]"></div>
      </div>

      {/* Subtle animated grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-[urldata:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3czudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiNFRkVGRkYiLz48L3N2Zz4=] bg-[size:20px_20px]"></div>
      </div>

      {/* Sidebar - Enhanced with glassmorphism and better spacing */}
      <aside className="w-64 bg-[rgba(17,24,39,0.7)] backdrop-blur-lg border-r border-[rgba(255,255,255,0.08)] flex flex-col h-screen fixed left-0 top-0 z-20">
        <div className="flex items-center p-5 border-b border-[rgba(255,255,255,0.06)]">
          <div className="w-14 h-14 bg-gradient-to-br from-[#4F46E5] to-[#6366F1] rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
            P
          </div>
          <span className="ml-4 text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#EC4899] bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
            Playful
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = Lucide[item.icon] as any;
            const isActive = item.label.toLowerCase().includes('dashboard');
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * NAV_ITEMS.indexOf(item) }}
                className={`flex items-center gap-3 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 cursor-pointer ${isActive ? 'bg-[rgba(79,70,229,0.15)]' : ''}`}
              >
                <Icon className="w-5 h-5 text-[hsla(0,0%,100%,0.8)] hover:text-white transition-colors duration-300" />
                <span className={`text-sm font-medium flex-1 whitespace-nowrap ${isActive ? 'font-semibold' : 'font-normal'}`}>{item.label}</span>
                {!isEmpty(item.label) && <div className="w-2 h-2 bg-[hsla(0,0%,100%,0.1)] rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300" />}
              </motion.div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[rgba(255,255,255,0.06)]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Recents</h3>
          <div className="space-y-1">
            {recents.length === 0 ? (
              <p className="text-xs text-white/40">No projects yet</p>
            ) : recents.map((game) => (
              <motion.div
                key={game.name}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * recents.indexOf(game) }}
                className="flex items-center px-3 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors duration-200 cursor-default"
              >
                <Lucide.FileText className="w-4 h-4 mr-2 text-white/40 shrink-0" />
                <span className="flex-1 text-xs text-white/ xs:truncate">{game.name}</span>
                <div className="w-2 h-2 bg-[hsla(255,165,0,0.3)] rounded-full flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-4 pt-4 border-t border-[rgba(255,255,255,0.08)] relative">
          <div
            className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-[rgba(255,255,255,0.04)]"
            onClick={() => setUserMenuOpen((v) => !v)}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#EC4899] rounded-full flex items-center justify-center text-white font-bold shadow-md">
              {(profile?.username ?? 'P')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{profileLoading ? 'Loading…' : profile?.username}</p>
              <p className="text-xs text-white/60 truncate">{profileLoading ? '' : profile?.email}</p>
            </div>
            <Lucide.ChevronDown className={`ml-auto w-4 h-4 text-white/50 shrink-0 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute left-4 right-4 bottom-[calc(100%-4px)] bg-[rgba(17,24,39,0.9)] backdrop-blur-lg border border-[rgba(255,255,255,0.08)] rounded-2xl p-4 z-30"
              >
                <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-[rgba(255,255,255,0.02)]">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#EC4899] rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {(profile?.username ?? 'P')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{profile?.username}</p>
                    <p className="text-xs text-white/60 truncate">{profile?.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.03)] transition-colors duration-200 cursor-pointer">
                    <Lucide.Settings className="w-4 h-4 text-[hsla(0,0%,100%,0.8)] hover:text-white transition-colors duration-300" />
                    <span className="text-sm">Settings</span>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.03)] transition-colors duration-200 cursor-pointer">
                    <span className="text-sm">Plan</span>
                    <span className="ml-auto px-2.5 py-0.5 text-xs bg-[rgba(255,255,255,0.08)] rounded-full capitalize">{profile?.plan ?? 'free'}</span>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.03)] transition-colors duration-200 cursor-pointer">
                    <Lucide.Zap className="w-4 h-4 text-[#EC4899] shrink-0" />
                    <span className="text-sm">Credits</span>
                    <span className="ml-auto text-xs text-white/60">{profile?.credits ?? 0}</span>
                  </div>
                  <div className="w-full h-2 bg-[rgba(255,255,255,0.04)] rounded overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#EC4899] to-[#FF6B35] transition-all duration-500" style={{ width: `${creditsPct}%` }} />
                  </div>

                  <button
                    onClick={() => alert('Upgrade flow would trigger here')}
                    className="w-full text-center font-medium py-2.5 px-4 rounded-xl bg-white/10 text-white/90 hover:bg-white/15 transition-all duration-300 border border-white/10"
                  >
                    Upgrade to creator ✨
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 justify-center py-2.5 px-4 text-[#FF6B35] hover:bg-white/5 rounded-xl transition-colors mt-1"
                  >
                    <Lucide.LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 overflow-y-auto p-6 relative z-10">
        {/* Hero / prompt */}
        <section className="w-full flex flex-col items-center justify-center min-h-[70vh] px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center bg-gradient-to-r from-[#FF6B35] to-[#EC4899] bg-clip-text text-transparent">
            What's on your mind, <span className="bg-gradient-to-r from-[#FF6B35] to-[#EC4899] bg-clip-text text-transparent">{profile?.username ?? '…'}</span>?
          </h1>

          <div className="relative w-full max-w-xl">
            <form onSubmit={handleBuild} className="w-full space-y-4">
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A retro pixel platformer on a candy planet, including clouds and candies…"
                  className="w-full p-5 pr-12 bg-[rgba(17,24,39,0.6)] backdrop-blur-sm border border-[rgba(255,255,255,0.08)] rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[hsla(255,107,53,0.3)] focus:border-[hsla(255,107,53,0.4)] resize-none min-h-[80px]"
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={!prompt.trim() || !!building}
                  className="absolute right-2.5 top-2.5 bottom-2.5 flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#FF6B35] to-[#EC4899] rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 shadow-lg"
                >
                  <Lucide.Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 bg-[rgba(255,255,255,0.03)] backdrop-blur-sm rounded-full text-xs font-medium w-fit">
                Prompt it, build it and publish it.
              </div>
            </form>
          </div>

          {building && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 w-full max-w-xl bg-[rgba(17,24,39,0.6)] backdrop-blur-sm border border-[rgba(255,255,255,0.08)] rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium truncate">{building.gameName}</span>
                <span className={`text-xs ${building.failed ? 'text-red-400' : 'text-white/60'}`}>{building.message}</span>
              </div>
              <div className="w-full h-1.5 bg-[rgba(255,255,255,0.08)] rounded overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${building.failed ? 'bg-red-400' : 'bg-gradient-to-r from-[#EC4899] to-[#FF6B35]'}`}
                  style={{ width: `${building.progress}%` }}
                />
              </div>
            </motion.div>
          )}
        </section>

        {/* Games grid */}
        <section className="w-full px-4 pb-16">
          {gamesError && (
            <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {gamesError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            <div
              onClick={() => document.querySelector('textarea')?.focus()}
              className="aspect-video bg-[rgba(17,24,39,0.4)] backdrop-blur-sm border border-[rgba(255,255,255,0.06)] rounded-2xl flex items-center justify-center cursor-pointer hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="text-6xl font-bold text-white/20">+</div>
            </div>

            {gamesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-video bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
              ))
            ) : games.map((game) => (
              <motion.div
                key={game.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * games.indexOf(game) }}
                className="relative bg-[rgba(17,24,39,0.4)] backdrop-blur-sm border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 flex flex-col"
              >
                <a href={game.previewUrl} target="_blank" rel="noreferrer" className="h-32 bg-gray-800 flex items-center justify-center text-white/40">
                  <div className="text-3xl">🎮</div>
                </a>

                <div className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="flex-1 text-sm font-medium truncate">{game.name}</h3>
                  </div>
                  <p className="text-xs text-white/50">{game.lastUpdated}</p>

                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={() => handleToggleFavorite(game)}
                      disabled={favoriteBusy.has(game.name)}
                      className={`p-2.5 rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200 ${favoriteBusy.has(game.name) ? 'opacity-50' : ''}`}
                    >
                      <Lucide.Star className={`w-4 h-4 ${game.favorite ? 'text-yellow-400 fill-yellow-400' : 'text-white/50'}`} />
                    </button>

                    <div className="relative ml-auto">
                      <button
                        onClick={() => setMenuOpenFor(menuOpenFor === game.name ? null : game.name)}
                        className="p-2.5 rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200"
                      >
                        <Lucide.MoreVertical className="w-4 h-4 text-white/50" />
                      </button>
                      <AnimatePresence>
                        {menuOpenFor === game.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            className="absolute right-0 bottom-full mb-2 w-36 bg-[rgba(17,24,39,0.9)] backdrop-blur-lg border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden z-30"
                          >
                            <button
                              onClick={() => { setRenameTarget(game); setRenameValue(game.name); setMenuOpenFor(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-[rgba(255,255,255,0.03)]"
                            >
                              <Lucide.Pencil className="w-3.5 h-3.5" /> Rename
                            </button>
                            <button
                              onClick={() => { setDeleteTarget(game); setMenuOpenFor(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-[rgba(255,255,255,0.04)]"
                            >
                              <Lucide.Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {!gamesLoading && games.length === 0 && !gamesError && (
            <p className="text-center text-white/40 text-sm mt-8">No games yet — describe one above to get started.</p>
          )}
        </section>
      </main>

      {/* Enhanced Rename modal - My design judgment as requested */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setRenameTarget(null)}>
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-[rgba(17,24,39,0.9)] backdrop-blur-lg border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 w-full max-w-md relative z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Rename game</h2>
              <button onClick={() => setRenameTarget(null)} className="p-1.5 rounded-full hover:bg-[rgba(255,255,255,0.04)] transition-colors duration-200">
                <Lucide.X className="w-4 h-4 text-white/50 hover:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#EC4899] rounded-xl flex items-center justify-center text-white font-small">
                  ✏️
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white/60 mb-1">Current name:</p>
                  <p className="font-mono text-sm bg-[rgba(255,255,255,0.04)] px-3 py-1.5 rounded-md">{renameTarget.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#4F46E5] to-[#6366F1] rounded-xl flex items-center justify-center text-white font-small">
                  ✨
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white/60 mb-1">New name:</p>
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="w-full p-3 bg-[rgba(17,24,39,0.6)] backdrop-blur-sm border border-[rgba(255,255,255,0.08)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[hsla(255,107,53,0.3)] focus:border-[hsla(255,107,53,0.4)] mb-2"
                    autoFocus
                    placeholder="Enter new game name..."
                  />
                  {renameValue && (
                    <p className="text-xs text-white/50 mt-1">{renameValue.length}/20 characters</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRenameTarget(null)}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200 border border-white/10 text-white/70"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRename}
                  className="px-4 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#EC4899] text-white hover:scale-105 transition-transform duration-300 shadow-lg"
                  disabled={!renameValue.trim()}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Enhanced Delete confirm modal - My design judgment as requested */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-[rgba(17,24,39,0.9)] backdrop-blur-lg border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 w-full max-w-md relative z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Delete "{deleteTarget.name}"?</h2>
              <button onClick={() => setDeleteTarget(null)} className="p-1.5 rounded-full hover:bg-[rgba(255,255,255,0.04)] transition-colors duration-200">
                <Lucide.X className="w-4 h-4 text-white/50 hover:text-white" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <Lucide.Trash2 className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white/60 mb-2">Are you sure you want to permanently delete this game?</p>
                  <p className="text-xs text-white/50">This action cannot be undone and will remove the game from your collection.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200 border border-white/10 text-white/70"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2.5 text-sm font-bold rounded-xl bg-red-500/80 hover:bg-red-500/90 transition-all duration-300"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}