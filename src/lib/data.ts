
import type { Subject, Lesson, MicroClass, Report, Plan, Test, Curriculum, Recipe } from './types';

export const avatarColors = {
  blue: { bg: '60a5fa', text: 'FFFFFF' },
  red: { bg: 'f87171', text: 'FFFFFF' },
  green: { bg: '4ade80', text: 'FFFFFF' },
  yellow: { bg: 'fbbf24', text: 'FFFFFF' },
  purple: { bg: 'c084fc', text: 'FFFFFF' },
  indigo: { bg: '818cf8', text: 'FFFFFF' },
  pink: { bg: 'f472b6', text: 'FFFFFF' },
  teal: { bg: '2dd4bf', text: 'FFFFFF' },
};

export const defaultAvatarColor = 'blue';

export const generateAvatarUrl = (
  name?: string | null,
  colorKey: string = defaultAvatarColor
) => {
  const initial = name ? name.trim().charAt(0).toUpperCase() : '';
  const color = avatarColors[colorKey as keyof typeof avatarColors] || avatarColors[defaultAvatarColor];
  
  if (!initial) {
    return `https://placehold.co/128x128/${color.bg}/${color.text}/png?text=+`;
  }
  
  return `https://placehold.co/128x128/${color.bg}/${color.text}/png?text=${initial}`;
};

export const studentGrades = [
    '1ro Básico', '2do Básico', '3ro Básico', '4to Básico', '5to Básico', '6to Básico', '7mo Básico', '8vo Básico',
    '1ro Medio', '2do Medio', '3ro Medio', '4to Medio', 'Reforzamiento PAES'
];

export const grades = {
  basica: ['1ro Básico', '2do Básico', '3ro Básico', '4to Básico', '5to Básico', '6to Básico', '7mo Básico', '8vo Básico'],
  media: ['1ro Medio', '2do Medio', '3ro Medio', '4to Medio'],
  paes: ['Reforzamiento PAES'],
};

export const subjects: Subject[] = [
  { id: 'matematicas', title: 'Matemáticas', icon: 'Calculator', color: 'red', lessons: 12, levels: ['basica', 'media', 'paes'] },
  { id: 'lenguaje', title: 'Lenguaje', icon: 'Book', color: 'blue', lessons: 8, levels: ['basica', 'media', 'paes'] },
  { id: 'ciencias', title: 'Ciencias Naturales', icon: 'FlaskConical', color: 'green', lessons: 10, levels: ['basica'] },
  { id: 'historia', title: 'Historia', icon: 'Globe', color: 'yellow', lessons: 7, levels: ['basica', 'media', 'paes'] },
  { id: 'ingles', title: 'Inglés', icon: 'Languages', color: 'purple', lessons: 15, levels: ['basica', 'media', 'paes'] },
  { id: 'fisica', title: 'Física', icon: 'Atom', color: 'indigo', lessons: 8, levels: ['media', 'paes'] },
  { id: 'quimica', title: 'Química', icon: 'FlaskConical', color: 'green', lessons: 8, levels: ['media', 'paes'] },
  { id: 'biologia', title: 'Biología', icon: 'Leaf', color: 'teal', lessons: 8, levels: ['media', 'paes'] },
];

export const adultSubjects: Subject[] = [
  { id: 'ingles-practico', title: 'Inglés Práctico', icon: 'Languages', color: 'purple', lessons: 0, levels: [], hasCurriculum: true },
  { id: 'contabilidad-finanzas', title: 'Contabilidad y Finanzas', icon: 'Calculator', color: 'green', lessons: 0, levels: [], hasCurriculum: true },
  { id: 'marketing-digital', title: 'Marketing Digital', icon: 'Megaphone', color: 'blue', lessons: 0, levels: [], hasCurriculum: true },
  { id: 'liderazgo-oratoria', title: 'Liderazgo y Oratoria', icon: 'Mic', color: 'red', lessons: 0, levels: [], hasCurriculum: true },
  { id: 'cocina', title: 'Cocina Rápida y Saludable', icon: 'CookingPot', color: 'yellow', lessons: 0, levels: [] },
  { id: 'cocktails-mocktails', title: 'Cocktails y Mocktails', icon: 'Martini', color: 'purple', lessons: 0, levels: [] },
];

export const liderazgoOratoriaCurriculum: Curriculum = {
  subjectId: 'liderazgo-oratoria',
  levels: [
    {
      id: 'lo-l1',
      title: 'Nivel 1 – Fundamentos de Liderazgo y Comunicación',
      description: 'Comprender la base de un buen líder y comunicador.',
      units: [
        {
          id: 'lo-l1-u1',
          title: 'Unidad 1: ¿Qué es liderazgo? Estilos y diferencias',
          objective: 'Identificar los diferentes tipos de liderazgo y sus características principales.',
          lessons: [
            { id: 'lo-l1-u1-l1', title: 'Definición de Liderazgo', objective: 'Comprender qué significa ser un líder.' },
            { id: 'lo-l1-u1-l2', title: 'Liderazgo Autocrático vs. Democrático', objective: 'Diferenciar dos estilos de liderazgo clásicos.' },
            { id: 'lo-l1-u1-l3', title: 'Liderazgo Laissez-Faire', objective: 'Conocer el liderazgo que delega la toma de decisiones.' },
            { id: 'lo-l1-u1-l4', title: 'Liderazgo Transformacional', objective: 'Aprender sobre el liderazgo que inspira y motiva.' },
            { id: 'lo-l1-u1-l5', title: 'Identificando tu propio estilo', objective: 'Reflexionar sobre tus tendencias naturales de liderazgo.' },
          ],
        },
        {
          id: 'lo-l1-u2',
          title: 'Unidad 2: Principios de la comunicación efectiva',
          objective: 'Aprender las claves para transmitir mensajes de forma clara y exitosa.',
          lessons: [
            { id: 'lo-l1-u2-l1', title: 'El modelo básico de comunicación', objective: 'Entender emisor, receptor, mensaje y canal.' },
            { id: 'lo-l1-u2-l2', title: 'La importancia de la escucha activa', objective: 'Aprender a escuchar para comprender, no solo para responder.' },
            { id: 'lo-l1-u2-l3', title: 'Claridad y concisión en el mensaje', objective: 'Técnicas para ser directo y fácil de entender.' },
            { id: 'lo-l1-u2-l4', title: 'Empatía en la comunicación', objective: 'Cómo ponerse en el lugar del otro para comunicar mejor.' },
            { id: 'lo-l1-u2-l5', title: 'Feedback constructivo', objective: 'Aprender a dar y recibir retroalimentación de manera efectiva.' },
          ],
        },
        {
          id: 'lo-l1-u3',
          title: 'Unidad 3: Lenguaje corporal y voz',
          objective: 'Dominar la comunicación no verbal para potenciar tu mensaje.',
          lessons: [
            { id: 'lo-l1-u3-l1', title: 'El poder del lenguaje corporal', objective: 'Entender cómo el cuerpo comunica más que las palabras.' },
            { id: 'lo-l1-u3-l2', title: 'Postura y gestos de confianza', objective: 'Proyectar seguridad a través de tu cuerpo.' },
            { id: 'lo-l1-u3-l3', title: 'El contacto visual', objective: 'Cómo usar la mirada para conectar con tu audiencia.' },
            { id: 'lo-l1-u3-l4', title: 'Manejo de la voz: tono, volumen y ritmo', objective: 'Utilizar la voz como una herramienta de persuasión.' },
            { id: 'lo-l1-u3-l5', title: 'Las pausas y su impacto', objective: 'Aprender a usar el silencio para dar énfasis y controlar el ritmo.' },
          ],
        },
        {
          id: 'lo-l1-u4',
          title: 'Unidad 4: Cómo vencer el miedo a hablar en público',
          objective: 'Desarrollar estrategias para controlar la ansiedad y ganar confianza.',
          lessons: [
            { id: 'lo-l1-u4-l1', title: 'Entendiendo la glosofobia', objective: 'Saber por qué sentimos miedo escénico.' },
            { id: 'lo-l1-u4-l2', title: 'Técnicas de preparación y práctica', objective: 'La mejor forma de reducir la ansiedad es estar preparado.' },
            { id: 'lo-l1-u4-l3', title: 'Ejercicios de respiración y relajación', objective: 'Técnicas para calmar los nervios antes de hablar.' },
            { id: 'lo-l1-u4-l4', title: 'Visualización positiva', objective: 'Cómo usar la mente para programar el éxito.' },
            { id: 'lo-l1-u4-l5', title: 'Transformando el miedo en energía', objective: 'Aprender a canalizar la adrenalina a tu favor.' },
          ],
        },
      ]
    },
    {
      id: 'lo-l2',
      title: 'Nivel 2 – Técnicas de Oratoria y Liderazgo en Acción',
      description: 'Aplicar técnicas prácticas para hablar y liderar.',
      units: [
        {
          id: 'lo-l2-u1',
          title: 'Unidad 1: Estructura de un discurso o presentación',
          objective: 'Aprender a organizar tus ideas de forma lógica y memorable.',
          lessons: [
            { id: 'lo-l2-u1-l1', title: 'La apertura: cómo captar la atención en 30 segundos', objective: 'Técnicas de inicio impactantes.' },
            { id: 'lo-l2-u1-l2', title: 'El cuerpo: desarrollando tus ideas principales', objective: 'Cómo organizar tus argumentos de forma coherente.' },
            { id: 'lo-l2-u1-l3', title: 'El cierre: cómo dejar una impresión duradera', objective: 'Técnicas de cierre memorables y llamadas a la acción.' },
            { id: 'lo-l2-u1-l4', title: 'Uso de transiciones efectivas', objective: 'Cómo conectar tus ideas de forma fluida.' },
            { id: 'lo-l2-u1-l5', title: 'Adaptando la estructura a tu audiencia y objetivo', objective: 'Personalizar tu discurso para mayor impacto.' },
          ],
        },
        {
          id: 'lo-l2-u2',
          title: 'Unidad 2: Storytelling: cómo contar historias que inspiran',
          objective: 'Utilizar el poder de las historias para conectar emocionalmente.',
          lessons: [
            { id: 'lo-l2-u2-l1', title: '¿Por qué las historias son tan poderosas?', objective: 'La ciencia detrás del storytelling.' },
            { id: 'lo-l2-u2-l2', title: 'La estructura básica de una historia', objective: 'Personaje, conflicto, resolución.' },
            { id: 'lo-l2-u2-l3', title: 'Cómo encontrar historias en tu vida personal y profesional', objective: 'Técnicas para identificar relatos relevantes.' },
            { id: 'lo-l2-u2-l4', title: 'Usando la descripción y la emoción', objective: 'Cómo hacer que tu audiencia sienta tu historia.' },
            { id: 'lo-l2-u2-l5', title: 'Aplicando storytelling en presentaciones de negocios', objective: 'Contar la historia de tu producto o empresa.' },
          ],
        },
        {
          id: 'lo-l2-u3',
          title: 'Unidad 3: Persuasión: técnicas retóricas simples (logos, ethos, pathos)',
          objective: 'Aprender los pilares de la persuasión de Aristóteles.',
          lessons: [
            { id: 'lo-l2-u3-l1', title: 'Logos: Apelando a la lógica', objective: 'Cómo usar datos, hechos y argumentos racionales.' },
            { id: 'lo-l2-u3-l2', title: 'Ethos: Construyendo tu credibilidad', objective: 'Cómo hacer que la gente confíe en ti y en tu mensaje.' },
            { id: 'lo-l2-u3-l3', title: 'Pathos: Conectando con las emociones', objective: 'Cómo apelar a los sentimientos de tu audiencia.' },
            { id: 'lo-l2-u3-l4', title: 'El equilibrio entre Logos, Ethos y Pathos', objective: 'Saber cuándo y cómo usar cada pilar.' },
            { id: 'lo-l2-u3-l5', title: 'Ejemplos prácticos en discursos famosos', objective: 'Analizar cómo los grandes oradores usan estas técnicas.' },
          ],
        },
        {
          id: 'lo-l2-u4',
          title: 'Unidad 4: Liderar reuniones y equipos pequeños',
          objective: 'Desarrollar habilidades para dirigir grupos de forma efectiva.',
          lessons: [
            { id: 'lo-l2-u4-l1', title: 'Cómo planificar una reunión efectiva', objective: 'Definir objetivos claros y una agenda.' },
            { id: 'lo-l2-u4-l2', title: 'Facilitación de discusiones', objective: 'Técnicas para fomentar la participación y mantener el enfoque.' },
            { id: 'lo-l2-u4-l3', title: 'Manejo de personalidades difíciles en un grupo', objective: 'Estrategias para lidiar con interrupciones y conflictos.' },
            { id: 'lo-l2-u4-l4', title: 'Delegación de tareas y responsabilidades', objective: 'Cómo asignar trabajo de forma clara y motivadora.' },
            { id: 'lo-l2-u4-l5', title: 'Feedback grupal e individual', objective: 'Dar retroalimentación efectiva a tu equipo.' },
          ],
        },
        {
          id: 'lo-l2-u5',
          title: 'Unidad 5: Ejercicio guiado: presentar un tema frente a la IA',
          objective: 'Poner en práctica lo aprendido en un entorno seguro.',
          lessons: [
            { id: 'lo-l2-u5-l1', title: 'Preparación del ejercicio', objective: 'Elegir un tema y estructurar una presentación de 2 minutos.' },
            { id: 'lo-l2-u5-l2', title: 'Práctica de la presentación', objective: 'Ensayar tu discurso para ganar fluidez.' },
            { id: 'lo-l2-u5-l3', title: 'Presentación a la IA', objective: 'Hablarle a la IA como si fuera una audiencia.' },
            { id: 'lo-l2-u5-l4', title: 'Análisis del feedback de la IA', objective: 'Revisar la evaluación sobre claridad, estructura y seguridad.' },
            { id: 'lo-l2-u5-l5', title: 'Reflexión y plan de mejora', objective: 'Identificar tus fortalezas y áreas a mejorar.' },
          ],
        },
      ]
    },
    {
      id: 'lo-l3',
      title: 'Nivel 3 – Oratoria Avanzada y Liderazgo Inspirador',
      description: 'Manejar escenarios más complejos y con impacto.',
      units: [
        {
          id: 'lo-l3-u1',
          title: 'Unidad 1: Hablar bajo presión (manejo de preguntas difíciles)',
          objective: 'Desarrollar la habilidad de responder con calma y eficacia en situaciones de alta presión.',
          lessons: [
            { id: 'lo-l3-u1-l1', title: 'Anticipando preguntas difíciles', objective: 'Cómo prepararse para las preguntas que no quieres recibir.' },
            { id: 'lo-l3-u1-l2', title: 'Técnica del Puente (Bridging)', objective: 'Cómo redirigir una pregunta hacia tu mensaje clave.' },
            { id: 'lo-l3-u1-l3', title: 'Manejo de preguntas hostiles o agresivas', objective: 'Estrategias para mantener la calma y el control.' },
            { id: 'lo-l3-u1-l4', title: 'Cómo decir "no sé" con confianza', objective: 'Responder honestamente sin perder credibilidad.' },
            { id: 'lo-l3-u1-l5', title: 'Sesión de preguntas y respuestas (Q&A)', objective: 'Práctica simulada de manejo de preguntas.' },
          ],
        },
        {
          id: 'lo-l3-u2',
          title: 'Unidad 2: Inspirar equipos en contextos de cambio',
          objective: 'Aprender a comunicar una visión y motivar a tu equipo durante la incertidumbre.',
          lessons: [
            { id: 'lo-l3-u2-l1', title: 'La comunicación en tiempos de crisis o cambio', objective: 'Principios de la comunicación transparente y empática.' },
            { id: 'lo-l3-u2-l2', title: 'Construyendo y comunicando una visión compartida', objective: 'Cómo alinear a tu equipo hacia un objetivo común.' },
            { id: 'lo-l3-u2-l3', title: 'El rol del líder como agente de cambio', objective: 'Cómo guiar a tu equipo a través de la transición.' },
            { id: 'lo-l3-u2-l4', title: 'Reconociendo y celebrando los logros', objective: 'La importancia de la motivación en el proceso.' },
            { id: 'lo-l3-u2-l5', title: 'Caso práctico: Comunicando una reestructuración', objective: 'Simulación de un escenario de cambio organizacional.' },
          ],
        },
        {
          id: 'lo-l3-u3',
          title: 'Unidad 3: Debates y negociaciones',
          objective: 'Desarrollar habilidades para argumentar y llegar a acuerdos beneficiosos.',
          lessons: [
            { id: 'lo-l3-u3-l1', title: 'Principios de la negociación ganar-ganar', objective: 'Buscar soluciones que beneficien a todas las partes.' },
            { id: 'lo-l3-u3-l2', title: 'Preparación de un debate o negociación', objective: 'Investigar, definir tus objetivos y límites.' },
            { id: 'lo-l3-u3-l3', title: 'Técnicas de argumentación y contra-argumentación', objective: 'Cómo presentar tus puntos y refutar los de otros.' },
            { id: 'lo-l3-u3-l4', title: 'Manejo de objeciones y puntos muertos', objective: 'Estrategias para superar los obstáculos en una negociación.' },
            { id: 'lo-l3-u3-l5', title: 'Práctica de debate simulado', objective: 'Ejercicio práctico sobre un tema controversial.' },
          ],
        },
        {
          id: 'lo-l3-u4',
          title: 'Unidad 4: Discurso motivacional (ejercicio guiado)',
          objective: 'Crear y practicar un discurso diseñado para inspirar a la acción.',
          lessons: [
            { id: 'lo-l3-u4-l1', title: 'Elementos clave de un discurso motivacional', objective: 'Visión, emoción, llamado a la acción.' },
            { id: 'lo-l3-u4-l2', title: 'Estructurando tu propio discurso', objective: 'Definir tu mensaje y objetivo inspirador.' },
            { id: 'lo-l3-u4-l3', title: 'Uso de lenguaje poderoso y figuras retóricas', objective: 'Metáforas, anáforas y otras técnicas.' },
            { id: 'lo-l3-u4-l4', title: 'Práctica y grabación de tu discurso', objective: 'Ensayar para pulir tu entrega.' },
            { id: 'lo-l3-u4-l5', title: 'Análisis y feedback sobre el discurso', objective: 'Revisar la grabación y recibir retroalimentación.' },
          ],
        },
        {
          id: 'lo-l3-u5',
          title: 'Unidad 5: Proyecto final: simulación de persuasión con la IA',
          objective: 'Aplicar todas las habilidades en un desafío final de comunicación.',
          lessons: [
            { id: 'lo-l3-u5-l1', title: 'Definición del escenario del proyecto', objective: 'Elegir si persuadir a jefes, clientes o colaboradores.' },
            { id: 'lo-l3-u5-l2', title: 'Preparación de la estrategia de persuasión', objective: 'Definir tus argumentos, historias y datos clave.' },
            { id: 'lo-l3-u5-l3', title: 'Sesión de simulación con la IA', objective: 'Presentar tu caso y responder a las preguntas y objeciones de la IA.' },
            { id: 'lo-l3-u5-l4', title: 'Evaluación de la IA sobre tu desempeño', objective: 'Recibir un análisis detallado de tu persuasión y comunicación.' },
            { id: 'lo-l3-u5-l5', title: 'Autoevaluación y próximos pasos', objective: 'Crear un plan de desarrollo continuo para tus habilidades.' },
          ],
        },
      ]
    },
  ],
};

