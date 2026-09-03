/*
 * 日本語。教会の小グループ（セル・グループ）で使う前提の文言。
 * UI は「です・ます」、ルールページの手順は簡潔に切って読みやすさを優先。
 */
export default {
  htmlLang: 'ja',
  ogLocale: 'ja_JP',

  seoTitle: 'ハッピービンゴ｜数字ではなく人を探すアイスブレイクビンゴ',
  seoDesc:
    '小グループや歓迎会で使えるアイスブレイクゲーム。マスに書いてあるのは数字ではなく「楽器が弾ける人」といった説明で、その場で当てはまる人を見つけて、本人にスマホで確認してもらえばマスが埋まります。ダウンロードも登録も不要。二人からでも遊べます。',
  rulesSeoTitle: 'ハッピービンゴ — 遊び方',
  rulesSeoDesc:
    'ルームの立て方、カードの設定、マッチングと確認の流れ、そして進行役が最初に伝えておくことをまとめました。',

  navTitle: 'ハッピービンゴ',
  navRules: '遊び方',
  rulesLinkText: 'はじめての方はこちら →',
  langSwitchLabel: '言語を変更',
  themeToggleLabel: 'ライト／ダークを切り替え',

  heroTitle: 'ハッピービンゴ：人を見つけて、少し話して、マスを埋める',
  heroDesc:
    '一人ずつビンゴカードを受け取ります。マスにあるのは数字ではなく「今年はじめて小グループに来た人」といった説明。当てはまる人をその場で見つけ、相手が自分のスマホで確認したらマスが埋まります。進行役が決めた本数そろえば勝ちです。',

  createHeading: 'ルームを作る',
  maxPlayersLabel: '予定人数',
  maxPlayersHint: '2〜30 人（自分を含む）。二人からでも遊べます。',
  createButton: 'ルームを作る',
  creating: '作成中…',
  createFailed: 'ルームを作れませんでした。もう一度お試しください。',

  joinHeading: '既存のルームに参加',
  roomCodeLabel: 'ルームコード',
  roomCodePlaceholder: '例：A3KP',
  nicknameLabel: 'あなたの名前',
  nicknamePlaceholder: 'みんなが分かる呼び名',
  avatarLabel: 'アイコンを選ぶ',
  joinButton: '参加',

  joinTitle: '{code} に参加',
  profileContinue: 'ルームに入る',
  playerBadge: 'プレイヤー',
  cancelButton: 'キャンセル',
  backHome: 'トップへ戻る',
  rulesBack: '← ゲームに戻る',
  roomClosedTitle: 'ルームは閉じられました',
  roomClosedDesc: '進行役がこのルームを閉じました。',
  kickedTitle: 'ルームから退出しました',
  kickedDesc: '進行役があなたをこのルームから外しました。',

  roomCodeCaption: 'ルームコード',
  shareHint: 'この QR コードを読み取るか、上のコードを直接入力してください。',
  qrAlt: 'ルームに参加するための QR コード',
  copyLinkButton: 'リンクをコピー',
  copiedToast: 'リンクをコピーしました',

  settingsHeading: 'このラウンドの設定',

  sizeLabel: 'カードのサイズ',
  sizeHint: '3×3 は 5〜8 人や短時間向け、5×5 は人数が多く時間に余裕があるとき向けです。',
  sizeOption: '{size}×{size}',

  targetLinesLabel: '勝利に必要な本数',
  targetLinesUnit: '{n} 本',
  targetLinesHint:
    '{size}×{size} には全部で {total} 本のラインがあり、{n} 本そろえるには最低 {cells} マス必要です。',

  hostPlaysLabel: '進行役も一緒に遊ぶ',
  hostPlaysHint: 'オフにすると進行だけを担当し、カードは配られません。名簿には残るので、ほかの人があなたを選んで確認を頼むことはできます。',
  winnerCountLabel: '何人が達成したら終了',
  winnerCountUnit: '{n} 人',
  winnerCountUnlimited: '制限なし',
  winnerCountHint: 'この人数が達成した時点で自動的に終了し、最終ランキングに切り替わります。進行役はいつでも「このラウンドを終了」できます。',
  selfClaimLabel: '「該当者なし、自己申告」を許可',
  selfClaimHint: '当てはまる人が見つからないときに自分で埋められます。ランキングでは別の色で表示されます。2〜4 人のときはオンがおすすめです。',

  anchorHeading: '中央固定のマス',
  anchorHint:
    'このマスは 4 本のラインに同時にかかる中心の位置です。「全員が必ず誰かを見つけられる」お題を入れてください。',
  anchorCustomLabel: 'お題を自分で書く',
  anchorCustomPlaceholder: '例：今日この集まりに来た人',

  questionsHeading: 'お題',
  questionsCount: '{total} 問中 {n} 問',
  questionsNeedMore: 'あと {n} 問',
  questionsTooMany: '{n} 問多いです',
  questionsReady: 'ちょうど良い数です。始められます',
  selectedHeading: '選んだお題',
  setupDoneButton: 'ルームを作る',
  saveSettingsButton: '完了',
  editSettingsButton: '設定をカスタム',
  settingsSummary: '{size}×{size}・{n} 本で勝ち・{total} 問',
  randomButton: 'ランダム',
  clearButton: 'クリア',
  categorySelectAll: 'すべて選択',

  customLabel: 'お題を自分で作る',
  customPlaceholder: '例：タピオカドリンクを自分で作れる人',
  customAddButton: '追加',
  customRemoveLabel: 'このお題を削除',

  categoryLife: '生活習慣',
  categoryTalent: '特技',
  categoryExperience: '経験',
  categoryChurch: 'グループの活動',
  categoryPersonality: '性格',
  categoryFood: '食べもの',
  categoryHobby: '趣味',

  playersHeading: 'ルームにいる人',
  playersCount: '{total} 人中 {n} 人',
  waitingForHost: '進行役が始めるのを待っています。名前がみんなに分かるか確認しておきましょう。',
  hostBadge: '進行役',
  spectatorBadge: '見学',
  offlineBadge: 'オフライン',
  kickLabel: 'ルームから外す',

  startButton: 'ゲームを始める',
  startBlockedQuestions: 'お題がまだ足りません',
  startBlockedAnchor: '中央のお題が未設定です',
  startBlockedPlayers: '始めるには最低二人必要です',

  cardHint: 'お題に合う人を、その場で見つけに行きましょう！',
  progressHeading: '{target} 本中 {done} 本',
  progressCells: '{n} マス達成',
  progressWon: '目標達成です。全マス制覇を狙いましょう',
  blackoutBadge: '全マス制覇',
  wonBadge: '達成',

  cellPending: '確認待ち',
  cellSelf: '自己申告',
  cellWaiting: '{name} の確認待ち',
  cellDone: '{name} が確認',

  pickHint:
    'いま話した人のなかから、このマスに当てはまる人を選んでください。送ったあとは相手が自分のスマホで確認するのを待ちます。',
  pickEmpty: 'まだほかに誰もいません。',
  pickCancel: 'キャンセル',
  selfClaimButton: '該当者なし、自己申告',

  cancelRequestButton: 'キャンセル',

  incomingHeading: 'あなたの確認待ち',
  incomingEmpty: 'いま確認を求められているものはありません。',
  incomingLine: '{name} があなたを選びました',
  confirmButton: '確認する',
  declineButton: 'ちがいます',

  leaderboardLines: '{n} 本',
  leaderboardCells: '{n} マス',
  leaderboardWaiting: '{n} 人が確認待ち',

  screenCard: 'マイカード',
  boardHeading: 'ランキング',
  listHeading: 'お題',
  pickPendingBadge: '確認待ち',
  screenRequests: 'あなたの確認待ち',

  endButton: 'このラウンドを終了',
  endedHeading: 'ランキング',
  endedDesc: 'このラウンドは終了しました。結果を見てみましょう！',
  resetButton: 'ルームに戻る',

  leaveRoomButton: 'ルームを出る',
  closeRoomButton: 'ルームを閉じる',
  confirmLeaveTitle: 'ルームを出ますか？',
  confirmLeaveDesc: '出るとあなたのカードと進捗はこのラウンドから消えます。',
  confirmLeaveOk: '出る',
  confirmCloseTitle: 'ルームを閉じますか？',
  confirmCloseDesc: '全員が退出になり、このラウンドの結果は残りません。',
  confirmCloseOk: 'ルームを閉じる',
  confirmEndTitle: 'このラウンドを終了しますか？',
  confirmEndDesc: '終了するとマッチングはできなくなり、最終ランキングに切り替わります。',
  confirmEndOk: '終了する',


  toastConfirmed: '{name} が確認しました。マス達成！',
  toastDeclined: '{name} は当てはまらないとのことです。ほかの人を探しましょう',
  toastLine: '{n} 本そろいました',
  toastWon: '目標達成！{n} 本そろいました',

  errorTitle: 'このルームに入れません',
  errRoomNotFound: 'そのコードのルームが見つかりません。もう一度ご確認ください。',
  errRoomFull: 'ルームが満員です。',
  errRoomStarted: 'このラウンドはすでに始まっています。',
  errNicknameRequired: '先に名前を入力してください。',
  errNicknameTaken: 'その名前はすでに使われています。別の名前にしてください。',
  errCannotPickSelf: '自分は選べません。',
  errAlreadyMarked: 'このマスはすでに埋まっています。',
  errAlreadyPending: 'このマスはすでに確認待ちです。',
  errSelfClaimDisabled: '進行役が自己申告を許可していません。',
  errSpectatorOnly:
    '途中から参加したのでこのラウンドはカードがありません。ほかの人の確認はできます。',
  errQuestionCount: 'お題の数とマスの数が合っていません。',
  errAnchorRequired: '中央のお題がまだ設定されていません。',
  errNoPlayers: 'ルームにまだ誰もいません。',
  errNetwork: '接続が切れました。再接続しています…',

  mcHeading: 'このラウンドは進行だけを担当します',
  mcDesc:
    '「進行役も一緒に遊ぶ」をオフにしたので、あなたのカードはありません。ほかの人があなたを選ぶことはでき、確認もできます。一緒に遊びたいときはロビーの「設定をカスタム」からオンにすれば、次のラウンドでカードが配られます。',
  spectatorHeading: '途中から参加しました',
  spectatorDesc:
    'このラウンドのお題とカードは開始時に確定したので、あなたのカードはありません。名簿には入っているので、ほかの人があなたを選ぶことはでき、確認もできます。次のラウンドではカードが配られます。',

  rulesTitle: 'ハッピービンゴの遊び方',
  rulesIntro:
    '1 ラウンドはサイズと勝利条件によって 10〜20 分ほど。進行役とプレイヤー、それぞれが知っておくことをまとめました。',
  rulesHostHeading: '進行役',
  rulesHostSteps: [
    'カードのサイズを決めます。3×3 は 5〜8 人や短時間、5×5 は人数が多く時間に余裕があるとき、4×4 はその中間です。',
    '3×3 と 5×5 では中央のお題を用意します。基準は「その場の全員が必ず誰かを見つけられる」こと。いちばん安全なのは「今日この集まりに来た人」です。4×4 にこのマスはありません。',
    'お題を必要数そろえます（3×3 は 9 問、4×4 は 16 問、5×5 は 25 問）。「誰も当てはまらない」「一人しか当てはまらない」お題は差し替えてください。',
    '何本そろえば勝ちかを決めます。人数が少ない、時間が短いときは少なめに。',
    '人数が少ないときは自己申告をオンに。そうしないと該当者のいないマスで止まります。',
    '最初の一分で三つだけ伝えます。相手本人の確認が必要なこと、目標に届いてもゲームは続くこと、順位はあくまで余興だということ。',
  ],
  rulesPlayerHeading: 'プレイヤー',
  rulesPlayerSteps: [
    '名前を入れて参加し、進行役が始めるのを待ちます。',
    'カードが配られたらお題に目を通します。お題の内容は全員同じですが、並び順は一人ずつ違います。',
    '見つけられそうなマスを選んで、当てはまる人に話しかけに行きます。',
    'スマホに戻ってそのマスをタップし、いま話した人を名簿から選んで送ります。',
    '相手が確認してはじめてマスが埋まります。返事がなければ取り消せますし、断られたら別の人を探しましょう。',
    '確認を頼まれたら、説明をよく読んでからタップしてください。確認は取り消せません。',
  ],
  rulesFaqHeading: 'よくある質問',
  rulesFaq: [
    {
      q: 'みんな同じカードですか？',
      a: 'お題の内容は同じで、全員が同じお題のセットを使います。ただし並び順は一人ずつ違うので、あなたの 3 番目と隣の人の 3 番目は別のお題です。3×3 と 5×5 の中央だけは例外で、全員共通のお題が入ります。',
    },
    {
      q: '同じ人を何度も選んでいいですか？',
      a: 'はい、制限はありません。だから二人からでも遊べます。人数が多い場では、お題そのものが自然といろいろな人のほうへ向かわせてくれます。',
    },
    {
      q: '1 本そろったら勝ちですか？ゲームは止まりますか？',
      a: '勝利条件は進行役が決めた本数で、1 本とは限りません。それに誰かが達成してもゲームは止まらず、進行役が終了するまで続きます。達成した人は全マス制覇を狙えます。',
    },
    {
      q: '確認したあとで取り消せますか？',
      a: 'できません。タップした瞬間に確定するので、先に説明を読んでください。断るほうは別で、マスが埋まる前の話です。',
    },
    {
      q: '遅れて来た人は参加できますか？',
      a: '名簿には入れますが、そのラウンドのカードはありません（お題は開始時に確定するため）。ほかの人から選ばれることも、確認することもでき、次のラウンドではカードが配られます。',
    },
  ],
};
