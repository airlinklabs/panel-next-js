"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Missing credentials. Please try again.");
      return;
    }

    // here we need to make the login logik
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 border-r border-neutral-950/20">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Image
              className="h-12 w-auto rounded-xl"
              src="/image.png"
              alt="Next.js Logo"
              width={48}
              height={48}
            />
            <h2 className="mt-6 text-3xl font-medium text-neutral-800 dark:text-white">
              Sign in to Airlink
            </h2>
            <p className="mt-2 text-sm font-normal text-neutral-500">
              Please enter your account credentials below.
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-neutral-400"
                >
                  Username or Email
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="username"
                    placeholder="example"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-neutral-800/10 rounded-xl placeholder-neutral-500 focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 text-black dark:text-white sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-400"
                >
                  Password
                </label>
                <div className="mt-2">
                  <input
                    type="password"
                    id="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-neutral-800/10 rounded-xl placeholder-neutral-500 focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 text-black dark:text-white sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember-me"
                    className="h-4 w-4 text-neutral-600 focus:ring-neutral-500 border-neutral-800/10 bg-neutral-800/20 dark:border-white/10 dark:bg-white/5 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-neutral-400"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="/auth/reset-password"
                    className="font-normal text-neutral-500 hover:text-white transition"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-neutral-800/20 rounded-xl shadow-sm text-sm font-medium text-neutral-200 dark:text-neutral-800 bg-neutral-950 dark:bg-white hover:bg-neutral-900 dark:hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
                >
                  Sign in
                </button>
              </div>

              <div className="mt-6 text-sm text-neutral-500">
                Need an account?{' '}
                <a
                  href="/register"
                  className="font-normal text-neutral-500 hover:text-white transition"
                >
                  Register
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Background iamge */}
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://i.imgur.com/j9BodUY.jpeg"
          alt="Background"
        />
      </div>
    </div>
  );
}
