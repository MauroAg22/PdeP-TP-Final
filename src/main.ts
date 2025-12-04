import { PRIORIDAD, ESTADO } from "./lib/constantes";
import type { Tarea } from "./types/Tarea";
import type { ToDoList } from "./types/ToDoList";
import * as TareaFuncs from "./types/Tarea";
import * as ToDoListFuncs from "./types/ToDoList";
import { esFechaValida, comprobarFormatoAnio, comprobarFormatoMes, comprobarFormatoDia, fechaToString, stringToFecha, validarFechaString } from "./lib/funciones";
import { input, close } from "./lib/input";
import fs from 'fs/promises';
import path from 'path';

// ============== TIPOS Y INTERFACES ==============

interface TareaJSON {
    titulo: string;
    descripcion: string;
    prioridad: string;
    estado: string;
    fechaCreacion: string;
    fechaUltimaEdicion: string;
    fechaVencimiento: string;
}

interface EstadoApp {
    lista: ToDoList;
    continuar: boolean;
}

// ============== CONSTANTES ==============

const filePath = path.join(__dirname, '../src/tasks.json');

// ============== FUNCIONES DE PERSISTENCIA ==============

const cargarTareasDesdeArchivo = async (): Promise<Tarea[]> => {
    try {
        try {
            await fs.access(filePath);
        } catch {
            console.log("El archivo tasks.json no existe. Se iniciará una lista vacía.");
            return [];
        }

        const dataRaw = await fs.readFile(filePath, 'utf-8');
        const tareasJSON: TareaJSON[] = JSON.parse(dataRaw);

        const isValidDate = (d: any): d is Date => d instanceof Date && !isNaN(d.getTime());
        const parseDateSafe = (s?: string): Date | null => {
            if (!s) return null;
            const d = new Date(s);
            return isValidDate(d) ? d : null;
        };

        const tareasConvertidas = tareasJSON.map(item => {
            const creacion = parseDateSafe(item.fechaCreacion);
            const vencimiento = parseDateSafe(item.fechaVencimiento) || new Date();
            const ultima = parseDateSafe(item.fechaUltimaEdicion);

            return TareaFuncs.crearTarea(
                item.titulo,
                item.descripcion,
                item.prioridad as any,
                item.estado as any,
                creacion,
                vencimiento,
                ultima
            );
        });

        console.log(`\nSe han cargado ${tareasConvertidas.length} tareas exitosamente desde el archivo.\n`);
        return tareasConvertidas;

    } catch (error) {
        console.error("Error al leer el archivo de tareas:", error);
        return [];
    }
};

const guardarTareasEnArchivo = async (lista: ToDoList): Promise<void> => {
    try {
        const isValidDate = (d: any): d is Date => d instanceof Date && !isNaN(d.getTime());
        const toISOStringSafe = (d: any): string | null => isValidDate(d) ? d.toISOString() : null;

        const datosAGuardar = lista.map(tarea => ({
            titulo: tarea.titulo,
            descripcion: tarea.descripcion,
            prioridad: tarea.prioridad,
            estado: tarea.estado,
            fechaCreacion: toISOStringSafe(tarea.fechaCreacion),
            fechaUltimaEdicion: toISOStringSafe(tarea.fechaUltimaEdicion),
            fechaVencimiento: toISOStringSafe(tarea.fechaVencimiento)
        }));

        await fs.writeFile(filePath, JSON.stringify(datosAGuardar, null, 4));
    } catch (error) {
        console.error("Error al guardar archivo:", error);
    }
};

// ============== FUNCIONES DE UI (MENÚS) ==============

const menuPrincipal = (): void => {
    console.log('-------- Menú de Opciones --------\n');
    console.log('[1] Mostrar tareas');
    console.log('[2] Agregar tarea');
    console.log('[3] Buscar tarea');
    console.log('[0] Salir\n');
    console.log('----------------------------------\n');
    console.log('Ingrese una opción.\n');
};

const tareasAVer = (): void => {
    console.log("---- ¿Qué tareas deseas ver? -----\n");
    console.log("[1] Todas");
    console.log("[2] Pendientes");
    console.log("[3] En progreso");
    console.log("[4] Completadas");
    console.log("[5] Canceladas\n");
    console.log("[0] Volver al menú principal");
    console.log('----------------------------------\n');
    console.log('Ingrese una opción.\n');
};

// ============== FUNCIONES DE PRESENTACIÓN ==============

const mostrarTareas = (tareas: Tarea[]): void => {
    if (tareas.length === 0) {
        console.log("No hay tareas para mostrar.\n");
        return;
    }
    console.log('--------------- Tus tareas son las siguientes ----------------------\n');
    tareas.forEach(tarea => {
        console.log(`[${tarea.id}] - ${tarea.titulo}`);
    });
    console.log('\n--------------------------------------------------------------------\n');
};

