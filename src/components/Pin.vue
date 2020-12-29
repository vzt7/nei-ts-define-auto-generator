<template>
  <div
    id="pin-wrapper"
    :style="{
      position: 'sticky',
      top: '0',
      right: '0',
      padding: '35px',
      'pointer-events': 'none',
    }"
  >
    <v-row
      class="pin-container"
      v-show="showEntry"
      :style="{
        float: 'right',
        'pointer-events': 'none',
      }"
      justify="end"
    >
      <pin-list
        class="pin-list"
        :style="{
          display: 'flex',
          'flex-flow': 'row nowrap',
          'justify-content': 'space-around',
          'pointer-events': 'auto',
        }"
        :interfaceIdList="interfaceIdList"
      ></pin-list>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            v-on="on"
            :style="btnColor"
            class="mx-2"
            fab
            dark
            small
            color="pink"
            @click="toggle()"
          >
            <v-icon v-show="checked" dark> mdi-emoticon-cool-outline </v-icon>
            <v-icon v-show="!checked" dark>
              mdi-emoticon-confused-outline
            </v-icon>
          </v-btn>
        </template>
        <span>{{ checked ? "移出" : "enjoy" }}</span>
      </v-tooltip>
    </v-row>
  </div>
</template>

<script>
import Vue from "vue";
import PinList from "./PinList";

import {
  getAllTypes,
  getInterface,
  setInterfaceIdList,
  getInterfaceIdList,
  getCurrentPageConfig,
} from "../helpers/data-center";

export default Vue.extend({
  name: "pin",
  components: {
    "pin-list": PinList,
  },
  data() {
    return {
      hover: true,
      checked: false,
      pageConfig: {},
      interfaceIdList: [],
    };
  },
  computed: {
    showEntry() {
      return (
        this.pageConfig &&
        (this.pageConfig.interface || this.pageConfig.datatype) &&
        this.pageConfig.pid &&
        this.pageConfig.id
      );
    },
    btnColor() {
      return this.checked
        ? {
            "pointer-events": "auto",
          }
        : {
            backgroundColor: "black !important",
            "pointer-events": "auto",
          };
    },
  },
  watch: {},
  mounted() {
    this.interfaceIdList = getInterfaceIdList();
    this.pageConfig = getCurrentPageConfig();
    this.pageConfig.pid && getAllTypes(this.pageConfig.pid);
    this.pageConfig.interface && this.setDefaultStatus();

    document.documentElement.addEventListener("click", () => {
      // next task - 在 url 变化后触发
      setTimeout(() => {
        const current = getCurrentPageConfig();
        const prev = this.pageConfig;
        console.log("click & check page: (prev, current) => ", prev, current);

        // 只在 接口页 显示
        if (!current.interface) {
          this.pageConfig.id = null;
          this.pageConfig.pid = null;
          return;
        }
        // 当前 interfaceId 不存在或改变时
        this.pageConfig = {
          ...prev,
          ...current,
        };
        if (current.id !== prev.id) {
          this.setDefaultStatus();
        }
        // 当前 projectId 不存在或改变时
        if (current.pid !== prev.pid) {
          current.pid && getAllTypes(current.pid);
          this.setDefaultStatus();
        }
      }, 0);
    });
  },
  methods: {
    setDefaultStatus() {
      const list = this.interfaceIdList;
      const { id } = this.pageConfig;
      this.checked = id && list.includes(id);
      console.log(list, this.pageConfig);
    },
    toggle() {
      this.pageConfig = getCurrentPageConfig();
      const { id, pid } = this.pageConfig;
      setInterfaceIdList((list) => {
        this.checked = !this.checked;
        const nextList = list.includes(id)
          ? list.filter((itemId) => itemId !== id)
          : list.concat(id);
        this.interfaceIdList = nextList;
        return nextList;
      });
      // fetch interface data
      !this.checked && getInterface(id);
    },
  },
});
</script>
