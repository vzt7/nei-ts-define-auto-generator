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
      <div :style="{ margin: '20px 0 0 0', padding: '20px 0 0 0' }">
        <v-btn
          :style="{ width: '100%', margin: '0 0 30px 0' }"
          outlined
          color="primary"
          @click="copy()"
          >复制</v-btn
        >
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <v-textarea
              flat
              filled
              rows="15"
              name="input-7-4"
              label="Types Template"
              v-model="typesContent"
            ></v-textarea>
          </v-tab-item>
          <v-tab-item>
            <v-textarea
              flat
              filled
              rows="15"
              name="input-7-4"
              label="Store & Reducers Template"
              v-model="reducersContent"
            ></v-textarea
          ></v-tab-item>
          <v-tab-item>
            <v-textarea
              flat
              filled
              rows="15"
              name="input-7-4"
              label="Epics Template"
              v-model="epicsContent"
            ></v-textarea>
          </v-tab-item>
        </v-tabs-items>
      </div>
      <!-- <v-btn
        :style="{ width: '100%', margin: '10px 0 30px 0' }"
        outlined
        disabled
        color="primary"
        color.hover="black"
        color.success="green"
        @click="updateTemplate()"
        >更新</v-btn
      > -->
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
        已复制到剪贴板
      </v-alert>
    </div>
  </v-dialog>
</template>

<script>
import Vue from "vue";
import {
  STORAGE_PREFIX,
  getCurrentPageConfig,
  getInterfaceIdList,
  getInterfaceStorageKey,
} from "../../helpers/data-center";
import {
  getTypesDefine,
  getReducersDefine,
  getEpicsDefine,
} from "../../helpers/generator";

const TABS = {
  types: 0,
  reducers: 1,
  epics: 2,
};

const getTemplateStorageKey = (type) => `${STORAGE_PREFIX}-${type}-template`;

export default Vue.extend({
  name: "template-generator",
  props: ["visible"],
  data() {
    return {
      dialog: false,
      alert: false,
      tab: null,
      genId: null,
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
      val && this.genId && this.gen(this.tab); // 非首次打开时重新生成
    },
    tab(val) {
      this.gen(val);
    },
  },
  mounted() {},
  methods: {
    copy() {
      const content = (() => {
        if (this.tab === 0) {
          return this.typesContent;
        }
        if (this.tab === 1) {
          return this.reducersContent;
        }
        if (this.tab === 2) {
          return this.epicsContent;
        }
      })();
      navigator.clipboard
        .writeText(content)
        .then((clipText) => {
          this.alert = true;
        })
        .then(() => {
          setTimeout(() => {
            this.alert = false;
          }, 1200);
        });
    },
    gen(val) {
      const { pid, id } = getCurrentPageConfig();
      const idList = getInterfaceIdList();
      switch (val) {
        case 0: {
          getTypesDefine(pid, idList)().then((res) => {
            this.typesContent = res;
            console.log("typesContent", { res });
          });
          break;
        }
        case 1: {
          getReducersDefine(pid, idList)().then((res) => {
            this.reducersContent = res;
            console.log("reducersContent", { res });
          });
          break;
        }
        case 2: {
          getEpicsDefine(pid, idList)().then((res) => {
            this.epicsContent = res;
            console.log("epicsContent", { res });
          });
          break;
        }
      }
      this.genId = Date.now();
    },
  },
});
</script>
