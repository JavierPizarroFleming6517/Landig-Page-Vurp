import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  CalendarCheck,
  Fingerprint,
  GitBranch,
  KeyRound,
  Layers3,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  MessagesSquare,
  Puzzle,
  Receipt,
  ScanSearch,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";

export const contact = {
  email: "hola@vurp.com",
  location: "Coquimbo, Chile",
} as const;

export const navLinks = [
  { label: "Soluciones", href: "#soluciones" },
  { label: "Plataforma", href: "#plataforma" },
  { label: "Proceso", href: "#proceso" },
  { label: "Casos", href: "#casos" },
  { label: "Preguntas", href: "#preguntas" },
] as const;

export const hero = {
  badge: "Software a medida y ciberseguridad",
  title: "Ordenamos tu operación",
  titleAccent: "en un sistema a medida.",
  lead: "Diseñamos software, automatizaciones y seguridad para la forma en que realmente trabajas. Sin plantillas genéricas y sin dejar la protección para el final.",
  actions: [
    { label: "Ver soluciones", href: "#soluciones", variant: "ghost" },
    { label: "Cotizar proyecto", href: "#contacto", variant: "solid" },
  ],
} as const;

/**
 * ERP decorativo del Hero: un sistema de operación genérico, con datos ficticios y sin nombres reales de clientes
 * ni empresas.
 */
export const heroErp = {
  workspace: "Operación",
  site: "Planta Norte",
  search: "Buscar pedido, cliente o SKU",
  user: "MR",
  /** Estados de seguridad que se alternan en la barra superior. */
  status: ["Respaldo OK · 03:00", "Accesos verificados · 24/24"],
  modules: [
    { label: "Resumen", icon: LayoutDashboard, active: true },
    { label: "Pedidos", icon: ShoppingCart, badge: "12" },
    { label: "Inventario", icon: Boxes },
    { label: "Facturación", icon: Receipt },
    { label: "Tickets", icon: LifeBuoy, badge: "4" },
    { label: "Clientes", icon: Users },
    { label: "Seguridad", icon: ShieldCheck },
  ],
  access: { title: "Accesos verificados", text: "24 de 24 sesiones con doble factor" },
  heading: { title: "Resumen de hoy", meta: "Martes 14 · Turno mañana" },
  ranges: ["Hoy", "Semana", "Mes"],
  kpis: [
    /** `ticker`: valores por los que sube el contador cuando el ERP queda vivo (el primero es el estático). */
    { label: "Pedidos hoy", value: "128", ticker: ["128", "129", "131", "132"], delta: "+12 % vs. ayer" },
    { label: "Facturado del mes", value: "$18,4 M", ticker: ["$18,4 M", "$18,5 M", "$18,6 M"], delta: "+8 % vs. mes anterior" },
    { label: "Stock crítico", value: "7 SKU", delta: "2 menos que ayer" },
    { label: "Tickets abiertos", value: "12", delta: "4 con prioridad alta" },
  ],
  sales: {
    title: "Ventas de la semana",
    total: "$4,2 M",
    days: ["L", "M", "M", "J", "V", "S", "D"],
    /** Monto vendido (línea) y pedidos (barras) por día, en unidades relativas. */
    amounts: [42, 55, 48, 63, 71, 58, 66],
    orders: [18, 22, 20, 27, 31, 24, 28],
  },
  orders: {
    title: "Pedidos recientes",
    /** Fila que entra arriba en el loop, junto con la notificación. */
    incoming: { id: "#10483", detail: "Despacho a domicilio · 4 ítems", status: "Nuevo", tone: "accent" },
    rows: [
      { id: "#10482", detail: "Retiro en tienda · 6 ítems", status: "Preparando", tone: "progress" },
      { id: "#10481", detail: "Despacho a domicilio · 2 ítems", status: "En ruta", tone: "accent" },
      { id: "#10480", detail: "Despacho a empresa · 14 ítems", status: "Facturado", tone: "done" },
      { id: "#10479", detail: "Retiro en bodega · 3 ítems", status: "Entregado", tone: "done" },
    ],
  },
  tickets: {
    title: "Tickets",
    /** Tarjeta que pasa de "En curso" a "Resuelto" en el loop. */
    moving: "Error en guía de despacho",
    columns: [
      { label: "Pendiente", cards: ["Ajuste de stock en bodega 2", "Cambio de dirección de despacho"] },
      { label: "En curso", cards: ["Error en guía de despacho", "Revisión de factura 2291"] },
      { label: "Resuelto", cards: ["Alta de usuario en bodega"] },
    ],
  },
  security: {
    title: "Seguridad",
    items: [
      { label: "Respaldo diario", value: "OK · 03:00" },
      { label: "Accesos verificados", value: "24 de 24" },
      { label: "Alertas críticas", value: "0" },
      { label: "Doble factor", value: "100 % del equipo" },
    ],
  },
  inventory: {
    title: "Inventario",
    items: [
      { label: "Caja de cartón 40×30", level: 0.18 },
      { label: "Etiqueta térmica 100×150", level: 0.34 },
      { label: "Cinta de embalaje 48 mm", level: 0.72 },
    ],
  },
  notification: { title: "Nuevo pedido #10483", meta: "Despacho a domicilio · hace 1 min" },
} as const;