const mostrarTareasPorEstado = (tareas: Tarea[], idEstado: number): void => {
    if (tareas.length === 0) {
        console.log("No hay tareas con ese estado.\n");
        return;
    }
    console.log(`---------- Tus tareas en estado "${ESTADO[idEstado].toUpperCase()}" son las siguientes ----------------\n`);
    tareas.forEach(tarea => {
        console.log(`[${tarea.id}] - ${tarea.titulo}`);
    });
    console.log('\n-----------------------------------------------------------------------------------\n');
};

const mostrarDetallesDeTarea = (tarea: Tarea): void => {
    console.log('--------------------------------------------------------------------');
    console.log('                         Detalles de la Tarea');
    console.log('--------------------------------------------------------------------');
    console.log(`\nTítulo: ${tarea.titulo}`);
    console.log(`Descripción: ${tarea.descripcion}`);
    console.log(`Prioridad: ${tarea.prioridad}`);
    console.log(`Estado: ${tarea.estado}`);
    console.log(`Fecha de Creación: ${tarea.fechaCreacion.toLocaleDateString()}`);
    console.log(`Fecha de Vencimiento: ${tarea.fechaVencimiento.toLocaleDateString()}`);
    console.log('\n--------------------------------------------------------------------\n');
};

// ============== FUNCIONES DE VALIDACIÓN DE ENTRADA ==============

const solicitarTitulo = async (): Promise<string> => {
    let valido = false;
    let titulo = "";
    
    while (!valido) {
        console.clear();
        console.log("Ingrese el título.\n");
        titulo = await input('> ');
        
        if (titulo.trim() === "") {
            console.log("\nEl título no puede estar vacío. Intente nuevamente.\n");
            await input('Presione "Enter" para continuar...');
        } else {
            valido = true;
        }
    }
    
    return titulo;
};

const solicitarDescripcion = async (): Promise<string> => {
    let valido = false;
    let descripcion = "";
    
    while (!valido) {
        console.clear();
        console.log("Ingrese la descripción.\n");
        descripcion = await input('> ');
        
        if (descripcion.trim() === "") {
            console.log("\nLa descripción no puede estar vacía. Intente nuevamente.\n");
            await input('Presione "Enter" para continuar...');
        } else {
            valido = true;
        }
    }
    
    return descripcion;
};

const solicitarPrioridad = async (): Promise<typeof PRIORIDAD[number]> => {
    let valido = false;
    let opcion = 0;
    
    while (!valido) {
        console.clear();
        console.log("Ingrese la prioridad.\n");
        console.log(`[1] - ${PRIORIDAD[0]}`);
        console.log(`[2] - ${PRIORIDAD[1]}`);
        console.log(`[3] - ${PRIORIDAD[2]}\n`);
        
        opcion = parseInt(await input('> '));
        
        if (opcion >= 1 && opcion <= 3 && !isNaN(opcion)) {
            valido = true;
        } else {
            console.log("\nPrioridad no válida. Intente nuevamente.\n");
            await input('Presione "Enter" para continuar...');
        }
    }
    
    return PRIORIDAD[opcion - 1];
};

const solicitarEstado = async (): Promise<typeof ESTADO[number]> => {
    let valido = false;
    let opcion = 0;
    
    while (!valido) {
        console.clear();
        console.log("Ingrese el estado.\n");
        console.log(`[1] - ${ESTADO[0]}`);
        console.log(`[2] - ${ESTADO[1]}`);
        console.log(`[3] - ${ESTADO[2]}`);
        console.log(`[4] - ${ESTADO[3]}\n`);
        
        opcion = parseInt(await input('> '));
        
        if (opcion >= 1 && opcion <= 4 && !isNaN(opcion)) {
            valido = true;
        } else {
            console.log("\nEstado no válido. Intente nuevamente.\n");
            await input('Presione "Enter" para continuar...');
        }
    }
    
    return ESTADO[opcion - 1];
};

