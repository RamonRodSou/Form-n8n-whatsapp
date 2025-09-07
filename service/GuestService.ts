import firebase from "firebase/compat/app"
import { collection, doc, getDoc, getDocs, runTransaction, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { Guest } from "@classes/guest";

export async function ticketAdd(it: Guest, lotId: string) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");
    const lotRef = doc(db, "lots", lotId);
    const ticketsRef = collection(db, "tickets");

    try {
        await runTransaction(db, async (transaction) => {
            const loteDoc = await transaction.get(lotRef);
            if (!loteDoc.exists()) throw new Error("Lote não existe");

            const lotData = loteDoc.data();
            const quantity = Number(lotData.quantity);

            if (quantity <= 0) throw new Error("Lote esgotado");

            transaction.update(lotRef, { quantity: quantity - 1 });

            transaction.set(doc(ticketsRef), {
                userId: user.uid,
                name: it.name,
                phone: it.phone,
                birthdate: it.birthdate,
                isActive: it.isActive,
                createdAt: it.createdAt,
                lotId: lotId,
            });
        });

        console.log("Compra realizada com sucesso!");
    } catch (error) {
        console.error("Erro ao comprar ingresso:", error);
        throw error;
    }
}

export async function findAllTickets(): Promise<Guest[]> {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Usuário não autenticado.");

        const snapshot = await getDocs(collection(db, 'tickets'));
        return snapshot.docs.map((it) => ({ id: it.id, ...it.data() } as Guest))
    } catch (error) {
        alert('Erro ao listar: ' + error);
        throw error;
    }
}

export async function findByTicketId(id: string): Promise<Guest | null> {
    try {
        const ref = doc(db, 'tickets', id);
        const snapshot = await getDoc(ref);

        if (!snapshot.exists()) return null;

        return { id: snapshot.id, ...snapshot.data() } as Guest;
    } catch (error) {
        alert('Erro ao buscar: ' + error);
        throw error;
    }
}

export async function updateTicket(id: string, data: Partial<Guest>): Promise<void> {
    try {
        const ref = doc(db, 'tickets', id);
        await updateDoc(ref, data);
    } catch (error) {
        alert('Erro ao atualizar: ' + error);
        throw error;
    }
}

export async function ticketDelete(id: string) {
    try {
        await firebase.firestore().collection('tickets').doc(id).delete()
    } catch (error) {
        alert('Erro ao deletar: ' + error)
    }
} 