import { addDoc, collection, doc, getDoc, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";
import { Lot } from "@classes/lot";


export async function findAllLots(): Promise<Lot[]> {
    try {
        const snapshot = await getDocs(collection(db, 'lots'));
        return snapshot.docs.map((it) => ({ id: it.id, ...it.data() } as Lot))
    } catch (error) {
        alert('Erro ao listar: ' + error);
        throw error;
    }
}

export async function findByLottId(id: string): Promise<Lot | null> {
    try {
        const ref = doc(db, 'lots', id);
        const snapshot = await getDoc(ref);

        if (!snapshot.exists()) return null;

        return { id: snapshot.id, ...snapshot.data() } as Lot;
    } catch (error) {
        alert('Erro ao buscar: ' + error);
        throw error;
    }
}