import { ChevronDown } from "lucide-react";
import { useState, type RefObject } from "react";
import type { NavEntry, NavLink } from "../types";

interface MobileMenuProps {
  id: string;
  menu: readonly NavEntry[];
  cta: NavLink;
  panelRef: RefObject<HTMLElement | null>;
  onNavigate: () => void;
}

/** Panel del menú móvil: los grupos del header como acordeones, los enlaces directos y el CTA a ancho completo. */
export function MobileMenu({ id, menu, cta, panelRef, onNavigate }: MobileMenuProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <nav id={id} ref={panelRef} className="navbar__mobile" aria-label="Navegación móvil">
      <ul className="mobile-menu__list">
        {menu.map((entry) => {
          if (entry.kind === "link") {
            return (
              <li key={entry.label}>
                <a href={entry.href} className="mobile-menu__row" onClick={onNavigate}>
                  {entry.label}
                </a>
              </li>
            );
          }
          const isOpen = expanded === entry.id;
          const listId = `mobile-group-${entry.id}`;
          return (
            <li key={entry.id}>
              <button
                type="button"
                className="mobile-menu__row"
                aria-expanded={isOpen}
                aria-controls={listId}
                onClick={() => setExpanded(isOpen ? null : entry.id)}
              >
                {entry.label}
                <ChevronDown size={18} className="nav-dropdown__chevron" aria-hidden="true" />
              </button>
              <ul id={listId} className="mobile-menu__group" hidden={!isOpen}>
                {entry.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.label}>
                      <a href={item.href} className="nav-item" onClick={onNavigate}>
                        <span className="nav-item__icon" aria-hidden="true">
                          <Icon size={16} strokeWidth={2} />
                        </span>
                        <span className="nav-item__text">
                          <span className="nav-item__title">{item.label}</span>
                          <span className="nav-item__description">{item.description}</span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
      <a href={cta.href} className="btn btn--primary mobile-menu__cta" onClick={onNavigate}>
        {cta.label}
      </a>
    </nav>
  );
}
