import type { RefObject } from "react";

interface BrandRevealProps {
  revealRef: RefObject<HTMLDivElement | null>;
  haloRef: RefObject<HTMLDivElement | null>;
}

/**
 * Revelación del logo completo oficial (versión para fondo oscuro, con la bajada). La luminosidad es un halo de
 * escena **detrás** del logo: el logo en sí no lleva filtros, sombras ni brillos (manual de marca · 02).
 */
export function BrandReveal({ revealRef, haloRef }: BrandRevealProps) {
  return (
    <>
      <div ref={haloRef} className="welcome__halo" aria-hidden="true" />
      <div ref={revealRef} className="welcome__reveal" aria-hidden="true">
        <img src="/brand/logo-completo-oscuro.svg" alt="" width={395} height={124} draggable={false} />
      </div>
    </>
  );
}
