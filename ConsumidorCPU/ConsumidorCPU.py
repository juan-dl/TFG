#Se importan las funciones para comunicarse con la cola (pika) y las funciones de manejo de tiempos
import pika
from datetime import datetime

#Definición de una función para escribir el estado de la aplicación en un fichero
def ficheroEstado(estado):
    file = open("health.txt","w")
    file.write(estado)
    file.close()

#Definición de una función para calcular el número de fibonacci para generar carga de CPU
def fibo(n):
    if n == 1:
        return 0
    elif n == 2:
        return 1
    else:
        return fibo(n-1)*fibo(n-2)

#Definición de la función que se ejecutará cada vez que se reciba un mensaje
def callback(ch, method, properties, body):
    fibo(30)
    #Se genera un mensaje a modo de log
    print("Mensaje Recibido " + str(body)[2:10])
    
    #Se envia un ack para confirmar la consumición del mensaje, para que se pueda recibir otro
    ch.basic_ack(delivery_tag = method.delivery_tag)

    #Se declara una nueva cola para enviar el tiempo final de procesamiento
    ch.exchange_declare(exchange='tiempos',exchange_type='direct')
    ch.queue_declare(queue='colaTiempos')
    ch.queue_bind(exchange='tiempos', queue='colaTiempos')

    #Se calcula el tiempo necesario para el procesamiento del mensaje y se envia a la cola
    tiempoActual = datetime.strptime(datetime.now().strftime("%H:%M:%S"),"%H:%M:%S")
    diferencia = tiempoActual - datetime.strptime(str(body)[2:10], "%H:%M:%S")
    ch.basic_publish(exchange='tiempos', routing_key='colaTiempos', body=str(diferencia.total_seconds()))

#El consumidor se inicia indicando que su estado es correcto
ficheroEstado("0")

#Se declara el bloque try/except para que en caso de error se indique en el fichero que el estado del consumidor no es correcto
try:
    #Declaración de las credenciales de conexión y establecimiento de la misma
    credentials = pika.PlainCredentials("pruebas","pruebas")
    connection = pika.BlockingConnection(pika.ConnectionParameters('cola-pruebas-rabbit.pruebas.svc.cluster.local',5672,'pruebas',credentials))

    #Creación de un canal de comunicación y de la cola a consumir
    channel = connection.channel()
    channel.queue_declare(queue='colaPruebas')

    #Definición de los parámetros para la consumición
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue='colaPruebas', on_message_callback=callback, auto_ack=False)
    
    #Definición de la consumición
    channel.start_consuming()
except:
    print("Se ha producido un error durante el estableciemiento de la conexión o el procesamiento del mensaje")
    ficheroEstado("1")
