/*
 * 福杯滿溢的建置設定。共用的流程在 ../../scripts/build.js，這裡只放這個遊戲不一樣的地方。
 */

// sitemap 的 lastmod：**內容真的有變才手動改**
export const CONTENT_UPDATED = '2026-11-10';

// 每個語言長度要一樣的清單
export const LIST_KEYS = ['ruleCards', 'rulesFacts', 'rulesHowSteps', 'rulesLeadSteps', 'rulesShapes'];

// 玩法頁的「每一局的杯子都不一樣」那張表直接塞 HTML
export const RAW_TOKENS = ['rulesShapesList'];

export function gameBar({ page, strings }) {
  // 有流水聲與溢出聲，所以有聲音開關（頂欄音符鍵）；玩法頁沒有聲音。
  // 沒有設定分頁：唯一的選項（杯子大小）固定顯示在開場
  return { musicLabel: page.dir === 'rules' ? '' : strings.soundLabel };
}

/*
 * 八種容器的說明（玩法頁）。杯型本身在 app/app.js 的 SHAPES，
 * 這裡只是把文案排成 <li>；加第九種容器時這份清單也要補一項（LIST_KEYS 會擋住長度不一致）。
 */
export function tokens({ strings, page, escapeHtml }) {
  if (page.dir !== 'rules') return {};
  return {
    rulesShapesList: strings.rulesShapes
      .map(([name, desc]) => `<li><b>${escapeHtml(name)}</b>：${escapeHtml(desc)}</li>`)
      .join('\n          '),
  };
}
