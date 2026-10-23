/*
 * 關於我們（/{lang}/about/）、聯絡我們（/{lang}/contact/，意見表單）與隱私權政策（/{lang}/privacy/）的文案，8 種語言（2026-10-22）。
 * prerender 會把這份併進 STRINGS[lang].about。各語言逐句照當地說法寫，不要丟翻譯 API。
 *
 * 表單送到 apps/feedback（Cloudflare Worker，寄到 woohop.app@gmail.com）。
 * 類型的鍵（recommend / idea / collab / other；回報問題併進 idea「修改建議」）兩邊要一致：apps/feedback/src/feedback.js 的 TYPES。
 *
 * 隱私權政策的段落可以用 **粗體** 與 [文字](網址)。內容要跟網站實際做的事一致：
 * 加了新的第三方服務（例如廣告、贊助金流）就要改這裡，也要改 updated 日期。
 */

export const FEEDBACK_TYPES = ['recommend', 'idea', 'collab', 'other'];

const GA_OPTOUT = 'https://tools.google.com/dlpage/gaoptout';
const GOOGLE_PARTNERS = 'https://policies.google.com/technologies/partner-sites';

export const ABOUT = {
  'zh-TW': {
    seoTitle: '關於我們｜Woohop 免費團康破冰遊戲',
    seoDesc: 'Woohop 是免費的線上團康與破冰遊戲網站：打開就能玩、不用註冊，每個遊戲都附玩法與帶領說明，支援 8 種語言。',
    h1: '關於 Woohop',
    lead: '讓帶活動變簡單：打開網頁就能玩的團康、破冰遊戲與桌遊小工具。',
    story: 'Woohop 收集了適合聚會、課堂、團契和公司活動的團康與破冰遊戲，全部做成打開網頁就能玩的版本。另外也有阿瓦隆語音主持、節拍器、抽卡取名這類玩桌遊、帶團康時用得到的小工具。',
    contactHeading: '聯絡我們',
    contactLead: '想推薦遊戲、發現哪裡壞掉、或有任何建議，都歡迎告訴我們，每一則都會看。',
    mailLead: '也可以直接寫信給我們：',
    form: {
      type: '想跟我們說什麼？',
      types: { recommend: '推薦遊戲', idea: '修改建議', collab: '合作邀約', other: '其他' },
      game: '跟哪個遊戲有關？（選填）',
      gameNone: '沒有特定的',
      gameSearch: '打字找遊戲，例如「炸彈」',
      gameNoMatch: '找不到符合的遊戲',
      gameSite: '網站整體',
      message: '內容',
      placeholders: {
        recommend: '遊戲叫什麼、怎麼玩、適合幾個人？',
        idea: '哪裡壞掉、或哪裡可以更好？如果是問題，請寫在哪一頁、發生什麼事，用手機還是電腦。',
        collab: '簡單介紹你和想合作的內容',
        other: '想說什麼都可以',
      },
      email: '你的 Email（選填）',
      emailHelp: '想收到回覆再留，只會用來回覆你。',
      send: '送出',
      sending: '送出中…',
      sentTitle: '收到了，謝謝你！',
      sentDesc: '我們會仔細看。有留 Email 的話，需要時會回信給你。',
      again: '再寫一則',
      errMessage: '請至少寫 5 個字。',
      errEmail: 'Email 格式好像不對。',
      errRate: '送出太多次了，請過一分鐘再試。',
      errServer: '送出失敗，請稍後再試，或直接寫信給我們。',
      privacyNote: '送出即表示你同意我們依照{link}處理這則訊息。',
    },
    privacy: {
      seoTitle: '隱私權政策｜Woohop',
      seoDesc: 'Woohop 如何處理你的資料：不用註冊、不收集個人資料；使用 Google Analytics 匿名統計，房間資料 3 小時沒有動作就刪除。',
      h1: '隱私權政策',
      updated: '最後更新：2026 年 10 月 22 日',
      lead: 'Woohop（www.vibeweb100.com）是免費的團康與破冰遊戲網站。這一頁說明我們會接觸到哪些資料、怎麼使用，以及你可以怎麼做。',
      sections: [
        ['目前不用註冊', [
          '現在使用 Woohop 不需要帳號，我們也不會要你提供姓名、電話、地址或任何身分資料。如果未來推出會員功能，註冊會是自願的，而且我們會先更新這一頁，說明會收集哪些資料、怎麼使用。',
        ]],
        ['你在遊戲裡輸入的內容', [
          '需要多支手機一起玩的房間型遊戲（例如{rooms}），會把你輸入的暱稱和作答暫存在我們的伺服器，讓同一個房間的人看得到。**房間 3 小時沒有任何動作就會整個刪除**，我們不會另外保存。',
          '只用一支手機或不用手機的遊戲、以及桌遊小工具，都在你的裝置上執行，內容不會傳到伺服器。',
        ]],
        ['意見表單', [
          '你透過「聯絡我們」送出的內容，以及你自願留下的 Email，會寄到我們的信箱。只用來回覆你和改進網站，不會拿去行銷，也不會提供給其他人。',
        ]],
        ['瀏覽器儲存與 Cookie', [
          '我們用瀏覽器的本機儲存（localStorage）和一個名為 web100_lang 的 Cookie，記住你選的語言、深淺模式和遊戲設定。這些只存在你的裝置上，不會用來追蹤你。',
        ]],
        ['使用統計（Google Analytics）', [
          '我們使用 Google Analytics 4 了解網站的使用情況，例如哪些頁面被打開、用什麼裝置、大約從哪個國家或地區來，以及在遊戲裡按了哪些按鈕。這些是匿名的統計資料，用來決定要改進哪些遊戲。',
          'Google Analytics 會在你的瀏覽器設定 Cookie。想知道 Google 怎麼處理這些資料，請看[Google 的說明](' + GOOGLE_PARTNERS + ')；不想被統計，可以安裝 [Google Analytics 停用外掛程式](' + GA_OPTOUT + ')。',
        ]],
        ['主機與其他服務', [
          '網站和遊戲伺服器由 Vercel 與 Cloudflare 提供，字型來自 Google Fonts。這些服務為了安全與維運，會留下一般的連線紀錄（例如 IP 位址、瀏覽器類型），我們不會用這些資料辨識你是誰。',
        ]],
        ['廣告', [
          '目前網站上沒有廣告。如果未來加入廣告（例如 Google AdSense），會先更新這一頁，說明廣告商會使用哪些 Cookie 以及你可以怎麼選擇。',
        ]],
        ['兒童', [
          '各年齡的團體都可以使用 Woohop，我們不會刻意收集任何人的個人資料。如果孩子透過表單留下了 Email 或其他資料，家長可以寫信請我們刪除。',
        ]],
        ['你的權利與聯絡方式', [
          '想查詢或刪除你透過表單提供的資料，或對這份政策有任何問題，請寫信到 {mail}，或使用[聯絡表單]({contact})。',
        ]],
        ['政策更新', [
          '這份政策如果有變更，會更新這一頁和上面的日期。',
        ]],
      ],
    },
  },

  en: {
    seoTitle: 'About us | Woohop — free group games and icebreakers',
    seoDesc: 'Woohop is a free website of group games and icebreakers that run in your browser — no sign-up, with rules and host tips for every game, in 8 languages.',
    h1: 'About Woohop',
    lead: 'Making it easy to run an activity: group games, icebreakers and board game helpers that work right in your browser.',
    story: 'Woohop collects group games and icebreakers for parties, classrooms, small groups and team events, and turns them into versions you can play straight from a web page. There are also handy helpers for board game nights and activities, like a voice narrator for Avalon, a metronome and a name picker.',
    contactHeading: 'Contact us',
    contactLead: 'Want to suggest a game, found something broken, or have an idea? Tell us — we read every message.',
    mailLead: 'Or email us directly:',
    form: {
      type: 'What’s it about?',
      types: { recommend: 'Suggest a game', idea: 'Feedback', collab: 'Partnership', other: 'Other' },
      game: 'Which game? (optional)',
      gameNone: 'Not a specific one',
      gameSearch: 'Type to find a game, e.g. “bomb”',
      gameNoMatch: 'No matching game',
      gameSite: 'The website in general',
      message: 'Message',
      placeholders: {
        recommend: 'What’s the game called, how is it played, and for how many people?',
        idea: 'Something broken, or something that could be better? For a problem, tell us which page, what happened, and whether you were on a phone or computer.',
        collab: 'Tell us a little about yourself and what you have in mind',
        other: 'Anything you’d like to say',
      },
      email: 'Your email (optional)',
      emailHelp: 'Only if you’d like a reply. We’ll use it for nothing else.',
      send: 'Send',
      sending: 'Sending…',
      sentTitle: 'Got it — thank you!',
      sentDesc: 'We’ll read it carefully. If you left an email, we’ll reply when needed.',
      again: 'Write another',
      errMessage: 'Please write at least 5 characters.',
      errEmail: 'That email address doesn’t look right.',
      errRate: 'Too many messages — please try again in a minute.',
      errServer: 'Couldn’t send. Please try again later, or email us directly.',
      privacyNote: 'By sending, you agree that we handle this message as described in our {link}.',
    },
    privacy: {
      seoTitle: 'Privacy policy | Woohop',
      seoDesc: 'How Woohop handles your data: no sign-up and no personal data collected. Anonymous Google Analytics stats; game rooms are deleted after 3 hours of inactivity.',
      h1: 'Privacy policy',
      updated: 'Last updated: October 22, 2026',
      lead: 'Woohop (www.vibeweb100.com) is a free website of group games and icebreakers. This page explains what data we come across, how we use it, and the choices you have.',
      sections: [
        ['No sign-up for now', [
          'You don’t need an account to use Woohop today, and we don’t ask for your name, phone number, address or any other identifying information. If we introduce accounts in the future, signing up will be optional, and we’ll update this page first to explain what we collect and how we use it.',
        ]],
        ['What you type in games', [
          'Room games played on several phones (such as {rooms}) temporarily store the nicknames and answers you enter on our server so others in the same room can see them. **A room is deleted entirely after 3 hours without activity**, and we keep no other copy.',
          'Games played on one phone or with no phone, and the board game tools, run on your device — nothing you enter is sent to a server.',
        ]],
        ['Contact form', [
          'What you send through “Contact us”, and any email address you choose to leave, is delivered to our inbox. We use it only to reply to you and improve the site — never for marketing, and never shared with anyone else.',
        ]],
        ['Browser storage and cookies', [
          'We use your browser’s local storage and one cookie named web100_lang to remember your language, light or dark mode, and game settings. These stay on your device and are not used to track you.',
        ]],
        ['Usage statistics (Google Analytics)', [
          'We use Google Analytics 4 to understand how the site is used — which pages are opened, on what kind of device, from roughly which country or region, and which buttons are pressed in games. These are anonymous statistics that help us decide what to improve.',
          'Google Analytics sets cookies in your browser. To learn how Google uses this data, see [Google’s explanation](' + GOOGLE_PARTNERS + '). To opt out, you can install the [Google Analytics opt-out browser add-on](' + GA_OPTOUT + ').',
        ]],
        ['Hosting and other services', [
          'The website and game servers are provided by Vercel and Cloudflare, and fonts are loaded from Google Fonts. For security and operations these services keep ordinary connection logs (such as IP address and browser type); we don’t use them to identify you.',
        ]],
        ['Advertising', [
          'There are currently no ads on this site. If we add advertising in the future (for example Google AdSense), we will update this page first to explain which cookies advertisers use and what choices you have.',
        ]],
        ['Children', [
          'Groups of all ages can use Woohop, and we don’t knowingly collect personal data from anyone. If a child has left an email address or other details through the form, a parent can email us to have it deleted.',
        ]],
        ['Your rights and how to reach us', [
          'To access or delete anything you sent through the form, or if you have questions about this policy, email {mail} or use our [contact form]({contact}).',
        ]],
        ['Changes', [
          'If this policy changes, we’ll update this page and the date above.',
        ]],
      ],
    },
  },

  de: {
    seoTitle: 'Über uns | Woohop – kostenlose Gruppenspiele und Eisbrecher',
    seoDesc: 'Woohop ist eine kostenlose Website mit Gruppenspielen und Eisbrechern direkt im Browser – ohne Anmeldung, mit Regeln und Tipps zum Anleiten, in 8 Sprachen.',
    h1: 'Über Woohop',
    lead: 'Aktivitäten leicht gemacht: Gruppenspiele, Eisbrecher und Brettspiel-Helfer, die direkt im Browser laufen.',
    story: 'Woohop sammelt Gruppenspiele und Eisbrecher für Feiern, Unterricht, Kleingruppen und Teamevents und macht daraus Versionen, die du direkt auf einer Webseite spielen kannst. Dazu gibt es praktische Helfer für Spieleabende und Aktivitäten – etwa einen Sprecher für Avalon, ein Metronom und einen Namensgenerator.',
    contactHeading: 'Kontakt',
    contactLead: 'Du möchtest ein Spiel vorschlagen, hast einen Fehler gefunden oder eine Idee? Schreib uns – wir lesen jede Nachricht.',
    mailLead: 'Oder schreib uns direkt eine E-Mail:',
    form: {
      type: 'Worum geht es?',
      types: { recommend: 'Spiel vorschlagen', idea: 'Feedback', collab: 'Kooperation', other: 'Sonstiges' },
      game: 'Welches Spiel? (optional)',
      gameNone: 'Kein bestimmtes',
      gameSearch: 'Tippen, um ein Spiel zu finden, z. B. „Bombe“',
      gameNoMatch: 'Kein passendes Spiel',
      gameSite: 'Die Website allgemein',
      message: 'Nachricht',
      placeholders: {
        recommend: 'Wie heißt das Spiel, wie wird es gespielt und für wie viele Personen?',
        idea: 'Etwas kaputt oder verbesserungswürdig? Bei einem Fehler: welche Seite, was ist passiert, Handy oder Computer?',
        collab: 'Erzähl kurz, wer du bist und was du vorhast',
        other: 'Was du uns sagen möchtest',
      },
      email: 'Deine E-Mail (optional)',
      emailHelp: 'Nur wenn du eine Antwort möchtest. Wir nutzen sie für nichts anderes.',
      send: 'Senden',
      sending: 'Wird gesendet …',
      sentTitle: 'Angekommen – danke!',
      sentDesc: 'Wir lesen es aufmerksam. Wenn du eine E-Mail angegeben hast, antworten wir bei Bedarf.',
      again: 'Noch eine Nachricht',
      errMessage: 'Bitte schreib mindestens 5 Zeichen.',
      errEmail: 'Die E-Mail-Adresse sieht nicht richtig aus.',
      errRate: 'Zu viele Nachrichten – bitte versuch es in einer Minute noch einmal.',
      errServer: 'Senden fehlgeschlagen. Bitte versuch es später noch einmal oder schreib uns eine E-Mail.',
      privacyNote: 'Mit dem Senden stimmst du zu, dass wir die Nachricht gemäß unserer {link} behandeln.',
    },
    privacy: {
      seoTitle: 'Datenschutzerklärung | Woohop',
      seoDesc: 'Wie Woohop mit deinen Daten umgeht: keine Anmeldung, keine personenbezogenen Daten. Anonyme Statistik mit Google Analytics; Spielräume werden nach 3 Stunden Inaktivität gelöscht.',
      h1: 'Datenschutzerklärung',
      updated: 'Zuletzt aktualisiert: 22. Oktober 2026',
      lead: 'Woohop (www.vibeweb100.com) ist eine kostenlose Website mit Gruppenspielen und Eisbrechern. Hier erklären wir, mit welchen Daten wir in Berührung kommen, wie wir sie nutzen und welche Möglichkeiten du hast.',
      sections: [
        ['Derzeit keine Anmeldung', [
          'Für Woohop brauchst du derzeit kein Konto, und wir fragen nicht nach Name, Telefonnummer, Adresse oder anderen Angaben, die dich identifizieren. Falls wir künftig Benutzerkonten anbieten, ist die Anmeldung freiwillig – und wir aktualisieren diese Seite vorher und erklären, welche Daten wir erheben und wie wir sie nutzen.',
        ]],
        ['Was du in Spielen eingibst', [
          'Raumspiele, die auf mehreren Handys gespielt werden (z. B. {rooms}), speichern die eingegebenen Spitznamen und Antworten vorübergehend auf unserem Server, damit die anderen im Raum sie sehen. **Ein Raum wird nach 3 Stunden ohne Aktivität vollständig gelöscht**; wir behalten keine weitere Kopie.',
          'Spiele mit einem oder ohne Handy sowie die Brettspiel-Tools laufen auf deinem Gerät – deine Eingaben werden nicht an einen Server gesendet.',
        ]],
        ['Kontaktformular', [
          'Was du über „Kontakt“ sendest, und eine E-Mail-Adresse, die du freiwillig angibst, landen in unserem Postfach. Wir nutzen sie nur, um dir zu antworten und die Seite zu verbessern – nie für Werbung und ohne Weitergabe an andere.',
        ]],
        ['Browserspeicher und Cookies', [
          'Wir nutzen den lokalen Speicher deines Browsers und ein Cookie namens web100_lang, um Sprache, hellen oder dunklen Modus und Spieleinstellungen zu speichern. Diese bleiben auf deinem Gerät und dienen nicht dazu, dich zu verfolgen.',
        ]],
        ['Nutzungsstatistik (Google Analytics)', [
          'Wir verwenden Google Analytics 4, um zu verstehen, wie die Seite genutzt wird – welche Seiten aufgerufen werden, mit welchem Gerätetyp, ungefähr aus welchem Land oder welcher Region und welche Schaltflächen in Spielen gedrückt werden. Das sind anonyme Statistiken, die uns bei Verbesserungen helfen.',
          'Google Analytics setzt Cookies in deinem Browser. Wie Google diese Daten nutzt, erfährst du in [Googles Erklärung](' + GOOGLE_PARTNERS + '). Zum Widerspruch kannst du das [Browser-Add-on zur Deaktivierung von Google Analytics](' + GA_OPTOUT + ') installieren.',
        ]],
        ['Hosting und weitere Dienste', [
          'Website und Spielserver werden von Vercel und Cloudflare bereitgestellt, Schriften von Google Fonts geladen. Aus Sicherheits- und Betriebsgründen speichern diese Dienste übliche Verbindungsdaten (z. B. IP-Adresse und Browsertyp); wir nutzen sie nicht, um dich zu identifizieren.',
        ]],
        ['Werbung', [
          'Derzeit gibt es auf dieser Seite keine Werbung. Falls wir künftig Werbung einbinden (z. B. Google AdSense), aktualisieren wir diese Seite vorher und erklären, welche Cookies Werbepartner nutzen und welche Wahlmöglichkeiten du hast.',
        ]],
        ['Kinder', [
          'Gruppen jeden Alters können Woohop nutzen, und wir erheben wissentlich von niemandem personenbezogene Daten. Hat ein Kind über das Formular eine E-Mail-Adresse oder andere Angaben hinterlassen, können Eltern uns schreiben, damit wir sie löschen.',
        ]],
        ['Deine Rechte und Kontakt', [
          'Wenn du Auskunft über deine Angaben aus dem Formular möchtest, sie löschen lassen willst oder Fragen zu dieser Erklärung hast, schreib an {mail} oder nutze unser [Kontaktformular]({contact}).',
        ]],
        ['Änderungen', [
          'Ändert sich diese Erklärung, aktualisieren wir diese Seite und das Datum oben.',
        ]],
      ],
    },
  },

  fr: {
    seoTitle: 'À propos | Woohop – jeux de groupe et brise-glace gratuits',
    seoDesc: 'Woohop est un site gratuit de jeux de groupe et de brise-glace jouables dans le navigateur, sans inscription, avec règles et conseils d’animation, en 8 langues.',
    h1: 'À propos de Woohop',
    lead: 'Rendre l’animation simple : jeux de groupe, brise-glace et outils pour jeux de société, directement dans le navigateur.',
    story: 'Woohop rassemble des jeux de groupe et des brise-glace pour les fêtes, les cours, les petits groupes et les événements d’équipe, et en fait des versions jouables directement depuis une page web. On y trouve aussi des outils pratiques pour les soirées jeux et les animations : un narrateur vocal pour Avalon, un métronome, un tirage de noms…',
    contactHeading: 'Nous contacter',
    contactLead: 'Vous voulez proposer un jeu, vous avez trouvé un bug ou vous avez une idée ? Dites-le-nous : nous lisons chaque message.',
    mailLead: 'Ou écrivez-nous directement :',
    form: {
      type: 'De quoi s’agit-il ?',
      types: { recommend: 'Proposer un jeu', idea: 'Suggestion', collab: 'Partenariat', other: 'Autre' },
      game: 'Quel jeu ? (facultatif)',
      gameNone: 'Aucun en particulier',
      gameSearch: 'Tape pour trouver un jeu, ex. « bombe »',
      gameNoMatch: 'Aucun jeu trouvé',
      gameSite: 'Le site en général',
      message: 'Message',
      placeholders: {
        recommend: 'Comment s’appelle le jeu, comment y joue-t-on, à combien ?',
        idea: 'Quelque chose ne marche pas ou pourrait être mieux ? Pour un bug : quelle page, que s’est-il passé, téléphone ou ordinateur ?',
        collab: 'Présentez-vous en quelques mots et dites-nous ce que vous imaginez',
        other: 'Tout ce que vous voulez nous dire',
      },
      email: 'Votre e-mail (facultatif)',
      emailHelp: 'Seulement si vous souhaitez une réponse. Nous ne l’utiliserons pour rien d’autre.',
      send: 'Envoyer',
      sending: 'Envoi…',
      sentTitle: 'Bien reçu, merci !',
      sentDesc: 'Nous allons le lire attentivement. Si vous avez laissé un e-mail, nous vous répondrons si besoin.',
      again: 'Écrire un autre message',
      errMessage: 'Écrivez au moins 5 caractères.',
      errEmail: 'L’adresse e-mail ne semble pas valide.',
      errRate: 'Trop de messages : réessayez dans une minute.',
      errServer: 'L’envoi a échoué. Réessayez plus tard ou écrivez-nous directement.',
      privacyNote: 'En envoyant ce message, vous acceptez qu’il soit traité conformément à notre {link}.',
    },
    privacy: {
      seoTitle: 'Politique de confidentialité | Woohop',
      seoDesc: 'Comment Woohop traite vos données : pas d’inscription ni de données personnelles. Statistiques anonymes avec Google Analytics ; les salles de jeu sont supprimées après 3 heures d’inactivité.',
      h1: 'Politique de confidentialité',
      updated: 'Dernière mise à jour : 22 octobre 2026',
      lead: 'Woohop (www.vibeweb100.com) est un site gratuit de jeux de groupe et de brise-glace. Cette page explique quelles données nous rencontrons, comment nous les utilisons et quels choix vous avez.',
      sections: [
        ['Pas d’inscription pour l’instant', [
          'Aucun compte n’est nécessaire pour utiliser Woohop aujourd’hui, et nous ne demandons ni votre nom, ni votre numéro de téléphone, ni votre adresse, ni aucune information permettant de vous identifier. Si nous proposons un jour des comptes, l’inscription sera facultative, et nous mettrons d’abord cette page à jour pour expliquer quelles données nous collectons et comment nous les utilisons.',
        ]],
        ['Ce que vous saisissez dans les jeux', [
          'Les jeux en salle joués sur plusieurs téléphones (comme {rooms}) conservent temporairement sur notre serveur les pseudos et réponses saisis, pour que les autres joueurs de la salle puissent les voir. **Une salle est entièrement supprimée après 3 heures sans activité**, et nous n’en gardons aucune copie.',
          'Les jeux à un seul téléphone ou sans téléphone, ainsi que les outils pour jeux de société, fonctionnent sur votre appareil : rien de ce que vous saisissez n’est envoyé à un serveur.',
        ]],
        ['Formulaire de contact', [
          'Ce que vous envoyez via « Nous contacter », et l’adresse e-mail que vous choisissez éventuellement de laisser, arrivent dans notre boîte mail. Nous les utilisons uniquement pour vous répondre et améliorer le site : jamais à des fins marketing, et jamais transmis à des tiers.',
        ]],
        ['Stockage du navigateur et cookies', [
          'Nous utilisons le stockage local de votre navigateur et un cookie nommé web100_lang pour mémoriser votre langue, le mode clair ou sombre et les réglages des jeux. Ils restent sur votre appareil et ne servent pas à vous suivre.',
        ]],
        ['Statistiques d’utilisation (Google Analytics)', [
          'Nous utilisons Google Analytics 4 pour comprendre comment le site est utilisé : pages ouvertes, type d’appareil, pays ou région approximatifs, et boutons utilisés dans les jeux. Ce sont des statistiques anonymes qui nous aident à décider quoi améliorer.',
          'Google Analytics dépose des cookies dans votre navigateur. Pour savoir comment Google utilise ces données, consultez [les explications de Google](' + GOOGLE_PARTNERS + '). Pour vous y opposer, vous pouvez installer le [module de désactivation de Google Analytics](' + GA_OPTOUT + ').',
        ]],
        ['Hébergement et autres services', [
          'Le site et les serveurs de jeu sont fournis par Vercel et Cloudflare, et les polices sont chargées depuis Google Fonts. Pour des raisons de sécurité et d’exploitation, ces services conservent des journaux de connexion classiques (adresse IP, type de navigateur…) ; nous ne les utilisons pas pour vous identifier.',
        ]],
        ['Publicité', [
          'Il n’y a actuellement aucune publicité sur ce site. Si nous en ajoutons à l’avenir (par exemple Google AdSense), nous mettrons d’abord cette page à jour pour expliquer quels cookies les annonceurs utilisent et quels choix vous avez.',
        ]],
        ['Enfants', [
          'Des groupes de tous âges peuvent utiliser Woohop, et nous ne collectons sciemment de données personnelles auprès de personne. Si un enfant a laissé une adresse e-mail ou d’autres informations via le formulaire, un parent peut nous écrire pour les faire supprimer.',
        ]],
        ['Vos droits et comment nous joindre', [
          'Pour consulter ou supprimer ce que vous avez envoyé via le formulaire, ou pour toute question sur cette politique, écrivez à {mail} ou utilisez notre [formulaire de contact]({contact}).',
        ]],
        ['Modifications', [
          'Si cette politique change, nous mettrons à jour cette page et la date ci-dessus.',
        ]],
      ],
    },
  },

  ja: {
    seoTitle: 'Woohopについて｜無料のレクリエーション・アイスブレイクゲーム',
    seoDesc: 'Woohopは、ブラウザですぐ遊べる無料のレクリエーション・アイスブレイクゲームのサイトです。登録不要、どのゲームにもルールと進行のコツつき、8言語対応。',
    h1: 'Woohopについて',
    lead: '場を回すのをもっとかんたんに。ブラウザですぐ遊べるレクリエーション、アイスブレイク、ボードゲームの便利ツール。',
    story: 'Woohopは、飲み会、授業、サークル、社内イベントなどで使えるレクリエーションやアイスブレイクのゲームを集めて、Webページを開くだけで遊べる形にしています。アヴァロンの音声進行、メトロノーム、名前くじなど、ボードゲームやレクで役立つツールもあります。',
    contactHeading: 'お問い合わせ',
    contactLead: 'おすすめのゲーム、不具合、改善のアイデアなど、なんでも教えてください。すべて目を通しています。',
    mailLead: 'メールでも受け付けています：',
    form: {
      type: 'お問い合わせの種類',
      types: { recommend: 'ゲームの提案', idea: '改善の提案', collab: '協業のご相談', other: 'その他' },
      game: '関係するゲーム（任意）',
      gameNone: 'とくになし',
      gameSearch: 'ゲーム名を入力して検索（例：爆弾）',
      gameNoMatch: '見つかりませんでした',
      gameSite: 'サイト全体',
      message: '内容',
      placeholders: {
        recommend: 'ゲームの名前、遊び方、何人向けか教えてください',
        idea: '不具合や、もっとよくできるところはありますか？不具合なら、どのページで何が起きたか、スマホかパソコンかも教えてください。',
        collab: 'かんたんな自己紹介と、ご相談の内容',
        other: 'なんでもどうぞ',
      },
      email: 'メールアドレス（任意）',
      emailHelp: '返信がほしい場合のみ。返信以外には使いません。',
      send: '送信する',
      sending: '送信中…',
      sentTitle: '受け取りました。ありがとうございます！',
      sentDesc: 'しっかり読ませていただきます。メールアドレスをいただいた場合は、必要に応じて返信します。',
      again: 'もう一件書く',
      errMessage: '5文字以上で書いてください。',
      errEmail: 'メールアドレスの形式が正しくないようです。',
      errRate: '送信回数が多すぎます。1分ほどしてからお試しください。',
      errServer: '送信できませんでした。時間をおいて試すか、メールでご連絡ください。',
      privacyNote: '送信すると、{link}に沿ってこのメッセージを取り扱うことに同意したものとみなします。',
    },
    privacy: {
      seoTitle: 'プライバシーポリシー｜Woohop',
      seoDesc: 'Woohopでのデータの取り扱いについて。登録不要で個人情報は集めません。Google Analyticsで匿名の統計をとり、ゲームのルームは3時間操作がないと削除されます。',
      h1: 'プライバシーポリシー',
      updated: '最終更新日：2026年10月22日',
      lead: 'Woohop（www.vibeweb100.com）は、無料のレクリエーション・アイスブレイクゲームのサイトです。このページでは、私たちが扱うデータ、その使い道、あなたが選べることを説明します。',
      sections: [
        ['現在、登録は不要です', [
          '現在、Woohopの利用にアカウントは必要なく、名前、電話番号、住所など、あなたを特定できる情報をお願いすることもありません。今後会員機能を設ける場合も登録は任意とし、その前にこのページを更新して、集める情報と使い道をお知らせします。',
        ]],
        ['ゲームで入力した内容', [
          '複数のスマホで遊ぶルーム型のゲーム（{rooms}など）では、入力したニックネームと回答を、同じルームの人に表示するためにサーバーに一時保存します。**ルームは3時間操作がないとまるごと削除され**、ほかに保存することはありません。',
          '1台のスマホで遊ぶゲーム、スマホなしのゲーム、ボードゲームのツールはあなたの端末の中で動いていて、入力内容がサーバーに送られることはありません。',
        ]],
        ['お問い合わせフォーム', [
          '「お問い合わせ」から送られた内容と、任意で入力されたメールアドレスは、私たちのメールボックスに届きます。返信とサイトの改善にだけ使い、宣伝に使ったり第三者に提供したりすることはありません。',
        ]],
        ['ブラウザの保存領域とCookie', [
          '言語、ライト／ダークモード、ゲームの設定を覚えておくために、ブラウザのローカルストレージと「web100_lang」という名前のCookieを使います。これらはあなたの端末の中だけにあり、あなたを追跡するためには使いません。',
        ]],
        ['利用状況の統計（Google Analytics）', [
          'サイトの使われ方を知るために Google Analytics 4 を使っています。開かれたページ、端末の種類、おおよその国や地域、ゲームで押されたボタンなどの匿名の統計で、どのゲームを改善するか決めるのに役立てています。',
          'Google Analytics はブラウザにCookieを設定します。Googleによるデータの使われ方は[Googleの説明](' + GOOGLE_PARTNERS + ')をご覧ください。計測を止めたい場合は、[Google アナリティクス オプトアウト アドオン](' + GA_OPTOUT + ')を使えます。',
        ]],
        ['ホスティングとそのほかのサービス', [
          'サイトとゲームのサーバーは Vercel と Cloudflare、フォントは Google Fonts から提供されています。これらのサービスは、セキュリティと運用のために一般的な接続記録（IPアドレス、ブラウザの種類など）を残しますが、私たちがそれを使ってあなたを特定することはありません。',
        ]],
        ['広告', [
          '現在、このサイトに広告はありません。今後広告（たとえば Google AdSense）を導入する場合は、先にこのページを更新し、広告事業者が使うCookieとあなたが選べることを説明します。',
        ]],
        ['お子さまについて', [
          'Woohopはあらゆる年代のグループで使えますが、私たちが意図して個人情報を集めることはありません。お子さまがフォームでメールアドレスなどを送ってしまった場合は、保護者の方からご連絡いただければ削除します。',
        ]],
        ['あなたの権利と連絡先', [
          'フォームで送った内容の確認や削除、このポリシーについてのご質問は、{mail} へのメール、または[お問い合わせフォーム]({contact})からご連絡ください。',
        ]],
        ['ポリシーの変更', [
          'このポリシーを変更した場合は、このページと上の日付を更新します。',
        ]],
      ],
    },
  },

  ko: {
    seoTitle: 'Woohop 소개 | 무료 레크리에이션·아이스브레이킹 게임',
    seoDesc: 'Woohop은 브라우저에서 바로 즐기는 무료 레크리에이션·아이스브레이킹 게임 사이트입니다. 가입 없이, 모든 게임에 규칙과 진행 팁을 담았고 8개 언어를 지원합니다.',
    h1: 'Woohop 소개',
    lead: '모임 진행을 더 쉽게. 브라우저에서 바로 하는 레크리에이션, 아이스브레이킹 게임과 보드게임 도우미.',
    story: 'Woohop은 모임, 수업, 소그룹, 회사 행사에서 할 수 있는 레크리에이션과 아이스브레이킹 게임을 모아, 웹페이지만 열면 바로 할 수 있게 만들었습니다. 아발론 음성 진행, 메트로놈, 이름 뽑기처럼 보드게임과 레크리에이션에 쓸 만한 도구도 있습니다.',
    contactHeading: '문의하기',
    contactLead: '추천하고 싶은 게임, 고장 난 부분, 개선 아이디어 무엇이든 알려 주세요. 모든 메시지를 읽고 있습니다.',
    mailLead: '이메일로도 보내실 수 있습니다:',
    form: {
      type: '어떤 내용인가요?',
      types: { recommend: '게임 추천', idea: '개선 제안', collab: '제휴 문의', other: '기타' },
      game: '관련된 게임 (선택)',
      gameNone: '특정 게임 없음',
      gameSearch: '게임 이름을 입력해 찾기 (예: 폭탄)',
      gameNoMatch: '맞는 게임이 없어요',
      gameSite: '사이트 전체',
      message: '내용',
      placeholders: {
        recommend: '게임 이름, 하는 방법, 몇 명이 하기 좋은지 알려 주세요',
        idea: '고장 난 곳이나 더 좋아지면 좋을 점이 있나요? 오류라면 어느 페이지에서 무슨 일이 있었는지, 휴대폰인지 컴퓨터인지 알려 주세요.',
        collab: '간단한 소개와 제안하고 싶은 내용',
        other: '무엇이든 적어 주세요',
      },
      email: '이메일 (선택)',
      emailHelp: '답장을 받고 싶을 때만 적어 주세요. 답장 외에는 쓰지 않습니다.',
      send: '보내기',
      sending: '보내는 중…',
      sentTitle: '잘 받았습니다. 고맙습니다!',
      sentDesc: '꼼꼼히 읽어 보겠습니다. 이메일을 남기셨다면 필요할 때 답장드릴게요.',
      again: '하나 더 쓰기',
      errMessage: '5자 이상 적어 주세요.',
      errEmail: '이메일 형식이 올바르지 않은 것 같아요.',
      errRate: '너무 많이 보냈어요. 1분 뒤에 다시 시도해 주세요.',
      errServer: '보내지 못했습니다. 잠시 후 다시 시도하거나 이메일로 보내 주세요.',
      privacyNote: '보내면 이 메시지를 {link}에 따라 처리하는 데 동의하는 것으로 봅니다.',
    },
    privacy: {
      seoTitle: '개인정보 처리방침 | Woohop',
      seoDesc: 'Woohop의 데이터 처리 방식: 가입이 없고 개인정보를 수집하지 않습니다. Google Analytics로 익명 통계를 내며, 게임 방은 3시간 동안 활동이 없으면 삭제됩니다.',
      h1: '개인정보 처리방침',
      updated: '최종 업데이트: 2026년 10월 22일',
      lead: 'Woohop(www.vibeweb100.com)은 무료 레크리에이션·아이스브레이킹 게임 사이트입니다. 이 페이지에서는 저희가 다루는 데이터와 그 사용 방법, 그리고 여러분이 선택할 수 있는 것을 설명합니다.',
      sections: [
        ['현재 가입 불필요', [
          '현재 Woohop을 쓰는 데 계정은 필요 없으며, 이름, 전화번호, 주소 등 여러분을 식별할 수 있는 정보를 요구하지 않습니다. 앞으로 회원 기능을 도입하더라도 가입은 선택 사항이며, 그 전에 이 페이지를 업데이트해 어떤 정보를 수집하고 어떻게 쓰는지 알려 드리겠습니다.',
        ]],
        ['게임에서 입력한 내용', [
          '여러 휴대폰으로 하는 방 게임(예: {rooms})은 입력한 닉네임과 답을 같은 방 사람들에게 보여 주기 위해 서버에 잠시 저장합니다. **방은 3시간 동안 활동이 없으면 통째로 삭제되며**, 따로 보관하지 않습니다.',
          '휴대폰 한 대로 하거나 휴대폰 없이 하는 게임, 보드게임 도구는 여러분의 기기 안에서 실행되며, 입력한 내용이 서버로 전송되지 않습니다.',
        ]],
        ['문의 양식', [
          '「문의하기」로 보낸 내용과 선택해서 남긴 이메일은 저희 메일함으로 전달됩니다. 답장과 사이트 개선에만 쓰며, 마케팅에 쓰거나 다른 사람에게 제공하지 않습니다.',
        ]],
        ['브라우저 저장소와 쿠키', [
          '언어, 라이트/다크 모드, 게임 설정을 기억하기 위해 브라우저의 로컬 저장소와 web100_lang이라는 쿠키 하나를 사용합니다. 이 정보는 여러분의 기기에만 있으며 추적에 쓰이지 않습니다.',
        ]],
        ['이용 통계 (Google Analytics)', [
          '사이트가 어떻게 쓰이는지 알기 위해 Google Analytics 4를 사용합니다. 어떤 페이지가 열렸는지, 어떤 기기인지, 대략 어느 국가나 지역인지, 게임에서 어떤 버튼을 눌렀는지 같은 익명 통계로, 어떤 게임을 개선할지 정하는 데 씁니다.',
          'Google Analytics는 브라우저에 쿠키를 설정합니다. Google이 이 데이터를 어떻게 쓰는지는 [Google의 설명](' + GOOGLE_PARTNERS + ')에서 볼 수 있고, 수집을 원하지 않으면 [Google 애널리틱스 차단 브라우저 부가기능](' + GA_OPTOUT + ')을 설치하면 됩니다.',
        ]],
        ['호스팅과 기타 서비스', [
          '사이트와 게임 서버는 Vercel과 Cloudflare가, 글꼴은 Google Fonts가 제공합니다. 이 서비스들은 보안과 운영을 위해 일반적인 접속 기록(IP 주소, 브라우저 종류 등)을 남기며, 저희는 이를 여러분을 식별하는 데 쓰지 않습니다.',
        ]],
        ['광고', [
          '현재 이 사이트에는 광고가 없습니다. 앞으로 광고(예: Google AdSense)를 넣게 되면 먼저 이 페이지를 업데이트해, 광고 업체가 쓰는 쿠키와 여러분이 선택할 수 있는 것을 설명하겠습니다.',
        ]],
        ['어린이', [
          'Woohop은 모든 연령의 그룹이 쓸 수 있으며, 저희는 누구의 개인정보도 의도적으로 수집하지 않습니다. 아이가 양식을 통해 이메일 등을 남겼다면 보호자께서 연락 주시면 삭제하겠습니다.',
        ]],
        ['여러분의 권리와 연락처', [
          '양식으로 보낸 내용을 확인하거나 삭제하고 싶을 때, 또는 이 방침에 대해 궁금한 점이 있으면 {mail}으로 메일을 보내거나 [문의 양식]({contact})을 이용해 주세요.',
        ]],
        ['방침 변경', [
          '이 방침이 바뀌면 이 페이지와 위의 날짜를 업데이트합니다.',
        ]],
      ],
    },
  },

  es: {
    seoTitle: 'Sobre nosotros | Woohop – juegos grupales y rompehielos gratis',
    seoDesc: 'Woohop es un sitio gratuito de juegos grupales y rompehielos que se juegan en el navegador, sin registro, con reglas y consejos para animar, en 8 idiomas.',
    h1: 'Sobre Woohop',
    lead: 'Hacer fácil animar un grupo: juegos grupales, rompehielos y herramientas para juegos de mesa, directamente en el navegador.',
    story: 'Woohop reúne juegos grupales y rompehielos para fiestas, clases, grupos pequeños y eventos de equipo, y los convierte en versiones que se juegan directamente desde una página web. También hay herramientas útiles para noches de juegos y dinámicas, como un narrador por voz para Avalon, un metrónomo y un sorteo de nombres.',
    contactHeading: 'Contacto',
    contactLead: '¿Quieres sugerir un juego, encontraste algo que no funciona o tienes una idea? Cuéntanoslo: leemos todos los mensajes.',
    mailLead: 'O escríbenos directamente:',
    form: {
      type: '¿Sobre qué es?',
      types: { recommend: 'Sugerir un juego', idea: 'Sugerencia', collab: 'Colaboración', other: 'Otro' },
      game: '¿Qué juego? (opcional)',
      gameNone: 'Ninguno en concreto',
      gameSearch: 'Escribe para buscar un juego, p. ej. «bomba»',
      gameNoMatch: 'Ningún juego coincide',
      gameSite: 'El sitio en general',
      message: 'Mensaje',
      placeholders: {
        recommend: '¿Cómo se llama el juego, cómo se juega y para cuántas personas?',
        idea: '¿Algo no funciona o podría mejorar? Si es un error, dinos en qué página, qué pasó y si usabas móvil u ordenador.',
        collab: 'Cuéntanos un poco quién eres y qué tienes en mente',
        other: 'Lo que quieras decirnos',
      },
      email: 'Tu email (opcional)',
      emailHelp: 'Solo si quieres respuesta. No lo usaremos para nada más.',
      send: 'Enviar',
      sending: 'Enviando…',
      sentTitle: '¡Recibido, gracias!',
      sentDesc: 'Lo leeremos con atención. Si dejaste un email, te responderemos cuando haga falta.',
      again: 'Escribir otro',
      errMessage: 'Escribe al menos 5 caracteres.',
      errEmail: 'Ese email no parece correcto.',
      errRate: 'Demasiados mensajes: vuelve a intentarlo en un minuto.',
      errServer: 'No se pudo enviar. Inténtalo más tarde o escríbenos directamente.',
      privacyNote: 'Al enviar, aceptas que tratemos este mensaje según nuestra {link}.',
    },
    privacy: {
      seoTitle: 'Política de privacidad | Woohop',
      seoDesc: 'Cómo trata Woohop tus datos: sin registro y sin datos personales. Estadísticas anónimas con Google Analytics; las salas de juego se borran tras 3 horas de inactividad.',
      h1: 'Política de privacidad',
      updated: 'Última actualización: 22 de octubre de 2026',
      lead: 'Woohop (www.vibeweb100.com) es un sitio gratuito de juegos grupales y rompehielos. Esta página explica con qué datos tratamos, cómo los usamos y qué opciones tienes.',
      sections: [
        ['Por ahora, sin registro', [
          'Hoy no necesitas una cuenta para usar Woohop, y no te pedimos tu nombre, teléfono, dirección ni ningún dato que te identifique. Si en el futuro ofrecemos cuentas, registrarse será opcional, y antes actualizaremos esta página para explicar qué datos recogemos y cómo los usamos.',
        ]],
        ['Lo que escribes en los juegos', [
          'Los juegos de sala que se juegan con varios móviles (como {rooms}) guardan temporalmente en nuestro servidor los apodos y respuestas que introduces, para que los demás de la sala puedan verlos. **Una sala se borra por completo tras 3 horas sin actividad**, y no guardamos ninguna otra copia.',
          'Los juegos con un solo móvil o sin móvil, y las herramientas para juegos de mesa, funcionan en tu dispositivo: nada de lo que escribes se envía a un servidor.',
        ]],
        ['Formulario de contacto', [
          'Lo que envías desde «Contacto», y el email que decidas dejar, llega a nuestro buzón. Solo lo usamos para responderte y mejorar el sitio: nunca para marketing ni lo compartimos con nadie.',
        ]],
        ['Almacenamiento del navegador y cookies', [
          'Usamos el almacenamiento local del navegador y una cookie llamada web100_lang para recordar tu idioma, el modo claro u oscuro y los ajustes de los juegos. Se quedan en tu dispositivo y no se usan para seguirte.',
        ]],
        ['Estadísticas de uso (Google Analytics)', [
          'Usamos Google Analytics 4 para entender cómo se usa el sitio: qué páginas se abren, desde qué tipo de dispositivo, desde qué país o región aproximada y qué botones se pulsan en los juegos. Son estadísticas anónimas que nos ayudan a decidir qué mejorar.',
          'Google Analytics instala cookies en tu navegador. Para saber cómo usa Google estos datos, consulta [la explicación de Google](' + GOOGLE_PARTNERS + '). Si no quieres que se te cuente, puedes instalar el [complemento de inhabilitación de Google Analytics](' + GA_OPTOUT + ').',
        ]],
        ['Alojamiento y otros servicios', [
          'El sitio y los servidores de juego los proporcionan Vercel y Cloudflare, y las fuentes se cargan desde Google Fonts. Por seguridad y operación, estos servicios guardan registros de conexión habituales (como la dirección IP y el tipo de navegador); no los usamos para identificarte.',
        ]],
        ['Publicidad', [
          'Actualmente no hay anuncios en este sitio. Si en el futuro añadimos publicidad (por ejemplo, Google AdSense), primero actualizaremos esta página para explicar qué cookies usan los anunciantes y qué opciones tienes.',
        ]],
        ['Menores', [
          'Grupos de todas las edades pueden usar Woohop, y no recopilamos a sabiendas datos personales de nadie. Si un menor dejó un email u otros datos en el formulario, su madre, padre o tutor puede escribirnos para que los borremos.',
        ]],
        ['Tus derechos y cómo contactarnos', [
          'Para consultar o borrar lo que enviaste por el formulario, o si tienes preguntas sobre esta política, escribe a {mail} o usa nuestro [formulario de contacto]({contact}).',
        ]],
        ['Cambios', [
          'Si esta política cambia, actualizaremos esta página y la fecha de arriba.',
        ]],
      ],
    },
  },

  'zh-CN': {
    seoTitle: '关于我们｜Woohop 免费团建破冰游戏',
    seoDesc: 'Woohop 是免费的在线团建与破冰游戏网站：打开就能玩、无需注册，每个游戏都附玩法和带领说明，支持 8 种语言。',
    h1: '关于 Woohop',
    lead: '让带活动变简单：打开网页就能玩的团建、破冰游戏和桌游小工具。',
    story: 'Woohop 收集了适合聚会、课堂、小组和公司活动的团建与破冰游戏，全部做成打开网页就能玩的版本。另外还有阿瓦隆语音主持、节拍器、抽卡起名这类玩桌游、带活动时用得上的小工具。',
    contactHeading: '联系我们',
    contactLead: '想推荐游戏、发现哪里出了问题，或者有任何建议，都欢迎告诉我们，每一条都会看。',
    mailLead: '也可以直接给我们发邮件：',
    form: {
      type: '想和我们说什么？',
      types: { recommend: '推荐游戏', idea: '改进建议', collab: '合作邀约', other: '其他' },
      game: '和哪个游戏有关？（选填）',
      gameNone: '没有特定的',
      gameSearch: '输入游戏名称查找，例如“炸弹”',
      gameNoMatch: '找不到符合的游戏',
      gameSite: '网站整体',
      message: '内容',
      placeholders: {
        recommend: '游戏叫什么、怎么玩、适合几个人？',
        idea: '哪里出了问题，或者哪里可以更好？如果是问题，请写在哪个页面、发生了什么，用的是手机还是电脑。',
        collab: '简单介绍一下你和想合作的内容',
        other: '想说什么都可以',
      },
      email: '你的邮箱（选填）',
      emailHelp: '想收到回复再填，只会用来回复你。',
      send: '提交',
      sending: '提交中…',
      sentTitle: '收到了，谢谢你！',
      sentDesc: '我们会认真看。如果留了邮箱，需要时会给你回信。',
      again: '再写一条',
      errMessage: '请至少写 5 个字。',
      errEmail: '邮箱格式好像不对。',
      errRate: '提交太频繁了，请过一分钟再试。',
      errServer: '提交失败，请稍后再试，或直接给我们发邮件。',
      privacyNote: '提交即表示你同意我们按照{link}处理这条消息。',
    },
    privacy: {
      seoTitle: '隐私政策｜Woohop',
      seoDesc: 'Woohop 如何处理你的数据：无需注册、不收集个人信息；使用 Google Analytics 匿名统计，房间 3 小时无操作即删除。',
      h1: '隐私政策',
      updated: '最后更新：2026 年 10 月 22 日',
      lead: 'Woohop（www.vibeweb100.com）是免费的团建与破冰游戏网站。本页说明我们会接触到哪些数据、如何使用，以及你可以怎么做。',
      sections: [
        ['目前无需注册', [
          '现在使用 Woohop 不需要账号，我们也不会要求你提供姓名、手机号、地址或任何身份信息。如果将来推出会员功能，注册将是自愿的，而且我们会先更新本页，说明会收集哪些信息、如何使用。',
        ]],
        ['你在游戏中输入的内容', [
          '需要多部手机一起玩的房间类游戏（例如{rooms}）会把你输入的昵称和答案暂存在我们的服务器上，让同一房间的人看到。**房间 3 小时没有任何操作就会整个删除**，我们不会另外保存。',
          '只用一部手机或不用手机的游戏，以及桌游小工具，都在你的设备上运行，输入的内容不会发送到服务器。',
        ]],
        ['意见表单', [
          '你通过“联系我们”提交的内容，以及你自愿留下的邮箱，会发送到我们的邮箱。只用于回复你和改进网站，不会用于营销，也不会提供给他人。',
        ]],
        ['浏览器存储与 Cookie', [
          '我们使用浏览器的本地存储（localStorage）和一个名为 web100_lang 的 Cookie，记住你选择的语言、深浅模式和游戏设置。这些只保存在你的设备上，不会用来追踪你。',
        ]],
        ['使用统计（Google Analytics）', [
          '我们使用 Google Analytics 4 了解网站的使用情况，例如打开了哪些页面、使用什么设备、大约来自哪个国家或地区，以及在游戏中点了哪些按钮。这些是匿名的统计数据，用来决定改进哪些游戏。',
          'Google Analytics 会在你的浏览器中设置 Cookie。想了解 Google 如何处理这些数据，请看[Google 的说明](' + GOOGLE_PARTNERS + ')；不想被统计，可以安装 [Google Analytics 停用插件](' + GA_OPTOUT + ')。',
        ]],
        ['托管与其他服务', [
          '网站和游戏服务器由 Vercel 与 Cloudflare 提供，字体来自 Google Fonts。这些服务出于安全和运维需要，会留下一般的访问日志（例如 IP 地址、浏览器类型），我们不会用这些数据识别你的身份。',
        ]],
        ['广告', [
          '目前网站上没有广告。如果将来加入广告（例如 Google AdSense），会先更新本页，说明广告商会使用哪些 Cookie 以及你可以如何选择。',
        ]],
        ['儿童', [
          '各年龄段的团体都可以使用 Woohop，我们不会有意收集任何人的个人信息。如果孩子通过表单留下了邮箱或其他信息，家长可以发邮件请我们删除。',
        ]],
        ['你的权利与联系方式', [
          '想查询或删除你通过表单提供的信息，或对本政策有任何疑问，请发邮件到 {mail}，或使用[联系表单]({contact})。',
        ]],
        ['政策更新', [
          '本政策如有变更，会更新本页和上方的日期。',
        ]],
      ],
    },
  },
};
