"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { Label } from "@/components/shadcn/label";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/shadcn/button";
import { useTheme } from "next-themes";
import { Logo } from "@/components/ui/logo";
import { signIn } from "next-auth/react";

export default function Signup() {
  const router = useRouter();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    letter: false,
    number: false,
    uppercase: false
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const validatePassword = (password: string) => {
    setPasswordCriteria({
      length: password.length >= 8,
      letter: /[a-z]/.test(password),
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password)
    });
  };

  useEffect(() => {
    validatePassword(formData.password);
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { length, letter, number, uppercase } = passwordCriteria;
    if (!length || !letter || !number || !uppercase) {
      setError("Password does not meet security requirements");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create account");
      }

      // Redirect to login page on successful registration
      router.push("/auth/login");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred during registration");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <section className="flex items-center justify-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="relative border border-border/50 rounded-[2rem] p-4 sm:p-8 md:p-12 bg-muted/10">
          <div className="bg-card rounded-2xl overflow-hidden shadow-lg">
            <div className="grid lg:grid-cols-2">
              <div className="relative flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 xl:p-20">
                <div className="w-full max-w-sm space-y-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Logo />
                    <div className="space-y-2">
                      <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Create an account</h1>
                      <p className="text-muted-foreground text-base sm:text-lg">Please enter your details below.</p>
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
                        <Label htmlFor="name" className="text-foreground font-medium">Username</Label>
                        <Input
                          type="text"
                          id="name"
                          name="name"
                          placeholder="example"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-12 text-base"
                          required
                        />
                      </div>

                      <div className="space-y-2.5">
                        <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          placeholder="example@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="h-12 text-base"
                          required
                        />
                      </div>

                      <div className="space-y-2.5">
                        <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                        <Input
                          type="password"
                          id="password"
                          name="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="h-12 text-base"
                          required
                        />
                        <div className="pt-1.5">
                          <ul className="space-y-2">
                            <li className={`flex items-center gap-2 ${passwordCriteria.length ? "text-green-500" : "text-destructive"} text-sm`}>
                              {passwordCriteria.length ? "✓" : "✗"} At least 8 characters
                            </li>
                            <li className={`flex items-center gap-2 ${passwordCriteria.letter ? "text-green-500" : "text-destructive"} text-sm`}>
                              {passwordCriteria.letter ? "✓" : "✗"} At least one lowercase letter
                            </li>
                            <li className={`flex items-center gap-2 ${passwordCriteria.uppercase ? "text-green-500" : "text-destructive"} text-sm`}>
                              {passwordCriteria.uppercase ? "✓" : "✗"} At least one uppercase letter
                            </li>
                            <li className={`flex items-center gap-2 ${passwordCriteria.number ? "text-green-500" : "text-destructive"} text-sm`}>
                              {passwordCriteria.number ? "✓" : "✗"} At least one number
                            </li>
                          </ul>
                        </div>
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
                          "Sign up"
                        )}
                      </Button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-muted-foreground/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-3 text-muted-foreground">
                            Or continue with
                          </span>
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
                        Sign up with Google
                      </Button>
                    </div>
                  </form>

                  <div className="flex justify-center gap-1.5 text-sm">
                    <span className="text-muted-foreground">Already have an account?{" "}</span>
                    <Link href="/auth/login" className="font-medium text-primary hover:text-primary/80 transition">
                      Sign in
                    </Link>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block relative h-full min-h-[650px]">
                <Image
                  src="/login-bg.jpeg"
                  alt="background"
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