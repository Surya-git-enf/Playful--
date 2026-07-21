import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

// GET /api/user - get current user data
export async function GET() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401
      })
    }

    if (!user) {
      return new Response(JSON.stringify({ error: 'No user found' }), {
        status: 404
      })
    }

    // Get additional user metadata from auth.user table or similar
    // For now, we'll construct a user object from what we have
    const userData = {
      id: user.id,
      email: user.email ?? '',
      username: user.user_metadata?.username ?? user.email?.split('@')[0] ?? 'user',
      plan: user.user_metadata?.plan ?? 'Free',
      credits: user.user_metadata?.credits ?? 100,
      maxCredits: user.user_metadata?.maxCredits ?? 100,
    }

    return NextResponse.json(userData)
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500
    })
  }
}