export const marquee = [
  "Software a medida",
  "Automatización",
  "Ciberseguridad",
  "Integraciones",
  "Control de accesos",
  "Respaldos",
  "Chatbots",
  "Paneles de operación",
] as const;

export interface FlowStep {
  icon: LucideIcon;
  title: string;
  kicker: string;
  text: string;
}

export const flowSteps: readonly FlowStep[] = [
  {
    icon: MessagesSquare,
    kicker: "Diagnóstico",
    title: "Escuchamos la operación",
    text: "Recorremos cómo trabaja tu equipo hoy: planillas, correos, excepciones y lo que no puede fallar.",
  },
  {
    icon: Puzzle,
    kicker: "Diseño",
    title: "Definimos el sistema",
    text: "Traducimos esa operación a pantallas, datos y reglas. Tú ves el mapa antes de que escribamos el resto.",
  },
  {
    icon: Layers3,
    kicker: "Desarrollo",
    title: "Construimos a medida",
    text: "El software sigue tu flujo, no una plantilla. Cada pieza existe porque tu operación la necesita.",
  },
  {
    icon: GitBranch,
    kicker: "Integración",
    title: "Conectamos lo que ya usas",
    text: "Correo, pagos, inventario o el sistema que no vas a reemplazar. La información deja de vivir en copias.",
  },
  {
    icon: Lock,
    kicker: "Seguridad",
    title: "Cerramos los accesos",
    text: "Roles, cifrado y respaldos entran en la misma entrega. La protección no queda para una fase posterior.",
  },
  {
    icon: CalendarCheck,
    kicker: "Acompañamiento",
    title: "Dejamos todo andando",
    text: "Capacitamos a tu equipo, documentamos en español claro y seguimos cerca cuando la operación cambia.",
  },
];

export interface SolutionFeature {
  icon: LucideIcon;
  title: string;
  text: string;
}

export interface Solution {
  id: string;
  label: string;
  title: string;
  summary: string;
  features: readonly SolutionFeature[];
}

