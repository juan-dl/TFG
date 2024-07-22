// Importación de modulos a emplear
const k8s = require('@kubernetes/client-node');
var amqp = require('amqplib/callback_api');

//Definición de variables auxiliares
const inKeda = process.env.KEDA == "1"

let sumatorioTiempos = 0

// Declaración de datos a almacenar
const DB = {
    kube: {
        replicas: 0,
	metrica: 0	
    },
    cola: {
        tamCola: 0,
	mensajesListos: 0,
	mensajesEntregados: 0,
	tiempoPromedio: 0
    }
}

// Establecimiento de intervalos para realizar las comprobaciones
const CHECK_REPLICAS = 3 * 1000 
const CHECK_METRICA = 3 * 1000
const CHECK_COLA = 3 * 1000 
const CHECK_TIEMPO = 1 * 1000

// Establecimiento de una flag para evitar que haya solapamiento entre funciones
let fIniciado =  false

// Iniialización de cliente de kubernetes para hacer peticiones
const kc = new k8s.KubeConfig();
kc.loadFromCluster();
const k8sApiApps = kc.makeApiClient(k8s.AppsV1Api);
const k8sApiScaling = kc.makeApiClient(k8s.AutoscalingV2Api);

const namespace = 'pruebas'
const nombreApp = 'consumidor'

// Establecimiento de ruta y de usuario/contraseña para acceder a la api de la cola
const pathApiCola = "http://cola-pruebas-rabbit.pruebas.svc.cluster.local:15672"
const pathCola = "amqp://cola-pruebas-rabbit.pruebas.svc.cluster.local:5672"
const usuario = 'pruebas'
const contra = 'pruebas'

// Función que inicia el funcionamiento de las comprobaciones
async function initCore(){

	if(fIniciado) return

	fIniciado = true

   	// Checks datos kubernetes
	checkReplicas()
	checkMetrica()

    	// Checks datos cola
	checkDatosCola()
	checkPromedio()
}

//Funcion encargada de la obtencion de las replicas del deployment
async function checkReplicas(){
	setInterval(() => {
		try {
			k8sApiApps.listNamespacedDeployment(namespace)
				.then(function(res){
					for(let i = 0; i < res.body.items.length; i++)
						if(res.body.items[i].metadata.name.includes(nombreApp))
						{
							DB.kube.replicas = res.body.items[i].status.readyReplicas
							break;
						}
				})
		} catch (error){
			console.log(error);
		}
	}, CHECK_REPLICAS)
}

//Funcion que obtiene la metrica utilizada por HPA
async function checkMetrica(){
	setInterval(() => {
		try {
			k8sApiScaling.listNamespacedHorizontalPodAutoscaler(namespace)
				.then(function(res){
					if(!inKeda)
						if(res.body.items[0].status.currentMetrics[0].resource != undefined) 
							DB.kube.metrica = res.body.items[0].status.currentMetrics[0].resource.current.averageUtilization
				})
		} catch (error){
			console.log(error);
		}
	}, CHECK_METRICA)
}

//Funcion que obtiene los datos de la cola 
async function checkDatosCola(){
	setInterval(async () => {
		const respuesta = await fetch(pathApiCola + '/api/queues/pruebas/colaPruebas', { 
			method: 'GET', 
			headers: new Headers({ 'Authorization': 'Basic ' + btoa(usuario+':'+contra) }) 
		})
		const data = await respuesta.json();
		if (data.message_stats != undefined)
			DB.cola.mensajesEntregados = data.message_stats.deliver_get
		DB.cola.tamCola = data.messages
		if(inKeda)
			DB.kube.metrica = data.messages
		DB.cola.mensajesListos = data.messages_ready
	}, CHECK_COLA)
}

//Funcion que obtiene el tiempo promedio de respuesta
function checkPromedio(){
	const opt = { credentials: require('amqplib').credentials.plain(usuario, contra) }
	amqp.connect(pathCola + '/pruebas', opt, function(error0, connection) {
		if (error0) 
        		throw error0;
    		connection.createChannel(function(error1, channel) {
       			if (error1) 
      				throw error1;

			var queue = 'colaTiempos';

       			channel.assertQueue(queue, { durable: false });

        		console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

       			channel.consume(queue, function(msg) {
				sumatorioTiempos += parseFloat(msg.content.toString());
      				if(DB.cola.mensajesEntregados === 0)
					DB.cola.tiempoPromedio = sumatorioTiempos
				else
					DB.cola.tiempoPromedio = sumatorioTiempos/DB.cola.mensajesEntregados
				console.log(" [x] Received %s ", msg.content.toString()); 			
			}, { noAck: true });
    		});
	});
}

//Funcion que devuelve una copia de DB
function queryDB(){ return JSON.parse(JSON.stringify(DB)); }

//Exportacion de las funciones para comunicarse con la api
module.exports = {
    initCore,
    queryDB,
}
