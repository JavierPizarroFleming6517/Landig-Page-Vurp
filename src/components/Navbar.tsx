import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navCta, navMenu } from "../data/content";
import type { Theme } from "../types";
import { MobileMenu } from "./MobileMenu";
import { NavDropdown } from "./NavDropdown";
import { BrandLogo } from "./ui/BrandLogo";
import "./Navbar.css";

interface NavbarProps {
  theme: Theme;
  onToggleTheme: () => void;
}

const DESKTOP_QUERY = "(min-width: 900px)";

export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLElement>(null);

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
    if (menuOpen) mobilePanelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Escape cierra lo que esté abierto; un clic fuera del header cierra los dropdowns.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenGroup(null);
      if (menuOpen) {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpenGroup(null);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  // Al pasar a escritorio (p. ej., girar la tablet) el menú móvil se cierra.
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => {
      if (query.matches) setMenuOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const themeLabel = theme === "light" ? "Activar modo oscuro" : "Activar modo claro";

  return (
    <header
      ref={headerRef}
      className={`navbar ${scrolled ? "navbar--scrolled" : ""} ${menuOpen ? "navbar--open" : ""}`}
    >
      <div className="navbar__bar">
        <a href="#bienvenida" className="navbar__logo" onClick={closeMenu} aria-label="Vurp, ir al inicio">
          <BrandLogo onDark={!scrolled && !menuOpen} />
        </a>

        <nav className="navbar__nav" aria-label="Navegación principal">
          <ul className="navbar__menu">
            {navMenu.map((entry) => (
              <li key={entry.label}>
                {entry.kind === "group" ? (
                  <NavDropdown
                    group={entry}
                    open={openGroup === entry.id}
                    onOpenChange={(open) => setOpenGroup((current) => (open ? entry.id : current === entry.id ? null : current))}
                  />
                ) : (
                  <a href={entry.href} className="navbar__link">
                    {entry.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="navbar__actions">
          <button type="button" className="navbar__icon-btn" onClick={onToggleTheme} aria-label={themeLabel}>
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <a href={navCta.href} className="btn btn--primary navbar__cta">
            {navCta.label}
          </a>
          <button
            ref={menuButtonRef}
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
        <MobileMenu id="mobile-menu" menu={navMenu} cta={navCta} panelRef={mobilePanelRef} onNavigate={closeMenu} />
      )}
    </header>
  );
}
