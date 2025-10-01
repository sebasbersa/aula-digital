// src/app/pricing/page.tsx

import type { NextPage } from 'next';
import { Check, Star } from 'lucide-react';

// --- DATOS DE LOS PLANES ---
// Mantener los datos aquí facilita la modificación futura de los planes.
const pricingPlans = [
  {
    name: 'Plan Mensual',
    price: '$12.990',
    priceDetails: '/mes',
    description: 'Acceso total, flexible y sin compromiso. Cancela en cualquier momento.',
    isPopular: false,
  },
  {
    name: 'Plan Anual',
    price: '$10.825',
    priceDetails: '/mes',
    secondaryPriceInfo: 'Paga $129.900 al año',
    description: 'Obtén 2 meses gratis y asegura el mejor precio.',
    isPopular: true, // Marcado como recomendado
  },
  {
    name: 'Plan Semestral',
    price: '$11.665',
    priceDetails: '/mes',
    secondaryPriceInfo: 'Paga $69.990 cada 6 meses',
    description: 'Ahorra un 10% y mantén el aprendizaje continuo.',
    isPopular: false,
  },
];

// Beneficios comunes a todos los planes
const includedFeatures = [
  'Hasta 5 usuarios por cuenta',
  'Acceso ilimitado a LIA (IA educativa 24/7)',
  'Clases para adultos incluidas',
  'Reportes detallados para padres',
  'Cancela en cualquier momento',
];

// --- COMPONENTE DE LA PÁGINA DE PRECIOS ---
const PricingPage: NextPage = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            🌟 Elige tu plan y comienza a aprender con LIA
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Disfruta 5 días gratis con acceso ilimitado. Después, selecciona el plan que mejor se adapte a ti y tu familia.
            Con LIA tienes apoyo para estudiantes, clases para adultos y reportes para padres, todo en un solo lugar.
          </p>
        </div>

        {/* Contenedor de las tarjetas de precios */}
        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-8 items-center">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 shadow-lg relative flex flex-col h-full ${
                plan.isPopular
                  ? 'bg-indigo-600 text-white transform lg:scale-105 border-4 border-orange-400'
                  : 'bg-white text-gray-900'
              }`}
            >
              {/* Etiqueta "Recomendado" */}
              {plan.isPopular && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-orange-500 text-white">
                    <Star className="w-4 h-4 mr-2" /> Recomendado
                  </span>
                </div>
              )}

              {/* Contenido de la tarjeta */}
              <div className="flex-grow flex flex-col">
                <h2 className="text-3xl font-bold">{plan.name}</h2>
                <p className={`mt-3 text-sm h-12 ${plan.isPopular ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {plan.description}
                </p>

                <div className="mt-6">
                  <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                  <span className={`text-lg font-medium ${plan.isPopular ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {plan.priceDetails}
                  </span>
                  {plan.secondaryPriceInfo && (
                    <p className={`text-sm mt-1 ${plan.isPopular ? 'text-indigo-200' : 'text-gray-500'}`}>
                      ({plan.secondaryPriceInfo})
                    </p>
                  )}
                </div>

                <div className="my-8">
                    <div className="border-t border-gray-300"></div>
                </div>

                <h3 className={`text-lg font-semibold mb-4 ${plan.isPopular ? 'text-white' : 'text-gray-800'}`}>
                  Beneficios incluidos:
                </h3>
                <ul className="space-y-4">
                  {includedFeatures.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className={`h-6 w-6 ${plan.isPopular ? 'text-orange-400' : 'text-indigo-500'}`} />
                      </div>
                      <p className="ml-3 text-base font-medium">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Botón CTA y Confianza */}
        <div className="mt-16 text-center">
            <button
                className="w-full max-w-md mx-auto bg-green-500 text-white font-bold py-4 px-8 text-xl rounded-lg hover:bg-green-600 transition-transform duration-200 transform hover:scale-105"
            >
                Comienza tu prueba gratuita de 5 días ahora
            </button>
            <p className="mt-6 text-sm text-gray-600">
             🔒 Regístrate hoy, prueba sin riesgos. Si no es para ti, puedes cancelar cuando quieras, sin costos ocultos.
            </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;