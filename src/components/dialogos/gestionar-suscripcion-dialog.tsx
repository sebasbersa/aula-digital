"use client";

import { Member } from '@/lib/types';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Definimos las props que recibirá el componente.
// En este caso, una función para manejar el cierre del modal.
interface SubscriptionModalProps {
    onClose: () => void;
    user: Member | null
}

// Un componente simple para el ícono de cerrar (X)
const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

// El componente principal del modal
const GestionarSuscripcionDialog: React.FC<SubscriptionModalProps> = ({ onClose, user }) => {
    const { toast } = useToast();
    // Estado para manejar los valores del formulario
    const [requestType, setRequestType] = useState('Sugerencias');
    const [message, setMessage] = useState('');
    const [telefono, setTelefono] = useState("");

    function validar(): boolean {
        if (telefono.length === 0) {
            toast({
                title: 'Error',
                description: "El telefono es obligatorio",
                variant: 'destructive'
            });
            return false;
        }
        if (telefono.length < 8) {
            toast({
                title: 'Error',
                description: "El telefono debe contener 8 dígitos",
                variant: 'destructive'
            });
            return false;
        }
        if (message.length === 0) {
            toast({
                title: 'Error',
                description: "El mensaje es obligatorio",
                variant: 'destructive'
            });
            return false;
        }
        return true;
    }

    async function handleSendMail() {
        if (!validar()) {
            return;
        }
        try {
            const res = await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: 'contacto.auladigitalplus@maisynergy.com', // 👈 destinatario final
                    subject: `Solicitud de suscripción: ${requestType}`,
                    message: `
                    <b>Nueva solicitud de subscripción:</b><br /><br />
                    Usuario: ${user?.name}<br />
                    Teléfono: ${telefono}<br />
                    Correo electrónico: ${user?.email}<br />
                    Plan actual: ${user?.flowSuscription?.planName}<br />
                    Estado de plan: ${user?.subscriptionStatus}<br />
                    <hr/>
                    <b>Mensaje:</b>
                    <br />
                    ${message} `,
                }),
            });
            const data = await res.json();

            if (data.success) {
                toast({
                    title: 'Exito!',
                    description: "Mensaje recibido, nos comunicaremos a la brevedad",
                });
                onClose();
            } else {
                alert('Error al enviar el correo ❌');
            }
        } catch (error) {
            console.error('Error al enviar correo:', error);
            alert('Ocurrió un error inesperado 😞');
        }
    }

    function handleTelefonoChange(e: any) {
        setTelefono(e.target.value);
    }

    return (
        // 1. Overlay: Fondo oscuro que cubre toda la pantalla
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-60">

            {/* 2. Contenedor del Modal */}
            <div className="relative w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">

                {/* Botón para cerrar el modal */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-gray-700"
                    aria-label="Cerrar"
                >
                    <CloseIcon />
                </button>

                <h2 className="mb-6 text-2xl font-bold text-gray-800">
                    Gestionar tu suscripción
                </h2>

                <form className="space-y-6">
                    {/* Campo: Tipo de solicitud */}
                    <div>
                        <label htmlFor="request-type" className="mb-2 block text-sm font-medium text-gray-700">
                            Tipo de solicitud*
                        </label>
                        <div className="relative">
                            <select
                                id="request-type"
                                value={requestType}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRequestType(e.target.value)}
                                className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2.5 text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="Sugerencias">Sugerencias</option>
                                <option value="Cambio de cuenta">Cambio de cuenta</option>
                                <option value="Cancelar suscripción">Cancelar suscripción</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="phone-number" className="mb-2 block text-sm font-medium text-gray-700">
                            Teléfono*
                        </label>
                        <div className="flex items-center rounded-md border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500">
                            <span className="whitespace-nowrap bg-gray-50 px-3 py-2.5 text-gray-500 border-r border-gray-300 ">
                                +56 9
                            </span>
                            <input
                                type="tel"
                                id="phone-number"
                                name="phone-number"
                                placeholder="12345678"
                                maxLength={8}
                                value={telefono}
                                onChange={handleTelefonoChange}
                                className="w-full border-0 bg-white px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-0"
                            />
                        </div>
                    </div>

                    {/* Campo: Mensaje (opcional) */}
                    <div>
                        <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-700">
                            Mensaje*
                        </label>
                        <textarea
                            id="message"
                            rows={5}
                            value={message}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                            placeholder="Escribe tu mensaje aquí..."
                            className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Botón de envío */}
                    <button
                        type="button"
                        className="w-full rounded-md bg-indigo-600 px-4 py-3 text-base font-semibold text-white shadow-md transition-transform hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95"
                        onClick={handleSendMail}
                    >
                        Enviar solicitud
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GestionarSuscripcionDialog;