export const marketingCurriculum: Curriculum = {
  subjectId: 'marketing-digital',
  levels: [
    {
      id: 'md-l1',
      title: 'Nivel 1 – Fundamentos del Marketing Digital',
      description: 'Entender los conceptos básicos y cómo se diferencian del marketing tradicional.',
      units: [
        {
          id: 'md-l1-u1',
          title: 'Unidad 1: ¿Qué es el marketing digital?',
          objective: 'Comprender los canales, beneficios y conceptos clave del marketing online.',
          lessons: [
            { id: 'md-l1-u1-l1', title: 'Marketing tradicional vs. digital', objective: 'Diferenciar las estrategias online y offline.' },
            { id: 'md-l1-u1-l2', title: 'Principales canales digitales', objective: 'Conocer redes sociales, SEO, email, etc.' },
            { id: 'md-l1-u1-l3', title: 'Beneficios del marketing online', objective: 'Entender el alcance, la medición y el ROI.' },
            { id: 'md-l1-u1-l4', title: 'Glosario esencial para empezar', objective: 'Definir términos como clic, impresión y conversión.' },
            { id: 'md-l1-u1-l5', title: 'El rol del especialista en marketing', objective: 'Comprender las funciones y habilidades necesarias.' },
          ],
        },
        {
          id: 'md-l1-u2',
          title: 'Unidad 2: El embudo de conversión',
          objective: 'Entender el viaje del cliente desde el descubrimiento hasta la compra.',
          lessons: [
            { id: 'md-l1-u2-l1', title: 'Etapa de Awareness (Conciencia)', objective: 'Cómo atraer la atención de nuevos usuarios.' },
            { id: 'md-l1-u2-l2', title: 'Etapa de Consideration (Consideración)', objective: 'Cómo educar y mostrar el valor de tu producto.' },
            { id: 'md-l1-u2-l3', title: 'Etapa de Decision (Decisión)', objective: 'Cómo motivar la compra o conversión final.' },
            { id: 'md-l1-u2-l4', title: 'Aplicando el embudo a un negocio real', objective: 'Analizar un caso práctico del viaje del cliente.' },
            { id: 'md-l1-u2-l5', title: 'Más allá de la venta: Fidelización', objective: 'Entender la importancia de retener clientes.' },
          ],
        },
        {
          id: 'md-l1-u3',
          title: 'Unidad 3: Buyer Persona',
          objective: 'Aprender a definir a tu cliente ideal para enfocar tus esfuerzos.',
          lessons: [
            { id: 'md-l1-u3-l1', title: '¿Qué es y por qué necesitas un Buyer Persona?', objective: 'Comprender el valor de conocer a tu audiencia.' },
            { id: 'md-l1-u3-l2', title: 'Investigación de mercado básica', objective: 'Cómo obtener datos sobre tus potenciales clientes.' },
            { id: 'md-l1-u3-l3', title: 'Creando tu primer Buyer Persona paso a paso', objective: 'Desarrollar un perfil detallado de cliente.' },
            { id: 'md-l1-u3-l4', title: 'Diferencia entre público objetivo y Buyer Persona', objective: 'Aclarar dos conceptos clave del marketing.' },
            { id: 'md-l1-u3-l5', title: 'Errores comunes al crear un Buyer Persona', objective: 'Evitar los fallos más habituales.' },
          ],
        },
        {
          id: 'md-l1-u4',
          title: 'Unidad 4: Estrategia de Contenidos Básica',
          objective: 'Comprender el valor del contenido para atraer y retener a tu audiencia.',
          lessons: [
            { id: 'md-l1-u4-l1', title: '¿Qué es el marketing de contenidos?', objective: 'Entender por qué el contenido es el rey.' },
            { id: 'md-l1-u4-l2', title: 'Formatos de contenido populares', objective: 'Explorar blogs, videos, infografías y podcasts.' },
            { id: 'md-l1-u4-l3', title: 'Planificación de un calendario de contenidos', objective: 'Aprender a organizar tus publicaciones.' },
            { id: 'md-l1-u4-l4', title: 'Ideas para tu primer contenido', objective: 'Cómo generar temas relevantes para tu audiencia.' },
            { id: 'md-l1-u4-l5', title: 'Introducción al Storytelling', objective: 'Aprender a conectar emocionalmente con tu público.' },
          ],
        },
        {
          id: 'md-l1-u5',
          title: 'Unidad 5: KPIs Esenciales',
          objective: 'Aprender a medir el éxito de tus primeras acciones de marketing.',
          lessons: [
            { id: 'md-l1-u5-l1', title: '¿Qué es un KPI y por qué es importante?', objective: 'Entender la importancia de medir resultados.' },
            { id: 'md-l1-u5-l2', title: 'Métricas de alcance e interacción', objective: 'Medir seguidores, "me gusta", comentarios y compartidos.' },
            { id: 'md-l1-u5-l3', title: 'Métricas de tráfico web', objective: 'Entender visitas, usuarios únicos y tasa de rebote.' },
            { id: 'md-l1-u5-l4', title: 'Métricas de conversión', objective: 'Medir leads, ventas y el coste por adquisición (CPA).' },
            { id: 'md-l1-u5-l5', title: 'Creando tu primer dashboard de métricas', objective: 'Aprender a visualizar tus datos más importantes.' },
          ],
        },
      ],
    },
    {
      id: 'md-l2',
      title: 'Nivel 2 – Canales y Estrategias Básicas',
      description: 'Conocer y aplicar los principales canales digitales.',
      units: [
        {
          id: 'md-l2-u1',
          title: 'Unidad 1: Redes Sociales',
          objective: 'Gestionar perfiles en las plataformas más importantes.',
          lessons: [
            { id: 'md-l2-u1-l1', title: 'Estrategia para Facebook e Instagram', objective: 'Crear contenido y crecer tu comunidad.' },
            { id: 'md-l2-u1-l2', title: 'TikTok: El poder del vídeo corto', objective: 'Entender el algoritmo y crear contenido viral.' },
            { id: 'md-l2-u1-l3', title: 'LinkedIn para profesionales y B2B', objective: 'Optimizar tu perfil y generar contactos de negocio.' },
            { id: 'md-l2-u1-l4', title: 'Herramientas de gestión de redes sociales', objective: 'Programar publicaciones y analizar resultados.' },
            { id: 'md-l2-u1-l5', title: 'Cómo crear un plan de contenidos para RRSS', objective: 'Definir pilares de contenido y frecuencia.' },
          ],
        },
        {
          id: 'md-l2-u2',
          title: 'Unidad 2: SEO Básico',
          objective: 'Aprender los fundamentos para que tu web aparezca en Google.',
          lessons: [
            { id: 'md-l2-u2-l1', title: '¿Cómo funcionan los motores de búsqueda?', objective: 'Entender el rastreo, la indexación y el ranking.' },
            { id: 'md-l2-u2-l2', title: 'Investigación de palabras clave (Keywords)', objective: 'Encontrar los términos que busca tu audiencia.' },
            { id: 'md-l2-u2-l3', title: 'SEO On-Page: Optimizando tu sitio', objective: 'Mejorar títulos, meta descripciones y contenido.' },
            { id: 'md-l2-u2-l4', title: 'SEO Off-Page: Link Building básico', objective: 'Entender la importancia de los enlaces externos.' },
            { id: 'md-l2-u2-l5', title: 'Herramientas SEO gratuitas', objective: 'Conocer Google Search Console y otras utilidades.' },
          ],
        },
        {
          id: 'md-l2-u3',
          title: 'Unidad 3: Email Marketing Inicial',
          objective: 'Aprender a construir una lista de suscriptores y enviar campañas.',
          lessons: [
            { id: 'md-l2-u3-l1', title: 'Por qué el email marketing sigue siendo vital', objective: 'Entender el valor de una base de datos propia.' },
            { id: 'md-l2-u3-l2', title: 'Cómo captar suscriptores (Lead Magnets)', objective: 'Crear incentivos para que la gente se suscriba.' },
            { id: 'md-l2-u3-l3', title: 'Anatomía de un email que convierte', objective: 'Asunto, cuerpo del email y llamada a la acción.' },
            { id: 'md-l2-u3-l4', title: 'Creando tu primera campaña de email', objective: 'Usar herramientas como Mailchimp o Brevo.' },
            { id: 'md-l2-u3-l5', title: 'Métricas clave en email marketing', objective: 'Tasa de apertura, tasa de clics y bajas.' },
          ],
        },
        {
          id: 'md-l2-u4',
          title: 'Unidad 4: Creación de Blogs y Marketing de Contenidos',
          objective: 'Aprender a crear y promocionar contenido de valor en un blog.',
          lessons: [
            { id: 'md-l2-u4-l1', title: 'Cómo elegir una plataforma para tu blog', objective: 'Comparar WordPress, Medium y otras opciones.' },
            { id: 'md-l2-u4-l2', title: 'Estructura de un artículo de blog optimizado para SEO', objective: 'Aprender a usar encabezados, imágenes y enlaces.' },
            { id: 'md-l2-u4-l3', 'title': 'Promoción de tu contenido', 'objective': 'Estrategias para difundir tus artículos en redes y email.' },
            { id: 'md-l2-u4-l4', title: 'Reutilización de contenido', objective: 'Convertir un artículo de blog en múltiples formatos.' },
            { id: 'md-l2-u4-l5', title: 'Guest blogging: Colaborando con otros', objective: 'Entender los beneficios de escribir en otros blogs.' },
          ],
        },
        {
          id: 'md-l2-u5',
          title: 'Unidad 5: Introducción al E-commerce',
          objective: 'Comprender los conceptos básicos para vender productos online.',
          lessons: [
            { id: 'md-l2-u5-l1', title: 'Tipos de plataformas de e-commerce', objective: 'Comparar Shopify, WooCommerce y otras.' },
            { id: 'md-l2-u5-l2', title: 'La ficha de producto perfecta', objective: 'Elementos clave para describir y vender un producto.' },
            { id: 'md-l2-u5-l3', title: 'Fotografía y vídeo para e-commerce', objective: 'La importancia de la calidad visual.' },
            { id: 'md-l2-u5-l4', title: 'Pasarelas de pago y logística', objective: 'Entender cómo se procesan los pagos y envíos.' },
            { id: 'md-l2-u5-l5', title: 'Estrategias básicas para aumentar ventas', objective: 'Venta cruzada, up-selling y cupones de descuento.' },
          ],
        },
      ],
    },
    {
      id: 'md-l3',
      title: 'Nivel 3 – Publicidad Online y Analítica',
      description: 'Aprender a invertir y medir campañas digitales.',
      units: [
        {
          id: 'md-l3-u1',
          title: 'Unidad 1: Google Ads',
          objective: 'Crear y gestionar campañas en la plataforma de Google.',
          lessons: [
            { id: 'md-l3-u1-l1', title: 'Campañas de Búsqueda (Search)', objective: 'Anuncios de texto para gente que busca activamente.' },
            { id: 'md-l3-u1-l2', title: 'Campañas de Display', objective: 'Anuncios gráficos en sitios web y apps.' },
            { id: 'md-l3-u1-l3', title: 'Estructura de una cuenta de Google Ads', objective: 'Campañas, grupos de anuncios y anuncios.' },
            { id: 'md-l3-u1-l4', title: 'Nivel de Calidad (Quality Score)', objective: 'Entender cómo Google puntúa tus anuncios.' },
            { id: 'md-l3-u1-l5', title: 'Introducción a las conversiones', objective: 'Medir las acciones valiosas en tu sitio web.' },
          ],
        },
        {
          id: 'md-l3-u2',
          title: 'Unidad 2: Meta Ads (Facebook + Instagram)',
          objective: 'Crear campañas efectivas en las redes sociales de Meta.',
          lessons: [
            { id: 'md-l3-u2-l1', title: 'El Business Manager de Meta', objective: 'Configurar tu cuenta publicitaria correctamente.' },
            { id: 'md-l3-u2-l2', title: 'Tipos de objetivos de campaña', objective: 'Alcance, interacción, tráfico, conversiones.' },
            { id: 'md-l3-u2-l3', title: 'Segmentación de audiencias', objective: 'Llegar a tu público por intereses, demografía, etc.' },
            { id: 'md-l3-u2-l4', title: 'El Píxel de Meta y su importancia', objective: 'Seguimiento de conversiones y remarketing.' },
            { id: 'md-l3-u2-l5', title: 'Creación de anuncios visuales atractivos', objective: 'Formatos de imagen, vídeo y carrusel.' },
          ],
        },
        {
          id: 'md-l3-u3',
          title: 'Unidad 3: TikTok Ads y LinkedIn Ads',
          objective: 'Publicidad en plataformas de nicho y profesionales.',
          lessons: [
            { id: 'md-l3-u3-l1', title: 'Fundamentos de la publicidad en TikTok', objective: 'Entender la plataforma y sus formatos de anuncio.' },
            { id: 'md-l3-u3-l2', title: 'Creando tu primera campaña en TikTok', objective: 'Paso a paso para lanzar un anuncio de vídeo.' },
            { id: 'md-l3-u3-l3', title: 'Cuándo usar LinkedIn Ads', objective: 'Estrategias para B2B y marketing profesional.' },
            { id: 'md-l3-u3-l4', title: 'Tipos de anuncios en LinkedIn', objective: 'Contenido patrocinado, InMail y anuncios de texto.' },
            { id: 'md-l3-u3-l5', title: 'Segmentación en LinkedIn', objective: 'Llegar a profesionales por cargo, empresa o sector.' },
          ],
        },
        {
          id: 'md-l3-u4',
          title: 'Unidad 4: Google Analytics y Métricas Clave',
          objective: 'Aprender a analizar el tráfico de tu web y el comportamiento del usuario.',
          lessons: [
            { id: 'md-l3-u4-l1', title: 'Configuración inicial de Google Analytics 4', objective: 'Instalar el código de seguimiento en tu sitio.' },
            { id: 'md-l3-u4-l2', title: 'Informes de adquisición: ¿De dónde vienen tus visitas?', objective: 'Analizar canales como orgánico, social, pagado.' },
            { id: 'md-l3-u4-l3', title: 'Informes de interacción: ¿Qué hacen en tu web?', objective: 'Páginas vistas, tiempo en página y eventos.' },
            { id: 'md-l3-u4-l4', title: 'Creación de objetivos y seguimiento de conversiones', objective: 'Medir las acciones más importantes en tu sitio.' },
            { id: 'md-l3-u4-l5', title: 'Creando un informe básico de resultados', objective: 'Resumir el rendimiento de tus campañas.' },
          ],
        },
        {
          id: 'md-l3-u5',
          title: 'Unidad 5: Optimización de Campañas (A/B Testing)',
          objective: 'Aprender a mejorar tus resultados mediante la experimentación.',
          lessons: [
            { id: 'md-l3-u5-l1', title: '¿Qué es el A/B testing y por qué es crucial?', objective: 'El método científico aplicado al marketing.' },
            { id: 'md-l3-u5-l2', title: 'Elementos a testear en tus anuncios', objective: 'Probar diferentes imágenes, textos y llamadas a la acción.' },
            { id: 'md-l3-u5-l3', title: 'A/B testing en landing pages', objective: 'Optimizar páginas de destino para aumentar conversiones.' },
            { id: 'md-l3-u5-l4', title: 'Herramientas para A/B testing', objective: 'Conocer opciones como Google Optimize y otras.' },
            { id: 'md-l3-u5-l5', title: 'Cómo interpretar los resultados de un test', objective: 'Significancia estadística y toma de decisiones.' },
          ],
        },
      ],
    },
    {
      id: 'md-l4',
      title: 'Nivel 4 – Estrategias Avanzadas y Automatización',
      description: 'Integrar campañas y optimizar recursos.',
      units: [
        {
          id: 'md-l4-u1',
          title: 'Unidad 1: Marketing Automation',
          objective: 'Aprender a automatizar tareas repetitivas de marketing.',
          lessons: [
            { id: 'md-l4-u1-l1', title: 'Conceptos clave de la automatización', objective: 'Entender flujos de trabajo (workflows) y disparadores (triggers).' },
            { id: 'md-l4-u1-l2', title: 'Automatización de email marketing', objective: 'Crear secuencias de bienvenida y nutrición de leads.' },
            { id: 'md-l4-u1-l3', title: 'Lead scoring: Calificando a tus prospectos', objective: 'Puntuar a los leads según su interacción.' },
            { id: 'md-l4-u1-l4', title: 'Herramientas populares de automatización', objective: 'Introducción a HubSpot, Mailchimp, n8n.' },
            { id: 'md-l4-u1-l5', title: 'Automatización en redes sociales', objective: 'Programación avanzada y respuestas automáticas.' },
          ],
        },
        {
          id: 'md-l4-u2',
          title: 'Unidad 2: Remarketing y Retargeting',
          objective: 'Volver a impactar a usuarios que ya han interactuado con tu marca.',
          lessons: [
            { id: 'md-l4-u2-l1', title: 'Cómo funciona el remarketing', objective: 'Entender el uso de cookies y píxeles.' },
            { id: 'md-l4-u2-l2', title: 'Campañas de remarketing en Google Ads', objective: 'Mostrar anuncios a visitantes de tu web.' },
            { id: 'md-l4-u2-l3', title: 'Remarketing dinámico para e-commerce', objective: 'Mostrar anuncios de los productos que han visto.' },
            { id: 'md-l4-u2-l4', title: 'Listas de remarketing en Meta Ads', objective: 'Crear audiencias personalizadas basadas en la interacción.' },
            { id: 'md-l4-u2-l5', title: 'Estrategias efectivas de remarketing', objective: 'Evitar la fatiga del anuncio y segmentar bien.' },
          ],
        },
        {
          id: 'md-l4-u3',
          title: 'Unidad 3: Estrategias de Inbound Marketing',
          objective: 'Aprender a atraer clientes con contenido de valor sin ser intrusivo.',
          lessons: [
            { id: 'md-l4-u3-l1', title: 'Metodología Inbound: Atraer, Interactuar, Deleitar', objective: 'Entender las fases del Inbound Marketing.' },
            { id: 'md-l4-u3-l2', title: 'Creación de pilares de contenido (Pillar Pages)', objective: 'Organizar tu contenido para dominar un tema.' },
            { id: 'md-l4-u3-l3', title: 'Uso de CTAs, landing pages y formularios', objective: 'Las herramientas clave para la conversión.' },
            { id: 'md-l4-u3-l4', title: 'Nutrición de leads (Lead Nurturing)', objective: 'Acompañar al usuario hasta la compra.' },
            { id: 'md-l4-u3-l5', title: 'Alineación de marketing y ventas (Smarketing)', objective: 'Trabajar en equipo para cerrar más clientes.' },
          ],
        },
        {
          id: 'md-l4-u4',
          title: 'Unidad 4: Social Listening y Reputación Online',
          objective: 'Aprender a monitorizar lo que se dice de tu marca y gestionar crisis.',
          lessons: [
            { id: 'md-l4-u4-l1', title: '¿Qué es el Social Listening?', objective: 'La importancia de escuchar a tu audiencia.' },
            { id: 'md-l4-u4-l2', title: 'Herramientas de monitorización', objective: 'Conocer opciones para rastrear menciones.' },
            { id: 'md-l4-u4-l3', title: 'Gestión de la reputación online', objective: 'Cómo responder a comentarios positivos y negativos.' },
            { id: 'md-l4-u4-l4', title: 'Prevención y manejo de crisis de reputación', objective: 'Protocolos de actuación ante una crisis.' },
            { id: 'md-l4-u4-l5', title: 'Análisis de la competencia en redes sociales', objective: 'Aprender de lo que hacen otros en tu sector.' },
          ],
        },
        {
          id: 'md-l4-u5',
          title: 'Unidad 5: Marketing de Influencers y Colaboraciones',
          objective: 'Aprender a trabajar con creadores de contenido para ampliar tu alcance.',
          lessons: [
            { id: 'md-l4-u5-l1', title: 'Tipos de influencers', objective: 'Nano, micro, macro y mega influencers.' },
            { id: 'md-l4-u5-l2', title: 'Cómo encontrar y contactar influencers', objective: 'Estrategias para una colaboración exitosa.' },
            { id: 'md-l4-u5-l3', title: 'Modelos de colaboración', objective: 'Pago, intercambio de productos, marketing de afiliados.' },
            { id: 'md-l4-u5-l4', title: 'Métricas para medir el éxito de una campaña', objective: 'ROI, alcance, interacción y conversiones.' },
            { id: 'md-l4-u5-l5', title: 'Aspectos legales y buenas prácticas', objective: 'Transparencia y regulaciones publicitarias.' },
          ],
        },
      ],
    },
    {
      id: 'md-l5',
      title: 'Nivel 5 – Proyecto Profesional y Tendencias',
      description: 'Aplicar lo aprendido en un caso real y conocer lo último del sector.',
      units: [
        {
          id: 'md-l5-u1',
          title: 'Unidad 1: Cómo armar un plan de marketing digital completo',
          objective: 'Estructurar un documento estratégico de principio a fin.',
          lessons: [
            { id: 'md-l5-u1-l1', title: 'Análisis de la situación (FODA)', objective: 'Diagnosticar las fortalezas, oportunidades, debilidades y amenazas.' },
            { id: 'md-l5-u1-l2', title: 'Definición de objetivos SMART', objective: 'Establecer metas específicas, medibles y realistas.' },
            { id: 'md-l5-u1-l3', title: 'Selección de canales y tácticas', objective: 'Elegir las mejores herramientas para tus objetivos.' },
            { id: 'md-l5-u1-l4', title: 'Presupuesto y asignación de recursos', objective: 'Cómo distribuir la inversión entre canales.' },
            { id: 'md-l5-u1-l5', title: 'Cronograma de acciones (Gantt)', objective: 'Planificar la ejecución de la estrategia en el tiempo.' },
          ],
        },
        {
          id: 'md-l5-u2',
          title: 'Unidad 2: Caso práctico: lanzamiento de un producto online',
          objective: 'Aplicar todos los conocimientos en un escenario real simulado.',
          lessons: [
            { id: 'md-l5-u2-l1', title: 'Fase de Pre-lanzamiento', objective: 'Generar expectación y captar leads.' },
            { id: 'md-l5-u2-l2', title: 'Fase de Lanzamiento', objective: 'Coordinar todos los canales para el gran día.' },
            { id: 'md-l5-u2-l3', title: 'Fase de Post-lanzamiento', objective: 'Recoger feedback y fidelizar a los primeros clientes.' },
            { id: 'md-l5-u2-l4', title: 'Análisis de resultados del lanzamiento', objective: 'Medir el éxito y aprender de los errores.' },
            { id: 'md-l5-u2-l5', title: 'Ejemplos de lanzamientos exitosos', objective: 'Estudiar casos de estudio de grandes marcas.' },
          ],
        },
        {
          id: 'md-l5-u3',
          title: 'Unidad 3: Tendencias: IA, Chatbots y Personalización',
          objective: 'Conocer las tecnologías que están cambiando el marketing.',
          lessons: [
            { id: 'md-l5-u3-l1', title: 'Inteligencia Artificial en Marketing', objective: 'Generación de contenido, análisis predictivo y más.' },
            { id: 'md-l5-u3-l2', title: 'Chatbots y marketing conversacional', objective: 'Automatizar la atención al cliente y la captación de leads.' },
            { id: 'md-l5-u3-l3', title: 'Personalización a escala', objective: 'Entregar experiencias únicas a cada usuario.' },
            { id: 'md-l5-u3-l4', title: 'El futuro del SEO: Búsqueda por voz y visual', objective: 'Adaptarse a las nuevas formas de buscar.' },
            { id: 'md-l5-u3-l5', title: 'Privacidad de datos y el futuro sin cookies', objective: 'Nuevas estrategias ante los cambios regulatorios.' },
          ],
        },
        {
          id: 'md-l5-u4',
          title: 'Unidad 4: Growth Hacking y Estrategias de Bajo Costo',
          objective: 'Aprender técnicas creativas para crecer rápidamente con recursos limitados.',
          lessons: [
            { id: 'md-l5-u4-l1', title: 'Mentalidad Growth Hacker', objective: 'Foco en la experimentación y el crecimiento.' },
            { id: 'md-l5-u4-l2', title: 'El modelo AARRR (Pirate Metrics)', objective: 'Adquisición, Activación, Retención, Referencia, Ingresos.' },
            { id: 'md-l5-u4-l3', title: 'Marketing de referidos y viralidad', objective: 'Incentivar a tus usuarios para que te recomienden.' },
            { id: 'md-l5-u4-l4', title: 'Estrategias de contenido viral', objective: 'Crear contenido diseñado para ser compartido.' },
            { id: 'md-l5-u4-l5', title: 'Optimización de la tasa de conversión (CRO)', objective: 'Mejorar tu web para que más visitas se conviertan en clientes.' },
          ],
        },
        {
          id: 'md-l5-u5',
          title: 'Unidad 5: Proyecto final: plan digital para una marca ficticia',
          objective: 'Demostrar todo lo aprendido creando un plan de marketing completo.',
          lessons: [
            { id: 'md-l5-u5-l1', title: 'Elección de la marca y análisis inicial', objective: 'Definir el punto de partida del proyecto.' },
            { id: 'md-l5-u5-l2', title: 'Desarrollo de la estrategia y objetivos', objective: 'Crear el núcleo del plan de marketing.' },
            { id: 'md-l5-u5-l3', title: 'Plan de acción y presupuesto', objective: 'Detallar las tácticas y la inversión necesaria.' },
            { id: 'md-l5-u5-l4', title: 'Definición de KPIs y plan de medición', objective: 'Establecer cómo se medirá el éxito.' },
            { id: 'md-l5-u5-l5', title: 'Presentación del proyecto final', objective: 'Comunicar la estrategia de forma clara y profesional.' },
          ],
        },
      ],
    },
  ],
};

