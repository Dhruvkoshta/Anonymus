"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInSchema } from "@/schemas/signInSchema";
import { bricolage_grotesque } from "@/lib/fonts";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function SignInForm() {
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof signInSchema>>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			identifier: "",
			password: "",
		},
	});

	const onSubmit = async (data: z.infer<typeof signInSchema>) => {
		setIsSubmitting(true);
		try {
			const res = await axios.post("/api/auth/login", data);
			if (res.data.success) {
				router.replace("/dashboard");
			} else {
				toast.error(res.data.message || "Login failed");
			}
		} catch (e: unknown) {
			const err = e as { response?: { data?: { message?: string } } };
			const msg = err.response?.data?.message;
			if (msg === "Please verify your account before logging in") {
				toast.error("Your verify code expired. Request a new one.");
				router.push("/send-verify-code");
			} else {
				toast.error(msg || "Incorrect username or password");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div
			className={`flex justify-center items-center min-h-screen ${bricolage_grotesque}`}
		>
			<div className='w-full max-w-xl p-8 space-y-8 rounded-lg'>
				<div className='text-center'>
					<h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl mb-5'>
						Welcome Back to Anonymous
					</h1>
					<p className='mb-4'>Sign in to continue your secret conversations</p>
				</div>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
						<FormField
							name='identifier'
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email/Username</FormLabel>
									<Input {...field} placeholder='John Doe' />
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							name='password'
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<Input type='password' {...field} placeholder='123456' />
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button
							type='submit'
							className='w-full dark:bg-white dark:hover:bg-gray-200'
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Please wait
								</>
							) : (
								"Sign In"
							)}
						</Button>
					</form>
				</Form>
				<div className='text-center mt-4'>
					<p>
						Not a member yet?{" "}
						<Link href='/sign-up' className='text-blue-400 hover:text-blue-600'>
							Sign up
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
