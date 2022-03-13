<template>
  <v-sheet height="100%" class="brown darken-4 mb-12" tile>
    <v-row class="fill-height" align="center" justify="center">
      <v-container>
        <v-row align="center" justify="center" class="mt-1">
          <input-field
            key="field"
            v-show="view_status == 0"
            @on-start="onStart"
          ></input-field>
          <result-view
            key="result"
            v-show="view_status == 1"
            @on-click-back="onRestart"
            ref="result"
          ></result-view>
        </v-row>
        <v-row
          align="center"
          justify="center"
          class="head-title white--text mt-2"
          >元宝おいくらニャン？</v-row
        >
        <v-row justify="center" align="center" class="white--text mt-12">
          <v-img src="@/assets/choukoumei.png" max-width="380"></v-img>
        </v-row>
        <v-row justify="center" align="center" class="white--text mt-12">
          ガチャでどれだけ元宝を使うのか、
          <br />あなたの代わりに <br />いっぱい引いて確かめてみるニャン
        </v-row>
      </v-container>
    </v-row>
  </v-sheet>
</template>

<script>
import InputField from "./InputField";
import Result from "./Result";

export default {
  name: "-",
  components: {
    "input-field": InputField,
    "result-view": Result,
  },
  data() {
    return {
      view_status: 0,
    };
  },
  methods: {
    onStart(parameters) {
      this.view_status = 1;
      this.$vuetify.goTo(0);
      this.$nextTick(() => {
        this.$refs.result.execute(parameters);
      });
    },
    onRestart() {
      this.view_status = 0;
      this.$vuetify.goTo(0);
    },
  },
};
</script>

<style scoped>
.head-title {
  font-family: "Hachi Maru Pop", cursive;
  font-size: 28px;
}
.head-message {
  font-family: "Hachi Maru Pop", cursive;
}
</style>
