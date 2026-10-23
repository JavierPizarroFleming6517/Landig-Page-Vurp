import "./BrandLogo.css";

interface BrandLogoProps {
  className?: string;
  /** Fuerza la versión para fondo oscuro (p. ej. sobre el hero). */
  onDark?: boolean;
}

export function BrandLogo({ className = "", onDark = false }: BrandLogoProps) {
  return (
    <span className={`brand-logo ${onDark ? "brand-logo--on-dark" : ""} ${className}`}>
      <img
        className="brand-logo__img brand-logo__img--light"
        src="/brand/logo-horizontal.svg"
        alt="Vurp"
        width={395}
        height={102}
      />
      <img
        className="brand-logo__img brand-logo__img--dark"
        src="/brand/logo-horizontal-oscuro.svg"
        alt=""
        aria-hidden="true"
        width={395}
        height={102}
      />
    </span>
  );
}
