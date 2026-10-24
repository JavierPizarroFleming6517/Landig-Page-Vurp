import {
  Bot,
  Boxes,
  DatabaseBackup,
  Eye,
  Fingerprint,
  Gauge,
  Handshake,
  KeyRound,
  Lock,
  Puzzle,
  ScanSearch,
  ServerCog,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { GitHubIcon, InstagramIcon, LinkedInIcon } from "../components/ui/BrandIcons";
import type {
  ContactInfo,
  FooterColumn,
  HeroContent,
  ImageAsset,
  IntroContent,
  NavLink,
  SecurityFeature,
  SecurityStat,
  ShowcaseScene,
  SocialLink,
  Solution,
  ValueProp,
} from "../types";

const unsplash = (id: string, alt: string, width = 1920): ImageAsset => ({
  src: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`,
  alt,
});

export const navLinks: readonly NavLink[] = [
  { label: "Propuesta", href: "#propuesta" },
  { label: "Cómo trabajamos", href: "#proceso" },
  { label: "Soluciones", href: "#soluciones" },
  { label: "Seguridad", href: "#seguridad" },
];

export const hero: HeroContent = {
  eyebrow: "Software & Cybersecurity",
  title: "Software a medida que",
  highlight: "ordena tu empresa.",
  description:
    "Diseñamos sistemas, chatbots y automatizaciones pensados para tu operación real. Con la seguridad incluida desde el primer día, no como un agregado.",
  primaryCta: { label: "Hablemos de tu proyecto", href: "#contacto" },
  secondaryCta: { label: "Ver soluciones", href: "#soluciones" },
  background: unsplash(
    "photo-1550751827-4bd374c3f58b",
    "Abstracción tecnológica con tonos morados y azules",
  ),
};

export const intro: IntroContent = {
  tagline: "Software & Cybersecurity",
};

export const welcomeLines = [
  "Transformamos ideas en tecnología.",
  "Desarrollamos soluciones para desafíos reales.",
  "Protegemos lo que construyes.",
] as const;

export const valueProps: readonly ValueProp[] = [
  {
    id: "orden",
    icon: Puzzle,
    title: "Un sistema, no diez planillas",
    description: "Centralizamos la información que hoy vive dispersa entre archivos, correos y chats.",
    detail: "Menos doble carga, menos errores y datos en los que se puede confiar.",
  },
  {
    id: "tiempo",
    icon: Gauge,
    title: "Tareas repetitivas, automatizadas",
    description: "Identificamos los procesos que consumen horas y los resolvemos con software.",
    detail: "Tu equipo se enfoca en lo que realmente necesita criterio humano.",
  },
  {
    id: "claridad",
    icon: Eye,
    title: "Explicamos sin jerga",
    description: "Cada decisión técnica se traduce a impacto concreto en tu negocio.",
    detail: "Sabes qué estás comprando, cuánto cuesta y qué vas a obtener.",
  },
  {
    id: "honestidad",
    icon: Handshake,
    title: "No prometemos de más",
    description: "Plazos realistas, alcance definido y entregas parciales que puedes probar.",
    detail: "Si algo no conviene desarrollarlo, te lo decimos.",
  },
];

export const showcaseScenes: readonly ShowcaseScene[] = [
  {
    id: "diagnostico",
    step: "01",
    title: "Diagnóstico",
    description: "Entendemos cómo trabaja tu equipo hoy antes de escribir una sola línea de código.",
    bullets: ["Relevamiento de procesos", "Puntos de fricción priorizados", "Propuesta con alcance claro"],
    image: unsplash("photo-1522071820081-009f0129c71c", "Equipo de trabajo reunido frente a una laptop"),
  },
  {
    id: "diseno",
    step: "02",
    title: "Diseño",
    description: "Definimos la arquitectura y las pantallas junto a quienes van a usar el sistema.",
    bullets: ["Prototipos navegables", "Arquitectura escalable", "Seguridad desde el diseño"],
    image: unsplash("photo-1558494949-ef010cbdcc31", "Sala de servidores iluminada"),
  },
  {
    id: "desarrollo",
    step: "03",
    title: "Desarrollo",
    description: "Construimos por etapas, con entregas frecuentes que puedes revisar y validar.",
    bullets: ["Entregas cada dos semanas", "Código revisado y probado", "Visibilidad total del avance"],
    image: unsplash("photo-1555066931-4365d14bab8c", "Código fuente en un monitor oscuro"),
  },
  {
    id: "soporte",
    step: "04",
    title: "Soporte",
    description: "El software sigue vivo después de la entrega: lo mantenemos, medimos y mejoramos.",
    bullets: ["Monitoreo continuo", "Actualizaciones de seguridad", "Mejoras según el uso real"],
    image: unsplash("photo-1551288049-bebda4e38f71", "Panel de métricas y gráficos en pantalla"),
  },
];

export const solutions: readonly Solution[] = [
  {
    id: "erp",
    icon: Boxes,
    name: "ERPs a medida",
    tagline: "Toda tu operación en un solo lugar",
    description:
      "Stock, ventas, compras, facturación y reportes conectados entre sí y adaptados a cómo trabaja tu empresa, no al revés.",
    benefits: [
      "Módulos según tus procesos reales",
      "Reportes en tiempo real para decidir mejor",
      "Integración con sistemas que ya usas",
      "Permisos por rol y trazabilidad de cambios",
    ],
    ctaLabel: "Consultar por un ERP",
    image: unsplash("photo-1460925895917-afdab827c52f", "Laptop mostrando un panel de gestión"),
  },
  {
    id: "chatbots",
    icon: Bot,
    name: "Chatbots",
    tagline: "Atención inmediata, sin perder el trato humano",
    description:
      "Asistentes para WhatsApp, web o canales internos que responden consultas frecuentes, toman pedidos y derivan a una persona cuando hace falta.",
    benefits: [
      "Disponibles las 24 horas",
      "Conectados a tu base de datos y stock",
      "Derivación a un agente cuando corresponde",
      "Conversaciones registradas y auditables",
    ],
    ctaLabel: "Consultar por un chatbot",
    image: unsplash("photo-1620712943543-bcc4688e7485", "Representación abstracta de inteligencia artificial"),
  },
  {
    id: "automatizacion",
    icon: Workflow,
    name: "Automatización",
    tagline: "Procesos que se resuelven solos",
    description:
      "Conectamos tus herramientas para que la información fluya sin copiar y pegar: altas, notificaciones, conciliaciones y reportes automáticos.",
    benefits: [
      "Menos tareas manuales y errores de carga",
      "Flujos entre sistemas que hoy no se hablan",
      "Alertas cuando algo requiere atención",
      "Ahorro de horas medible desde el primer mes",
    ],
    ctaLabel: "Consultar por automatización",
    image: unsplash("photo-1518770660439-4636190af475", "Primer plano de una placa de circuitos"),
  },
];

export const securityBackground: ImageAsset = unsplash(
  "photo-1563986768609-322da13575f3",
  "Laptop con candado que representa seguridad informática",
);

export const securityFeatures: readonly SecurityFeature[] = [
  {
    id: "cifrado",
    icon: Lock,
    title: "Datos cifrados",
    description: "La información viaja y se guarda cifrada. Si alguien la intercepta, no puede leerla.",
  },
  {
    id: "accesos",
    icon: KeyRound,
    title: "Control de accesos",
    description: "Cada persona ve y modifica solo lo que necesita, con autenticación robusta.",
  },
  {
    id: "respaldos",
    icon: DatabaseBackup,
    title: "Respaldos automáticos",
    description: "Copias de seguridad periódicas y probadas para recuperar todo ante un imprevisto.",
  },
  {
    id: "auditoria",
    icon: ScanSearch,
    title: "Auditoría y registros",
    description: "Queda registro de quién hizo qué y cuándo. Útil para control interno y cumplimiento.",
  },
  {
    id: "infraestructura",
    icon: ServerCog,
    title: "Infraestructura mantenida",
    description: "Servidores actualizados y monitoreados para cerrar vulnerabilidades a tiempo.",
  },
  {
    id: "identidad",
    icon: Fingerprint,
    title: "Buenas prácticas OWASP",
    description: "Desarrollamos siguiendo estándares reconocidos para prevenir los ataques más comunes.",
  },
];

export const securityStats: readonly SecurityStat[] = [
  { id: "revision", value: 100, suffix: "%", label: "del código revisado antes de publicarse" },
  { id: "respaldo", value: 24, suffix: "h", label: "como máximo entre respaldos" },
  { id: "monitoreo", value: 365, suffix: "", label: "días al año de monitoreo" },
];

export const securityBadge = {
  icon: ShieldCheck,
  label: "Seguridad incluida en cada proyecto",
} as const;

export const ctaBackground: ImageAsset = unsplash(
  "photo-1531297484001-80022131f5a1",
  "Abstracción tecnológica en tonos morados",
);

export const contactInfo: ContactInfo = {
  email: "hola@vurp.com",
  phone: "+56 9 0000 0000",
  location: "Coquimbo, Chile",
};

export const footerColumns: readonly FooterColumn[] = [
  {
    title: "Soluciones",
    links: [
      { label: "ERPs a medida", href: "#soluciones" },
      { label: "Chatbots", href: "#soluciones" },
      { label: "Automatización", href: "#soluciones" },
      { label: "Ciberseguridad", href: "#seguridad" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Propuesta de valor", href: "#propuesta" },
      { label: "Cómo trabajamos", href: "#proceso" },
      { label: "Contacto", href: "#contacto" },
    ],
  },
];

export const socialLinks: readonly SocialLink[] = [
  { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/", icon: LinkedInIcon },
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/", icon: InstagramIcon },
  { id: "github", label: "GitHub", href: "https://github.com/", icon: GitHubIcon },
];
