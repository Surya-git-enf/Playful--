'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as Lucide from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// Define types
interface Game {
  id: string;
  name: string;
  screenshot: string | null;
  edited: string; // ISO date string
  favorite: boolean;
}

interface User {
  username: string;
  email: string;
  plan: string;
  credits: number;
  maxCredits: number;
}

// API base URLs (adjust if needed)
const GAMES_BASE_URL = '/api/games';
const USER_BASE_URL = '/api/user';

// Icon map for nav
const iconMap = {
  Dashboard: 'LayoutDashboard',
  Search: 'Search',
  'All projects': 'Folder',
  Favourites: 'Star',
  Settings: 'Settings'
};

export default function Dashboard() {
  // Games state
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Prompt modal state
  const [gameName, setGameName] = useState<string>('');
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [deleteGameId, setDeleteGameId] = useState<string | null>(null);

  // Favorite toggle loading state
  const [favoriteToggleLoading, setFavoriteToggleLoading] = useState<Set<string>>(new Set());

  // User state
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState<boolean>(true);
  const [userError, setUserError] = useState<string | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // Fetch games from API
  const fetchGames = async () => {
    try {
      setLoading(true);
      const res = await fetch(GAMES_BASE_URL);
      if (!res.ok) throw new Error('Failed to fetch games');
      const data: Game[] = await res.json();
      setGames(data);
    } catch (err: any) {
      setError(err.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data from API
  const fetchUser = async () => {
    try {
      setUserLoading(true);
      const res = await fetch(USER_BASE_URL);
      if (!res.ok) throw new Error('Failed to fetch user');
      const data: User = await res.json();
      setUser(data);
    } catch (err: any) {
      setUserError(err.message ?? 'Unknown error');
    } finally {
      setUserLoading(false);
    }
  };

  // Create a new game
  const createGame = async (name: string) => {
    try {
      const res = await fetch(GAMES_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to create game');
      const newGame: Game = await res.json();
      setGames(prev => [...prev, newGame]);
      setGameName('');
      setCreateModalOpen(false);
    } catch (err: any) {
      alert(err.message ?? 'Error creating game');
    }
  };

  // Toggle favorite
  const toggleFavorite = async (id: string) => {
    try {
      setFavoriteToggleLoading(prev => new Set([...prev, id]));
      const game = games.find(g => g.id === id);
      if (!game) return;
      const res = await fetch(`${GAMES_BASE_URL}/${id}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: !game.favorite }),
      });
      if (!res.ok) throw new Error('Failed to toggle favorite');
      const updated: Game = await res.json();
      setGames(prev =>
        prev.map(g => (g.id === id ? updated : g))
      );
    } catch (err: any) {
      alert(err.message ?? 'Error toggling favorite');
    } finally {
      setFavoriteToggleLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Delete game
  const deleteGame = async (id: string) => {
    try {
      const res = await fetch(`${GAMES_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete game');
      setGames(prev => prev.filter(g => g.id !== id));
      setDeleteModalOpen(false);
    } catch (err: any) {
      alert(err.message ?? 'Error deleting game');
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error', err);
    }
    // Redirect to home
    router.push('/');
  };

  // Load games and user on mount
  useEffect(() => {
    fetchGames();
    fetchUser();
  }, []);

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (e.target instanceof HTMLElement) {
        if (createModalOpen && !e.target.closest(".modal-content")) {
          setCreateModalOpen(false);
          setGameName('');
        }
        if (deleteModalOpen && !e.target.closest(".modal-content")) {
          setDeleteModalOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [createModalOpen, deleteModalOpen]);
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-black/80 border-r border-white/10 flex flex-col h-[100vh] fixed left-0 top-0 z-20">
          {/* Logo */}
          <div className="flex items-center p-4 border-b border-white/5">
            {/* Placeholder for logo.png */}
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF5F1F] to-[#FF2D94] rounded-xl flex items-center justify-center text-white font-bold">
              P
            </div>
            <span className="ml-3 text-xl font-bold bg-gradient-to-r from-[#FF5F1F] to-[#FF2D94] bg-clip-text text-transparent">
              Playful
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {['Dashboard', 'Search', 'All projects', 'Favourites', 'Settings'].map((item, idx) => {
              const Icon = Lucide[iconMap[item as keyof typeof iconMap]];
              return (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <Icon className="w-5 h-5 text-[#FF5F1F]" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              );
            })}
          </nav>

          {/* Recents */}
          <div className="p-4 border-t border-white/5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">Recents</h3>
            <div className="space-y-1">
              {/* Show recent games from games list (latest 3) */}
              {games
                .slice()
                .sort((a, b) => new Date(b.edited).getTime() - new Date(a.edited).getTime())
                .slice(0, 3)
                .map(game => (
                  <div key={game.id} className="text-xs text-white/70 hover:text-white transition-opacity">
                    <Lucide.FileText className="w-4 h-4 mr-2 text-white/50" />
                    {game.name}
                  </div>
                ))}
            </div>
          </div>

          {/* User Profile (Bottom) */}
          <div className="p-4 pt-6 border-t border-white/10">
            <div
              className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-white/5"
              onClick={() => { /* In real app, open user menu */ }}
            >
              {/* Avatar placeholder */}
              <div className="w-8 h-8 bg-gradient-to-br from-[#FF5F1F] to-[#FF2D94] rounded-full flex items-center justify-center text-white font-bold">
                P
              </div>
              <div>
                <p className="text-sm font-medium">{userLoading ? 'Loading...' : user?.username ?? 'playful'}</p>
                <p className="text-xs text-white/60">{userLoading ? '' : user?.email ?? 'playful@engine.ai'}</p>
              </div>
              <Lucide.ChevronDown className="ml-auto w-4 h-4 text-white/50 transition-transform duration-200"
                style={{ transform: '' }} /> {/* No menu for simplicity */}
            </div>

            {/* User Menu Popover (simplified) */}
            <div className="mt-2 w-48 bg-black/90 backdrop-blur-sm border border-white/10 rounded-xl p-4 z-30 absolute left-0 mt-2">
              <div className="flex items-center gap-3 mb-4 p-2 rounded bg-white/5">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FF5F1F] to-[#FF2D94] rounded-full flex items-center justify-center text-white font-bold">
                  P
                </div>
                <div>
                  <p className="text-sm font-medium">{userLoading ? 'Loading...' : user?.username ?? 'playful'}</p>
                  <p className="text-xs text-white/60">{userLoading ? '' : user?.email ?? 'playful@engine.ai'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded hover:bg-white/5 transition-colors">
                  <Lucide.Settings className="w-4 h-4 text-[#FF5F1F]" />
                  <span className="text-sm">Settings</span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded hover:bg-white/5 transition-colors">
                  <span className="w-2 h-2 bg-white/30 rounded-full mr-2"></span>
                  <span className="text-sm">Plan Type</span>
                  <span className="ml-auto px-2 py-0.5 text-xs bg-white/20 rounded-full">
                    {userLoading ? '...' : user?.plan ?? 'Free'}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded hover:bg-white/5 transition-colors">
                  <Lucide.Zap className="w-4 h-4 text-[#FF2D94]" />
                  <span className="text-sm">Credits</span>
                  <div className="ml-auto w-20 h-2.5 bg-white/20 rounded overflow-hidden">
                    {userLoading ? (
                      <div className="h-full bg-white/40 animate-pulse"></div>
                    ) : (
                      <>
                        {(() => {
                          const pct = user && user.maxCredits > 0
                            ? Math.min(100, (user.credits / user.maxCredits) * 100)
                            : 0;
                          return (
                            <div className="h-full bg-gradient-to-r from-[#FF2D94] to-[#FF5F1F] w-[{pct}%] transition-width duration-500"></div>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setUserLoading(false); // close menu
                    // In real app: navigate to upgrade page
                    alert('Upgrade flow would trigger here');
                  }}
                  className="w-full text-center font-bold py-2 px-4 rounded-full bg-white text-black transition-colors hover:bg-black/50"
                >
                  Upgrade to creator ✨
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 text-center py-2 px-4 text-[#FF5F1F] hover:bg-white/10 transition-colors mt-4"
                >
                  <Lucide.LogOut className="w-4 h-4 text-[#FF5F1F]" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 ml-64 overflow-y-auto snap-y snap-mandatory p-6">
          {/* Scroll Snap Container */}
          <div className="h-screen flex flex-col gap-6">
            {/* Hero/Prompt Section */}
            <section
              ref={heroRef}
              className="flex-0 snap-start w-full flex flex-col items-center justify-center min-h-[80vh] px-4"
            >
              {/* Prompt Textbox */}
              <form onSubmit={(e) => {
                e.preventDefault();
                if (gameName.trim()) {
                  createGame(gameName.trim());
                }
              }} className="w-full max-w-xl space-y-4">
                <div className="relative">
                  <textarea
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    placeholder="What kind of game would you like to create?..."
                    className="w-full p-4 bg-black/60 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5F1F] focus:border-[#FF5F1F] resize-none"
                    rows={3}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 flex items-center justify-center w-10 h-10 bg-gradient-to-r from=[#FF5F1F] to=[#FF2D94] rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Lucide.Send className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium">
                  Prompt it, build it and publish it.
                </div>
              </form>

              {/* Framer Motion for subtle parallax effect */}
              <motion.div
                className="mt-8 w-full max-w-xl text-center text-white/60"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                Create immersive AI-powered games with natural language
              </motion.div>
            </section>

            {/* Dashboard/Projects Section */}
            <section
              ref={dashboardRef}
              className="flex-0 snap-start w-full flex-1 min-h-[80vh] px-4"
            >
              {/* Create New Card + Projects Grid */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 w-full">
                {/* Create New Card */}
                <div
                  onClick={() => setCreateModalOpen(true)}
                  className="aspect-w-16 aspect-h-9 bg-black/60 border border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/5 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="text-6xl font-bold text-white/20">+</div>
                </div>

                {/* Project Cards */}
                {games.map(game => (
                  <div
                    key={game.id}
                    className="relative aspect-w-16 aspect-h-9 bg-black/60 border border-white/10 rounded-xl overflow-hidden hover:bg-white/5 transition-all duration-300"
                  >
                    {/* Screenshot Placeholder */}
                    <div className="h-[60%] bg-gray-800 flex items-center justify-center text-white/40">
                      {game.screenshot ? (
                        <img
                          src={game.screenshot}
                          alt={`${game.name} screenshot`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-2xl">🎮</div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex flex-col h-[40%] justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="flex-1 text-sm font-medium">{game.name}</h3>
                        <Lucide.Pencil className="w-4 h-4 text-white/50 hover:text-white transition-colors cursor-pointer" />
                      </div>

                      <p className="text-xs text-white/50">Edited at {new Date(game.edited).toLocaleDateString()}</p>

                      <div className="flex items-center gap-3 mt-2">
                        {/* Favorite Button */}
                        <button
                          onClick={() => toggleFavorite(game.id)}
                          disabled={favoriteToggleLoading.has(game.id)}
                          className={`p-2 rounded hover:bg-white/5 transition-colors ${game.favorite ? 'text-yellow-400' : 'text-white/50'} ${favoriteToggleLoading.has(game.id) ? 'opacity-50' : ''}`}
                        >
                          {game.favorite ? (
                            <Lucide.Star className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <Lucide.Star className="w-4 h-4 text-white/50" />
                          )}
                        </button>

                        {/* More Vertical Dropdown */}
                        <div
                          className="relative"
                          onClick={(e) => {
                            e.stopPropagation();
                            // In a real app we would open a dropdown menu; for simplicity we toggle favorite here
                            toggleFavorite(game.id);
                          }}
                        >
                          <Lucide.MoreVertical className="w-4 h-4 text-white/50 hover:text-white transition-colors cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Create Game Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative bg-black/90 backdrop-blur-sm border border-white/10 rounded-xl p-6 w-full max-w-md">
            {/* Close button */}
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute right-2 top-2 text-white/50 hover:text-white transition-colors"
            >
              <Lucide.X className="w-4 h-4" />
            </button>

            <h2 className="mb-4 text-center text-2xl font-bold">Create New Game</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (gameName.trim()) {
                createGame(gameName.trim());
              }
            }} className="space-y-4">
              <div className="relative">
                <textarea
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder="Enter game name..."
                  className="w-full p-4 bg-black/60 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF5F1F] focus:border-[#FF5F1F] resize-none"
                  rows={3}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 flex items-center justify-center w-10 h-10 bg-gradient-to-r from=[#FF5F1F] to=[#FF2D94] rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Lucide.Send className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium">
                Prompt it, build it and publish it.
              </div>

              <p className="text-xs text-white/50 text-center">
                After naming your game, you'll be taken to the workspace.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}