import { createMemoryHistory, createRouter } from 'vue-router'

import ElDashboard from "@/components/ElDashboard.vue"
 

const routes = [
  { 
	path: '/', 
	name: "dashboard",
	component:  ElDashboard,
  }
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router
