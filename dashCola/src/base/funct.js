//Importacion de los modulos a utilizar
import {ref, shallowRef, computed} from "vue"

//Variable que comprueba si se esta en un simulacro
const inMock = import.meta.env.VITE_MOCK == "1"

//Funciones que definen el color de la grafica segun el valor anterior
const sube = (ctx, value) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined
const baja = (ctx, value) => ctx.p0.parsed.y < ctx.p1.parsed.y ? value : undefined 
const igual = (ctx, value) => ctx.p0.parsed.y < ctx.p1.parsed.y ? value : undefined

//Variables auxiliares
const REFRESCO = 5 * 1000 // 5 seg

const path = ref("http://localhost/api")

//Definición de los valores que se mostrarán en la vista
const tiempoPromedio = ref(0)
export const tamCola = ref(0)
export const mensajesEntregados = ref(0)
export const mensajesListos = ref(0)
export const replicas = ref(0)
export const metrica = ref(0)

const dataVal = shallowRef([0])
const labels = shallowRef([0])
const dataPromediosRevision = ref(0)
export const dataPromediosRev = computed(() => dataPromediosRevision)

//Datos de la grafica
export let dataPromedios = computed(() => {
let val = {
    labels: labels.value,
    datasets : [
        {
                label: "TiempoPromedio",

                data: dataVal.value,

                borderColor: "rgb(189, 195, 199)",

                backgroundColor: "rgb(189, 195, 199)",

                lineTension: 0.5,

                segment : {
                        borderColor: ctx => sube(ctx, "rgb(198, 40, 40)") || baja(ctx, "rgb(46, 125, 50)") || igual (ctx, "rgb(120, 144, 156)"),
                },

                spanGaps: true

        }
    ]
	}
	return val
})

//Opciones de configuracion de la grafica
export const options = 
{
	responsive: true,
	maintainAspectRatio: false
}

//Funcion que inicializa la funcionalidad en funcion de si es un simulacro o no
export function initMetrics(){

    if(inMock)
        initMock()
    else
        initRealMetrics()

}

//Funcion que implementa la funcionalidad real de la aplicacion
function initRealMetrics()
{
 
	setInterval(() => {

	    fetchApi()
            mockPromedios();

        }, REFRESCO)

}

//Funcion que implementa un simulacro. Utilizada durante el desarrollo de la interfaz para evitar errores con la api
function initMock()
{

        setInterval(() => {

            mockPromedios();

        }, REFRESCO)

}

//Funcion que se encarga de actualizar los datos de la grafica
function mockPromedios()
{

        let tiempoActual = new Date()

        tiempoActual = tiempoActual.getHours() + ":" + tiempoActual.getMinutes() + ":" + tiempoActual.getSeconds()

        if(labels.value.length >= 30)
	{
        	labels.value.shift()

        	dataVal.value.shift()
        }

        labels.value.push(tiempoActual)

        dataVal.value.push(tiempoPromedio.value)

        dataPromediosRevision.value  = dataPromediosRevision.value + 1;
}

//Funcion que hace peticiones a la api
function fetchApi()
{
    fetch(path.value + "/cola")
      .then(r => r.json())
      .then((data) => {
        console.log(data)
        mensajesListos.value = data.mensajesListos
        mensajesEntregados.value = data.mensajesEntregados
        tamCola.value = data.tamCola
        tiempoPromedio.value = data.tiempoPromedio
      })
    fetch(path.value + "/kube")
      .then(r => r.json())
      .then((data) => {
        console.log(data)
        replicas.value = data.replicas
        metrica.value = data.metrica
      })
}

