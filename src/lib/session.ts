import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getSession() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    return session;
}

export async function requireAuth() {
    const session = await getSession()

    if (!session) {
        redirect("/signin")
    }
    return session;
}

export async function getCurrentUser() {
    const session = await getSession();
    return session?.user || null;
}

export async function requireRole(allowedRoles: string[]) {
    const session = await requireAuth();
    if (!allowedRoles.includes(session.user.role)) {
        redirect("/");
    }
    return session;
}