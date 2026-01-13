'use server'

import { auth } from "@/lib/auth";
import { LoginSchema } from "@/lib/validation/auth_zod";
import { SignInState } from "@/types/auth";

export async function signInAction(
    prevState: SignInState,
    formData: FormData
): Promise<SignInState> {
    console.log("signInAction called");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    console.log(email, password);

    const validated = LoginSchema.safeParse({
        email,
        password
    })
    console.log("Validation result:", validated);
    if(!validated.success){
        console.log(validated.error);
        return {
            error: "Please check your email and password",
        }
    }
    try{
        // Use auth.api directly instead of authClient
        const response = await auth.api.signInEmail({
            body: {
                email: validated.data.email,
                password: validated.data.password
            }
        });
        
        console.log("Auth response:", response);
        
        if(!response || !response.user){
            return {
                error: 'Invalid email or password',
            }
        }
        
        return {success: true};
    }catch(error){
        console.log("SignInAction error:", error);
        return {
            error: 'Invalid email or password',
        }
    }
}