import { lucky_senario_payment } from "./senario_lucky";
import { normal_senario_payment } from "./senario_normal";
import MersenneTwister from "./mt";

const UNIT_PRICE = 300;
const UNIT_TEN_PRICE = 2980;

class CalculateData {
  constructor(seed) {
    this.kakutei = 5;
    this.step = 0;
    this.price_total = 0;
    this.current = 0;
    this.tickets = 0;
    this.lucky = 0;
    this.discount = 0;
    this.seed = seed;
    this.random = new MersenneTwister(this.seed);
    this.log = [];
  }
}

class Calculate {
  constructor(builder, senario, mode, seed) {
    this.data = builder(new CalculateData(seed));
    this.senario = senario;
    this.mode = mode;
  }

  payment(price, unit, do_not_discount = false) {
    if (this.mode == "lucky") {
      return lucky_senario_payment(this.data, price, unit, do_not_discount);
    } else {
      return normal_senario_payment(this.data, price, unit);
    }
  }

  executeCommon(before, after, mode) {
    for (let index = before; index < after; index++) {
      // ガチャを実行する
      for (const senario of this.senario) {
        if (senario.condition(index + 1)) {
          senario.process(this.data, mode, index + 1);
        }
      }
    }
  }

  executeOne(do_not_discount = false) {
    const before_step = this.data.step;
    // 支払いを実行する
    // 節約の指定があれば幸運券を節約する
    const mode = this.payment(UNIT_PRICE, 1, do_not_discount);
    // ログに記録する
    this.data.log.push("EXECUTE.ONE");
    // ガチャを実行する
    this.executeCommon(before_step, this.data.step, mode);
  }

  executeTen() {
    const before_step = this.data.step;
    // 支払いを実行する
    // 10連の時、割引券の節約はしない
    const mode = this.payment(UNIT_TEN_PRICE, 10, false);
    // ログに記録する
    this.data.log.push("EXECUTE.TEN");
    // ガチャを実行する
    this.executeCommon(before_step, this.data.step, mode);
  }

  executeStep(require, do_not_use_discount_when_one = false) {
    // ログを初期化する
    this.data.log = [];
    if (this.data.tickets >= 1) {
      this.executeOne();
    } else if (this.data.lucky >= 1 && !do_not_use_discount_when_one) {
      // 幸運券があるのなら、単発で引く
      // ※もし割引券の節約が必要なら幸運券による10連を優先する
      this.executeOne(do_not_use_discount_when_one);
    } else if (this.data.current + this.data.kakutei <= require) {
      // 10連を引く
      // 幸運券があればそれを優先して使う。なければ割引券を使う
      this.executeTen();
    } else {
      // 残りの絆の数が確定よりも少ないのなら、単発で引く
      this.executeOne();
    }
  }

  isNeedToExecute(require) {
    return this.data.current < require ? true : false;
  }

  execute(require, do_not_use_discount_when_one = false) {
    while (this.isNeedToExecute(require)) {
      this.executeStep(require, do_not_use_discount_when_one);
    }
  }
}

export default Calculate;
