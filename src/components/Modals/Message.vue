<template>
  <v-snackbar v-model="showMessage">
    {{ text }}
    <template v-slot:action="{ attrs }">
      <v-btn color="pink darken-2" text v-bind="attrs" @click="showMessage = false">
        OK
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import Vue from "vue";
export default Vue.extend({
  name: "message",
  props: ["text", "showMessage"],
  data() {
    return {};
  },
});
</script>