export const accountingCurriculum: Curriculum = {
  subjectId: 'contabilidad-finanzas',
  levels: [
    {
      id: 'cf-l1',
      title: 'Nivel 1 – Fundamentos de Contabilidad',
      description: 'Entender qué es la contabilidad y su utilidad en el mundo real.',
      units: [
        {
          id: 'cf-l1-u1',
          title: 'Unidad 1: Introducción a la contabilidad',
          objective: 'Comprender el propósito y la importancia de la contabilidad.',
          lessons: [
            { id: 'cf-l1-u1-l1', title: '¿Qué es la contabilidad y para qué sirve?', objective: 'Definir la contabilidad como el lenguaje de los negocios.' },
            { id: 'cf-l1-u1-l2', title: 'Tipos de contabilidad', objective: 'Diferenciar entre contabilidad financiera, de gestión y fiscal.' },
            { id: 'cf-l1-u1-l3', title: 'Usuarios de la información contable', objective: 'Identificar quién usa la información y para qué.' },
            { id: 'cf-l1-u1-l4', title: 'Principios éticos en contabilidad', objective: 'Comprender la importancia de la integridad y objetividad.' },
            { id: 'cf-l1-u1-l5', title: 'El rol del contador en la empresa moderna', objective: 'Explorar las responsabilidades y oportunidades.' },
          ]
        },
        {
          id: 'cf-l1-u2',
          title: 'Unidad 2: Principios básicos',
          objective: 'Dominar los conceptos fundamentales de la ecuación contable.',
          lessons: [
            { id: 'cf-l1-u2-l1', title: 'La ecuación contable: Activo = Pasivo + Patrimonio', objective: 'Entender la base de toda la contabilidad.' },
            { id: 'cf-l1-u2-l2', title: 'Definición y ejemplos de Activos', objective: 'Identificar los recursos que posee una empresa.' },
            { id: 'cf-l1-u2-l3', title: 'Definición y ejemplos de Pasivos', objective: 'Identificar las deudas y obligaciones de una empresa.' },
            { id: 'cf-l1-u2-l4', title: 'Definición y ejemplos de Patrimonio', objective: 'Comprender la inversión de los dueños.' },
            { id: 'cf-l1-u2-l5', title: 'El principio de la partida doble', objective: 'Entender que cada transacción tiene un doble efecto.' },
          ]
        },
        {
          id: 'cf-l1-u3',
          title: 'Unidad 3: Estados financieros básicos',
          objective: 'Conocer los informes principales que genera la contabilidad.',
          lessons: [
            { id: 'cf-l1-u3-l1', title: 'Introducción al Balance General', objective: 'La fotografía financiera de la empresa.' },
            { id: 'cf-l1-u3-l2', title: 'Introducción al Estado de Resultados', objective: 'El video de la rentabilidad de la empresa.' },
            { id: 'cf-l1-u3-l3', title: 'Introducción al Estado de Flujo de Efectivo', objective: 'Entender de dónde viene y a dónde va el dinero.' },
            { id: 'cf-l1-u3-l4', title: 'Cómo se relacionan los estados financieros', objective: 'Comprender la conexión entre los informes.' },
            { id: 'cf-l1-u3-l5', title: 'La importancia de las notas a los estados financieros', objective: 'Entender la información complementaria.' },
          ]
        },
        {
          id: 'cf-l1-u4',
          title: 'Unidad 4: Ciclo contable',
          objective: 'Aprender el proceso completo desde la transacción hasta el informe.',
          lessons: [
            { id: 'cf-l1-u4-l1', title: 'Paso 1: Análisis de transacciones', objective: 'Identificar y documentar operaciones económicas.' },
            { id: 'cf-l1-u4-l2', title: 'Paso 2: Registro en el Libro Diario', objective: 'Aprender a hacer asientos contables.' },
            { id: 'cf-l1-u4-l3', title: 'Paso 3: Traspaso al Libro Mayor', objective: 'Clasificar y resumir la información por cuentas.' },
            { id: 'cf-l1-u4-l4', title: 'Paso 4: Balance de Comprobación', objective: 'Verificar la igualdad de débitos y créditos.' },
            { id: 'cf-l1-u4-l5', title: 'Paso 5: Cierre y preparación de informes', objective: 'El final del ciclo y la generación de los estados financieros.' },
          ]
        },
        {
          id: 'cf-l1-u5',
          title: 'Unidad 5: Software y herramientas contables modernas',
          objective: 'Conocer las herramientas tecnológicas que facilitan la contabilidad.',
          lessons: [
            { id: 'cf-l1-u5-l1', title: 'Beneficios de usar un software contable', objective: 'Eficiencia, precisión y reportes en tiempo real.' },
            { id: 'cf-l1-u5-l2', title: 'Introducción a softwares para Pymes (ej. Quickbooks, Xero)', objective: 'Conocer las funcionalidades básicas.' },
            { id: 'cf-l1-u5-l3', title: 'ERP y su módulo de contabilidad (ej. SAP, Oracle)', objective: 'Entender los sistemas integrados para grandes empresas.' },
            { id: 'cf-l1-u5-l4', title: 'La importancia de la hoja de cálculo (Excel/Google Sheets)', objective: 'Herramienta fundamental para análisis y reportes.' },
            { id: 'cf-l1-u5-l5', title: 'Tendencias: Contabilidad en la nube y automatización', objective: 'El futuro de la profesión contable.' },
          ]
        },
      ]
    },
    {
        id: 'cf-l2',
        title: 'Nivel 2 – Contabilidad Financiera Básica',
        description: 'Aprender a registrar y entender las operaciones más comunes de una empresa.',
        units: [
            {
                id: 'cf-l2-u1',
                title: 'Unidad 1: Registro de transacciones',
                objective: 'Aplicar el principio de partida doble a operaciones diarias.',
                lessons: [
                    { id: 'cf-l2-u1-l1', title: 'Registro de compras de inventario', objective: 'Contabilizar al contado y al crédito.' },
                    { id: 'cf-l2-u1-l2', title: 'Registro de ventas de bienes y servicios', objective: 'Reconocimiento de ingresos.' },
                    { id: 'cf-l2-u1-l3', title: 'Registro de gastos operativos', objective: 'Contabilizar sueldos, arriendos y servicios básicos.' },
                    { id: 'cf-l2-u1-l4', title: 'Registro de aportes de capital y retiros', objective: 'Entender las transacciones con los dueños.' },
                    { id: 'cf-l2-u1-l5', title: 'Registro de obtención y pago de préstamos', objective: 'Contabilizar la deuda financiera.' },
                ]
            },
            {
                id: 'cf-l2-u2',
                title: 'Unidad 2: Libro diario y libro mayor',
                objective: 'Dominar las herramientas centrales del registro contable.',
                lessons: [
                    { id: 'cf-l2-u2-l1', title: 'Estructura del Libro Diario', objective: 'Fecha, código, cuenta, debe, haber y glosa.' },
                    { id: 'cf-l2-u2-l2', title: 'Casos prácticos de asientos en el Libro Diario', objective: 'Ejercicios de registro de varias transacciones.' },
                    { id: 'cf-l2-u2-l3', title: 'El propósito del Libro Mayor (Cuentas T)', objective: 'Resumir los movimientos de cada cuenta.' },
                    { id: 'cf-l2-u2-l4', title: 'Cómo traspasar del Diario al Mayor', objective: 'El proceso de mayorización.' },
                    { id: 'cf-l2-u2-l5', title: 'Cálculo de saldos (deudor y acreedor)', objective: 'Determinar la posición final de cada cuenta.' },
                ]
            },
            {
                id: 'cf-l2-u3',
                title: 'Unidad 3: Balances de comprobación',
                objective: 'Aprender a verificar la exactitud de los registros contables.',
                lessons: [
                    { id: 'cf-l2-u3-l1', title: 'Propósito del Balance de Comprobación de Sumas y Saldos', objective: 'Verificar la igualdad matemática de los registros.' },
                    { id: 'cf-l2-u3-l2', title: 'Cómo preparar un Balance de Comprobación', objective: 'Pasos para listar las cuentas y sus saldos.' },
                    { id: 'cf-l2-u3-l3', title: 'Identificación y corrección de errores comunes', objective: 'Qué hacer cuando el balance no cuadra.' },
                    { id: 'cf-l2-u3-l4', title: 'Limitaciones del Balance de Comprobación', objective: 'Entender qué errores no detecta.' },
                    { id: 'cf-l2-u3-l5', title: 'Del Balance de Comprobación a los Estados Financieros', objective: 'El paso previo a la preparación de informes.' },
                ]
            },
            {
                id: 'cf-l2-u4',
                title: 'Unidad 4: Ingresos vs Egresos',
                objective: 'Distinguir entre el devengado y el efectivo.',
                lessons: [
                    { id: 'cf-l2-u4-l1', title: 'Principio del Devengado', objective: 'Reconocer ingresos y gastos cuando ocurren, no cuando se pagan.' },
                    { id: 'cf-l2-u4-l2', title: 'Reconocimiento de Ingresos', objective: 'Cuándo se debe registrar una venta.' },
                    { id: 'cf-l2-u4-l3', title: 'Reconocimiento de Gastos (Principio de Coincidencia)', objective: 'Asociar los gastos con los ingresos que generan.' },
                    { id: 'cf-l2-u4-l4', title: 'Diferencia entre Gasto, Costo y Pérdida', objective: 'Aclarar conceptos clave.' },
                    { id: 'cf-l2-u4-l5', title: 'Contabilidad de Caja vs. Contabilidad de Devengado', objective: 'Comparar ambos métodos y sus usos.' },
                ]
            },
            {
                id: 'cf-l2-u5',
                title: 'Unidad 5: Ajustes contables simples',
                objective: 'Aprender a realizar los ajustes necesarios antes de emitir informes.',
                lessons: [
                    { id: 'cf-l2-u5-l1', title: '¿Por qué son necesarios los asientos de ajuste?', objective: 'Asegurar que los saldos reflejen la realidad.' },
                    { id: 'cf-l2-u5-l2', title: 'Ajuste por gastos pagados por adelantado (ej. seguros)', objective: 'Reconocer el gasto del período.' },
                    { id: 'cf-l2-u5-l3', title: 'Ajuste por ingresos recibidos por adelantado', objective: 'Reconocer el ingreso ganado en el período.' },
                    { id: 'cf-l2-u5-l4', title: 'Ajuste por gastos acumulados (ej. sueldos por pagar)', objective: 'Registrar gastos ocurridos pero no pagados.' },
                    { id: 'cf-l2-u5-l5', title: 'Ajuste por ingresos acumulados (ej. intereses por cobrar)', objective: 'Registrar ingresos ganados pero no cobrados.' },
                ]
            },
        ]
    },
    {
      id: 'cf-l3',
      title: 'Nivel 3 – Contabilidad Intermedia y Análisis',
      description: 'Aprender a analizar los estados financieros para la toma de decisiones.',
      units: [
          {
              id: 'cf-l3-u1',
              title: 'Unidad 1: Estado de Resultados',
              objective: 'Profundizar en la estructura y análisis del estado de pérdidas y ganancias.',
              lessons: [
                  { id: 'cf-l3-u1-l1', title: 'Estructura detallada del Estado de Resultados', objective: 'Ventas, Costo de Ventas, Utilidad Bruta, Gastos Operativos.' },
                  { id: 'cf-l3-u1-l2', title: 'Cálculo del Costo de Ventas (CMV)', objective: 'Para empresas comerciales e industriales.' },
                  { id: 'cf-l3-u1-l3', title: 'Gastos de Administración y Ventas', objective: 'Clasificar correctamente los gastos operativos.' },
                  { id: 'cf-l3-u1-l4', title: 'Partidas no operacionales e impuestos', objective: 'Ingresos financieros, otros gastos e impuesto a la renta.' },
                  { id: 'cf-l3-u1-l5', title: 'Análisis vertical del Estado de Resultados', objective: 'Expresar cada partida como un % de las ventas.' },
              ]
          },
          {
              id: 'cf-l3-u2',
              title: 'Unidad 2: Balance General',
              objective: 'Comprender en detalle los componentes del balance y su análisis.',
              lessons: [
                  { id: 'cf-l3-u2-l1', title: 'Clasificación de Activos: Corrientes y No Corrientes', objective: 'Distinguir entre corto y largo plazo.' },
                  { id: 'cf-l3-u2-l2', title: 'Clasificación de Pasivos: Corrientes y No Corrientes', objective: 'Entender las obligaciones de corto y largo plazo.' },
                  { id: 'cf-l3-u2-l3', title: 'Componentes del Patrimonio', objective: 'Capital, utilidades retenidas y otras reservas.' },
                  { id: 'cf-l3-u2-l4', title: 'Análisis vertical del Balance General', objective: 'Expresar cada partida como un % del total de activos.' },
                  { id: 'cf-l3-u2-l5', title: 'Análisis horizontal (Análisis de tendencias)', objective: 'Comparar los balances de varios períodos.' },
              ]
          },
          {
              id: 'cf-l3-u3',
              title: 'Unidad 3: Flujo de Caja',
              objective: 'Aprender a construir y analizar el estado de flujo de efectivo.',
              lessons: [
                  { id: 'cf-l3-u3-l1', title: 'Importancia del Flujo de Caja: "Cash is King"', objective: 'Entender por qué la utilidad no es lo mismo que el efectivo.' },
                  { id: 'cf-l3-u3-l2', title: 'Actividades de Operación', objective: 'Efectivo generado por el negocio principal.' },
                  { id: 'cf-l3-u3-l3', title: 'Actividades de Inversión', objective: 'Efectivo usado en la compra/venta de activos a largo plazo.' },
                  { id: 'cf-l3-u3-l4', title: 'Actividades de Financiación', objective: 'Efectivo de préstamos, aportes de capital y dividendos.' },
                  { id: 'cf-l3-u3-l5', title: 'Método Directo vs. Indirecto (Introducción)', objective: 'Conocer las dos formas de presentar el flujo de caja operativo.' },
              ]
          },
          {
              id: 'cf-l3-u4',
              title: 'Unidad 4: Ratios financieros básicos',
              objective: 'Utilizar indicadores clave para evaluar la salud financiera de una empresa.',
              lessons: [
                  { id: 'cf-l3-u4-l1', title: 'Ratios de Liquidez (Razón Corriente, Prueba Ácida)', objective: 'Medir la capacidad de pago a corto plazo.' },
                  { id: 'cf-l3-u4-l2', title: 'Ratios de Endeudamiento (Deuda a Patrimonio, Deuda a Activo)', objective: 'Evaluar el nivel de deuda de la empresa.' },
                  { id: 'cf-l3-u4-l3', title: 'Ratios de Rentabilidad (ROA, ROE, Margen Neto)', objective: 'Medir la capacidad de generar utilidades.' },
                  { id: 'cf-l3-u4-l4', title: 'Ratios de Actividad (Rotación de Inventario, Período de Cobro)', objective: 'Evaluar la eficiencia en el uso de los activos.' },
                  { id: 'cf-l3-u4-l5', title: 'Análisis DuPont (Introducción)', objective: 'Descomponer el ROE para un análisis más profundo.' },
              ]
          },
          {
              id: 'cf-l3-u5',
              title: 'Unidad 5: Ejercicios prácticos de análisis',
              objective: 'Aplicar los conocimientos analizando estados financieros reales (simplificados).',
              lessons: [
                  { id: 'cf-l3-u5-l1', title: 'Caso 1: Analizando una empresa comercial', objective: 'Interpretar los estados financieros de una tienda.' },
                  { id: 'cf-l3-u5-l2', title: 'Caso 2: Analizando una empresa de servicios', objective: 'Ver las diferencias en la estructura de costos y activos.' },
                  { id: 'cf-l3-u5-l3', title: 'Caso 3: Comparando dos empresas del mismo sector', objective: 'Utilizar ratios para determinar cuál es más sólida.' },
                  { id: 'cf-l3-u5-l4', title: 'Caso 4: Identificando señales de alerta (Red Flags)', objective: 'Buscar inconsistencias o tendencias preocupantes.' },
                  { id: 'cf-l3-u5-l5', title: 'Elaboración de un informe de diagnóstico financiero básico', objective: 'Resumir los hallazgos en un reporte simple.' },
              ]
          },
      ]
    },
    {
      id: 'cf-l4',
      title: 'Nivel 4 – Contabilidad Avanzada y Gestión',
      description: 'Aplicar la contabilidad en la planificación, control y toma de decisiones gerenciales.',
      units: [
          {
              id: 'cf-l4-u1',
              title: 'Unidad 1: Contabilidad de Costos',
              objective: 'Entender cómo se acumulan y gestionan los costos en una empresa.',
              lessons: [
                  { id: 'cf-l4-u1-l1', title: 'Clasificación de costos: Fijos, Variables, Mixtos', objective: 'Comprender el comportamiento de los costos.' },
                  { id: 'cf-l4-u1-l2', title: 'Costos Directos e Indirectos', objective: 'Distinguir los costos fácilmente asignables a un producto.' },
                  { id: 'cf-l4-u1-l3', title: 'Costeo por Absorción vs. Costeo Variable', objective: 'Dos métodos para asignar costos de producción.' },
                  { id: 'cf-l4-u1-l4', title: 'Análisis Costo-Volumen-Utilidad (CVU)', objective: 'Relacionar costos, volumen de ventas y ganancias.' },
                  { id: 'cf-l4-u1-l5', title: 'Cálculo del Punto de Equilibrio', objective: 'Determinar cuánto se necesita vender para no perder dinero.' },
              ]
          },
          {
              id: 'cf-l4-u2',
              title: 'Unidad 2: Presupuestos',
              objective: 'Aprender a elaborar y utilizar presupuestos como herramienta de planificación y control.',
              lessons: [
                  { id: 'cf-l4-u2-l1', title: 'El propósito del presupuesto en una organización', objective: 'Planificar, coordinar y controlar.' },
                  { id: 'cf-l4-u2-l2', title: 'El Presupuesto Maestro y sus componentes', objective: 'Presupuesto de ventas, producción, gastos, etc.' },
                  { id: 'cf-l4-u2-l3', title: 'Presupuesto de Ventas: La piedra angular', objective: 'Técnicas de pronóstico de ventas.' },
                  { id: 'cf-l4-u2-l4', title: 'Presupuesto de Caja', objective: 'Planificar las entradas y salidas de efectivo.' },
                  { id: 'cf-l4-u2-l5', title: 'Análisis de desviaciones: Presupuesto vs. Real', objective: 'Controlar y entender las diferencias.' },
              ]
          },
          {
              id: 'cf-l4-u3',
              title: 'Unidad 3: Contabilidad de Gestión',
              objective: 'Utilizar la información contable para la toma de decisiones internas.',
              lessons: [
                  { id: 'cf-l4-u3-l1', title: 'Costos relevantes para la toma de decisiones', objective: 'Identificar qué costos importan en cada decisión.' },
                  { id: 'cf-l4-u3-l2', title: 'Decisión de "hacer o comprar" (Make or Buy)', objective: 'Analizar si conviene producir internamente o externalizar.' },
                  { id: 'cf-l4-u3-l3', title: 'Decisión de aceptar un pedido especial', objective: 'Evaluar si una venta a precio especial es rentable.' },
                  { id: 'cf-l4-u3-l4', title: 'Decisión de eliminar una línea de productos', objective: 'Analizar el impacto en la utilidad total.' },
                  { id: 'cf-l4-u3-l5', title: 'Fijación de precios basada en costos', objective: 'Métodos para establecer precios de venta.' },
              ]
          },
          {
              id: 'cf-l4-u4',
              title: 'Unidad 4: Tributación básica en Chile',
              objective: 'Comprender los impuestos más importantes que afectan a las empresas en Chile.',
              lessons: [
                  { id: 'cf-l4-u4-l1', title: 'Impuesto al Valor Agregado (IVA): Débito y Crédito Fiscal', objective: 'Entender el funcionamiento del IVA.' },
                  { id: 'cf-l4-u4-l2', title: 'Declaración y pago del IVA (Formulario 29)', objective: 'Conocer el proceso mensual.' },
                  { id: 'cf-l4-u4-l3', title: 'Impuesto a la Renta de Primera Categoría', objective: 'El impuesto sobre las utilidades de las empresas.' },
                  { id: 'cf-l4-u4-l4', title: 'Regímenes tributarios para Pymes en Chile', objective: 'Introducción al Pro Pyme General y Transparente.' },
                  { id: 'cf-l4-u4-l5', title: 'Conceptos básicos de boletas de honorarios', objective: 'Entender la retención de impuestos.' },
              ]
          },
          {
              id: 'cf-l4-u5',
              title: 'Unidad 5: Estados Financieros Consolidados (Introducción)',
              objective: 'Entender cómo se combinan los informes de empresas relacionadas.',
              lessons: [
                  { id: 'cf-l4-u5-l1', title: '¿Cuándo es necesario consolidar?', objective: 'Concepto de control, matriz y subsidiaria.' },
                  { id: 'cf-l4-u5-l2', title: 'El proceso de consolidación básico', objective: 'Suma de balances y eliminaciones.' },
                  { id: 'cf-l4-u5-l3', title: 'Eliminación de la inversión en la subsidiaria', objective: 'El ajuste clave en la consolidación.' },
                  { id: 'cf-l4-u5-l4', title: 'Eliminación de transacciones intercompañía', objective: 'Evitar la duplicidad de ingresos y gastos.' },
                  { id: 'cf-l4-u5-l5', title: 'Interés minoritario (Participación no controladora)', objective: 'Reconocer la parte de la subsidiaria que no pertenece a la matriz.' },
              ]
          },
      ]
    },
    {
      id: 'cf-l5',
      title: 'Nivel 5 – Aplicaciones Profesionales',
      description: 'Utilizar la contabilidad en casos de negocio reales y específicos.',
      units: [
          {
              id: 'cf-l5-u1',
              title: 'Unidad 1: Contabilidad para Pymes y Emprendedores',
              objective: 'Aplicar los principios contables a la realidad de un pequeño negocio.',
              lessons: [
                  { id: 'cf-l5-u1-l1', title: 'Errores contables comunes en emprendimientos', objective: 'Mezclar finanzas personales, no registrar todo, etc.' },
                  { id: 'cf-l5-u1-l2', title: 'Flujo de caja: La herramienta vital para la Pyme', objective: 'Proyectar y controlar el efectivo.' },
                  { id: 'cf-l5-u1-l3', title: 'Cómo leer los informes del SII en Chile', objective: 'Entender la información de tu carpeta tributaria.' },
                  { id: 'cf-l5-u1-l4', title: 'Opciones de financiamiento para Pymes', objective: 'Deuda, capital y sus implicancias contables.' },
                  { id: 'cf-l5-u1-l5', title: 'Cuándo contratar a un contador externo', objective: 'Evaluar el momento adecuado para delegar.' },
              ]
          },
          {
              id: 'cf-l5-u2',
              title: 'Unidad 2: Contabilidad en Comercio Internacional',
              objective: 'Comprender los aspectos contables básicos de la importación y exportación.',
              lessons: [
                  { id: 'cf-l5-u2-l1', title: 'Reconocimiento de ingresos en exportaciones', objective: 'Aplicación de Incoterms.' },
                  { id: 'cf-l5-u2-l2', title: 'Costo de una importación', objective: 'Valor FOB, seguros, fletes y aranceles.' },
                  { id: 'cf-l5-u2-l3', title: 'Manejo de divisas (Tipo de cambio)', objective: 'Contabilizar transacciones en moneda extranjera.' },
                  { id: 'cf-l5-u2-l4', title: 'Diferencias de cambio', objective: 'Ganancias y pérdidas por variación del tipo de cambio.' },
                  { id: 'cf-l5-u2-l5', title: 'Instrumentos de pago internacional (Carta de crédito)', objective: 'Entender las garantías en el comercio exterior.' },
              ]
          },
          {
              id: 'cf-l5-u3',
              title: 'Unidad 3: Normas IFRS en Chile',
              objective: 'Conocer el marco normativo contable internacional aplicado en Chile.',
              lessons: [
                  { id: 'cf-l5-u3-l1', title: '¿Qué son las IFRS y por qué son importantes?', objective: 'El estándar global para la información financiera.' },
                  { id: 'cf-l5-u3-l2', title: 'IFRS para Pymes vs. IFRS Full', objective: 'Diferencias y ámbito de aplicación en Chile.' },
                  { id: 'cf-l5-u3-l3', title: 'Principio de valor razonable (Fair Value)', objective: 'Un cambio clave respecto a la contabilidad histórica.' },
                  { id: 'cf-l5-u3-l4', title: 'IFRS 15: Reconocimiento de Ingresos', objective: 'El modelo de 5 pasos.' },
                  { id: 'cf-l5-u3-l5', title: 'IFRS 16: Arrendamientos', objective: 'Cómo los arriendos se registran en el balance.' },
              ]
          },
          {
              id: 'cf-l5-u4',
              title: 'Unidad 4: Auditoría básica',
              objective: 'Entender los principios y el proceso de una auditoría de estados financieros.',
              lessons: [
                  { id: 'cf-l5-u4-l1', title: 'Propósito de la auditoría: dar confianza', objective: 'El rol del auditor independiente.' },
                  { id: 'cf-l5-u4-l2', title: 'Tipos de opinión del auditor', objective: 'Limpia, con salvedades, adversa y abstención.' },
                  { id: 'cf-l5-u4-l3', title: 'El concepto de riesgo de auditoría', objective: 'Riesgo inherente, de control y de detección.' },
                  { id: 'cf-l5-u4-l4', title: 'Procedimientos de auditoría: Pruebas de control y sustantivas', objective: 'Cómo el auditor obtiene evidencia.' },
                  { id: 'cf-l5-u4-l5', title: 'Diferencia entre auditoría interna y externa', objective: 'Roles y objetivos distintos.' },
              ]
          },
          {
              id: 'cf-l5-u5',
              title: 'Unidad 5: Proyecto final: análisis completo de una empresa ficticia',
              objective: 'Integrar todos los conocimientos para evaluar una empresa de forma profesional.',
              lessons: [
                  { id: 'cf-l5-u5-l1', title: 'Paso 1: Comprensión del negocio y la industria', objective: 'Analizar el contexto de la empresa.' },
                  { id: 'cf-l5-u5-l2', title: 'Paso 2: Análisis de estados financieros y ratios', objective: 'Realizar un diagnóstico financiero completo.' },
                  { id: 'cf-l5-u5-l3', title: 'Paso 3: Evaluación de la gestión de costos y presupuestos', objective: 'Analizar la eficiencia operativa.' },
                  { id: 'cf-l5-u5-l4', title: 'Paso 4: Identificación de riesgos y oportunidades', objective: 'Evaluar el futuro de la empresa.' },
                  { id: 'cf-l5-u5-l5', title: 'Paso 5: Elaboración de un informe final con recomendaciones', objective: 'Presentar conclusiones y sugerencias gerenciales.' },
              ]
          },
      ]
    },
  ],
};

