const ReportParser = {
  /**
   * フォーム回答を解析し、所属別のシートオブジェクトや通知用URLを特定してconfigへ格納する
   * @param {Config} config - 共通データオブジェクト
   */
  analyzeResponses(config) {
    const mappedRes = {};

    for (const item of config.itemResponses) {
      // Googleフォームのタイトルに対応したレスポンスをオブジェクトで使用できるようにする
      mappedRes[item.getItem().getTitle()] = item.getResponse();
    }

    // -----------------------------------------------------------------
    // 【項目追加エリア】フォームに質問を追加した場合は、以下に1行追加します。
    // 例：config.newField = mappedRes[CONFIG.QUESTIONS.NEW_FIELD];
    // -----------------------------------------------------------------
    // 一覧からそれぞれの回答を取得
    // LINEに送る内容を取得
    config.message1 = mappedRes[CONFIG.QUESTIONS.MESSAGE_1] || "";
    // LINEに送る内容の2通目を取得
    config.message2 = mappedRes[CONFIG.QUESTIONS.MESSAGE_2] || "";
    // LINEに送る内容の3通目を取得
    config.message3 = mappedRes[CONFIG.QUESTIONS.MESSAGE_3] || "";
    // LINEに送る内容の4通目を取得
    config.message4 = mappedRes[CONFIG.QUESTIONS.MESSAGE_4] || "";
    // LINEに送る内容の5通目を取得
    config.message5 = mappedRes[CONFIG.QUESTIONS.MESSAGE_5] || "";
    // FB1所属で送る人を取得
    config.fb1Members = mappedRes[CONFIG.QUESTIONS.FB1_MEMBERS] || [];
    // FB2所属で送る人を取得
    config.fb2Members = mappedRes[CONFIG.QUESTIONS.FB2_MEMBERS] || [];
    // TR所属で送る人を取得
    config.trMembers = mappedRes[CONFIG.QUESTIONS.TR_MEMBERS] || [];
    // -----------------------------------------------------------------

    // LINEに送るメッセージの配列を取得
    config.texts = this._createSendMessagesList(config);
  },

  /**
   * 必要なメッセージを配列にする (内部関数)
   * @param {Config} config - 共通データオブジェクト
   * @return {Object} - LINEに送信するメッセージを配列に入れたもの
   */
  _createSendMessagesList(config) {
    const messages = [config.message1, config.message2, config.message3, config.message4, config.message5];

    for (let i = messages.length - 1; i >= 0; i--) {
      // メッセージが空の場合は、配列から削除
      if (!messages[i]) {
        messages.splice(i, 1);
      }
    }
    return messages;
  },

  /**
   * @param {Object} sheet - LINEのユーザーIDが格納されている所属別のシート
   * @param {number} lastCol - 最終列の番号
   * @return {Object} - ヘッダーのタイトル名と列番号のオブジェクト
   */
  // タイトル行の項目名の列のインデックス(列番号 -1)を取得
  getColumnMap(sheet, lastCol) {
    // タイトルの項目を取得
    const headers = sheet.getRange(CONFIG.TABLE.HEADER_ROW, 1, 1, lastCol).getValues().flat();

    const map = {};

    for (const [key, value] of Object.entries(CONFIG.HEADER)) {
      // 表のタイトルに対応した位置をオブジェクトで使用できるようにする
      // 表のタイトルが何番目にあるか取得
      const index = headers.indexOf(value);

      if (index !== -1) {
        // 該当のタイトルがあれば、そのタイトルが何列目かをオブジェクトにする
        map[key] = index;
      }
    }
    return map;
  }
};