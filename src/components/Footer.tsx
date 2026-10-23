import { Mail, MapPin, Phone } from "lucide-react";
import { contactInfo, footerColumns, socialLinks } from "../data/content";
import { Reveal } from "./ui/Reveal";
import { BrandLogo } from "./ui/BrandLogo";
import "./Footer.css";

const year = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <Reveal className="footer__top">
          <div className="footer__brand">
            <a href="#bienvenida" className="footer__logo" aria-label="Vurp, volver al inicio">
              <BrandLogo />
            </a>
            <p className="footer__tagline">
              Software a medida, chatbots y automatización con ciberseguridad integrada. Explicamos sin jerga y no
              prometemos de más.
            </p>
            <ul className="footer__social">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <li key={social.id}>
                    <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                      <Icon size={18} />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {footerColumns.map((column) => (
            <nav key={column.title} className="footer__column" aria-label={column.title}>
              <h3 className="footer__heading">{column.title}</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="footer__column">
            <h3 className="footer__heading">Contacto</h3>
            <ul className="footer__contact">
              <li>
                <Mail size={16} />
                <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
              </li>
              <li>
                <Phone size={16} />
                <a href={`tel:${contactInfo.phone.replace(/[^+\d]/g, "")}`}>{contactInfo.phone}</a>
              </li>
              <li>
                <MapPin size={16} />
                <span>{contactInfo.location}</span>
              </li>
            </ul>
          </div>
        </Reveal>

        <div className="footer__bottom">
          <p>© {year} Vurp. Todos los derechos reservados.</p>
          <p>Software & Cybersecurity</p>
        </div>
      </div>
    </footer>
  );
}