export const solutions: readonly Solution[] = [
  {
    id: "software",
    label: "Software a medida",
    title: "Un sistema para tu forma de trabajar",
    summary: "Reemplazamos el conjunto de planillas, chats y archivos sueltos por una herramienta que tu equipo entiende.",
    features: [
      {
        icon: Boxes,
        title: "Ordena",
        text: "Clientes, pedidos y tareas quedan en un solo lugar, con el mismo dato para todos.",
      },
      {
        icon: Puzzle,
        title: "Se adapta",
        text: "Los pasos son los de tu operación. No tienes que doblar el negocio para entrar en un molde.",
      },
      {
        icon: GitBranch,
        title: "Integra",
        text: "Se conecta con lo que ya funciona, en vez de obligarte a partir de cero.",
      },
      {
        icon: Sparkles,
        title: "Se entrega usable",
        text: "Pantallas claras y una puesta en marcha con tu equipo, no un manual que nadie abre.",
      },
    ],
  },
  {
    id: "automatizacion",
    label: "Automatización",
    title: "Lo repetitivo deja de ocupar el día",
    summary: "Detectamos los avisos, registros y seguimientos que hoy se hacen a mano y los encadenamos.",
    features: [
      {
        icon: ScanSearch,
        title: "Detecta",
        text: "Miramos qué tarea se repite, quién la hace y qué se pierde cuando se olvida.",
      },
      {
        icon: Workflow,
        title: "Encadena",
        text: "Un evento dispara el aviso, el registro o el siguiente paso, sin copiar y pegar.",
      },
      {
        icon: MessagesSquare,
        title: "Avisa",
        text: "El equipo recibe lo que tiene que hacer, y el cliente recibe la respuesta a tiempo.",
      },
      {
        icon: CalendarCheck,
        title: "Libera tiempo",
        text: "Las personas se quedan con las decisiones. El resto circula solo.",
      },
    ],
  },
  {
    id: "seguridad",
    label: "Ciberseguridad",
    title: "Protección dentro del mismo proyecto",
    summary: "Accesos, cifrado, respaldos y registro forman parte del sistema, no un anexo al final.",
    features: [
      {
        icon: KeyRound,
        title: "Accesos",
        text: "Cada persona ve y cambia solo lo que le corresponde.",
      },
      {
        icon: Lock,
        title: "Datos cuidados",
        text: "La información viaja y se guarda de forma que un tercero no pueda leerla.",
      },
      {
        icon: ShieldCheck,
        title: "Respaldos",
        text: "Hay copias y una forma de volver atrás si algo sale mal.",
      },
      {
        icon: Fingerprint,
        title: "Registro",
        text: "Queda constancia de quién hizo qué. Sirve para el control interno y para dormir más tranquilo.",
      },
    ],
  },
];

export const metrics = [
  { value: "A medida", label: "Nada de plantilla genérica. El sistema sigue tu operación." },
  { value: "Día 1", label: "La seguridad entra en el diseño, no cuando el sistema ya está publicado." },
  { value: "Coquimbo", label: "Hablas con quien construye. Estamos en Chile." },
] as const;

export const outcomes = [
  { title: "Menos planillas", text: "Un dato, un lugar. Se acaba la versión “final_final”." },
  { title: "Menos repetición", text: "Avisos y registros que antes dependían de que alguien se acordara." },
  { title: "Accesos claros", text: "Cada rol ve lo suyo. El resto queda fuera." },
  { title: "Equipo al día", text: "Entrega guiada y documentación en español, sin jerga de más." },
] as const;

export interface PlatformCard {
  icon: LucideIcon;
  kicker: string;
  title: string;
  text: string;
  href: string;
}

export const platform: readonly PlatformCard[] = [
  {
    icon: Layers3,
    kicker: "Software",
    title: "El sistema central",
    text: "Paneles, flujos y datos pensados para la operación diaria de tu empresa.",
    href: "#soluciones",
  },
  {
    icon: Workflow,
    kicker: "Automatización",
    title: "El trabajo que circula solo",
    text: "Seguimientos, avisos y registros que dejan de vivir en la bandeja de alguien.",
    href: "#soluciones",
  },
  {
    icon: ShieldCheck,
    kicker: "Seguridad",
    title: "La protección incluida",
    text: "Roles, cifrado, respaldos y auditoría dentro de la misma entrega.",
    href: "#soluciones",
  },
];

export interface Reason {
  title: string;
  text: string;
  chips?: readonly string[];
}

