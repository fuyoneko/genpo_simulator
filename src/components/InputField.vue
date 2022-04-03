<template>
  <v-card style="width: 360px">
    <v-container style="width: 340px">
      <v-row class="mt-1">
        <v-select
          outlined
          dense
          label="プリセット"
          :items="preset"
          @change="onPresetChanged"
          return-object
          v-model="current_preset"
        ></v-select>
      </v-row>
      <v-row>
        <v-divider class="mx-4 mb-4"></v-divider>
      </v-row>
      <v-row justify="center">
        <v-radio-group row v-model="forms.selected_radio">
          <v-radio label="アバターガチャ" value="lucky"></v-radio>
          <v-radio label="ラッキーバフ" value="normal"></v-radio>
        </v-radio-group>
      </v-row>
      <v-row>
        <v-subheader>ガチャの設定</v-subheader>
      </v-row>
      <v-row>
        <v-col cols="1"></v-col>
        <v-col cols="10">
          <v-row class="mb-1">
            <v-text-field
              v-model="$v.forms.require.$model"
              hide-details="auto"
              dense
              outlined
              label="必要な絆の数"
              :error-messages="requireError"
            ></v-text-field>
          </v-row>
          <v-row class="mb-1">
            <v-text-field
              v-model="$v.forms.kakutei.$model"
              hide-details="auto"
              dense
              outlined
              label="10の倍数時の絆の排出数"
              :error-messages="kakuteiError"
            ></v-text-field>
          </v-row>
          <v-row class="mb-1">
            <v-select
              dense
              outlined
              hide-details="auto"
              v-show="isTicketsEnabled"
              label="MRアバ：段階報酬"
              :items="reward_items"
              v-model="forms.reward"
            ></v-select>
          </v-row>
        </v-col>
      </v-row>
      <v-row>
        <v-subheader>ガチャ券・幸運券</v-subheader>
      </v-row>
      <v-row>
        <v-col cols="1"></v-col>
        <v-col cols="10">
          <v-row class="mb-1">
            <v-text-field
              v-model="$v.forms.tickets.$model"
              hide-details="auto"
              dense
              outlined
              label="手持ちのガチャ券"
              placeholder="0"
              persistent-placeholder
              :error-messages="ticketsError"
            >
              <v-img slot="prepend" src="@/assets/mizuhiki.png" max-width="28"></v-img>
            </v-text-field>
          </v-row>
          <v-row class="mb-1">
            <v-text-field
              v-model="$v.forms.discount.$model"
              hide-details="auto"
              v-show="isTicketsEnabled"
              dense
              outlined
              label="手持ちの割引券"
              placeholder="0"
              persistent-placeholder
              :error-messages="discountError"
            >
              <v-img slot="prepend" src="@/assets/discount-tickets.png" max-width="28"></v-img>
            </v-text-field>
          </v-row>
          <v-row class="mb-1">
            <v-text-field
              v-model="$v.forms.lucky.$model"
              hide-details="auto"
              v-show="isTicketsEnabled"
              dense
              outlined
              label="手持ちの幸運券"
              placeholder="0"
              persistent-placeholder
              :error-messages="luckyError"
            >
              <v-img slot="prepend" src="@/assets/lucky-tickets.png" max-width="28"></v-img>
            </v-text-field>
          </v-row>
          <v-row>
            <v-select
              class="mb-8"
              v-show="isTicketsEnabled"
              label="ガチャの引き方"
              dense
              outlined
              hide-details="auto"
              :items="pray_style"
              v-model="forms.pray"
              append-outer-icon="mdi-magnify"
              messages="虫眼鏡をタップすると、幸運券と割引券の枚数から、最も安くなる引き方を提案します。"
              @click:append-outer="executeMagnify"
            ></v-select>
          </v-row>
          <v-row>
            <suggest ref="suggest" class="mt-1" v-show="isTicketsEnabled"></suggest>
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <v-divider></v-divider>
    <v-card-actions>
      <v-spacer />
      <v-btn outlined color="primary" @click="onClickStart">計算する</v-btn>
      <v-spacer />
    </v-card-actions>
  </v-card>
</template>

<script>
import { required, maxLength, decimal } from "vuelidate/lib/validators";
import DiscountConditions from "../logic/discount_conditions";
import Suggest from "./Suggest";
import Calculate from "../logic/calculate";
import Senario from "../logic/senario";

const DecimalCheck = (form, min, max) => {
  if (!form.decimal) {
    return false;
  }
  if (!form.maxLength) {
    return false;
  }
  const value = parseInt(form.$model);
  if (value < min) {
    return false;
  }
  if (value > max) {
    return false;
  }
  return true;
};