export const englishCurriculum: Curriculum = {
  subjectId: 'ingles-practico',
  levels: [
    {
      id: 'a1',
      title: 'A1 – Básico',
      description: 'Construye tu base en inglés para comunicarte en situaciones cotidianas simples.',
      units: [
        {
          id: 'a1-u1',
          title: 'Unidad 1: Saludos y Presentaciones',
          objective: 'Desenvolverse en encuentros sociales simples.',
          lessons: [
            { id: 'a1-u1-l1', title: 'El verbo To Be (am, is, are)', objective: 'Aprender a usar am, is, are.' },
            { id: 'a1-u1-l2', title: 'Pronombres personales (I, you, he, she, etc.)', objective: 'Usar pronombres básicos.' },
            { id: 'a1-u1-l3', title: 'El alfabeto y deletrear nombres', objective: 'Poder deletrear información básica.' },
            { id: 'a1-u1-l4', title: 'Los números 1–20', objective: 'Contar y usar números.' },
            { id: 'a1-u1-l5', title: 'Preguntas básicas: What’s your name? How are you?', objective: 'Hacer preguntas de información personal.' },
          ]
        },
        {
          id: 'a1-u2',
          title: 'Unidad 2: Mi Mundo Personal',
          objective: 'Describir entorno cercano y relaciones.',
          lessons: [
            { id: 'a1-u2-l1', title: 'Mi familia y amigos (vocabulario de parentesco)', objective: 'Nombrar a los miembros de la familia.' },
            { id: 'a1-u2-l2', title: 'Objetos cotidianos (casa y oficina)', objective: 'Nombrar objetos comunes.' },
            { id: 'a1-u2-l3', title: 'Colores y descripciones básicas', objective: 'Usar colores y adjetivos simples.' },
            { id: 'a1-u2-l4', title: 'Adjetivos comunes: tall, short, big, small', objective: 'Describir personas y objetos.' },
            { id: 'a1-u2-l5', title: 'Expresiones simples para gustos: I like / I don’t like', objective: 'Expresar preferencias básicas.' },
          ]
        },
        {
          id: 'a1-u3',
          title: 'Unidad 3: Rutinas y Hábitos',
          objective: 'Hablar sobre lo que haces día a día.',
          lessons: [
            { id: 'a1-u3-l1', title: 'Presente simple: I work, you study', objective: 'Hablar de rutinas y hábitos.' },
            { id: 'a1-u3-l2', title: 'Adverbios de frecuencia: always, usually, sometimes', objective: 'Indicar la frecuencia de las acciones.' },
            { id: 'a1-u3-l3', title: 'Rutina diaria: wake up, go to school, eat breakfast', objective: 'Describir tu día.' },
            { id: 'a1-u3-l4', title: 'Preguntas en presente simple (Do you…?)', objective: 'Hacer preguntas sobre rutinas.' },
            { id: 'a1-u3-l5', title: 'Hacer y responder invitaciones simples: Let’s go / Do you want to…?', objective: 'Socializar y hacer planes.' },
          ]
        },
        {
          id: 'a1-u4',
          title: 'Unidad 4: Mi Entorno y la Ciudad',
          objective: 'Moverse en contextos cotidianos fuera de casa.',
          lessons: [
            { id: 'a1-u4-l1', title: 'Lugares de la ciudad (school, park, supermarket)', objective: 'Nombrar lugares comunes.' },
            { id: 'a1-u4-l2', title: 'Medios de transporte (bus, car, train, bike)', objective: 'Hablar sobre cómo te mueves.' },
            { id: 'a1-u4-l3', title: 'Preguntar y dar direcciones: Where is…? Go straight, turn left', objective: 'Pedir y dar indicaciones.' },
            { id: 'a1-u4-l4', title: 'Expresiones de ubicación: in, on, under, next to', objective: 'Describir dónde están las cosas.' },
            { id: 'a1-u4-l5', title: 'Compras: pedir precios y cantidades (How much is this?)', objective: 'Desenvolverse en una tienda.' },
          ]
        },
        {
          id: 'a1-u5',
          title: 'Unidad 5: Comida y Tiempo Libre',
          objective: 'Pedir comida, hablar de hobbies y expresar preferencias.',
          lessons: [
            { id: 'a1-u5-l1', title: 'Comidas y bebidas básicas', objective: 'Nombrar alimentos y bebidas.' },
            { id: 'a1-u5-l2', title: 'Pedir en un restaurante: I’d like… / Can I have…?', objective: 'Ordenar comida de forma educada.' },
            { id: 'a1-u5-l3', title: 'Días de la semana y meses', objective: 'Hablar sobre fechas.' },
            { id: 'a1-u5-l4', title: 'Hobbies comunes: play soccer, read books, watch TV', objective: 'Hablar sobre tus pasatiempos.' },
            { id: 'a1-u5-l5', title: 'Hablar de clima y estaciones: sunny, rainy, cold, hot', objective: 'Describir el tiempo.' },
          ]
        },
      ]
    },
    {
      id: 'a2',
      title: 'A2 – Intermedio Bajo',
      description: 'Mejora tu capacidad para comunicarte en tareas simples y directas.',
      units: [
        {
          id: 'a2-u1',
          title: 'Unidad 1: Rutinas y Hábitos Avanzados',
          objective: 'Diferenciar acciones habituales de acciones en curso.',
          lessons: [
            { id: 'a2-u1-l1', title: 'Presente simple vs presente continuo (I work / I am working)', objective: 'Distinguir entre rutinas y acciones del momento.' },
            { id: 'a2-u1-l2', title: 'Verbos de estado (like, love, want, need)', objective: 'Usar verbos que no suelen ir en continuo.' },
            { id: 'a2-u1-l3', title: 'Expresiones de frecuencia más avanzadas (once a week, every two days)', objective: 'Ser más preciso con la frecuencia.' },
            { id: 'a2-u1-l4', title: 'Conversaciones sobre hobbies y rutinas', objective: 'Hablar con más detalle de tus actividades.' },
            { id: 'a2-u1-l5', title: 'Contrastes: I usually read, but today I am watching TV', objective: 'Contrastar lo habitual con lo actual.' },
          ]
        },
        {
          id: 'a2-u2',
          title: 'Unidad 2: El Pasado Simple',
          objective: 'Narrar eventos pasados con verbos regulares e irregulares.',
          lessons: [
            { id: 'a2-u2-l1', title: 'Verbos regulares en pasado (-ed)', objective: 'Formar el pasado de verbos regulares.' },
            { id: 'a2-u2-l2', title: 'Verbos irregulares más comunes (go → went, have → had)', objective: 'Memorizar y usar verbos irregulares clave.' },
            { id: 'a2-u2-l3', title: 'Preguntas en pasado simple (Did you…?)', objective: 'Hacer preguntas sobre el pasado.' },
            { id: 'a2-u2-l4', title: 'Expresiones de tiempo: yesterday, last week, ago', objective: 'Ubicar eventos en el pasado.' },
            { id: 'a2-u2-l5', title: 'Narrar una experiencia corta (I went to the park yesterday)', objective: 'Contar una historia simple.' },
          ]
        },
        {
          id: 'a2-u3',
          title: 'Unidad 3: Experiencias y el Present Perfect',
          objective: 'Hablar de experiencias de vida.',
          lessons: [
            { id: 'a2-u3-l1', title: 'Introducción al Present Perfect (have/has + participio)', objective: 'Hablar de experiencias sin especificar cuándo.' },
            { id: 'a2-u3-l2', title: 'Ever/Never: Have you ever…?', objective: 'Preguntar sobre experiencias de vida.' },
            { id: 'a2-u3-l3', title: 'Already/Yet en preguntas y respuestas', objective: 'Hablar de acciones recientes.' },
            { id: 'a2-u3-l4', title: 'Contraste Past Simple vs Present Perfect', objective: 'Diferenciar cuándo usar cada tiempo verbal.' },
            { id: 'a2-u3-l5', title: 'Compartir experiencias personales (I have traveled to…)', objective: 'Contar cosas que has hecho en tu vida.' },
          ]
        },
        {
          id: 'a2-u4',
          title: 'Unidad 4: Descripciones y Comparaciones',
          objective: 'Enriquecer vocabulario para describir personas, lugares y cosas.',
          lessons: [
            { id: 'a2-u4-l1', title: 'Adjetivos de apariencia y personalidad', objective: 'Describir a la gente con más detalle.' },
            { id: 'a2-u4-l2', title: 'Comparativos: bigger, smaller, more interesting', objective: 'Comparar dos cosas o personas.' },
            { id: 'a2-u4-l3', title: 'Superlativos: the best, the most expensive', objective: 'Destacar una cosa sobre un grupo.' },
            { id: 'a2-u4-l4', title: 'Describir una ciudad o lugar turístico', objective: 'Hablar sobre lugares de interés.' },
            { id: 'a2-u4-l5', title: 'Hablar de diferencias y similitudes', objective: 'Comparar y contrastar.' },
          ]
        },
        {
          id: 'a2-u5',
          title: 'Unidad 5: Planes y Futuro',
          objective: 'Expresar planes inmediatos y predicciones.',
          lessons: [
            { id: 'a2-u5-l1', title: 'Be going to (I am going to study tonight)', objective: 'Hablar de planes e intenciones.' },
            { id: 'a2-u5-l2', title: 'Will para predicciones (It will rain tomorrow)', objective: 'Hacer predicciones sobre el futuro.' },
            { id: 'a2-u5-l3', title: 'Expresiones de futuro: next week, in two days', objective: 'Ubicar eventos en el futuro.' },
            { id: 'a2-u5-l4', title: 'Hacer y aceptar planes (Let’s meet / Sounds good)', objective: 'Organizar planes con otros.' },
            { id: 'a2-u5-l5', title: 'Hablar de metas personales y sueños simples', objective: 'Expresar tus ambiciones.' },
          ]
        },
      ]
    },
    {
      id: 'b1',
      title: 'B1 – Intermedio',
      description: 'Interactúa con más confianza y maneja una variedad de temas.',
      units: [
        {
          id: 'b1-u1',
          title: 'Unidad 1: Historias en Pasado',
          objective: 'Relatar eventos y situaciones usando distintos tiempos pasados.',
          lessons: [
            { id: 'b1-u1-l1', title: 'Past Continuous (I was studying when…)', objective: 'Describir acciones en progreso en el pasado.' },
            { id: 'b1-u1-l2', title: 'Past Perfect (I had finished before…)', objective: 'Hablar de una acción pasada anterior a otra.' },
            { id: 'b1-u1-l3', title: 'Past Perfect Continuous (I had been working for two hours)', objective: 'Expresar la duración de una acción pasada.' },
            { id: 'b1-u1-l4', title: 'Narrar una anécdota personal', objective: 'Contar una historia personal con detalle.' },
            { id: 'b1-u1-l5', title: 'Historias combinando tiempos pasados', objective: 'Usar diferentes tiempos verbales en una narración.' },
          ]
        },
        {
          id: 'b1-u2',
          title: 'Unidad 2: Habilidades, Reglas y Consejos',
          objective: 'Usar modal verbs para distintos propósitos.',
          lessons: [
            { id: 'b1-u2-l1', title: 'Can / Could (habilidades y posibilidades)', objective: 'Hablar de lo que puedes o podías hacer.' },
            { id: 'b1-u2-l2', title: 'Should / Ought to (dar consejos)', objective: 'Dar y pedir recomendaciones.' },
            { id: 'b1-u2-l3', title: 'Must / Have to (obligaciones)', objective: 'Expresar necesidad y obligación.' },
            { id: 'b1-u2-l4', title: 'May / Might (posibilidades futuras)', objective: 'Hablar de probabilidades.' },
            { id: 'b1-u2-l5', title: 'Expresiones prácticas con modales en la vida diaria', objective: 'Usar verbos modales en situaciones reales.' },
          ]
        },
        {
          id: 'b1-u3',
          title: 'Unidad 3: Vida Cotidiana y Viajes',
          objective: 'Desenvolverse en contextos de viaje y situaciones prácticas.',
          lessons: [
            { id: 'b1-u3-l1', title: 'En el aeropuerto (check-in, boarding, baggage)', objective: 'Manejar el vocabulario de un aeropuerto.' },
            { id: 'b1-u3-l2', title: 'En el hotel (reservas, quejas, servicios)', objective: 'Comunicarse en un hotel.' },
            { id: 'b1-u3-l3', title: 'Emergencias: pedir ayuda, explicar un problema', objective: 'Saber qué decir en una emergencia.' },
            { id: 'b1-u3-l4', title: 'Vocabulario de transporte público y direcciones', objective: 'Moverse por una ciudad.' },
            { id: 'b1-u3-l5', title: 'Role play: planear un viaje completo', objective: 'Simular la planificación de un viaje.' },
          ]
        },
        {
          id: 'b1-u4',
          title: 'Unidad 4: Opiniones y Conversaciones Sociales',
          objective: 'Expresar ideas y participar en discusiones simples.',
          lessons: [
            { id: 'b1-u4-l1', title: 'Frases para dar opiniones (I think, In my view)', objective: 'Expresar tu punto de vista.' },
            { id: 'b1-u4-l2', title: 'Cómo estar de acuerdo y en desacuerdo', objective: 'Participar en conversaciones.' },
            { id: 'b1-u4-l3', title: 'Conversaciones informales (small talk)', objective: 'Iniciar y mantener conversaciones casuales.' },
            { id: 'b1-u4-l4', title: 'Cómo expresar sentimientos y emociones', objective: 'Hablar de cómo te sientes.' },
            { id: 'b1-u4-l5', title: 'Debates simples sobre temas cotidianos', objective: 'Discutir temas sencillos.' },
          ]
        },
        {
          id: 'b1-u5',
          title: 'Unidad 5: Redacción y Comunicación Formal',
          objective: 'Escribir textos estructurados y manejar registros.',
          lessons: [
            { id: 'b1-u5-l1', title: 'Cómo escribir un correo formal', objective: 'Aprender la estructura y el lenguaje de emails formales.' },
            { id: 'b1-u5-l2', title: 'Diferencia entre registro formal e informal', objective: 'Saber cuándo usar cada estilo.' },
            { id: 'b1-u5-l3', title: 'Conectores básicos para textos (first, then, finally)', objective: 'Organizar tus ideas por escrito.' },
            { id: 'b1-u5-l4', title: 'Redacción de párrafos descriptivos', objective: 'Describir personas, lugares o cosas.' },
            { id: 'b1-u5-l5', title: 'Escribir una carta o email de solicitud', objective: 'Redactar solicitudes formales.' },
          ]
        },
      ]
    },
    {
      id: 'b2',
      title: 'B2 – Intermedio Alto',
      description: 'Comunícate con un grado de fluidez y espontaneidad.',
      units: [
        {
          id: 'b2-u1',
          title: 'Unidad 1: Narración y Conectores Avanzados',
          objective: 'Construir discursos y textos más complejos.',
          lessons: [
            { id: 'b2-u1-l1', title: 'Past Perfect Simple y Continuous (I had finished / I had been studying)', objective: 'Dominar los tiempos pasados complejos.' },
            { id: 'b2-u1-l2', title: 'Conectores de contraste: although, however, despite', objective: 'Unir ideas opuestas.' },
            { id: 'b2-u1-l3', title: 'Conectores de causa y consecuencia: therefore, due to, as a result', objective: 'Explicar razones y resultados.' },
            { id: 'b2-u1-l4', title: 'Redacción de párrafos narrativos', objective: 'Escribir historias más elaboradas.' },
            { id: 'b2-u1-l5', title: 'Contar una historia con inicio, desarrollo y conclusión', objective: 'Estructurar una narración completa.' },
          ]
        },
        {
          id: 'b2-u2',
          title: 'Unidad 2: Inglés Académico y Profesional',
          objective: 'Manejar vocabulario y estructuras para el estudio y el trabajo.',
          lessons: [
            { id: 'b2-u2-l1', title: 'Vocabulario académico: analyze, compare, evaluate', objective: 'Usar lenguaje para el análisis crítico.' },
            { id: 'b2-u2-l2', title: 'Cómo escribir un ensayo breve', objective: 'Estructurar un ensayo argumentativo.' },
            { id: 'b2-u2-l3', title: 'Cómo resumir un texto', objective: 'Extraer y presentar las ideas principales.' },
            { id: 'b2-u2-l4', title: 'Presentaciones orales en inglés (estructura básica)', objective: 'Organizar y dar una presentación.' },
            { id: 'b2-u2-l5', title: 'Expresiones para reportes (According to… / The data shows…)', objective: 'Presentar información y datos.' },
          ]
        },
        {
          id: 'b2-u3',
          title: 'Unidad 3: Opiniones, Debates y Persuasión',
          objective: 'Argumentar y defender puntos de vista.',
          lessons: [
            { id: 'b2-u3-l1', title: 'Expresar opiniones con matices (In my opinion, I strongly believe…)', objective: 'Ser más preciso al dar tu opinión.' },
            { id: 'b2-u3-l2', title: 'Expresiones para debatir (I agree, I see your point, I disagree)', objective: 'Participar activamente en debates.' },
            { id: 'b2-u3-l3', title: 'Lenguaje para persuadir (It’s essential to…, We should consider…)', objective: 'Convencer a otros.' },
            { id: 'b2-u3-l4', title: 'Cómo comparar pros y contras', objective: 'Analizar las ventajas y desventajas.' },
            { id: 'b2-u3-l5', title: 'Debate guiado sobre un tema actual', objective: 'Practicar el debate en un contexto real.' },
          ]
        },
        {
          id: 'b2-u4',
          title: 'Unidad 4: Trabajo y Negocios',
          objective: 'Desenvolverse en situaciones laborales complejas.',
          lessons: [
            { id: 'b2-u4-l1', title: 'Inglés en reuniones (hacer sugerencias, tomar decisiones)', objective: 'Participar eficazmente en reuniones.' },
            { id: 'b2-u4-l2', title: 'Negociaciones y acuerdos (I propose, Let’s compromise)', objective: 'Negociar en inglés.' },
            { id: 'b2-u4-l3', title: 'Redacción de correos profesionales avanzados', objective: 'Escribir emails de trabajo complejos.' },
            { id: 'b2-u4-l4', title: 'Vocabulario de proyectos, deadlines, targets', objective: 'Manejar el lenguaje de la gestión de proyectos.' },
            { id: 'b2-u4-l5', title: 'Role play: entrevista de trabajo avanzada', objective: 'Simular una entrevista de trabajo.' },
          ]
        },
        {
          id: 'b2-u5',
          title: 'Unidad 5: Cultura y Medios',
          objective: 'Entender y analizar contenido cultural y mediático.',
          lessons: [
            { id: 'b2-u5-l1', title: 'Vocabulario de cine, series y música', objective: 'Hablar de tus gustos culturales.' },
            { id: 'b2-u5-l2', title: 'Comprensión de artículos de noticias', objective: 'Leer y entender noticias en inglés.' },
            { id: 'b2-u5-l3', title: 'Expresiones idiomáticas comunes en medios', objective: 'Entender el lenguaje figurado.' },
            { id: 'b2-u5-l4', title: 'Cómo dar una opinión sobre una película o libro', objective: 'Hacer críticas y reseñas.' },
            { id: 'b2-u5-l5', title: 'Discusión sobre un tema cultural global', objective: 'Debatir sobre temas culturales.' },
          ]
        },
      ]
    },
    {
      id: 'c1',
      title: 'C1 – Avanzado',
      description: 'Utiliza el lenguaje de forma flexible y eficaz para fines sociales, académicos y profesionales.',
      units: [
        {
          id: 'c1-u1',
          title: 'Unidad 1: Fluidez y Precisión',
          objective: 'Hablar y escribir con naturalidad y sin errores básicos.',
          lessons: [
            { id: 'c1-u1-l1', title: 'Uso avanzado de tiempos verbales (matices de futuro y condicionales mixtos)', objective: 'Dominar las estructuras gramaticales complejas.' },
            { id: 'c1-u1-l2', title: 'Estructuras complejas con inversions (Never have I seen…)', objective: 'Usar estructuras avanzadas para dar énfasis.' },
            { id: 'c1-u1-l3', title: 'Matices con voz pasiva avanzada', objective: 'Usar la voz pasiva en diferentes contextos.' },
            { id: 'c1-u1-l4', title: 'Uso correcto de collocations (make a decision, take responsibility)', objective: 'Sonar más natural usando combinaciones de palabras comunes.' },
            { id: 'c1-u1-l5', title: 'Ejercicios de fluidez: debates improvisados', objective: 'Practicar la espontaneidad.' },
          ]
        },
        {
          id: 'c1-u2',
          title: 'Unidad 2: Expresiones Idiomáticas y Phrasal Verbs Complejos',
          objective: 'Comprender y usar lenguaje natural de hablantes nativos.',
          lessons: [
            { id: 'c1-u2-l1', title: 'Idioms comunes en negocios (the bottom line, think outside the box)', objective: 'Entender y usar expresiones del mundo laboral.' },
            { id: 'c1-u2-l2', title: 'Idioms de la vida cotidiana (hit the sack, break the ice)', objective: 'Usar expresiones informales correctamente.' },
            { id: 'c1-u2-l3', title: 'Phrasal verbs con múltiples significados (get over, put up with)', objective: 'Dominar los phrasal verbs más complejos.' },
            { id: 'c1-u2-l4', title: 'Cómo integrar idioms y phrasals en discurso formal', objective: 'Saber cuándo es apropiado usar lenguaje idiomático.' },
            { id: 'c1-u2-l5', title: 'Práctica con series, películas y artículos auténticos', objective: 'Aprender de material real.' },
          ]
        },
        {
          id: 'c1-u3',
          title: 'Unidad 3: Inglés Académico y Profesional Avanzado',
          objective: 'Desenvolverse en entornos exigentes.',
          lessons: [
            { id: 'c1-u3-l1', title: 'Redacción de ensayos y papers con conectores académicos avanzados', objective: 'Escribir textos académicos de alta calidad.' },
            { id: 'c1-u3-l2', title: 'Presentaciones profesionales con vocabulario especializado', objective: 'Realizar presentaciones efectivas en tu campo.' },
            { id: 'c1-u3-l3', title: 'Cómo interpretar y explicar datos y gráficos', objective: 'Presentar datos de manera clara y profesional.' },
            { id: 'c1-u3-l4', title: 'Lenguaje de liderazgo y negociación en inglés', objective: 'Liderar equipos y negociar en inglés.' },
            { id: 'c1-u3-l5', title: 'Simulación: exposición tipo universidad o negocio', objective: 'Practicar una presentación formal.' },
          ]
        },
        {
          id: 'c1-u4',
          title: 'Unidad 4: Cultura, Medios y Opinión Crítica',
          objective: 'Comprender y analizar textos largos y complejos.',
          lessons: [
            { id: 'c1-u4-l1', title: 'Lectura crítica de artículos periodísticos y académicos', objective: 'Analizar y evaluar textos complejos.' },
            { id: 'c1-u4-l2', title: 'Lenguaje en medios globales (BBC, NY Times, The Economist)', objective: 'Entender el inglés de los medios de comunicación internacionales.' },
            { id: 'c1-u4-l3', title: 'Cómo expresar acuerdo/desacuerdo con matices', objective: 'Argumentar de forma sofisticada.' },
            { id: 'c1-u4-l4', title: 'Discusiones sobre cultura, política y sociedad', objective: 'Debatir sobre temas complejos y abstractos.' },
            { id: 'c1-u4-l5', title: 'Debate formal con argumentos estructurados', objective: 'Participar en debates formales.' },
          ]
        },
        {
          id: 'c1-u5',
          title: 'Unidad 5: Preparación para Exámenes Internacionales (IELTS/CAE)',
          objective: 'Preparar al alumno para certificaciones de nivel avanzado.',
          lessons: [
            { id: 'c1-u5-l1', title: 'Técnicas de comprensión auditiva avanzada', objective: 'Mejorar tu habilidad para entender audios complejos.' },
            { id: 'c1-u5-l2', title: 'Estrategias de lectura rápida y crítica', objective: 'Leer y comprender textos largos eficientemente.' },
            { id: 'c1-u5-l3', title: 'Redacción de ensayos bajo tiempo límite', objective: 'Practicar la escritura para exámenes.' },
            { id: 'c1-u5-l4', title: 'Speaking test: simulación de entrevistas', objective: 'Practicar para la parte oral de los exámenes.' },
            { id: 'c1-u5-l5', title: 'Tips finales para aprobar con nivel C1', objective: 'Recibir consejos clave para el día del examen.' },
          ]
        },
      ]
    }
  ],
};


