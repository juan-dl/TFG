# HPA TFG

## Comandos para el despliegue y control de las pruebas

A continuación, se detallarán una serie de comandos necesarios para realizar de forma exitosa los tests y el escalado de la aplicación.
En función de los permisos con los que se cuente a la hora de ejecutar los comandos, será necesario incluir 'sudo' delante del comando a ejecutar.

El proyecto cuenta con un **makefile** que permite desplegar el entorno de las pruebas de una forma rápida y sencilla.
Este cuenta un par de funciones, *make* y *clean*, para cada uno de los casos a probar.
La sintaxis de dichos comandos es la siguiente:

```bash
Caso 1 (Carga de Cpu alta) -> make buildCPU / make cleanCPU
Caso 2 (Carga de Cpu baja) -> make buildP / make cleanP
Caso 3 (Escalado con métricas Keda) -> make BuildKeda / make cleanKeda
``` 

Por defecto, al ejecutar el comando *make* sin argumentos se creará el entorno para el caso 1 (Carga de Cpu alta)

Tras desplegar el entorno, el ingress se encargará de redirigir las peticiones a los servicios deseados.
A continuación, se muestran las URL disponibles para acceder a ellos:

```bash
localhost/  -> Para acceder a el dashboard
localhost/locust/ -> Para acceder a locust
localhost/api/cola -> Para poder ver los datos de la cola ofrecidos por la api
localhost/api/kube -> Para poder ver los datos de Kubernetes ofrecios por la api
```

Por último, si se desea comprobar el estado del HPA desplegado, se puede ejecutar el siguiente comando y se mostrará la información de forma persistente en el terminal.

```bash
kubectl get hpa -n pruebas -w
```
