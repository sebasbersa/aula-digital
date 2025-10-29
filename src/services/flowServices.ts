'use server';
// En este archivo se gestionan todas las llamadas a la api de Flow
import { createHmac } from 'crypto';
const API_KEY = process.env.NEXT_PUBLIC_FLOW_API_KEY || "";
const API_SECRET = process.env.NEXT_PUBLIC_FLOW_SECRET_KEY || "";
const BASE_URL = process.env.NEXT_PUBLIC_FLOW_API_URL;
/**
 * Genera una firma HMAC-SHA256 usando el módulo nativo 'crypto' de Node.js.
 *
 * @param requestData - Un objeto con los pares clave-valor que se incluirán en la firma.
 *                      Los valores pueden ser strings o números.
 * @param secretKey - La clave secreta para generar el HMAC.
 * @returns La firma generada en formato de string hexadecimal.
 */
const generarFirma = (params: Record<string, any>, secret: string): string => {
    const sortedKeys = Object.keys(params).sort();
    const toSign = sortedKeys.map(key => `${key}${params[key]}`).join('');

    const hmac = createHmac('sha256', secret);
    hmac.update(toSign);

    return hmac.digest('hex');
};

export const crearUsuarioFlowRequest = async (nombre: string, email: string, externalId: string) => {
    console.log(BASE_URL)
    const url = `${BASE_URL}/customer/create`;
    const params: Record<string, any> = {
        apiKey: API_KEY,
        name: nombre,
        email: email,
        externalId: externalId
    };
    const firma = generarFirma(params, API_SECRET);

    const formdata = new FormData();
    formdata.append("apiKey", API_KEY);
    formdata.append("name", nombre);
    formdata.append("email", email);
    formdata.append("externalId", externalId);
    formdata.append("s", firma);

    const response = await fetch(url, {
        method: 'POST',
        body: formdata,
    });
    return await response.json();
}

export const registerCardFlowRequest = async (customerId: string, urlReturn: string): Promise<any> => {
    const url = `${BASE_URL}/customer/register`;
    const params: Record<string, any> = {
        apiKey: API_KEY,
        customerId: customerId,
        url_return: urlReturn
    };
    const firma = generarFirma(params, API_SECRET);

    const formdata = new FormData();
    formdata.append("apiKey", API_KEY);
    formdata.append("customerId", customerId);
    formdata.append("url_return", urlReturn);
    formdata.append("s", firma);

    const response = await fetch(url, {
        method: 'POST',
        body: formdata,
    });

    return await response.json();
}

export const getRegisterStatus = async (token: string): Promise<any> => {
    const paramsParaFirmar: Record<string, any> = {
        apiKey: API_KEY,
        token: token,
    };
    const firma = generarFirma(paramsParaFirmar, API_SECRET);
    const queryParams = new URLSearchParams({
        ...paramsParaFirmar, // Añade apiKey y token
        s: firma,             // Y ahora añade la firma
    });
    const url = `${BASE_URL}/customer/getRegisterStatus?${queryParams.toString()}`;

    console.log(`Consultando a Flow GET: ${url}`); // Útil para depurar
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    });
    return await response.json();
}

export const createFlowSuscription = async (planId: string, customerId: string): Promise<any> => {
    const url = `${BASE_URL}/subscription/create`;
    const params: Record<string, any> = {
        apiKey: API_KEY,
        planId: planId,
        customerId: customerId
    };
    const firma = generarFirma(params, API_SECRET);

    const formdata = new FormData();
    formdata.append("apiKey", API_KEY);
    formdata.append("planId", planId);
    formdata.append("customerId", customerId);
    formdata.append("s", firma);

    const response = await fetch(url, {
        method: 'POST',
        body: formdata,
    });

    return await response.json();
}

export const getFlowSubscription = async (subscriptionId: string): Promise<any> => {
    const paramsParaFirmar: Record<string, any> = {
        apiKey: API_KEY,
        subscriptionId: subscriptionId,
    };
    const firma = generarFirma(paramsParaFirmar, API_SECRET);
    const queryParams = new URLSearchParams({
        ...paramsParaFirmar, 
        s: firma,            
    });
    const url = `${BASE_URL}/subscription/get?${queryParams.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    });
    return await response.json();
}
