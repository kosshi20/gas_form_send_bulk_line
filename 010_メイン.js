/**
 * @param {Object} e - フォーム送信のイベントオブジェクト
 */
function doForm(e) {
  const props = PropertiesService.getScriptProperties().getProperties();

  try {
    let itemResponses;
    if (e !== undefined) {
      itemResponses = e.response.getItemResponses();

    } else {
      // 手動でレスポンスを取得する
      const wFormRes = FormApp.getActiveForm().getResponses();
      itemResponses = wFormRes[wFormRes.length - 1].getItemResponses();
    }

    // 各関数間で持ち回る共通のデータを定義
    const config = {
      props: props,
      itemResponses: itemResponses,
    };

    // フォーム回答を解析してconfigへ格納する
    ReportParser.analyzeResponses(config);

    // LINE送信の判定から送信までする
    ReportNotifier.judgementSendLine(config);

  } catch (err) {
    // エラー発生時: エラーを通知する関数を呼び出す
    sendErrorToSlack(props, err);
  }
}


/**
 * 補助関数：エラー通知
 * @param {Object} props - スクリプトプロパティ
 * @param {Object} err - エラー時のメッセージ
 */
function sendErrorToSlack(props, err) {
  const url = props[CONFIG.PROPS.ERR_SLACK_WEBHOOK_URL];

  if (!url) {
    return;
  }

  const message = `【LINE一斉送信】エラーが発生しました:\n${err.stack}`;

  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify({ "text": message })
  };

  UrlFetchApp.fetch(url, options);
}