import { createApp } from "vue";
import App from "./App.vue";
import "./assets/style/tailwind.css";
import { LoadingPlugin } from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";

const app = createApp(App);
app.use(LoadingPlugin);
app.mount("#app");
