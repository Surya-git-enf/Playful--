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
];

const PROJECT_FILTERS: { label: string; icon: keyof typeof Lucide }[] = [
  { label: 'All projects', icon: 'Folder' },
  { label: 'Starred', icon: 'Star' },
  { label: 'Created by me', icon: 'User' },
  { label: 'Shared with me', icon: 'Share2' },
];

const CINEMATIC_RANGE: { label: string }[] = [
  { label: 'Demo Game 01' },
  { label: 'Demo Game 02' },
  { label: 'Demo Game 03' },
  { label: 'Demo Game 04' },
];

const FEATURE_CARDS: {
  title: string;
  description: string;
  icon: keyof typeof Lucide;
}[] = [
  {
    title: 'AI Game Engine',
    description: 'Generate complete games from natural language prompts',
    icon: Lucide.Brain
  },
  {
    title: 'Smart Templates',
    description: 'Pre-built game templates for rapid development',
    icon: Lucide.Layout
  },
  {
    title: 'Collaborate & Share',
    description: 'Work with teammates and publish to multiple platforms',
    icon: Lucide.Users
  },
  {
    title: 'Track & Grow',
    description: 'Analytics and monetization tools for your games',
    icon: Lucide.TrendingUp
  },
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
        username: data.username ?? session.user.email?.split('@')[0] ?? 'Surisurya";"  }
    if (!error && data) {
      setProfile({
        username: data.username ?? session.user.email?.split('@')[0] ?? 'Surisurya',
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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Cinematic Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_20%_30%,_rgba(236,72,153,0.15)_0%,transparent_50%)]
                       bg-[radial-gradient(at_80%_70%,_rgba(255,107,53,0.15)_0%,transparent_50%)]
                       bg-[radial-gradient(at_30%_80%,_rgba(16,185,129,0.15)_0%,transparent_50%)]
                       bg-[radial-gradient(at_70%_20%,_rgba(139,92,246,0.15)_0%,transparent_50%)]"></div>
      </div>

      {/* Main Layout */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-[260px] bg-[rgba(17,24,39,0.8)] backdrop-blur-sm border-r border-[rgba(255,255,255,0.08)] flex flex-col h-screen">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-5 border-b border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B35] to-[#EC4899] rounded-xl flex items-center justify-center text-white font-bold">
                P
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#EC4899] bg-clip-text text-transparent">
                Playful
              </h1>
            </div>
            <button className="p-1 rounded hover:bg-[rgba(255,255,255,0.05)] transition-colors">
              <Lucide.X className="w-4 h-4 text-white/60 hover:text-white" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Primary Nav Items */}
            {NAV_ITEMS.map((item, index) => {
              const Icon = Lucide[item.icon] as any;
              const isActive = item.label.toLowerCase() === 'dashboard';
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * index }}
                  className={`flex items-center gap-3 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 cursor-pointer ${isActive ? 'bg-[rgba(255,107,53,0.12)]' : ''}`}
                >
                  <Icon className="w-5 h-5 text-[hsla(0,0%,100%,0.8)] hover:text-white transition-colors duration-300" />
                  <span className={`text-sm font-medium flex-1 whitespace-nowrap ${isActive ? 'font-semibold' : 'font-normal'}`}>{item.label}</span>
                  {!isActive && <div className="w-2 h-2 bg-[hsla(255,107,53,0.08)] rounded-full flex-shrink-0" />}
                </motion.div>
              );
            })}

            {/* Projects Filters Section */}
            <div className="mt-6 mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Projects Filters</h3>
              <div className="space-y-1">
                {PROJECT_FILTERS.map((item, index) => {
                  const Icon = Lucide[item.icon] as any;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * index }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 cursor-default"
                    >
                      <Icon className="w-5 h-5 text-white/60" />
                      <span className="text-sm font-medium flex-1 whitespace-nowrap">{item.label}</span>
                      <div className="w-2 h-2 bg-[hsla(255,107,53,0.08)] rounded-full flex-shrink-0" />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Cinematic Range Section */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Cinematic Range</h3>
              <div className="space-y-1">
                {CINEMATIC_RANGE.map((item, index) => {
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * index }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 cursor-default"
                    >
                      <div className="w-5 h-5 flex items-center justify-center bg-[hsla(255,107,53,0.08)] rounded-full">
                        <Lucide.Play className="w-3 h-3 text-white/60" />
                      </div>
                      <span className="text-sm font-medium flex-1 whitespace-nowrap">{item.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Bottom User Area */}
          <div className="p-4 pt-4 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#9333EA] to-[#EC4899] rounded-full flex items-center justify-center text-white font-medium">
                S
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{profileLoading ? 'Loading…' : (profile?.username ?? 'Surisurya')}</p>
                <p className="text-xs text-white/60 truncate">{profileLoading ? '' : (profile?.email ?? '')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Lucide.ChevronDown className="w-4 h-4 text-white/50" />
              <button className="p-1 rounded hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                <Lucide.LogOut className="w-4 h-4 text-[#FF6B35] hover:text-[#FF4500]" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-0 overflow-y-auto p-6">
          {/* Main Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              What's on your mind,
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#EC4899] bg-clip-text text-transparent">
                Surisurya
              </span>
            ?
            </h1>
          </div>

          {/* Prompt Input Bar */}
          <div className="mb-8">
            <div className="relative">
              <div className="flex items-center space-x-3 p-4 bg-[rgba(17,24,39,0.6)] border border-[rgba(255,255,255,0.08)] rounded-2xl">
                {/* Plus Icon Button */}
                <button className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-[#FF6B35] to-[#EC4899] rounded-full text-white">
                  <Lucide.Plus className="w-4 h-4" />
                </button>

                {/* Text Input */}
                <div className="flex-1 relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A retro pixel platformer on a candy planet, including clouds, claude, and candies..."
                    className="w-full h-full bg-transparent text-white placeholder-white/40 focus:outline-none focus:ring-0 resize-none"
                    rows={3}
                  />

                  {/* Right Side Icons */}
                  <div className="absolute right-2 flex items-center space-x-2 bottom-2">
                    {/* Plan Label */}
                    <div className="flex items-center space-x-1 text-xs text-white/60">
                      Plan
                      <Lucide.ChevronDown className="w-3 h-3" />
                    </div>

                    {/* Microphone Icon */}
                    <button className="p-1 rounded hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                      <Lucide.Mic className="w-4 h-4 text-white/60 hover:text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Build Button */}
              <button
                className="ml-4 w-14 h-10 flex items-center justify-center bg-gradient-to-r from-[#FF6B35] to-[#FFFFFF] rounded-full text-black font-medium hover:opacity-90 transition-opacity duration-300 shadow-lg"
              >
                Build
              </button>
            </div>
          </div>

          {/* Project Cards Grid */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Demo Game Cards */}
              {[0, 1, 2, 3].map((index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="relative bg-[rgba(17,24,39,0.4)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden hover:bg-[rgba(255,255,255,0.08)] transition-all duration-300"
                >
                  {/* Image Preview */}
                  <div className="h-48 bg-gradient-to-br from-[#1A1A1A] to-[#000000] flex items-center justify-center">
                    <div className="text-2xl text-white/40">
                      {['🎮', '🚀', '🌌', '⚔️'][index]}
                    </div>
                  </div>

                  {/* Favorite Icon */}
                  <button className="absolute top-2 right-2 p-1 rounded hover:bg-[rgba(255,255,255,0.08)] transition-colors">
                    <Lucide.Star className="w-4 h-4 text-white/60" />
                  </button>

                  {/* Card Footer */}
                  <div className="p-4 flex flex-col">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-[#9333EA] to-[#EC4899] rounded-full flex items-center justify-center text-white text-xs">
                        S
                      </div>
                      <span className="font-medium">{['Demo Game 01', 'Demo Game 02', 'Demo Game 03', 'Demo Game 04'][index]}</span>
                    </div>
                    <p className="text-xs text-white/50">
                      Updated {['2h ago', '1d ago', '3d ago', '1w ago'][index]}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-white/40">•••</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Create New Card */}
              <motion.div
                key="create-new"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative bg-[rgba(17,24,39,0.4)] border border-[rgba(255,255,255,0.06)] dashed border-[rgba(255,107,53,0.3)] rounded-2xl hover:bg-[rgba(255,255,255,0.08)] transition-all duration-300 cursor-pointer"
              >
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="w-12 h-12 flex items-center justify-center bg-[rgba(255,107,53,0.2)] rounded-full mb-4">
                    <Lucide.Plus className="w-6 h-6 text-[hsla(255,107,53,0.8)]" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Create New</h3>
                  <p className="text-sm text-white/50">Start a new game project</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURE_CARDS.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="bg-[rgba(17,24,39,0.4)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden hover:bg-[rgba(255,255,255,0.08)] transition-all duration-300"
                >
                  <div className="p-6 flex items-center space-x-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-[hsla(255,107,53,0.1)] rounded-full">
                      <card.icon className="w-5 h-5 text-[hsla(255,107,53,0.8)]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-md font-semibold text-white mb-2">{card.title}</h3>
                      <p className="text-sm text-white/60 mb-2">{card.description}</p>
                      <a href="#" className="text-xs font-medium bg-gradient-to-r from-[#FF6B35] to-[#EC4899] bg-clip-text text-transparent underline-offset-2 hover:underline">
                        Learn More
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}