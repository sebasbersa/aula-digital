'use client';

import { AppLogo, FacebookIcon, InstagramIcon, TikTokIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { adultSubjects, plans, subjects as studentSubjects } from '@/lib/data';
import { Check, BrainCircuit, Users, FileEdit, CreditCard, GraduationCap, Users2, UserCheck, Library, LucideProps, Calculator, Book, FlaskConical, Globe, Languages, Atom, Leaf, Megaphone, Mic, CookingPot, Gamepad2, Zap, CalendarCheck, Lightbulb, CheckCircle, Martini } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Mapa de íconos (sin cambios)
const iconMap: { [key: string]: React.FC<LucideProps> } = {
  Calculator, Book, FlaskConical, Globe, Languages, BrainCircuit, Atom, Leaf, Megaphone, Mic, CookingPot, Martini,
};

// --- INICIO DE COMPONENTES CON ESTILOS DE MARCA ---

// Card para las características principales
function FeatureCard({ icon: Icon, title, description, iconClassName }: { icon: React.ElementType, title: string, description: string, iconClassName?: string }) {
  return (
    <Card className="text-center bg-white shadow-md transition-transform duration-300 transform hover:-translate-y-2 hover:shadow-xl">
      <CardHeader>
        <div className="mx-auto bg-[#d6d6fc] p-4 rounded-full w-fit">
          <Icon className={cn("w-8 h-8", iconClassName)} />
        </div>
        {/* Título: Tipografía Swiss721Ex BT Bold */}
        <CardTitle className="pt-2 text-black font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Párrafo: Tipografía Swiss 721 Light Extended BT */}
        <p className="text-[#a0a0a0] font-light">{description}</p>
      </CardContent>
    </Card>
  )
}

// Card para los pasos
function StepCard({ icon: Icon, title }: { icon: React.ElementType, title: string }) {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#5854fc]/20">
                <Icon className="h-8 w-8 text-[#3030d1]" />
            </div>
            {/* Título: Tipografía Swiss721Ex BT Bold */}
            <h3 className="text-lg font-bold text-black">{title}</h3>
        </div>
    );
}

// --- COMPONENTE PRINCIPAL DE LA LANDING PAGE ---

