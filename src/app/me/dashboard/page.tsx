import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-btn";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session?.user) {
        redirect("/signin");
    }
    const role = session.user.role;
    if (role === "admin") {
        redirect("/admin/dashboard");
    } else if (role === "lab_staff") {
        redirect("/lab/dashboard");
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <LogoutButton />
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">User Information</h2>
                <div className="grid gap-2 mb-4">
                    <p><strong>Name:</strong> {session.user.name}</p>
                    <p><strong>Email:</strong> {session.user.email}</p>
                    <p><strong>Role:</strong> <span className="px-2 py-1 bg-blue-500 text-white rounded text-sm">{session.user.role}</span></p>
                    <p><strong>Email Verified:</strong> {session.user.emailVerified ? "Yes" : "No"}</p>
                </div>
                
                <details className="mt-4">
                    <summary className="cursor-pointer font-semibold mb-2">Full Session Data</summary>
                    <pre className="bg-white p-4 rounded overflow-auto text-sm">
                        {JSON.stringify(session, null, 2)}
                    </pre>
                </details>
            </div>
        </div>
    );
}