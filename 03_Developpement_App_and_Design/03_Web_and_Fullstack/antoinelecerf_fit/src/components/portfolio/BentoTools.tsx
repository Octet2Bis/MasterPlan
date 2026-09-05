import { pills } from "@/data/portfolio";
import { motion } from "framer-motion";
import { Wrench } from "lucide-react";

export const BentoTools = () => {
  return (
    <section className="mt-20">
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-4xl font-black text-foreground inline-flex items-center gap-4 tracking-tight">
          <Wrench className="w-10 h-10 text-primary animate-pulse" /> Ma Boîte à Outils
        </h2>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
          Une vue d'ensemble de ma stack technique et créative, classée par domaines d'expertise.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pills.map((pill, idx) => (
          <motion.div
            key={pill.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            className="rounded-[1.5rem] p-6 bg-white/60 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(37,99,235,0.05)] hover:shadow-[0_12px_48px_0_rgba(37,99,235,0.1)] transition-all duration-300 hover:-translate-y-1"
          >
            <h3 className="text-xl font-bold mb-4 text-foreground">{pill.label}</h3>
            <div className="flex flex-wrap gap-2">
              {pill.tools.map((tool) => (
                <span 
                  key={tool} 
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-sunken text-foreground border border-border"
                >
                  {tool}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