export const reasons: readonly Reason[] = [
  {
    title: "Partimos de tu operación",
    text: "Comercio, servicios, equipos internos o una mezcla de los tres. El sistema sale de cómo trabajas, no de un catálogo.",
    chips: ["Comercio", "Servicios", "Operaciones", "Equipos en crecimiento"],
  },
  {
    title: "Un solo equipo",
    text: "Quien diseña, construye y protege es el mismo grupo. No hay un relevo a mitad de camino.",
  },
  {
    title: "Seguridad incluida",
    text: "No es un extra que se cotiza cuando el software ya está listo.",
  },
  {
    title: "Integraciones reales",
    text: "Conectamos lo que ya usas en vez de pedirte que lo botes todo.",
  },
  {
    title: "Interfaces claras",
    text: "Tu equipo tiene que poder usarlo el primer día, sin un curso de una semana.",
  },
  {
    title: "Código revisado",
    text: "Nada se publica sin una pasada de revisión.",
  },
  {
    title: "Respaldos",
    text: "Hay copia y una forma concreta de recuperar.",
  },
  {
    title: "Después del lanzamiento",
    text: "Seguimos cuando la operación cambia. El sistema no se queda congelado.",
  },
  {
    title: "Español claro",
    text: "La documentación y las conversaciones van en el idioma en que trabajas.",
  },
  {
    title: "Sin humo",
    text: "Te decimos qué se puede hacer, qué no, y cuándo lo vas a tener.",
  },
];

export const studio = [
  {
    icon: MessagesSquare,
    title: "Entrega guiada",
    text: "Recorremos el sistema contigo y con quien lo va a usar. Las dudas se resuelven en esa sesión, no una semana después.",
  },
  {
    icon: Puzzle,
    title: "Ajustes con tu equipo",
    text: "Si un flujo no calza con el día real, lo corregimos antes de darlo por cerrado.",
  },
  {
    icon: ScanSearch,
    title: "Cuando algo cambia",
    text: "Un proceso nuevo o una regla distinta no implica empezar otro proyecto desde cero.",
  },
] as const;

export const cases = [
  {
    area: "Operación comercial",
    title: "Un panel en vez de cinco planillas",
    text: "Pedidos, estados y responsables viven en la misma pantalla. El equipo deja de preguntar cuál archivo es el bueno.",
  },
  {
    area: "Servicios con agenda",
    title: "Menos idas y vueltas para confirmar",
    text: "La solicitud, la hora y el recordatorio quedan encadenados. Nadie tiene que perseguir el correo.",
  },
  {
    area: "Equipo en crecimiento",
    title: "Accesos y respaldos desde el inicio",
    text: "Cada persona entra con su rol y la información tiene copia. Crecer no significa perder el control.",
  },
] as const;

export const faqs = [
  {
    q: "¿Trabajan con plantillas o todo es a medida?",
    a: "A medida. Partimos de tu operación. Si algo estándar alcanza, te lo decimos; no vamos a inventar complejidad.",
  },
  {
    q: "¿La seguridad se cotiza aparte?",
    a: "No. Accesos, cuidado de los datos y respaldos forman parte del proyecto desde el diseño.",
  },
  {
    q: "¿Tienen que botar los sistemas que ya usan?",
    a: "No. Integramos lo que conviene conservar y reemplazamos solo lo que ya no da abasto.",
  },
  {
    q: "¿Dónde están?",
    a: "En Coquimbo, Chile. Las reuniones y el acompañamiento son con el equipo que construye.",
  },
  {
    q: "¿Qué pasa después de la entrega?",
    a: "Capacitamos, documentamos y seguimos disponibles cuando el proceso cambia.",
  },
  {
    q: "¿Cómo parto?",
    a: "Escríbenos qué quieres ordenar. La primera conversación sirve para ver si tiene sentido hacer el proyecto.",
  },
] as const;

export const footerColumns = [
  {
    title: "Producto",
    links: [
      { label: "Software a medida", href: "#soluciones" },
      { label: "Automatización", href: "#soluciones" },
      { label: "Ciberseguridad", href: "#soluciones" },
      { label: "Plataforma", href: "#plataforma" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Proceso", href: "#proceso" },
      { label: "Casos de uso", href: "#casos" },
      { label: "Preguntas", href: "#preguntas" },
      { label: "Contacto", href: "#contacto" },
    ],
  },
  {
    title: "Social",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/" },
      { label: "Instagram", href: "https://www.instagram.com/" },
      { label: "GitHub", href: "https://github.com/" },
    ],
  },
] as const;
