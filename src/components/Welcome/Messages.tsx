import type { RefObject } from "react";

interface MessagesProps {
  lines: readonly string[];
  containerRef: RefObject<HTMLDivElement | null>;
  lineRefs: RefObject<Array<HTMLParagraphElement | null>>;
}

/**
 * Bloque de texto que recorre la órbita. Los tres mensajes son texto real del DOM, apilados en la misma celda
 * de una grilla (el bloque mide lo que el más largo) y se relevan solo con opacidad.
 */
export function Messages({ lines, containerRef, lineRefs }: MessagesProps) {
  return (
    <div ref={containerRef} className="welcome__messages">
      {lines.map((line, index) => (
        <p
          key={line}
          ref={(node) => {
            lineRefs.current[index] = node;
          }}
          className="welcome__line"
        >
          {line}
        </p>
      ))}
    </div>
  );
}
