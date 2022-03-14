<template>
  <v-dialog v-model="dialog" scrollable max-width="360px">
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="primary" outlined dark v-bind="attrs" v-on="on">詳細</v-btn>
    </template>
    <v-card>
      <v-card-title>ガチャ結果詳細</v-card-title>
      <v-divider></v-divider>
      <v-card-text style="height: 300px;">
        <div>消費元宝：{{total.total_price}}</div>
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
                <td>{{ item.text }}</td>
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
export default {
  props: ["parameters", "seeds", "senario"],
  data() {
    return {
      items: [],
      dialog: false,
      total: {
        total_price: 0
      }
    };
  },
  watch: {
    dialog() {
      // ガチャを引くスタイル（単発時に割引券を使うか？）
      const do_not_use_discount_when_one =
        this.parameters.options.pray == 0 ? true : false;

      // 割引券、幸運券、ガチャ券の所持数
      const initializer = data => {
        data.kakutei = this.parameters.kakutei;
        data.tickets = this.parameters.tickets;
        data.lucky = this.parameters.options.lucky;
        data.discount = this.parameters.options.discount;
        return data;
      };

      const calc = new Calculate(
        initializer,
        this.senario,
        this.parameters.request_type,
        this.seeds
      );

      let items = [];
      while (calc.isNeedToExecute(this.parameters.require)) {
        calc.executeStep(this.parameters.require, do_not_use_discount_when_one);
        let kizuna = 0;
        let lucky = 0;
        let discount = 0;
        calc.data.log
          .filter(item => item.startsWith("GET.KIZUNA"))
          .forEach(item => {
            kizuna += parseInt(item.replace("GET.KIZUNA.", ""));
          });
        lucky = calc.data.log.filter(item => item.startsWith("GET.LUCKY"))
          .length;
        discount = calc.data.log.filter(item => item.startsWith("GET.DISCOUNT"))
          .length;
        items.push({
          text: `${calc.data.step}`,
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
</style>