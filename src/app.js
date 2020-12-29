import Vue from "vue";
import Vuetify from "vuetify";
import App from "./components/App.vue";

Vue.use(Vuetify);

const vuetify = new Vuetify({});

const init = () => {
  const links = [
    "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900",
    "https://cdn.jsdelivr.net/npm/@mdi/font@4.x/css/materialdesignicons.min.css",
    "https://cdn.jsdelivr.net/npm/vuetify@2.3.21/dist/vuetify.min.css",
  ];
  links.map((link) => {
    const tag = document.createElement("link");
    tag.setAttribute("rel", "stylesheet");
    tag.setAttribute("href", link);
    document.head.appendChild(tag);
  });

  const container = document.createElement("div");
  document.body.appendChild(container);

  const app = new App({
    vuetify,
  }).$mount(container);
};

init();
