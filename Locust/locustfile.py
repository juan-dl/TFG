#Se importan funciones necesarias para la elaboración de los tests, junto con funciones para la comunicación con la cola (pika) 
#También se importa la función datetime para tener acceso a la hora de envio
from locust import User, task, between
from datetime import datetime
import pika

#Definición de una función para escribir el estado de la aplicación en un fichero
def ficheroEstado(estado):
    file = open("health.txt","w")
    file.write(estado)
    file.close()

#Se define una clase que simulará el comportamiento de un usuario
class QuickstartUser(User):
    #Se establece un retardo entre tarea y tarea realizada por los usuarios
    wait_time = between(1, 2)

    #Se define una tarea encargada de enviar mensajes a una cola
    @task
    def enviarMensaje(self):
        #Se declara el bloque try/except para que en caso de error se indique en el fichero que el estado del consumidor no es correcto
        try:
            #Definición de las credenciales de conexión y su establecimiento
            credentials = pika.PlainCredentials("pruebas","pruebas")
            connection = pika.BlockingConnection(pika.ConnectionParameters('cola-pruebas-rabbit.pruebas.svc.cluster.local',5672,'pruebas',credentials))
            #Se abre el canal de comunicación y se define la cola con la que se realizará la comunicación y el exchange a utilizar
            channel = connection.channel()
            channel.queue_declare(queue='colaPruebas')

            channel.exchange_declare(exchange='pruebas', exchange_type='direct')
            channel.queue_bind(exchange='pruebas', queue='colaPruebas')

            #Por último, se publica el mensaje en la cola, se imprime un mensaje que cumple la función de log y se cierra la conexión
            channel.basic_publish(exchange='pruebas', routing_key='colaPruebas', body=datetime.now().strftime('%H:%M:%S'))
            print("Mensaje Enviado")
            connection.close()
        except:
            print("Se ha producido un error durante el estableciemiento de la conexión o el procesamiento del mensaje")
            ficheroEstado("1")
            
