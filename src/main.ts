import { PRIORIDAD, ESTADO } from "./lib/constantes";
import { Tarea } from "./class/Tarea";
import { ToDoList } from "./class/ToDoList";
import { esFechaValida, comprobarFormatoAnio, comprobarFormatoMes, comprobarFormatoDia, fechaToString } from "./lib/funciones";
import { input, close } from "./lib/input";
import fs from 'fs/promises';
import path from 'path';



// Menús de opciones
function menuPrincipal(): void {
    console.log('-------- Menú de Opciones --------\n');
    console.log('[1] Mostrar tareas');
    console.log('[2] Agregar tarea');
    console.log('[3] Buscar tarea');
    console.log('[4] Eliminar tarea');
    console.log('[5] Ordenar tareas');
    console.log('[6] Estadísticas');
    console.log('[0] Salir\n');
    console.log('----------------------------------\n');
    console.log('Ingrese una opción.\n');
}

function tareasAVer(): void {
    console.log("---- ¿Qué tareas deseas ver? -----\n");
    console.log("[1] Todas");
    console.log("[2] Pendientes");
    console.log("[3] En progreso");
    console.log("[4] Completadas");
    console.log("[5] Canceladas\n");
    console.log("[0] Volver al menú principal");
    console.log('----------------------------------\n');
    console.log('Ingrese una opción.\n');
}

interface TareaJSON {
    titulo: string;
    descripcion: string;
    prioridad: string;
    estado: string;
    id?: string;
    dificultad?: number;
    fechaCreacion: string;
    fechaUltimaEdicion: string;
    fechaVencimiento: string;
}

// Ruta al archivo json
const filePath = path.join(__dirname, '../src/tasks.json');

async function cargarTareasDesdeArchivo(): Promise<Tarea[]> {
    try {
        try {
            await fs.access(filePath);
        } catch {
            console.log("El archivo tasks.json no existe. Se iniciará una lista vacía.");
            return [];
        }

        const dataRaw = await fs.readFile(filePath, 'utf-8');
        const tareasJSON: TareaJSON[] = JSON.parse(dataRaw);
        
        const tareasConvertidas: Tarea[] = [];

        tareasJSON.forEach((item, index) => {
            // Parseo seguro de fechas: si la propiedad no existe o es inválida, usamos null o una fecha por defecto
            let fechaCreacion: Date | null = null;
            if (item.fechaCreacion) {
                const d = new Date(item.fechaCreacion);
                fechaCreacion = isNaN(d.getTime()) ? null : d;
            }

            let fechaUltimaEdicion: Date | null = null;
            if (item.fechaUltimaEdicion) {
                const d = new Date(item.fechaUltimaEdicion);
                fechaUltimaEdicion = isNaN(d.getTime()) ? null : d;
            }

            let fechaVencimiento: Date = new Date();
            if (item.fechaVencimiento) {
                const d = new Date(item.fechaVencimiento);
                fechaVencimiento = isNaN(d.getTime()) ? new Date() : d;
            }

            const nuevaTarea = new Tarea(
                item.titulo,
                item.descripcion,
                item.prioridad,
                item.estado,
                fechaCreacion,
                fechaVencimiento,
                fechaUltimaEdicion
                , item.id
                , (item as any).dificultad
            );
            
            tareasConvertidas.push(nuevaTarea);
        });

        console.log(`\n Se han cargado ${tareasConvertidas.length} tareas exitosamente desde el archivo.\n`);
        return tareasConvertidas;

    } catch (error) {
        console.error("Error al leer el archivo de tareas:", error);
        return [];
    }
}
async function guardarTareasEnArchivo(listaTareas: Tarea[]): Promise<void> {
    try {
        const datosAGuardar = listaTareas.map(unaTarea => {
            return {
                id: unaTarea.getId(),
                titulo: unaTarea.getTitulo(),
                descripcion: unaTarea.getDescripcion(),
                prioridad: unaTarea.getPrioridad(),
                estado: unaTarea.getEstado(),
                dificultad: unaTarea.getDificultad(),
                fechaCreacion: unaTarea.getFechaCreacion() ? unaTarea.getFechaCreacion().toISOString() : null,
                fechaUltimaEdicion: unaTarea.getFechaUltimaEdicion() ? unaTarea.getFechaUltimaEdicion().toISOString() : null,
                fechaVencimiento: unaTarea.getFechaVencimiento() ? unaTarea.getFechaVencimiento().toISOString() : null
            };
        });

        await fs.writeFile(filePath, JSON.stringify(datosAGuardar, null, 4));
    } catch (error) {
        console.error("Error al guardar archivo:", error);
    }
}

