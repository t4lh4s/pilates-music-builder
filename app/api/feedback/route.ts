import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    const user = userId ? await currentUser() : null
    const body = await req.json()
    const { message, type, page } = body

    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return NextResponse.json({ error: 'Message is required (min 3 characters)' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        user_id: userId ?? null,
        user_email: user?.emailAddresses?.[0]?.emailAddress ?? null,
        message: message.trim().substring(0, 2000),
        type: type ?? 'general',
        page: page ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Feedback API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
