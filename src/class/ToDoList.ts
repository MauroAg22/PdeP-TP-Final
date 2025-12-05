import { Tarea } from "./Tarea";
import { ESTADO } from "../lib/constantes";
// import { fechaToString, comprobarFormatoAnio, comprobarFormatoMes, comprobarFormatoDia } from "../lib/funciones";

export class ToDoList {
    private tareas: Tarea[];

    constructor() {
        this.tareas = [];
    }

    getTareas(): Tarea[] { return this.tareas; }
    setTareas(tareas: Tarea[]): void { this.tareas = tareas; }
    getUnaTarea(id: string): Tarea { return this.tareas.find(t => t.getId() === id)!; }

    agregarTarea(tarea: Tarea): void {
        this.tareas[this.tareas.length] = tarea;
    }


    arrayFiltrarPorEstado(idEstado: number): Tarea[] {
        let arregloAuxiliar: Tarea[] = [];
        for (let tarea of this.tareas) {
            if (tarea.getEstado() === ESTADO[idEstado]) {
                arregloAuxiliar[arregloAuxiliar.length] = tarea;
            }
        }
        return arregloAuxiliar;
    }

    mostrarDetallesDeTarea(idTarea: string): void {
        const tarea = this.getUnaTarea(idTarea);
        console.log('--------------------------------------------------------------------');
        console.log('                         Detalles de la Tarea');
        console.log('--------------------------------------------------------------------');
        console.log(`\nTítulo: ${tarea.getTitulo()}`);
        console.log(`Descripción: ${tarea.getDescripcion()}`);
        console.log(`Prioridad: ${tarea.getPrioridad()}`);
        console.log(`Estado: ${tarea.getEstado()}`);
        console.log(`Fecha de Creación: ${tarea.getFechaCreacion().toLocaleDateString()}`);
        console.log(`Fecha de Vencimiento: ${tarea.getFechaVencimiento().toLocaleDateString()}`);
        console.log('\n--------------------------------------------------------------------\n');
    }

    eliminarTarea(id: string): boolean {
        const index = this.tareas.findIndex(t => t.getId() === id);
        if (index === -1) return false;
        this.tareas.splice(index, 1);
        return true;
    }

    ordenarPor(criterio: 'titulo' | 'fechaVencimiento' | 'fechaCreacion' | 'dificultad', asc: boolean = true): void {
        const factor = asc ? 1 : -1;
        this.tareas.sort((a, b) => {
            switch (criterio) {
                case 'titulo':
                    return factor * a.getTitulo().localeCompare(b.getTitulo(), undefined, { sensitivity: 'base' });
                case 'fechaVencimiento':
                    return factor * (a.getFechaVencimiento().getTime() - b.getFechaVencimiento().getTime());
                case 'fechaCreacion':
                    return factor * (a.getFechaCreacion().getTime() - b.getFechaCreacion().getTime());
                case 'dificultad':
                    return factor * (a.getDificultad() - b.getDificultad());
                default:
                    return 0;
            }
        });
    }

    // -------------------- Estadísticas --------------------
    getTotalTareas(): number {
        return this.tareas.length;
    }

    getCantidadPorEstado(): { [estado: string]: number } {
        const contador: { [estado: string]: number } = {};
        for (const estado of ESTADO) {
            contador[estado] = 0;
        }
        for (const tarea of this.tareas) {
            const e = tarea.getEstado();
            contador[e] = (contador[e] || 0) + 1;
        }
        return contador;
    }

    getPorcentajePorEstado(): { [estado: string]: number } {
        const total = this.getTotalTareas();
        const cantidades = this.getCantidadPorEstado();
        const porcentajes: { [estado: string]: number } = {};
        if (total === 0) {
            for (const k of Object.keys(cantidades)) porcentajes[k] = 0;
            return porcentajes;
        }
        for (const k of Object.keys(cantidades)) {
            porcentajes[k] = parseFloat(((cantidades[k] / total) * 100).toFixed(2));
        }
        return porcentajes;
    }

    getCantidadPorDificultad(): { [dificultad: number]: number } {
        const contador: { [dificultad: number]: number } = {};
        for (const tarea of this.tareas) {
            const d = tarea.getDificultad();
            contador[d] = (contador[d] || 0) + 1;
        }
        return contador;
    }

    getPorcentajePorDificultad(): { [dificultad: number]: number } {
        const total = this.getTotalTareas();
        const cantidades = this.getCantidadPorDificultad();
        const porcentajes: { [dificultad: number]: number } = {};
        if (total === 0) {
            for (const k of Object.keys(cantidades)) porcentajes[Number(k)] = 0;
            return porcentajes;
        }
        for (const k of Object.keys(cantidades)) {
            const ki = Number(k);
            porcentajes[ki] = parseFloat(((cantidades[ki] / total) * 100).toFixed(2));
        }
        return porcentajes;
    }
}
