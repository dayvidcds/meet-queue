import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";

import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import { createApp } from "vue";
import { createPinia } from "pinia";

import { aliases, mdi } from "vuetify/iconsets/mdi";

import { PerfectScrollbarPlugin } from "vue3-perfect-scrollbar";
import "vue3-perfect-scrollbar/style.css";

import App from "./App.vue";
import router from "./router";

const vuetify = createVuetify({
  components,
  directives,
  icons: { defaultSet: "mdi", aliases, sets: { mdi } },
  theme: {
    defaultTheme: 'dark'
  }
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);
app.use(PerfectScrollbarPlugin);

app.mount("#app");