const solicitarFecha = async (mensaje: string): Promise<Date> => {
    let valido = false;
    let fecha: Date | null = null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    while (!valido) {
        let anio = "", mes = "", dia = "";
        
        // Solicitar año
        while (!comprobarFormatoAnio(anio) || parseInt(anio) < hoy.getFullYear()) {
            console.clear();
            console.log(`${mensaje} - Año (YYYY)\n`);
            anio = await input('> ');
            
            if (!comprobarFormatoAnio(anio)) {
                console.log("\nFormato no válido. Intente nuevamente.\n");
                await input('Presione "Enter" para continuar...');
            } else if (parseInt(anio) < hoy.getFullYear()) {
                console.log("\nEl año debe ser el actual o futuro. Intente nuevamente.\n");
                await input('Presione "Enter" para continuar...');
            }
        }
        
        // Solicitar mes
        while (!comprobarFormatoMes(mes)) {
            console.clear();
            console.log(`${mensaje} - Mes (MM)\n`);
            mes = await input('> ');
            
            if (!comprobarFormatoMes(mes)) {
                console.log("\nFormato no válido. Intente nuevamente.\n");
                await input('Presione "Enter" para continuar...');
            }
        }
        
        // Solicitar día
        while (!comprobarFormatoDia(dia)) {
            console.clear();
            console.log(`${mensaje} - Día (DD)\n`);
            dia = await input('> ');
            
            if (!comprobarFormatoDia(dia)) {
                console.log("\nFormato no válido. Intente nuevamente.\n");
                await input('Presione "Enter" para continuar...');
            }
        }
        
        // Validar fecha completa
        if (!validarFechaString(anio, mes, dia)) {
            console.log("\nFecha no válida. Intente nuevamente.\n");
            await input('Presione "Enter" para continuar...');
            continue;
        }
        
        fecha = stringToFecha(anio, mes, dia);
        
        if (fecha && fecha.getTime() <= hoy.getTime()) {
            console.log("\nLa fecha debe ser futura. Intente nuevamente.\n");
            await input('Presione "Enter" para continuar...');
            continue;
        }
        
        valido = true;
    }
    
    return fecha!;
};

// ============== FUNCIONES DE LÓGICA DE NEGOCIO ==============

const crearNuevaTarea = async (): Promise<Tarea> => {
    const titulo = await solicitarTitulo();
    const descripcion = await solicitarDescripcion();
    const prioridad = await solicitarPrioridad();
    const estado = await solicitarEstado();
    const fechaVencimiento = await solicitarFecha("Ingrese la fecha de vencimiento");
    
    return TareaFuncs.crearTarea(
        titulo,
        descripcion,
        prioridad,
        estado,
        null,
        fechaVencimiento,
        null
    );
};

const buscarTareas = (lista: ToDoList, termino: string): Tarea[] => 
    lista.filter(tarea => 
        tarea.titulo.toLowerCase().includes(termino.toLowerCase()) ||
        tarea.descripcion.toLowerCase().includes(termino.toLowerCase())
    );

// ============== MENÚ DE OPCIONES ==============

const manejarMostrarTareas = async (estado: EstadoApp): Promise<EstadoApp> => {
    if (estado.lista.length === 0) {
        console.log("No hay tareas cargadas.\n");
        await input('Presione "Enter" para continuar...');
        return estado;
    }

    let opcionMenu = -1;

    while (opcionMenu !== 0) {
        console.clear();
        tareasAVer();
        opcionMenu = parseInt(await input('> '));

        if (opcionMenu === 1) {
            console.clear();
            mostrarTareas(ToDoListFuncs.obtenerTodasLasTareas(estado.lista));

            // Permitir seleccionar una tarea para ver/editar
            console.log('\nIngrese el ID de la tarea para ver/editar (o 0 para volver):');
            const idSeleccion = parseInt(await input('> '));

            if (!isNaN(idSeleccion) && idSeleccion !== 0) {
                let tarea = ToDoListFuncs.obtenerTodasLasTareas(estado.lista).find(t => t.id === idSeleccion);
                if (!tarea) {
                    console.log('\nID no encontrado.');
                    await input('Presione "Enter" para continuar...');
                } else {
                    console.clear();
                    mostrarDetallesDeTarea(tarea);

                    console.log("¿Desea editar esta tarea?\n[1] Sí\n[2] No\n");
                    const quiere = parseInt(await input('> '));
                    if (quiere === 1) {
                        let editar = true;
                        while (editar) {
                            console.clear();
                            mostrarDetallesDeTarea(tarea);
                            console.log('[1] Título');
                            console.log('[2] Descripción');
                            console.log('[3] Prioridad');
                            console.log('[4] Estado');
                            console.log('[5] Fecha de vencimiento');
                            console.log('[0] Volver\n');
                            console.log('Seleccione el campo a editar:');

                            const campo = parseInt(await input('> '));
                            let tareaActualizada: Tarea = tarea;

                            switch (campo) {
                                case 1: {
                                    const nuevo = await solicitarTitulo();
                                    tareaActualizada = { ...TareaFuncs.actualizarTareaTitulo(tareaActualizada, nuevo), fechaUltimaEdicion: new Date() };
                                    break;
                                }
                                case 2: {
                                    const nuevo = await solicitarDescripcion();
                                    tareaActualizada = { ...TareaFuncs.actualizarTareaDescripcion(tareaActualizada, nuevo), fechaUltimaEdicion: new Date() };
                                    break;
                                }
                                case 3: {
                                    const nuevo = await solicitarPrioridad();
                                    tareaActualizada = { ...TareaFuncs.actualizarTareaPrioridad(tareaActualizada, nuevo), fechaUltimaEdicion: new Date() };
                                    break;
                                }
                                case 4: {
                                    const nuevo = await solicitarEstado();
                                    tareaActualizada = { ...TareaFuncs.actualizarTareaEstado(tareaActualizada, nuevo), fechaUltimaEdicion: new Date() };
                                    break;
                                }
                                case 5: {
                                    const nuevaFecha = await solicitarFecha('Ingrese la nueva fecha de vencimiento');
                                    tareaActualizada = { ...TareaFuncs.actualizarTareaFechaVencimiento(tareaActualizada, nuevaFecha), fechaUltimaEdicion: new Date() };
                                    break;
                                }
                                case 0: {
                                    editar = false;
                                    break;
                                }
                                default: {
                                    console.log('\nOpción no válida');
                                    await input('Presione "Enter" para continuar...');
                                }
                            }

                                if (tareaActualizada.id !== tarea.id || tareaActualizada !== tarea) {
                                // Reemplazar en la lista y guardar
                                const listaActualizada = ToDoListFuncs.actualizarTareaEnLista(estado.lista, tareaActualizada);
                                await guardarTareasEnArchivo(listaActualizada);
                                estado = { ...estado, lista: listaActualizada };
                                // actualizar referencia local a la tarea para seguir editando si el usuario quiere
                                // buscar por id en la nueva lista
                                    tarea = listaActualizada.find(t => t.id === tarea!.id)!;
                                console.log('\nCampo editado con éxito.');
                                await input('Presione "Enter" para continuar...');
                            }
                        }
                    }
                }
            }

        } else if (opcionMenu >= 2 && opcionMenu <= 5) {
            console.clear();
            const idEstado = opcionMenu - 2;
            const tareasFiltradas = ToDoListFuncs.filtrarPorEstado(estado.lista, idEstado);
            mostrarTareasPorEstado(tareasFiltradas, idEstado);
            await input('Presione "Enter" para continuar...');
        } else if (opcionMenu === 0) {
            break;
        } else {
            console.log("\nOpción no válida. Intente nuevamente.\n");
            await input('Presione "Enter" para continuar...');
        }
    }

    console.clear();
    return estado;
};