export default function LandingPage() {
  const sectionsRef = useRef<Array<HTMLElement | null>>([]);

  // Efecto de aparición al hacer scroll (sin cambios)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionsRef.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  return (
    // Fondo principal blanco
    <div className="bg-white text-black">
      {/* Header con colores de marca */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto flex items-center justify-between py-2 px-4 md:px-6">
            {/* --- Logo con tamaño responsivo para dar más espacio en móvil --- */}
            <Link href="/" className="w-48 sm:w-64 h-auto transition-all duration-300">
                <AppLogo />
            </Link>
            <div className="flex items-center gap-2 md:gap-6">
                 <nav className="hidden md:flex items-center gap-6 text-sm font-bold">
                    {/* Enlaces de navegación con color primario en hover */}
                    <Link href="/" className="text-black hover:text-[#3030d1] transition-colors">Inicio</Link>
                    <Link href="#ventajas" className="text-black hover:text-[#3030d1] transition-colors">Ventajas</Link>
                    <Link href="#precios" className="text-black hover:text-[#3030d1] transition-colors">Precios</Link>
                </nav>
                {/* --- Contenedor que apila los botones en móvil --- */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                    {/* --- Botones con ancho fijo y texto responsivo --- */}
                    <Button asChild className="bg-[#d6d6fc] text-[#3030d1] hover:bg-[#5854fc] hover:text-white transition-all duration-300 font-bold w-36 text-xs sm:text-sm">
                        <Link href="/login">Iniciar Sesión</Link>
                    </Button>
                    <Button asChild className="bg-[#ff405c] text-white hover:bg-[#d33152] transition-transform duration-300 transform hover:-translate-y-1 font-bold w-36 text-xs sm:text-sm">
                        <Link href="/signup">Regístrate Gratis</Link>
                    </Button>
                </div>
            </div>
        </div>
      </header>

      <main>
        {/* Sección Héroe */}
        <section ref={(el) => sectionsRef.current[0] = el} className="container mx-auto grid md:grid-cols-2 gap-12 items-center py-16 md:py-20 px-4 md:px-6">
          <div className="space-y-6 text-center md:text-left">
            {/* Título Principal (H1) optimizado para SEO */}
            <h1 className="text-4xl md:text-6xl font-bold text-black">
            El Profesor Particular Digital <span className="text-[#3030d1]">Para Toda tu Familia.</span>
            </h1>
            {/* Párrafo con tipografía light y texto optimizado */}
            <p className="text-lg text-black font-light">
            LIA, la Inteligencia Artificial educativa que acompaña a tu familia en cada etapa de aprendizaje.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto bg-[#ff405c] text-white hover:bg-[#d33152] transition-transform duration-300 transform hover:-translate-y-1 font-bold">
                <Link href="/signup">Comienza Ahora</Link>
              </Button>
              <Button asChild size="lg" variant="link" className="text-[#3030d1] hover:text-[#5854fc] font-bold">
                 <Link href="/login">Ya tengo una cuenta</Link>
              </Button>
            </div>
          </div>
          <div className="order-first md:order-last">
            <Image
              src="/hero-family.jpg"
              alt="Familia feliz estudiando con el profesor particular digital de Aula Digital Plus"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
              priority
            />
          </div>
        </section>
        
        {/* Sección Ventajas con fondo azul secundario */}
        <section id="ventajas" ref={(el) => sectionsRef.current[1] = el} className="bg-[#f0f7ff] py-16 md:py-20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center space-y-4 mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#3030d1]">Más que una IA, el Tutor Inteligente que Motiva a tus Hijos</h2>
                    <p className="text-lg text-black/70 max-w-3xl mx-auto font-light">
                        El apoyo escolar que necesitan para mejorar sus calificaciones, ganar hábitos de estudio y sentir entusiasmo por aprender cada día.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <FeatureCard 
                    icon={GraduationCap}
                    title="Profesor por Nivel Escolar"
                    description="Nuestra IA está entrenada por asignatura y año escolar (1° básico a 4° medio), adaptándose al currículum de cada estudiante."
                    iconClassName="text-[#3030d1]"
                  />
                   <FeatureCard 
                    icon={Gamepad2}
                    title="Gamificación que Engancha"
                    description="Puntos, rachas y recompensas que mantienen a los estudiantes motivados y ayudan a crear hábitos de estudio sólidos y duraderos."
                    iconClassName="text-[#ff405c]"
                  />
                   <FeatureCard 
                    icon={CalendarCheck}
                    title="Organización y Progreso"
                    description="Calendarios de estudio, registro de notas y reportes para padres que aseguran un aprendizaje organizado y un seguimiento claro."
                    iconClassName="text-[#3030d1]"
                  />
                </div>
                <p className="text-center text-lg text-black/70 max-w-3xl mx-auto mt-12 font-light">
                  Con LIA (Learning Intelligent Assistant), tus hijos aprenden mejor, se organizan y lo hacen con ganas. Menos estrés en casa, mejores resultados en el colegio.
                </p>
            </div>
        </section>

        {/* Sección Plan Familiar */}
        <section ref={(el) => sectionsRef.current[2] = el} className="container mx-auto text-center py-16 md:py-20 px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">Un Plan Familiar para el Aprendizaje de Todos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12 text-center">
                <div className="flex flex-col items-center">
                    <Users className="w-10 h-10 text-[#3030d1] mb-2" />
                    <p className="font-bold text-black">Una cuenta, múltiples perfiles</p>
                </div>
                <div className="flex flex-col items-center">
                    <UserCheck className="w-10 h-10 text-[#3030d1] mb-2" />
                    <p className="font-bold text-black">Perfiles para estudiantes y adultos</p>
                </div>
                <div className="flex flex-col items-center">
                    <Library className="w-10 h-10 text-[#3030d1] mb-2" />
                    <p className="font-bold text-black">Acceso 24/7 a todo el contenido</p>
                </div>
            </div>
            
             <div className="mt-12 pt-10 border-t">
                <h3 className="text-2xl md:text-3xl font-bold text-black">Toda la Etapa Escolar Cubierta</h3>
                <p className="text-lg text-[#a0a0a0] mt-2 font-light">Desde 1° Básico hasta 4° Medio, con todas las asignaturas clave del currículum nacional.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mt-8 max-w-5xl mx-auto">
                    {studentSubjects.map((subject) => {
                        const Icon = iconMap[subject.icon];
                        return (
                             <div key={subject.id} className="p-4 border rounded-lg flex flex-col items-center justify-center gap-2 bg-white transition-transform duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                                {/* CORRECCIÓN: Se restauran los colores originales de los íconos */}
                                {Icon && <Icon className={cn('w-8 h-8', `text-${subject.color}-500`)} />}
                                <p className="font-bold text-center text-sm">{subject.title}</p>
                            </div>
                        )
                    })}
                </div>
            </div>

             <div className="mt-12 pt-10 border-t">
                <h3 className="text-2xl md:text-3xl font-bold text-black">Y Mientras tus Hijos Aprenden, Tú También Crees</h3>
                <p className="text-lg text-[#a0a0a0] mt-2 font-light">Aprende nuevas habilidades: desde desarrollo profesional hasta bienestar personal.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8 max-w-5xl mx-auto">
                    {adultSubjects.map((subject) => {
                        const Icon = iconMap[subject.icon];
                        return (
                             <div key={subject.id} className="p-4 border rounded-lg flex flex-col items-center justify-center gap-2 bg-white transition-transform duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                                {/* CORRECCIÓN: Se restauran los colores originales de los íconos */}
                                {Icon && <Icon className={cn('w-8 h-8', `text-${subject.color}-500`)} />}
                                <p className="font-bold text-center text-sm">{subject.title}</p>
                            </div>
                        )
                    })}
                </div>
                <Button asChild size="lg" className="mt-8 bg-[#ff405c] text-white hover:bg-[#d33152] transition-transform duration-300 transform hover:-translate-y-1 font-bold">
                    <Link href="/signup">Crea tu Cuenta Familiar</Link>
                </Button>
                <p className="text-sm text-[#a0a0a0] mt-2 font-light">Empieza gratis. Cancela cuando quieras.</p>
            </div>
        </section>

        {/* Sección "Cómo empezar" con fondo azul secundario */}
        <section ref={(el) => sectionsRef.current[3] = el} className="bg-[#f0f7ff] py-16 md:py-20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center space-y-4 mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-black">Empezar es Así de Fácil</h2>
                </div>
                <div className="relative">
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10">
                        <StepCard icon={FileEdit} title="1. Crea tu cuenta gratis" />
                        <StepCard icon={CreditCard} title="2. Activa el plan familiar" />
                        <StepCard icon={Users} title="3. Añade los perfiles" />
                        <StepCard icon={GraduationCap} title="4. ¡A estudiar con LIA!" />
                    </div>
                </div>
            </div>
        </section>

        {/* Sección Precios */}
        <section id="precios" ref={(el) => sectionsRef.current[4] = el} className="container mx-auto text-center py-16 md:py-20 px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold">Un Plan Simple para Toda la Familia</h2>
          <p className="text-lg text-[#3030d1] font-bold my-4">
              👉 Prueba gratis por 5 días. Cancela cuando quieras.
          </p>
          <p className="text-lg text-[#a0a0a0] mt-2 max-w-2xl mx-auto font-light">
            Acceso total para todos los miembros de tu familia, sin costos ocultos ni complicaciones.
          </p>

          <div className="grid lg:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto items-start">
            {plans.map((plan) => (
                <Card 
                    key={plan.name} 
                    className={cn(
                        "flex flex-col text-left shadow-lg transition-transform duration-300 hover:-translate-y-2",
                        plan.isRecommended && "border-2 border-[#3030d1] relative pt-6"
                    )}
                >
                    {plan.isRecommended && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#d6d6fc] text-[#3030d1] px-3 py-1 text-sm font-bold rounded-full border border-[#3030d1]/30">
                            Recomendado
                        </div>
                    )}
                    <CardHeader>
                        <CardTitle className="font-bold text-2xl">{plan.name}</CardTitle>
                        {plan.discount && <p className="text-sm font-bold text-[#3030d1]">{plan.discount}</p>}
                        <div className="pt-2">
                            <span className="text-4xl font-bold">{plan.price}</span>
                            <span className="text-[#a0a0a0] font-light">{plan.period}</span>
                        </div>
                        {plan.equivalentPrice && <CardDescription className="font-light">{plan.equivalentPrice}</CardDescription>}
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <ul className="space-y-3 font-light">
                        {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-[#1ac61a] mt-1 shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                        {plan.savings && (
                            <li className="flex items-start gap-3 text-[#19a818] font-bold">
                                <Lightbulb className="w-5 h-5 shrink-0 text-yellow-400" />
                                <span>{plan.savings}</span>
                            </li>
                        )}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full bg-[#ff405c] text-white hover:bg-[#d33152] transition-transform duration-300 transform hover:-translate-y-1 font-bold">
                            <Link href="/signup">Probar 5 días gratis</Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
          </div>
          <p className="text-sm text-[#a0a0a0] mt-8 max-w-2xl mx-auto font-light">
            Ahorra en clases particulares. Con LIA tienes apoyo ilimitado 24/7 desde $12.990 al mes.
          </p>
        </section>

        {/* Sección Testimonios con fondo azul secundario */}
        <section ref={(el) => sectionsRef.current[5] = el} className="bg-[#f0f7ff] py-16 md:py-20 px-4 md:px-6">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-12">Lo que Dicen Nuestras Familias</h2>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <Card className="transition-transform duration-300 transform hover:-translate-y-2 hover:shadow-xl">
                        <CardContent className="pt-6">
                            <p className="text-[#a0a0a0] italic font-light">"Antes pagaba casi $60.000 al mes en clases particulares. Con LIA mis hijos estudian solos, mejoraron sus notas y a mi me cuesta menos. Es como tener un profe en casa las 24 horas."</p>
                        </CardContent>
                        <CardFooter>
                            <p className="font-bold">Carla M.</p>
                        </CardFooter>
                    </Card>
                     <Card className="transition-transform duration-300 transform hover:-translate-y-2 hover:shadow-xl">
                        <CardContent className="pt-6">
                            <p className="text-[#a0a0a0] italic font-light">"Lo probé por 5 días y me convenció. Mis hijos subieron sus notas y yo repaso contabilidad e inglés cuando quiero. Mucho más práctico que andar buscando cursos por separado."</p>
                        </CardContent>
                        <CardFooter>
                            <p className="font-bold">Javier R.</p>
                        </CardFooter>
                    </Card>
                </div>
                 <Button asChild size="lg" className="mt-12 bg-[#ff405c] text-white hover:bg-[#d33152] transition-transform duration-300 transform hover:-translate-y-1 font-bold">
                    <Link href="/signup">Únete a las Familias Felices</Link>
                </Button>
            </div>
        </section>

      </main>

       {/* Footer con fondo negro principal */}
       <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4 md:col-span-1">
               <Link href="/" className="block w-40 h-auto">
                <AppLogo />
              </Link>
              <p className="text-[#a0a0a0] max-w-xs font-light">El reforzamiento educativo inteligente para toda la familia.</p>
            </div>
            <div className="grid grid-cols-2 md:col-span-2 gap-8">
                <div>
                  <h4 className="font-bold mb-4">Navegación</h4>
                  <ul className="space-y-2 font-light">
                    <li><Link href="#ventajas" className="text-[#a0a0a0] hover:text-[#5854fc]">Ventajas</Link></li>
                    <li><Link href="#precios" className="text-[#a0a0a0] hover:text-[#5854fc]">Precios</Link></li>
                    <li><Link href="/login" className="text-[#a0a0a0] hover:text-[#5854fc]">Iniciar Sesión</Link></li>
                    <li><Link href="/signup" className="text-[#a0a0a0] hover:text-[#5854fc]">Registrarse</Link></li>
                  </ul>
                </div>
                 <div>
                  <h4 className="font-bold mb-4">Síguenos</h4>
                  <div className="flex items-center gap-4">
                    <Link href="#" aria-label="Instagram"><InstagramIcon className="w-6 h-6 text-[#a0a0a0] hover:text-[#5854fc]" /></Link>
                    <Link href="#" aria-label="Facebook"><FacebookIcon className="w-6 h-6 text-[#a0a0a0] hover:text-[#5854fc]" /></Link>
                    <Link href="#" aria-label="TikTok"><TikTokIcon className="w-6 h-6 text-[#a0a0a0] hover:text-[#5854fc]" /></Link>
                  </div>
                </div>
            </div>
          </div>
          <div className="border-t border-[#888889] mt-8 pt-6 text-center text-[#a0a0a0] text-sm font-light">
            <p>© 2025 Aula Digital Plus. Todos los derechos reservados. | <Link href="/privacy-policy" className="hover:text-[#5854fc]">Política de Privacidad</Link> | <Link href="/terms-and-conditions" className="hover:text-[#5854fc]">Términos y Condiciones</Link></p>
          </div>
        </div>
      </footer>
    </div>
  );
}