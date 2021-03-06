<template>
  <v-card style="width: 360px">
    <v-container style="width: 340px">
      <v-card-text>
        <v-row v-for="data in results" :key="data.id" align="center">
          <!-- データを表示する -->
          <template v-if="data.type == 'text'">
            <v-col cols="5">
              <v-subheader>{{ data.title }}</v-subheader>
            </v-col>
            <v-col cols="7" style="font-size: 18px">
              <v-input :messages="data.descript" :hide-details="!help_message">{{ data.value }}</v-input>
            </v-col>
          </template>
          <!-- ヘッダテキストを引く -->
          <template v-if="data.type == 'header'">
            <v-card-subtitle>{{ data.title }}</v-card-subtitle>
          </template>
          <!-- 分割線を引く -->
          <template v-if="data.type == 'line'">
            <v-divider></v-divider>
          </template>
        </v-row>
        <v-row>
          <chart-graph ref="graph"></chart-graph>
        </v-row>
      </v-card-text>
    </v-container>

    <v-divider></v-divider>
    <v-card-actions>
      <v-btn :color="help_message? 'primary':'grey'" icon outlined @click="onClickHelp">
        <v-icon>mdi-help</v-icon>
      </v-btn>
      <v-spacer />
      <v-btn outlined color="primary" @click="onClickBack">戻る</v-btn>
      <v-spacer />
      <data-list :parameters="parameters" :seeds="seeds" :senario="senario"></data-list>
    </v-card-actions>
  </v-card>
</template>

<script>
import ChartGraph from "./ChartGraph";
import Calculate from "../logic/calculate";
import DataList from "./DataList";
import DiscountConditons from "../logic/discount_conditions";
import Senario from "../logic/senario";

const ValueToString = value => {
  if (value === undefined) {
    return "-";
  }
  if (typeof value == "number") {
    return value.toLocaleString();
  }
  return value;
};

