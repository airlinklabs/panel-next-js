"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"

import { LoaderCircle } from "lucide-react";
import { Label } from "@/components/shadcn/label";
import { Checkbox } from "@/components/shadcn/checkbox";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/shadcn/button";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, submitLoginLoader] = useState<boolean>(false);

  const handleClick = (e: React.MouseEvent) => {
    submitLoginLoader(true);
    setTimeout(() => handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>), 500);
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username || !password) {
      submitLoginLoader(false);
      alert("Missing credentials. Please try again.");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.status === 401) {
        submitLoginLoader(false);
        alert("Invalid Username or Password.")
      }

      if (res.status === 200) {
        useAuth.getState().setUser(data.user);
        router.push("/dashboard");
      } else {
        submitLoginLoader(false);
        setError(data.error || "An error occurred");
      }
    } catch (error) {
      submitLoginLoader(false);
      console.error("Error logging in:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <section className="flex items-center justify-center dark bg-background text-white overflow-y-hidden h-screen">
      <div className="">
        <div className="grid lg:grid-cols-2">
          <div className="relative overflow-hidden py-10">
            <div className="mx-auto my-auto flex h-full w-full max-w-md flex-col border border-dashed rounded-xl gap-4 p-6">
              <div className="mb-6 flex flex-col items-center text-center">
                <Image src="/logo.png" alt="logo" width={40} height={40} className="mb-7 h-10 w-auto" />
                <p className="mb-2 text-2xl font-bold">Welcome to AirLink</p>
                <p className="text-muted-foreground">Please enter your credentials to continue.</p>
              </div>
              <div className="w-full rounded-md bg-background">
                <div>
                  <div className="grid gap-4">
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="username">Email</Label>
                      <Input
                        type="text"
                        id="username"
                        placeholder="example"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="text-base md:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          type="password"
                          id="password"
                          placeholder="********"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="text-base md:text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" className="border-muted-foreground" />
                        <Label htmlFor="remember" className="text-neutral-400">Remember me</Label>
                      </div>
                      <Link href="#" className="text-sm font-medium text-neutral-400 hover:text-neutral-300 transition duration-300">
                        Forgot password?
                      </Link>
                    </div>
                    <Button
                    type="submit"
                      onClick={handleClick}
                      disabled={isLoading}
                      data-loading={isLoading}
                      className="group relative disabled:opacity-100"
                    >
                      <span className="group-data-[loading=true]:text-transparent">Sign in</span>
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <LoaderCircle className="animate-spin" size={16} strokeWidth={2} aria-hidden="true" />
                        </div>
                      )}
                    </Button>
                    <Button variant="outline" className="w-full">
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
                </div>
              </div>
              <div className="mx-auto mt-3 flex justify-center gap-1 text-sm text-muted-foreground">
                <p>Don&apos;t have an account?</p>
                <Link href="#" className="font-medium text-primary">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
          <Image
            src="/login-bg.jpeg"
            alt="placeholder"
            width={700}
            height={800}
            className="hidden h-full max-h-screen w-md object-cover lg:block rounded-xl"
          />
        </div>
      </div>
    </section>
  );
}
