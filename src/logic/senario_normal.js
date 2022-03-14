const REWARD_KIZUNA = "kizuna";

/**
 * 支払いのシナリオ
 * @param {支払いデータオブジェクト} data
 * @param {消費元宝} price
 * @param {ガチャ回数の追加} add_step
 */
function normal_senario_payment(data, price, add_step) {
  let result = 1;
  // 初回以外はバフが乗る可能性がある
  if (data.step != 0) {
    result = BUFFER_TABLE[data.random.nextInt(0, 100)];
  }
  // 9回目は2倍以上確定
  if (data.step == 9 && result == 1) {
    result = 2;
  }
  data.step += add_step;
  if (data.tickets >= 1) {
    // 水引があるなら元宝消費しない
    data.tickets -= 1;
    data.log.push("USE.TICKETS");
    return result;
  }
  // 水引を使わない場合
  data.price_total += price;
  return result;
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

const BUFFER_TABLE = [];
for (let index = 0; index < 100; index++) {
  BUFFER_TABLE.push(1);
}
// 5倍バフの適用率
for (let index = 0; index < 2; index++) {
  BUFFER_TABLE[index + 30] = 5;
}
// 2倍バフの適用率
for (let index = 0; index < 15; index++) {
  BUFFER_TABLE[index + 10] = 2;
}

// ガチャ回数が10の整数倍の場合、報酬の提供割合
const SENARIO_NORMAL_KAKUTEI = {
  condition: (step) => step % 10 == 0,
  process: (data, buff) => {
    data.current += data.kakutei * buff;
    data.log.push(`GET.KIZUNA.${data.kakutei * buff}`);
  },
};

// ガチャ回数が10の整数倍の場合、報酬の提供割合
const SENARIO_NORMAL_KAKUTEI_NO_BUFF = {
  condition: (step) => step % 10 == 0,
  process: (data) => {
    data.current += data.kakutei;
    data.log.push(`GET.KIZUNA.${data.kakutei}`);
  },
};

// ガチャ一回の提供割合
const SENARIO_NORMAL_GACHA = {
  condition: (step) => {
    // 確定枠なら処理しない
    if (!SENARIO_NORMAL_KAKUTEI.condition(step)) {
      return true;
    }
    return false;
  },
  process: (data, buff) => {
    const reward = MAPPING_TABLE[data.random.nextInt(0, 100)];
    if (reward == REWARD_KIZUNA) {
      data.current += 2 * buff;
      data.log.push(`GET.KIZUNA.${2 * buff}`);
    }
  },
};

// すべて絆かつバフ5倍だった時の提供
const SENARIO_NORMAL_MIN_GACHA = {
  condition: (step) => {
    // 確定枠なら処理しない
    if (!SENARIO_NORMAL_KAKUTEI.condition(step)) {
      return true;
    }
    return false;
  },
  process: (data, _, step) => {
    if (step != 1) {
      data.current += 2 * 5;
      data.log.push(`GET.KIZUNA.${2 * 5}`);
    } else {
      // 初回は絶対にバフが乗らない
      data.current += 2;
      data.log.push(`GET.KIZUNA.${2}`);
    }
  },
};

export {
  SENARIO_NORMAL_KAKUTEI,
  SENARIO_NORMAL_KAKUTEI_NO_BUFF,
  SENARIO_NORMAL_GACHA,
  SENARIO_NORMAL_MIN_GACHA,
  normal_senario_payment,
};
