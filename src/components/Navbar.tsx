import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navLinks } from "../data/content";
import type { Theme } from "../types";
import { BrandLogo } from "./ui/BrandLogo";
import "./Navbar.css";

interface NavbarProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  const { scrollY, scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const hero = document.getElementById("inicio");
    const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 0;
    const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-height")) || 72;
    setScrolled(latest + navHeight >= heroBottom);
  });

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const themeLabel = theme === "light" ? "Activar modo oscuro" : "Activar modo claro";

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""} ${menuOpen ? "navbar--open" : ""}`}>
      <div className="container navbar__inner">
        <a href="#bienvenida" className="navbar__logo" onClick={closeMenu} aria-label="Vurp, ir al inicio">
          <BrandLogo onDark={!scrolled && !menuOpen} />
        </a>

        <nav className="navbar__nav" aria-label="Navegación principal">
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="navbar__link">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="navbar__actions">
          <button type="button" className="navbar__icon-btn" onClick={onToggleTheme} aria-label={themeLabel}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="navbar__icon"
              >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>
          <a href="#contacto" className="btn btn--primary navbar__cta">
            Cotizar proyecto
          </a>
          <button
            type="button"
            className="navbar__icon-btn navbar__menu-btn"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <motion.div className="navbar__progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-menu"
            className="navbar__mobile"
            aria-label="Navegación móvil"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul>
              {navLinks.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index + 0.1 }}
                >
                  <a href={link.href} onClick={closeMenu}>
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <a href="#contacto" className="btn btn--primary" onClick={closeMenu}>
              Cotizar proyecto
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
