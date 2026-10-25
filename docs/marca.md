# Marca Vurp (resumen del manual v1.0)

Fuente: `brand-source/Vurp - Manual de marca.pdf` (6 páginas). Si algo no está aquí, recién entonces abre el PDF.

## Personalidad
Sobria, clara y confiable. Orden antes que adorno; nada gamer, nada de estética hacker.
Voz directa, en buen chileno profesional, sin jerga y sin prometer de más.

## Paleta oficial
"Un morado en tres tonos y dos neutros cálidos. El morado manda; el resto acompaña."

| Nombre | HEX | RGB | Uso según el manual |
|---|---|---|---|
| Berenjena | `#55236F` | 85 35 111 | Color base y texto de acento |
| Orquídea | `#8B46AB` | 139 70 171 | Botones y enlaces |
| Lila | `#C9A7E4` | 201 167 228 | Tercer tono del símbolo, fondos suaves |
| Marfil | `#FAF7F2` | 250 247 242 | Fondo claro |
| Grafito | `#25232B` | 37 35 43 | Texto y fondo oscuro |

### Tonos para fondo oscuro ("claros")
| Nombre | HEX |
|---|---|
| Berenjena clara | `#9D5FC1` |
| Orquídea clara | `#B484D2` |
| Lila claro | `#E4D5F2` |

> "Sobre Grafito, Orquídea (#8B46AB) llega solo a 2,6:1 y se apaga. Por eso la versión oscura del logo
> y la interfaz nocturna usan estos tres tonos aclarados."

### Proporción de uso
Mayormente Marfil y Grafito para que todo respire; Berenjena y Orquídea como acento; Lila en pequeñas dosis.

## Contraste (WCAG, tabla del manual)
| Combinación (texto / fondo) | Ratio | Nivel | Uso |
|---|---|---|---|
| Grafito / Marfil | 14,5 | AAA | Texto general |
| Berenjena / Marfil | 10,6 | AAA | Títulos y acentos |
| Orquídea / Marfil | 5,5 | AA | Enlaces y botones |
| Lila / Marfil | 1,9 | No pasa | Solo decoración, nunca texto |
| Grafito / Lila | 7,5 | AAA | Texto sobre fondo lila |
| Marfil / Orquídea | 5,5 | AA | Texto en botón |
| Orquídea clara / Grafito | 5,3 | AA | Acento en modo oscuro |
| Lila claro / Grafito | 11,2 | AAA | Títulos en modo oscuro |

**Sobre fondo claro:** texto Grafito; títulos y acentos Berenjena; enlaces y botones Orquídea (botón: texto Marfil).
**Sobre fondo oscuro:** texto Marfil; acento Orquídea clara; títulos Lila claro. Nunca Orquídea como texto sobre Grafito.
Lila nunca como texto sobre claro.

## Modo claro / oscuro (literal del manual, sección 06 · Tokens)
```css
:root {
  --vurp-berenjena: #55236F;
  --vurp-orquidea:  #8B46AB;
  --vurp-lila:      #C9A7E4;
  --vurp-marfil:    #FAF7F2;
  --vurp-grafito:   #25232B;
  --vurp-texto:  var(--vurp-grafito);
  --vurp-fondo:  var(--vurp-marfil);
  --vurp-acento: var(--vurp-orquidea);
  --vurp-titulo: var(--vurp-berenjena);
  --vurp-fuente: "Inter", system-ui, sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root {
    --vurp-texto:  #FAF7F2;
    --vurp-fondo:  #25232B;
    --vurp-acento: #B484D2;
    --vurp-titulo: #E4D5F2;
  }
}
```
Es decir: el claro es el modo base, el oscuro sigue a `prefers-color-scheme`, y el fondo oscuro oficial es Grafito.

## Tipografía
El logotipo es un dibujo propio y no se reescribe con ninguna fuente. Para todo lo demás: **Inter**
(Google Fonts), pesos **Regular 400, Medium 500 y SemiBold 600**.

| Rol | Peso | Tamaño / interlínea | Tracking |
|---|---|---|---|
| Título | SemiBold 600 | 48 / 52 px | −2 % |
| Subtítulo | SemiBold 600 | 28 / 34 px | −1 % |
| Cuerpo | Regular 400 | 18 / 28 px | — |
| Etiqueta | Medium 500, MAYÚSCULAS | 13 px | +12 % |
| Botón | SemiBold 600 | 16 px | — |

## Logo
Símbolo de tres piezas (la V) + logotipo. Se usan juntos o por separado, **sin modificar nada**.

- **Completo, a color:** fondos claros. Es la versión principal.
- **Completo, para fondo oscuro:** sobre Grafito, con los tonos aclarados.
- **Monocromo:** una sola tinta (Grafito o Marfil) para timbres, bordados, fax y fotocopias.
- **Horizontal (sin bajada):** encabezados, firmas de correo y barras de navegación.
- **En blanco sobre Berenjena:** portadas y presentaciones.

### Archivos de `public/brand/`
| Archivo | Colores | Fondo |
|---|---|---|
| `logo-completo.svg` / `.png` | Berenjena, Orquídea, Lila + Grafito | Claro (principal) |
| `logo-completo-oscuro.svg` / `.png` | Tonos aclarados + Marfil | Oscuro (Grafito) |
| `logo-completo-blanco.svg` | Solo Marfil | Berenjena / monocromo sobre oscuro |
| `logo-completo-negro.svg` | Solo Grafito | Monocromo sobre claro o Lila |
| `logo-horizontal.svg` | Color + Grafito | Claro: header/nav |
| `logo-horizontal-oscuro.svg` | Tonos aclarados + Marfil | Oscuro (Grafito): header/nav |
| `logo-horizontal-blanco.svg` | Solo Marfil | Berenjena / monocromo |
| `logo-horizontal-negro.svg` | Solo Grafito | Monocromo sobre claro |
| `simbolo.svg` / `.png` | Berenjena, Orquídea, Lila | Claro |
| `simbolo-oscuro.svg` | Tonos aclarados | Oscuro (también favicon) |
| `simbolo-blanco.svg` | Solo Marfil | Berenjena / monocromo |
| `simbolo-negro.svg` | Solo Grafito | Monocromo |
| `wordmark-oscuro.svg` | Solo Marfil (logotipo sin símbolo) | Oscuro. El manual no lo describe |
| `app-icon-claro.svg` | Color sobre `#EFE6F7` | "Ícono claro": perfiles y avatares sobre fondos claros |

Favicon: en tamaños chicos va solo el símbolo, sobre Grafito, con los tonos aclarados.

## Área de respeto y tamaños mínimos
- Margen libre alrededor del logo = **altura del símbolo (la V)**. Ningún texto, borde ni imagen entra ahí.
- Mínimos recomendados: **completo 160 px**, **horizontal 110 px**, **símbolo 16 px**.
  Bajo 160 px la bajada «Software & Cybersecurity» no se lee: usa el horizontal o el símbolo.

## Usos prohibidos
- No estirar ni deformar.
- No rotar ni inclinar.
- No cambiar los colores de la paleta.
- No ponerlo sobre un fondo que le quite contraste ("el lila se pierde", p. ej. sobre Lila).
- No agregar sombras, brillos ni efectos.

## Notas
- Los vectores se reconstruyeron desde la imagen de la propuesta. Si aparece el original (SVG, Figma o Illustrator), conviene reemplazarlos.
- Los datos de la sociedad (razón social, RUT, dirección) son placeholders hasta que la SpA esté constituida.
