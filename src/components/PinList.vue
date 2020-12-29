<template>
  <div class="pin-list">
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-fab-transition>
          <v-btn
            :style="{ margin: '0 10px' }"
            v-bind="attrs"
            v-on="on"
            class="mx-2"
            v-show="showGeneratorEntry"
            fab
            dark
            small
            @click="openGenerator()"
            title="模板编辑"
          >
            <v-icon dark> mdi-comment-edit-outline </v-icon>
          </v-btn>
        </v-fab-transition>
      </template>
      <span>模板编辑</span>
    </v-tooltip>
    <template-editor
      :visible="showTemplateEditorModal"
      @close="showTemplateEditorModal = false"
    ></template-editor>

    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-fab-transition>
          <v-btn
            :style="{ margin: '0 10px' }"
            v-bind="attrs"
            v-on="on"
            class="mx-2"
            v-show="showGeneratorEntry"
            fab
            dark
            small
            @click="openTemplateCenter()"
            title="生成器"
          >
            <v-icon dark> mdi-helicopter </v-icon>
          </v-btn>
        </v-fab-transition>
      </template>
      <span>生成器</span>
    </v-tooltip>
    <template-generator
      :visible="showTemplateGeneratorModal"
      @close="showTemplateGeneratorModal = false"
    ></template-generator>
  </div>
</template>

<script>
import Vue from "vue";
import TemplateEditor from "./Modals/TemplateEditor";
import TemplateGenerator from "./Modals/TemplateGenerator";

import { getInterfaceIdList } from "../helpers/data-center";

export default Vue.extend({
  name: "pin-list",
  props: ["interfaceIdList"],
  components: {
    "template-editor": TemplateEditor,
    "template-generator": TemplateGenerator,
  },
  data() {
    return {
      showTemplateEditorModal: false,
      showTemplateGeneratorModal: false,
    };
  },
  computed: {
    showGeneratorEntry() {
      return this.interfaceIdList?.length > 0;
    },
  },
  methods: {
    openGenerator() {
      this.showTemplateEditorModal = true;
    },
    openTemplateCenter() {
      this.showTemplateGeneratorModal = true;
    },
  },
});
</script>
