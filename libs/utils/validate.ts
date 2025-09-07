import dayjs from "dayjs";
import { Errors } from "./IError";
import { Guest } from "@classes/guest";
import { EMPTY } from "./string";

const phoneDigitsRegex = /^[0-9]{8,11}$/;

export function sanitize(input: string): string {
    return input.replace(/<[^>]*>?/gm, EMPTY).trim();
}

export function validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length >= 8 && cleaned.length <= 11;
}

export function validateForm(entity: Guest, quantity?: number): Errors {
    const error: Errors = {};

    if (!entity.name || sanitize(String(entity.name)).length < 2) {
        error.name = 'Nome inválido (mínimo 2 caracteres).';
    }

    const phone = String(entity.phone ?? EMPTY).replace(/\D/g, EMPTY);
    if (!phoneDigitsRegex.test(phone)) {
        error.phone = 'Telefone deve conter de 9 a 11 dígitos.';
    }

    if (!entity.birthdate) {
        error.birthdate = 'Data de nascimento obrigatória.';
    } else {
        const birth = dayjs(entity.birthdate);
        const minBirth = dayjs().subtract(16, 'years');
        if (birth.isAfter(minBirth)) {
            error.birthdate = 'Idade mínima: 16 anos.';
        }
    }

    if (!quantity || quantity < 1) {
        error.quantity = 'Quantidade mínima é 1.';
    }

    return error;
}
