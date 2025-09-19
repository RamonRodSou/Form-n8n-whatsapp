"use client";
import './styles.scss'
import { useState, useEffect, FormEvent } from "react";
import { Alert, Box, Button, CircularProgress, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Lot } from "@classes/lot";
import { Guest } from '@classes/guest';
import { sanitize, validateForm } from '@utils/validate';
import { Errors } from '@utils/IError';
import { SendFormToN8n } from '@services/N8NConection';
import { findAllLots } from '@services/LotService';
import { EMPTY } from "@utils/string"

export default function TicketForm() {
    const [lots, setLots] = useState<Lot[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLotId, setSelectedLotId] = useState<string>(EMPTY);
    const [quantity, setQuantity] = useState<number>(1);
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const [errors, setErrors] = useState<Errors>({});
    const [form, setForm] = useState<Guest>(new Guest);

    function handleChange(field: keyof Guest, value: string | Date | null) {
        setForm(prev => {
            const data = { ...prev, [field]: value };
            return Guest.fromJson(data);
        });
    };

    function formatForm(form: Guest): Guest {
        return Guest.fromJson({
            ...form,
            name: sanitize(String(form.name ?? EMPTY)),
            phone: String(form.phone ?? EMPTY).replace(/\D/g, EMPTY),
            birthdate: form.birthdate ? dayjs(form.birthdate).toISOString() : null,
        });
    }

    function validateFormData(form: Guest, quantity: number): Errors {
        return validateForm(form, quantity);
    }

    async function sendForm(
        form: Guest,
        setForm: (form: Guest) => void,
        setErrors: (errors: Errors) => void,
        setSuccessMsg: (msg: string | null) => void
    ) {
        try {
            await SendFormToN8n(form);
            setForm(new Guest());
            setErrors({});
            setSuccessMsg('Inscrição enviado com sucesso, em breve entraremos em contato!');
            setTimeout(() => setSuccessMsg(null), 5000);
        } catch (err) {
            console.error(err);
            setSuccessMsg('Desculpa, infelizmente ocorreu um erro. Tente novamente.');
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setSuccessMsg(null);

        form.lotId = selectedLotId;

        const formattedForm = formatForm(form);
        const errors = validateFormData(formattedForm, quantity);

        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            setLoading(false);
            return;
        }

        await sendForm(formattedForm, setForm, setErrors, setSuccessMsg);
        setLoading(false);
    }

    useEffect(() => {
        async function initLots() {
            const availableLots = await findAllLots();
            setLots(availableLots);

            const lot = availableLots
                .sort((a, b) => a.price - b.price)
                .filter((it) => it.isActive)[0].name;

            setSelectedLotId(lot);
        }

        initLots();
    }, []);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            {successMsg && (
                <Alert severity={successMsg.startsWith("In") ? "success" : "error"}>
                    {successMsg}
                </Alert>
            )}
            <form className="ticketForm" onSubmit={handleSubmit}>
                <Box marginBottom="1rem" component="div">
                    <TextField
                        label="Nome completo"
                        value={form?.name}
                        onChange={(it) => handleChange('name', it.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                        fullWidth
                        required
                    />
                </Box>
                <Box marginBottom="1rem" component="div">
                    <TextField
                        label="Telefone"
                        value={form?.phone}
                        onChange={(it) => handleChange('phone', it.target.value)}
                        error={!!errors.phone}
                        helperText={errors.phone}
                        fullWidth
                        required
                    />
                </Box>
                <Box mb={2}>
                    <DatePicker
                        className="date"
                        label="Data de nascimento"
                        value={form.birthdate ? dayjs(form.birthdate) : null}
                        onChange={(date) => {
                            handleChange("birthdate", date?.toDate() ?? null);
                        }}

                        format="DD/MM/YYYY"
                        slotProps={{
                            textField: {
                                required: true,
                                error: !!errors.birthdate,
                                helperText: errors.birthdate,
                            },
                        }}
                    />
                </Box>
                <Box mb={2}>
                    <TextField
                        label="Quantidade de convites"
                        type="number"
                        value={quantity ?? 1}
                        onChange={(it) => setQuantity(Number(it.target.value))}
                        inputProps={{ min: 1 }}
                        fullWidth
                        required
                    />
                </Box>
                <Box marginBottom="1rem" component="div">
                    <TextField
                        select
                        value={selectedLotId}
                        onChange={(e) => setSelectedLotId(e.target.value)}
                        fullWidth
                        required
                        SelectProps={{ native: true }}
                        margin="normal"
                    >
                        {lots
                            .filter(it => it.isActive && it.quantity > 0)
                            .sort((a, b) => a.price - b.price)
                            .map((lot) => (
                                <option key={lot.id} value={lot.id}>
                                    {lot.name} - R$ {lot.price} ({lot.quantity} disponíveis)
                                </option>
                            ))}
                    </TextField>
                </Box>

                <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Comprar"}
                </Button>
            </form>
        </LocalizationProvider>
    );
}
