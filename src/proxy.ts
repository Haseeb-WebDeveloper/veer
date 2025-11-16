import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Run the proxy/middleware logic for auth/session
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - fonts from public folder (any file in /fonts/)
     * - public folder assets (common font extensions: woff, woff2, ttf, otf, eot)
     */
    '/((?!_next/static|_next/image|favicon.ico|fonts/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|otf|eot)$).*)',
  ],
}
