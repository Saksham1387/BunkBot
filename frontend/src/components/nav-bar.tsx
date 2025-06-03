"use client";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const NavBar = () => {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token); // Debug log
    console.log("Token type:", typeof token); // Debug log

    // Ensure we get a boolean value
    const isValidToken = Boolean(token && token !== "null" && token !== null);
    console.log("Is signed in:", isValidToken); // Debug log
    setIsSignedIn(isValidToken);
  }, []);

  const handleSignOut = () => {
    console.log("signing out");
    localStorage.removeItem("token"); // Better to remove instead of setting to "null"
    setIsSignedIn(false);
    router.push("/"); // Use router instead of location.reload() for better UX
  };

  // Don't render auth-dependent content until client-side hydration
  if (!isClient) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay: 0.2,
        }}
        className="p-3 text-white"
      >
        <div className="w-full h-16 flex justify-between bg-zinc-900 items-center px-5 rounded-2xl shadow-xl">
          <div className="flex flex-row gap-2 justify-normal font-bold items-center cursor-pointer">
            <motion.div
              animate={{
                rotate: 360,
                transition: {
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            >
              <Bot className="w-6 h-6" />
            </motion.div>
            <button className="text-2xl" onClick={() => router.push("/")}>
              Bunk Bot
            </button>
          </div>
          <div>
            {/* Loading state or empty div to prevent layout shift */}
            <div className="w-20 h-10"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.2,
      }}
      className="p-3 text-white"
    >
      <div className="w-full h-16 flex justify-between bg-zinc-900 items-center px-5 rounded-2xl shadow-xl">
        <div className="flex flex-row gap-2 justify-normal font-bold items-center cursor-pointer">
          <motion.div
            animate={{
              rotate: 360,
              transition: {
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          >
            <Bot className="w-6 h-6" />
          </motion.div>
          <button className="text-2xl" onClick={() => router.push("/")}>
            Bunk Bot
          </button>
        </div>
        <div className="z-10 relative">
          {isSignedIn ? (
            <Button
              className="bg-black rounded-xl hover:bg-zinc-800 cursor-pointer z-10 relative"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Sign out button clicked!");
                handleSignOut();
              }}
            >
              Sign Out
            </Button>
          ) : (
            <Button
              className="bg-black rounded-xl hover:bg-zinc-800 cursor-pointer z-10 relative"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Sign in button clicked!");
                router.push("/auth");
              }}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
