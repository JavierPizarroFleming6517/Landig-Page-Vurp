import { Menu, X } from "lucide-react";
import { useState } from "react";
import { navLinks } from "../data/content";

export function Navbar() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <header className="nav">
      <div className="nav__bar">
        <a className="nav__logo" href="#inicio" onClick={close}>
          <img src="/brand/logo-horizontal-blanco.svg" alt="Vurp" />
        </a>
        <nav className="nav__links" aria-label="Secciones">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="nav__end">
          <a className="btn btn--solid btn--small" href="#contacto">
            Cotizar proyecto
          </a>
          <button
            className="icon-btn nav__toggle"
            type="button"
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
            <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
          </button>
        </div>
      </div>
      <nav id="menu-movil" className="nav__panel" hidden={!open} aria-label="Secciones móviles">
        {navLinks.map((link) => (
          <a key={link.href} href={link.href} onClick={close}>
            {link.label}
          </a>
        ))}
        <a className="btn btn--solid" href="#contacto" onClick={close}>
          Cotizar proyecto
        </a>
      </nav>
    </header>
  );
}
