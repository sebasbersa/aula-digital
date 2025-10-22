'use server';

import { adminDb } from '@/lib/firebase-admin'; // ¡Importante! Usar la instancia de admin
import { Member } from '@/lib/types';
export async function findMemberByUidAsAdmin(uid: string): Promise<{ id: string; data: Member } | null> {
    try {
        const membersRef = adminDb.collection('members');
        // Crea una consulta para buscar donde el campo 'uid' coincida
        const q = membersRef.where('uid', '==', uid).limit(1);
        const querySnapshot = await q.get();

        if (querySnapshot.empty) {
            console.warn(`No member found with UID: ${uid}`);
            return null;
        }

        const doc = querySnapshot.docs[0];
        return {
            id: doc.id, // ¡Este es el ID de documento real!
            data: doc.data() as Member
        };

    } catch (error) {
        console.error("Error finding member by UID from server: ", error);
        throw new Error("Could not find member by UID from server action.");
    }
}
export async function findMemberByFlowCustomerId(customerId: string): Promise<Member | null> {
    try {
        const membersRef = adminDb.collection('members');
        // Crea una consulta para buscar donde el campo 'uid' coincida
        const q = membersRef.where('flowSuscription.customerId', '==', customerId).limit(1);
        const querySnapshot = await q.get();
        console.log('querySnapshot.docs');
        console.log(querySnapshot.docs);
        if (querySnapshot.empty) {
            console.warn(`No member found with customerId: ${customerId}`);
            return null;
        }

        const doc = querySnapshot.docs[0];
        console.log('doc');
        console.log(doc);
        return querySnapshot.docs[0].data() as Member;

    } catch (error) {
        console.error("Error finding member by UID from server: ", error);
        throw new Error("Could not find member by UID from server action.");
    }
}
/**
 * Actualiza un miembro usando su ID de DOCUMENTO de Firestore.
 */
export async function updateMemberAsAdmin(memberDocId: string, memberData: Partial<Member>): Promise<void> {
    try {
        const memberRef = adminDb.collection('members').doc(memberDocId);
        await memberRef.update(memberData);
    } catch (error) {
        console.error("Error updating member from server: ", error);
        throw error; // Relanzamos el error original para tener más detalles
    }
}
export async function updateMemberByUidAsAdmin(memberUid: string, memberData: Partial<Member>): Promise<void> {
    try {
        const membersCollection = adminDb.collection('members');
        const query = membersCollection.where('uid', '==', memberUid);

        const querySnapshot = await query.get();
        if (querySnapshot.empty) {
            console.log('No se encontraron documentos con ese UID.');
            return;
        }
        // console.log('querySnapshot.docs');
        // console.log(querySnapshot.docs);
        // console.log('querySnapshot.docs[0]');
        // console.log(querySnapshot.docs[0]);
        if (!querySnapshot.docs[0].exists) {
            console.log('no existe!!!');
            return;
        }
        await querySnapshot.docs[0].ref.update(memberData);
    } catch (error) {
        console.error("Error updating member from server: ", error);
        throw error; // Relanzamos el error original para tener más detalles
    }
}

/**
 * Obtener miembro desde Server
 */
export async function getAuthMember() {
    try {
        const memberRef = adminDb.collection('members');


    } catch (error) {
        console.error("Error updating member from server: ", error);
        throw error; // Relanzamos el error original para tener más detalles
    }
}