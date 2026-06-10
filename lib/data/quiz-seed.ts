/**
 * Quiz bank — three handwritten questions per niche, attached at path level.
 * Mirrors the quiz_questions schema (prompt/options/correct_index/xp) so the
 * same UI swaps to DB rows when they're seeded in Postgres.
 */

import type { NicheSlug } from "@/types/db";

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  xp: number;
}

export const QUIZ_BANK: Record<NicheSlug, QuizQuestion[]> = {
  ecommerce: [
    {
      id: "ecom-q1",
      prompt: "Tu ROAS es 2.0 y tu margen bruto es 40%. ¿Qué está pasando?",
      options: [
        "Ganas dinero con cada venta",
        "Pierdes dinero: el ad spend se come más que tu margen",
        "Estás en break-even exacto",
        "El ROAS no afecta a la rentabilidad",
      ],
      correctIndex: 1,
      xp: 10,
    },
    {
      id: "ecom-q2",
      prompt: "¿Cuál es la señal MÁS fiable de que un producto tiene demanda real?",
      options: [
        "Muchos likes en el anuncio",
        "Ventas repetidas con tráfico frío y CPA estable",
        "Que lo venda mucha gente",
        "Un buen precio de proveedor",
      ],
      correctIndex: 1,
      xp: 10,
    },
    {
      id: "ecom-q3",
      prompt: "El AOV (ticket medio) sube sobre todo con…",
      options: [
        "Más gasto en ads",
        "Bajar precios",
        "Bundles, upsells y post-purchase offers",
        "Cambiar de plataforma",
      ],
      correctIndex: 2,
      xp: 10,
    },
  ],
  saas: [
    {
      id: "saas-q1",
      prompt: "Con churn mensual del 5%, ¿qué pasa con 100 clientes en un año sin captar nuevos?",
      options: [
        "Pierdes ~5 clientes",
        "Te quedan ~54: el churn compone mes a mes",
        "Te quedan 95",
        "El churn no compone",
      ],
      correctIndex: 1,
      xp: 10,
    },
    {
      id: "saas-q2",
      prompt: "¿Cuándo tiene sentido escalar adquisición de pago en un SaaS?",
      options: [
        "Desde el día uno",
        "Cuando LTV supera con margen al CAC y la retención es estable",
        "Cuando tienes inversores",
        "Nunca: solo orgánico",
      ],
      correctIndex: 1,
      xp: 10,
    },
    {
      id: "saas-q3",
      prompt: "El MRR de expansión (expansion revenue) viene de…",
      options: [
        "Nuevos clientes",
        "Upgrades y upsells de clientes existentes",
        "Reducir el churn",
        "Subir el precio a los nuevos",
      ],
      correctIndex: 1,
      xp: 10,
    },
  ],
  contenido: [
    {
      id: "cont-q1",
      prompt: "¿Qué métrica predice mejor que un vídeo de YouTube se recomiende?",
      options: ["Likes", "Retención media y CTR del thumbnail", "Número de tags", "Duración total"],
      correctIndex: 1,
      xp: 10,
    },
    {
      id: "cont-q2",
      prompt: "RPM de €4 con 500k vistas/mes son…",
      options: ["€500", "€2.000", "€4.000", "€20.000"],
      correctIndex: 1,
      xp: 10,
    },
    {
      id: "cont-q3",
      prompt: "La forma más estable de monetizar una audiencia es…",
      options: [
        "Solo AdSense",
        "Diversificar: ads + sponsors + producto propio",
        "Solo sponsors",
        "Vender la cuenta",
      ],
      correctIndex: 1,
      xp: 10,
    },
  ],
  trading: [
    {
      id: "trad-q1",
      prompt: "Arriesgas 1% por operación con win rate 50% y RR 2:1. ¿Tu expectativa?",
      options: [
        "Negativa",
        "Positiva: ganas el doble de lo que pierdes la mitad de las veces",
        "Neutra",
        "Depende del mercado",
      ],
      correctIndex: 1,
      xp: 10,
    },
    {
      id: "trad-q2",
      prompt: "¿Qué es el riesgo de ruina?",
      options: [
        "Perder una operación",
        "La probabilidad de quemar la cuenta hasta no poder recuperarte",
        "Un drawdown del 10%",
        "Operar sin stop",
      ],
      correctIndex: 1,
      xp: 10,
    },
    {
      id: "trad-q3",
      prompt: "Tras 3 pérdidas seguidas dentro de tu plan, lo correcto es…",
      options: [
        "Doblar el tamaño para recuperar",
        "Seguir ejecutando el plan con el mismo riesgo",
        "Cambiar de estrategia ya",
        "Operar sin stop hasta recuperar",
      ],
      correctIndex: 1,
      xp: 10,
    },
  ],
  inmobiliario: [
    {
      id: "inmo-q1",
      prompt: "Piso de €100k que renta €700/mes. ¿Rentabilidad bruta anual?",
      options: ["7%", "8.4%", "10%", "5.6%"],
      correctIndex: 1,
      xp: 10,
    },
    {
      id: "inmo-q2",
      prompt: "La rentabilidad NETA se diferencia de la bruta en que…",
      options: [
        "Incluye la hipoteca",
        "Descuenta gastos: IBI, comunidad, seguro, vacancia, mantenimiento",
        "Es siempre mayor",
        "Solo aplica a locales",
      ],
      correctIndex: 1,
      xp: 10,
    },
    {
      id: "inmo-q3",
      prompt: "En un BRRRR, el refinanciamiento sirve para…",
      options: [
        "Pagar menos impuestos",
        "Recuperar el capital invertido y repetir en otro activo",
        "Subir el alquiler",
        "Evitar la reforma",
      ],
      correctIndex: 1,
      xp: 10,
    },
  ],
  servicios: [
    {
      id: "serv-q1",
      prompt: "Productizar un servicio significa…",
      options: [
        "Hacerlo más barato",
        "Convertirlo en una oferta estándar con alcance, precio y entrega fijos",
        "Contratar a más gente",
        "Hacerlo solo por horas",
      ],
      correctIndex: 1,
      xp: 10,
    },
    {
      id: "serv-q2",
      prompt: "El scope creep se evita sobre todo con…",
      options: [
        "Trabajar más horas",
        "Contratos claros de alcance y cambios facturables",
        "No responder al cliente",
        "Bajar tarifas",
      ],
      correctIndex: 1,
      xp: 10,
    },
    {
      id: "serv-q3",
      prompt: "¿Cuándo es buen momento para subir tarifas?",
      options: [
        "Nunca",
        "Cuando tu agenda está llena y tu pipeline supera tu capacidad",
        "Solo en enero",
        "Cuando un cliente se queja",
      ],
      correctIndex: 1,
      xp: 10,
    },
  ],
  amazon: [
    {
      id: "amz-q1",
      prompt: "ACoS del 25% con margen del 30% antes de ads significa…",
      options: [
        "Pierdes dinero",
        "Te queda ~5% de margen tras la publicidad",
        "El ACoS no afecta al margen",
        "Ganas el 25%",
      ],
      correctIndex: 1,
      xp: 10,
    },
    {
      id: "amz-q2",
      prompt: "El Buy Box se gana principalmente con…",
      options: [
        "El precio más bajo siempre",
        "Precio competitivo + métricas de seller + fulfillment fiable",
        "Más reviews",
        "Pagar a Amazon",
      ],
      correctIndex: 1,
      xp: 10,
    },
    {
      id: "amz-q3",
      prompt: "En el research de producto, un BSR estable importa porque…",
      options: [
        "Indica demanda sostenida, no un pico puntual",
        "Sube el margen",
        "Reduce los fees",
        "Garantiza reviews",
      ],
      correctIndex: 0,
      xp: 10,
    },
  ],
  dropshipping: [
    {
      id: "drop-q1",
      prompt: "Pruebas 10 productos con €30 cada uno. ¿Qué buscas en las primeras 48h?",
      options: [
        "Ventas masivas",
        "Señales: CTR alto, CPC bajo, add-to-carts — para decidir matar o escalar",
        "Beneficio neto inmediato",
        "Reviews",
      ],
      correctIndex: 1,
      xp: 10,
    },
    {
      id: "drop-q2",
      prompt: "Un producto 'ganador' se está saturando cuando…",
      options: [
        "Sube el CPM y cae el CTR con creativos nuevos",
        "Tiene muchas ventas",
        "El proveedor tarda más",
        "Sube el precio del producto",
      ],
      correctIndex: 0,
      xp: 10,
    },
    {
      id: "drop-q3",
      prompt: "Al escalar de €50/día a €500/día, lo más importante es…",
      options: [
        "Duplicar el presupuesto de golpe",
        "Escalar gradual con estructura de campañas y vigilar el ROAS marginal",
        "Cambiar de producto",
        "Bajar el precio",
      ],
      correctIndex: 1,
      xp: 10,
    },
  ],
};
