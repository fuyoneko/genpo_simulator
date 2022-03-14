const REWARD_KIZUNA = "kizuna";
const REWARD_LUCKY = "lucky";
const REWARD_DISCOUNT = "discount";
const MODE_DISCOUNT = "discount";
const MODE_LUCKY = "lucky";
const MODE_NONE = "none";

/**
 * 支払いのシナリオ
 * @param {支払いデータオブジェクト} data
 * @param {消費元宝} price
 * @param {ガチャ回数の追加} add_step
 */
function lucky_senario_payment(data, price, add_step, do_not_discount = false) {
  data.step += add_step;
  let return_mode = MODE_LUCKY;
  if (data.lucky == 0) {
    // 支払い時点で幸運券があれば、幸運券の使用を許可する
    return_mode = MODE_NONE;
  }
  // ガチャチケットがあれば利用する
  // 必ず幸運券を併用する
  if (data.tickets >= 1) {
    data.tickets -= 1;
    data.log.push("USE.TICKETS");
    return return_mode;
  }
  // 幸運券があるのなら、それを優先する
  if (data.lucky >= 1) {
    // 10連であれば無条件で利用する
    if (add_step != 1) {
      data.price_total += price;
      return return_mode;
    }
    // 1連であれば、確定の時だけLuckyを利用する
    if (add_step == 1 && SENARIO_KAKUTEI.condition(data.step)) {
      data.price_total += price;
      return return_mode;
    }
  }
  // 割引券があるなら使用する
  // 割引券をできるだけ使わない設定があれば消費しない
  if (data.discount >= 1 && !do_not_discount) {
    data.price_total += price * 0.8;
    data.discount -= 1;
    data.log.push("USE.DISCOUNT");
    return MODE_DISCOUNT;
  }
  // 幸運、割引なしで元宝を引く
  data.price_total += price;
  return return_mode;
}

const MAPPING_TABLE = [];
for (let index = 0; index < 100; index++) {
  MAPPING_TABLE.push("-");
}
// 絆の排出率
MAPPING_TABLE[1] = REWARD_KIZUNA;
MAPPING_TABLE[2] = REWARD_KIZUNA;
MAPPING_TABLE[3] = REWARD_KIZUNA;
MAPPING_TABLE[4] = REWARD_KIZUNA;
MAPPING_TABLE[5] = REWARD_KIZUNA;
MAPPING_TABLE[6] = REWARD_KIZUNA;
MAPPING_TABLE[7] = REWARD_KIZUNA;
MAPPING_TABLE[8] = REWARD_KIZUNA;
// 割引券の排出率
MAPPING_TABLE[10] = REWARD_DISCOUNT;
MAPPING_TABLE[11] = REWARD_DISCOUNT;
MAPPING_TABLE[12] = REWARD_DISCOUNT;
MAPPING_TABLE[13] = REWARD_DISCOUNT;
// 幸運券の排出率
MAPPING_TABLE[20] = REWARD_LUCKY;
MAPPING_TABLE[21] = REWARD_LUCKY;

// 29回目の確定枠の場合、
const SENARIO_LUCKY = {
  condition: (step) => step == 29,
  process: (data) => {
    data.lucky += 1;
    data.log.push("GET.LUCKY");
  },
};

// ガチャ回数が10の整数倍の場合、報酬の提供割合
const SENARIO_KAKUTEI = {
  condition: (step) => step % 10 == 0,
  process: (data, mode) => {
    if (mode == MODE_LUCKY && data.lucky >= 1) {
      // 幸運券があるなら消費する
      data.current += data.kakutei * 2;
      data.lucky -= 1;
      data.log.push("USE.LUCKY");
      data.log.push(`GET.KIZUNA.${data.kakutei * 2}`);
    } else {
      data.current += data.kakutei;
      data.log.push(`GET.KIZUNA.${data.kakutei}`);
    }
  },
};

// ガチャ一回の提供割合
const SENARIO_GACHA = {
  condition: (step) => {
    // 確定枠なら処理しない
    if (!SENARIO_KAKUTEI.condition(step) && !SENARIO_LUCKY.condition(step)) {
      return true;
    }
    return false;
  },
  process: (data) => {
    const reward = MAPPING_TABLE[data.random.nextInt(0, 100)];
    if (reward == REWARD_KIZUNA) {
      // 絆が排出されたのなら
      data.current += 2;
      data.log.push("GET.KIZUNA.2");
    }
    if (reward == REWARD_DISCOUNT) {
      // 割引券が排出されたのなら
      data.discount += 1;
      data.log.push("GET.DISCOUNT");
    }
    if (reward == REWARD_LUCKY) {
      // 幸運券が排出されたのなら
      data.lucky += 1;
      data.log.push("GET.LUCKY");
    }
  },
};

// すべて絆だった時の提供
const SENARIO_MIN_GACHA = {
  condition: (step) => {
    // 確定枠なら処理しない
    if (!SENARIO_KAKUTEI.condition(step) && !SENARIO_LUCKY.condition(step)) {
      return true;
    }
    return false;
  },
  process: (data) => {
    data.current += 2;
    data.log.push("GET.KIZUNA.2");
  },
};

// 段階報酬
const SENARIO_REWARD = {
  condition: () => {
    return true;
  },
  process: (data, _, step) => {
    if (step == 15) {
      data.tickets += 2;
    }
    if (step == 50) {
      data.tickets += 3;
    }
    if (step == 100) {
      data.tickets += 5;
    }
    if (step == 200) {
      data.tickets += 10;
    }
    if (step == 300) {
      data.tickets += 30;
    }
    if (step == 400) {
      data.tickets += 40;
    }
  },
};

export {
  SENARIO_KAKUTEI,
  SENARIO_GACHA,
  SENARIO_LUCKY,
  SENARIO_REWARD,
  SENARIO_MIN_GACHA,
  lucky_senario_payment,
};
