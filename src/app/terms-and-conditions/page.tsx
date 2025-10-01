'use client';

import { AppLogo, FacebookIcon, InstagramIcon, TikTokIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TermsAndConditionsPage() {
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
                <h1 className="text-3xl md:text-4xl font-bold text-black">Términos y Condiciones de Uso</h1>
                <p className="text-lg font-light text-[#a0a0a0] mt-2">Última actualización: 30 de Septiembre de 2025</p>
            </div>
          
            {/* Contenedor del texto con estilos para mejorar legibilidad */}
            <div className="space-y-8 font-light text-lg text-[#a0a0a0] leading-relaxed">
                <p>Bienvenido a Aula Digital Plus. Al registrarte, acceder o utilizar nuestra plataforma, aceptas estos Términos y Condiciones ("Términos"). Por favor, léelos detenidamente.</p>

                <div className="pt-6 border-t">
                    <h2 className="text-2xl font-bold text-black mb-4">1. Aceptación y Definiciones</h2>
                    <p>Este documento constituye un acuerdo legal vinculante entre tú ("Usuario") y Aula Digital Plus ("Plataforma", "nosotros").</p>
                    <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
                        <li><strong>Servicio:</strong> Se refiere a la plataforma de aprendizaje Aula Digital Plus, incluyendo su IA, contenido, características y sitio web.</li>
                        <li><strong>Cuenta:</strong> Es el perfil creado por el Usuario para acceder al Servicio.</li>
                        <li><strong>Contenido:</strong> Incluye todos los textos, videos, ejercicios, software y material educativo disponible en la Plataforma.</li>
                    </ul>
                </div>

                <div className="pt-6 border-t">
                    <h2 className="text-2xl font-bold text-black mb-4">2. Cuentas de Usuario</h2>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li>Debes ser mayor de 18 años o contar con el consentimiento de tus padres o tutores para crear una cuenta.</li>
                        <li>Eres responsable de proporcionar información precisa y de mantener la confidencialidad de tu contraseña.</li>
                        <li>La cuenta del plan familiar es para uso exclusivo de los miembros del mismo hogar. Compartir credenciales con personas externas es una violación de estos Términos.</li>
                    </ul>
                </div>
                
                <div className="pt-6 border-t">
                    <h2 className="text-2xl font-bold text-black mb-4">3. Suscripciones, Pagos y Cancelación</h2>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li><strong>Prueba Gratuita:</strong> Ofrecemos un período de prueba gratuito de 5 días. Si no cancelas antes de que finalice, tu suscripción comenzará automáticamente y se te cobrará la tarifa del plan seleccionado.</li>
                        <li><strong>Facturación:</strong> Las suscripciones se renuevan automáticamente (mensual, semestral o anualmente). El cobro se realizará al método de pago registrado al inicio de cada ciclo de facturación.</li>
                        <li><strong>Cancelación:</strong> Puedes cancelar tu suscripción en cualquier momento desde la configuración de tu cuenta. La cancelación será efectiva al final del período de facturación actual, y mantendrás el acceso al servicio hasta esa fecha.</li>
                        <li><strong>Reembolsos:</strong> Los pagos no son reembolsables, salvo que la legislación aplicable exija lo contrario.</li>
                    </ul>
                </div>

                <div className="pt-6 border-t">
                    <h2 className="text-2xl font-bold text-black mb-4">4. Conducta del Usuario y Uso Aceptable</h2>
                    <p>Te comprometes a utilizar el Servicio únicamente con fines lícitos y educativos. Queda estrictamente prohibido:</p>
                    <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
                        <li>Utilizar bots, scripts o cualquier medio automatizado para acceder o interactuar con la Plataforma.</li>
                        <li>Intentar realizar ingeniería inversa, descompilar o extraer el código fuente de nuestro software.</li>
                        <li>Subir o compartir contenido ilegal, ofensivo, difamatorio o que infrinja los derechos de terceros.</li>
                        <li>Revender, distribuir o explotar comercialmente el Contenido o el acceso al Servicio.</li>
                    </ul>
                    <p className="mt-4">Nos reservamos el derecho de suspender o cancelar tu cuenta de forma inmediata si incumples estas normas.</p>
                </div>

                <div className="pt-6 border-t">
                    <h2 className="text-2xl font-bold text-black mb-4">5. Propiedad Intelectual</h2>
                    <p>Todo el Contenido y la tecnología de la Plataforma son propiedad exclusiva de Aula Digital Plus y están protegidos por leyes de derechos de autor y propiedad intelectual. Te otorgamos una licencia limitada, no exclusiva y no transferible para acceder y usar el Servicio para fines personales y no comerciales mientras tu suscripción esté activa.</p>
                </div>

                <div className="pt-6 border-t">
                    <h2 className="text-2xl font-bold text-black mb-4">6. Limitación de Responsabilidad</h2>
                    <p>El Servicio se proporciona "tal cual" y "según disponibilidad". Si bien nos esforzamos por ofrecer una herramienta de apoyo educativo de alta calidad, no garantizamos resultados académicos específicos ni que el Servicio estará libre de errores o interrupciones.</p>
                    <p className="mt-4">Nuestra responsabilidad total ante cualquier reclamación derivada de estos Términos se limitará al importe que hayas pagado por el Servicio en los últimos seis (6) meses.</p>
                </div>

                <div className="pt-6 border-t">
                    <h2 className="text-2xl font-bold text-black mb-4">7. Modificaciones a los Términos</h2>
                    <p>Podemos modificar estos Términos en cualquier momento. Te notificaremos los cambios importantes por correo electrónico o mediante un aviso en la Plataforma. El uso continuado del Servicio después de la notificación constituirá tu aceptación de los nuevos términos.</p>
                </div>

                <div className="pt-6 border-t">
                    <h2 className="text-2xl font-bold text-black mb-4">8. Ley Aplicable y Jurisdicción</h2>
                    <p>Estos Términos se regirán e interpretarán de acuerdo con las leyes de [Tu País/Estado]. Cualquier disputa que surja en relación con estos Términos se someterá a la jurisdicción exclusiva de los tribunales de [Tu Ciudad, País].</p>
                </div>
                
                <div className="pt-6 border-t">
                    <h2 className="text-2xl font-bold text-black mb-4">9. Contacto</h2>
                    <p>Si tienes alguna pregunta sobre estos Términos y Condiciones, contáctanos en: <a href="mailto:contacto.auladigitalplus@maisynergy.com" className="font-bold text-[#3030d1] hover:underline">contacto.auladigitalplus@maisynergy.com</a></p>
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