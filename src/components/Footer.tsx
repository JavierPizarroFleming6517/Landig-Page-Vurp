import { ArrowUp, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { contact, footerBrand, footerColumns } from "../data/content";

function ChileFlag() {
  return (
    <svg className="flag" viewBox="0 0 16 12" width="16" height="12" aria-hidden="true">
      <rect width="16" height="12" fill="#d52b1e" />
      <rect width="16" height="6" fill="#fff" />
      <rect width="6" height="6" fill="#0039a6" />
      <path
        fill="#fff"
        d="M3 1.15 3.46 2.55h1.48L3.74 3.4l.46 1.4L3 3.95 1.8 4.8l.46-1.4-1.2-.85h1.48z"
      />
    </svg>
  );
}

export function Footer() {
  const picks = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<"region" | "lang" | null>(null);
  const regionId = useId();
  const langId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!picks.current?.contains(event.target as Node)) setOpen(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="footer__identity">
              <a className="footer__logo" href="#inicio">
                <img src="/brand/logo-horizontal-blanco.svg" alt="Vurp" data-theme-only="dark" />
                <img src="/brand/logo-horizontal.svg" alt="" data-theme-only="light" />
              </a>
              <div className="footer__picks" ref={picks}>
                <div className="pick">
                  <button
                    className="pick__btn"
                    type="button"
                    aria-expanded={open === "region"}
                    aria-controls={regionId}
                    onClick={() => setOpen(open === "region" ? null : "region")}
                  >
                    <ChileFlag />
                    {footerBrand.region}
                    <ChevronDown size={14} />
                  </button>
                  <ul className="pick__menu" id={regionId} hidden={open !== "region"} role="listbox">
                    <li>
                      <button type="button" role="option" aria-selected="true" onClick={() => setOpen(null)}>
                        <ChileFlag /> Chile
                      </button>
                    </li>
                  </ul>
                </div>
                <div className="pick">
                  <button
                    className="pick__btn"
                    type="button"
                    aria-expanded={open === "lang"}
                    aria-controls={langId}
                    onClick={() => setOpen(open === "lang" ? null : "lang")}
                  >
                    {footerBrand.language}
                    <ChevronDown size={14} />
                  </button>
                  <ul className="pick__menu" id={langId} hidden={open !== "lang"} role="listbox">
                    <li>
                      <button type="button" role="option" aria-selected="true" onClick={() => setOpen(null)}>
                        Español
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <p className="footer__blurb">{footerBrand.blurb}</p>
          </div>

          {footerColumns.map((column) => (
            <div className="footer__col" key={column.title}>
              <h2>{column.title}</h2>
              <ul className="footer__links">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="footer__col">
            <h2>Redes sociales</h2>
            <span className="footer__soon">Próximamente</span>
          </div>
        </div>

        <div className="footer__legal">
          <p>© 2026 Vurp. Software a medida y ciberseguridad.</p>
          <p className="footer__address">
            <img src="/brand/simbolo-blanco.svg" alt="" data-theme-only="dark" />
            <img src="/brand/simbolo.svg" alt="" data-theme-only="light" />
            <span>
              {contact.location}
              <span aria-hidden="true"> · </span>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </span>
          </p>
          <p className="footer__legal-links">
            <span className="footer__soon">Política de Privacidad</span>
            <span className="footer__soon">Términos de Servicio</span>
          </p>
        </div>
      </div>
      <a className="icon-btn top" href="#inicio" aria-label="Volver arriba">
        <ArrowUp size={18} />
      </a>
    </footer>
  );
}
