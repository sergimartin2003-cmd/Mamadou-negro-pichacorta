/**
 * Marketplace de cursos — seed.
 *
 * Datos semilla realistas (modo demo) servidos por la misma capa async que en
 * producción hablará con Supabase. Las cifras derivadas (alumnos, rating,
 * módulos, reviews) se generan de forma DETERMINISTA (FNV-1a, sin Math.random)
 * → sin hydration mismatch. El instructor es un perfil de la red social.
 */

import type {
  Course,
  CourseLevel,
  CourseModule,
  CourseReview,
  NicheSlug,
} from "@/types/db";

interface CourseSeedInput {
  slug: string;
  instructorId: string;
  title: string;
  tagline: string;
  niche: NicheSlug;
  level: CourseLevel;
  price: number;
  originalPrice?: number;
  tags: string[];
  whatYouLearn: string[];
  requirements: string[];
}

const COURSE_SEED: readonly CourseSeedInput[] = [
  // Ecommerce
  {
    slug: "shopify-cero-primera-venta",
    instructorId: "u1",
    title: "Lanza tu tienda Shopify de 0 a la primera venta",
    tagline: "Monta una tienda que vende, sin teoría de relleno.",
    niche: "ecommerce",
    level: "Principiante",
    price: 49,
    originalPrice: 99,
    tags: ["shopify", "producto-ganador", "cro"],
    whatYouLearn: ["Elegir un producto con demanda real", "Montar la tienda y el checkout", "Conseguir tus primeras ventas"],
    requirements: ["Un ordenador y ganas", "Sin experiencia previa necesaria"],
  },
  {
    slug: "ecommerce-paid-ads-rentables",
    instructorId: "u1",
    title: "Escala tu ecommerce con Paid Ads rentables",
    tagline: "Meta y TikTok ads con ROAS positivo y datos encima.",
    niche: "ecommerce",
    level: "Intermedio",
    price: 129,
    tags: ["ads", "meta", "tiktok", "roas"],
    whatYouLearn: ["Estructurar campañas que escalan", "Leer las métricas que importan", "Bajar el CPA sin morir en el intento"],
    requirements: ["Una tienda con ventas", "Presupuesto mínimo de ads"],
  },
  // SaaS
  {
    slug: "build-in-public-primer-1k-mrr",
    instructorId: "u2",
    title: "Build in Public: de la idea al primer $1K MRR",
    tagline: "El camino real de un SaaS bootstrapped, sin humo.",
    niche: "saas",
    level: "Principiante",
    price: 0,
    tags: ["saas", "mrr", "build-in-public"],
    whatYouLearn: ["Validar una idea antes de construir", "Lanzar un MVP en semanas", "Conseguir clientes de pago"],
    requirements: ["Nociones básicas de producto", "No hace falta saber programar mucho"],
  },
  {
    slug: "saas-reducir-churn-ltv",
    instructorId: "u2",
    title: "Reduce el churn y dispara el LTV de tu SaaS",
    tagline: "Retención es crecimiento. Aquí está el sistema.",
    niche: "saas",
    level: "Avanzado",
    price: 149,
    originalPrice: 199,
    tags: ["churn", "retencion", "ltv"],
    whatYouLearn: ["Medir el churn de verdad", "Onboarding que retiene", "Pricing y planes que suben el LTV"],
    requirements: ["Un SaaS con usuarios de pago", "Acceso a tus métricas"],
  },
  // Contenido
  {
    slug: "youtube-guion-retencion-algoritmo",
    instructorId: "u3",
    title: "Crece en YouTube: guion, retención y algoritmo",
    tagline: "De 0 suscriptores a un canal que crece solo.",
    niche: "contenido",
    level: "Principiante",
    price: 39,
    tags: ["youtube", "retencion", "formato"],
    whatYouLearn: ["Escribir guiones que enganchan", "Retener al espectador hasta el final", "Entender qué premia el algoritmo"],
    requirements: ["Un móvil o cámara", "Ganas de publicar"],
  },
  {
    slug: "monetiza-tu-audiencia",
    instructorId: "u3",
    title: "Monetiza tu audiencia: sponsors y producto propio",
    tagline: "Convierte vistas en ingresos diversificados.",
    niche: "contenido",
    level: "Intermedio",
    price: 89,
    tags: ["sponsor", "monetizacion", "producto"],
    whatYouLearn: ["Cerrar sponsors y cuánto cobrar", "Lanzar tu propio producto", "Diversificar fuentes de ingreso"],
    requirements: ["Una audiencia que empieza a crecer", "Algo de contenido publicado"],
  },
  // Trading
  {
    slug: "price-action-order-flow",
    instructorId: "u1",
    title: "Price Action y order flow desde cero",
    tagline: "Lee el mercado sin 20 indicadores encima.",
    niche: "trading",
    level: "Intermedio",
    price: 119,
    tags: ["price-action", "order-flow", "estructura"],
    whatYouLearn: ["Leer estructura de mercado", "Identificar liquidez y zonas clave", "Entrar con confluencia, no por impulso"],
    requirements: ["Conocer lo básico de trading", "Una cuenta demo para practicar"],
  },
  {
    slug: "gestion-de-riesgo-pros",
    instructorId: "u3",
    title: "Gestión de Riesgo: el sistema de los pros",
    tagline: "Sobrevive primero, compón después.",
    niche: "trading",
    level: "Principiante",
    price: 0,
    tags: ["riesgo", "psicologia", "journaling"],
    whatYouLearn: ["Dimensionar cada operación", "Proteger tu cuenta en rachas malas", "Llevar un journal que te haga mejor"],
    requirements: ["Sin requisitos previos"],
  },
  // Inmobiliario
  {
    slug: "analiza-tu-primer-piso",
    instructorId: "u4",
    title: "Analiza tu primer piso de alquiler como un pro",
    tagline: "Los números antes de firmar nada.",
    niche: "inmobiliario",
    level: "Principiante",
    price: 59,
    tags: ["alquiler", "rentabilidad", "analisis"],
    whatYouLearn: ["Calcular rentabilidad bruta y neta", "Estimar gastos reales", "Decidir con datos, no con ilusión"],
    requirements: ["Una calculadora", "Ganas de invertir en ladrillo"],
  },
  {
    slug: "brrrr-flipping-completo",
    instructorId: "u4",
    title: "BRRRR y flipping: compra, reforma, refinancia",
    tagline: "Recicla tu capital y escala tu cartera.",
    niche: "inmobiliario",
    level: "Avanzado",
    price: 179,
    originalPrice: 249,
    tags: ["brrrr", "flip", "reforma"],
    whatYouLearn: ["Encontrar oportunidades infravaloradas", "Presupuestar una reforma", "Refinanciar y recuperar capital"],
    requirements: ["Capital para una primera operación", "Conocer lo básico de financiación"],
  },
  // Servicios
  {
    slug: "primeros-clientes-freelance",
    instructorId: "u6",
    title: "Consigue tus primeros clientes freelance",
    tagline: "De cero a una agenda llena, sin suplicar.",
    niche: "servicios",
    level: "Principiante",
    price: 0,
    tags: ["captacion", "outreach", "freelance"],
    whatYouLearn: ["Definir tu oferta y tu nicho", "Hacer outreach que convierte", "Cerrar tus primeros clientes"],
    requirements: ["Una habilidad que vender"],
  },
  {
    slug: "productiza-y-sube-tarifas",
    instructorId: "u6",
    title: "Productiza tu servicio y sube tarifas",
    tagline: "Deja de vender horas. Vende resultados.",
    niche: "servicios",
    level: "Intermedio",
    price: 99,
    tags: ["productizar", "tarifas", "sistemas"],
    whatYouLearn: ["Convertir tu servicio en una oferta estándar", "Subir tarifas sin perder clientes", "Crear sistemas que escalan"],
    requirements: ["Tener algún cliente", "Un servicio que ya prestas"],
  },
  // Amazon
  {
    slug: "amazon-fba-research-producto",
    instructorId: "u5",
    title: "Amazon FBA: research de producto rentable",
    tagline: "Encuentra el producto antes de invertir un euro.",
    niche: "amazon",
    level: "Principiante",
    price: 79,
    tags: ["fba", "research", "helium10"],
    whatYouLearn: ["Criterios de un producto ganador", "Usar herramientas de research", "Validar la demanda y la competencia"],
    requirements: ["Capital inicial para inventario", "Cuenta de Seller (o intención de abrirla)"],
  },
  {
    slug: "amazon-ppc-baja-acos",
    instructorId: "u5",
    title: "PPC en Amazon: baja tu ACoS con datos",
    tagline: "Campañas que rankean y venden, no que queman.",
    niche: "amazon",
    level: "Avanzado",
    price: 139,
    tags: ["ppc", "acos", "lanzamiento"],
    whatYouLearn: ["Estructurar campañas de PPC", "Optimizar pujas con datos", "Bajar el ACoS manteniendo volumen"],
    requirements: ["Un producto activo en Amazon", "Acceso a tus reportes de PPC"],
  },
  // Dropshipping
  {
    slug: "productos-ganadores-que-escalan",
    instructorId: "u9",
    title: "Encuentra productos ganadores que escalan",
    tagline: "El producto correcto en el momento correcto.",
    niche: "dropshipping",
    level: "Principiante",
    price: 69,
    tags: ["producto-ganador", "testing", "validacion"],
    whatYouLearn: ["Detectar señales de un producto ganador", "Validar con un test barato", "Evitar productos saturados"],
    requirements: ["Presupuesto pequeño para testear", "Una tienda lista para vender"],
  },
  {
    slug: "tiktok-ads-escalado",
    instructorId: "u9",
    title: "Escala campañas de TikTok Ads sin quemar",
    tagline: "De €50/día a €1K/día manteniendo el ROAS.",
    niche: "dropshipping",
    level: "Intermedio",
    price: 129,
    originalPrice: 179,
    tags: ["tiktok-ads", "escalado", "creativos"],
    whatYouLearn: ["Crear creativos que convierten", "Escalar sin romper el ROAS", "Leer CPM, CTR y ROAS"],
    requirements: ["Un producto validado", "Presupuesto de ads para escalar"],
  },
  // Cursos del usuario (instructor = "me") — para el panel /teach
  {
    slug: "journal-trading-que-funciona",
    instructorId: "me",
    title: "El journal de trading que de verdad te hace mejor",
    tagline: "Mide tu proceso, no solo tu P&L.",
    niche: "trading",
    level: "Principiante",
    price: 0,
    tags: ["journaling", "psicologia", "proceso"],
    whatYouLearn: ["Registrar lo que importa de cada trade", "Detectar tus patrones de error", "Convertir datos en mejores decisiones"],
    requirements: ["Operar (aunque sea en demo)"],
  },
  {
    slug: "construye-tu-side-project",
    instructorId: "me",
    title: "Construye tu side project mientras trabajas",
    tagline: "De idea a primeros ingresos sin dejar tu empleo.",
    niche: "saas",
    level: "Principiante",
    price: 59,
    originalPrice: 89,
    tags: ["side-project", "build-in-public", "primer-ingreso"],
    whatYouLearn: ["Gestionar el tiempo con un empleo", "Lanzar algo pequeño y real", "Conseguir tus primeros ingresos"],
    requirements: ["Unas horas a la semana", "Ganas de empezar"],
  },
];

