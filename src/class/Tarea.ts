import { PRIORIDAD, ESTADO } from "../lib/constantes";
import { fechaToString } from "../lib/funciones";

export class Tarea {
    private _id: number = 0;
    private _titulo: string;
    private _descripcion: string;
    private _prioridad: string;
    private _estado: string;
    private _fechaCreacion: Date;
    private _fechaVencimiento: Date;
    private _fechaUltimaEdicion: Date;

    // ----------------------------------------- Constructor -----------------------------------------

    constructor(_titulo: string, _descripcion: string, _prioridad: typeof PRIORIDAD[number], _estado: typeof ESTADO[number], _fechaCreacion: Date | null, _fechaVencimiento: Date, _fechaUltimaEdicion: Date | null) {
        let day: Date = new Date();
        this._titulo = _titulo;
        this._descripcion = _descripcion;
        this._prioridad = _prioridad;
        this._estado = _estado;

        if (_fechaCreacion === null) {
            this._fechaCreacion = new Date(fechaToString(day.getFullYear().toString(), (day.getMonth() + 1).toString(), day.getDate().toString()) + "T03:00:00Z");
        } else {
            this._fechaCreacion = new Date(_fechaCreacion);
        }
        
        this._fechaVencimiento = _fechaVencimiento;

        if (_fechaUltimaEdicion === null) {
            this._fechaUltimaEdicion = new Date(fechaToString(day.getFullYear().toString(), (day.getMonth() + 1).toString(), day.getDate().toString()) + "T03:00:00Z");
        } else {
            this._fechaUltimaEdicion = new Date(_fechaUltimaEdicion);
        }
        
    }


    // ----------------------------------------- Setters -----------------------------------------

    setId(id: number): void { this._id = id; }
    setTitulo(titulo: string): void { this._titulo = titulo; }
    setDescripcion(descripcion: string): void { this._descripcion = descripcion; }
    setPrioridad(prioridad: typeof PRIORIDAD[number]): void { this._prioridad = prioridad; }
    setEstado(estado: typeof ESTADO[number]): void { this._estado = estado; }
    setFechaVencimiento(fechaVencimiento: Date): void { this._fechaVencimiento = fechaVencimiento; }
    setFechaUltimaEdicion(fechaUltimaEdicion: Date): void { this._fechaUltimaEdicion = fechaUltimaEdicion }

    // ----------------------------------------- Getters -----------------------------------------

    getId(): number { return this._id; }
    getTitulo(): string { return this._titulo; }
    getDescripcion(): string { return this._descripcion; }
    getPrioridad(): typeof PRIORIDAD[number] { return this._prioridad; }
    getEstado(): typeof ESTADO[number] { return this._estado; }
    getFechaCreacion(): Date { return this._fechaCreacion; }
    getFechaVencimiento(): Date { return this._fechaVencimiento; }
    getFechaUltimaEdicion(): Date { return this._fechaUltimaEdicion; }

}

