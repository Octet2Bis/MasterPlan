import { useEffect, useState } from "react";
import magnifier from "@/assets/hero-icons/magnifier.png";
import arrow from "@/assets/hero-icons/arrow.png";
import phone from "@/assets/hero-icons/phone.png";
import gear from "@/assets/hero-icons/gear.png";

export const HERO_CYCLE = [
  { key: "qa", src: magnifier, label: "QA", word: "QA" },
  { key: "growth", src: arrow, label: "Growth", word: "Growth" },
  { key: "customer", src: phone, label: "CX/CS", word: "CX/CS" },
  { key: "product", src: gear, label: "Product", word: "Product" },
] as const;

export const HERO_CYCLE_INTERVAL = 1500;

export const useHeroCycleIndex = () => {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_CYCLE.length);
    }, HERO_CYCLE_INTERVAL);
    return () => clearInterval(id);
  }, [reduced]);

  return index;
};