const MODULE_TITLES = [
  "Fundamentos",
  "Estrategia",
  "Ejecución paso a paso",
  "Casos reales con números",
  "Escalado y siguientes pasos",
];

const LESSON_TITLES = [
  "Introducción y mentalidad",
  "El framework completo",
  "Herramientas que uso",
  "Análisis de un caso real",
  "Errores que debes evitar",
  "Tu plan de acción",
];

const REVIEW_TEXTS = [
  "Directo al grano y con ejemplos reales. Aplicable desde el día uno.",
  "Justo lo que necesitaba para desbloquearme. Sin paja.",
  "El instructor enseña sus números de verdad, eso se agradece.",
  "Bien estructurado. Lo recomiendo si vas en serio.",
  "Esperaba más en la parte avanzada, pero muy sólido en general.",
  "Me ha hecho replantear todo mi enfoque. Brutal.",
];

const REVIEWERS = ["u2", "u4", "u6", "u8", "u10", "me"];

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildCourse(input: CourseSeedInput): Course {
  const seed = hash(input.slug);
  const modulesCount = 3 + (seed % 3); // 3–5
  const lessonsCount = modulesCount * (3 + ((seed >>> 3) % 3)); // ~3–5 per module
  const students = input.price === 0 ? 1800 + (seed % 9000) : 120 + (seed % 3400);
  const rating = Number((4.2 + ((seed >>> 5) % 8) / 10).toFixed(1)); // 4.2–4.9
  const reviewsCount = Math.max(6, Math.round(students * 0.04) + (seed % 30));
  const durationHours = Number((lessonsCount * (0.18 + ((seed >>> 7) % 6) / 100)).toFixed(1));
  const createdDaysAgo = (seed >>> 9) % 220;
  const weeks = Math.max(1, Math.round(((seed >>> 11) % 40) / 4));
  return {
    id: `c-${input.slug}`,
    slug: input.slug,
    instructorId: input.instructorId,
    title: input.title,
    tagline: input.tagline,
    description: `${input.tagline} En este curso, ${input.title.toLowerCase()} con un enfoque práctico: cada módulo termina con algo accionable y los números reales del instructor sobre la mesa.`,
    niche: input.niche,
    level: input.level,
    format: seed % 4 === 0 ? "mixto" : "video",
    price: input.price,
    originalPrice: input.originalPrice,
    durationHours,
    modulesCount,
    lessonsCount,
    students,
    rating,
    reviewsCount,
    language: "es",
    certificate: input.price > 0,
    updatedAt: `hace ${weeks} ${weeks === 1 ? "semana" : "semanas"}`,
    createdDaysAgo,
    tags: input.tags,
    whatYouLearn: input.whatYouLearn,
    requirements: input.requirements,
  };
}

