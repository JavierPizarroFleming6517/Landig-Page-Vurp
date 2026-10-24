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
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("inicio");
      const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 0;
      const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-height")) || 72;
      setScrolled(window.scrollY + navHeight >= heroBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
            <span className="navbar__icon">{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</span>
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

      {menuOpen && (
        <nav id="mobile-menu" className="navbar__mobile" aria-label="Navegación móvil">
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={closeMenu}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#contacto" className="btn btn--primary" onClick={closeMenu}>
            Cotizar proyecto
          </a>
        </nav>
      )}
    </header>
  );
}
