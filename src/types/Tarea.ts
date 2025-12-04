import { PRIORIDAD, ESTADO } from "../lib/constantes";

// Tipo inmutable para representar una Tarea
export interface Tarea {
    readonly id: number;
    readonly titulo: string;
    readonly descripcion: string;
    readonly prioridad: typeof PRIORIDAD[number];
    readonly estado: typeof ESTADO[number];
    readonly fechaCreacion: Date;
    readonly fechaVencimiento: Date;
    readonly fechaUltimaEdicion: Date;
}

// Constructor funcional
export const crearTarea = (
    titulo: string,
    descripcion: string,
    prioridad: typeof PRIORIDAD[number],
    estado: typeof ESTADO[number],
    fechaCreacion: Date | null,
    fechaVencimiento: Date,
    fechaUltimaEdicion: Date | null
): Tarea => {
    const ahora = new Date();
    
    return {
        id: 0,
        titulo,
        descripcion,
        prioridad,
        estado,
        fechaCreacion: fechaCreacion || ahora,
        fechaVencimiento,
        fechaUltimaEdicion: fechaUltimaEdicion || ahora
    };
};

// Funciones para actualizar propiedades (retornan una nueva Tarea)
export const actualizarTareaId = (tarea: Tarea, id: number): Tarea => ({
    ...tarea,
    id
});

export const actualizarTareaTitulo = (tarea: Tarea, titulo: string): Tarea => ({
    ...tarea,
    titulo
});

export const actualizarTareaDescripcion = (tarea: Tarea, descripcion: string): Tarea => ({
    ...tarea,
    descripcion
});

export const actualizarTareaPrioridad = (tarea: Tarea, prioridad: typeof PRIORIDAD[number]): Tarea => ({
    ...tarea,
    prioridad
});

export const actualizarTareaEstado = (tarea: Tarea, estado: typeof ESTADO[number]): Tarea => ({
    ...tarea,
    estado,
    fechaUltimaEdicion: new Date()
});

export const actualizarTareaFechaVencimiento = (tarea: Tarea, fecha: Date): Tarea => ({
    ...tarea,
    fechaVencimiento: fecha,
    fechaUltimaEdicion: new Date()
});

// Getters (funciones puras)
export const getTitulo = (tarea: Tarea): string => tarea.titulo;
export const getDescripcion = (tarea: Tarea): string => tarea.descripcion;
export const getPrioridad = (tarea: Tarea): typeof PRIORIDAD[number] => tarea.prioridad;
export const getEstado = (tarea: Tarea): typeof ESTADO[number] => tarea.estado;
export const getFechaCreacion = (tarea: Tarea): Date => tarea.fechaCreacion;
export const getFechaVencimiento = (tarea: Tarea): Date => tarea.fechaVencimiento;
export const getFechaUltimaEdicion = (tarea: Tarea): Date => tarea.fechaUltimaEdicion;
export const getId = (tarea: Tarea): number => tarea.id;
