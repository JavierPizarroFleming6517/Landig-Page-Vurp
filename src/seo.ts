import { services } from "./data/services";

export const SITE_URL = "https://vurp.cl";
export const SOCIAL_IMAGE = `${SITE_URL}/brand/logo-completo.png`;

interface PageMeta {
  path: string;
  title: string;
  description: string;
  keywords: readonly string[];
}

export const pages: readonly PageMeta[] = [
  {
    path: "/",
    title: "Vurp | Software a medida, automatización y ciberseguridad",
    description: "Desarrollamos software a medida, automatizamos procesos y ofrecemos servicios de ciberseguridad para empresas en Chile. Conoce Vurp.",
    keywords: ["software a medida Chile", "automatización de procesos", "ciberseguridad para empresas", "Vurp"],
  },
  {
    path: "/servicios/desarrollo-software-medida/",
    title: "Desarrollo de software a medida en Chile | Vurp",
    description: "Creamos software a medida, ERP, plataformas web, paneles de gestión e integraciones para empresas en Chile. Conoce el servicio de Vurp.",
    keywords: ["desarrollo de software a medida", "software a medida Chile", "desarrollo ERP", "sistemas empresariales"],
  },
  {
    path: "/servicios/automatizacion-procesos/",
    title: "Automatización de procesos empresariales | Vurp Chile",
    description: "Automatizamos procesos, tareas y flujos de trabajo; desarrollamos integraciones y chatbots para empresas en Chile. Conoce cómo trabaja Vurp.",
    keywords: ["automatización de procesos", "automatización de procesos Chile", "integración de sistemas", "chatbots para empresas"],
  },
  {
    path: "/servicios/ciberseguridad/",
    title: "Servicios de ciberseguridad para empresas en Chile | Vurp",
    description: "Auditorías, pentesting, análisis de vulnerabilidades y acompañamiento técnico en ISO 27001 y protección de datos para empresas en Chile.",
    keywords: ["ciberseguridad para empresas", "empresa de ciberseguridad Chile", "pentesting Chile", "auditoría de ciberseguridad"],
  },
] as const;

export function pageMeta(path: string) {
  const normalized = path === "/" ? "/" : `${path.replace(/\/+$/, "")}/`;
  return pages.find((page) => page.path === normalized) ?? pages[0]!;
}

export function structuredData(path: string) {
  const meta = pageMeta(path);
  const canonical = new URL(meta.path, SITE_URL).href;
  const organization = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Vurp",
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/brand/logo-completo.png`,
    email: "contacto@vurp.cl",
    description: "Empresa chilena de desarrollo de software a medida, automatización de procesos y ciberseguridad.",
    sameAs: ["https://www.linkedin.com/company/vurpspa", "https://www.facebook.com/vurpspa"],
    address: { "@type": "PostalAddress", addressLocality: "Coquimbo", addressCountry: "CL" },
    areaServed: { "@type": "Country", name: "Chile" },
  };

  if (meta.path === "/") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        organization,
        { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: "Vurp", inLanguage: "es-CL", publisher: { "@id": `${SITE_URL}/#organization` } },
      ],
    };
  }

  const service = services.find((item) => meta.path.includes(item.slug));
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      {
        "@type": "Service",
        "@id": `${canonical}#service`,
        name: service?.title,
        serviceType: service?.eyebrow,
        description: service?.lead,
        url: canonical,
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: { "@type": "Country", name: "Chile" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Servicios", item: `${SITE_URL}/#soluciones` },
          { "@type": "ListItem", position: 3, name: service?.eyebrow, item: canonical },
        ],
      },
    ],
  };
}