export const lessons: Lesson[] = [
  { id: 'm1', subjectId: 'matematicas', title: 'Suma y Resta de Fracciones', objective: 'Aprender a sumar y restar fracciones con igual y distinto denominador.', estimatedMinutes: 20, type: 'lesson' },
  { id: 'm2', subjectId: 'matematicas', title: 'Multiplicación de Decimales', objective: 'Dominar la multiplicación de números decimales.', estimatedMinutes: 15, type: 'lesson' },
  { id: 'l1', subjectId: 'lenguaje', title: 'Identificar Sujeto y Predicado', objective: 'Aprender a diferenciar el sujeto y el predicado en una oración.', estimatedMinutes: 15, type: 'lesson' },
  { id: 'c1', subjectId: 'ciencias', title: 'El Ciclo del Agua', objective: 'Comprender las fases del ciclo del agua.', estimatedMinutes: 20, type: 'lesson' },
  { id: 'h1', subjectId: 'historia', title: 'Las Civilizaciones Antiguas', objective: 'Conocer las principales características de Mesopotamia y Egipto.', estimatedMinutes: 25, type: 'lesson' },
];

export const microClasses: MicroClass[] = [
  { id: 'mc1', title: 'Técnicas de estudio efectivas', category: 'Habilidades', duration: 15, progress: 50 },
  { id: 'mc2', title: 'Introducción a la programación', category: 'Tecnología', duration: 25, progress: 20 },
  { id: 'mc3', title: 'Oratoria para principiantes', category: 'Habilidades', duration: 20, progress: 75 },
];

