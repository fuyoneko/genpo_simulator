const EXECUTE_10 = true;
const EXECUTE_1 = false;

const CONDITONS = [
  {
    text: "できるだけ10連で引く",
    search_key: 0,
    comparable: true,
    message: "全て10連で引いたとき",
    method: () => {
      return EXECUTE_10;
    },
  },
  {
    text: "できるだけ単発で引く",
    search_key: 1,
    comparable: true,
    message:
      "幸運券、割引券がいずれも1枚以上あれば単発、それ以外は10連で引いたとき",
    method: () => {
      return EXECUTE_1;
    },
  },
  {
    text: "割引券5以上で単発",
    search_key: 2,
    comparable: false,
    message:
      "幸運券が1枚以上あり、なおかつ割引券が5枚以上あれば単発、それ以外は10連で引いたとき",
    method: (data) => {
      if (data.discount >= 5) {
        return EXECUTE_1;
      }
      return EXECUTE_10;
    },
  },
  {
    text: "割引券10以上で単発",
    search_key: 3,
    comparable: false,
    message:
      "幸運券が1枚以上あり、なおかつ割引券が10枚以上あれば単発、それ以外は10連で引いたとき",
    method: (data) => {
      if (data.discount >= 10) {
        return EXECUTE_1;
      }
      return EXECUTE_10;
    },
  },
  {
    text: "割引券15以上で単発",
    search_key: 4,
    comparable: false,
    message:
      "幸運券が1枚以上あり、なおかつ割引券が15枚以上あれば単発、それ以外は10連で引いたとき",
    method: (data) => {
      if (data.discount >= 15) {
        return EXECUTE_1;
      }
      return EXECUTE_10;
    },
  },
  {
    text: "割引券20以上で単発",
    search_key: 5,
    comparable: false,
    message:
      "幸運券が1枚以上あり、なおかつ割引券が20枚以上あれば単発、それ以外は10連で引いたとき",
    method: (data) => {
      if (data.discount >= 20) {
        return EXECUTE_1;
      }
      return EXECUTE_10;
    },
  },
];

class DiscountConditions {
  /**
   * デフォルトの検索キーを取得する
   */
  static getDefaultSearchKey() {
    return CONDITONS[0].search_key;
  }

  /**
   * セレクトボックスの表示コンテンツを取得する
   */
  static getSelectContents() {
    return CONDITONS.map((item) => {
      return {
        text: item.text,
        value: item.search_key,
      };
    });
  }

  /**
   * 全ての条件定義を返す
   */
  static getConditions() {
    return CONDITONS;
  }

  /**
   * 選択された条件定義の判断関数を返す
   */
  static getMethod(value) {
    const found = CONDITONS.find((item) => item.search_key == value);
    return found.method;
  }

  /**
   * 選択された条件定義のメッセージを返す
   */
  static getMessage(value) {
    const found = CONDITONS.find((item) => item.search_key == value);
    return found.message;
  }
}

export default DiscountConditions;
