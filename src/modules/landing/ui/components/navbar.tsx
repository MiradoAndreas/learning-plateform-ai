import { useState, useEffect } from "react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export const NavBar = () => {
  const user = useQuery(api.auth.getCurrentUser);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Détecter le défilement pour changer le style de la navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fermer le menu mobile quand on redimensionne
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = [
    { href: "#", label: "Accueil" },
    { href: "#services", label: "Services" },
    { href: "#about", label: "À propos" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <>
      {/* Navbar principale */}
      <nav
        className={`md:to-10 absolute top-5 right-0 left-0 z-50 px-4 py-3 transition-all duration-300 ease-in-out sm:px-6 sm:py-4 ${
          isScrolled || isMobileMenuOpen
            ? "border-b border-border/50 bg-background/80 shadow-sm backdrop-blur-md"
            : "bg-transparent"
        } `}
      >
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-foreground sm:text-3xl">
              <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                AI
              </span>
              <span className="text-foreground">Tutor</span>
            </div>
            <div className="hidden h-1.5 w-1.5 animate-pulse rounded-full bg-primary sm:block" />
          </div>

          {/* Liens desktop */}
          <ul className="hidden items-center gap-1 md:flex lg:gap-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="relative px-3 py-2 text-sm font-medium text-foreground/70 transition-all duration-200 before:absolute before:bottom-0 before:left-1/2 before:h-0.5 before:w-0 before:-translate-x-1/2 before:bg-primary before:transition-all before:duration-300 before:content-[''] hover:text-foreground hover:before:w-full lg:px-4 lg:text-base"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Boutons d'action */}

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="hidden text-sm font-medium text-foreground/70 transition-colors hover:text-foreground sm:inline-block">
              Connexion
            </button>
            <Link href="/sign-in">
              <InteractiveHoverButton className="text-sm sm:text-base">
                Commencer
              </InteractiveHoverButton>
            </Link>

            {/* Bouton menu mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg p-2 transition-colors hover:bg-primary/10 md:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"} `}
        >
          <div className="mt-3 space-y-1 border-t border-border/50 pt-4 pb-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block rounded-lg px-4 py-3 text-base font-medium text-foreground/70 transition-all duration-200 hover:bg-primary/5 hover:text-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="space-y-2 pt-4">
              <Link href="/sign-in">
                <button className="w-full rounded-lg px-4 py-3 text-sm font-medium text-foreground/70 transition-colors hover:bg-primary/5 hover:text-foreground">
                  Connexion
                </button>
              </Link>
              <InteractiveHoverButton className="w-full justify-center text-center">
                Commencer
              </InteractiveHoverButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Espace pour éviter que le contenu soit caché par la navbar fixe */}
      <div className="h-16 sm:h-20" />
    </>
  );
};