// Punto de entrada imperativo
async function main(): Promise<void> {
    console.clear();

    const miToDoList = new ToDoList();
    
    console.log("Cargando tareas...");
    const tareasDelArchivo = await cargarTareasDesdeArchivo();
    
    for(const tarea of tareasDelArchivo) {
        miToDoList.agregarTarea(tarea);
    }
    
    await input('Presione "Enter" para continuar...');

    let salirDelMenu: boolean = false;
    
    console.clear();

    // Fecha de hoy
    let hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let opcionMenu: number;

    do {
        console.clear();
        menuPrincipal();

        opcionMenu = parseInt(await input('> '), 10);

        switch (opcionMenu) {
            case 1:
                // Mostrar tareas
                console.clear();
                let opcionTareasAVer: number;
                let arregloTareasFiltradas: Tarea[] = [];
                let idTareaAVer: string;
                let idVerMasDetalles: string[] = [];
                let sePuedeVerLaTarea: boolean;
                let opcionQuiereEditar: number;
                let quiereEditar: boolean;
                let opcionCampoAEditar: number;
                let cancelarEdicion: boolean = false;

                // Variables para edición de tarea
                let nuevoTitulo: string;
                let nuevaDescripcion: string;
                let nuevaPrioridad: number;
                let nuevoEstado: number;

                if (miToDoList.getTareas().length === 0) {
                    console.log("No hay tareas cargadas.\n");
                    await input('Presione "Enter" para continuar...');
                    console.clear();
                    break;
                }

                do {
                    tareasAVer();
                    opcionTareasAVer = parseInt(await input('> '), 10);

                    if (opcionTareasAVer === 0) {
                        console.clear();
                        break;
                    }

                    if (opcionTareasAVer > 0 && opcionTareasAVer <= 5) {
                        console.clear();
                        do {
                            if (opcionTareasAVer - 1 === 0) {
                                console.log('--------------- Tus tareas son las siguientes ----------------------\n');
                                for (let tarea of miToDoList.getTareas()) {
                                    console.log(`[${tarea.getId()}] - ${tarea.getTitulo()}`);
                                    idVerMasDetalles[idVerMasDetalles.length] = tarea.getId();
                                }
                                console.log('\n--------------------------------------------------------------------\n');
                            } else {
                                arregloTareasFiltradas = miToDoList.arrayFiltrarPorEstado(opcionTareasAVer - 2);

                                if (arregloTareasFiltradas.length === 0) {
                                    console.log("No hay tareas con ese estado.\n");
                                    await input('Presione "Enter" para continuar...');
                                    console.clear();
                                    break;
                                }

                                console.log(`---------- Tus tareas en estado "${ESTADO[opcionTareasAVer - 2].toUpperCase()}" son las siguientes ----------------\n`);
                                for (let tarea of arregloTareasFiltradas) {
                                    console.log(`[${tarea.getId()}] - ${tarea.getTitulo()}`);
                                    idVerMasDetalles[idVerMasDetalles.length] = tarea.getId();
                                }
                                console.log('\n-----------------------------------------------------------------------------------\n');
                            }
                            console.log('Ingrese el ID de la tarea que desea ver en detalle.\n\n');
                            idTareaAVer = (await input('> ')).trim();
                            sePuedeVerLaTarea = false;
                            for (let id of idVerMasDetalles) {
                                if (id === idTareaAVer) {
                                    sePuedeVerLaTarea = true;
                                }
                            }
                            if (sePuedeVerLaTarea) {
                                console.clear();
                                miToDoList.mostrarDetallesDeTarea(idTareaAVer);

                                console.log("¿Desea editar esta tarea?\n");
                                console.log("[1] Sí");
                                console.log("[2] No\n");

                                opcionQuiereEditar = parseInt(await input('> '), 10);
                                quiereEditar = false;

                                if (opcionQuiereEditar === 1) {
                                    quiereEditar = true;
                                } else if (opcionQuiereEditar === 2) {
                                    quiereEditar = false;
                                    console.log("No se editará la tarea.\n");
                                    await input('Presione "Enter" para volver al menú principal...');
                                    console.clear();
                                    break;
                                } else {
                                    console.log("\nOpción no válida. No se editará la tarea.\n");
                                    await input('Presione "Enter" para volver al menú principal...');
                                    console.clear();
                                    break;
                                }

                                if (quiereEditar) {

                                    do {

                                        console.clear();
                                        console.log(`Estás editando la tarea: ${miToDoList.getUnaTarea(idTareaAVer).getTitulo()}\n`);
                                        console.log(`[1] Título: ${miToDoList.getUnaTarea(idTareaAVer).getTitulo()}`);
                                        console.log(`[2] Descripción: ${miToDoList.getUnaTarea(idTareaAVer).getDescripcion()}`);
                                        console.log(`[3] Prioridad: ${miToDoList.getUnaTarea(idTareaAVer).getPrioridad()}`);
                                        console.log(`[4] Estado: ${miToDoList.getUnaTarea(idTareaAVer).getEstado()}`);
                                        console.log(`[5] Fecha de vencimiento: ${miToDoList.getUnaTarea(idTareaAVer).getFechaVencimiento().toLocaleDateString()}\n`);

                                        console.log("[0] Volver al menú principal\n");

                                        console.log("Ingrese el número del campo que desea editar.\n");
                                        opcionCampoAEditar = parseInt(await input('> '), 10);

                                        switch (opcionCampoAEditar) {
                                            case 1:
                                                // Editar título
                                                nuevoTitulo = await input('Ingrese el nuevo título: ');
                                                miToDoList.getUnaTarea(idTareaAVer).setTitulo(nuevoTitulo);
                                                miToDoList.getUnaTarea(idTareaAVer).setFechaUltimaEdicion(new Date(fechaToString(hoy.getFullYear().toString(), (hoy.getMonth() + 1).toString(), hoy.getDate().toString()) + "T03:00:00Z"));
                                                await guardarTareasEnArchivo(miToDoList.getTareas());
                                                console.log("\nTítulo editado con éxito.\n");
                                                await input('Presione "Enter" para continuar...');
                                                break;
                                            case 2:
                                                // Editar descripción
                                                nuevaDescripcion = await input('Ingrese la nueva descripción: ');
                                                miToDoList.getUnaTarea(idTareaAVer).setDescripcion(nuevaDescripcion);
                                                miToDoList.getUnaTarea(idTareaAVer).setFechaUltimaEdicion(new Date(fechaToString(hoy.getFullYear().toString(), (hoy.getMonth() + 1).toString(), hoy.getDate().toString()) + "T03:00:00Z"));
                                                await guardarTareasEnArchivo(miToDoList.getTareas());
                                                console.log("\nDescripción editada con éxito.\n");
                                                await input('Presione "Enter" para continuar...');
                                                break;
                                            case 3:
                                                // Editar prioridad
                                                do {
                                                    console.clear();
                                                    console.log("\nSeleccione la nueva prioridad:\n");
                                                    console.log(`[1] - ${PRIORIDAD[0]}`);
                                                    console.log(`[2] - ${PRIORIDAD[1]}`);
                                                    console.log(`[3] - ${PRIORIDAD[2]}\n`);
                                                    nuevaPrioridad = parseInt(await input('> '), 10);

                                                    if (nuevaPrioridad >= 1 && nuevaPrioridad <= 3) {
                                                        miToDoList.getUnaTarea(idTareaAVer).setPrioridad(PRIORIDAD[nuevaPrioridad - 1]);
                                                        miToDoList.getUnaTarea(idTareaAVer).setFechaUltimaEdicion(new Date(fechaToString(hoy.getFullYear().toString(), (hoy.getMonth() + 1).toString(), hoy.getDate().toString()) + "T03:00:00Z"));
                                                        await guardarTareasEnArchivo(miToDoList.getTareas());
                                                        console.log("\nPrioridad editada con éxito.\n");
                                                        await input('Presione "Enter" para continuar...');
                                                    } else {
                                                        console.log("\nPrioridad no válida. Por favor, seleccione una prioridad válida.\n");
                                                        await input('Presione "Enter" para continuar...');
                                                    }
                                                } while (nuevaPrioridad < 1 || nuevaPrioridad > 3);
                                                break;
                                            case 4:
                                                // Editar estado
                                                do {
                                                    console.clear();
                                                    console.log("\nSeleccione el nuevo estado:\n");
                                                    console.log(`[1] - ${ESTADO[0]}`);
                                                    console.log(`[2] - ${ESTADO[1]}`);
                                                    console.log(`[3] - ${ESTADO[2]}`);
                                                    console.log(`[4] - ${ESTADO[3]}\n`);
                                                    nuevoEstado = parseInt(await input('> '), 10);
                                                    if (nuevoEstado >= 1 && nuevoEstado <= 4) {
                                                        miToDoList.getUnaTarea(idTareaAVer).setEstado(ESTADO[nuevoEstado - 1]);
                                                        miToDoList.getUnaTarea(idTareaAVer).setFechaUltimaEdicion(new Date(fechaToString(hoy.getFullYear().toString(), (hoy.getMonth() + 1).toString(), hoy.getDate().toString()) + "T03:00:00Z"));
                                                        await guardarTareasEnArchivo(miToDoList.getTareas());
                                                        console.log("\nEstado editado con éxito.\n");
                                                        await input('Presione "Enter" para continuar...');
                                                    } else {
                                                        console.log("\nEstado no válido. Por favor, seleccione un estado válido.\n");
                                                        await input('Presione "Enter" para continuar...');
                                                    }
                                                } while (nuevoEstado < 1 || nuevoEstado > 4);
                                                break;
                                            case 5:
                                                // Editar fecha de vencimiento

                                                let esValidoElDato: boolean = false;
                                                let nuevoAnio: string;
                                                let nuevoMes: string;
                                                let nuevoDia: string;

                                                do {

                                                    do {
                                                        console.clear();
                                                        console.log("Ingrese el año de vencimiento de la nueva tarea. Año (YYYY)\n");
                                                        nuevoAnio = await input('> ');
                                                        if (!comprobarFormatoAnio(nuevoAnio)) {
                                                            console.log("\nFormato no válido. Intente nuevamente.\n");
                                                            await input('Presione "Enter" para continuar...');
                                                            continue;
                                                        } else {
                                                            if (parseInt(nuevoAnio) >= hoy.getFullYear()) {
                                                                esValidoElDato = true;
                                                            }
                                                            else {
                                                                console.log("\nEl año debe ser el actual o un año futuro. Intente nuevamente.\n");
                                                                await input('Presione "Enter" para continuar...');
                                                            }
                                                        }
                                                    } while (!esValidoElDato);

                                                    esValidoElDato = false;

                                                    do {
                                                        console.clear();
                                                        console.log("Ingrese el mes de vencimiento de la nueva tarea. Mes (MM)\n");
                                                        nuevoMes = await input('> ');
                                                        if (!comprobarFormatoMes(nuevoMes)) {
                                                            console.log("\nFormato no válido. Intente nuevamente.\n");
                                                            await input('Presione "Enter" para continuar...');
                                                            continue;
                                                        } else {
                                                            esValidoElDato = true;
                                                        }
                                                    } while (!esValidoElDato);

                                                    esValidoElDato = false;

                                                    do {
                                                        console.clear();
                                                        console.log("Ingrese el día de vencimiento de la nueva tarea. Día (DD)\n");
                                                        nuevoDia = await input('> ');
                                                        if (!comprobarFormatoDia(nuevoDia)) {
                                                            console.log("\nFormato no válido. Intente nuevamente.\n");
                                                            await input('Presione "Enter" para continuar...');
                                                            continue;
                                                        } else {
                                                            esValidoElDato = true;
                                                        }
                                                    } while (!esValidoElDato);

                                                    esValidoElDato = false;

                                                    if (!esFechaValida(parseInt(nuevoAnio), parseInt(nuevoMes), parseInt(nuevoDia))) {
                                                        console.log("\nFecha no válida. Intente nuevamente.\n");
                                                        await input('Presione "Enter" para continuar...');
                                                        continue;
                                                    } else {
                                                        if (new Date(fechaToString(nuevoAnio, nuevoMes, nuevoDia)).getTime() <= hoy.getTime()) {
                                                            console.log("\nLa fecha de vencimiento debe ser futura a la fecha actual. Intente nuevamente.\n");
                                                            await input('Presione "Enter" para continuar...');
                                                            continue;
                                                        } else {
                                                            miToDoList.getUnaTarea(idTareaAVer).setFechaVencimiento(new Date(fechaToString(nuevoAnio, nuevoMes, nuevoDia) + "T03:00:00Z")); // UTC-3
                                                            await guardarTareasEnArchivo(miToDoList.getTareas());
                                                            console.log("\nFecha de vencimiento editada con éxito.\n");
                                                            await input('Presione "Enter" para continuar...');
                                                        }
                                                    }
                                                    esValidoElDato = true;
                                                } while (!esValidoElDato);

                                                break;
                                            case 0:
                                                // Volver al menú principal
                                                quiereEditar = false;
                                                cancelarEdicion = true;
                                                break;
                                            default:
                                                // Opción no válida
                                                console.log("\nOpción no válida\n");
                                                await input('Presione "Enter" para continuar...');
                                                break;
                                        }

                                        // await input('Pausa de prueba.');
                                    } while (opcionCampoAEditar < 0 || opcionCampoAEditar > 5 || !cancelarEdicion);

                                } else {
                                    console.log("No se editará la tarea.");
                                }

                            } else {
                                console.log("\nID de tarea no válido. Intente nuevamente.\n");
                                await input('Presione "Enter" para continuar...');
                                console.clear();
                            }
                        } while (!sePuedeVerLaTarea);

                    } else if (opcionTareasAVer === 0) {
                        console.clear();
                        break;
                    } else {
                        console.log("\nOpción no válida. Intente nuevamente.\n");
                        await input('Presione "Enter" para continuar...');
                    }
                } while (opcionTareasAVer < 0 || opcionTareasAVer > 5);
                console.clear();
                break;
            case 2:
                // Variables para nueva tarea
                let tituloNuevaTarea: string;
                let descripcionNuevaTarea: string;
                let prioridadNuevaTarea: number;
                let estadoNuevaTarea: number;
                let anioNuevaTarea: string;
                let mesNuevaTarea: string;
                let diaNuevaTarea: string;

                // Variable de control de bucle
                let esValidoElDato: boolean = false;


                do {
                    console.clear();
                    console.log("Ingrese el título de la nueva tarea.\n");
                    tituloNuevaTarea = await input('> ');

                    if (tituloNuevaTarea.trim() === "") {
                        console.log("\nEl título no puede estar vacío. Intente nuevamente.\n");
                        await input('Presione "Enter" para continuar...');
                        console.clear();
                    } else {
                        esValidoElDato = true;
                    }
                } while (!esValidoElDato);

                esValidoElDato = false;

                do {
                    console.clear();
                    console.log("Ingrese la descripción de la nueva tarea.\n");
                    descripcionNuevaTarea = await input('> ');

                    if (descripcionNuevaTarea.trim() === "") {
                        console.log("\nLa descripción no puede estar vacía. Intente nuevamente.\n");
                        await input('Presione "Enter" para continuar...');
                        console.clear();
                    } else {
                        esValidoElDato = true;
                    }
                } while (!esValidoElDato);

                esValidoElDato = false;

                do {
                    console.clear();
                    console.log("Ingrese la prioridad de la nueva tarea.\n");

                    console.log(`[1] - ${PRIORIDAD[0]}`);
                    console.log(`[2] - ${PRIORIDAD[1]}`);
                    console.log(`[3] - ${PRIORIDAD[2]}\n`);

                    prioridadNuevaTarea = parseInt(await input('> '));
                    if (prioridadNuevaTarea < 1 || prioridadNuevaTarea > 3 || isNaN(prioridadNuevaTarea)) {
                        console.log("\nPrioridad no válida. Intente nuevamente.\n");
                        await input('Presione "Enter" para continuar...');
                    } else {
                        esValidoElDato = true;
                    }
                } while (!esValidoElDato);

                esValidoElDato = false;

                do {
                    console.clear();
                    console.log("Ingrese el estado de la nueva tarea.\n");

                    console.log(`[1] - ${ESTADO[0]}`);
                    console.log(`[2] - ${ESTADO[1]}`);
                    console.log(`[3] - ${ESTADO[2]}`);
                    console.log(`[4] - ${ESTADO[3]}\n`);

                    estadoNuevaTarea = parseInt(await input('> '));
                    if (estadoNuevaTarea < 1 || estadoNuevaTarea > 4 || isNaN(estadoNuevaTarea)) {
                        console.log("\nEstado no válido. Intente nuevamente.\n");
                        await input('Presione "Enter" para continuar...');
                    } else {
                        esValidoElDato = true;
                    }
                } while (!esValidoElDato);

                // Pedir dificultad (1-5)
                esValidoElDato = false;
                let dificultadNuevaTarea: number = 3;
                do {
                    console.clear();
                    console.log("Ingrese la dificultad de la nueva tarea (1-5). 1=fácil, 5=muy difícil\n");
                    const entrada = await input('> ');
                    const valor = parseInt(entrada, 10);
                    if (isNaN(valor) || valor < 1 || valor > 5) {
                        console.log("\nValor no válido. Intente nuevamente.\n");
                        await input('Presione "Enter" para continuar...');
                        continue;
                    } else {
                        dificultadNuevaTarea = valor;
                        esValidoElDato = true;
                    }
                } while (!esValidoElDato);

                esValidoElDato = false;

                do {

                    do {
                        console.clear();
                        console.log("Ingrese el año de vencimiento de la nueva tarea. Año (YYYY)\n");
                        anioNuevaTarea = await input('> ');
                        if (!comprobarFormatoAnio(anioNuevaTarea)) {
                            console.log("\nFormato no válido. Intente nuevamente.\n");
                            await input('Presione "Enter" para continuar...');
                            continue;
                        } else {
                            if (parseInt(anioNuevaTarea) >= hoy.getFullYear()) {
                                esValidoElDato = true;
                            }
                            else {
                                console.log("\nEl año debe ser el actual o un año futuro. Intente nuevamente.\n");
                                await input('Presione "Enter" para continuar...');
                            }
                        }
                    } while (!esValidoElDato);

                    esValidoElDato = false;

                    do {
                        console.clear();
                        console.log("Ingrese el mes de vencimiento de la nueva tarea. Mes (MM)\n");
                        mesNuevaTarea = await input('> ');
                        if (!comprobarFormatoMes(mesNuevaTarea)) {
                            console.log("\nFormato no válido. Intente nuevamente.\n");
                            await input('Presione "Enter" para continuar...');
                            continue;
                        } else {
                            esValidoElDato = true;
                        }
                    } while (!esValidoElDato);

                    esValidoElDato = false;

                    do {
                        console.clear();
                        console.log("Ingrese el día de vencimiento de la nueva tarea. Día (DD)\n");
                        diaNuevaTarea = await input('> ');
                        if (!comprobarFormatoDia(diaNuevaTarea)) {
                            console.log("\nFormato no válido. Intente nuevamente.\n");
                            await input('Presione "Enter" para continuar...');
                            continue;
                        } else {
                            esValidoElDato = true;
                        }
                    } while (!esValidoElDato);

                    esValidoElDato = false;

                    if (!esFechaValida(parseInt(anioNuevaTarea), parseInt(mesNuevaTarea), parseInt(diaNuevaTarea))) {
                        console.log("\nFecha no válida. Intente nuevamente.\n");
                        await input('Presione "Enter" para continuar...');
                        continue;
                    } else {
                        if (new Date(fechaToString(anioNuevaTarea, mesNuevaTarea, diaNuevaTarea)).getTime() <= hoy.getTime()) {
                            console.log("\nLa fecha de vencimiento debe ser futura a la fecha actual. Intente nuevamente.\n");
                            await input('Presione "Enter" para continuar...');
                            continue;
                        }
                    }
                    esValidoElDato = true;
                } while (!esValidoElDato);

                esValidoElDato = false;

                let nuevaTarea = new Tarea(
                    tituloNuevaTarea,
                    descripcionNuevaTarea,
                    PRIORIDAD[prioridadNuevaTarea - 1],
                    ESTADO[estadoNuevaTarea - 1],
                    hoy,
                    new Date(fechaToString(anioNuevaTarea, mesNuevaTarea, diaNuevaTarea) + "T03:00:00Z"), // UTC-3
                    hoy,
                    undefined,
                    dificultadNuevaTarea
                );

                miToDoList.agregarTarea(nuevaTarea);
                await guardarTareasEnArchivo(miToDoList.getTareas());
                console.log("\nTarea agregada con éxito.\n");
                await input('Presione "Enter" para continuar...');

                console.clear();
                break;
            case 3:
                // Buscar tarea

                let terminoBusqueda: string;
                let tareasEncontradas: Tarea[] = [];
                let indice: number = 0;


                console.clear();
                if (miToDoList.getTareas().length === 0) {
                    console.log("No hay tareas cargadas.\n");
                    await input('Presione "Enter" para continuar...');
                    console.clear();
                    break;
                }

                console.log("Por favor, ingrese el término de búsqueda.\n");
                terminoBusqueda = (await input('> ')).toLowerCase();

                for (const tarea of miToDoList.getTareas()) {
                    if (tarea.getTitulo().toLowerCase().includes(terminoBusqueda) || tarea.getDescripcion().toLowerCase().includes(terminoBusqueda)) {
                        tareasEncontradas[indice] = tarea;
                        indice++;
                    }
                }

                if (tareasEncontradas.length === 0) {
                    console.log("\nNo se encontraron tareas que coincidan con el término de búsqueda.\n");
                    await input('Presione "Enter" para continuar...');
                    console.clear();
                    break;
                } else {
                    console.clear();
                    console.log("Las tareas encontradas son las siguientes:\n");
                    for (let tarea of tareasEncontradas) {
                        console.log(`[${tarea.getId()}] - ${tarea.getTitulo()}`);
                    }
                }
                await input('\nPresione "Enter" para continuar...');

                console.clear();
                break;
            case 4:
                // Eliminar tarea
                {
                    console.clear();

                    if (miToDoList.getTareas().length === 0) {
                        console.log("No hay tareas cargadas.\n");
                        await input('Presione "Enter" para continuar...');
                        console.clear();
                        break;
                    }

                    console.log('Lista de tareas:\n');
                    for (let tarea of miToDoList.getTareas()) {
                        console.log(`[${tarea.getId()}] - ${tarea.getTitulo()}`);
                    }

                    console.log('\nIngrese el ID (UUID) de la tarea que desea eliminar.\n');
                    const idAEliminar: string = (await input('> ')).trim();

                    const existe = miToDoList.getTareas().some(t => t.getId() === idAEliminar);
                    if (!existe) {
                        console.log('\nID de tarea no válido. Operación cancelada.\n');
                        await input('Presione "Enter" para continuar...');
                        console.clear();
                        break;
                    }

                    console.log('\n¿Confirma la eliminación de la tarea?\n');
                    console.log('[1] Sí');
                    console.log('[2] No\n');
                    const opcionConfirma = parseInt(await input('> '), 10);

                    if (opcionConfirma === 1) {
                        const eliminado = miToDoList.eliminarTarea(idAEliminar);
                        if (eliminado) {
                            await guardarTareasEnArchivo(miToDoList.getTareas());
                            console.log('\nTarea eliminada correctamente.\n');
                        } else {
                            console.log('\nNo se pudo eliminar la tarea.\n');
                        }
                    } else {
                        console.log('\nEliminación cancelada.\n');
                    }

                    await input('Presione "Enter" para continuar...');
                    console.clear();
                }
                break;
            case 5:
                // Ordenar tareas
                {
                    console.clear();

                    if (miToDoList.getTareas().length === 0) {
                        console.log("No hay tareas cargadas.\n");
                        await input('Presione "Enter" para continuar...');
                        console.clear();
                        break;
                    }

                    console.log('Ordenar por:\n');
                    console.log('[1] Título');
                    console.log('[2] Fecha de Vencimiento');
                    console.log('[3] Fecha de Creación');
                    console.log('[4] Dificultad\n');
                    let opcionOrden: number = parseInt(await input('> '), 10);
                    let criterio: 'titulo' | 'fechaVencimiento' | 'fechaCreacion' | 'dificultad' = 'titulo';
                    switch (opcionOrden) {
                        case 1: criterio = 'titulo'; break;
                        case 2: criterio = 'fechaVencimiento'; break;
                        case 3: criterio = 'fechaCreacion'; break;
                        case 4: criterio = 'dificultad'; break;
                        default:
                            console.log('\nOpción no válida. Volviendo al menú.\n');
                            await input('Presione "Enter" para continuar...');
                            console.clear();
                            break;
                    }

                    // Si opción inválida ya hizo break; verificar
                    if (![1,2,3,4].includes(opcionOrden)) break;

                    console.clear();
                    console.log('Orden:\n');
                    console.log('[1] Ascendente');
                    console.log('[2] Descendente\n');
                    const opcionAsc = parseInt(await input('> '), 10);
                    const asc = opcionAsc === 1;

                    miToDoList.ordenarPor(criterio, asc);
                    await guardarTareasEnArchivo(miToDoList.getTareas());

                    console.log(`\nTareas ordenadas por ${criterio} (${asc ? 'ascendente' : 'descendente'}).\n`);
                    console.log('Lista resultante:\n');
                    for (let tarea of miToDoList.getTareas()) {
                        console.log(`[${tarea.getId()}] - ${tarea.getTitulo()} - Vencimiento: ${tarea.getFechaVencimiento().toLocaleDateString()} - Dificultad: ${tarea.getDificultad()}`);
                    }

                    await input('\nPresione "Enter" para continuar...');
                    console.clear();
                }
                break;
            case 6:
                // Mostrar estadísticas
                {
                    console.clear();

                    const total = miToDoList.getTotalTareas();
                    const cantPorEstado = miToDoList.getCantidadPorEstado();
                    const pctPorEstado = miToDoList.getPorcentajePorEstado();
                    const cantPorDificultad = miToDoList.getCantidadPorDificultad();
                    const pctPorDificultad = miToDoList.getPorcentajePorDificultad();

                    console.log('-------------------- Estadísticas --------------------');
                    console.log(`Total de tareas: ${total}\n`);

                    console.log('Cantidad / Porcentaje por Estado:\n');
                    for (const estado of Object.keys(cantPorEstado)) {
                        const cantidad = cantPorEstado[estado] ?? 0;
                        const porcentaje = pctPorEstado[estado] ?? 0;
                        console.log(`- ${estado}: ${cantidad} (${porcentaje}%)`);
                    }

                    console.log('\nCantidad / Porcentaje por Dificultad:\n');
                    const dificultades = Object.keys(cantPorDificultad).map(k => Number(k)).sort((a,b) => a-b);
                    for (const d of dificultades) {
                        const cantidad = cantPorDificultad[d] ?? 0;
                        const porcentaje = pctPorDificultad[d] ?? 0;
                        console.log(`- Dificultad ${d}: ${cantidad} (${porcentaje}%)`);
                    }

                    console.log('\n-----------------------------------------------------\n');
                    await input('Presione "Enter" para continuar...');
                    console.clear();
                }
                break;
            case 0:
                // Salir
                salirDelMenu = true;
                console.clear();
                break;
            default:
                // Opción no válida
                console.clear();
                break;
        }

    } while (!salirDelMenu);

    close();
}

main();
