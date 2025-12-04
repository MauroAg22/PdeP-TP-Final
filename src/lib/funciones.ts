// Patrones regex para validación
const formatoValidoAnio = /^\d{4}$/;
const formatoValidoMes = /^(0[1-9]|1[0-2])$/;
const formatoValidoDia = /^(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/;

// Funciones puras de validación
export const comprobarFormatoAnio = (anio: string): boolean =>
    formatoValidoAnio.test(anio.toString());

export const comprobarFormatoMes = (mes: string): boolean =>
    formatoValidoMes.test(mes.toString());

export const comprobarFormatoDia = (dia: string): boolean =>
    formatoValidoDia.test(dia.toString());

// Función pura para convertir fecha a string
export const fechaToString = (anio: string, mes: string, dia: string): string =>
    `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;

// Función pura para validar si una fecha es válida
export const esFechaValida = (anio: number, mes: number, dia: number): boolean => {
    const date = new Date(anio, mes - 1, dia);
    return date.getFullYear() === anio &&
        (date.getMonth() + 1) === mes &&
        date.getDate() === dia;
};

// Función pura para validar fecha con string
export const validarFechaString = (anio: string, mes: string, dia: string): boolean =>
    comprobarFormatoAnio(anio) &&
    comprobarFormatoMes(mes) &&
    comprobarFormatoDia(dia) &&
    esFechaValida(parseInt(anio), parseInt(mes), parseInt(dia));

// Función pura para convertir string a Date
export const stringToFecha = (anio: string, mes: string, dia: string): Date | null => {
    if (!validarFechaString(anio, mes, dia)) {
        return null;
    }
    return new Date(`${anio}-${mes}-${dia}T03:00:00Z`);
};

// Función pura para formatear fecha a string legible
export const formatearFecha = (fecha: Date): string =>
    fecha.toLocaleDateString('es-ES');
