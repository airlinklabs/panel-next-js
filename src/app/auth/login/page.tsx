"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"
import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import { Label } from "@/components/shadcn/label";
import { Checkbox } from "@/components/shadcn/checkbox";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/shadcn/button";
import { useAuth } from "@/lib/store/auth-store";
import { useTheme } from "next-themes"
import { Logo } from "@/components/ui/logo"
import { signIn, useSession } from "next-auth/react"

export default function Login() {
  const router = useRouter();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme()
  const setUser = useAuth((state) => state.setUser)

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      });
      router.push("/dashboard");
    }
  }, [session, setUser, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      router.refresh();
    } catch (error) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <section className="flex items-center justify-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="relative border border-border/50 rounded-[2rem] p-4 sm:p-8 md:p-12 bg-muted/10">
          <div className="bg-card rounded-2xl overflow-hidden shadow-lg">
            <div className="grid lg:grid-cols-2">
              <div className="relative flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 xl:p-20">
                <div className="w-full max-w-sm space-y-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Logo size="lg" />
                    <div className="space-y-2">
                      <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Welcome to AirLink</h1>
                      <p className="text-muted-foreground text-base sm:text-lg">Please enter your credentials to continue.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">{error}</div>
                      </div>
                    )}
                    <div className="space-y-5">
                      <div className="space-y-2.5">
                        <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                        <Input
                          type="email"
                          id="email"
                          placeholder="example@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 text-base"
                          required
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                        <Input
                          type="password"
                          id="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 text-base"
                          required
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="remember" className="border-muted-foreground/50" />
                          <Label htmlFor="remember" className="text-muted-foreground text-sm font-medium">Remember me</Label>
                        </div>
                        <Link 
                          href="/auth/forgot-password" 
                          className="text-sm font-medium text-primary hover:text-primary/80 transition"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 text-base font-medium"
                      >
                        {isLoading ? (
                          <LoaderCircle className="animate-spin" size={20} />
                        ) : (
                          "Sign in"
                        )}
                      </Button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-muted-foreground/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-3 text-muted-foreground">Or continue with</span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        className="w-full h-12 font-medium"
                      >
                        <svg
                          stroke="currentColor"
                          fill="currentColor"
                          strokeWidth="0"
                          version="1.1"
                          x="0px"
                          y="0px"
                          viewBox="0 0 48 48"
                          enableBackground="new 0 0 48 48"
                          className="mr-2 size-5"
                          height="1em"
                          width="1em"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill="#FFC107"
                            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
                            c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
                            c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                          />
                          <path
                            fill="#FF3D00"
                            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
                            C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                          />
                          <path
                            fill="#4CAF50"
                            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
                            c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                          />
                          <path
                            fill="#1976D2"
                            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
                            c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                          />
                        </svg>
                        Sign in with Google
                      </Button>
                    </div>
                  </form>

                  <div className="flex justify-center gap-1.5 text-sm">
                    <span className="text-muted-foreground">Don&apos;t have an account?</span>
                    <Link href="/auth/signup" className="font-medium text-primary hover:text-primary/80 transition">
                      Sign up
                    </Link>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block relative h-full min-h-[650px]">
                <Image
                  src="/login-bg.jpeg"
                  alt="placeholder"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1400px) 50vw, 700px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
