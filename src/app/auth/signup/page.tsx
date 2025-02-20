"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { LoaderCircle } from "lucide-react";
import { Label } from "@/components/shadcn/label";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/shadcn/button";
import { useAuth } from "@/lib/auth";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    letter: false,
    number: false
  });

  const validatePassword = (password: string) => {
    setPasswordCriteria({
      length: password.length >= 8,
      letter: /[A-Za-z]/.test(password),
      number: /\d/.test(password)
    });
  };

  useEffect(() => {
    validatePassword(formData.password);
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const { length, letter, number } = passwordCriteria;
    if (!length || !letter || !number) {
      setError("Password does not meet security requirements");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        useAuth.getState().setUser(data.user);
        router.push("/dashboard");
      } else {
        setError(data.error || "An error occurred");
        setIsLoading(false);
      }
    } catch (error) {
      setError("An error occurred during registration");
      setIsLoading(false);
    }
  };

  return (
    <section className="flex items-center justify-center dark bg-background text-white overflow-y-hidden h-screen">
      <div className="grid lg:grid-cols-2">
        <div className="relative overflow-hidden py-10">
          <div className="mx-auto my-auto flex h-full w-full max-w-md flex-col border border-dashed rounded-xl gap-4 p-6">
            <div className="mb-6 flex flex-col items-center text-center">
              <Image src="/logo.png" alt="logo" width={40} height={40} className="mb-7 h-10 w-auto" />
              <p className="mb-2 text-2xl font-bold">Create an account</p>
              <p className="text-muted-foreground">Please enter your details below.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  type="text"
                  id="username"
                  placeholder="example"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="example@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  placeholder="********"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <div className="mt-2 text-sm">
                  <ul className="space-y-1">
                    <li className={passwordCriteria.length ? "text-green-500" : "text-red-500"}>
                      {passwordCriteria.length ? "✓" : "✗"} At least 8 characters
                    </li>
                    <li className={passwordCriteria.letter ? "text-green-500" : "text-red-500"}>
                      {passwordCriteria.letter ? "✓" : "✗"} At least one letter
                    </li>
                    <li className={passwordCriteria.number ? "text-green-500" : "text-red-500"}>
                      {passwordCriteria.number ? "✓" : "✗"} At least one number
                    </li>
                  </ul>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "Sign up"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
        <Image
          src="/login-bg.jpeg"
          alt="background"
          width={700}
          height={800}
          className="hidden h-full max-h-screen w-md object-cover lg:block rounded-xl"
        />
      </div>
    </section>
  );
} 