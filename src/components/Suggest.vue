<template>
  <v-alert v-if="show_flag" outlined color="grey">
    <v-row>
      <v-col class="ml-2 mb-2">
        幸運券：{{lucky}}枚
        <br />
        割引券：{{discount}}枚
        <br />
        割引率：{{parcentage}}％
      </v-col>
      <v-chip @click="close" outlined small label>
        <v-icon>mdi-close</v-icon>
      </v-chip>
    </v-row>
    <span v-html="message"></span>
  </v-alert>
</template>

<script>
export default {
  data() {
    return {
      show_flag: false,
      // 幸運券の枚数
      lucky: 0,
      // 割引券の枚数
      discount: 0,
      // 割引率
      parcentage: 0,
      // 最も悪い引き方
      worst_case_text: "",
      // もっとも良い引き方
      best_case_text: ""
    };
  },
  computed: {
    /**
     * アラートのメッセージ
     */
    message() {
      if (this.parcentage == 0) {
        return "引き方による消費元宝の変動はありません。";
      }
      return [
        `消費元宝が最も小さくなるのは、<span class="blue--text">${this.best_case_text}</span>です。`,
        `${this.worst_case_text}に比べて、${this.parcentage}％ほどお得になります。`
      ].join("<br />");
    }
  },
  methods: {
    /**
     * アラートを表示する
     */
    show(lucky, discount, parcentage, worst_case_text, best_case_text) {
      this.lucky = lucky;
      this.discount = discount;
      this.parcentage = parcentage;
      this.worst_case_text = worst_case_text;
      this.best_case_text = best_case_text;
      this.show_flag = true;
    },
    /**
     * アラートを閉じる
     */
    close() {
      this.show_flag = false;
    }
  }
};
</script>

<style>
</style>