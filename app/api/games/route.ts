import { NextResponse } from 'next/server';

// In-memory storage for demo purposes
let games: Game[] = [];

interface Game {
  id: string;
  name: string;
  screenshot: string | null;
  edited: string; // ISO date string
  favorite: boolean;
}

// Helper to generate ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// GET /api/games - list all games
export async function GET() {
  return NextResponse.json(games);
}

// POST /api/games - create a new game
export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name || typeof name !== 'string') {
      return new Response(JSON.stringify({ error: 'Game name is required' }), { status: 400 });
    }

    const newGame: Game = {
      id: generateId(),
      name: name.trim(),
      screenshot: null,
      edited: new Date().toISOString(),
      favorite: false,
    };

    games.push(newGame);
    return new Response(JSON.stringify(newGame), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }
}

// DELETE /api/games/[id] - delete a game
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'Game ID is required' }), { status: 400 });
    }

    const initialLength = games.length;
    games = games.filter(game => game.id !== id);
    if (games.length === initialLength) {
      return new Response(JSON.stringify({ error: 'Game not found' }), { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete game' }), { status: 500 });
  }
}

// PATCH /api/games/[id]/favorite - toggle favorite
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'Game ID is required' }), { status: 400 });
    }

    const { favorite } = await request.json();
    if (typeof favorite !== 'boolean') {
      return new Response(JSON.stringify({ error: 'Favorite flag must be boolean' }), { status: 400 });
    }

    const gameIndex = games.findIndex(game => game.id === id);
    if (gameIndex === -1) {
      return new Response(JSON.stringify({ error: 'Game not found' }), { status: 404 });
    }

    games[gameIndex] = {
      ...games[gameIndex],
      favorite: favorite,
      edited: new Date().toISOString(),
    };

    return new Response(JSON.stringify(games[gameIndex]));
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update favorite' }), { status: 500 });
  }
}