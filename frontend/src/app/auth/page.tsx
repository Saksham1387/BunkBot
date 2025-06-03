"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import SignUpForm from "@/components/signup";
import SignInForm from "@/components/signin";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeDialog, setActiveDialog] = useState<"signin" | "signup" | null>(
    null
  );
  const router = useRouter();
  const handleLogin = () => {
    setIsLoggedIn(true);
    setActiveDialog(null); // Explicitly set to null to close dialog
  };
  useEffect(() => {
    const res = localStorage.getItem("token");
    if (res) {
      setIsLoggedIn(true);
    }
  },[]);
  if (isLoggedIn) {
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="mb-8 text-4xl font-bold text-white">
        Welcome to Bunk Bot
      </h1>
      <div className="space-x-4">
        <Dialog
          open={activeDialog === "signin"}
          onOpenChange={(open) => {
            if (!open) {
              setActiveDialog(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setActiveDialog("signin")}>Sign In</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign In</DialogTitle>
              {/* Optionally add an explicit close button */}
              <DialogClose />
            </DialogHeader>
            <SignInForm onSuccess={handleLogin} />
          </DialogContent>
        </Dialog>

        <Dialog
          open={activeDialog === "signup"}
          onOpenChange={(open) => {
            if (!open) {
              setActiveDialog(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setActiveDialog("signup")} variant="outline">
              Sign Up
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign Up</DialogTitle>
              {/* Optionally add an explicit close button */}
              <DialogClose />
            </DialogHeader>
            <SignUpForm onSuccess={handleLogin} />
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
