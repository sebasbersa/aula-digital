'use client';

import { AppLogo, FacebookIcon, InstagramIcon, TikTokIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white text-black">
      {/* ===== ENCABEZADO CONSISTENTE CON LA LANDING PAGE ===== */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto flex items-center justify-between py-2 px-4 md:px-6">
            <Link href="/" className="w-64 h-auto">
                <AppLogo />
            </Link>
            <div className="flex items-center gap-2 md:gap-6">
                 <nav className="hidden md:flex items-center gap-6 text-sm font-bold">
                    <Link href="/" className="text-black hover:text-[#3030d1] transition-colors">Inicio</Link>
                    <Link href="/#ventajas" className="text-black hover:text-[#3030d1] transition-colors">Ventajas</Link>
                    <Link href="/#precios" className="text-black hover:text-[#3030d1] transition-colors">Precios</Link>
                </nav>
                <div className="flex items-center gap-2">
                    <Button asChild className="hidden sm:inline-flex bg-[#d6d6fc] text-[#3030d1] hover:bg-[#5854fc] hover:text-white transition-all duration-300 font-bold">
                        <Link href="/login">Iniciar Sesión</Link>
                    </Button>
                    <Button asChild className="bg-[#ff405c] text-white hover:bg-[#d33152] transition-transform duration-300 transform hover:-translate-y-1 font-bold">
                        <Link href="/signup">Regístrate Gratis</Link>
                    </Button>
                </div>
            </div>
        </div>
      </header>

      {/* ===== CONTENIDO PRINCIPAL MEJORADO ===== */}
      <main className="container mx-auto py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
            <div className="mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-black">Política de Privacidad</h1>
                <p className="text-lg font-light text-[#a0a0a0] mt-2">Última actualización: 30 de Septiembre de 2025</p>
            </div>
          
            {/* Contenedor del texto con estilos para mejorar legibilidad */}
            <div className="space-y-8 font-light text-lg text-[#a0a0a0] leading-relaxed">
                <p>En Aula Digital Plus ("nosotros", "nuestro"), tu privacidad es nuestra máxima prioridad. Esta Política de Privacidad describe cómo recopilamos, usamos, protegemos y compartimos tu información personal cuando utilizas nuestra plataforma educativa y servicios asociados (la "Plataforma").</p>

                {/* Secciones con títulos más claros y espaciado */}
                <div className="pt-6 border-t">
                    <h2 className="text-2xl font-bold text-black mb-4">1. Información que Recopilamos</h2>
                    <p>Para ofrecer una experiencia de aprendizaje personalizada y efectiva, recopilamos los siguientes tipos de información:</p>
                    <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
                        <li><strong>Datos de Registro:</strong> Nombre, apellido, dirección de correo electrónico, contraseña. En planes familiares, recopilamos los nombres o alias de los perfiles creados por el titular de la cuenta.</li>
                        <li><strong>Datos de Uso y Progreso:</strong> Interacciones con la IA, respuestas a ejercicios, cursos visitados, tiempo de estudio, rachas, puntos y progreso académico general.</li>
                        <li><strong>Información de Pago:</strong> Nuestros pagos son procesados por pasarelas externas seguras (como Flow, Transbank o MercadoPago). Nosotros no almacenamos, ni tenemos acceso a los datos completos de tu tarjeta de crédito o débito.</li>
                        <li><strong>Datos Técnicos:</strong> Dirección IP, tipo de navegador y dispositivo, sistema operativo y cookies necesarias para el funcionamiento técnico de la Plataforma.</li>
                    </ul>
                </div>

                <div className="pt-6 border-t">
                    <h2 className="text-2xl font-bold text-black mb-4">2. Cómo Usamos tu Información</h2>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li>Para <strong className="font-bold text-black/80">operar y mantener</strong> la Plataforma, gestionar tu cuenta y brindarte soporte técnico.</li>
                        <li>Para <strong className="font-bold text-black/80">personalizar la experiencia</strong> de aprendizaje, adaptando el contenido y las recomendaciones de nuestra IA a tus necesidades.</li>
                        <li>Para <strong className="font-bold text-black/80">comunicarnos contigo</strong> sobre tu suscripción, novedades, actualizaciones importantes o promociones (siempre tendrás la opción de darte de baja de las comunicaciones de marketing).</li>
                        <li>Para <strong className="font-bold text-black/80">mejorar nuestros servicios</strong>, analizando datos de uso de forma agregada y anónima para entender cómo se utiliza la Plataforma e identificar áreas de mejora.</li>
                    </ul>
                </div>
                
                <div className="pt-6 border-t">
                    <h2 className="text-2xl font-bold text-black mb-4">3. Privacidad de Menores de Edad (¡Importante!)</h2>
                    <p>Proteger la privacidad de los niños es fundamental. La cuenta principal siempre debe ser creada y gestionada por un padre, madre o tutor legal mayor de 18 años. Los perfiles para menores de edad se crean bajo la supervisión y consentimiento del titular de la cuenta. No recopilamos intencionadamente más información personal de la estrictamente necesaria para el funcionamiento de la Plataforma educativa.</p>
                </div>

                <div className="pt-6 border-t">
                    <h2 className="text-2xl font-bold text-black mb-4">4. Cómo Protegemos y Compartimos tu Información</h2>
                    <p>No vendemos, alquilamos ni compartimos tu información personal con terceros para sus fines de marketing.</p>
                    <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
                        <li>Implementamos medidas de seguridad técnicas y organizativas, como el cifrado de datos (SSL/HTTPS), para proteger tu información.</li>
                        <li>El acceso a datos personales está restringido únicamente al personal autorizado que lo necesita para realizar sus funciones.</li>
                        <li>Podemos compartir información con proveedores de servicios de confianza que nos ayudan a operar la Plataforma (ej. procesadores de pago, servicios de hosting), siempre bajo estrictos acuerdos de confidencialidad.</li>
                    </ul>
                </div>

                <div className="pt-6 border-t">
                    <h2 className="text-2xl font-bold text-black mb-4">5. Política de Cookies</h2>
                    <p>Utilizamos cookies para mejorar tu experiencia. Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo. Usamos cookies <strong className="font-bold text-black/80">esenciales</strong> (para iniciar sesión y recordar tus preferencias) y cookies de <strong className="font-bold text-black/80">rendimiento</strong> (para analizar el uso anónimo del sitio y mejorarlo). Puedes gestionar las cookies desde la configuración de tu navegador.</p>
                </div>

                <div className="pt-6 border-t">
                    <h2 className="text-2xl font-bold text-black mb-4">6. Conservación de Datos</h2>
                    <p>Conservaremos tu información personal mientras tu cuenta esté activa o según sea necesario para cumplir con nuestras obligaciones legales y resolver disputas. Si eliminas tu cuenta, tus datos personales serán eliminados de forma permanente de acuerdo con nuestros ciclos de borrado.</p>
                </div>

                <div className="pt-6 border-t">
                    <h2 className="text-2xl font-bold text-black mb-4">7. Tus Derechos</h2>
                    <p>Tienes derecho a acceder, rectificar, eliminar o solicitar la portabilidad de tus datos personales. Para ejercer estos derechos, por favor contáctanos.</p>
                </div>

                <div className="pt-6 border-t">
                    <h2 className="text-2xl font-bold text-black mb-4">8. Cambios a esta Política</h2>
                    <p>Nos reservamos el derecho de actualizar esta política. Te notificaremos sobre cambios significativos a través de un aviso en la Plataforma o por correo electrónico.</p>
                </div>

                <div className="pt-6 border-t">
                    <h2 className="text-2xl font-bold text-black mb-4">9. Contacto</h2>
                    <p>Si tienes alguna pregunta sobre esta Política de Privacidad, no dudes en contactarnos en: <a href="mailto:contacto.auladigitalplus@maisynergy.com" className="font-bold text-[#3030d1] hover:underline">contacto.auladigitalplus@maisynergy.com</a></p>
                </div>
            </div>
        </div>
      </main>

       {/* ===== PIE DE PÁGINA CONSISTENTE CON LA LANDING PAGE ===== */}
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
                    <li><Link href="/#ventajas" className="text-[#a0a0a0] hover:text-[#5854fc]">Ventajas</Link></li>
                    <li><Link href="/#precios" className="text-[#a0a0a0] hover:text-[#5854fc]">Precios</Link></li>
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