import { ArrowUp, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { contact, footerBrand, footerColumns, footerSocial } from "../data/content";

const socialPaths: Record<(typeof footerSocial)[number]["label"], ReactNode> = {
  LinkedIn: (
    <path d="M4.98 3.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM.5 8.5h4V24h-4V8.5zM8.5 8.5h3.8v2.1h.06c.53-1 1.84-2.1 3.79-2.1 4.05 0 4.8 2.67 4.8 6.14V24h-4v-7.7c0-1.84-.03-4.2-2.56-4.2-2.56 0-2.95 2-2.95 4.06V24h-4V8.5z" />
  ),
  Facebook: (
    <path d="M15.1 8.5h2.4V5.2h-2.4c-2.5 0-4.2 1.8-4.2 4.4v2.1H8.2V15h2.7v7.5h3.3V15h2.7l.7-3.3h-3.4v-1.6c0-.8.5-1.6 1.6-1.6z" />
  ),
};

function SocialIcon({ name }: { name: keyof typeof socialPaths }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      {socialPaths[name]}
    </svg>
  );
}

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
            <ul className="footer__links footer__social">
              {footerSocial.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${item.label} de Vurp`}
                  >
                    <SocialIcon name={item.label} />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
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