export const courses: readonly Course[] = COURSE_SEED.map(buildCourse);

export function buildModulesForCourse(course: Course): CourseModule[] {
  const seed = hash(course.slug);
  const modules: CourseModule[] = [];
  let lessonGlobal = 0;
  for (let m = 0; m < course.modulesCount; m++) {
    const perModule = 3 + ((seed >>> (m + 1)) % 3); // 3–5
    const lessons = Array.from({ length: perModule }, (_, l) => {
      lessonGlobal += 1;
      const ls = hash(`${course.slug}-${m}-${l}`);
      return {
        id: `${course.id}-l${lessonGlobal}`,
        n: l + 1,
        title: LESSON_TITLES[(ls + l) % LESSON_TITLES.length],
        durationMin: 5 + (ls % 22),
        format: (ls % 5 === 0 ? "quiz" : ls % 7 === 0 ? "ejercicio" : "video") as CourseModule["lessons"][number]["format"],
        // First two lessons of the first module are free previews.
        freePreview: m === 0 && l < 2,
      };
    });
    modules.push({
      id: `${course.id}-m${m + 1}`,
      n: m + 1,
      title: MODULE_TITLES[m % MODULE_TITLES.length],
      lessons,
    });
  }
  return modules;
}

export function buildReviewsForCourse(course: Course): CourseReview[] {
  const seed = hash(course.slug);
  const count = 3 + (seed % 3); // 3–5
  return Array.from({ length: count }, (_, i) => {
    const rs = hash(`${course.slug}-rev-${i}`);
    const delta = rs % 3 === 0 ? -1 : 0; // most 5★, some 4★
    return {
      id: `${course.id}-r${i + 1}`,
      author: REVIEWERS[(rs + i) % REVIEWERS.length],
      rating: Math.max(3, Math.min(5, Math.round(course.rating) + delta)),
      text: REVIEW_TEXTS[(rs + i) % REVIEW_TEXTS.length],
      verifiedPurchase: rs % 5 !== 0,
      helpful: rs % 40,
      time: `hace ${1 + (rs % 8)} ${rs % 8 === 0 ? "día" : "días"}`,
    };
  });
}
