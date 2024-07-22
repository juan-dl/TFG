<template>
  <v-app>

    <v-app-bar :elevation="1">
      <v-app-bar-title>Métricas de RabbitMQ y de Kubernetes</v-app-bar-title>
    </v-app-bar>

    <v-container fluid class="base">
      <v-row>
        
        <v-col cols="12" md="3">
            <v-container v-for="item of itemsCola" key="`item-cola-${item.titulo}`">
                <v-card>  
                    <v-card-title v-text="item.titulo" />
                    <v-card-subtitle v-text="item.subtitulo" />
                    <v-card-text>
                        {{ item.value }}
                    </v-card-text>
                </v-card>
            </v-container>
        </v-col>

        <v-col cols="12" md="9">
          <v-container fluid :key="`line-${dataPromediosRev.value}`">
            <Line class="grafica" :data="dataPromedios" :options="options"/>
          </v-container>
        </v-col>

      </v-row>
      <v-row>
        
        <v-col cols="12" md="6" v-for="item in itemsKube" key="`item-cola-${item.titulo}`">
          <v-card>
            <v-card-title v-text="item.titulo" />
            <v-card-subtitle v-text="item.subtitulo" />
            <v-card-text>
              {{ item.value }}
            </v-card-text>
          </v-card>
        </v-col>

      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
//Importacion de los modulos necesarios e definicion de los componentes a usar por la grafica
import {ref, onMounted} from "vue"
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'
import {dataPromedios, dataPromediosRev, options, initMetrics, tamCola, mensajesEntregados, mensajesListos, replicas, metrica} from "@/base/funct.js"

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement)

//Arrays de elementos utilizados para la creacion de la vista
const itemsCola = [

    {
        titulo: "Tamaño de la cola",
        subtitulo: "Mensajes que hay actualmente en la cola",
        value: tamCola
    },

    {
        titulo: "Mensajes Entregados",
        subtitulo: "Mensajes procesados hasta el momento",
        value: mensajesEntregados
    },

    {
        titulo: "Mensajes Listos",
        subtitulo: "Mensajes disponibles para ser consumidos",
        value: mensajesListos
    }

]

const itemsKube = [
    {
	titulo: "Réplicas",
	subtitulo: "Numero de replicas de los consumidores",
	value: replicas
    },

    {
	titulo: "Metrica escalado",
	subtitulo: "Metrica utilizada por HPA para el escalado",
	value: metrica
    }
]

//Ejecucion de la funcionalidad de la logica de la aplicacion al montarse la vista
onMounted(() => {
 
  initMetrics()

})

</script>

<style>
.base{margin-top: 60px;}
.grafica{height: 425px;}
</style>
