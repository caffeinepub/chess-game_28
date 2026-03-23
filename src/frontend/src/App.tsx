import { Toaster } from "@/components/ui/sonner";
import { Menu, Sword, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { GamePage } from "./pages/GamePage";
import { HomePage } from "./pages/HomePage";

type View = "home" | "game";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; view: View }[] = [
    { label: "Home", view: "home" },
    { label: "Play", view: "game" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="sticky top-0 z-50 border-b border-border"
        style={{
          background: "oklch(0.15 0.022 232)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-2.5 group"
            onClick={() => setView("home")}
            data-ocid="nav.home_link"
          >
            <span
              className="text-2xl group-hover:scale-110 transition-transform"
              style={{ filter: "drop-shadow(0 1px 6px rgba(199,161,90,0.6))" }}
            >
              ♛
            </span>
            <span
              className="text-lg font-bold tracking-[0.15em] uppercase hidden sm:block"
              style={{ color: "oklch(0.70 0.12 70)" }}
            >
              Onyx Chess
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                type="button"
                key={link.view}
                className={`text-sm font-medium pb-0.5 transition-colors ${
                  view === link.view
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setView(link.view)}
                data-ocid={`nav.${link.view}_link`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden md:flex items-center gap-2 bg-muted/50 hover:bg-muted rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border"
              data-ocid="nav.profile_button"
            >
              <Sword className="w-3.5 h-3.5" />
              <span>Player</span>
            </button>
            <button
              type="button"
              className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen((o) => !o)}
              data-ocid="nav.menu_button"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border overflow-hidden"
              style={{ background: "oklch(0.15 0.022 232)" }}
            >
              <div className="px-4 py-3 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <button
                    type="button"
                    key={link.view}
                    className={`text-sm py-2 text-left transition-colors ${
                      view === link.view
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => {
                      setView(link.view);
                      setMobileMenuOpen(false);
                    }}
                    data-ocid={`nav.${link.view}_link`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto">
        <AnimatePresence mode="wait">
          {view === "home" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <HomePage onPlay={() => setView("game")} />
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="pt-6"
            >
              <GamePage onHome={() => setView("home")} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer
        className="border-t border-border py-4 text-center text-xs text-muted-foreground"
        style={{ background: "oklch(0.15 0.022 232)" }}
      >
        © {new Date().getFullYear()}. Built with{" "}
        <span className="text-primary">♥</span> using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary/80 hover:text-primary transition-colors"
        >
          caffeine.ai
        </a>
      </footer>

      <Toaster />
    </div>
  );
}