const manejarAgregarTarea = async (estado: EstadoApp): Promise<EstadoApp> => {
    console.clear();
    const nuevaTarea = await crearNuevaTarea();
    
    const listaActualizada = ToDoListFuncs.agregarTarea(estado.lista, nuevaTarea);
    await guardarTareasEnArchivo(listaActualizada);
    
    console.log("\nTarea agregada con éxito.\n");
    await input('Presione "Enter" para continuar...');
    console.clear();
    
    return { ...estado, lista: listaActualizada };
};

const manejarBuscarTareas = async (estado: EstadoApp): Promise<EstadoApp> => {
    console.clear();
    
    if (estado.lista.length === 0) {
        console.log("No hay tareas cargadas.\n");
        await input('Presione "Enter" para continuar...');
        console.clear();
        return estado;
    }
    
    console.log("Por favor, ingrese el término de búsqueda.\n");
    const termino = await input('> ');
    
    const tareasEncontradas = buscarTareas(estado.lista, termino);
    
    if (tareasEncontradas.length === 0) {
        console.log("\nNo se encontraron tareas que coincidan con el término de búsqueda.\n");
    } else {
        console.clear();
        console.log("Las tareas encontradas son las siguientes:\n");
        tareasEncontradas.forEach(tarea => {
            console.log(`[${tarea.id}] - ${tarea.titulo}`);
        });
    }
    
    await input('\nPresione "Enter" para continuar...');
    console.clear();
    
    return estado;
};

// ============== FUNCIÓN PRINCIPAL ==============

const main = async (): Promise<void> => {
    console.clear();
    
    console.log("Cargando tareas...");
    const tareasDelArchivo = await cargarTareasDesdeArchivo();
    
    // Crear lista con IDs asignados
    let lista = ToDoListFuncs.crearToDoList();
    tareasDelArchivo.forEach((tarea, index) => {
        lista = ToDoListFuncs.agregarTarea(lista, tarea);
    });
    
    await input('Presione "Enter" para continuar...');
    console.clear();
    
    // Loop principal
    let estado: EstadoApp = { lista, continuar: true };
    
    while (estado.continuar) {
        menuPrincipal();
        const opcion = parseInt(await input('> '));
        
        switch (opcion) {
            case 1:
                estado = await manejarMostrarTareas(estado);
                break;
            case 2:
                estado = await manejarAgregarTarea(estado);
                break;
            case 3:
                estado = await manejarBuscarTareas(estado);
                break;
            case 0:
                estado.continuar = false;
                console.clear();
                break;
            default:
                console.clear();
                break;
        }
    }
    
    close();
};

main();
