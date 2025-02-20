"use client";

import { Button } from "@/components/shadcn/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shadcn/card";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const routes = [
    {
      name: "Home",
      path: "/",
      description: "Home page"
    },
    {
      name: "Dashboard",
      path: "/dashboard",
      description: "Dashboard"
    },
    {
      name: "Console",
      path: "/dashboard/server/123e4567/console",
      description: "Console"
    },
    {
      name: "Login",
      path: "/auth/login",
      description: "Login page"
    },
    {
      name: "Account",
      path: "/account",
      description: "Account page"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Development Pages</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routes.map((route) => (
            <Card key={route.path} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle>{route.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{route.description}</p>
                <p className="text-sm text-muted-foreground mb-4">Path: {route.path}</p>
                <Button 
                  onClick={() => router.push(route.path)}
                  className="w-full"
                >
                  Access
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}