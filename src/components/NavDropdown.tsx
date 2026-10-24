import { ArrowRight, ChevronDown } from "lucide-react";
import { useEffect, useRef, type FocusEvent, type KeyboardEvent, type PointerEvent } from "react";
import type { NavGroup } from "../types";

interface NavDropdownProps {
  group: NavGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Tiempo de gracia al sacar el mouse, para cruzar del botón al panel sin que se cierre. */
const CLOSE_DELAY_MS = 150;

/**
 * Dropdown del header con el patrón "disclosure" (botón con aria-expanded que muestra un panel de enlaces).
 * Abre con clic, con hover de mouse y con Flecha abajo; Escape cierra y devuelve el foco al botón.
 */
export function NavDropdown({ group, open, onOpenChange }: NavDropdownProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef(0);
  const hoverOpenedAt = useRef(0);
  const panelId = `nav-panel-${group.id}`;

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const links = () => Array.from(rootRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);
  const focusLink = (index: number) => {
    const list = links();
    list[(index + list.length) % list.length]?.focus();
  };

  const onPointerEnter = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(closeTimer.current);
    if (!open) hoverOpenedAt.current = performance.now();
    onOpenChange(true);
  };

  const onPointerLeave = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    closeTimer.current = window.setTimeout(() => onOpenChange(false), CLOSE_DELAY_MS);
  };

  // Un clic justo después de abrir por hover no debe cerrar lo que el usuario acaba de ver aparecer.
  const onClick = () => {
    if (open && performance.now() - hoverOpenedAt.current < 400) return;
    onOpenChange(!open);
  };

  const onButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    onOpenChange(true);
    window.requestAnimationFrame(() => focusLink(0));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      onOpenChange(false);
      buttonRef.current?.focus();
      return;
    }
    const list = links();
    const index = list.indexOf(document.activeElement as HTMLAnchorElement);
    if (index < 0) return;
    const moves: Record<string, number> = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: list.length - 1 };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    focusLink(next);
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (open && !rootRef.current?.contains(event.relatedTarget as Node | null)) onOpenChange(false);
  };

  return (
    <div
      ref={rootRef}
      className="nav-dropdown"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
    >
      <button
        ref={buttonRef}
        type="button"
        className="navbar__link nav-dropdown__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onClick}
        onKeyDown={onButtonKeyDown}
      >
        {group.label}
        <ChevronDown size={14} className="nav-dropdown__chevron" aria-hidden="true" />
      </button>

      <div id={panelId} className="nav-dropdown__panel" hidden={!open}>
        <ul className="nav-dropdown__list">
          {group.items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <a href={item.href} className="nav-item" onClick={() => onOpenChange(false)}>
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
        {group.footer && (
          <a href={group.footer.href} className="nav-dropdown__footer" onClick={() => onOpenChange(false)}>
            {group.footer.label}
            <ArrowRight size={14} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}
