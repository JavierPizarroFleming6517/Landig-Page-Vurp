import type { RefObject } from "react";

/** Símbolo que orbita el planeta. En la Fase 1 es una caja placeholder; en la Fase 3, el SVG oficial. */
export function OrbitLogo({ logoRef }: { logoRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={logoRef} className="welcome__logo" aria-hidden="true">
      <span>logo</span>
    </div>
  );
}
