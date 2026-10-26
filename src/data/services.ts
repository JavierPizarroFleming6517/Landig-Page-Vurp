import { Bot, ChartNoAxesCombined, CloudCog, CodeXml, DatabaseZap, FileSearch, GitBranch, LayoutDashboard, LockKeyhole, ScanSearch, ShieldCheck, Workflow } from "lucide-react";

export interface ServiceContent {
  slug: string;
  eyebrow: string;
  title: string;
  lead: string;
  problemTitle: string;
  problemText: string;
  includes: readonly { title: string; text: string; icon: typeof CodeXml }[];
  process: readonly { title: string; text: string }[];
  audience: readonly string[];
  faqs: readonly { question: string; answer: string }[];
  related: readonly { label: string; href: string }[];
}

export const services: readonly ServiceContent[] = [
  {
    slug: "desarrollo-software-medida",
    eyebrow: "Desarrollo de software",
    title: "Software a medida para ordenar y conectar tu operación",
    lead: "Diseñamos sistemas empresariales, plataformas web, paneles de gestión e integraciones adaptadas a la forma real en que trabaja tu organización.",
    problemTitle: "Cuando las herramientas genéricas ya no alcanzan",
    problemText: "Las planillas aisladas, los datos duplicados y los pasos manuales dificultan el control de una operación. Un sistema a medida puede reunir la información, reflejar reglas propias del negocio y conectar las herramientas que ya cumplen una función.",
    includes: [
      { title: "Sistemas de gestión", text: "Herramientas para centralizar procesos, responsables, estados e información operativa.", icon: LayoutDashboard },
      { title: "ERP a medida", text: "Módulos definidos según el alcance del proyecto, sin obligar a la empresa a adoptar un flujo genérico.", icon: DatabaseZap },
      { title: "Plataformas y aplicaciones web", text: "Interfaces accesibles desde el navegador para equipos, clientes o proveedores, según cada necesidad.", icon: CodeXml },
      { title: "Integraciones de software", text: "Conexiones entre aplicaciones y servicios para reducir registros duplicados y mantener datos consistentes.", icon: GitBranch },
    ],
    process: [
      { title: "Entendemos el proceso", text: "Revisamos objetivos, usuarios, reglas y puntos de fricción antes de proponer una solución." },
      { title: "Definimos el alcance", text: "Priorizamos funciones y acordamos entregables claros para construir sobre decisiones verificables." },
      { title: "Construimos y validamos", text: "Desarrollamos por etapas, probamos los flujos y recogemos observaciones de quienes usarán el sistema." },
      { title: "Ponemos en marcha", text: "Preparamos la adopción y los ajustes necesarios para que la herramienta sea utilizable en la operación." },
    ],
    audience: ["Pymes que necesitan dejar atrás planillas y tareas dispersas.", "Empresas con procesos propios que un software estándar no representa bien.", "Organizaciones que requieren integrar sistemas o consolidar información.", "Equipos que necesitan una plataforma web o un panel de gestión específico."],
    faqs: [
      { question: "¿Qué diferencia a un software a medida de un producto estándar?", answer: "Un producto estándar propone un flujo común para muchas empresas. El software a medida se diseña alrededor de procesos y reglas definidos para una organización, por lo que su alcance, integraciones y prioridades se acuerdan proyecto a proyecto." },
      { question: "¿Vurp puede integrar herramientas que ya usamos?", answer: "Sí, las integraciones de software forman parte del servicio. Primero se revisa si las aplicaciones actuales ofrecen interfaces técnicas adecuadas y qué datos deben intercambiarse." },
      { question: "¿El proyecto debe construirse completo desde el inicio?", answer: "No necesariamente. Es posible priorizar un primer alcance útil y ampliar el sistema por etapas, siempre que la arquitectura y las dependencias se definan desde el comienzo." },
    ],
    related: [
      { label: "Automatización de procesos", href: "/servicios/automatizacion-procesos/" },
      { label: "Ciberseguridad", href: "/servicios/ciberseguridad/" },
    ],
  },
  {
    slug: "automatizacion-procesos",
    eyebrow: "Automatización empresarial",
    title: "Automatización de procesos para reducir tareas repetitivas",
    lead: "Conectamos aplicaciones, datos y reglas de negocio para que avisos, registros, seguimientos y respuestas avancen con menos intervención manual.",
    problemTitle: "Menos copiar y pegar, más control del proceso",
    problemText: "Cuando una tarea depende de que alguien recuerde mover datos, enviar un aviso o actualizar un estado, aparecen demoras y errores difíciles de seguir. La automatización permite encadenar esos pasos y reservar el criterio humano para las decisiones que lo necesitan.",
    includes: [
      { title: "Flujos de trabajo", text: "Secuencias que reaccionan a eventos, aplican reglas y asignan el siguiente paso del proceso.", icon: Workflow },
      { title: "Integración entre aplicaciones", text: "Intercambio de información entre servicios para evitar duplicar registros y mantener estados sincronizados.", icon: CloudCog },
      { title: "Chatbots", text: "Asistentes para consultas y tareas definidas, integrados con la información y los canales que permita el proyecto.", icon: Bot },
      { title: "Seguimiento operativo", text: "Registros y paneles para saber qué ocurrió, qué está pendiente y dónde requiere intervención una persona.", icon: ChartNoAxesCombined },
    ],
    process: [
      { title: "Mapeamos la tarea", text: "Identificamos entradas, responsables, reglas, excepciones y sistemas involucrados." },
      { title: "Priorizamos el flujo", text: "Evaluamos frecuencia, impacto y riesgos para escoger una automatización útil y controlable." },
      { title: "Integramos y probamos", text: "Construimos el flujo con validaciones, trazabilidad y manejo explícito de errores." },
      { title: "Medimos y ajustamos", text: "Revisamos el comportamiento del proceso y afinamos reglas cuando la operación lo requiere." },
    ],
    audience: ["Equipos administrativos que repiten registros, avisos o seguimientos.", "Empresas que necesitan conectar aplicaciones sin reemplazarlas todas.", "Operaciones con demoras provocadas por traspasos manuales de información.", "Organizaciones que evalúan chatbots para tareas concretas y verificables."],
    faqs: [
      { question: "¿Qué procesos conviene automatizar primero?", answer: "Suelen ser buenos candidatos los procesos frecuentes, con reglas claras, datos disponibles y una carga manual significativa. La decisión final debe considerar también excepciones, riesgos e impacto en las personas." },
      { question: "¿Automatizar significa reemplazar los sistemas actuales?", answer: "No siempre. Muchas automatizaciones conectan herramientas existentes. La viabilidad depende de las interfaces, permisos y formatos que ofrezca cada sistema." },
      { question: "¿Un chatbot sirve para cualquier proceso?", answer: "No. Funciona mejor cuando la conversación tiene objetivos, fuentes de información y límites claros. Si una decisión requiere contexto sensible o criterio profesional, debe existir una derivación apropiada a una persona." },
    ],
    related: [
      { label: "Software a medida", href: "/servicios/desarrollo-software-medida/" },
      { label: "Ciberseguridad", href: "/servicios/ciberseguridad/" },
    ],
  },
  {
    slug: "ciberseguridad",
    eyebrow: "Seguridad para empresas",
    title: "Servicios de ciberseguridad para identificar y reducir riesgos",
    lead: "Realizamos auditorías, pentesting autorizado, análisis de vulnerabilidades y acompañamiento técnico para proteger sistemas, datos y proyectos digitales.",
    problemTitle: "Decisiones de seguridad basadas en evidencia",
    problemText: "La seguridad no se resuelve con una lista genérica de controles. El alcance debe considerar los activos, accesos, datos y riesgos reales de la organización. Vurp evalúa brechas y entrega una base técnica para priorizar acciones; no reemplaza a un organismo certificador ni garantiza cumplimiento legal absoluto.",
    includes: [
      { title: "Auditorías de ciberseguridad", text: "Revisión técnica de controles, configuraciones y prácticas dentro de un alcance previamente acordado.", icon: FileSearch },
      { title: "Pentesting autorizado", text: "Pruebas controladas para buscar vulnerabilidades explotables, siempre con autorización y reglas definidas antes de comenzar.", icon: ScanSearch },
      { title: "Análisis de vulnerabilidades", text: "Identificación y priorización de hallazgos para orientar correcciones según exposición e impacto.", icon: ShieldCheck },
      { title: "ISO 27001 y protección de datos", text: "Diagnóstico y acompañamiento técnico para controles de seguridad y tratamiento de datos; la certificación corresponde a entidades independientes.", icon: LockKeyhole },
    ],
    process: [
      { title: "Acordamos el alcance", text: "Definimos activos, autorizaciones, horarios, exclusiones y responsables antes de realizar pruebas." },
      { title: "Evaluamos", text: "Aplicamos revisiones y pruebas proporcionales al servicio contratado, cuidando la continuidad de la operación." },
      { title: "Priorizamos hallazgos", text: "Explicamos evidencia, impacto y acciones sugeridas para facilitar decisiones técnicas y de gestión." },
      { title: "Acompañamos la mejora", text: "Según el alcance, apoyamos la planificación de correcciones y la revisión posterior de los hallazgos tratados." },
    ],
    audience: ["Empresas que necesitan conocer su exposición y priorizar mejoras.", "Equipos que preparan o lanzan aplicaciones y requieren revisión de seguridad.", "Organizaciones que deben evaluar brechas frente a controles de ISO/IEC 27001.", "Responsables de datos personales que necesitan una evaluación técnica de protección."],
    faqs: [
      { question: "¿Un análisis de vulnerabilidades es lo mismo que un pentest?", answer: "No. El análisis busca y clasifica vulnerabilidades; un pentest intenta validar de forma controlada si ciertas debilidades pueden explotarse. El alcance y los riesgos de cada actividad deben acordarse por separado." },
      { question: "¿Vurp certifica ISO 27001?", answer: "No. Vurp puede realizar diagnóstico y acompañamiento técnico para la implementación de controles. La auditoría de certificación debe efectuarla un organismo certificador independiente." },
      { question: "¿El servicio garantiza el cumplimiento de la normativa chilena?", answer: "No se ofrece una garantía absoluta de cumplimiento legal. La evaluación técnica puede aportar evidencia y recomendaciones, pero las obligaciones aplicables deben validarse también con asesoría jurídica competente." },
      { question: "¿Se puede hacer pentesting sin interrumpir la operación?", answer: "El riesgo se reduce definiendo alcance, ventanas, exclusiones y mecanismos de coordinación. Aun así, cada entorno requiere una evaluación previa y ninguna prueba debe iniciarse sin autorización expresa." },
    ],
    related: [
      { label: "Software a medida", href: "/servicios/desarrollo-software-medida/" },
      { label: "Automatización de procesos", href: "/servicios/automatizacion-procesos/" },
    ],
  },
] as const;

export function serviceByPath(path: string) {
  const normalized = path.replace(/\/+$/, "") || "/";
  return services.find((service) => normalized === `/servicios/${service.slug}`);
}
