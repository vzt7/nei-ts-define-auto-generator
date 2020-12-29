<template>
  <v-app
    :style="{
      position: 'absolute',
      top: 0,
      right: 0,
      width: '100%',
      'z-index': 999,
      'pointer-events': 'none',
      background: 'transparent',
    }"
  >
    <global-message
      :text="messageText"
      :showMessage="showMessage"
    ></global-message>
    <pin-component></pin-component>
  </v-app>
</template>

<script>
import Vue from "vue";
import { STORAGE_PREFIX } from "../helpers/data-center";
import Message from "./Modals/Message";
import Pin from "./Pin";

export default Vue.extend({
  name: "app",
  components: {
    "global-message": Message,
    "pin-component": Pin,
  },
  data() {
    return {
      messageText: `${STORAGE_PREFIX} 已挂载`,
      showMessage: false,
    };
  },
  mounted() {
    this.setShowMessage();
  },
  methods: {
    setShowMessage() {
      this.showMessage =
        !JSON.parse(sessionStorage.getItem(STORAGE_PREFIX)) ?? true;
      sessionStorage.setItem(STORAGE_PREFIX, 1);
    },
  },
});
</script>
