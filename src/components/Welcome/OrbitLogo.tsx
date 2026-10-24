import type { RefObject } from "react";

/**
 * Símbolo oficial que orbita el planeta (versión para fondo oscuro). Solo se traslada, escala de forma uniforme
 * y cambia de opacidad: nunca rota, se inclina ni lleva sombras o brillos (manual de marca · 02).
 */
export function OrbitLogo({ logoRef }: { logoRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={logoRef} className="welcome__logo" aria-hidden="true">
      <img src="/brand/simbolo-oscuro.svg" alt="" width={239} height={171} draggable={false} />
    </div>
  );
}
