"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import LoadingScreen from "@/components/airlink/LoadingScreen";
import { LoaderCircle } from "lucide-react";
import { Label } from "@/components/shadcn/label";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/shadcn/button";
import { Textarea } from "@/components/shadcn/textarea";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Header from "@/components/airlink/Header";
import Sidebar from "@/components/airlink/Sidebar";

export default function Account() {
  const router = useRouter();
  const { toast } = useToast();
  const user = useAuth((state: any) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    description: "",
    currentPassword: "",
    newPassword: "",
  });
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    message: "Checking...",
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        username: user.username || "",
        email: user.email || "",
        description: user.description || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const validateCurrentPassword = async (password: string) => {
    try {
      const res = await fetch("/api/auth/validate-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user?.id, password }),
      });
      const data = await res.json();
      setPasswordValidation({
        isValid: data.valid,
        message: data.valid ? "Password is correct" : "Password is incorrect",
      });
      return data.valid;
    } catch (error) {
      setPasswordValidation({
        isValid: false,
        message: "Error validating password",
      });
      return false;
    }
  };

  const handleSubmit = async (type: string) => {
    setIsLoading(true);
    try {
      let endpoint = `/api/auth/update-${type}`;
      let payload = {};

      switch (type) {
        case "profile":
          payload = {
            username: formData.username,
            email: formData.email,
            description: formData.description,
          };
          break;
        case "password":
          if (!passwordValidation.isValid) {
            toast({
              title: "Error",
              description: "Current password is incorrect",
              variant: "destructive",
            });
            return;
          }
          payload = {
            email: user.email,
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          };
          break;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Success",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`,
        });
        if (type === "password") {
          router.push("/auth/login");
        } else {
          useAuth.getState().setUser(data.user);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark bg-background text-foreground">
      <LoadingScreen loading={loading} />
      <AnimatePresence>
        {!loading && (
          <motion.div
            initial={{ opacity: 0, filter: "blur(5px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(5px)" }}
            transition={{ duration: 0.5 }}
          >
            <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <main className={cn("pt-14 transition-all duration-300 ease-in-out", isSidebarOpen ? "pl-60" : "pl-0")}>
              <div className="p-6 sm:p-4 md:p-6">
                <div className="mb-8">
                  <h1 className="text-2xl font-semibold">Account Settings</h1>
                  <p className="text-muted-foreground">Manage your account information</p>
                </div>

                <div className="grid gap-6">
                  <div className="border rounded-xl p-6">
                    <h2 className="text-xl font-medium mb-4">Profile Information</h2>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          placeholder="Enter username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Enter description"
                        />
                      </div>
                      <Button
                        onClick={() => handleSubmit("profile")}
                        disabled={isLoading}
                      >
                        {isLoading ? <LoaderCircle className="animate-spin mr-2" /> : null}
                        Update Profile
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-xl p-6">
                    <h2 className="text-xl font-medium mb-4">Change Password</h2>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={formData.currentPassword}
                          onChange={async (e) => {
                            const value = e.target.value;
                            setFormData({ ...formData, currentPassword: value });
                            if (value) await validateCurrentPassword(value);
                          }}
                          placeholder="Enter current password"
                        />
                        <p className={`text-sm mt-1 ${passwordValidation.isValid ? "text-green-500" : "text-red-500"}`}>
                          {passwordValidation.message}
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          placeholder="Enter new password"
                          disabled={!passwordValidation.isValid}
                        />
                      </div>
                      <Button
                        onClick={() => handleSubmit("password")}
                        disabled={isLoading || !passwordValidation.isValid}
                      >
                        {isLoading ? <LoaderCircle className="animate-spin mr-2" /> : null}
                        Update Password
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 