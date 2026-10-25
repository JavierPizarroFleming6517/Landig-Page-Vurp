import { ArrowUp } from "lucide-react";
import { contact, footerColumns } from "../data/content";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__panel">
          <div className="footer__brand">
            <img src="/brand/logo-completo-oscuro.svg" alt="Vurp · Software & Cybersecurity" />
            <p>
              {contact.location}
              <br />
              {contact.email}
            </p>
          </div>
          <div className="footer__grid">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h2>{column.title}</h2>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="footer__base">
            <p>© 2026 Vurp. Software a medida y ciberseguridad.</p>
            <p>Hecho en Coquimbo.</p>
          </div>
        </div>
      </div>
      <a className="icon-btn top" href="#inicio" aria-label="Volver arriba">
        <ArrowUp size={18} />
      </a>
    </footer>
  );
}
