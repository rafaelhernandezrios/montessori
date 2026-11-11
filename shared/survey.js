/**
 * Cuestionario "Te quiero conocer" para mamás con hijos de 0 a 3 años.
 * Lo usan la página pública (/cuestionario), el servidor (para validar) y el panel de admin.
 *
 * Tipos de pregunta:
 * - text / textarea: respuesta libre
 * - single: una opción (radio)
 * - multi: varias opciones; `max` limita cuántas
 * `other: true` agrega la opción "Otra" con un campo de texto.
 * `showIf` muestra la pregunta solo si otra respuesta cumple la condición.
 */
export const OTHER = "__other";

export const surveyIntro = {
  title: "¡Te quiero conocer y tengo un regalo para ti!",
  subtitle: "Tu experiencia como mamá importa",
  text: [
    "Estoy preparando un acompañamiento para familias con hijos de 0 a 3 años. Quiero conocer qué necesitas, qué te cuesta y qué apoyo te gustaría recibir.",
    "No necesitas saber de Montessori para responder. No hay respuestas correctas ni incorrectas.",
  ],
  thanks:
    "Gracias por compartir tu experiencia. Tus respuestas me ayudarán a crear un acompañamiento que responda a las necesidades reales de las mamás. 💛",
};

export const surveyQuestions = [
  { id: "email", type: "email", label: "¿Cuál es el correo al que te enviaremos tu regalo?", required: true },
  { id: "whatsapp", type: "tel", label: "¿Cuál es tu número de WhatsApp?" },
  {
    id: "childAge", n: 1, type: "single", required: true,
    label: "¿Qué edad tiene tu hijo o hija?",
    options: ["Menos de 1 año", "1 año", "2 años", "3 años", "4 años o más"],
  },
  { id: "momAgePlace", n: 2, type: "text", label: "¿Qué edad tienes y dónde vives?" },
  {
    id: "priorAdvice", type: "single",
    label: "¿Alguna vez has tomado alguna asesoría en tema de maternidad?",
    options: ["Sí", "No"],
  },
  {
    id: "struggles", n: 3, type: "multi", max: 3, other: true,
    label: "¿Qué situaciones te están costando más actualmente?",
    hint: "Puedes elegir hasta 3.",
    options: [
      "Entender por qué mi hijo se comporta de cierta manera.",
      "Acompañarlo cuando llora, se frustra o se enoja.",
      "Poner límites y manejar situaciones en las que no quiere colaborar.",
      "Mantener la calma y evitar gritar o regañar.",
      "Encontrar tiempo y energía para conectar y jugar juntos.",
      "Saber cuándo ayudarlo y cuándo dejarlo intentar solo.",
      "Organizar la casa y las rutinas para facilitar el día.",
      "Encontrar información confiable y saber cómo aplicarla.",
      "Ponernos de acuerdo entre quienes lo cuidamos.",
      "Sentirme acompañada y tener espacio para mí.",
      "Actualmente no tengo una dificultad importante.",
    ],
  },
  {
    id: "recentSituation", n: 4, type: "textarea",
    label: "Cuéntame una situación reciente en la que pensaste: “Necesito ayuda con esto”. ¿Qué pasó?",
  },
  {
    id: "improveOne", n: 5, type: "single", other: true,
    label: "Si pudieras mejorar una sola cosa de tu vida con tu hijo en los próximos tres meses, ¿cuál sería?",
    hint: "Elige una.",
    options: [
      "Disfrutar más juntos y sentir mayor conexión.",
      "Responder con más calma en los momentos difíciles.",
      "Poner límites con claridad y respeto.",
      "Comprender mejor sus necesidades e intereses.",
      "Acompañar su independencia sin presionarlo.",
      "Tener rutinas y espacios que hagan más fácil nuestro día.",
      "Compartir mejor la responsabilidad de criar.",
      "Sentirme menos sola y recuperar tiempo para mí.",
    ],
  },
  {
    id: "cultivate", n: 6, type: "multi", max: 3, other: true,
    label: "Pensando en el futuro, ¿qué te gustaría cultivar especialmente en tu hijo?",
    hint: "Elige hasta 3.",
    options: [
      "Confianza para expresarse y ser él mismo.",
      "Una relación cercana y de confianza conmigo.",
      "Recursos para reconocer y expresar sus emociones.",
      "Independencia para hacer cosas por sí mismo.",
      "Curiosidad y gusto por aprender.",
      "Respeto y consideración hacia otras personas.",
      "Capacidad para afrontar dificultades y pedir ayuda.",
      "Habilidades para convivir y hacer amistades.",
    ],
  },
  {
    id: "obstacles", n: 7, type: "multi", max: 2, other: true,
    label: "¿Qué suele dificultar que acompañes a tu hijo como te gustaría?",
    hint: "Elige hasta 2.",
    options: [
      "Cansancio o falta de sueño.",
      "Trabajo, tareas de casa y falta de tiempo.",
      "Preocupaciones y carga mental.",
      "Falta de apoyo.",
      "Diferencias con mi pareja u otros cuidadores.",
      "No saber qué hacer en ese momento.",
      "Tener demasiada información contradictoria.",
      "Reaccionar de maneras que después quisiera cambiar.",
      "Normalmente puedo acompañarlo como me gustaría.",
    ],
  },
  {
    id: "guidanceTopics", n: 8, type: "multi", max: 3, other: true,
    label: "¿En cuáles de estas situaciones te gustaría recibir orientación práctica?",
    hint: "Elige hasta 3.",
    options: [
      "Llanto intenso, frustración y enojo.",
      "Límites, cooperación y conflictos cotidianos.",
      "Conexión y comunicación con mi hijo.",
      "Lenguaje y conversaciones.",
      "Movimiento y exploración.",
      "Juego, concentración y elección de actividades.",
      "Participación en la cocina, el orden y otras tareas de casa.",
      "Vestirse, lavarse las manos y cuidado personal.",
      "Rutinas de alimentación.",
      "Rutinas de descanso.",
      "Acompañamiento para dejar el pañal.",
      "Adaptación a la escuela y separaciones.",
      "Convivencia con hermanos u otros niños.",
      "Crianza en más de un idioma.",
    ],
  },
  {
    id: "observation", n: 9, type: "single", other: true,
    label: "¿Qué describe mejor lo que te pasa al observar a tu hijo mientras juega o intenta hacer algo?",
    hint: "Elige una.",
    options: [
      "Suelo reconocer sus intereses y darle tiempo para explorar.",
      "Me doy cuenta de lo que le interesa, pero no sé cómo acompañarlo.",
      "Me cuesta entender qué busca aprender o hacer.",
      "Quisiera observarlo más, pero las prisas me llevan a intervenir.",
      "No me había planteado observarlo de esta manera.",
    ],
  },
  {
    id: "home", n: 10, type: "single", other: true,
    label: "¿Qué describe mejor cómo está organizada tu casa para tu hijo?",
    hint: "Elige una.",
    options: [
      "Puede alcanzar varias de sus cosas y participar en actividades cotidianas.",
      "Hemos adaptado algunos espacios, pero me gustaría orientación.",
      "Quiero adaptarla, pero no sé por dónde empezar.",
      "Me preocupa necesitar mucho espacio, dinero o materiales.",
      "Por ahora no es algo que quiera cambiar.",
    ],
  },
  {
    id: "montessori", n: 11, type: "multi",
    label: "¿Qué relación tienes actualmente con Montessori?",
    hint: "Marca las que correspondan.",
    options: [
      "No lo conozco.",
      "He escuchado el nombre, pero no sé bien qué significa.",
      "Veo contenido y algunas ideas me interesan.",
      "Intento aplicarlo en casa, pero tengo dudas.",
      "Mi hijo asiste a un ambiente Montessori.",
      "Tengo formación en Montessori.",
    ],
  },
  {
    id: "tried", n: 12, type: "multi", other: true,
    label: "¿Qué has probado para resolver lo que más te cuesta?",
    hint: "Marca las que correspondan.",
    options: [
      "Contenido gratuito en redes.",
      "Libros o pódcast.",
      "Consejos de familiares o amigas.",
      "Cursos o talleres de pago.",
      "Asesoría personalizada de pago.",
      "Comunidades o grupos de crianza.",
      "Todavía no he buscado apoyo.",
    ],
  },
  { id: "triedFeedback", type: "textarea", label: "¿Qué te ayudó y qué te hizo falta?" },
  {
    id: "supportType", n: 13, type: "multi", max: 2, other: true,
    label: "¿Qué tipo de acompañamiento considerarías más útil para ti hoy?",
    hint: "Elige hasta 2.",
    options: [
      "Una asesoría individual sobre mi situación.",
      "Orientación para adaptar mi casa con lo que ya tengo.",
      "Un taller práctico sobre un tema específico.",
      "Videos breves y guías para aplicar a mi ritmo.",
      "Encuentros grupales para hacer preguntas y aprender.",
      "Una comunidad de mamás para compartir y sentirme acompañada.",
      "Un espacio en el que también participe mi pareja u otro cuidador.",
      "Por ahora no busco acompañamiento.",
    ],
  },
  {
    id: "readiness", n: 14, type: "single",
    label: "Si encontraras una propuesta adecuada para lo que necesitas, ¿cuál sería tu situación actual?",
    hint: "Elige una.",
    options: [
      "Estoy buscando apoyo de pago para empezar pronto.",
      "Consideraría pagar al conocer el precio, el contenido y cómo funciona.",
      "Me interesa, pero lo dejaría para más adelante.",
      "En este momento solo busco recursos gratuitos.",
      "No estoy buscando apoyo.",
    ],
  },
  {
    id: "beforeHiring", type: "multi", max: 2, other: true,
    label: "¿Qué necesitarías saber o resolver antes de contratar?",
    hint: "Elige hasta 2.",
    options: [
      "Precio y formas de pago.",
      "Horarios y tiempo que requiere.",
      "Cómo se adapta a mi hijo y a mi familia.",
      "Formación y experiencia de quien me acompaña.",
      "Qué incluye y cuáles son sus límites.",
      "Experiencias de otras familias.",
      "Cómo involucrar a mi pareja u otros cuidadores.",
    ],
  },
  {
    id: "infoSources", n: 15, type: "multi", max: 2, other: true,
    label: "¿Dónde buscas información sobre crianza?",
    hint: "Elige hasta 2.",
    options: [
      "Instagram.",
      "Facebook.",
      "Específicamente en grupos de Facebook.",
      "TikTok.",
      "YouTube.",
      "Google.",
      "Grupos de WhatsApp.",
      "Profesionales o escuela.",
    ],
  },
  { id: "searchPhrase", type: "text", label: "¿Qué escribirías en el buscador para encontrar ayuda con lo que más te cuesta?" },
  {
    id: "helpWith", n: 16, type: "textarea",
    label: "Completa esta frase con tus propias palabras:",
    hint: "“Me gustaría que alguien me ayudara a…”",
  },
  {
    id: "contactConsent", type: "single",
    label: "Opcional: ¿Quieres que te contacte para compartirte una propuesta relacionada con lo que necesitas?",
    options: ["Sí, autorizo que me contactes para compartirme esa información.", "No, gracias."],
  },
  {
    id: "comments", type: "textarea",
    label: "Si tienes alguna sugerencia o comentario, este es el espacio.",
  },
];

/** Texto legible de una respuesta (para el panel y los correos) */
export function formatSurveyAnswer(q, answers) {
  const v = answers?.[q.id];
  const other = answers?.[`${q.id}Other`];
  const parts = (Array.isArray(v) ? v : v ? [v] : []).map((x) => (x === OTHER ? `Otra: ${other || "—"}` : x));
  return parts.join(" · ");
}
