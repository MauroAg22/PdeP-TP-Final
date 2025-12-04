import { Tarea } from "./Tarea";
import { ESTADO } from "../lib/constantes";

// Tipo para la lista de tareas (usando tupla de solo lectura)
export type ToDoList = readonly Tarea[];

// Constructor funcional - crea una lista vacía
export const crearToDoList = (): ToDoList => [];

// Obtener todas las tareas
export const getTareas = (lista: ToDoList): Tarea[] => [...lista];

// Obtener una tarea por ID
export const getUnaTarea = (lista: ToDoList, id: number): Tarea | undefined =>
    lista.find(tarea => tarea.id === id);

// Agregar una tarea (retorna una nueva lista)
export const agregarTarea = (lista: ToDoList, tarea: Tarea): ToDoList => {
    const nuevoId = lista.length > 0 ? Math.max(...lista.map(t => t.id)) + 1 : 0;
    return [...lista, { ...tarea, id: nuevoId }];
};

// Filtrar tareas por estado
export const filtrarPorEstado = (lista: ToDoList, idEstado: number): Tarea[] =>
    lista.filter(tarea => tarea.estado === ESTADO[idEstado]);

// Filtrar tareas por prioridad
export const filtrarPorPrioridad = (lista: ToDoList, prioridad: string): Tarea[] =>
    lista.filter(tarea => tarea.prioridad === prioridad);

// Actualizar una tarea en la lista
export const actualizarTareaEnLista = (lista: ToDoList, tareaActualizada: Tarea): ToDoList =>
    lista.map(tarea => tarea.id === tareaActualizada.id ? tareaActualizada : tarea) as ToDoList;

// Eliminar una tarea de la lista
export const eliminarTarea = (lista: ToDoList, id: number): ToDoList =>
    lista.filter(tarea => tarea.id !== id) as ToDoList;

// Contar tareas por estado
export const contarPorEstado = (lista: ToDoList, idEstado: number): number =>
    lista.filter(tarea => tarea.estado === ESTADO[idEstado]).length;

// Obtener todas las tareas
export const obtenerTodasLasTareas = (lista: ToDoList): Tarea[] => [...lista];
