//Se importa express para la creación de la api y cors para solucionar permitir la comunicacion con el dashboard
//Despues se añaden a la api y se le añade la opción de poder manejar objetos json 
const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

//Se importan las funciones de comunicación con el core de la api
const {
	initCore,
	queryDB
} = require("./core.js");

//Se define el puerto en el que se escucha y se inicia la api
const PORT = 3000;

let DB = {}

app.listen(PORT, () =>{
	initCore();
	console.log("Escuchando en el puerto número PORT: ", PORT);
	consultarDB();
});

//Se llama a la función cada 3s para consultar el valor de DB
async function consultarDB(){
	setInterval(()=>{
		DB = queryDB(); 
	}, 3*1000)
}

//Creacion de un logger y su inclusion en la api
const Logger = function(request, response, next){
	console.log("Petición: " + request.method + " - " + request.originalUrl + " - " + request.ip);
	next();
}
app.use(Logger);

//Creacion de los diferentes endpoitns de la api
app.get("/kube", (request, response)=>{
	const kube = DB.kube;
	response.send(kube);
});

app.get("/cola", (request, response) =>{
	const cola = DB.cola;
	response.send(cola);
});

app.get('/health', (request, response) =>{
  	const data = {
		uptime: process.uptime(),
    		message: 'Ok',
  	}
	response.status(200).send(data);
});


