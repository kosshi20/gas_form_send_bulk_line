const ReportNotifier = {
  /**
   * LINEを送信するための準備
   * @param {Config} config
   */
  // LINEを送信するための準備をするためのメソッド
  judgementSendLine(config) {
    const targets = [
      { members: config.fb1Members, affiliation: CONFIG.AFFILIATION.FB1 },
      { members: config.fb2Members, affiliation: CONFIG.AFFILIATION.FB2 },
      { members: config.trMembers, affiliation: CONFIG.AFFILIATION.TR }
    ];

    for (const { members, affiliation } of targets) {
      if (members && !members.includes(CONFIG.LABELS.NO_NAME)) {
        this._sendLine(config, affiliation);
      }
    }
  },

  /**
   * 所属ごとにLINEを送信する (内部関数)
   * @param {Config} config
   * @param {string} affiliation - 所属
   */
  _sendLine(config, affiliation) {
    // Messaging APIのチャネルアクセストークン(長期)を取得
    const channelAccessToken = config.props[CONFIG.PROPS.LINE_CHANNEL_ACCESS_TOKEN];

    // 所属ごとにLINEユーザーIDを格納したスプレッドシートのシートを取得
    const sheet = SpreadsheetApp.openById(config.props[CONFIG.PROPS.LINE_SS_ID]).getSheetByName(affiliation);

    const lastCol = sheet.getLastColumn();

    // タイトル行の項目名の列の位置を取得するためにメソッドを呼び出す
    const colMap = ReportParser.getColumnMap(sheet, lastCol);

    const lastRow = sheet.getLastRow();

    // 表のデータを二次元配列で取得
    const dataValues = sheet.getRange(CONFIG.TABLE.DATA_START_ROW, 1, lastRow - CONFIG.TABLE.HEADER_ROW, lastCol).getValues();

    // LINEを送信するメンバーの取得
    let members;
    switch (affiliation) {
      case CONFIG.AFFILIATION.FB1: {
        members = config.fb1Members;
        break;
      }

      case CONFIG.AFFILIATION.FB2: {
        members = config.fb2Members;
        break;
      }

      case CONFIG.AFFILIATION.TR: {
        members = config.trMembers;
        break;
      }
      default: {
        throw new Error(`未知の所属です: ${affiliation}`);
      }
    }

    for (const member of members) {
      for (const dataValue of dataValues) {
        if (member === dataValue[colMap.FAM_NAME]) {
          // Messaging APIを利用するためのURLを取得
          const url = 'https://api.line.me/v2/bot/message/push';

          const headers = {
            "Content-Type": "application/json; charset=UTF-8",
            "Authorization": `Bearer ${channelAccessToken}`
          };

          // メッセージのタイプと返信メッセージを入れるための配列を用意
          const messages = [];

          for (const text of config.texts) {
            if (!text) {
              break;
            }

            // メッセージの引数分、メッセージのタイプと返信メッセージを入れる
            messages.push({ "type": "text", "text": text });
          }

          const payload = {
            "to": dataValue[colMap.USER_ID],
            "messages": messages
          };

          const options = {
            "method": "post",
            "headers": headers,
            "payload": JSON.stringify(payload)
          };

          try {
            UrlFetchApp.fetch(url, options);

          } catch (e) {
            console.error(`${affiliation}所属の${member}さんへのLINE送信時にエラーが発生しました: ${e.message}`);
          }
          break;
        }
      }
    }
  }
};