export const reports: Report[] = [
  {
    id: 'rep1',
    userName: 'Sofía',
    avatarUrl: 'https://placehold.co/100x100/a855f7/FFFFFF/png',
    summary: 'Sofía ha mostrado un gran interés en Matemáticas esta semana, completando 3 lecciones. Sin embargo, su práctica en Lenguaje ha disminuido. Sería bueno equilibrar el tiempo dedicado a ambas materias.',
    recommendations: [
      'Establecer un horario de estudio de 20 minutos para Lenguaje, 3 veces por semana.',
      'Utilizar la función de "Ensayo de Práctica" en Lenguaje para reforzar lo aprendido.',
      'Felicitarla por su excelente trabajo en Matemáticas para mantenerla motivada.',
    ],
  },
  {
    id: 'rep2',
    userName: 'Mateo',
    avatarUrl: 'https://placehold.co/100x100/22c55e/FFFFFF/png',
    summary: 'Mateo ha utilizado la plataforma de manera consistente en todas las materias, con un buen balance entre lecciones y ensayos de práctica. Su promedio de notas en los ensayos es bueno.',
    recommendations: [
      'Mantener la rutina actual, ya que está dando buenos resultados.',
      'Explorar una nueva materia de su interés para ampliar sus conocimientos.',
      'Establecer una meta semanal de completar un ensayo en su materia más débil para mejorarla.',
    ],
  },
];

