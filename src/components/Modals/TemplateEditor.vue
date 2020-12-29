<template>
  <v-dialog v-model="dialog" transition="dialog-bottom-transition">
    <div
      :style="{
        position: 'relative',
        padding: '0 20px 60px 20px',
        backgroundColor: '#fff',
      }"
    >
      <v-tabs v-model="tab">
        <v-tab>Types</v-tab>
        <v-tab>Store & Reducers</v-tab>
        <v-tab>Epics</v-tab>
      </v-tabs>
      <div :style="{ margin: '20px 0', padding: '20px 0' }">
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <v-textarea
              flat
              filled
              disabled
              rows="12"
              name="input-7-4"
              label="Types Template"
              v-model="typesContent"
            ></v-textarea>
          </v-tab-item>
          <v-tab-item>
            <v-textarea
              flat
              filled
              disabled
              rows="12"
              name="input-7-4"
              label="Store & Reducers Template"
              v-model="reducersContent"
            ></v-textarea
          ></v-tab-item>
          <v-tab-item>
            <v-textarea
              flat
              filled
              disabled
              rows="12"
              name="input-7-4"
              label="Epics Template"
              v-model="epicsContent"
            ></v-textarea>
          </v-tab-item>
        </v-tabs-items>
      </div>
      <v-btn
        :style="{ width: '100%', margin: '0 0 30px 0' }"
        outlined
        disabled
        color="primary"
        @click="updateTemplate()"
        >更新</v-btn
      >
      <v-alert
        :value="alert"
        :style="{
          boxSizing: 'border-box',
          position: 'absolute',
          left: '20px',
          right: 0,
          bottom: '15px',
          width: 'calc(100% - 40px)',
          margin: 0,
        }"
        type="success"
        border="top"
        transition="slide-y-transition"
      >
        更新成功
      </v-alert>
    </div>
  </v-dialog>
</template>

<script>
import Vue from "vue";
import {
  STORAGE_PREFIX,
  getCurrentPageConfig,
  getInterfaceStorageKey,
} from "../../helpers/data-center";

const TABS = {
  types: 0,
  reducers: 1,
  epics: 2,
};

const getTemplateStorageKey = (type) => `${STORAGE_PREFIX}-${type}-template`;

export default Vue.extend({
  name: "template-editor",
  props: ["visible"],
  data() {
    return {
      dialog: false,
      alert: false,
      tab: null,
      typesContent: ``,
      reducersContent: ``,
      epicsContent: ``,
    };
  },
  watch: {
    visible(val) {
      this.dialog = val;
    },
    dialog(val) {
      !val && this.$emit("close", false);
    },
  },
  mounted() {
    this.initTemplate();
  },
  methods: {
    initTemplate() {
      localStorage;
    },
    updateTemplate() {
      let storageKey = null;
      let content = null;
      switch (this.tab) {
        case TABS.types: {
          storageKey = getTemplateStorageKey("types");
          content = this.typesContent;
          break;
        }
        case TABS.reducers: {
          storageKey = getTemplateStorageKey("reducers");
          content = this.reducersContent;
          break;
        }
        case TABS.epics: {
          storageKey = getTemplateStorageKey("epics");
          content = this.epicsContent;
          break;
        }
      }
      localStorage.setItem(storageKey, content);
      this.successNotify();
    },
    successNotify() {
      this.alert = true;
      setTimeout(() => {
        this.alert = false;
      }, 1500);
    },
  },
});
</script>