const REWARD_ITEM_ENABLED = 0;
const REWARD_ITEM_DISABLED = 1;

export default {
  components: {
    suggest: Suggest
  },
  data() {
    const preset = [
      {
        text: "MRアバ（UR閃 -> MR）",
        value: {
          primary_key: "ABATAR1",
          selected_radio: "lucky",
          require: 120,
          reward: REWARD_ITEM_ENABLED,
          kakutei: 5
        }
      },
      {
        text: "MRアバ（UR閃新規＋MR）",
        value: {
          primary_key: "ABATAR2",
          selected_radio: "lucky",
          require: 300,
          reward: REWARD_ITEM_ENABLED,
          kakutei: 5
        }
      },
      {
        text: "新規MR",
        value: {
          primary_key: "NEWMR",
          selected_radio: "normal",
          require: 200,
          reward: REWARD_ITEM_DISABLED,
          kakutei: 5
        }
      },
      {
        text: "MRアバ（UR -> UR閃）",
        value: {
          primary_key: "ABATAR4",
          selected_radio: "lucky",
          require: 120,
          reward: REWARD_ITEM_ENABLED,
          kakutei: 5
        }
      },
      {
        text: "MRアバ（SSR -> UR）",
        value: {
          primary_key: "ABATAR5",
          selected_radio: "lucky",
          require: 60,
          reward: REWARD_ITEM_ENABLED,
          kakutei: 5
        }
      },
      {
        text: "新規UR閃",
        value: {
          primary_key: "NEWURSEN",
          selected_radio: "normal",
          require: 180,
          reward: REWARD_ITEM_DISABLED,
          kakutei: 5
        }
      },
      {
        text: "新規UR",
        value: {
          primary_key: "NEWUR",
          selected_radio: "normal",
          require: 120,
          reward: REWARD_ITEM_DISABLED,
          kakutei: 5
        }
      },
      {
        text: "ラッキースター",
        value: {
          primary_key: "LUCKEYSTART",
          selected_radio: "normal",
          require: 120,
          reward: REWARD_ITEM_DISABLED,
          kakutei: 6
        }
      },
      {
        text: "美少女楽園",
        value: {
          primary_key: "ADEN",
          selected_radio: "normal",
          require: 180,
          reward: REWARD_ITEM_DISABLED,
          kakutei: 6
        }
      }
    ];
    return {
      reward_items: [
        {
          text: "段階報酬あり",
          value: REWARD_ITEM_ENABLED
        },
        {
          text: "段階報酬なし",
          value: REWARD_ITEM_DISABLED
        }
      ],
      pray_style: DiscountConditions.getSelectContents(),
      forms: {
        selected_radio: preset[0].value.selected_radio,
        require: preset[0].value.require,
        tickets: "",
        reward: preset[0].value.reward,
        discount: "",
        lucky: "",
        kakutei: preset[0].value.kakutei,
        pray: DiscountConditions.getDefaultSearchKey()
      },
      preset: preset,
      current_preset: preset[0]
    };
  },
  validations: {
    forms: {
      require: {
        required,
        decimal,
        maxLength: maxLength(3)
      },
      tickets: {
        decimal,
        maxLength: maxLength(4)
      },
      discount: {
        decimal,
        maxLength: maxLength(4)
      },
      lucky: {
        decimal,
        maxLength: maxLength(4)
      },
      kakutei: {
        required,
        decimal,
        maxLength: maxLength(2)
      }
    }
  },
  computed: {
    presetDisplay() {
      return this.preset.map(item => {
        return item;
      });
    },
    isTicketsEnabled() {
      if (this.forms.selected_radio == "lucky") {
        return true;
      }
      return false;
    },

    requireError() {
      const errors = [];
      if (!this.$v.forms.require.$dirty) return errors;
      !this.$v.forms.require.required && errors.push("必須です");
      !DecimalCheck(this.$v.forms.require, 1, 999) &&
        errors.push("1～999で入力してください");
      return errors;
    },

    ticketsError() {
      const errors = [];
      if (!this.$v.forms.tickets.$dirty) return errors;
      !DecimalCheck(this.$v.forms.tickets, 0, 9999) &&
        errors.push("0～9999で入力してください");
      return errors;
    },

    discountError() {
      const errors = [];
      if (!this.$v.forms.discount.$dirty) return errors;
      !DecimalCheck(this.$v.forms.discount, 0, 9999) &&
        errors.push("0～9999で入力してください");
      return errors;
    },

    luckyError() {
      const errors = [];
      if (!this.$v.forms.lucky.$dirty) return errors;
      !DecimalCheck(this.$v.forms.lucky, 0, 9999) &&
        errors.push("0～9999で入力してください");
      return errors;
    },
    kakuteiError() {
      const errors = [];
      if (!this.$v.forms.kakutei.$dirty) return errors;
      !this.$v.forms.kakutei.required && errors.push("必須です");
      !DecimalCheck(this.$v.forms.kakutei, 1, 99) &&
        errors.push("1～99で入力してください");
      return errors;
    }
  },
  methods: {
    /**
     * 現在のフォームの値をDict型に詰め直す
     */
    parseRequestValue() {
      const stringToValue = (string, defaults) => {
        const result = parseInt(string ?? "");
        if (Number.isNaN(result)) {
          return defaults;
        }
        return result;
      };
      return {
        request_type: this.forms.selected_radio,
        tickets: stringToValue(this.forms.tickets, 0),
        require: stringToValue(this.forms.require, 200),
        kakutei: stringToValue(this.forms.kakutei, 5),
        options: {
          discount: stringToValue(this.forms.discount, 0),
          lucky: stringToValue(this.forms.lucky, 0),
          reward: this.forms.reward == REWARD_ITEM_ENABLED ? true : false,
          pray: this.forms.pray
        }
      };
    },
    /**
     * 最適な引き方を提案する
     */
    executeMagnify() {
      this.$v.$touch();
      // 入力チェックが不正なら処理しない
      if (
        this.$v.$invalid ||
        [
          this.requireError,
          this.ticketsError,
          this.discountError,
          this.luckyError,
          this.kakuteiError
        ].some(error => error.length >= 1)
      ) {
        return;
      }

      // 入力パラメータを取得する
      const parameters = this.parseRequestValue();
      const senario_list = Senario.load_senario(
        parameters.request_type,
        parameters.options.reward
      );
      // 消費元宝の変数を確保する
      let min_total_price = 9999999;
      let max_total_price = 0;
      let min_index = DiscountConditions.getDefaultSearchKey();
      let max_index = min_index;

      // 割引券、幸運券、ガチャ券の所持数
      const initializer = data => {
        data.kakutei = parameters.kakutei;
        data.tickets = parameters.tickets;
        data.lucky = parameters.options.lucky;
        data.discount = parameters.options.discount;
        return data;
      };

      for (const conds of DiscountConditions.getConditions()) {
        // 消費元宝を計算する
        const calc = new Calculate(
          initializer,
          senario_list.execute_senario,
          this.forms.selected_radio,
          0
        );
        calc.execute(parameters.require, conds.method);

        // 最小消費を更新する
        let min_update_check = min_total_price;
        min_total_price = Math.min(min_total_price, calc.data.price_total);
        if (min_update_check != min_total_price) {
          min_index = conds.search_key;
        }
        // 比較可能な時（よくあるケースの場合）は、最大消費を更新する
        if (conds.comparable) {
          let max_update_check = max_total_price;
          max_total_price = Math.max(max_total_price, calc.data.price_total);
          if (max_update_check != max_total_price) {
            max_index = conds.search_key;
          }
        }
      }

      // サジェストのアラートを表示する
      this.$refs.suggest.show(
        parameters.options.lucky,
        parameters.options.discount,
        100 - Math.floor((min_total_price / max_total_price) * 100),
        DiscountConditions.getMessage(max_index),
        DiscountConditions.getMessage(min_index)
      );
      // セレクトボックスの内容を更新する
      this.forms.pray = min_index;
    },
    /**
     * イベント：プリセットの設定を更新する
     */
    onPresetChanged(item) {
      this.forms.selected_radio = item.value.selected_radio;
      this.forms.require = item.value.require;
      this.forms.reward = item.value.reward;
      this.forms.kakutei = item.value.kakutei;
      this.forms.discount = "";
      this.forms.lucky = "";
      this.forms.tickets = "";
    },
    /**
     * イベント：検索開始
     */
    onClickStart() {
      this.$v.$touch();
      // 入力チェックが不正なら処理しない
      if (
        this.$v.$invalid ||
        [
          this.requireError,
          this.ticketsError,
          this.discountError,
          this.luckyError,
          this.kakuteiError
        ].some(error => error.length >= 1)
      ) {
        return;
      }

      this.$emit("on-start", this.parseRequestValue());
    }
  }
};
</script>

<style></style>
