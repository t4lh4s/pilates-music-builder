import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/?spotify_error=${error}`, request.url))
  }

  if (!code) {
    const clientId = process.env.SPOTIFY_CLIENT_ID!
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI!
    const scope = 'playlist-modify-public playlist-modify-private user-read-private user-read-email'
    const params = new URLSearchParams({ response_type: 'code', client_id: clientId, scope, redirect_uri: redirectUri })
    return NextResponse.redirect(`https://accounts.spotify.com/authorize?${params}`)
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID!
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI!

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}` },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri }),
  })

  const tokenData = await tokenRes.json()
  if (!tokenRes.ok) return NextResponse.redirect(new URL(`/?spotify_error=${tokenData.error}`, request.url))

  const redirectUrl = new URL('/', request.url)
  redirectUrl.searchParams.set('access_token', tokenData.access_token)
  return NextResponse.redirect(redirectUrl)
}
