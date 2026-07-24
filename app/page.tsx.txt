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
  const stopPollRef = useRef<() => void>();

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
    <div className="min-h-screen bg-black text-white flex relative overflow-hidden">
      {/* Blue pulsing logo watermark */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <img
          src="/logo.png"
          alt=""
          aria-hidden
          className="w-[70vw] max-w-[900px] opacity-[0.07] animate-[logoPulse_9s_ease-in-out_infinite]"
          style={{ filter: 'brightness(0) saturate(100%) invert(48%) sepia(89%) saturate(2476%) hue-rotate(178deg) brightness(101%) contrast(101%)' }}
        />
      </div>
      <style>{`
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); opacity: 0.06; }
          50% { transform: scale(1.18); opacity: 0.11; }
        }
      `}</style>

      {/* Sidebar */}
      <aside className="w-64 bg-black/80 border-r border-white/10 flex flex-col h-screen fixed left-0 top-0 z-20">
        <div className="flex items-center p-4 border-b border-white/5">
          <div className="w-12 h-12 bg-gradient-to-br from-[#FF5F1F] to-[#FF2D94] rounded-xl flex items-center justify-center text-white font-bold">P</div>
          <span className="ml-3 text-xl font-bold bg-gradient-to-r from-[#FF5F1F] to-[#FF2D94] bg-clip-text text-transparent">Playful</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = Lucide[item.icon] as any;
            return (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                <Icon className="w-5 h-5 text-[#FF5F1F]" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Recents</h3>
          <div className="space-y-1">
            {recents.length === 0 ? (
              <p className="text-xs text-white/30">No projects yet</p>
            ) : recents.map((game) => (
              <div key={game.name} className="flex items-center text-xs text-white/70 hover:text-white transition-colors truncate">
                <Lucide.FileText className="w-4 h-4 mr-2 text-white/50 shrink-0" />
                <span className="truncate">{game.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 pt-4 border-t border-white/10 relative">
          <div
            className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-white/5"
            onClick={() => setUserMenuOpen((v) => !v)}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#FF5F1F] to-[#FF2D94] rounded-full flex items-center justify-center text-white font-bold shrink-0">
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
                className="absolute left-4 right-4 bottom-[calc(100%-4px)] bg-black/95 backdrop-blur-sm border border-white/10 rounded-xl p-4 z-30"
              >
                <div className="flex items-center gap-3 mb-4 p-2 rounded bg-white/5">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#FF5F1F] to-[#FF2D94] rounded-full flex items-center justify-center text-white font-bold">
                    {(profile?.username ?? 'P')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{profile?.username}</p>
                    <p className="text-xs text-white/60 truncate">{profile?.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-white/5 transition-colors cursor-pointer">
                    <Lucide.Settings className="w-4 h-4 text-[#FF5F1F]" />
                    <span className="text-sm">Settings</span>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded">
                    <span className="text-sm">Plan</span>
                    <span className="ml-auto px-2 py-0.5 text-xs bg-white/20 rounded-full capitalize">{profile?.plan ?? 'free'}</span>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded">
                    <Lucide.Zap className="w-4 h-4 text-[#FF2D94] shrink-0" />
                    <span className="text-sm">Credits</span>
                    <span className="ml-auto text-xs text-white/60">{profile?.credits ?? 0}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#FF2D94] to-[#FF5F1F] transition-all duration-500" style={{ width: `${creditsPct}%` }} />
                  </div>

                  <button
                    onClick={() => alert('Upgrade flow would trigger here')}
                    className="w-full text-center font-bold py-2 px-4 rounded-full bg-white text-black transition-colors hover:bg-white/80 mt-3"
                  >
                    Upgrade to creator ✨
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 justify-center py-2 px-4 text-[#FF5F1F] hover:bg-white/10 rounded transition-colors mt-1"
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
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            What's on your mind, <span className="bg-gradient-to-r from-[#FF5F1F] to-[#FF2D94] bg-clip-text text-transparent">{profile?.username ?? '…'}</span>?
          </h1>

          <form onSubmit={handleBuild} className="w-full max-w-xl space-y-4">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A retro pixel platformer on a candy planet, including clouds and candies…"
                className="w-full p-4 pr-16 bg-black/60 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5F1F] focus:border-[#FF5F1F] resize-none"
                rows={3}
              />
              <button
                type="submit"
                disabled={!prompt.trim() || !!building}
                className="absolute right-2 top-2 bottom-2 flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#FF5F1F] to-[#FF2D94] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                <Lucide.Send className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium w-fit">
              Prompt it, build it and publish it.
            </div>
          </form>

          {building && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-6 w-full max-w-xl bg-black/60 border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium truncate">{building.gameName}</span>
                <span className={`text-xs ${building.failed ? 'text-red-400' : 'text-white/60'}`}>{building.message}</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${building.failed ? 'bg-red-500' : 'bg-gradient-to-r from-[#FF2D94] to-[#FF5F1F]'}`}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
            <div
              onClick={() => document.querySelector('textarea')?.focus()}
              className="aspect-video bg-black/60 border border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/5 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="text-6xl font-bold text-white/20">+</div>
            </div>

            {gamesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-video bg-white/5 border border-white/10 rounded-xl animate-pulse" />
              ))
            ) : games.map((game) => (
              <div key={game.name} className="relative bg-black/60 border border-white/10 rounded-xl overflow-hidden hover:bg-white/5 transition-all duration-300 flex flex-col">
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
                      className={`p-2 rounded hover:bg-white/5 transition-colors ${favoriteBusy.has(game.name) ? 'opacity-50' : ''}`}
                    >
                      <Lucide.Star className={`w-4 h-4 ${game.favorite ? 'text-yellow-400 fill-yellow-400' : 'text-white/50'}`} />
                    </button>

                    <div className="relative ml-auto">
                      <button
                        onClick={() => setMenuOpenFor(menuOpenFor === game.name ? null : game.name)}
                        className="p-2 rounded hover:bg-white/5 transition-colors"
                      >
                        <Lucide.MoreVertical className="w-4 h-4 text-white/50" />
                      </button>
                      <AnimatePresence>
                        {menuOpenFor === game.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                            className="absolute right-0 bottom-full mb-2 w-36 bg-black/95 border border-white/10 rounded-lg overflow-hidden z-30"
                          >
                            <button
                              onClick={() => { setRenameTarget(game); setRenameValue(game.name); setMenuOpenFor(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10"
                            >
                              <Lucide.Pencil className="w-3.5 h-3.5" /> Rename
                            </button>
                            <button
                              onClick={() => { setDeleteTarget(game); setMenuOpenFor(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/10"
                            >
                              <Lucide.Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!gamesLoading && games.length === 0 && !gamesError && (
            <p className="text-center text-white/40 text-sm mt-8">No games yet — describe one above to get started.</p>
          )}
        </section>
      </main>

      {/* Rename modal */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setRenameTarget(null)}>
          <div className="bg-black/90 border border-white/10 rounded-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Rename game</h2>
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full p-3 bg-black/60 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF5F1F] mb-4"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRenameTarget(null)} className="px-4 py-2 text-sm text-white/60 hover:text-white">Cancel</button>
              <button onClick={handleRename} className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-[#FF5F1F] to-[#FF2D94] rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className="bg-black/90 border border-white/10 rounded-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-2">Delete "{deleteTarget.name}"?</h2>
            <p className="text-sm text-white/50 mb-4">This permanently removes the game from GitHub. This can't be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm text-white/60 hover:text-white">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-bold bg-red-500/80 hover:bg-red-500 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