export default {
  components: {
    "chart-graph": ChartGraph,
    "data-list": DataList
  },
  data() {
    return {
      results: [],
      help_message: false,
      parameters: null,
      seeds: 0,
      senario: []
    };
  },
  methods: {
    onClickBack() {
      this.$emit("on-click-back");
    },
    onClickHelp() {
      this.help_message = !this.help_message;
    },
    execute(parameters) {
      // 必要な絆の数
      const require = parameters.require;
      // 確定時の絆排出数
      const kakutei = parameters.kakutei;
      // ガチャを引くスタイル（単発時に割引券を使うか？）
      const discount_condition = DiscountConditons.getMethod(
        parameters.options.pray
      );
      // 検証回数
      const tests = 1000;
      // モード
      const mode = parameters.request_type;
      // 段階報酬の有無
      const has_reward = parameters.options.reward;

      // 割引券、幸運券、ガチャ券の所持数
      const initializer = data => {
        data.kakutei = kakutei;
        data.tickets = parameters.tickets;
        data.lucky = parameters.options.lucky;
        data.discount = parameters.options.discount;
        return data;
      };

      // ガチャのパラメータ
      const { max_senario, execute_senario } = Senario.load_senario(
        mode,
        has_reward
      );

      // 計算結果を格納する変数
      let min_price = Number.MAX_SAFE_INTEGER;
      let max_price = Number.MIN_SAFE_INTEGER;
      let min_step = Number.MAX_SAFE_INTEGER;
      let max_step = Number.MIN_SAFE_INTEGER;
      let total_price = 0;
      let total_count = 0;
      let seed_map = [];

      // 取得数をヒストグラム化するための変数
      const binning = [];
      const stride = 2000;
      const bin_max = 200000;
      for (let value = 0; value < bin_max; value += stride) {
        binning.push({
          min: value,
          max: value + stride,
          text: `${ValueToString(value)} ～ ${ValueToString(
            value + stride - 1
          )}`,
          count: 0
        });
      }

      const addToBinning = (binning, price) => {
        for (const bin of binning) {
          if (price >= bin.min && price < bin.max) {
            bin.count += 1;
          }
        }
      };

      // 最大を計算する
      const calc_max = new Calculate(
        initializer,
        max_senario,
        mode,
        Math.floor(Math.random() * 99999999)
      );
      calc_max.execute(require, discount_condition);

      for (let index = 0; index < tests; index++) {
        // ガチャの結果を取得する
        const calc = new Calculate(
          initializer,
          execute_senario,
          mode,
          Math.floor(Math.random() * 99999999)
        );
        calc.execute(require, discount_condition);

        min_price = Math.min(calc.data.price_total, min_price);
        max_price = Math.max(calc.data.price_total, max_price);
        min_step = Math.min(calc.data.step, min_step);
        max_step = Math.max(calc.data.step, max_step);
        total_price += calc.data.price_total;
        total_count += 1;

        addToBinning(binning, calc.data.price_total);
        seed_map.push({ seed: calc.data.seed, price: calc.data.price_total });
      }

      // 平均を計算する
      const average = Math.floor(total_price / total_count);

      // ビンニングしたヒストグラムのうち、有効なデータのない範囲を削除する
      const min_index = binning.findIndex(object => object.count != 0);
      binning.splice(0, min_index);
      binning.reverse();
      const last_index = binning.findIndex(object => object.count != 0);
      binning.splice(0, last_index);
      binning.reverse();

      // 最頻領域を取得する
      const max_element = binning.reduce((previous, current) => {
        if (previous && previous.count > current.count) {
          return previous;
        }
        return current;
      });

      // 最頻領域の最小値を取得する
      const frequency_area = seed_map.sort((a, b) => a.price - b.price);
      const all_min = frequency_area[0];
      const frequency_area_min = frequency_area.find(
        item => item.price > max_element.min
      );
      const frequency_area_mid = frequency_area.find(
        item => item.price > (max_element.min + max_element.max) / 2
      );
      // 順序を反転する
      frequency_area.reverse();
      const all_max = frequency_area[0];
      const frequency_area_max = frequency_area.find(
        item => item.price < max_element.max
      );

      // 最頻値が取得できなかった場合、処理を終了する
      if (
        frequency_area_min === undefined ||
        frequency_area_mid === undefined ||
        frequency_area_max === undefined
      ) {
        this.results = [
          {
            title: `シミュレーション結果`,
            type: "header"
          },
          {
            title: "結果",
            value: `必要な元宝はありません`,
            descript: "ガチャ券による割引が上限を超えています",
            type: "text"
          }
        ];
        this.$refs.graph.execute(binning);
        return;
      }

      // 詳細画面に連携する
      this.parameters = parameters;
      this.seeds = {
        all_min: all_min.seed,
        all_max: all_max.seed,
        frequency_min: frequency_area_min.seed,
        frequency_mid: frequency_area_mid.seed,
        frequency_max: frequency_area_max.seed
      };
      this.senario = execute_senario;

      // 概要に連携する
      this.results = [
        {
          title: "計算上の最大元宝",
          type: "header"
        },
        {
          title: "底引き",
          value: `${ValueToString(calc_max.data.price_total)}`,
          descript: "確定以外の絆が排出されなかった場合の消費元宝",
          type: "text"
        },
        {
          title: `シミュレーション結果`,
          type: "header"
        },
        {
          title: "範囲",
          value: `${ValueToString(min_price)} ～ ${ValueToString(max_price)}`,
          descript: "消費元宝の最高/最低",
          type: "text"
        },
        {
          title: "回数",
          value: `${ValueToString(min_step)} ～ ${ValueToString(max_step)}`,
          descript: "ガチャを引いた回数の最高/最低",
          type: "text"
        },
        {
          title: "平均",
          value: `${ValueToString(average)}`,
          descript: "消費元宝の平均",
          type: "text"
        },
        {
          title: "推定",
          value: `${max_element.text}`,
          descript: "最も多くのユーザーが引くのにかかった元宝",
          type: "text"
        },
        { type: "line" }
      ];

      this.$refs.graph.execute(binning);
    }
  }
};
</script>

<style></style>
