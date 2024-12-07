import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { Button } from "./ui/button";

export const NavBar = () => {
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
        <div className="flex flex-row gap-2 justify-normal font-bold items-center">
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
          <h1 className="text-2xl">Bunk Bot</h1>
        </div>
        <div>
          <Button
            className="bg-black rounded-xl hover:bg-black"
            onClick={() => {
              localStorage.removeItem("token");
              location.reload();
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
