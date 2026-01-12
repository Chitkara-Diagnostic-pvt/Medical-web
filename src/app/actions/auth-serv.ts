'use server'

import { authClient } from "@/lib/auth-cilent";
import { LoginSchema } from "@/lib/validation/auth_zod";
import { redirect } from "next/navigation";
import { error } from "console";

export async function SignInAction(formData: FormData){
    console.log(formData);
    const email = formData.get('email')
    const password = formData.get('password')
    console.log(email, password);

    const validated = LoginSchema.safeParse({
        email,
        password
    })
    if(!validated.success){
        console.log(validated.error);
        return {
            error: "Please check your email and password",
        }
    }
    try{
        const {data, error} = await authClient.signIn.email({
            email: validated.data.email,
            password: validated.data.password
        })
        if(error){
            return {
                error: "Invalid email or password",
            }
        }
        if(!data || !data.user){
            return {
                error: 'No user data returned',
            }
        }
        //after role added then do this 

        // const roleredirects = {
        //     user: "/me/dashboard",
        //     lab_staff: "/lab/dashboard",
        //     admin: "/admin/dashboard",
        // }
        // const redirectUrl = roleredirects[data.user.];
        
        return redirect("/me/dashboard");
    }catch(error){
        console.log("SignInAction error:", error);
        return {
            error: 'An unexpected error occurred',
        }
    }
}