import { Mail } from "lucide-react";
import { profile } from "@/data/portfolio";
import { motion } from "framer-motion";

export const FloatingActionButton = () => {
  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <a
        href={`mailto:${profile.email}`}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-[0_8px_32px_0_rgba(37,99,235,0.4)] hover:shadow-[0_12px_48px_0_rgba(37,99,235,0.6)] hover:-translate-y-1 transition-all duration-300"
        aria-label="Me contacter"
      >
        <Mail className="w-6 h-6" />
      </a>
    </motion.div>
  );
};