export const plans: Plan[] = [
  {
    name: "Plan Mensual",
    price: "$12.990",
    period: "/mes",
    features: [
      "Hasta 5 usuarios",
      "Acceso ilimitado a LIA",
      "Clases para adultos incluidas",
      "Reportes para padres",
      "Cancelar en cualquier momento",
    ],
  },
  {
    name: "Plan Anual",
    price: "$10.825",
    period: "/mes",
    discount: "2 meses gratis",
    equivalentPrice: "Paga $129.900 al año",
    features: [
        "Hasta 5 usuarios",
        "Acceso ilimitado a LIA",
        "Clases para adultos incluidas",
        "Reportes para padres",
    ],
    savings: "Ahorra 2 meses completos",
    isRecommended: true,
  },
  {
    name: "Plan Semestral",
    price: "$11.665",
    period: "/mes",
    discount: "10% OFF",
    equivalentPrice: "Paga $69.990 al semestre",
    features: [
        "Hasta 5 usuarios",
        "Acceso ilimitado a LIA",
        "Clases para adultos incluidas",
        "Reportes para padres",
    ],
    savings: "Ahorra 10%",
  },
];

export const recipesData: {
  breakfasts: Recipe[];
  lunches: Recipe[];
  dinners: Recipe[];
  snacks: Recipe[];
} = {
  breakfasts: [
    { title: "Avena Nocturna con Chía y Frutos Rojos", time: "5 min + reposo", calories: "~350 kcal", ingredients: ["Avena", "Semillas de chía", "Leche o yogur", "Frutos rojos"] },
    { title: "Tostadas de Palta con Huevo Pochado", time: "10 min", calories: "~400 kcal", ingredients: ["Pan integral", "Palta", "Huevo", "Limón"] },
    { title: "Panqueques de Plátano y Avena (2 ingredientes)", time: "15 min", calories: "~300 kcal", ingredients: ["Plátano maduro", "Huevos", "Avena (opcional)"] },
  ],
  lunches: [
    { title: "Wrap de Pollo a la Plancha y Vegetales", time: "20 min", calories: "~450 kcal", ingredients: ["Pechuga de pollo", "Tortilla integral", "Lechuga", "Tomate"] },
    { title: "Ensalada de Lentejas con Queso Feta", time: "15 min", calories: "~420 kcal", ingredients: ["Lentejas cocidas", "Queso feta", "Pepino", "Pimiento"] },
    { title: "Salmón al Horno con Espárragos", time: "25 min", calories: "~500 kcal", ingredients: ["Filete de salmón", "Espárragos", "Limón", "Aceite de oliva"] },
  ],
  dinners: [
    { title: "Sopa de Zapallo y Jengibre", time: "30 min", calories: "~250 kcal", ingredients: ["Zapallo", "Jengibre", "Cebolla", "Caldo de verduras"] },
    { title: "Pechuga de Pavo Rellena de Espinacas", time: "35 min", calories: "~400 kcal", ingredients: ["Pechuga de pavo", "Espinacas", "Queso ricotta", "Ajo"] },
    { title: "Fideos de Zucchini con Pesto de Palta", time: "15 min", calories: "~380 kcal", ingredients: ["Zucchini", "Palta", "Albahaca", "Nueces"] },
  ],
  snacks: [
    { title: "Mix de Frutos Secos Energético", time: "2 min", calories: "~200 kcal", ingredients: ["Almendras", "Nueces", "Pasas", "Semillas de maravilla"] },
    { title: "Bastones de Apio con Mantequilla de Maní", time: "5 min", calories: "~180 kcal", ingredients: ["Apio", "Mantequilla de maní natural"] },
    { title: "Yogur Griego con Miel y Frutas", time: "5 min", calories: "~220 kcal", ingredients: ["Yogur griego natural", "Miel", "Fruta de temporada"] },
  ],
};
