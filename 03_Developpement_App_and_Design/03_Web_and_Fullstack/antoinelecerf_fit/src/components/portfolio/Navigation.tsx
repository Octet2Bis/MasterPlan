import { Link, useLocation } from "react-router-dom";
import { Download, Home, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const Navigation = () => {
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();

  const navItems = [
    { label: "", path: "/", icon: Home, isHome: true },
    { label: t("nav.about"), path: "/about" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full section-dark backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 h-16 flex items-center justify-between">
        <div className="flex items-center gap-1 md:gap-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative px-4 py-2 flex items-center justify-center text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-150",
                  "border border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:shadow-[1px_1px_0_0_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px]",
                  isActive ? "bg-primary text-primary-foreground border-primary shadow-[3px_3px_0_0_hsl(var(--primary))]" : "bg-background text-foreground hover:text-primary"
                )}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {item.icon && <item.icon className={cn("size-4", item.isHome && "size-5")} />}
                  {item.label && <span>{item.label}</span>}
                </span>
              </Link>
            );
          })}
          
          {/* Language toggle */}
          <div className="flex items-center bg-background border border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] ml-4 md:ml-0 hover:shadow-[1px_1px_0_0_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150">
            <button
              onClick={() => setLang("fr")}
              className={cn(
                "px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all duration-150",
                lang === "fr"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/50 hover:text-foreground"
              )}
            >
              FR
            </button>
            <div className="w-px h-5 bg-foreground/20" />
            <button
              onClick={() => setLang("en")}
              className={cn(
                "px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all duration-150",
                lang === "en"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/50 hover:text-foreground"
              )}
            >
              EN
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {/* Download CV */}
          <button
            onClick={() => alert(t("nav.download_alert"))}
            className="group inline-flex items-center gap-3 bg-primary text-primary-foreground px-4 py-2 border border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:shadow-[1px_1px_0_0_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-background hover:text-primary transition-all duration-150"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">
              {t("nav.download")}
            </span>
            <Download className="size-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
