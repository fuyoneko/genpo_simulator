<template>
  <v-dialog v-model="dialog" scrollable max-width="360px">
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="primary" outlined dark v-bind="attrs" v-on="on">詳細</v-btn>
    </template>
    <v-card>
      <v-card-title>
        <v-select
          :items="result_title"
          v-model="result_selected"
          hide-details="auto"
          dense
          outlined
        ></v-select>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text style="height: 300px;">
        <div>消費元宝：{{total.total_price}}</div>
        <div>ガチャ回数：{{total.total_count}}</div>
        <template v-if="total.show_tickets">
          <div>使用幸運券：{{total.lucky}}</div>
          <div>使用割引券：{{total.discount}}</div>
        </template>
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left"></th>
                <th class="text-center">使用</th>
                <th class="text-center">獲得</th>
                <th class="text-left">累計</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.text">
                <td v-html="item.text"></td>
                <td>
                  <v-row justify="center" v-if="item.use.discount">
                    <v-img src="@/assets/discount-tickets.png" max-width="28"></v-img>
                  </v-row>
                  <v-row justify="center" v-if="item.use.lucky">
                    <v-img src="@/assets/lucky-tickets.png" max-width="28"></v-img>
                  </v-row>
                  <v-row justify="center" v-if="item.use.mizuhiki">
                    <v-img src="@/assets/mizuhiki.png" max-width="28"></v-img>
                  </v-row>
                </td>
                <td v-html="item.get"></td>
                <td v-html="item.situation"></td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn color="blue darken-1" text @click="dialog = false">閉じる</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Calculate from "../logic/calculate";
import DiscountConditons from "../logic/discount_conditions";
export default {
  props: ["parameters", "seeds", "senario"],
  data() {
    return {
      items: [],
      dialog: false,
      total: {
        total_price: 0,
        total_count: 0,
        lucky: 0,
        discount: 0,
        show_tickets: false
      },
      result_title: [
        {
          text: "推定最小（少し運が良い）",
          value: "frequency_min"
        },
        {
          text: "推定中央（真ん中ほど）",
          value: "frequency_mid"
        },
        {
          text: "推定最大（少し運が悪い）",
          value: "frequency_max"
        },
        {
          text: "最も安かったガチャ結果",
          value: "all_min"
        },
        {
          text: "最も高かったガチャ結果",
          value: "all_max"
        }
      ],
      result_selected: "frequency_mid"
    };
  },
  watch: {
    result_selected() {
      this.updateItems();
      this.resetScrollPosition();
    },
    dialog() {
      this.updateItems();
      this.resetScrollPosition();
    }
  },
  methods: {
    resetScrollPosition() {
      // スクロール位置を最上部に移動する
      const elements = document.getElementsByClassName("v-dialog--active");
      if (!elements || elements.length == 0) {
        return;
      }
      const target = elements[0].getElementsByClassName("v-card__text");
      if (!target || target.length == 0) {
        return;
      }
      target[0].scrollTop = 0;
    },
    updateItems() {
      // ガチャを引くスタイル（単発時に割引券を使うか？）
      const discount_condition = DiscountConditons.getMethod(
        this.parameters.options.pray
      );

      // 割引券、幸運券、ガチャ券の所持数
      const initializer = data => {
        data.kakutei = this.parameters.kakutei;
        data.tickets = this.parameters.tickets;
        data.lucky = this.parameters.options.lucky;
        data.discount = this.parameters.options.discount;
        return data;
      };

      // Result.vueと同じパラメータ、同じシード値で再計算する
      const calc = new Calculate(
        initializer,
        this.senario,
        this.parameters.request_type,
        this.seeds[this.result_selected]
      );

      let items = [];
      let total_lucky = 0;
      let total_discount = 0;
      // ガチャを実行する必要があれるあいだはループを繰り返す
      while (calc.isNeedToExecute(this.parameters.require)) {
        // ガチャを一回実行する
        calc.executeStep(
          this.parameters.require,
          discount_condition(calc.data)
        );
        let kizuna = 0;
        let lucky = 0;
        let discount = 0;
        let execute = "単発";
        // 絆の数の変動を合計する
        calc.data.log
          .filter(item => item.startsWith("GET.KIZUNA"))
          .forEach(item => {
            kizuna += parseInt(item.replace("GET.KIZUNA.", ""));
          });
        // 幸運券の変動を取得する
        lucky = calc.data.log.filter(item => item.startsWith("GET.LUCKY"))
          .length;
        // 割引券の変動を取得する
        discount = calc.data.log.filter(item => item.startsWith("GET.DISCOUNT"))
          .length;
        // 10連を引いたのならそれを表示する
        if (calc.data.log.includes("EXECUTE.TEN")) {
          execute = "十連";
        }
        // 幸運券、割引券の総消費数を計算する
        if (calc.data.log.includes("USE.LUCKY")) {
          total_lucky += 1;
        }
        if (calc.data.log.includes("USE.DISCOUNT")) {
          total_discount += 1;
        }
        // 画面に出力する
        items.push({
          text: `${calc.data.step}<br /><span style="font-size: 0.6rem">${execute}</span>`,
          // eslint-disable-next-line no-irregular-whitespace
          get: [`絆 +${kizuna}`, `幸 +${lucky}`, `割 +${discount}`]
            .filter(item => !item.includes("+0"))
            .join("<br />"),
          use: {
            lucky: calc.data.log.includes("USE.LUCKY"),
            discount: calc.data.log.includes("USE.DISCOUNT"),
            mizuhiki: calc.data.log.includes("USE.TICKETS")
          },
          // eslint-disable-next-line no-irregular-whitespace
          situation: `絆　：${calc.data.current}<br />元宝：${calc.data.price_total}<br />幸運：${calc.data.lucky}<br />割引：${calc.data.discount}`
        });
      }
      this.items = items;
      this.total.total_price = calc.data.price_total;
      this.total.total_count = calc.data.step;
      this.total.lucky = total_lucky;
      this.total.discount = total_discount;
      this.total.show_tickets =
        this.parameters.request_type == "lucky" ? true : false;
    }
  }
};
</script>

<style scoped>
thead tr {
  white-space: nowrap;
}
tbody tr {
  height: 80px !important;
  white-space: nowrap;
}
td {
  padding: 0 8px !important;
}
</style>