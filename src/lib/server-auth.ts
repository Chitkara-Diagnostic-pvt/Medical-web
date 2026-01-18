import { auth, Role, ROLES } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export async function getServerSession(){
    const headersList = await headers()
    
    const session = await auth.api.getSession({
        headers: headersList
    })
    return session
}

export async function requireAuth(){
    const session = await getServerSession()
    
    if(!session?.user){
        redirect('/signin?callbackUrl=/me/dashboard')
    }
    return session
}

// Support single role or array of roles
export async function requireRole(allowedRoles: Role | Role[]){
    const session = await requireAuth()
    
    // Normalize to array
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
    
    // Verify role from database (not just session) for security
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    })

    if (!user) {
        redirect('/signin')
    }

    // Check if user's role is in allowed roles
    if (!roles.includes(user.role as Role)) {
        redirect('/unauthorized')
    }
    
    return { ...session, user: { ...session.user, role: user.role } }
}

// Helper to check if user has any of the specified roles (without redirect)
export async function hasRole(allowedRoles: Role | Role[]): Promise<boolean> {
    const session = await getServerSession()
    
    if (!session?.user) {
        return false
    }
    
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
    
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    })

    return user ? roles.includes(user.role as Role) : false
}

// Export role constants for convenience
export { ROLES }