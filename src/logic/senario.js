import {
  SENARIO_KAKUTEI,
  SENARIO_GACHA,
  SENARIO_LUCKY,
  SENARIO_REWARD,
} from "./senario_lucky";
import {
  SENARIO_NORMAL_KAKUTEI,
  SENARIO_NORMAL_KAKUTEI_NO_BUFF,
  SENARIO_NORMAL_GACHA,
} from "./senario_normal";

class Senario {
  /**
   * シナリオを読み込む
   * @param {モード：ラッキーバフ、幸運券のいずれか} mode
   * @param {段階報酬の有無} has_reward
   */
  static load_senario(mode, has_reward) {
    const KAKUTEI = mode == "lucky" ? SENARIO_KAKUTEI : SENARIO_NORMAL_KAKUTEI;
    const NO_BUFF_KAKUTEI =
      mode == "lucky" ? SENARIO_KAKUTEI : SENARIO_NORMAL_KAKUTEI_NO_BUFF;
    const GACHA = mode == "lucky" ? SENARIO_GACHA : SENARIO_NORMAL_GACHA;

    let max_senario = [NO_BUFF_KAKUTEI];
    let execute_senario = [KAKUTEI, GACHA];
    if (mode == "lucky") {
      execute_senario.push(SENARIO_LUCKY);
    }
    if (mode == "lucky" && has_reward) {
      execute_senario.push(SENARIO_REWARD);
      max_senario.push(SENARIO_REWARD);
    }
    return {
      max_senario,
      execute_senario,
    };
  }
}

export default Senario;
