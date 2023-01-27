import titleBar from './titleBar.vue'
import type {App} from "vue";

titleBar.install = (app:App)=> {
  app.component(titleBar.name, titleBar);
};
export default titleBar
