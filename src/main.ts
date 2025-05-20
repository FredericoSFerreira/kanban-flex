import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import "bootstrap-icons/font/bootstrap-icons.css"
import CountryFlag from 'vue-country-flag-next'
import './assets/main.css'
import GoogleSignInPlugin from 'vue3-google-login'
import { i18n } from './i18n'


import VOtpInput from "vue3-otp-input";

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()
const GKEY = import.meta.env.VITE_GOOGLE_CLIENT_ID
pinia.use(piniaPluginPersistedstate)


app.use(GoogleSignInPlugin, {
  clientId: GKEY,
})
app.use(pinia)
app.use(router)
app.use(VueSweetalert2)
app.component('v-otp-input', VOtpInput)
app.component('country-flag', CountryFlag)
app.use(i18n)
app.mount('#app')
