import { auth, Role, ROLES } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getSeverSession(){
    return await auth.api.getSession({
        headers: await headers()
    })
}
export async function requireAuth(){
    const session = await getSeverSession()
    if(!session?.user){
        redirect('/signin?callbackUrl=/me/dashboard')
    }
    return session
}
export async function requireRole(requiredRole: Role){
    const session = await requireAuth()
    if(session.user.role !== requiredRole){
        return null
    }
    return session
}

