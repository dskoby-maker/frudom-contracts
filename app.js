/* «Контракты ФД» — калькулятор контрактов (frudom.ru/contracts и calculator.html).
 * Один файл без сборки: оформление + логика.
 * Файл закупки (frudom-contract-v1) делает ChatGPT/Claude, его загружают сюда. Закупочные цены — с сайта документов
 * (таблица «Документы ФД») через скрипт таблицы «Контракты ФД» (действие prices). Расчёты хранятся в браузере
 * и в листе «Калькулятор» той же таблицы (clist / cput / cdel), чтобы были одинаковыми на всех устройствах. */
(function () {
  'use strict';
  var VER = 28;
  var LS = { api: 'fdc-api', pass: 'fdc-pass', db: 'fdc-calc-v1', old: 'fdc-tenders-v1', prices: 'fdc-prices-v1', map: 'fdc-match-v1', book: 'fdc-book-v1', hist: 'fdc-hist-v1' };
  var S = {
    api: '', pass: '', db: {}, map: {}, book: {}, hist: [], page: 'home', prices: null, idx: [], pst: 'off', perr: '', sync: 'local',
    cur: null, filter: 'all', q: '', timers: {}, root: null, booted: false, tz: {}
  };
  var OLD_SCRIPT = 'Скрипт таблицы «Контракты ФД» старый. Вставьте новый Code.gs из репозитория frudom-contracts и сделайте «Развернуть» → «Управление развертываниями» → карандаш → «Новая версия».';
  var MOVED = {
    'https://script.google.com/macros/s/AKfycbwQ4-yGSgDdsD_ZBC2j7sKdTovx-HUYg4y1-L1UPc8Yrs2KMLA4594rdKOHj7pnQQOMKg/exec':
      'https://script.google.com/macros/s/AKfycby98VTpAcy8jqwAdFDiTrdCChz0oHVUrVC6Dde69xTjpSmivxXo4dS7rKdu66X0rzC2Pg/exec'
  };
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────── оформление ───────── */
  var CSS = [
    '#fdc{--bg:#F8F8F5;--sf:#FFFFFF;--card:#EFEFEA;--card2:#E7E7E1;--ink:#161616;--ink2:#2B2B29;--mut:#6E6E68;--mut2:#A6A69F;--line:#E4E4DE;--ac:#161616;--ac2:#2E2E2B;--acs:rgba(22,22,22,.07);--taupe:#4F473D;--olive:#7E8C3C;--ok:#3E6B23;--okb:#E9EFDD;--bad:#B5361F;--badb:#F6E3DD;--warn:#8A5A00;--warnb:#F4EBD6;--r:24px;--e:cubic-bezier(.22,.8,.2,1);--f:"Onest",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;--m:var(--f);font-family:var(--f);font-style:normal;color:var(--ink);background:var(--bg);min-height:100vh;min-height:100dvh;-webkit-text-size-adjust:100%;font-size:15px;line-height:1.45;-webkit-font-smoothing:antialiased;text-align:left;font-variant-numeric:tabular-nums;letter-spacing:-.005em}',
    '#fdc *,#fdc *:before,#fdc *:after{box-sizing:border-box;font-style:normal}',
    '#fdc button,#fdc input,#fdc textarea{font:inherit;color:inherit;letter-spacing:inherit}',
    '#fdc button{cursor:pointer;border:0;background:none;padding:0;-webkit-tap-highlight-color:transparent}',
    '#fdc a{color:inherit}',
    '#fdc ::selection{background:#161616;color:#F8F8F5}',
    '#fdc .w{max-width:1120px;margin:0 auto;padding:0 24px}',
    '#fdc .mono{font-size:12px;font-weight:500}',
    '/* бегущая строка */',
    '#fdc .tick{height:34px;background:#1C1C1A;color:#EEEEEA;overflow:hidden;display:flex;align-items:center;white-space:nowrap;font-size:12px;font-weight:500;}',
    '#fdc .tick .tr{display:inline-flex;animation:fdc-mq 40s linear infinite;will-change:transform}',
    '#fdc .tick:hover .tr{animation-play-state:paused}',
    '#fdc .tick span{display:inline-flex;align-items:center;gap:22px;padding-right:22px}',
    '#fdc .tick i{width:5px;height:5px;border-radius:50%;background:#7E8C3C;flex:none}',
    '@keyframes fdc-mq{to{transform:translateX(-50%)}}',
    '/* шапка */',
    '#fdc .top{position:sticky;top:0;z-index:30;background:rgba(248,248,245,.84);backdrop-filter:saturate(1.4) blur(18px);-webkit-backdrop-filter:saturate(1.4) blur(18px);border-bottom:1px solid transparent;transition:border-color .35s,background .35s}',
    '#fdc .top.sc{border-color:var(--line)}',
    '#fdc .top .w{display:flex;align-items:center;gap:12px;height:64px}',
    '#fdc .brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);white-space:nowrap}',
    '#fdc .brand .bs{font-weight:800;font-size:21px;letter-spacing:-.06em;line-height:1}',
    '#fdc .brand svg.dm{height:15px;width:auto;display:block}',
    '#fdc .brand .bt2{font-weight:400;font-size:21px;letter-spacing:-.04em;line-height:1;color:var(--mut);transition:color .3s}#fdc .brand:hover .bt2{color:var(--ink)}',
    '#fdc .brand svg.dm circle{fill:var(--ink);transition:transform .5s var(--e);transform-box:fill-box;transform-origin:center}',
    '#fdc .brand:hover svg.dm circle{transform:scale(.6)}',
    '#fdc .mark{display:none}',
    '#fdc .navr{display:flex;gap:4px;padding:0 0 10px;margin-top:-6px}',
    '#fdc .navr a{position:relative;display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 14px;border-radius:11px;font-size:14px;font-weight:600;color:var(--mut);text-decoration:none;transition:color .25s,background .25s}',
    '#fdc .navr a:hover{color:var(--ink);background:var(--card)}',
    '#fdc .navr a.on{color:#F3F3EF;background:var(--ink)}',
    '#fdc .navr a b{font-weight:500;opacity:.6;font-size:12.5px}',
    '#fdc .hday{display:flex;align-items:baseline;gap:10px;margin:30px 0 10px;font-size:13px;color:var(--mut);font-weight:600}',
    '#fdc .hday:after{content:"";flex:1;height:1px;background:var(--line)}',
    '#fdc .hday b{color:var(--ink);font-size:15px}',
    '#fdc .hlist{background:var(--sf);border-radius:24px;overflow:hidden}',
    '#fdc .hr{display:grid;grid-template-columns:58px minmax(0,1fr) auto;gap:4px 16px;align-items:center;width:100%;text-align:left;padding:15px 20px;border-top:1px solid var(--line);transition:background .25s;animation:fdc-up .45s var(--e) both}',
    '#fdc .hr:first-child{border-top:0}',
    '#fdc button.hr:hover{background:#F4F4F0}',
    '#fdc .hr .tm{font-size:14px;font-weight:600;color:var(--mut);grid-row:1/3}',
    '#fdc .hr .tt{font-weight:600;letter-spacing:-.015em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#fdc .hr .ts{font-size:13px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;grid-column:2}',
    '#fdc .hr .hv{grid-row:1/3;grid-column:3;text-align:right;font-weight:650;letter-spacing:-.02em;white-space:nowrap}',
    '#fdc .hr .hv small{display:block;font-size:12.5px;font-weight:500;color:var(--mut);letter-spacing:0}',
    '#fdc .hr.gone{opacity:.5}',
    '@media(max-width:600px){#fdc .hr{grid-template-columns:46px minmax(0,1fr) auto;padding:14px 16px;gap:3px 10px}#fdc .navr{padding-bottom:8px}}',
    '#fdc .sp{flex:1}',
    '#fdc .pst{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 14px;border-radius:12px;background:transparent;font-size:12px;font-weight:500;color:var(--ink);transition:background .25s;max-width:52vw}',
    '#fdc .pst:hover{background:var(--card)}',
    '#fdc .pst span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '#fdc .dot{width:7px;height:7px;border-radius:50%;background:var(--mut2);flex:none;transition:background .3s}',
    '#fdc .dot.ok{background:var(--olive)}#fdc .dot.err{background:var(--bad)}#fdc .dot.load{background:#C9A23C;animation:fdc-pulse 1s ease-in-out infinite}',
    '@keyframes fdc-pulse{50%{opacity:.3}}',
    '/* кнопки */',
    '#fdc .btn{text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:9px;height:44px;padding:0 22px;border-radius:16px;font-weight:600;font-size:14px;letter-spacing:-.01em;transition:transform .2s var(--e),background .25s,box-shadow .25s,opacity .2s,color .2s;white-space:nowrap}',
    '#fdc .btn:active{transform:scale(.96)}',
    '#fdc .btn.pri{background:var(--ink);color:#F3F3EF}#fdc .btn.pri:hover{background:#000}',
    '#fdc .btn.sec{background:var(--card);color:var(--ink)}#fdc .btn.sec:hover{background:var(--card2)}',
    '#fdc .btn.gh{color:var(--mut);padding:0 12px}#fdc .btn.gh:hover{color:var(--ink);background:var(--card)}',
    '#fdc .btn.dang{color:var(--bad)}#fdc .btn.dang:hover{background:var(--badb)}',
    '#fdc .btn[disabled]{opacity:.4;pointer-events:none}',
    '#fdc .ib{width:40px;height:40px;border-radius:14px;display:grid;place-items:center;color:var(--ink);transition:background .25s,transform .2s var(--e);flex:none}',
    '#fdc .ib:hover{background:var(--card)}#fdc .ib:active{transform:scale(.9)}',
    '#fdc .lnk{color:var(--ink);font-weight:600;text-decoration:underline;text-decoration-color:var(--mut2);text-underline-offset:3px;transition:text-decoration-color .2s}',
    '#fdc .lnk:hover{text-decoration-color:var(--ink)}',
    '/* страницы и появление */',
    '#fdc .pg{animation:fdc-in .55s var(--e) both;padding-bottom:120px}',
    '#fdc .pg.back{animation-name:fdc-inb}',
    '@keyframes fdc-in{from{opacity:0;transform:translateY(14px);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}',
    '@keyframes fdc-inb{from{opacity:0;transform:translateY(-10px);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}',
    '@keyframes fdc-up{from{opacity:0;transform:translateY(18px);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}',
    '#fdc h1{font-size:44px;line-height:1.02;letter-spacing:-.045em;margin:0;font-weight:650}',
    '#fdc h2{font-size:24px;letter-spacing:-.035em;margin:0;font-weight:650;line-height:1.1}',
    '#fdc .mut{color:var(--mut)}#fdc .sm{font-size:13px}',
    '/* главная */',
    '#fdc .hero{text-align:center;padding:56px 0 8px;animation:fdc-up .7s var(--e) both}',
    '#fdc .hero .kick{font-size:12px;font-weight:500;color:var(--mut);margin-top:18px}',
    '#fdc .hero h1{font-size:56px;max-width:780px;margin:14px auto 0}',
    '#fdc .dmx{display:block;margin:0 auto;height:62px;width:auto}',
    '#fdc .dmx circle{fill:var(--ink);transform-box:fill-box;transform-origin:center;animation:fdc-dot 2.8s var(--e) infinite}',
    '@keyframes fdc-dot{0%,100%{transform:scale(1)}50%{transform:scale(.35)}}',
    '#fdc .drop{position:relative;margin:24px 0 8px;border-radius:32px;background:radial-gradient(120% 140% at 50% 0%,#FDFDFB 0%,#ECECE7 55%,#DCDCD5 100%);padding:56px 24px 52px;text-align:center;overflow:hidden;transition:transform .45s var(--e),box-shadow .45s;animation:fdc-up .7s .08s var(--e) both}',
    '#fdc .drop:before{content:"";position:absolute;inset:12px;border-radius:22px;border:1.5px dashed rgba(22,22,22,.14);pointer-events:none;transition:border-color .3s,inset .4s var(--e)}',
    '#fdc .drop.on{transform:scale(1.012);box-shadow:0 30px 60px -30px rgba(0,0,0,.35)}',
    '#fdc .drop.on:before{border-color:var(--ink);inset:8px}',
    '#fdc .drop .ic{width:60px;height:60px;border-radius:20px;background:var(--ink);color:#F3F3EF;display:grid;place-items:center;margin:0 auto 18px;transition:transform .45s var(--e)}',
    '#fdc .drop.on .ic{transform:translateY(-6px) rotate(-6deg)}',
    '#fdc .drop b{display:block;font-size:26px;letter-spacing:-.04em;font-weight:650;margin-bottom:6px}',
    '#fdc .drop .row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:24px}',
    '#fdc .drop .btn.sec{background:rgba(255,255,255,.75)}#fdc .drop .btn.sec:hover{background:#fff}',
    '#fdc .bar{display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap;margin:56px 0 18px}',
    '#fdc .bar h2{font-size:32px}',
    '#fdc .bar h2 .mut{font-size:14px;font-weight:500;vertical-align:super;margin-left:2px}',
    '#fdc .find{position:relative;flex:1;max-width:340px;min-width:180px;margin-left:auto}',
    '#fdc .find svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--mut2);pointer-events:none}',
    '#fdc .inp{width:100%;height:46px;border-radius:14px;border:1px solid transparent;background:var(--card);padding:0 16px;outline:0;transition:border-color .25s,box-shadow .25s,background .25s}',
    '#fdc .find .inp{padding-left:42px;height:44px}',
    '#fdc textarea.inp{height:auto;min-height:200px;padding:14px 16px;resize:vertical;line-height:1.45;font-size:13px}',
    '#fdc .inp:focus{background:#fff;border-color:var(--ink);box-shadow:0 0 0 4px var(--acs)}',
    '#fdc .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}',
    '#fdc .card{position:relative;display:flex;flex-direction:column;gap:16px;text-align:left;width:100%;background:var(--sf);border-radius:var(--r);padding:22px;transition:transform .45s var(--e),box-shadow .45s var(--e);animation:fdc-up .6s var(--e) both}',
    '@media(hover:hover){#fdc .card:hover{transform:translateY(-4px);box-shadow:0 26px 50px -30px rgba(0,0,0,.35)}}',
    '#fdc .card:active{transform:scale(.985);transition-duration:.12s}',
    '#fdc .card.gone{opacity:.55}',
    '#fdc .card.fresh{box-shadow:0 0 0 2px #7E8C3C inset}#fdc .pill.nw{background:#E9EFDD;color:#3E6B23;font-weight:650;display:inline-flex;align-items:center;gap:6px}#fdc .pill.nw i{width:7px;height:7px;border-radius:50%;background:#7E8C3C;animation:fdc-nw 1.6s ease-in-out infinite}@keyframes fdc-nw{50%{opacity:.35}}#fdc .hst .nw b{color:#3E6B23}#fdc .hst .nw:not(.on){color:#3E6B23}',
    '#fdc .card .t{font-weight:650;font-size:19px;line-height:1.15;letter-spacing:-.03em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
    '#fdc .card .c{font-size:12.5px;color:var(--mut);margin-top:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#fdc .card .nums{display:flex;justify-content:space-between;align-items:flex-end;gap:10px;margin-top:auto}',
    '#fdc .card .nums small{display:block;font-size:12.5px;color:var(--mut);margin-bottom:4px}',
    '#fdc .card .nums b{font-size:22px;letter-spacing:-.04em;font-weight:650}',
    '#fdc .prog{height:3px;border-radius:3px;background:var(--card);overflow:hidden}',
    '#fdc .prog i{display:block;height:100%;border-radius:3px;background:var(--ink);transition:width .8s var(--e)}',
    '#fdc .pill{display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 10px;border-radius:9px;font-size:12.5px;font-weight:500;background:var(--card);color:var(--ink2);white-space:nowrap}',
    '#fdc .pill.hot{background:var(--badb);color:var(--bad)}#fdc .pill.soon{background:var(--warnb);color:var(--warn)}#fdc .pill.ok{background:var(--okb);color:var(--ok)}#fdc .pill.gone{color:var(--mut2)}',
    '#fdc .pos{color:var(--ok)}#fdc .neg{color:var(--bad)}',
    '#fdc .empty{text-align:center;color:var(--mut);padding:44px 10px;font-size:15px}',
    '/* расчёт */',
    '#fdc .head{padding:20px 0 6px;display:flex;gap:10px;align-items:flex-start;animation:fdc-up .6s var(--e) both}',
    '#fdc .head .tx{flex:1;min-width:0}',
    '#fdc .head h1{font-size:46px}',
    '#fdc .head .meta{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;margin-top:14px;font-size:12px;color:var(--mut)}',
    '#fdc .backl{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:500;color:var(--ink);height:34px;margin:18px 0 0 -10px;padding:0 12px 0 8px;border-radius:12px;transition:background .25s}',
    '#fdc .backl:hover{background:var(--card)}',
    '#fdc .backl svg{transition:transform .3s var(--e)}#fdc .backl:hover svg{transform:translateX(-3px)}',
    '#fdc .panel{background:var(--sf);border-radius:32px;padding:28px;margin-top:22px;animation:fdc-up .65s .06s var(--e) both}',
    '#fdc .cutrow{display:flex;align-items:center;gap:14px;flex-wrap:wrap}',
    '#fdc .cutrow .l{font-size:12px;font-weight:500}',
    '#fdc .cutbox{display:inline-flex;align-items:baseline;height:52px;border-radius:16px;background:var(--card);padding:0 16px 0 6px;font-weight:650;font-size:26px;letter-spacing:-.04em;transition:box-shadow .25s,background .25s;align-items:center}',
    '#fdc .cutbox:focus-within{background:#fff;box-shadow:inset 0 0 0 2px var(--ink)}',
    '#fdc .cutbox input{width:84px;border:0;background:none;outline:0;text-align:right;font-weight:650;font-size:26px;letter-spacing:-.04em;padding:0 2px}',
    '#fdc .quick{display:flex;gap:6px;margin-left:auto;flex-wrap:wrap}',
    '#fdc .quick button{height:34px;padding:0 12px;border-radius:11px;font-size:12px;font-weight:500;color:var(--ink);background:var(--card);transition:background .25s,color .25s,transform .2s var(--e)}',
    '#fdc .quick button:hover{background:var(--card2)}#fdc .quick button.on{background:var(--ink);color:#F3F3EF}#fdc .quick button:active{transform:scale(.92)}',
    '#fdc .rng{position:relative;margin:30px 0 8px;height:30px}',
    '#fdc .rng input{-webkit-appearance:none;appearance:none;position:absolute;inset:0;width:100%;height:30px;background:none;margin:0;outline:0;cursor:pointer;touch-action:pan-y}',
    '#fdc .rng .tr{position:absolute;left:0;right:0;top:13px;height:4px;border-radius:4px;background:var(--card);pointer-events:none}',
    '#fdc .rng input::-webkit-slider-thumb{-webkit-appearance:none;width:28px;height:28px;border-radius:50%;background:#fff;border:2px solid var(--ink);box-shadow:0 4px 14px -4px rgba(0,0,0,.35);transition:transform .2s var(--e),box-shadow .2s}',
    '#fdc .rng input:active::-webkit-slider-thumb{transform:scale(1.15);box-shadow:0 0 0 10px var(--acs),0 4px 14px -4px rgba(0,0,0,.35)}',
    '#fdc .rng input::-moz-range-thumb{width:24px;height:24px;border-radius:50%;background:#fff;border:2px solid var(--ink);box-shadow:0 4px 14px -4px rgba(0,0,0,.35)}',
    '#fdc .rng input::-moz-range-track{background:none}',
    '#fdc .rng .be{position:absolute;top:-4px;width:2px;height:38px;margin-left:-1px;background:var(--bad);border-radius:2px;pointer-events:none;transition:left .35s var(--e),opacity .35s}',
    '#fdc .scale{display:flex;justify-content:space-between;font-size:12.5px;color:var(--mut2);padding:0 4px}',
    '#fdc .bel{margin-top:14px;font-size:15px;color:var(--mut);min-height:22px}',
    '#fdc .bel b{color:var(--ink);font-weight:650}',
    '#fdc .tiles{display:grid;grid-template-columns:repeat(4,1fr) 1.4fr;gap:10px;margin-top:22px}',
    '#fdc .tile{position:relative;text-align:left;background:var(--card);border-radius:20px;padding:16px 16px 15px;min-width:0;transition:background .3s,transform .25s var(--e),box-shadow .3s;animation:fdc-up .6s var(--e) both}',
    '#fdc .tiles .tile:nth-child(2){animation-delay:.04s}#fdc .tiles .tile:nth-child(3){animation-delay:.08s}#fdc .tiles .tile:nth-child(4){animation-delay:.12s}#fdc .tiles .tile:nth-child(5){animation-delay:.16s}',
    '#fdc button.tile:hover{background:var(--card2)}#fdc button.tile:active{transform:scale(.975)}',
    '#fdc .tile small{display:block;font-size:12.5px;font-weight:500;color:var(--mut);margin-bottom:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#fdc .tile b{display:block;font-size:24px;letter-spacing:-.045em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:650}',
    '#fdc .tile em{display:block;font-style:normal;font-size:12.5px;color:var(--mut);margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#fdc .tile input{width:100%;border:0;background:none;outline:0;font-size:24px;font-weight:650;letter-spacing:-.045em;padding:0}',
    '#fdc .tin{display:flex;align-items:baseline;gap:4px}#fdc .tin span{font-size:24px;font-weight:650;flex:none}',
    '#fdc .tile.edit{cursor:text}#fdc .tile.edit:focus-within{background:#fff;box-shadow:inset 0 0 0 2px var(--ink)}',
    '#fdc .tile.big{background:var(--ink);color:#F3F3EF}',
    '#fdc .tile.big small,#fdc .tile.big em{color:rgba(243,243,239,.6)}',
    '#fdc button.tile.big:hover{background:#000}',
    '#fdc .tile.big b{font-size:32px}',
    '#fdc .tile.big.pos{background:#33521C}#fdc button.tile.big.pos:hover{background:#2A4616}',
    '#fdc .tile.big.neg{background:#8F2715}#fdc button.tile.big.neg:hover{background:#7D2010}',
    '#fdc .note{display:flex;gap:12px;align-items:center;flex-wrap:wrap;border-radius:18px;padding:13px 16px;margin-top:12px;font-size:14px;background:var(--warnb);color:#5A3B05;animation:fdc-up .5s var(--e) both}',
    '#fdc .note.info{background:var(--card);color:var(--mut)}',
    '#fdc .note .btn{height:36px;border-radius:12px;background:#fff}',
    '#fdc .note .sp{min-width:8px}',
    '/* позиции */',
    '#fdc .lhd{display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap;margin:56px 0 18px}',
    '#fdc .lhd h2{font-size:32px}',
    '#fdc .lhd h2 .mut{font-size:14px;font-weight:500;vertical-align:super;margin-left:2px}',
    '#fdc .seg{display:inline-flex;background:var(--card);border-radius:14px;padding:4px;position:relative;margin-left:auto}',
    '#fdc .seg button{position:relative;z-index:1;height:34px;padding:0 14px;border-radius:10px;font-weight:500;font-size:12px;color:var(--mut);transition:color .3s}',
    '#fdc .seg button.on{color:#F3F3EF}#fdc .seg button b{font-weight:500;opacity:.6;margin-left:5px}',
    '#fdc .seg i{position:absolute;top:4px;bottom:4px;left:0;border-radius:10px;background:var(--ink);transition:transform .45s var(--e),width .45s var(--e)}',
    '#fdc .lines{background:var(--sf);border-radius:28px;overflow:hidden;animation:fdc-up .6s var(--e) both}',
    '#fdc .lr{display:grid;grid-template-columns:minmax(0,1fr) 104px 168px 200px 140px;gap:16px;align-items:center;padding:18px 22px;border-top:1px solid var(--line);transition:background .3s}',
    '#fdc .lr:first-child{border-top:0}',
    '#fdc .lr.th{font-size:12.5px;font-weight:500;color:var(--mut);padding-top:16px;padding-bottom:14px}',
    '#fdc .lr.in{animation:fdc-up .5s var(--e) both}',
    '#fdc .lr.flash{background:#F2F2EC}',
    '#fdc .lr .r{text-align:right}',
    '#fdc .nm{font-weight:600;line-height:1.25;letter-spacing:-.02em;font-size:15.5px}',
    '#fdc .nm small{display:block;font-weight:400;color:var(--mut);font-size:13px;margin-top:3px;letter-spacing:0}',
    '#fdc .n2{font-size:12.5px;color:var(--mut);margin-top:3px;white-space:nowrap}',
    '#fdc .pp{display:flex;flex-direction:column;align-items:stretch;gap:6px}',
    '#fdc .mi{width:100%;height:42px;border-radius:13px;border:1px solid transparent;background:var(--card);padding:0 30px 0 12px;text-align:right;font-weight:650;font-size:16px;letter-spacing:-.02em;outline:0;transition:border-color .25s,box-shadow .25s,background .35s}',
    '#fdc .miw{position:relative}#fdc .miw:after{content:"₽";position:absolute;right:12px;top:11px;color:var(--mut2);font-weight:600;pointer-events:none}',
    '#fdc .mi:hover{background:var(--card2)}',
    '#fdc .mi:focus{background:#fff;border-color:var(--ink);box-shadow:0 0 0 4px var(--acs)}',
    '#fdc .mi::placeholder{color:var(--mut2);font-weight:500;font-size:14px;letter-spacing:0}',
    '#fdc .mi.got{animation:fdc-got 1s ease}',
    '@keyframes fdc-got{0%{background:#DDE6C6}100%{background:var(--card)}}',
    '#fdc .src{display:inline-flex;align-items:flex-start;gap:6px;max-width:100%;font-size:12.5px;font-weight:600;color:var(--mut);border-radius:9px;padding:3px 7px;margin:0 -7px;transition:background .25s,color .25s;text-align:left;line-height:1.3}',
    '#fdc .src:hover{background:var(--card);color:var(--ink)}',
    '#fdc .src span{overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}',
    '#fdc .src small{display:block;font-size:12.5px;font-weight:500;color:var(--mut2);margin-top:2px}',
    '#fdc .src .d{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none;opacity:.8;margin-top:5px;align-self:flex-start}',
    '#fdc .src.auto{color:var(--warn)}#fdc .src.find{color:var(--ink);text-decoration:underline;text-decoration-color:var(--mut2);text-underline-offset:3px}',
    '#fdc .pr b{display:block;font-size:17px;letter-spacing:-.03em;font-weight:650;transition:color .3s}',
    '#fdc .mb{height:3px;border-radius:3px;background:var(--card);margin-top:8px;overflow:hidden;display:flex;justify-content:flex-end}',
    '#fdc .mb i{display:block;height:100%;border-radius:3px;background:var(--olive);transition:width .55s var(--e),background .3s}',
    '#fdc .mb i.neg{background:var(--bad)}',
    '#fdc .ul{font-size:12px;color:var(--warn);font-weight:600}',
    '/* описание */',
    '#fdc .hbtn{display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 18px;border-radius:15px;font-weight:600;font-size:14px;background:var(--ink);color:#F3F3EF;transition:transform .2s var(--e),background .25s;white-space:nowrap}',
    '#fdc .hbtn:hover{background:#000}#fdc .hbtn:active{transform:scale(.95)}',
    '#fdc .hbtn .vd{width:7px;height:7px;border-radius:50%;background:var(--mut2)}#fdc .hbtn .vd.ok{background:#9DBB5A}#fdc .hbtn .vd.care{background:#E2B44B}#fdc .hbtn .vd.bad{background:#EF6B53}',
    '#fdc .sh.wide{max-width:940px}',
    '#fdc .vdb{border-radius:22px;padding:18px 20px;background:var(--card);display:flex;gap:12px;align-items:flex-start;font-size:15px;line-height:1.5;animation:fdc-up .5s var(--e) both}',
    '#fdc .vdb.ok{background:var(--okb);color:#25401A}#fdc .vdb.care{background:var(--warnb);color:#523605}#fdc .vdb.bad{background:var(--badb);color:#6E1E12}',
    '#fdc .vdb b{display:block;font-size:12px;font-weight:600;margin-bottom:6px}',
    '#fdc .sum{font-size:18px;line-height:1.5;letter-spacing:-.015em;margin:18px 0 4px}',
    '#fdc .facts{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}',
    '#fdc .fact{background:var(--card);border-radius:16px;padding:12px 14px;min-width:0;animation:fdc-up .5s var(--e) both}',
    '#fdc .fact small{display:block;font-size:12.5px;font-weight:500;color:var(--mut);margin-bottom:5px}',
    '#fdc .fact span{display:block;font-weight:600;line-height:1.35;overflow-wrap:anywhere;letter-spacing:-.01em}',
    '#fdc .h3{font-size:12px;font-weight:500;color:var(--mut);margin:30px 0 12px;display:flex;align-items:center;gap:10px}',
    '#fdc .h3:after{content:"";flex:1;height:1px;background:var(--line)}',
    '#fdc .flag{display:grid;grid-template-columns:8px 1fr;gap:6px 14px;padding:14px 16px;border-radius:18px;background:var(--card);margin-bottom:8px;animation:fdc-up .5s var(--e) both}',
    '#fdc .flag i{width:8px;height:8px;border-radius:50%;margin-top:7px;background:var(--mut2)}',
    '#fdc .flag.red{background:var(--badb)}#fdc .flag.red i{background:var(--bad)}',
    '#fdc .flag.yellow{background:var(--warnb)}#fdc .flag.yellow i{background:#C99520}',
    '#fdc .flag.green{background:var(--okb)}#fdc .flag.green i{background:var(--olive)}',
    '#fdc .flag b{font-size:16px;font-weight:650;letter-spacing:-.02em}#fdc .flag div{grid-column:2;font-size:14px;color:#3A3A36;line-height:1.55}',
    '#fdc .map{height:320px;border-radius:22px;overflow:hidden;background:var(--card);position:relative;z-index:0}',
    '#fdc .map .ms{position:absolute;inset:0;display:grid;place-items:center;color:var(--mut);font-size:14px;text-align:center;padding:20px}',
    '#fdc .pts{display:grid;gap:6px;margin-top:10px}',
    '#fdc .pt{display:grid;grid-template-columns:28px 1fr auto;gap:2px 12px;align-items:center;padding:12px 14px;border-radius:16px;background:var(--card);text-align:left;width:100%;transition:background .25s,transform .2s var(--e)}',
    '#fdc .pt:hover{background:var(--card2)}#fdc .pt:active{transform:scale(.99)}',
    '#fdc .pt .no,#fdc .mk{width:28px;height:28px;border-radius:50%;background:var(--ink);color:#F3F3EF;display:grid;place-items:center;font-weight:600;font-size:12px}',
    '#fdc .mk{box-shadow:0 6px 16px -4px rgba(0,0,0,.5);border:2px solid #fff;width:32px;height:32px}',
    '#fdc .pt b{font-weight:650;letter-spacing:-.01em}#fdc .pt small{grid-column:2;color:var(--mut);font-size:13px}',
    '#fdc .pt a{grid-row:1/3;grid-column:3;font-size:12.5px;font-weight:500;color:var(--ink);text-decoration:none;white-space:nowrap}',
    '#fdc .sec ul{margin:0;padding-left:20px}#fdc .sec li{margin:7px 0;line-height:1.55}',
    '#fdc .sec li::marker{color:var(--mut2)}',
    '#fdc .leaflet-container{font:inherit;background:var(--card)}',
    '/* ТЗ */',
    '#fdc .tzb{display:inline-flex;align-items:center;gap:5px;margin-top:8px;font-size:12.5px;font-weight:500;color:var(--ink);border-radius:9px;padding:4px 8px;margin-left:-8px;transition:background .25s}',
    '#fdc .tzb:hover{background:var(--card)}#fdc .tzb svg{transition:transform .4s var(--e)}#fdc .tzb.on svg{transform:rotate(180deg)}',
    '#fdc .tzw{display:grid;grid-template-rows:0fr;transition:grid-template-rows .45s var(--e)}#fdc .tzw.on{grid-template-rows:1fr}',
    '#fdc .tzw>div{overflow:hidden}',
    '#fdc .tz{margin-top:8px;padding:14px 16px;border-radius:16px;background:var(--card);font-size:13.5px;font-weight:400;line-height:1.6;color:#3A3A36;white-space:pre-line;opacity:0;transform:translateY(-6px);transition:opacity .35s,transform .45s var(--e)}',
    '#fdc .tzw.on .tz{opacity:1;transform:none}',
    '#fdc .lr>.c6{grid-column:1/-1;margin-top:-16px}#fdc .lr>.c6 .tz{margin-top:14px;max-width:860px}',
    '/* окна */',
    '#fdc .ov{position:fixed;inset:0;z-index:100;background:rgba(20,20,18,.32);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;animation:fdc-fade .3s ease both}',
    '#fdc .ov.out{animation:fdc-fadeo .25s ease both}',
    '@keyframes fdc-fade{from{opacity:0}}@keyframes fdc-fadeo{to{opacity:0}}',
    '#fdc .sh{width:100%;max-width:580px;max-height:min(800px,calc(100vh - 40px));display:flex;flex-direction:column;background:var(--bg);border-radius:30px;box-shadow:0 40px 100px -30px rgba(0,0,0,.45);animation:fdc-pop .5s var(--e) both;overflow:hidden}',
    '#fdc .ov.out .sh{animation:fdc-popo .25s ease both}',
    '@keyframes fdc-pop{from{opacity:0;transform:translateY(22px) scale(.97);filter:blur(4px)}}@keyframes fdc-popo{to{opacity:0;transform:translateY(12px) scale(.98)}}',
    '#fdc .sh .hd{display:flex;align-items:flex-start;gap:12px;padding:26px 26px 14px}',
    '#fdc .sh .hd .tx{flex:1;min-width:0}',
    '#fdc .sh .hd h2{font-size:26px}',
    '#fdc .sh .bd{padding:0 26px 22px;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}',
    '#fdc .sh .ft{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;padding:16px 26px;border-top:1px solid var(--line)}',
    '#fdc .tabs{display:flex;gap:6px;margin:14px 0 4px;flex-wrap:wrap}',
    '#fdc .tabs button{height:32px;padding:0 13px;border-radius:10px;font-size:12.5px;font-weight:500;color:var(--ink);background:var(--card);transition:background .25s,color .25s}',
    '#fdc .tabs button.on{background:var(--ink);color:#F3F3EF}',
    '#fdc .opt{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 14px;width:100%;text-align:left;padding:13px 14px;border-radius:16px;transition:background .2s,transform .2s var(--e);animation:fdc-up .35s var(--e) both}',
    '#fdc .opt:hover,#fdc .opt.kb{background:var(--card)}#fdc .opt:active{transform:scale(.99)}',
    '#fdc .opt .on1{font-weight:600;line-height:1.3;letter-spacing:-.01em}',
    '#fdc .opt .on2{font-size:12.5px;color:var(--mut);grid-column:1}',
    '#fdc .opt .op{text-align:right;font-weight:650;white-space:nowrap;letter-spacing:-.02em}',
    '#fdc .opt .op small{display:block;font-weight:600;font-size:12px;letter-spacing:0}',
    '#fdc .opt.cur{box-shadow:inset 0 0 0 2px var(--ink)}',
    '#fdc .chk{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--mut);cursor:pointer;margin-right:auto}',
    '#fdc .chk input{accent-color:var(--ink);width:16px;height:16px}',
    '#fdc .lab{display:block;font-size:12.5px;font-weight:500;color:var(--mut);margin:18px 0 8px}',
    '#fdc .errt{color:var(--bad);font-size:13px;min-height:18px;margin-top:8px}',
    '#fdc .brk{display:grid;grid-template-columns:1fr auto;gap:11px 16px;font-size:16px;margin-top:8px}',
    '#fdc .brk b{font-weight:650;letter-spacing:-.02em}',
    '#fdc .brk .s{border-top:1px solid var(--line);padding-top:12px;font-weight:650}',
    '/* уведомление и плавающая плашка */',
    '#fdc .toast{position:fixed;left:50%;bottom:92px;z-index:200;transform:translate(-50%,16px);opacity:0;background:var(--ink);color:#F3F3EF;padding:12px 18px;border-radius:14px;font-size:12px;font-weight:500;box-shadow:0 18px 40px -16px rgba(0,0,0,.5);transition:opacity .35s,transform .5s var(--e);pointer-events:none;max-width:calc(100vw - 32px)}',
    '#fdc .toast.on{opacity:1;transform:translate(-50%,0)}',
    '#fdc .fpill{position:fixed;left:50%;bottom:22px;z-index:40;transform:translate(-50%,140%);opacity:0;display:flex;align-items:center;gap:12px;height:54px;padding:0 22px;border-radius:18px;background:var(--taupe);color:#F3F1EC;font-size:13px;font-weight:500;white-space:nowrap;box-shadow:0 20px 44px -16px rgba(40,34,26,.6);transition:transform .55s var(--e),opacity .4s,background .4s;max-width:calc(100vw - 28px)}',
    '#fdc .fpill.on{transform:translate(-50%,0);opacity:1}',
    '#fdc .fpill:hover{background:#433C33}',
    '#fdc .fpill .fs{opacity:.45}',
    '#fdc .fpill b{font-weight:600;overflow:hidden;text-overflow:ellipsis}',
    '#fdc .fpill.pos b{color:#C6DA8E}#fdc .fpill.neg b{color:#F4A28F}',
    '#fdc .fpill svg{flex:none;opacity:.8}',
    '#fdc .dragov{position:fixed;inset:12px;z-index:90;border-radius:32px;background:rgba(248,248,245,.82);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border:2px dashed var(--ink);display:none;place-items:center;font-size:30px;letter-spacing:-.04em;font-weight:650;color:var(--ink);pointer-events:none}',
    '#fdc .dragov.on{display:grid;animation:fdc-fade .25s both}',
    '#fdc .ld{display:inline-block;width:15px;height:15px;border-radius:50%;border:2px solid currentColor;border-right-color:transparent;animation:fdc-spin .7s linear infinite;vertical-align:-3px}',
    '@keyframes fdc-spin{to{transform:rotate(360deg)}}',
    '#fdc .kf{display:grid;grid-template-columns:1fr 1fr 2.2fr;gap:10px;margin-top:22px;animation:fdc-up .6s var(--e) .05s both}',
    '#fdc .kc{background:var(--sf);border-radius:22px;padding:16px 18px;min-width:0}',
    '#fdc .kc small{display:block;font-size:12.5px;font-weight:500;color:var(--mut);margin-bottom:8px}',
    '#fdc .kc>b{display:block;font-size:24px;font-weight:650;letter-spacing:-.04em;white-space:nowrap}',
    '#fdc .kc>em{display:block;font-style:normal;font-size:13px;color:var(--mut);margin-top:4px}',
    '#fdc .kc.hot>b,#fdc .kc.hot>em{color:var(--bad)}#fdc .kc.soon>em{color:var(--warn)}#fdc .kc.gone>b{color:var(--mut2)}',
    '#fdc .kc.ad{display:flex;flex-direction:column;gap:6px}#fdc .kc.ad small{margin-bottom:2px}',
    '#fdc .ar{display:grid;grid-template-columns:24px minmax(0,1fr) auto auto;gap:8px;align-items:center}',
    '#fdc .ar .no{width:24px;height:24px;border-radius:50%;background:var(--ink);color:#F3F3EF;display:grid;place-items:center;font-weight:600;font-size:11.5px}',
    '#fdc .ar .at{min-width:0}#fdc .ar .at b{display:block;font-weight:600;font-size:14.5px;line-height:1.25;letter-spacing:-.01em}',
    '#fdc .ar .at span{display:block;font-size:12.5px;color:var(--mut);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#fdc .ya{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:12px;background:var(--card);color:var(--ink);font-size:13px;font-weight:600;text-decoration:none;white-space:nowrap;transition:background .25s,transform .2s var(--e)}',
    '#fdc .ya:hover{background:var(--ink);color:#F3F3EF}#fdc .ya:active{transform:scale(.94)}',
    '#fdc .arf{display:flex;gap:6px 16px;flex-wrap:wrap}#fdc .arf:empty{display:none}',
    '#fdc .lnkb{display:inline;padding:0;background:none;border:0;font:inherit;font-size:12.5px;font-weight:600;color:var(--ink);text-decoration:underline;text-decoration-color:var(--mut2);text-underline-offset:3px;cursor:pointer}',
    '#fdc .lnkb:hover{text-decoration-color:var(--ink)}#fdc .tile.big .lnkb{color:#F3F3EF}',
    '#fdc .strow{display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap;margin-top:12px;animation:fdc-up .6s var(--e) .1s both}',
    '#fdc .stc{display:flex;gap:6px;flex-wrap:wrap}',
    '#fdc .stc button,#fdc .hst button{height:34px;padding:0 13px;border-radius:11px;font-size:12.5px;font-weight:500;background:var(--card);color:var(--ink2);transition:background .25s,color .25s,transform .2s var(--e)}',
    '#fdc .stc button:hover,#fdc .hst button:hover{background:var(--card2)}#fdc .stc button:active,#fdc .hst button:active{transform:scale(.93)}',
    '#fdc .stc button.on,#fdc .hst button.on{background:var(--ink);color:#F3F3EF}',
    '#fdc .stc button.won.on,#fdc .hst button.won.on{background:#33521C}#fdc .stc button.lost.on,#fdc .hst button.lost.on{background:#8F2715}#fdc .stc button.sent.on,#fdc .hst button.sent.on{background:var(--olive)}#fdc .stc button.skip.on,#fdc .hst button.skip.on{background:var(--mut)}',
    '#fdc .hst{display:flex;gap:6px;flex-wrap:wrap;margin:-4px 0 16px}#fdc .hst b{font-weight:500;opacity:.55;margin-left:6px}',
    '#fdc .pill.st.go{background:var(--ink);color:#F3F3EF}#fdc .pill.st.sent{background:#E5E9D3;color:#4A5420}#fdc .pill.st.won{background:var(--okb);color:var(--ok)}#fdc .pill.st.lost{background:var(--badb);color:var(--bad)}#fdc .pill.st.skip{color:var(--mut2)}',
    '#fdc textarea.inp.nt{flex:1;min-width:240px;min-height:34px;height:34px;padding:7px 13px;border-radius:11px;font-size:13.5px;line-height:1.4;resize:none;background:var(--sf)}',
    '#fdc .tgm{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:10px;font-size:13px;color:var(--mut)}#fdc .tgm:empty{display:none}',
    '#fdc .tgm span{margin-right:4px}#fdc .tgm button{height:30px;padding:0 11px;border-radius:10px;font-size:12px;font-weight:500;background:var(--card);color:var(--ink);transition:background .25s,transform .2s var(--e)}',
    '#fdc .tgm button:hover{background:var(--card2)}#fdc .tgm button:active{transform:scale(.93)}#fdc .tgm button[disabled]{opacity:.45}',
    '#fdc .cpl{height:42px;margin-left:auto;padding:0 14px;border-radius:14px}#fdc .cpl+.seg{margin-left:0}',
    '#fdc .lgg{display:grid;grid-template-columns:1fr 1fr;gap:10px}#fdc .lgg small{display:block;font-size:12.5px;color:var(--mut);margin-bottom:6px}',
    '#fdc .lgt{margin-top:16px;font-size:16px;color:var(--mut)}#fdc .lgt b{color:var(--ink);font-size:22px;letter-spacing:-.03em}',
    '@media(max-width:960px){#fdc .kf{grid-template-columns:1fr 1fr}#fdc .kc.ad{grid-column:1/-1}}',
    '@media(max-width:600px){#fdc .kc{padding:14px 14px;border-radius:20px}#fdc .kc>b{font-size:18px;white-space:normal}#fdc .ar .at b{font-size:13.5px}#fdc .ar{grid-template-columns:24px minmax(0,1fr) auto auto;gap:6px}#fdc .ya{width:40px;padding:0;justify-content:center}#fdc .ya span{display:none}#fdc .nt{min-width:0;flex-basis:100%}#fdc .stc{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;margin:0 -14px;padding:0 14px;width:calc(100% + 28px)}#fdc .stc button{flex:none}#fdc .cpl{margin-left:0}#fdc .cpl span{display:none}#fdc .lgg{grid-template-columns:1fr}}',
    '#fdc .pill[hidden]{display:none}',
    '#fdc .hbtn.ai{background:var(--card);color:var(--ink)}#fdc .hbtn.ai:hover{background:var(--card2)}#fdc .hbtn.ai svg{color:var(--olive)}',
    '#fdc .qew{display:flex;align-items:center;gap:6px}#fdc .qew .qi{width:96px;height:36px;font-size:14px;background:var(--warnb);border-radius:10px;padding:0 10px}',
    '#fdc .qew span{color:var(--mut)}#fdc .qen{display:block;font-size:11.5px;color:var(--warn);margin-top:4px}',
    '#fdc .aihome{margin-top:16px;font-size:13px;color:var(--mut);display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap}',
    '#fdc .aihome .dt{width:7px;height:7px;border-radius:50%;background:var(--mut2)}#fdc .aihome .dt.on{background:var(--olive)}',
    '#fdc .aim{display:grid;gap:6px}#fdc .aim button{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;padding:12px 14px;border-radius:14px;background:var(--card);transition:background .25s,box-shadow .25s}',
    '#fdc .aim button span{font-size:12.5px;color:var(--mut)}#fdc .aim button.on{background:#fff;box-shadow:inset 0 0 0 2px var(--ink)}',
    '#fdc .aimeta{margin-top:18px;font-size:12.5px;color:var(--mut)}',
    '#fdc .aip{display:flex;gap:22px;align-items:center;padding:8px 0}',
    '#fdc .aiorb{position:relative;width:64px;height:64px;flex:none}',
    '#fdc .aiorb i{position:absolute;inset:0;border-radius:50%;border:2px solid var(--olive);opacity:0;animation:fdc-orb 2.4s var(--e) infinite}',
    '#fdc .aiorb i:nth-child(2){animation-delay:.8s}#fdc .aiorb i:nth-child(3){animation-delay:1.6s}',
    '@keyframes fdc-orb{0%{transform:scale(.3);opacity:.9}100%{transform:scale(1);opacity:0}}',
    '#fdc .ais{display:grid;gap:9px;font-size:14px;color:var(--mut2)}#fdc .ais div{display:flex;align-items:center;gap:10px;transition:color .3s}',
    '#fdc .ais span{width:9px;height:9px;border-radius:50%;background:var(--line);flex:none;transition:background .3s}',
    '#fdc .ais .on{color:var(--ink);font-weight:600}#fdc .ais .on span{background:var(--olive);animation:fdc-pulse 1s ease-in-out infinite alternate}',
    '#fdc .ais .ok{color:var(--mut)}#fdc .ais .ok span{background:var(--ink)}#fdc .ais em{font-style:normal;font-weight:500;color:var(--mut)}',
    '@keyframes fdc-pulse{to{transform:scale(1.5);opacity:.6}}',
    '#fdc .lr [data-after] span{display:block}#fdc .lr [data-after] b{white-space:nowrap;font-weight:600;color:var(--ink2)}',
    '@media(max-width:600px){#fdc .lr [data-after] span{font-size:12px}}',
    '/* телефон */',
    '@media(max-width:960px){#fdc .tiles{grid-template-columns:1fr 1fr}#fdc .tile.big{grid-column:1/-1}}',
    '@media(max-width:820px){',
    '#fdc .lr.th{display:none}',
    '#fdc .lr{grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"n n" "q u" "p r" "t t";gap:12px 14px;padding:18px}',
    '#fdc .lr>.c6{grid-area:t}#fdc .lr>.c1{grid-area:n}#fdc .lr>.c2{grid-area:q}#fdc .lr>.c3{grid-area:u;text-align:right}#fdc .lr>.c4{grid-area:p}#fdc .lr>.c5{grid-area:r;align-self:end}',
    '#fdc .lr .lb{display:block;font-size:12.5px;font-weight:500;color:var(--mut2);margin-bottom:4px}}',
    '@media(min-width:821px){#fdc .lr .lb{display:none}}',
    '@media(max-width:600px){',
    '#fdc .w{padding:0 14px}#fdc h1,#fdc .head h1{font-size:30px}#fdc .hero{padding-top:36px}#fdc .hero h1{font-size:36px}',
    '#fdc .brand .bs,#fdc .brand .bt2{font-size:18px}#fdc .brand svg.dm{height:12px}',
    '#fdc .panel{padding:18px;border-radius:26px}#fdc .quick{margin:0 -18px;padding:0 18px;width:calc(100% + 36px);flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}#fdc .quick::-webkit-scrollbar{display:none}#fdc .quick button{flex:none}',
    '#fdc .tile b,#fdc .tile input,#fdc .tin span{font-size:20px}#fdc .tile.big b{font-size:28px}',
    '#fdc .ov{align-items:flex-end;padding:0}',
    '#fdc .sh{max-width:none;border-radius:28px 28px 0 0;max-height:92vh;padding-bottom:env(safe-area-inset-bottom)}',
    '@keyframes fdc-pop{from{transform:translateY(100%)}}@keyframes fdc-popo{to{transform:translateY(100%)}}',
    '#fdc .sh .hd{padding:22px 20px 12px}#fdc .sh .bd{padding:0 20px 20px}#fdc .sh .ft{padding:14px 20px}',
    '#fdc .seg{margin-left:0;width:100%}#fdc .seg button{flex:1;padding:0 8px}',
    '#fdc .find{max-width:none;margin-left:0}#fdc .facts{grid-template-columns:1fr 1fr}#fdc .fact span{font-size:14px}#fdc .map{height:240px}',
    '#fdc .bar h2,#fdc .lhd h2{font-size:26px}#fdc .drop{padding:40px 18px 36px;border-radius:26px}#fdc .drop b{font-size:22px}',
    '#fdc .head{flex-wrap:wrap}#fdc .head .tx{flex-basis:100%}#fdc .head .hbtn{margin-right:auto}',
    '#fdc .toast{bottom:78px}#fdc .sh .hd h2{font-size:22px}#fdc .fpill{bottom:14px;height:50px;padding:0 18px;font-size:12px;gap:10px}',
    '#fdc .tick{height:30px;font-size:12.5px}#fdc .pst{padding:0 10px}}',
    '/* компактные строки товаров */',
    '#fdc .lr{grid-template-columns:minmax(0,1fr) 88px 150px 168px 112px;gap:14px;padding:11px 18px}',
    '#fdc .lr.th{font-size:11.5px;padding-top:12px;padding-bottom:10px}',
    '#fdc .nm{font-size:14px}#fdc .nm small{font-size:12px;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#fdc .tzb{display:flex;width:fit-content;margin-top:3px;font-size:11.5px;padding:2px 6px;margin-left:-6px;color:var(--mut)}#fdc .tzb svg{width:12px;height:12px}',
    '#fdc .lr>.c2,#fdc .lr>.c3{font-size:14px}',
    '#fdc .n2{font-size:11.5px;margin-top:1px}#fdc .lr [data-after] span{line-height:1.35;font-size:11.5px}',
    '#fdc .pp{gap:3px}#fdc .mi{height:34px;border-radius:10px;font-size:14px;padding:0 24px 0 10px}#fdc .miw:after{right:10px;top:8px;font-size:13px}#fdc .mi::placeholder{font-size:12.5px}',
    '#fdc .src{font-size:11.5px;padding:2px 6px;margin:0 -6px}#fdc .src small{font-size:11px;margin-top:0}#fdc .src .d{width:5px;height:5px}',
    '#fdc .pr b{font-size:15px}#fdc .mb{height:2px;margin-top:5px}',
    '#fdc .qew .qi{width:76px;height:30px;font-size:13px;border-radius:9px;padding:0 8px}#fdc .qen{font-size:11px;margin-top:2px}',
    '#fdc .lr>.c6{margin-top:-12px}#fdc .tz{font-size:12.5px;padding:10px 12px;border-radius:12px}',
    '@media(max-width:820px){',
    '#fdc .lr{grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"n n" "q u" "p r" "t t";gap:8px 12px;padding:13px 14px;align-items:start}',
    '#fdc .lr .lb{font-size:10.5px;margin-bottom:2px;letter-spacing:.01em}#fdc .lr>.c5{align-self:start;padding-top:16px}#fdc .lr>.c5 .lb,#fdc .lr>.c5 .mb{display:none}#fdc .lr>.c5 b{font-size:15px}',
    '#fdc .qew .qi{width:100%;min-width:0}#fdc .qew{gap:4px}#fdc .qew span{font-size:12px}',
    '#fdc .lr [data-after] span{font-size:10.5px}#fdc .lr>.c6{margin-top:-4px}#fdc .lr>.c2,#fdc .lr>.c3{font-size:13.5px}}',
    '#fdc .card .c.dz{margin-top:2px;font-size:11.5px;color:var(--mut2)}#fdc .head .meta .dz{color:var(--mut2)}',
    '#fdc .stbar{position:fixed;left:50%;bottom:16px;z-index:45;display:flex;padding:4px;border-radius:16px;background:rgba(239,239,234,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 14px 34px -14px rgba(0,0,0,.35),inset 0 0 0 1px rgba(0,0,0,.04);transform:translate(-50%,160%);opacity:0;transition:transform .5s var(--e),opacity .35s;width:min(420px,calc(100% - 28px))}',
    '#fdc .stbar.on{transform:translate(-50%,0);opacity:1}',
    '#fdc .stbar button{position:relative;z-index:1;flex:1;height:42px;border-radius:12px;font-size:13.5px;font-weight:600;color:var(--mut);transition:color .3s;white-space:nowrap}',
    '#fdc .stbar button.on{color:#F3F3EF}#fdc .stbar button:active{transform:scale(.96)}',
    '#fdc .stbar i{position:absolute;top:4px;bottom:4px;left:0;border-radius:12px;background:var(--ink);opacity:0;transition:transform .45s var(--e),width .45s var(--e),background .3s,opacity .3s}',
    '#fdc .stbar.s-go i{background:#33521C}#fdc .stbar.s-skip i{background:#8A847A}#fdc .stbar.s-think i{background:var(--ink)}',
    '#fdc.hasst .fpill{bottom:80px}#fdc.hasst .toast{bottom:136px}#fdc.hasst #fdc-main{padding-bottom:70px}',
    '@media(max-width:600px){#fdc .stbar{bottom:12px}#fdc .stbar button{height:40px;font-size:13px}#fdc.hasst .fpill{bottom:72px}#fdc.hasst .toast{bottom:128px}}',
    '#fdc .cvn{display:block;font-size:11px;color:var(--mut);margin-top:2px;line-height:1.3}',
    '#fdc .sh .hd,#fdc .sh .ft{flex:none}#fdc .sh .bd{flex:1 1 auto;min-height:0}',
    '#fdc .sh .bd.fix{flex:none;overflow:visible;padding-bottom:10px;border-bottom:1px solid var(--line)}#fdc .sh .bd.fix .tabs{margin-bottom:0}',
    '#fdc .sh .bd.res{min-height:160px;padding-top:12px}#fdc .sh .bd.res .lab{margin-top:0}',
    '#fdc .op .pu{font-size:12px;font-weight:500;color:var(--mut)}',
    '@media(max-width:600px){#fdc .sh .bd.fix .tabs{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;margin:12px -20px 0;padding:0 20px}#fdc .sh .bd.fix .tabs button{flex:none}#fdc .sh .bd.fix .tabs::-webkit-scrollbar{display:none}}',
    '#fdc .tile b.long{font-size:20px;letter-spacing:-.04em}#fdc .tile.big b.long{font-size:28px}',
    '#fdc .pm{display:flex;flex-wrap:wrap;align-items:stretch;gap:10px;margin-top:10px}#fdc .pm:empty{display:none}',
    '#fdc .pmh{flex:1 1 100%;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;text-align:left;font-size:13px;font-weight:600;color:var(--ink);padding:2px 2px 0}',
    '#fdc .pmh span{font-weight:500;color:var(--mut)}#fdc .pmh i{font-style:normal;font-weight:500;color:var(--mut);text-decoration:underline;text-decoration-color:var(--mut2);text-underline-offset:3px}#fdc .pmh:hover i{color:var(--ink)}',
    '#fdc .pmc{flex:1 1 150px;background:var(--sf);border:1px solid var(--line);border-radius:16px;padding:12px 14px;min-width:0}',
    '#fdc .pmc small{display:block;font-size:12px;color:var(--mut);margin-bottom:4px}#fdc .pmc b{display:block;font-size:19px;font-weight:650;letter-spacing:-.035em;white-space:nowrap}',
    '#fdc .pmc em{display:block;font-style:normal;font-size:11.5px;color:var(--mut);margin-top:2px}#fdc .pmc.pos b{color:#33521C}#fdc .pmc.neg b{color:var(--bad)}',
    '@media(max-width:600px){#fdc .pmc{flex:1 1 calc(50% - 5px);padding:10px 12px}#fdc .pmc b{font-size:16px}}',
    '@media(prefers-reduced-motion:reduce){#fdc *,#fdc *:before,#fdc *:after{animation-duration:.01ms!important;transition-duration:.01ms!important}}'
  ].join('\n');

  var IC = {
    logo: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>',
    up: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M7 9l5-5 5 5"/><path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"/></svg>',
    find: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    x: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    cp: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
    dl: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    del: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>',
    ref: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></svg>',
    wand: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="m4 20 10-10M14 4v3M19 9h-3M17 5l-2 2M18.5 14.5l-1.5-1.5"/></svg>',
    ai: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.6L18.5 9.5l-4.7 1.9L12 16l-1.8-4.6L5.5 9.5l4.7-1.9z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>',
    info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>',
    down: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    paste: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h4"/></svg>'
  };

  /* ───────── мелочи ───────── */
  function $(s, r) { return (r || S.root).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || S.root).querySelectorAll(s)); }
  function esc(s) { return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k) || ''; if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return ''; }
    return '';
  }
  function num(v) {
    if (v === null || v === undefined || v === '') return null;
    if (typeof v === 'number') return isFinite(v) ? v : null;
    var s = String(v).replace(/[\s  ]/g, '').replace(/[^\d.,-]/g, '');
    if (!s || s === '-' ) return null;
    if (s.indexOf(',') >= 0 && s.indexOf('.') >= 0) s = s.replace(/[.,](?=.*[.,])/g, '');
    s = s.replace(',', '.');
    var n = Number(s); return isFinite(n) ? n : null;
  }
  function grp(s) { return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function fnum(n, d) {
    if (n === null || n === undefined || !isFinite(n)) return '—';
    var neg = n < 0; n = Math.abs(n);
    var s = n.toFixed(d === undefined ? 2 : d), p = s.split('.');
    var r = grp(p[0]) + (p[1] && Number(p[1]) ? ',' + p[1] : '');
    return (neg ? '−' : '') + r;
  }
  function qty(n) { return fnum(n, 3).replace(/(,\d*?)0+$/, '$1').replace(/,$/, ''); }
  function rub(n) { return fnum(Math.round(n), 0) + ' ₽'; }
  function rubk(n) { return fnum(n, 2) + ' ₽'; }
  function pct(n, d) { return fnum(n * 100, d === undefined ? 1 : d) + '%'; }
  function plural(n, a, b, c) { n = Math.abs(n) % 100; var m = n % 10; return n > 10 && n < 20 ? c : m > 1 && m < 5 ? b : m === 1 ? a : c; }
  function dtRu(s) { var t = new Date(s); if (!s || isNaN(t)) return ''; var p = function (n) { return ('0' + n).slice(-2); }; return p(t.getDate()) + '.' + p(t.getMonth() + 1) + '.' + t.getFullYear() + ', ' + p(t.getHours()) + ':' + p(t.getMinutes()); }
  function nowIso() { return new Date().toISOString(); }
  function dRu(s) { var m = String(s || '').match(/(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '.' + m[2] + (String(new Date().getFullYear()) === m[1] ? '' : '.' + m[1]) : ''; }
  function norm(s) { return String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim(); }
  function unitN(u) {
    u = norm(u).replace(/[.\s]/g, '');
    if (/^(кг|килограмм)/.test(u)) return 'кг';
    if (/^(л|литр)/.test(u)) return 'л';
    if (/^(шт|штук)/.test(u)) return 'шт';
    if (/^(г|гр|грамм)$/.test(u)) return 'г';
    if (/^(уп|упак)/.test(u)) return 'уп';
    if (/^(дес|десят)/.test(u)) return 'дес';
    return u;
  }
  /* вес/объём одной штуки из названия: «430гх20», «0,5 кг», «1л», «500 мл» */
  function wOf(name) {
    var m = String(name || '').toLowerCase().replace(/(\d),(\d)/g, '$1.$2').match(/(\d+(?:\.\d+)?)\s*(кг|килограмм|гр|грамм|г|мл|миллилитр|л|литр)\.?(?=$|[^а-яё]|х)/);
    if (!m) return null; var v = Number(m[1]); if (!v) return null;
    var u = m[2];
    if (/^к/.test(u)) return { u: 'кг', v: v };
    if (/^г/.test(u)) return { u: 'кг', v: v / 1000 };
    if (/^м/.test(u)) return { u: 'л', v: v / 1000 };
    return { u: 'л', v: v };
  }
  function wTxt(w) { return w.v < 1 ? fnum(w.v * 1000, 0) + (w.u === 'кг' ? ' г' : ' мл') : fnum(w.v, w.v % 1 ? 2 : 0) + ' ' + w.u; }
  /* цена кандидата в единице позиции: «за шт» → «за кг» по весу в названии (и обратно) */
  function cConv(c, it) {
    var cu = unitN(c.unit), iu = unitN(it.unit);
    if (!c.unit || !it.unit || cu === iu) return { p: c.price };
    var big = function (u) { return u === 'кг' || u === 'л'; };
    if (big(iu) && !big(cu)) { var w = wOf(c.name) || wOf(c.product); if (w && w.u === iu) return { p: Math.round(c.price / w.v * 100) / 100, how: fnum(c.price, 2) + ' ₽ за ' + c.unit + ' (' + wTxt(w) + ') → за ' + iu }; }
    if (big(cu) && !big(iu)) { var w2 = wOf(it.name); if (w2 && w2.u === cu) return { p: Math.round(c.price * w2.v * 100) / 100, how: fnum(c.price, 2) + ' ₽ за ' + cu + ' × ' + wTxt(w2) + ' → за ' + it.unit }; }
    return { p: c.price, bad: true };
  }
  function toast(t) {
    var el = $('.toast'); if (!el) return;
    el.textContent = t; el.classList.add('on');
    clearTimeout(S.timers.toast); S.timers.toast = setTimeout(function () { el.classList.remove('on'); }, 2600);
  }
  /* Статусы расчёта */
  var ST = [['think', 'Думаем'], ['go', 'Участвуем'], ['sent', 'Заявка подана'], ['won', 'Выиграли'], ['lost', 'Проиграли'], ['skip', 'Не участвуем']];
  var ST_K = {}; ST.forEach(function (x) { ST_K[x[0]] = x[1]; });
  /* До какого числа контракт: поле info.term или условие «Срок договора/контракта» — берётся самая поздняя дата */
  function termOf(d) {
    var I = d.info || {}, src = '', rx = /срок (договора|контракта|действия|исполнения)|действует|исполнени|^срок$|срок$/i;
    if (I.term) src = typeof I.term === 'string' ? I.term : [I.term.text, I.term.from, I.term.to].filter(Boolean).join(' ');
    if (!src) (I.facts || []).some(function (f) { if (f && rx.test(String(f.k || '')) && /\d{2}\.\d{2}\.\d{4}/.test(String(f.v || ''))) { src = String(f.v); return true; } return false; });
    if (!src) return null;
    var best = null; String(src).replace(/(\d{2})\.(\d{2})\.(\d{4})/g, function (m, a, b, c) { var t = new Date(c + '-' + b + '-' + a + 'T23:59:00+03:00'); if (!isNaN(t) && (!best || t > best.t)) best = { t: t, full: m }; return m; });
    if (!best) return null;
    var days = Math.floor((best.t - Date.now()) / 864e5), txt;
    if (days < 0) txt = 'срок прошёл';
    else if (days < 60) txt = 'ещё ' + days + ' ' + plural(days, 'день', 'дня', 'дней');
    else { var mo = Math.round(days / 30.4), y = Math.floor(mo / 12), r = mo % 12; txt = 'ещё ' + (y ? y + ' ' + plural(y, 'год', 'года', 'лет') + (r ? ' ' : '') : '') + (r ? r + ' мес.' : ''); }
    return { full: best.full, txt: txt, src: src, gone: days < 0 };
  }
  function ptQ(p) { return p.lat && p.lng ? p.lat + ',' + p.lng : p.address || ''; }
  function yMap(p) { return p.lat && p.lng ? 'https://yandex.ru/maps/?pt=' + p.lng + ',' + p.lat + '&z=16&l=map' : 'https://yandex.ru/maps/?text=' + encodeURIComponent(p.address || ''); }
  function yRoute(pts) { return 'https://yandex.ru/maps/?rtext=~' + pts.map(function (p) { return encodeURIComponent(ptQ(p)); }).join('~') + '&rtt=auto'; }
  function points(d) { return ((d.info && d.info.points) || []).filter(function (p) { return p && (p.address || (p.lat && p.lng)); }); }
  function copyText(t, ok) {
    var done = function () { toast(ok || 'Скопировано'); };
    var old = function () { var a = document.createElement('textarea'); a.value = t; a.style.cssText = 'position:fixed;opacity:0;top:0'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); done(); } catch (e) { toast('Не удалось скопировать'); } a.remove(); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, old); else old();
  }
  function deadline(s) {
    var m = String(s || '').match(/(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
    if (!m) return null;
    var d = new Date(s); if (isNaN(d)) d = new Date(m[1] + '-' + m[2] + '-' + m[3] + 'T' + (m[4] || '23') + ':' + (m[5] || '59') + ':00+03:00');
    var left = d.getTime() - Date.now(), days = Math.floor(left / 864e5), o = { left: left, full: m[3] + '.' + m[2] + '.' + m[1] + (m[4] ? ', ' + m[4] + ':' + m[5] : ''), cls: '', txt: '' };
    if (left < 0) { o.cls = 'gone'; o.txt = 'приём окончен'; }
    else if (days < 1) { var h = Math.floor(left / 36e5); o.cls = 'hot'; o.txt = h < 1 ? 'меньше часа' : 'осталось ' + h + ' ч'; }
    else { o.cls = days <= 2 ? 'hot' : days <= 5 ? 'soon' : ''; o.txt = 'осталось ' + days + ' ' + plural(days, 'день', 'дня', 'дней'); }
    return o;
  }

  /* Плавная смена числа. */
  function tw(el, to, f) {
    if (!el) return;
    var from = el._v === undefined ? to : el._v;
    el._v = to; el._f = f;
    if (RM || from === to || !isFinite(from) || !isFinite(to)) { el.textContent = f(to); return; }
    var t0 = performance.now(), dur = 380;
    cancelAnimationFrame(el._raf);
    (function step(t) {
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = f(from + (to - from) * e);
      if (k < 1) el._raf = requestAnimationFrame(step);
    })(t0);
  }

  /* Поле денег: пробелы между тысячами прямо при вводе («60 000»), курсор не прыгает. */
  function moneyFmt(s) {
    s = String(s).replace(/[^\d.,]/g, '').replace('.', ',');
    var i = s.indexOf(','); if (i >= 0) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/,/g, '').slice(0, 2);
    var p = s.split(','); p[0] = p[0].replace(/^0+(?=\d)/, '');
    return grp(p[0]) + (p.length > 1 ? ',' + p[1] : '');
  }
  function moneyIn(inp) {
    inp.addEventListener('input', function () {
      var v = inp.value, pos = inp.selectionStart || 0, before = v.slice(0, pos).replace(/[^\d,.]/g, '').length;
      var f = moneyFmt(v); if (f === v) return;
      inp.value = f;
      var c = 0, p = 0; while (p < f.length && c < before) { if (/[\d,]/.test(f[p])) c++; p++; }
      try { inp.setSelectionRange(p, p); } catch (e) { /* пусто */ }
    });
  }
  function moneyShow(n) { return n === null || n === undefined ? '' : moneyFmt(String(Math.round(n * 100) / 100).replace('.', ',')); }

  /* ───────── связь со скриптом таблицы ───────── */
  function connected() { return !!(S.api && S.pass); }
  function api(a, data) {
    var body = { a: a, pass: S.pass }; for (var k in (data || {})) body[k] = data[k];
    return fetch(S.api, { method: 'POST', body: JSON.stringify(body), redirect: 'follow' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok && j.err === 'pass') { S.pass = ''; ls(LS.pass, null); S.pst = 'pass'; S.sync = 'local'; paintPst(); throw new Error('pass'); }
        if (!j.ok) throw new Error(j.err || 'Ошибка');
        return j;
      });
  }

  /* ───────── хранилище расчётов ───────── */
  function saveLocal() { try { localStorage.setItem(LS.db, JSON.stringify(S.db)); } catch (e) { toast('Браузер не дал сохранить — мало места'); } }
  function touch(d) { d.updated = nowIso(); saveLocal(); push(d.number); }
  function push(id) {
    if (!connected() || S.sync === 'off') return;
    clearTimeout(S.timers['p' + id]);
    S.timers['p' + id] = setTimeout(function () {
      var d = S.db[id]; if (!d) return;
      api('cput', { id: id, data: JSON.stringify(d) }).then(function () { S.sync = 'cloud'; paintPst(); })
        .catch(function (e) { if (e.message === 'Неизвестная команда') { S.sync = 'off'; paintPst(); } else if (e.message !== 'pass' && /слишком/.test(e.message)) toast(e.message); });
    }, 1200);
  }
  function pull() {
    if (!connected()) return Promise.resolve();
    return api('clist').then(function (j) {
      var changed = 0, seen = {};
      (j.rows || []).forEach(function (r) {
        var d; try { d = JSON.parse(r.data); } catch (e) { return; }
        if (r.id === '__hist__') { if (d && histMerge(d.hist || [], d.cleared)) changed++; S.histSeen = 1; return; }
        if (r.id === '__ai__') { if (d && d.ai) aiMerge(d.ai); S.aiSeen = 1; return; }
        if (r.id === '__book__') { if (d && d.book && bookMerge(d.book)) changed++; S.bookSeen = 1; return; }
        if (!d || !d.number) return; seen[d.number] = 1;
        var mine = S.db[d.number];
        if (!mine || String(d.updated || '') > String(mine.updated || '')) {
          if (!mine && S.gone && S.gone[d.number]) return;
          S.db[d.number] = d; changed++;
        }
      });
      Object.keys(S.db).forEach(function (id) { if (!seen[id]) push(id); });
      if (!S.bookSeen && bookCount()) bookSave();
      if (!S.aiSeen && aiOn()) aiSave(aiCfg());
      if (!S.histSeen && S.hist.length) histSave();
      S.sync = 'cloud';
      if (purgeOld()) changed = 0;
      if (changed) { saveLocal(); applyPrices(); if (S.cur && !S.db[S.cur]) go(''); else soft(); }
      paintPst();
      inbox();
    }).catch(function (e) { if (e.message === 'Неизвестная команда') S.sync = 'off'; paintPst(); });
  }
  /* Файлы закупок, которые Claude положил в папку Google Диска «Контракты ФД — от Claude» (Code.gs ≥ 7). */
  function inbox() {
    if (S.inboxRun) return; S.inboxRun = 1;
    api('inbox').then(function (j) {
      var ok = [], bad = [], chain = Promise.resolve();
      (j.files || []).forEach(function (f) {
        chain = chain.then(function () {
          var r, err = '';
          try { r = importData(parseText(f.data)); r.d.fresh = 1; touch(r.d); ok.push(r.d.number); } catch (e) { err = String(e.message || e); bad.push(f.name); }
          return api('inboxDone', { id: f.id, ok: !err, err: err }).catch(function () { /* пусто */ });
        });
      });
      return chain.then(function () {
        if (ok.length) { saveLocal(); applyPrices(); soft(); toast('Добавлено из Claude: ' + ok.length + (ok.length === 1 ? ' — № ' + ok[0] : '')); }
        if (bad.length) toast('Не открылись файлы: ' + bad.join(', '));
      });
    }).catch(function () { /* старый скрипт таблицы — молча */ }).then(function () { S.inboxRun = 0; });
  }

  /* ───────── чтение файла закупки ───────── */
  function parseText(t) {
    t = String(t || '').replace(/^﻿/, '').trim();
    var m = t.match(/```(?:json)?\s*([\s\S]*?)```/); if (m) t = m[1];
    var a = t.indexOf('{'), b = t.lastIndexOf('}');
    if (a < 0 || b <= a) throw new Error('В тексте нет данных закупки');
    try { return JSON.parse(t.slice(a, b + 1)); } catch (e) { throw new Error('Текст повреждён — скопируйте ответ целиком'); }
  }
  /* Принимает frudom-contract-v1, а также старую карточку (fdc:1) — переводит её в формат калькулятора. */
  function normalize(d) {
    if (d && d.fdc === 1 && Array.isArray(d.pos)) {
      d = { schema: 'frudom-contract-v1', number: String(d.id || ''), title: d.title || (d.ai && d.ai.title) || '', customer: d.ai && d.ai.customer ? (d.ai.customer.short || d.ai.customer.name || '') : '',
        nmck: d.sum !== undefined ? d.sum : d.ai && d.ai.sum, tax_percent: 8, logistics: 0, deadline: d.deadline || '', url: d.url || '',
        items: d.pos.map(function (p) { return { name: p.n || '', spec: p.ch || '', quantity: p.q, unit: p.u, unit_price: p.p, purchase_price: null, note: '' }; }), info: infoFromCard(d) };
    }
    if (!d || typeof d !== 'object' || !Array.isArray(d.items)) throw new Error('Это не файл закупки: нет списка товаров');
    if (d.schema && d.schema !== 'frudom-contract-v1') throw new Error('Неизвестный формат файла: ' + d.schema);
    var items = d.items.slice(0, 800).map(function (x, i) {
      var q = num(x.quantity), p = num(x.unit_price), pp = num(x.purchase_price);
      if (!x || !String(x.name || '').trim()) throw new Error('У позиции №' + (i + 1) + ' нет названия');
      if (q === null || q <= 0) throw new Error('У позиции «' + x.name + '» нет количества');
      if (p === null || p < 0) throw new Error('У позиции «' + x.name + '» нет цены');
      var it = { name: String(x.name).trim().slice(0, 300), quantity: q, unit: String(x.unit || '').trim().slice(0, 20), unit_price: p, purchase_price: pp !== null && pp >= 0 ? pp : null, note: String(x.note || '').slice(0, 300) };
      var spec = x.spec || x.tz || x.ch; if (spec) it.spec = String(spec).slice(0, 6000);
      if (it.purchase_price !== null) it.src = x.src && typeof x.src === 'object' ? x.src : { kind: 'file' };
      else if (x.noAuto) it.noAuto = true;
      if (x.qe) it.qe = true;
      return it;
    });
    if (!items.length) throw new Error('В файле нет позиций');
    var number = String(d.number || d.id || '').trim() || ('без-номера-' + Date.now().toString(36));
    var sum = items.reduce(function (a, x) { return a + x.quantity * x.unit_price; }, 0);
    return {
      schema: 'frudom-contract-v1', number: number.slice(0, 60), title: String(d.title || '').slice(0, 300), customer: String(d.customer || '').slice(0, 300),
      nmck: num(d.nmck) !== null ? num(d.nmck) : Math.round(sum * 100) / 100, tax_percent: num(d.tax_percent) !== null ? num(d.tax_percent) : 8,
      logistics: Math.max(0, num(d.logistics) || 0), deadline: String(d.deadline || ''), url: String(d.url || ''),
      cut: num(d.cut) !== null ? Math.min(99, Math.max(0, num(d.cut))) : 10, items: items, added: d.added || nowIso(), updated: d.updated || nowIso(),
      info: cleanInfo(d.info),
      status: ST_K[d.status] ? d.status : '', note: String(d.note || '').slice(0, 2000), months: num(d.months) > 0 ? Math.round(num(d.months)) : 0,
      logi: d.logi && typeof d.logi === 'object' ? { n: num(d.logi.n) || 0, p: num(d.logi.p) || 0 } : null
    };
  }
  /* Описание контракта: только простые данные, не больше ~30 000 знаков. */
  function cleanInfo(i) {
    if (!i || typeof i !== 'object') return null;
    try { var s = JSON.stringify(i); if (s.length > 30000) return null; return JSON.parse(s); } catch (e) { return null; }
  }
  /* Старая карточка (fdc:1) → описание */
  function infoFromCard(c) {
    var a = c.ai || {}, f = [];
    var add = function (k, v) { if (v) f.push({ k: k, v: String(v) }); };
    add('Закон', a.law); add('Способ', a.method); add('Площадка', a.platform); add('Только СМП', a.smp);
    add('Срок', a.term && (a.term.text || [a.term.from, a.term.to].filter(Boolean).join(' – ')));
    add('Поставки', a.delivery && a.delivery.freq); add('Срок поставки', a.delivery && a.delivery.lead);
    add('Оплата', a.payment && a.payment.text); add('Обеспечение заявки', a.security && a.security.bid);
    add('Обеспечение договора', a.security && a.security.contract); add('Штрафы', a.security && a.security.penalty);
    return { summary: a.summary || '', facts: f, verdict: a.verdict ? { level: a.verdict.level, text: a.verdict.text } : null,
      flags: (a.flags || []).map(function (x) { return { level: x.level, title: x.title, why: x.why + (x.quote ? ' — «' + x.quote + '»' : '') }; }),
      points: (c.points || []).map(function (p) { return { name: p.name, address: p.address, lat: p.lat, lng: p.lng }; }),
      sections: a.requirements && a.requirements.length ? [{ title: 'Требования', items: a.requirements }] : [] };
  }
  function importData(raw) {
    var d = normalize(raw), old = S.db[d.number], upd = !!old;
    if (old) {
      /* тот же контракт ещё раз: сохраняем мои цены, снижение и логистику */
      var mine = {}; old.items.forEach(function (x) { if (x.purchase_price !== null) mine[norm(x.name) + '|' + unitN(x.unit) + '|' + x.unit_price] = x; });
      d.items.forEach(function (x) { var m = mine[norm(x.name) + '|' + unitN(x.unit) + '|' + x.unit_price]; if (x.purchase_price === null && m) { x.purchase_price = m.purchase_price; x.src = m.src; } });
      d.cut = old.cut; if (!raw.logistics && old.logistics) d.logistics = old.logistics; d.added = old.added;
      if (!d.months && old.months) d.months = old.months;
      if (!d.status && old.status) d.status = old.status; if (!d.note && old.note) d.note = old.note; if (!d.logi && old.logi) d.logi = old.logi;
      if (!d.info && old.info) d.info = old.info;
      var specs = {}; old.items.forEach(function (x) { if (x.spec) specs[norm(x.name)] = x.spec; });
      d.items.forEach(function (x) { if (!x.spec && specs[norm(x.name)]) x.spec = specs[norm(x.name)]; });
    }
    if (S.gone) delete S.gone[d.number];
    S.db[d.number] = d; fill(d); touch(d);
    return { d: d, upd: upd };
  }
  function readFiles(files) {
    files = Array.prototype.slice.call(files || []).filter(function (f) { return f && f.size; });
    if (!files.length) return;
    var done = [], errs = [];
    var chain = Promise.resolve();
    var zips = files.filter(function (f) { return isZip(f); }), many = files.length > 1, skip = [];
    files = files.filter(function (f) { return !isZip(f); });
    zips.forEach(function (f, i) {
      chain = chain.then(function () { if (many) toast('Архив ' + (i + 1) + ' из ' + zips.length + ': ' + f.name); return openZip(f, many, skip); })
        .then(function (r) { if (r && r.d) done.push(r); });
    });
    files.forEach(function (f) {
      chain = chain.then(function () {
        if (f.size > 3e6) throw new Error('файл больше 3 МБ');
        return f.text();
      }).then(function (t) { done.push(importData(parseText(t))); })
        .catch(function (e) { errs.push(f.name + ': ' + e.message); });
    });
    chain.then(function () {
      errs = errs.concat(skip.err || []);
      if (errs.length && done.length + errs.length < 2) toast(errs[0]);
      if (done.length === 1 && !many) { toast(done[0].upd ? 'Расчёт обновлён' : 'Закупка добавлена'); go(done[0].d.number); }
      else if (done.length) { toast('Добавлено закупок: ' + done.length + (errs.length ? ' · не открылись: ' + errs.length + ' (' + errs[0] + ')' : '') + (skip.length ? ' · нужен ИИ: ' + skip.length : '')); if (done.length === 1) go(done[0].d.number); else go(''); }
      else if (errs.length > 1) toast('Не открылись: ' + errs.length + ' · ' + errs[0]);
      if (skip.length) setTimeout(function () { noNoticeDlg(skip[0].files, skip[0].name + (skip.length > 1 ? ' и ещё ' + (skip.length - 1) : ''), skip.slice(1)); }, done.length ? 1200 : 0);
    });
  }

  /* ───────── архив закупки (ZIP из ЕИС) ─────────
   * Способ 1 — без ИИ: сайт сам читает «Извещение.html» (у 44-ФЗ оно одинаковое) — номер, сроки, НМЦК, адреса, товары с ТЗ.
   * Способ 2 — ИИ: документы архива уходят прямо из браузера в Claude (ключ — в «Настройках ИИ»), ответ — тот же файл закупки. */
  var CP866 = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмноп' + new Array(49).join('_') + 'рстуфхцчшщъыьэюяЁёЄєЇїЎў°∙·√№¤■ ';
  function isZip(f, b) { return /\.zip$/i.test(f && f.name || '') || /zip/i.test(f && f.type || '') || (b && b[0] === 0x50 && b[1] === 0x4B && b[2] === 3 && b[3] === 4); }
  function zName(b) {
    try { return new TextDecoder('utf-8', { fatal: true }).decode(b); } catch (e) { /* не UTF-8 */ }
    var s = ''; for (var i = 0; i < b.length; i++) s += b[i] < 128 ? String.fromCharCode(b[i]) : CP866.charAt(b[i] - 128);
    return s;
  }
  function inflate(data) {
    if (!window.DecompressionStream) return Promise.reject(new Error('Браузер старый и не умеет открывать архивы — обновите его'));
    return new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer().then(function (a) { return new Uint8Array(a); });
  }
  function unzip(buf) {
    var b = new Uint8Array(buf), dv = new DataView(b.buffer, b.byteOffset, b.byteLength), i, out = [];
    for (i = b.length - 22; i >= Math.max(0, b.length - 65600); i--) if (dv.getUint32(i, true) === 0x06054b50) break;
    if (i < 0) return Promise.reject(new Error('Архив повреждён или это не ZIP'));
    var n = dv.getUint16(i + 10, true), p = dv.getUint32(i + 16, true), list = [];
    for (var k = 0; k < n && p + 46 <= b.length; k++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      var fl = dv.getUint16(p + 8, true), meth = dv.getUint16(p + 10, true), cs = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lh = dv.getUint32(p + 42, true);
      var nb = b.subarray(p + 46, p + 46 + nl), name = (fl & 0x800) ? new TextDecoder('utf-8').decode(nb) : zName(nb);
      /* имя в Юникоде в доп. поле 0x7075 */
      var ex = p + 46 + nl, ee = ex + el;
      while (ex + 4 <= ee) { var id = dv.getUint16(ex, true), sz = dv.getUint16(ex + 2, true); if (id === 0x7075 && sz > 5) { try { name = new TextDecoder('utf-8').decode(b.subarray(ex + 9, ex + 4 + sz)); } catch (e) { /* пусто */ } } ex += 4 + sz; }
      list.push({ name: name, meth: meth, cs: cs, lh: lh });
      p += 46 + nl + el + cl;
    }
    var chain = Promise.resolve();
    list.forEach(function (e) {
      if (/\/$/.test(e.name)) return;
      chain = chain.then(function () {
        var q = e.lh, st = q + 30 + dv.getUint16(q + 26, true) + dv.getUint16(q + 28, true), raw = b.subarray(st, st + e.cs);
        return (e.meth === 0 ? Promise.resolve(raw) : e.meth === 8 ? inflate(raw) : Promise.reject(new Error('сжатие ' + e.meth)))
          .then(function (data) { out.push({ name: e.name.split('/').pop(), path: e.name, data: data }); }, function () { /* файл пропускаем */ });
      });
    });
    return chain.then(function () { return out; });
  }
  /* все файлы архива, вложенные архивы тоже раскрываются */
  function unzipDeep(buf, depth) {
    return unzip(buf).then(function (fs) {
      var res = [], chain = Promise.resolve();
      fs.forEach(function (f) {
        if (/\.zip$/i.test(f.name) && (depth || 0) < 3) chain = chain.then(function () { return unzipDeep(f.data, (depth || 0) + 1).then(function (sub) { res = res.concat(sub); }, function () { /* пусто */ }); });
        else res.push(f);
      });
      return chain.then(function () { return res; });
    });
  }
  function decodeTxt(u) {
    var t = new TextDecoder('utf-8').decode(u);
    if ((t.match(/�/g) || []).length > 20) try { t = new TextDecoder('windows-1251').decode(u); } catch (e) { /* пусто */ }
    return t;
  }
  function elTxt(el) {
    if (!el) return '';
    var c = el.cloneNode(true), w = document.createTreeWalker(c, 4), tn;
    while ((tn = w.nextNode())) tn.nodeValue = tn.nodeValue.replace(/\s+/g, ' ');
    $$('br', c).forEach(function (br) { br.replaceWith('\n'); }); $$('p,div,li,tr', c).forEach(function (x) { x.append('\n'); });
    return c.textContent.split('\n').map(function (l) { return l.replace(/\s+/g, ' ').trim(); }).filter(Boolean).join('\n');
  }
  function oneLine(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  var ORG = [['МУНИЦИПАЛЬНОЕ БЮДЖЕТНОЕ ОБЩЕОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ', 'МБОУ'], ['МУНИЦИПАЛЬНОЕ АВТОНОМНОЕ ОБЩЕОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ', 'МАОУ'], ['МУНИЦИПАЛЬНОЕ БЮДЖЕТНОЕ ДОШКОЛЬНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ', 'МБДОУ'],
    ['МУНИЦИПАЛЬНОЕ АВТОНОМНОЕ ДОШКОЛЬНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ', 'МАДОУ'], ['МУНИЦИПАЛЬНОЕ ДОШКОЛЬНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ', 'МДОУ'], ['МУНИЦИПАЛЬНОЕ ОБЩЕОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ', 'МОУ'],
    ['ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ', 'ГБУЗ'], ['ГОСУДАРСТВЕННОЕ АВТОНОМНОЕ УЧРЕЖДЕНИЕ ЗДРАВООХРАНЕНИЯ', 'ГАУЗ'], ['ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ ОБЩЕОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ', 'ГБОУ'],
    ['ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ ПРОФЕССИОНАЛЬНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ', 'ГБПОУ'], ['ГОСУДАРСТВЕННОЕ АВТОНОМНОЕ ПРОФЕССИОНАЛЬНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ', 'ГАПОУ'],
    ['ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ', 'ГБУ'], ['ГОСУДАРСТВЕННОЕ АВТОНОМНОЕ УЧРЕЖДЕНИЕ', 'ГАУ'], ['ГОСУДАРСТВЕННОЕ КАЗЕННОЕ УЧРЕЖДЕНИЕ', 'ГКУ'],
    ['ФЕДЕРАЛЬНОЕ ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ ВЫСШЕГО ОБРАЗОВАНИЯ', 'ФГБОУ ВО'], ['ФЕДЕРАЛЬНОЕ ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ НАУЧНОЕ УЧРЕЖДЕНИЕ', 'ФГБНУ'],
    ['ФЕДЕРАЛЬНОЕ ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ', 'ФГБУ'], ['ФЕДЕРАЛЬНОЕ ГОСУДАРСТВЕННОЕ КАЗЕННОЕ УЧРЕЖДЕНИЕ', 'ФГКУ'], ['ФЕДЕРАЛЬНОЕ ГОСУДАРСТВЕННОЕ УНИТАРНОЕ ПРЕДПРИЯТИЕ', 'ФГУП'],
    ['МУНИЦИПАЛЬНОЕ БЮДЖЕТНОЕ УЧРЕЖДЕНИЕ', 'МБУ'], ['МУНИЦИПАЛЬНОЕ КАЗЕННОЕ УЧРЕЖДЕНИЕ', 'МКУ'], ['МУНИЦИПАЛЬНОЕ АВТОНОМНОЕ УЧРЕЖДЕНИЕ', 'МАУ'], ['ГОСУДАРСТВЕННОЕ УНИТАРНОЕ ПРЕДПРИЯТИЕ', 'ГУП'],
    ['МУНИЦИПАЛЬНОЕ УНИТАРНОЕ ПРЕДПРИЯТИЕ', 'МУП'], ['ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ', 'ООО'], ['АКЦИОНЕРНОЕ ОБЩЕСТВО', 'АО']];
  function shortOrg(s) {
    s = oneLine(s).replace(/["“”„]([^"“”„]+)["“”]/g, '«$1»').replace(/"/g, ''); var up = s.toUpperCase(), ab = '';
    ORG.some(function (o) { if (up.indexOf(o[0]) === 0) { ab = o[1]; s = s.slice(o[0].length).trim(); return true; } return false; });
    if (s === s.toUpperCase()) s = s.toLowerCase().replace(/(^|«|\s№?\s?)([а-яё])/, function (m, a, c) { return a + c.toUpperCase(); }).replace(/«([а-яё])/g, function (m, c) { return '«' + c.toUpperCase(); }).replace(/(\sг\.\s?|\sимени\s|\sим\.\s?)([а-яё])/g, function (m, a, c) { return a + c.toUpperCase(); })
      .replace(/^Города\s/, 'города ').replace(/(^|[\s«])(москв|московск|санкт-петербург)/g, function (m, a, c) { return a + c.charAt(0).toUpperCase() + c.slice(1); });
    return (ab ? ab + ' ' : '') + s;
  }
  var UNITS = { 'килограмм': 'кг', 'грамм': 'г', 'тонна': 'т', 'литр': 'л', 'миллилитр': 'мл', 'штука': 'шт', 'упаковка': 'уп', 'пачка': 'пачка', 'банка': 'банка', 'бутылка': 'бут', 'десяток': 'дес', 'набор': 'набор', 'коробка': 'кор', 'пара': 'пар' };
  function unitShort(u) { var l = oneLine(u).toLowerCase().split(/[;(]/)[0].trim(); return UNITS[l] || (l.length > 12 ? l.slice(0, 12) : l); }
  function msk(s) {
    var m = String(s || '').match(/(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2}))?(?:.*?МСК\s*([+-]\s*\d+))?/);
    if (!m) return '';
    var off = 3 + (m[6] ? Number(m[6].replace(/\s/g, '')) : 0), oh = (off < 0 ? '-' : '+') + ('0' + Math.abs(off)).slice(-2) + ':00';
    return m[3] + '-' + m[2] + '-' + m[1] + 'T' + ('0' + (m[4] || '23')).slice(-2) + ':' + (m[5] || '59') + ':00' + oh;
  }
  function moneyOf(s) { var m = String(s || '').match(/(\d[\d\s ]*(?:[.,]\d+)?)/); return m ? num(m[1]) : null; }
  /* Извещение ЕИС (печатная форма) → файл закупки */
  function fromNotice(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html'), P = {}, PA = {}, all = oneLine(doc.body ? doc.body.textContent : '');
    $$('tr', doc).forEach(function (tr) {
      var c = tr.cells; if (!c || c.length !== 2 || c[0].querySelector('table')) return;
      var k = oneLine(c[0].textContent); if (!k || k.length > 160) return;
      var v = elTxt(c[1]); (PA[k] = PA[k] || []).push(v);
      if (P[k] === undefined) P[k] = v;
    });
    var getAll = function (re) { var o = []; for (var k in PA) if (re.test(k)) o = o.concat(PA[k]); return o; };
    /* совместная закупка: несколько заказчиков со своей ценой */
    var joint = [], jm = all.split('Требования заказчиков')[1] || '';
    jm.replace(/(?:^|\s)(\d{1,2})\s+((?:МУНИЦИПАЛЬНОЕ|ГОСУДАРСТВЕННОЕ|ФЕДЕРАЛЬНОЕ|ОБЛАСТНОЕ|КРАЕВОЕ)[^]{5,250}?)\s+(?:Максимальное значение цены контракта|Начальная \(максимальная\) цена контракта)\s+([\d.]+)/g, function (m, n, nm, pr) { if (Number(n) === joint.length + 1) joint.push({ name: oneLine(nm), price: num(pr) }); return m; });
    var get = function (re) { for (var k in P) if (re.test(k) && P[k]) return P[k]; return ''; };
    var number = get(/^Номер извещения/) || (all.match(/закупки\s*№\s*(\d{11,25})/) || [])[1] || '';
    if (!number) throw new Error('Не похоже на извещение ЕИС');
    var title = oneLine(get(/^Наименование объекта закупки/)), tp = title.split(' : ');
    if (tp.length === 2) title = tp[1].length >= 8 ? tp[1] : tp[0];
    title = title.charAt(0).toUpperCase() + title.slice(1);
    var custFull = '', cq = doc.querySelector('table.customer-qty-table td');
    if (cq) custFull = oneLine(cq.textContent);
    if (!custFull) custFull = oneLine(get(/^Полное наименование заказчика|^Наименование заказчика/) || get(/^Организация, осуществляющая размещение/));
    var unitMode = /Невозможно определить количество[^.]{0,80}?\sДа\b/.test(all) || !!get(/^Максимальное значение цены контракта/);
    var nmck = moneyOf(get(/^Начальная \(максимальная\) цена контракта/) || get(/^Максимальное значение цены контракта/));
    var dlRaw = get(/^Дата и время окончания срока подачи заявок/);
    /* товары */
    var items = [], last = null;
    $$('table', doc).forEach(function (t) {
      if (t.closest('table') !== t) return;
      var rows = t.rows; if (!rows || !rows.length) return;
      var h = Array.prototype.map.call(rows[0].cells, function (c) { return oneLine(c.textContent); });
      if (h.length >= 4 && /^Наименование товара/.test(h[0]) && h.some(function (x) { return /^Цена за единицу/.test(x); })) {
        var iu = h.findIndex(function (x) { return /^Единица измерения/.test(x); }), ip = h.findIndex(function (x) { return /^Цена за единицу/.test(x); }),
          iq = h.findIndex(function (x) { return /Количество/.test(x); }), ic = h.findIndex(function (x) { return /^Стоимость позиции/.test(x); });
        for (var r = 1; r < rows.length; r++) {
          var c = rows[r].cells; if (c.length < h.length - 1) continue;
          var nm = oneLine(elTxt(c[0]).split(/\n?Идентификатор/)[0]), price = num(oneLine(c[ip] && c[ip].textContent)), q = null;
          if (!nm || price === null) continue;
          if (iq >= 0 && c[iq]) {
            var inner = c[iq].querySelectorAll('table.customer-qty-table tr');
            if (inner.length) { q = 0; Array.prototype.forEach.call(inner, function (tr) { var cc = tr.cells; var v = cc.length ? num(oneLine(cc[cc.length - 1].textContent)) : null; if (v) q += v; }); }
            else q = num(oneLine(c[iq].textContent));
          }
          if (!q && !unitMode && ic >= 0 && c[ic]) { var cost = num(oneLine(c[ic].textContent)); if (cost && price) q = Math.round(cost / price * 1000) / 1000; }
          last = { name: nm, quantity: q && q > 0 ? q : 1, unit: unitShort(c[iu] ? c[iu].textContent : ''), unit_price: price, purchase_price: null, note: '', spec: '', ch: [] };
          if (!(q && q > 0)) last.qe = true;
          items.push(last);
        }
        return;
      }
      if (last && /^Характеристики товара/.test(h[0] || '')) {
        var cur = null;
        for (var r2 = 1; r2 < rows.length; r2++) {
          var cc = Array.prototype.map.call(rows[r2].cells, function (x) { return oneLine(x.textContent); });
          if (/^Наименование характеристики/.test(cc[0] || '')) continue;
          if (cc.length >= 3) { cur = { k: cc[0], v: cc[1] }; last.ch.push(cur); }
          else if (cur && cc[0] && !/не может изменяться|участник закупки указывает/i.test(cc[0])) cur.v += ' ' + cc[0];
        }
      }
    });
    if (!items.length) throw new Error('В извещении не нашлось товаров');
    items.forEach(function (it) {
      it.spec = it.ch.map(function (x) { return x.k + ': ' + x.v; }).join('\n');
      it.note = it.ch.filter(function (x) { return !/^(да|нет|без вакуума)$/i.test(x.v) && !/^Нормативн/i.test(x.k) && (/сорт|вид|жирност|доля жира|фасов|масса|объем|объём|обьем|класс|калибр|категор|штук/i.test(x.k) || x.v.length < 25); }).slice(0, 4).map(function (x) {
        if (!/^[≥≤<>\d]/.test(x.v)) return x.v;
        var k = /масса нетто/i.test(x.k) ? 'фасовка' : /жир/i.test(x.k) ? 'жирность' : /об[ъь]?ем/i.test(x.k) ? 'объём' : /штук/i.test(x.k) ? 'штук в упаковке' : x.k.toLowerCase();
        return k + ' ' + x.v;
      }).join(', ').slice(0, 140);
      delete it.ch;
    });
    /* адреса */
    var pts = getAll(/^Место поставки товара/).join('\n').split('\n').map(function (a) { return a.replace(/^Российская Федерация,\s*/, '').replace(/^обл\.\s*([А-ЯЁ][а-яё]+ая)/, '$1 область').replace(/[\s,;.]+$/, '').trim(); })
      .filter(function (a, i, arr) { return a.length > 8 && arr.indexOf(a) === i; })
      .map(function (a) { return { name: '', address: a, note: '' }; });
    /* условия */
    var F = [], add = function (k, v) { v = oneLine(v); if (v) F.push({ k: k, v: v.length > 300 ? v.slice(0, 297) + '…' : v }); };
    add('Закон', '44-ФЗ');
    add('Способ', get(/^Способ определения поставщика/));
    add('Площадка', get(/^Наименование электронной площадки/));
    add('Подача заявок до', dlRaw);
    add('Торги', get(/^Дата проведения процедуры подачи предложений/));
    add('Итоги', get(/^Дата подведения итогов/));
    if (unitMode) add('Максимальная цена контракта', nmck ? rub(nmck) + ' — количество не определено, платят по цене за единицу по заявкам' : '');
    add('Обеспечение заявки', (moneyOf(get(/^Размер обеспечения заявки/)) ? rub(moneyOf(get(/^Размер обеспечения заявки/))) : get(/^Размер обеспечения заявки/)) + (/не требуется/i.test(get(/^Требуется обеспечение заявки/)) ? '' : ''));
    var sec = get(/^Размер обеспечения исполнения контракта/); add('Обеспечение контракта', moneyOf(sec) && !/%/.test(sec) ? rub(moneyOf(sec)) : /%/.test(sec) && nmck ? fnum(moneyOf(sec), 1) + '% — ' + rub(nmck * moneyOf(sec) / 100) : sec);
    var start = get(/^Дата начала исполнения контракта/), end = get(/^Срок исполнения контракта|^Дата окончания исполнения контракта/);
    var term = end ? (start ? start + ' по ' : 'по ') + end : '';
    add('Срок контракта', term);
    add('Преимущества', get(/^Преимущества$/));
    add('Ограничения', get(/^Ограничения$|^Условия, запреты и ограничения/));
    var req = get(/^Требования к участникам/);
    add('ИКЗ', get(/^Идентификационный код закупки/));
    var who = [oneLine(get(/^Ответственное должностное лицо/)), get(/^Номер контактного телефона/), get(/^Адрес электронной почты/)].filter(Boolean).join(', ');
    add('Контакт заказчика', who);
    if (joint.length > 1) {
      add('Совместная закупка', joint.length + ' ' + plural(joint.length, 'заказчик', 'заказчика', 'заказчиков') + ', у каждого свой контракт: ' + joint.map(function (j) { return shortOrg(j.name) + ' — ' + rub(j.price); }).join('; '));
      var sz = getAll(/^Размер обеспечения заявки/).map(moneyOf).filter(Boolean), sc = getAll(/^Размер обеспечения исполнения контракта/).map(moneyOf).filter(Boolean);
      if (sz.length > 1) F.forEach(function (f) { if (f.k === 'Обеспечение заявки') f.v = 'всего ' + rub(sz.reduce(function (a, b) { return a + b; }, 0)) + ' (' + sz.map(rub).join(' + ') + ')'; });
      if (sc.length > 1) F.forEach(function (f) { if (f.k === 'Обеспечение контракта') f.v = 'всего ' + rub(sc.reduce(function (a, b) { return a + b; }, 0)) + ' (' + sc.map(rub).join(' + ') + ')'; });
    } else if (custFull) add('Заказчик полностью', custFull);
    /* что видно сразу без ИИ */
    var flags = [];
    if (unitMode) flags.push({ level: 'yellow', title: 'Количество не указано — оплата по заявкам', why: 'Заказчик закупает по цене за единицу на сумму до ' + (nmck ? rub(nmck) : 'максимальной цены') + '. Объём заранее не известен — впишите примерное количество в строках (поле «примерно») или сделайте разбор ИИ: он поищет объёмы в документах.' });
    if (/опыт/i.test(req)) flags.push({ level: 'yellow', title: 'Нужен опыт исполнения договора', why: oneLine((req.match(/[^;\n]*опыт[^;\n]*/i) || [''])[0]).replace(/^\d+\)\s*/, '').slice(0, 400) + (/не менее 20 процентов/.test(req) && nmck ? ' — то есть договор от ' + rub(nmck * 0.2) + ' с актом приёмки.' : '') });
    if (/малого предпринимательства|СМП|социально ориентированн|ч\.\s*3\s*ст\.\s*30/i.test(get(/^Ограничения$|^Условия, запреты и ограничения/) + ' ' + get(/^Преимущества$/))) flags.push({ level: 'green', title: 'Только для малого бизнеса (СМП)', why: 'Крупные компании не участвуют; обеспечение контракта для СМП часто можно не вносить, если есть опыт.' });
    if (/запрет|национальн/i.test(get(/^Ограничения$|^Условия, запреты и ограничения/))) flags.push({ level: 'yellow', title: 'Национальный режим / ограничения по стране', why: oneLine(get(/^Ограничения$|^Условия, запреты и ограничения/)).slice(0, 400) });
    if (pts.length > 1) flags.push({ level: 'yellow', title: pts.length + ' ' + plural(pts.length, 'адрес', 'адреса', 'адресов') + ' доставки', why: 'Заложите логистику на каждую точку.' });
    return {
      schema: 'frudom-contract-v1', number: number, title: title || 'Закупка ' + number, customer: joint.length > 1 ? 'Совместная закупка: ' + joint.length + ' ' + plural(joint.length, 'заказчик', 'заказчика', 'заказчиков') : shortOrg(custFull), nmck: nmck, tax_percent: 8, logistics: 0,
      deadline: msk(dlRaw), url: 'https://zakupki.gov.ru/epz/order/notice/' + (/конкурс/i.test(get(/^Способ определения/)) ? 'ok20' : /котиров/i.test(get(/^Способ определения/)) ? 'ezk20' : 'ea20') + '/view/common-info.html?regNumber=' + number, items: items,
      info: { src: 'notice', term: term, facts: F, flags: flags, points: pts }, unitMode: unitMode
    };
  }
  /* Word (.docx/.odt) и Excel (.xlsx) → текст: таблицы строками через « | » */
  function xmlTxt(x) { return x.replace(/<w:tab\/>/g, '\t').replace(/<\/w:tc>|<\/table:table-cell>/g, ' | ').replace(/<\/w:p>|<\/text:p>|<\/w:tr>|<\/table:table-row>/g, '\n').replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim(); }
  function officeTxt(f) {
    return unzip(f.data).then(function (fs) {
      var get = function (re) { return fs.filter(function (x) { return re.test(x.path); }); };
      if (/\.(docx|docm|dotx)$/i.test(f.name)) return get(/^word\/document\.xml$/).map(function (x) { return xmlTxt(new TextDecoder().decode(x.data)); }).join('\n');
      if (/\.(odt|ods)$/i.test(f.name)) return get(/^content\.xml$/).map(function (x) { return xmlTxt(new TextDecoder().decode(x.data)); }).join('\n');
      var ss = [], sh = get(/^xl\/sharedStrings\.xml$/)[0];
      if (sh) new TextDecoder().decode(sh.data).replace(/<si>([\s\S]*?)<\/si>/g, function (m, a) { ss.push(a.replace(/<[^>]+>/g, '')); return m; });
      return get(/^xl\/worksheets\/sheet\d+\.xml$/).map(function (x) {
        return new TextDecoder().decode(x.data).split('</row>').map(function (row) {
          var cells = []; row.replace(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g, function (m, at, body) {
            var v = (String(body || '').match(/<v>([\s\S]*?)<\/v>/) || [])[1] || (String(body || '').match(/<t[^>]*>([\s\S]*?)<\/t>/) || [])[1] || '';
            if (/t="s"/.test(at)) v = ss[Number(v)] || ''; cells.push(v); return m;
          });
          return cells.join(' | ');
        }).filter(function (l) { return l.replace(/[|\s]/g, ''); }).join('\n');
      }).join('\n\n');
    });
  }
  /* старый .doc / .rtf — вытаскиваем, что получится */
  function legacyTxt(f) {
    if (/\.rtf$/i.test(f.name)) {
      var r = new TextDecoder('latin1').decode(f.data).replace(/\\'([0-9a-f]{2})/gi, function (m, h) { var c = parseInt(h, 16); return c >= 192 ? String.fromCharCode(0x410 + c - 192) : c === 168 ? 'Ё' : c === 184 ? 'ё' : String.fromCharCode(c); });
      return r.replace(/\\par[d]?/g, '\n').replace(/\\[a-z]+-?\d* ?|[{}]/gi, '').replace(/\n\s*\n+/g, '\n');
    }
    var t = new TextDecoder('utf-16le').decode(f.data), parts = t.match(/[Ѐ-ӿ\w\s.,;:№%()«»"\-–—\/]{6,}/g) || [];
    return parts.map(function (s) { return s.replace(/\s+/g, ' ').trim(); }).filter(function (s) { return /[Ѐ-ӿ]{3}/.test(s); }).join('\n');
  }
  function b64(u) { var s = '', ch = 0x8000; for (var i = 0; i < u.length; i += ch) s += String.fromCharCode.apply(null, u.subarray(i, i + ch)); return btoa(s); }
  /* количества из ТЗ (таблица «Наименование … Количество») — для закупок, где в извещении их нет */
  function qtyFromDocs(base, files) {
    var need = base.items.filter(function (x) { return x.qe; }); if (!need.length) return Promise.resolve(0);
    var docs = files.filter(function (f) { return /\.(docx|xlsx)$/i.test(f.name) && !/контракт|требован|инструкц|гарант/i.test(f.name); }), found = 0, chain = Promise.resolve();
    docs.forEach(function (f) {
      chain = chain.then(function () { return officeTxt(f); }).then(function (t) {
        var qi = -1, ni = -1;
        String(t || '').split('\n').forEach(function (l) {
          var c = l.split(' | ').map(function (x) { return x.trim(); });
          var a = c.findIndex(function (x) { return /^(наименование|наим\.)/i.test(x); }), b = c.findIndex(function (x) { return /количеств|объем|объём|кол-во/i.test(x); });
          if (a >= 0 && b >= 0) { ni = a; qi = b; return; }
          if (qi < 0 || !c[ni]) return;
          var q = num(c[qi]); if (!q || q <= 0) return;
          var nn = norm(c[ni]);
          need.forEach(function (it) { if (it.qe && (norm(it.name) === nn || nn.indexOf(norm(it.name)) === 0)) { it.quantity = q; delete it.qe; found++; } });
        });
      }, function () { /* пусто */ });
    });
    return chain.then(function () { return found; });
  }
  function findNotice(files) {
    var h = files.filter(function (f) { return /\.html?$/i.test(f.name); });
    h.sort(function (a, b) { return (/^Извещение/i.test(b.name) ? 1 : 0) - (/^Извещение/i.test(a.name) ? 1 : 0); });
    for (var i = 0; i < h.length; i++) { var t = decodeTxt(h[i].data); if (/Извещение о проведении|parameterValue/.test(t) && /Номер извещения|для закупки №/.test(t)) return t; }
    return '';
  }
  /* архив сохраняется в браузере — разбор ИИ можно сделать и позже */
  function zipKeep(number, blob) { if (!window.caches) return; caches.open('fdc-zip').then(function (c) { return c.put('/zip/' + encodeURIComponent(number), new Response(blob)); }).catch(function () { /* пусто */ }); }
  function zipGet(number) {
    if (S.zips && S.zips[number]) return Promise.resolve(S.zips[number]);
    if (!window.caches) return Promise.resolve(null);
    return caches.open('fdc-zip').then(function (c) { return c.match('/zip/' + encodeURIComponent(number)); }).then(function (r) { return r ? r.arrayBuffer().then(unzipDeep) : null; }).catch(function () { return null; });
  }
  function zipDrop(number) { if (S.zips) delete S.zips[number]; if (window.caches) caches.open('fdc-zip').then(function (c) { c.delete('/zip/' + encodeURIComponent(number)); }).catch(function () { /* пусто */ }); }
  /* Открыть архив: сначала сам (извещение), иначе — ИИ */
  /* many: несколько файлов разом — не переходить в расчёт, вернуть результат; skip — сюда пишутся архивы без извещения */
  function openZip(f, many, skip) {
    toast(many ? 'Открываю ' + f.name + '…' : 'Открываю архив…');
    return f.arrayBuffer().then(function (buf) { return unzipDeep(buf).then(function (files) { return { files: files, buf: buf }; }); }).then(function (z) {
      var files = z.files, html = findNotice(files), base = null;
      if (html) try { base = fromNotice(html); } catch (e) { base = null; }
      if (!base) {
        if (aiOn()) return aiRun(files, null, f.name, many);
        if (many && skip) { skip.push({ files: files, name: f.name }); return null; }
        noNoticeDlg(files, f.name); return null;
      }
      return qtyFromDocs(base, files).then(function (found) {
        var um = base.unitMode; delete base.unitMode;
        var r = importData(base);
        S.zips = S.zips || {}; S.zips[r.d.number] = files; zipKeep(r.d.number, new Blob([z.buf]));
        var qe = r.d.items.filter(function (x) { return x.qe; }).length;
        if (many) return r;
        toast((r.upd ? 'Расчёт обновлён' : 'Закупка открыта') + ' из извещения' + (found ? ' · количество взято из ТЗ' : '') + (qe ? ' · впишите примерное количество' : ''));
        go(r.d.number);
        return r;
      });
    }).catch(function (e) { if (skip) skip.err = (skip.err || []).concat(f.name + ': ' + e.message); toast(f.name + ': ' + e.message); });
  }
  function noNoticeDlg(files, name, more) {
    var s = sheet('<div class="hd"><div class="tx"><h2>Нужен разбор ИИ</h2><div class="mut sm" style="margin-top:4px">' + esc(name) + ' · ' + files.length + ' ' + plural(files.length, 'файл', 'файла', 'файлов') + '</div></div><button class="ib" data-x>' + IC.x + '</button></div>' +
      '<div class="bd"><p>В архиве нет извещения ЕИС — так бывает у закупок по 223-ФЗ: каждый заказчик пишет документы по-своему, и без ИИ сайт их не разберёт.</p>' +
      '<p class="mut" style="margin-top:10px">Подключите Claude — сайт сам отправит ему документы и через 1–2 минуты откроет расчёт. Или пришлите архив в чат Claude, как раньше, и загрузите готовый файл.</p></div>' +
      '<div class="ft"><button class="btn gh" data-x>Закрыть</button><button class="btn pri" data-ok>' + IC.ai + 'Подключить ИИ</button></div>');
    $('[data-ok]', s.el).onclick = function () {
      s.close();
      aiDlg(function () { var ch = aiRun(files, null, name, !!(more && more.length)); (more || []).forEach(function (m, i) { ch = Promise.resolve(ch).then(function () { return aiRun(m.files, null, m.name, i < more.length - 1); }); }); });
    };
  }

  /* ───────── разбор ИИ (Claude) ───────── */
  var AI_MODELS = [['claude-sonnet-5-5', 'Sonnet 5.5 — быстро и недорого', 2, 10], ['claude-opus-5-5', 'Opus 5.5 — подробнее, дороже', 4, 20], ['claude-haiku-5-5', 'Haiku 5.5 — дёшево, проще', 0.1, 0.5]];
  function aiCfg() { try { return JSON.parse(ls('fdc-ai-v1') || '{}') || {}; } catch (e) { return {}; } }
  function aiOn() { return !!aiCfg().key; }
  function aiSave(c, quiet) {
    c.at = c.at || nowIso(); ls('fdc-ai-v1', JSON.stringify(c));
    if (!quiet && connected() && S.sync !== 'off') api('cput', { id: '__ai__', data: JSON.stringify({ items: [], title: 'Настройки ИИ калькулятора (служебная строка, не удалять)', ai: c, updated: nowIso() }) }).catch(function () { /* пусто */ });
  }
  function aiMerge(c) { var my = aiCfg(); if (c && String(c.at || '') > String(my.at || '')) { aiSave(c, true); return true; } if (!c && my.key) aiSave(my); return false; }
  function aiDlg(then) {
    var c = aiCfg(), m = c.model || AI_MODELS[0][0];
    var s = sheet('<div class="hd"><div class="tx"><h2>ИИ для разбора архивов</h2><div class="mut sm" style="margin-top:4px">Claude читает документы закупки и пишет вывод, подводные камни, условия, количество.</div></div><button class="ib" data-x>' + IC.x + '</button></div>' +
      '<div class="bd"><label class="lab">Ключ Claude (API)</label><input class="inp" data-k autocomplete="off" spellcheck="false" placeholder="sk-ant-…" value="">' +
      (c.key ? '<div class="mut sm" style="margin-top:6px">Сейчас стоит ключ …' + esc(c.key.slice(-4)) + '. Оставьте поле пустым, чтобы не менять.</div>' : '') +
      '<div class="mut sm" style="margin-top:8px">Ключ берётся на console.anthropic.com → API Keys (тот же, что вы вставляли в «Документы ФД», или новый). Хранится на этом устройстве' + (connected() ? ' и в вашей таблице «Контракты ФД» — на других устройствах подставится сам' : '') + '.</div>' +
      '<label class="lab">Модель</label><div class="aim">' + AI_MODELS.map(function (x) { return '<button data-m="' + x[0] + '" class="' + (x[0] === m ? 'on' : '') + '"><b>' + esc(x[1].split(' — ')[0]) + '</b><span>' + esc(x[1].split(' — ')[1]) + '</span></button>'; }).join('') + '</div>' +
      '<div class="errt" data-e></div></div>' +
      '<div class="ft">' + (c.key ? '<button class="btn gh" data-off>Убрать ключ</button><span class="sp" style="flex:1"></span>' : '') + '<button class="btn gh" data-x>Отмена</button><button class="btn pri" data-ok>Сохранить</button></div>');
    $$('[data-m]', s.el).forEach(function (b) { b.onclick = function () { m = b.getAttribute('data-m'); $$('[data-m]', s.el).forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
    var off = $('[data-off]', s.el); if (off) off.onclick = function () { aiSave({ key: '', model: m, at: nowIso() }); s.close(); toast('Ключ убран'); soft(); };
    $('[data-ok]', s.el).onclick = function () {
      var k = $('[data-k]', s.el).value.trim(), e = $('[data-e]', s.el);
      if (!k && !c.key) { e.textContent = 'Вставьте ключ'; return; }
      if (k && !/^sk-ant-/.test(k)) { e.textContent = 'Ключ Claude начинается с «sk-ant-»'; return; }
      aiSave({ key: k || c.key, model: m, at: nowIso() }); s.close(); toast('ИИ подключён'); soft(); if (then) then();
    };
  }
  var AI_SYS = 'Ты помогаешь поставщику продуктов (овощи, фрукты, сухофрукты, орехи, бакалея) по госзакупкам в Москве и области. Он работает через ИП на АУСН без НДС (налог 8% с выручки) и является СМП. ' +
    'Прочитай все документы закупки и верни ОДИН объект JSON в формате frudom-contract-v1 — без пояснений до и после, без комментариев внутри.\n' +
    'Поля: schema="frudom-contract-v1"; number (номер закупки строкой); title (коротко: что и кому); customer (краткое название заказчика); nmck (число); tax_percent=8; logistics=0; ' +
    'deadline (окончание подачи заявок, ГГГГ-ММ-ДДTЧЧ:ММ:00+03:00); url (ссылка на закупку или ""); ' +
    'items — массив {name, quantity, unit (кг, л, шт, уп…), unit_price (цена за единицу из обоснования НМЦК), purchase_price:null, note (одна строка: сорт, фасовка), spec (полный текст требований ТЗ к позиции)}; ' +
    'info — {summary (3–5 предложений: что, кому, сколько, как часто возить, как платят), verdict {level: ok|care|bad, text}, term (до какого числа действует контракт, с датой ДД.ММ.ГГГГ), ' +
    'facts [{k,v}] — закон, способ, площадка, только СМП, подача заявок, торги, итоги, обеспечение заявки и контракта в рублях, опыт, срок контракта, поставка (частота, срок после заявки, часы приёмки), приёмка (дни, документ о приёмке в ЕИС/на Портале), оплата, штрафы, пени, остаточный срок годности, упаковка, документы с товаром, машина и водитель, национальный режим, антидемпинг; ' +
    'flags [{level: red|yellow|green, title (до 60 знаков), why (почему важно и что делать)}] — все подводные камни: сроки поставки и приёмки, документ о приёмке в ЕИС, штрафы и пени в рублях, обеспечение, сроки оплаты, требования к товару, водителю и машине, противоречия между документами, много мелких поставок, позиции с ценой ниже рынка, сезонные товары, право менять объём, односторонний отказ; ' +
    'points [{name, address (полный, с городом), note (часы приёмки, контакты), lat:null, lng:null}] — все адреса доставки; sections [{title, items:[…]}] — «Как проходит поставка», «Что приложить к заявке», «Контакты заказчика», «Что сделать до подачи»}.\n' +
    'Только то, что есть в документах, ничего не выдумывай. Противоречия — во flags. Пиши по-русски, просто. Числа в JSON — числами; в тексте суммы с пробелами и «₽».';
  function aiParts(files, base) {
    var parts = [], total = 0, pdfs = 0, skip = [], chain = Promise.resolve();
    var push = function (name, t) {
      t = String(t || '').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim(); if (t.length < 20) return;
      if (t.length > 120000) t = t.slice(0, 120000) + '\n…(обрезано)';
      if (total + t.length > 450000) { skip.push(name); return; }
      total += t.length; parts.push({ type: 'text', text: '=== Файл: ' + name + ' ===\n' + t });
    };
    files.forEach(function (f) {
      chain = chain.then(function () {
        var n = f.name;
        if (/\.(sign|sig|p7s|xsd)$/i.test(n) || /^Лист подписания/i.test(n)) return;
        if (/\.html?$/i.test(n)) { var d = new DOMParser().parseFromString(decodeTxt(f.data), 'text/html'); return push(n, elTxt(d.body)); }
        if (/\.(txt|csv|xml|json)$/i.test(n)) return push(n, decodeTxt(f.data));
        if (/\.(docx|docm|dotx|xlsx|xlsm|odt|ods)$/i.test(n)) return officeTxt(f).then(function (t) { push(n, t); }, function () { skip.push(n); });
        if (/\.(doc|rtf)$/i.test(n)) return push(n, legacyTxt(f));
        if (/\.pdf$/i.test(n)) { if (pdfs >= 8 || f.data.length > 9e6) { skip.push(n); return; } pdfs++; parts.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: b64(f.data) }, title: n.slice(0, 200) }); return; }
        if (/\.(jpe?g|png|webp)$/i.test(n) && f.data.length < 4.5e6) { parts.push({ type: 'image', source: { type: 'base64', media_type: /png$/i.test(n) ? 'image/png' : /webp$/i.test(n) ? 'image/webp' : 'image/jpeg', data: b64(f.data) } }); return; }
        skip.push(n);
      });
    });
    return chain.then(function () {
      var task = 'Сделай JSON по документам выше.';
      if (base) task += '\nИзвещение уже прочитано сайтом. Верни items СТРОГО в том же порядке и с теми же name, unit, unit_price, что в списке ниже; spec оставь "" (у сайта он есть); quantity — общее количество за весь контракт, если оно есть в документах (ТЗ, обоснование НМЦК, проект контракта), иначе null; note — коротко.\n' +
        JSON.stringify(base.items.map(function (x) { return { name: x.name, unit: x.unit, unit_price: x.unit_price, quantity: x.qe ? null : x.quantity }; }));
      else task += '\nЕсли количество где-то не указано — quantity null.';
      parts.push({ type: 'text', text: task });
      return { parts: parts, skip: skip, chars: total, pdfs: pdfs };
    });
  }
  function aiCall(cfg, parts, onText, signal) {
    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal: signal,
      headers: { 'x-api-key': cfg.key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: cfg.model || AI_MODELS[0][0], max_tokens: 32000, stream: true, system: AI_SYS, messages: [{ role: 'user', content: parts }] })
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { var m = ''; try { m = JSON.parse(t).error.message; } catch (e) { m = t.slice(0, 200); } throw aiErr(r.status, m); });
      var rd = r.body.getReader(), dec = new TextDecoder(), buf = '', out = '', use = { in: 0, out: 0 }, stop = '';
      var pump = function () {
        return rd.read().then(function (x) {
          if (x.done) return { text: out, use: use, stop: stop };
          buf += dec.decode(x.value, { stream: true });
          var ev; while ((ev = buf.indexOf('\n\n')) >= 0) {
            var blk = buf.slice(0, ev); buf = buf.slice(ev + 2);
            blk.split('\n').forEach(function (l) {
              if (l.indexOf('data:') !== 0) return; var j; try { j = JSON.parse(l.slice(5)); } catch (e) { return; }
              if (j.type === 'message_start' && j.message && j.message.usage) use.in = (j.message.usage.input_tokens || 0) + (j.message.usage.cache_read_input_tokens || 0) + (j.message.usage.cache_creation_input_tokens || 0);
              else if (j.type === 'content_block_delta' && j.delta && j.delta.type === 'text_delta') { out += j.delta.text; onText(out.length); }
              else if (j.type === 'message_delta') { if (j.usage) use.out = j.usage.output_tokens || use.out; if (j.delta && j.delta.stop_reason) stop = j.delta.stop_reason; }
              else if (j.type === 'error') throw aiErr(0, j.error && j.error.message || 'ошибка');
            });
          }
          return pump();
        });
      };
      return pump();
    });
  }
  function aiErr(code, m) {
    m = String(m || '');
    var t = code === 401 || /x-api-key|authentication/i.test(m) ? 'Ключ Claude не подошёл — проверьте его в «Настройках ИИ»' :
      /credit balance|billing/i.test(m) ? 'На счёте Anthropic закончились деньги — пополните на console.anthropic.com' :
      code === 429 ? 'Слишком много запросов — подождите минуту и повторите' :
      code === 529 || /overloaded/i.test(m) ? 'Claude сейчас перегружен — повторите через пару минут' :
      code === 404 || /model/i.test(m) ? 'Модель недоступна для этого ключа — выберите другую в «Настройках ИИ»' :
      /too long|too large|exceed/i.test(m) ? 'Документов слишком много для одного запроса' : 'Claude ответил ошибкой: ' + m;
    return new Error(t);
  }
  function aiCost(cfg, use) { var p = AI_MODELS.filter(function (x) { return x[0] === cfg.model; })[0] || AI_MODELS[0]; return (use.in * p[2] + use.out * p[3]) / 1e6; }
  /* соединить ответ ИИ с тем, что сайт прочитал сам */
  function aiMergeRes(j, base) {
    if (!j || !Array.isArray(j.items)) throw new Error('Claude вернул не тот формат');
    if (base) {
      var ai = j.items;
      var it = base.items.map(function (b, i) {
        var a = ai[i] && norm(ai[i].name) === norm(b.name) ? ai[i] : ai.filter(function (x) { return x && norm(x.name) === norm(b.name); })[0] || {};
        var o = JSON.parse(JSON.stringify(b)), q = num(a.quantity);
        if (o.qe && q && q > 0) { o.quantity = q; delete o.qe; }
        if (!o.note && a.note) o.note = String(a.note);
        if (!o.spec && a.spec) o.spec = String(a.spec);
        return o;
      });
      var info = j.info || {}, bi = base.info || {};
      if (!info.points || !info.points.length) info.points = bi.points;
      if (!info.term) info.term = bi.term;
      var have = {}; (info.facts || []).forEach(function (f) { have[norm(f.k)] = 1; });
      info.facts = (info.facts || []).concat((bi.facts || []).filter(function (f) { return !have[norm(f.k)] && /ИКЗ|Контакт|полностью/.test(f.k); }));
      info.src = 'ai';
      return { schema: 'frudom-contract-v1', number: base.number, title: j.title || base.title, customer: j.customer || base.customer, nmck: base.nmck, tax_percent: 8, logistics: 0, deadline: base.deadline || j.deadline, url: base.url, items: it, info: info };
    }
    j.items = j.items.filter(function (x) { return x && x.name && num(x.unit_price) !== null; }).map(function (x) { var q = num(x.quantity); if (!q || q <= 0) { x.quantity = 1; x.qe = true; } return x; });
    j.info = j.info || {}; j.info.src = 'ai';
    return j;
  }
  /* полный разбор: файлы архива → Claude → расчёт */
  function aiRun(files, number, name, quiet) {
    var cfg = aiCfg(); if (!cfg.key) { aiDlg(function () { aiRun(files, number, name); }); return Promise.resolve(); }
    var d0 = number ? S.db[number] : null, base = null;
    if (d0) base = JSON.parse(JSON.stringify(d0));
    var ctl = window.AbortController ? new AbortController() : null, t0 = Date.now(), timer;
    var s = sheet('<div class="hd"><div class="tx"><h2>Разбор ИИ</h2><div class="mut sm" style="margin-top:4px">' + esc(d0 ? d0.title || d0.number : name || 'Архив закупки') + '</div></div></div>' +
      '<div class="bd"><div class="aip"><div class="aiorb"><i></i><i></i><i></i></div><div class="ais">' +
      '<div data-s="1" class="on"><span></span>Открываю архив · ' + files.length + ' ' + plural(files.length, 'файл', 'файла', 'файлов') + '</div>' +
      '<div data-s="2"><span></span>Готовлю документы для Claude</div><div data-s="3"><span></span>Claude читает и пишет разбор <em data-t></em></div><div data-s="4"><span></span>Открываю расчёт</div></div></div>' +
      '<div class="mut sm" data-h style="margin-top:14px">Обычно 1–3 минуты. Окно можно не закрывать — просто подождите.</div><div class="errt" data-e></div></div>' +
      '<div class="ft"><button class="btn gh" data-cancel>Отмена</button></div>');
    var step = function (n) { $$('[data-s]', s.el).forEach(function (x) { var k = Number(x.getAttribute('data-s')); x.className = k < n ? 'ok' : k === n ? 'on' : ''; }); };
    var cancelled = false;
    $('[data-cancel]', s.el).onclick = function () { cancelled = true; if (ctl) ctl.abort(); clearInterval(timer); s.close(); toast('Разбор отменён'); };
    var tEl = $('[data-t]', s.el), got = 0;
    timer = setInterval(function () { var sec = Math.round((Date.now() - t0) / 1000); tEl.textContent = '· ' + Math.floor(sec / 60) + ':' + ('0' + sec % 60).slice(-2) + (got ? ' · написано ' + fnum(got, 0) + ' знаков' : ''); }, 500);
    var fail = function (e) {
      clearInterval(timer); if (cancelled) return;
      step(0); $('[data-e]', s.el).textContent = e.name === 'AbortError' ? 'Отменено' : /Failed to fetch|NetworkError|Load failed/i.test(e.message) ? 'Нет связи с Claude — проверьте интернет' : e.message;
      $('.ft', s.el).innerHTML = '<button class="btn gh" data-set>Настройки ИИ</button><span class="sp" style="flex:1"></span><button class="btn gh" data-x2>Закрыть</button><button class="btn pri" data-again>Повторить</button>';
      $('[data-x2]', s.el).onclick = s.close; $('[data-set]', s.el).onclick = function () { s.close(); aiDlg(); };
      $('[data-again]', s.el).onclick = function () { s.close(); aiRun(files, number, name); };
    };
    /* если сайт сам прочитал извещение — даём Claude готовый список товаров */
    var pre = Promise.resolve();
    if (!base) { var html = findNotice(files); if (html) try { base = fromNotice(html); delete base.unitMode; } catch (e) { base = null; } }
    return pre.then(function () { step(2); return aiParts(files, base); }).then(function (P) {
      if (cancelled) return;
      step(3);
      return aiCall(cfg, P.parts, function (n) { got = n; }, ctl && ctl.signal).then(function (res) {
        if (cancelled) return;
        clearInterval(timer); step(4);
        if (res.stop === 'max_tokens') throw new Error('Ответ получился слишком длинным — выберите модель Opus в «Настройках ИИ» и повторите');
        var j = aiMergeRes(parseText(res.text), base);
        var r = importData(j), cost = aiCost(cfg, res.use);
        S.zips = S.zips || {}; S.zips[r.d.number] = files;
        r.d.info.ai = { model: cfg.model || AI_MODELS[0][0], at: nowIso(), cost: Math.round(cost * 1000) / 1000, skip: P.skip.slice(0, 20) };
        touch(r.d);
        s.close(); toast('Разбор готов · ' + (r.d.title || r.d.number).slice(0, 40) + ' · ≈ $' + fnum(cost, 2));
        if (quiet) return r;
        go(r.d.number);
        if (S.cur === r.d.number) setTimeout(function () { infoDlg(r.d); }, 450);
        return r;
      });
    }).catch(fail);
  }
  function aiStart(d) {
    zipGet(d.number).then(function (files) {
      if (files) return aiRun(files, d.number);
      var fi = document.createElement('input'); fi.type = 'file'; fi.accept = '.zip,application/zip';
      toast('Выберите ZIP-архив этой закупки');
      fi.onchange = function () { var f = fi.files[0]; if (!f) return; f.arrayBuffer().then(function (buf) { return unzipDeep(buf).then(function (fs) { zipKeep(d.number, new Blob([buf])); aiRun(fs, d.number, f.name); }); }).catch(function (e) { toast(e.message); }); };
      fi.click();
    });
  }

  /* ───────── закупочные цены: подбор ───────── */
  var STOP = /^(для|без|или|при|вид|сорт|высш|перв|втор|свеж|питье|продо|столо|упако|сельс|шлифо|ферме|скорл|хлебо|натур|гост|тех|кат|катег|весов|фасов|пачк|короб|мешо|штук|литр|килог|грамм|тип|марк|разм|нов|ассор|произ|пищев|молод)/;
  function stems(s) {
    var o = [], seen = {};
    norm(s).split(/[^а-яa-z]+/).forEach(function (w) {
      if (w.length < 3 || STOP.test(w)) return;
      var st = w.slice(0, 5); if (!seen[st]) { seen[st] = 1; o.push(st); }
    });
    return o;
  }
  function eqs(a, b) { return a.length >= 4 && b.length >= 4 ? a.slice(0, 4) === b.slice(0, 4) : a === b; }
  function score(A, c) {
    if (!A.length || !c.st.length) return 0;
    var ha = 0, hb = 0;
    A.forEach(function (s) { if (c.st.some(function (t) { return eqs(s, t); })) ha++; });
    if (!ha) return 0;
    c.st.forEach(function (t) { if (A.some(function (s) { return eqs(s, t); })) hb++; });
    return { a: ha / A.length, b: hb / c.st.length, s: ha / A.length * 0.75 + hb / c.st.length * 0.25 + (c.kind === 'book' ? 0.05 : c.kind === 'own' ? 0.03 : 0) };
  }
  var FROM = { 'склад': 'Склад', 'закупка': 'Закупка', 'вручную': 'Мой прайс' };
  function buildIdx() {
    var idx = [], P = S.prices || {};
    (P.items || []).forEach(function (x) {
      var price = num(x.price); if (price === null || price <= 0) return;
      idx.push({ kind: 'own', key: 'o|' + norm(x.name), name: String(x.name), price: price, unit: String(x.unit || ''), date: String(x.date || ''), who: FROM[x.from] || 'Мои цены', st: stems(x.name) });
    });
    (P.vend || []).forEach(function (x) {
      var price = num(x.price); if (price === null || price <= 0) return;
      var st = stems(x.name); stems(x.product || '').forEach(function (s) { if (st.indexOf(s) < 0) st.push(s); });
      idx.push({ kind: 'vend', key: 'v|' + norm(x.vendor) + '|' + norm(x.name), name: String(x.name), product: String(x.product || ''), price: price, unit: String(x.unit || ''), date: String(x.date || ''), who: String(x.vendor || 'Поставщик'), st: st });
    });
    Object.keys(S.book).forEach(function (k) {
      var b = S.book[k]; if (!b || b.price === null || b.price === undefined) return;
      idx.push({ kind: 'book', key: 'b|' + k, bk: k, name: b.name, price: b.price, unit: b.unit || '', date: b.date || '', who: 'Моя цена', st: stems(b.name) });
    });
    S.idx = idx; S.byKey = {}; idx.forEach(function (c) { S.byKey[c.key] = c; });
  }
  function better(x, y) {
    if (Math.abs(x.sc.s - y.sc.s) > 0.001) return x.sc.s > y.sc.s;
    if (x.c.kind !== y.c.kind) { var R = { book: 0, own: 1, vend: 2 }; return R[x.c.kind] < R[y.c.kind]; }
    if (x.c.date !== y.c.date) return x.c.date > y.c.date;
    return x.c.price < y.c.price;
  }
  function suggest(item, q, kind, limit) {
    var A = stems(q || item.name), nq = norm(q || ''), out = [];
    S.idx.forEach(function (c) {
      if (kind && c.kind !== kind) return;
      var sc = score(A, c);
      if (!sc && nq && norm(c.name + ' ' + (c.product || '')).indexOf(nq) >= 0) sc = { a: 1, b: 0.5, s: 0.6 };
      if (sc && (q ? sc.a >= 0.99 || sc.s >= 0.6 : sc.s >= 0.3)) out.push({ c: c, sc: sc });
    });
    out.sort(function (x, y) { return better(x, y) ? -1 : better(y, x) ? 1 : 0; });
    return out.slice(0, limit || 60);
  }
  function mapKey(it, exact) { return norm(it.name) + '|' + unitN(it.unit) + (exact ? '|' + Math.round(Math.log(Math.max(it.unit_price, 0.01)) * 4) : ''); }
  function srcOf(c, auto, it) { var o = { kind: c.kind, key: c.key, name: c.name, who: c.who, date: c.date, unit: c.unit, auto: !!auto }; if (it) { var cv = cConv(c, it); if (cv.how) o.conv = cv.how; } return o; }
  /* Подставляет цены, где их нет: сначала то, что я выбирал раньше, потом уверенное совпадение по названию.
   * Цены, взятые с сайта, обновляет до свежих. Возвращает число изменённых позиций. */
  function fill(d) {
    if (!S.idx.length) return 0;
    var n = 0, names = {};
    d.items.forEach(function (it) { var k = norm(it.name); names[k] = (names[k] || 0) + 1; });
    d.items.forEach(function (it) {
      var s0 = it.src;
      if (s0 && (s0.kind === 'hand' || s0.kind === 'file')) return;
      if (it.noAuto && it.purchase_price === null) return;
      /* 1) мои цены калькулятора — главный источник */
      var bk = bookFind(it);
      if (bk && !(s0 && (s0.kind === 'own' || s0.kind === 'vend') && !s0.auto && S.byKey[s0.key])) {
        if (it.purchase_price !== bk.price || !s0 || s0.kind !== 'book' || s0.key !== 'b|' + bk.k) {
          it.purchase_price = bk.price; it.src = { kind: 'book', key: 'b|' + bk.k, name: bk.name, who: 'Моя цена', date: bk.date, unit: bk.unit }; n++;
        }
        return;
      }
      if (s0 && s0.kind === 'book') { it.purchase_price = null; delete it.src; s0 = null; n++; }
      /* 2) «Документы ФД»: склад, закупки, «Мой прайс», прайсы поставщиков */
      if (s0 && (s0.kind === 'own' || s0.kind === 'vend') && S.byKey[s0.key]) {
        var c = S.byKey[s0.key], cv = cConv(c, it);
        if (cv.p !== it.purchase_price || (cv.how || '') !== (it.src.conv || '')) { it.purchase_price = cv.p; it.src.date = c.date; if (cv.how) it.src.conv = cv.how; else delete it.src.conv; n++; }
        return;
      }
      if (it.purchase_price !== null) return;
      var m = S.map[mapKey(it, true)] || (names[norm(it.name)] === 1 ? S.map[mapKey(it, false)] : null);
      if (m && S.byKey[m] && S.byKey[m].kind !== 'book') { var cm = S.byKey[m]; it.purchase_price = cConv(cm, it).p; it.src = srcOf(cm, false, it); n++; return; }
      var best = suggest(it, '', '', 8).filter(function (x) { return x.c.kind !== 'book'; })[0];
      if (best && best.sc.a >= 0.99 && best.sc.b >= 0.5 && !cConv(best.c, it).bad) { it.purchase_price = cConv(best.c, it).p; it.src = srcOf(best.c, true, it); n++; }
    });
    return n;
  }
  /* ───────── мои цены калькулятора (запоминаются из ручного ввода) ───────── */
  function bookKey(it) { return norm(it.name) + '|' + unitN(it.unit); }
  function bookFind(it) {
    var k = bookKey(it), b = S.book[k];
    if (b && b.price !== null && b.price !== undefined) return { k: k, name: b.name, price: b.price, unit: b.unit, date: b.date };
    var A = stems(it.name), u = unitN(it.unit), hit = null;
    if (!A.length) return null;
    Object.keys(S.book).forEach(function (kk) {
      var e = S.book[kk]; if (!e || e.price === null || e.price === undefined || unitN(e.unit) !== u) return;
      var sc = score(A, { st: stems(e.name), kind: 'book' });
      if (sc && sc.a >= 0.99 && sc.b >= 0.99 && (!hit || e.at > hit.at)) hit = { k: kk, name: e.name, price: e.price, unit: e.unit, date: e.date, at: e.at };
    });
    return hit;
  }
  function bookSet(it, price) {
    var k = bookKey(it), now = nowIso();
    S.book[k] = { name: it.name, unit: it.unit || '', price: price, date: now.slice(0, 10), at: now };
    bookSave(); buildIdx();
  }
  function bookDel(k) { if (!S.book[k]) return; S.book[k] = { name: S.book[k].name, unit: S.book[k].unit, price: null, at: nowIso() }; bookSave(); buildIdx(); }
  function bookCount() { return Object.keys(S.book).filter(function (k) { return S.book[k] && S.book[k].price !== null && S.book[k].price !== undefined; }).length; }
  function bookSave() {
    try { localStorage.setItem(LS.book, JSON.stringify(S.book)); } catch (e) { /* пусто */ }
    if (!connected() || S.sync === 'off') return;
    clearTimeout(S.timers.book);
    S.timers.book = setTimeout(function () {
      api('cput', { id: '__book__', data: JSON.stringify({ items: [], title: 'Мои цены калькулятора (служебная строка, не удалять)', book: S.book, updated: nowIso() }) }).catch(function () { /* пусто */ });
    }, 1500);
  }
  function bookMerge(other) {
    var ch = 0;
    Object.keys(other || {}).forEach(function (k) { var o = other[k], m = S.book[k]; if (o && (!m || String(o.at || '') > String(m.at || ''))) { S.book[k] = o; ch++; } });
    var mine = Object.keys(S.book).some(function (k) { var o = (other || {})[k]; return !o || String(S.book[k].at || '') > String(o.at || ''); });
    if (ch) { try { localStorage.setItem(LS.book, JSON.stringify(S.book)); } catch (e) { /* пусто */ } buildIdx(); }
    if (mine) bookSave();
    return ch;
  }
  /* после ручного ввода цены: запомнить и подставить в такие же позиции других расчётов */
  function bookFromInput(d, it) {
    clearTimeout(S.timers.bk);
    S.timers.bk = setTimeout(function () {
      if (!it.src || it.src.kind !== 'hand' || it.purchase_price === null) return;
      var had = S.book[bookKey(it)];
      bookSet(it, it.purchase_price);
      it.src = { kind: 'book', key: 'b|' + bookKey(it), name: it.name, who: 'Моя цена', date: nowIso().slice(0, 10), unit: it.unit };
      var others = 0;
      Object.keys(S.db).forEach(function (id) { if (id === d.number) return; var dd = S.db[id], n = fill(dd); if (n) { others += n; dd.updated = nowIso(); push(id); } });
      saveLocal(); touch(d);
      var i = d.items.indexOf(it); if (S.cur === d.number && i >= 0) { var row = $('.lr[data-i="' + i + '"]'); if (row && document.activeElement !== $('[data-pp]', row)) { $('[data-src]', row).innerHTML = srcHtml(it); bindPick(row); } }
      if (!had || had.price !== it.purchase_price) toast('Цена запомнена' + (others ? ' · обновлено в других расчётах: ' + others : ''));
    }, 1200);
  }
  function applyPrices() {
    var tot = 0;
    Object.keys(S.db).forEach(function (id) { var d = S.db[id], n = fill(d); if (n) { tot += n; d.updated = nowIso(); push(id); } });
    if (tot) saveLocal();
    return tot;
  }
  function loadPrices(loud) {
    if (!connected()) { S.pst = S.api ? 'pass' : 'off'; paintPst(); return Promise.resolve(); }
    S.pst = 'load'; paintPst();
    return api('prices').then(function (j) {
      S.prices = { items: j.items || [], vend: j.vend || [], at: Date.now() }; S.perr = j.vendErr || '';
      try { localStorage.setItem(LS.prices, JSON.stringify(S.prices)); } catch (e) { /* пусто */ }
      buildIdx(); S.pst = 'ok'; paintPst();
      var n = applyPrices();
      soft();
      if (loud || n) toast(n ? 'Подставлено и обновлено цен: ' + n : 'Цены обновлены');
    }).catch(function (e) { if (e.message !== 'pass') { S.pst = 'err'; S.perr = /Неизвестная команда/.test(e.message) ? OLD_SCRIPT : e.message; paintPst(); if (loud) toast(/Неизвестная/.test(e.message) ? 'Скрипт таблицы старый — обновите Code.gs' : 'Не удалось получить цены'); } });
  }

  /* Перерисовать после новых данных, не сбивая ввод: если курсор в поле — обновляются только итоги. */
  function soft() {
    if (S.page === 'hist') return histView(true);
    if (!S.cur) return home(true);
    var a = document.activeElement, M = $('#fdc-main');
    if (a && M && M.contains(a) && /INPUT|TEXTAREA/.test(a.tagName)) { upd(); return; }
    var y = window.scrollY; view(S.cur, true); window.scrollTo(0, y);
  }

  /* ───────── история просмотров ─────────
   * Запись = открытие расчёта: {k — номер, t — название, c — заказчик, n — НМЦК, at — время, p — прибыль (если все цены есть), m — маржа, x — снижение, dv — устройство}.
   * Хранится в браузере и в служебной строке «__hist__» листа «Калькулятор», последние 400. */
  function device() { return standalone() ? 'приложение' : /android|iphone|ipad|mobile/i.test(navigator.userAgent) ? 'телефон' : 'компьютер'; }
  function histAdd(d) {
    var c = calc(d), now = nowIso(), last = S.hist[0];
    var e = { k: d.number, t: d.title || 'Закупка ' + d.number, c: d.customer || '', n: d.nmck, at: now, p: c.full ? Math.round(c.profit) : null, m: c.full ? Math.round(c.margin * 1000) / 10 : null, x: d.cut, dv: device(), kn: c.known, all: d.items.length };
    /* тот же расчёт в течение 10 минут — обновляем запись, а не плодим новые */
    if (last && last.k === e.k && Date.now() - Date.parse(last.at) < 10 * 60e3) S.hist[0] = e; else S.hist.unshift(e);
    S.hist = S.hist.slice(0, 400);
    histSave(); navSync();
  }
  function histSave() {
    try { localStorage.setItem(LS.hist, JSON.stringify(S.hist)); } catch (e) { /* пусто */ }
    if (!connected() || S.sync === 'off') return;
    clearTimeout(S.timers.hist);
    S.timers.hist = setTimeout(function () {
      var h = S.hist.slice(0, 400), s;
      while ((s = JSON.stringify({ items: [], title: 'История просмотров (служебная строка, не удалять)', hist: h, cleared: S.histClr || '', updated: nowIso() })).length > 48000 && h.length > 20) h = h.slice(0, Math.floor(h.length * .85));
      api('cput', { id: '__hist__', data: s }).catch(function () { /* пусто */ });
    }, 2000);
  }
  function histMerge(other, clr) {
    if (clr && String(clr) > String(S.histClr || '')) { S.histClr = clr; ls('fdc-hist-clr', clr); }
    var seen = {}, all = S.hist.concat(other || []).filter(function (e) { var key = e.k + '|' + e.at; if (!e || !e.k || seen[key]) return false; seen[key] = 1; return true; });
    all = all.filter(function (e) { return !S.histClr || String(e.at) > String(S.histClr); });
    all.sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); });
    var was = JSON.stringify(S.hist); S.hist = all.slice(0, 400);
    var ch = JSON.stringify(S.hist) !== was;
    if (ch) { try { localStorage.setItem(LS.hist, JSON.stringify(S.hist)); } catch (e) { /* пусто */ } navSync(); }
    if (S.hist.length !== (other || []).length) histSave();
    return ch;
  }
  function navSync() {
    $$('[data-nav]').forEach(function (a) { a.classList.toggle('on', (a.getAttribute('data-nav') === 'history') === (S.page === 'hist')); });
    var hn = $('[data-hn]'); if (hn) hn.textContent = S.hist.length || '';
  }
  function dayLbl(iso) {
    var d = new Date(iso), t = new Date(), y = new Date(Date.now() - 864e5);
    var same = function (a, b) { return a.toDateString() === b.toDateString(); };
    var M = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    var W = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
    return (same(d, t) ? 'Сегодня' : same(d, y) ? 'Вчера' : d.getDate() + ' ' + M[d.getMonth()] + (d.getFullYear() !== t.getFullYear() ? ' ' + d.getFullYear() : '')) + '|' + W[d.getDay()];
  }
  function histView(quiet) {
    var main = $('#fdc-main'); if (!main) return;
    S.cur = null;
    var q = norm(S.hq || ''), list = S.hist.filter(function (e) { return !q || norm(e.t + ' ' + e.c + ' ' + e.k).indexOf(q) >= 0; });
    var days = [], cur = null;
    list.forEach(function (e) { var dl = dayLbl(e.at); if (!cur || cur.l !== dl) { cur = { l: dl, e: [] }; days.push(cur); } cur.e.push(e); });
    var j = 0;
    main.innerHTML = '<div class="pg' + (quiet ? '' : '') + '"' + (quiet ? ' style="animation:none"' : '') + '><div class="w">' +
      '<div class="bar" style="margin-top:28px"><h2>История <span class="mut">' + S.hist.length + '</span></h2>' +
      (S.hist.length > 6 ? '<label class="find">' + IC.find + '<input class="inp" data-hq placeholder="Поиск по названию или заказчику" value="' + esc(S.hq || '') + '"></label>' : '') + '</div>' +
      (S.hist.length ? '' : '<div class="empty">Здесь будут закупки, которые вы открывали: когда, с какого устройства и какая была прибыль.</div>') +
      days.map(function (g) {
        var p = g.l.split('|');
        return '<div class="hday"><b>' + esc(p[0]) + '</b>' + esc(p[1]) + '</div><div class="hlist">' + g.e.map(function (e) {
          var ok = !!S.db[e.k], tm = new Date(e.at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
          var val = e.p !== null && e.p !== undefined ? '<span class="' + (e.p < 0 ? 'neg' : 'pos') + '">' + rub(e.p) + '</span><small>маржа ' + fnum(e.m, 1) + '% · −' + fnum(e.x, 1) + '%</small>'
            : '<span class="mut">' + rub(e.n) + '</span><small>цены ' + (e.kn || 0) + ' из ' + (e.all || 0) + '</small>';
          return '<' + (ok ? 'button' : 'div') + ' class="hr' + (ok ? '' : ' gone') + '"' + (ok ? ' data-hopen="' + esc(e.k) + '"' : '') + ' style="animation-delay:' + (quiet ? 0 : Math.min(j++ * 25, 350)) + 'ms"><span class="tm">' + tm + '</span>' +
            '<span class="tt">' + esc(e.t) + '</span><span class="ts">' + esc((e.c ? e.c + ' · ' : '') + e.dv + (ok ? '' : ' · расчёт удалён')) + '</span><span class="hv">' + val + '</span></' + (ok ? 'button' : 'div') + '>';
        }).join('') + '</div>';
      }).join('') +
      (S.hist.length ? '<div style="margin-top:28px;text-align:center"><button class="btn gh" data-hclr>Очистить историю</button></div>' : '') +
      '</div></div>';
    if (quiet) $$('.hr', main).forEach(function (r) { r.style.animation = 'none'; });
    $$('[data-hopen]', main).forEach(function (b) { b.onclick = function () { go(b.getAttribute('data-hopen')); }; });
    var hq = $('[data-hq]', main);
    if (hq) hq.oninput = function () { S.hq = hq.value; var pos = hq.selectionStart; histView(true); var n = $('[data-hq]'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { /* пусто */ } } };
    var clr = $('[data-hclr]', main);
    if (clr) clr.onclick = function () {
      if (!clr._arm) { clr._arm = 1; clr.textContent = 'Точно очистить? Нажмите ещё раз'; clr.classList.add('dang'); setTimeout(function () { if (document.body.contains(clr)) { clr._arm = 0; clr.textContent = 'Очистить историю'; clr.classList.remove('dang'); } }, 3500); return; }
      S.hist = []; S.histClr = nowIso(); ls('fdc-hist-clr', S.histClr); try { localStorage.setItem(LS.hist, '[]'); } catch (e) { /* пусто */ }
      histSave();
      navSync(); histView(); toast('История очищена');
    };
    fpWatch(null, '', '', null); stSet(null);
  }

  /* ───────── приложение на телефоне и «Поделиться» ───────── */
  var APP_URL = 'https://dskoby-maker.github.io/frudom-contracts/';
  function standalone() { return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true; }
  function appHint() {
    if (standalone()) return '';
    if (S.bip) return '<div class="row" style="margin-top:12px"><button class="btn gh" data-inst>' + IC.dl + 'Установить приложение — файлы можно будет «Поделиться» сюда</button></div>';
    if (/android/i.test(navigator.userAgent) && location.hostname !== 'dskoby-maker.github.io')
      return '<div class="row" style="margin-top:12px"><a class="btn gh" href="' + APP_URL + '" target="_blank" rel="noopener">' + IC.dl + 'Приложение для телефона — чтобы «Поделиться» файлом</a></div>';
    return '';
  }
  /* Файл, присланный через «Поделиться»: его положил sw.js в кэш «fdc-share» */
  function takeShare() {
    if (!window.caches) return;
    caches.open('fdc-share').then(function (c) {
      return c.match('pending').then(function (r) {
        if (!r) return;
        return r.json().then(function (j) {
          c.delete('pending');
          if (/[?&]share=1/.test(location.search)) try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) { /* пусто */ }
          var done = [], errs = [];
          var zf = (j.items || []).filter(function (it) { return it.b64; });
          if (zf.length) {
            readFiles((j.items || []).map(function (it) {
              if (!it.b64) return new File([it.text || ''], it.name || 'файл.json', { type: 'application/json' });
              var bin = atob(it.b64), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
              return new File([u], it.name || 'архив.zip', { type: 'application/zip' });
            }));
            return;
          }
          (j.items || []).forEach(function (it) { try { done.push(importData(parseText(it.text))); } catch (e) { errs.push(it.name + ': ' + e.message); } });
          if (done.length === 1) { toast(done[0].upd ? 'Расчёт обновлён' : 'Закупка добавлена'); go(done[0].d.number); }
          else if (done.length > 1) { toast('Добавлено закупок: ' + done.length); go(''); }
          else toast(errs[0] || 'В присланном нет данных закупки');
        });
      });
    }).catch(function () { /* пусто */ });
  }

  /* на сколько месяцев поставки: своё значение (d.months), иначе период поставок/заявок из срока контракта */
  function monthsOf(d) {
    if (num(d.months) > 0) return { n: num(d.months), how: 'вписано вручную', own: 1 };
    var t = String((d.info && d.info.term) || ''), ds = [];
    if (!t) { var tf = termOf(d); if (tf) t = tf.src; }
    var part = t.split(';').filter(function (x) { return /заявк|постав/i.test(x) && (x.match(/\d{2}\.\d{2}\.\d{4}/g) || []).length >= 2; })[0];
    String(part || t).replace(/(\d{2})\.(\d{2})\.(\d{4})/g, function (m, a, b, c) { var x = new Date(c + '-' + b + '-' + a + 'T12:00:00'); if (!isNaN(x)) ds.push(x); return m; });
    if (!ds.length) return null;
    ds.sort(function (a, b) { return a - b; });
    var A = ds[0], B = ds[ds.length - 1];
    if (ds.length === 1) { var dl = d.deadline ? new Date(d.deadline) : null; A = dl && !isNaN(dl) && dl > new Date() ? dl : new Date(); }
    var n = Math.max(1, Math.round((B - A) / 864e5 / 30.44));
    var f = function (x) { return ('0' + x.getDate()).slice(-2) + '.' + ('0' + (x.getMonth() + 1)).slice(-2) + '.' + x.getFullYear(); };
    return { n: n, how: (ds.length === 1 ? 'с ' : '') + f(A) + ' – ' + f(B) };
  }
  function monthsDlg(d) {
    var m = monthsOf(d);
    var s = sheet('<div class="hd"><div class="tx"><h2>Сколько месяцев поставок</h2><div class="mut sm" style="margin-top:4px">' + (m && !m.own ? 'По сроку контракта: ' + m.n + ' мес. (' + esc(m.how) + ')' : 'Впишите, за сколько месяцев распределится поставка') + '</div></div><button class="ib" data-x>' + IC.x + '</button></div>' +
      '<div class="bd"><input class="inp" data-mn inputmode="numeric" placeholder="например, 12" value="' + (m ? m.n : '') + '"></div>' +
      '<div class="ft">' + (num(d.months) > 0 ? '<button class="btn gh" data-auto>По сроку контракта</button><span class="sp" style="flex:1"></span>' : '') + '<button class="btn gh" data-x>Отмена</button><button class="btn pri" data-ok>Сохранить</button></div>');
    var inp = $('[data-mn]', s.el); setTimeout(function () { inp.focus(); inp.select(); }, 60);
    var ok = function () { var v = Math.round(num(inp.value) || 0); if (v < 1 || v > 120) { inp.focus(); return; } var a = monthsOf(Object.assign({}, d, { months: 0 })); d.months = a && a.n === v ? 0 : v; s.close(); touch(d); upd(); };
    $('[data-ok]', s.el).onclick = ok; inp.onkeydown = function (e) { if (e.key === 'Enter') ok(); };
    var au = $('[data-auto]', s.el); if (au) au.onclick = function () { d.months = 0; s.close(); touch(d); upd(); };
  }
  /* ───────── расчёт ───────── */
  function calc(d) {
    var k = 1 - (d.cut || 0) / 100, tax = (num(d.tax_percent) === null ? 8 : num(d.tax_percent)) / 100, log = d.logistics || 0;
    var o = { k: k, tax: tax, log: log, lines: [], sum: 0, rev: 0, cost: 0, known: 0, kRev: 0, miss: 0, minus: 0 };
    d.items.forEach(function (it) {
      var base = it.quantity * it.unit_price, rev = base * k, has = it.purchase_price !== null && it.purchase_price !== undefined;
      var cost = has ? it.quantity * it.purchase_price : null, pr = has ? rev * (1 - tax) - cost : null;
      o.sum += base; o.rev += rev;
      if (has) { o.cost += cost; o.known++; o.kRev += rev; if (pr < 0) o.minus++; } else o.miss++;
      o.lines.push({ base: base, rev: rev, cost: cost, pr: pr, m: has && rev > 0 ? pr / rev : null });
    });
    o.taxSum = o.rev * tax;
    o.full = o.miss === 0;
    o.profit = o.full ? o.rev - o.taxSum - o.cost - log : o.kRev * (1 - tax) - o.cost - log;
    o.margin = o.rev > 0 ? o.profit / (o.full ? o.rev : o.kRev || 1) : 0;
    /* максимальное снижение без убытка */
    o.be = o.full && o.sum > 0 ? 1 - (o.cost + log) / ((1 - tax) * o.sum) : null;
    return o;
  }

  /* ───────── каркас ───────── */
  function shell() {
    S.root.innerHTML = '<div class="top"><div class="w"><a class="brand" href="#" data-home aria-label="Контракты ФД"><span class="bs">ФРУДОМ</span><span class="bt2">Контракты</span></a><div class="sp"></div>' +
      '<button class="pst" data-pst><i class="dot"></i><span></span></button></div>' +
      '<div class="w navr"><a href="#" data-nav="">Расчёты</a><a href="#history" data-nav="history">История <b data-hn></b></a></div></div>' +
      '<div id="fdc-main"></div><div class="toast"></div><button class="fpill" data-fp></button><div class="stbar" data-stbar><i></i></div><div class="dragov">Отпустите — добавлю закупку</div>';
    $('[data-fp]').onclick = function () { var t = S.fpGo; if (t) t(); };
    $('[data-home]').onclick = function (e) { e.preventDefault(); go(''); };
    $$('[data-nav]').forEach(function (a) { a.onclick = function (e) { e.preventDefault(); var t = a.getAttribute('data-nav'); if (t) { if (location.hash !== '#history') location.hash = '#history'; else route(); } else go(''); }; });
    $('[data-pst]').onclick = pstDlg;
    paintPst();
    window.addEventListener('scroll', function () { var t = $('.top'); if (t) t.classList.toggle('sc', window.scrollY > 40); }, { passive: true });
    var dc = 0, ov = $('.dragov');
    var isFile = function (e) { return e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') >= 0; };
    document.addEventListener('dragenter', function (e) { if (!isFile(e)) return; e.preventDefault(); dc++; ov.classList.add('on'); });
    document.addEventListener('dragover', function (e) { if (isFile(e)) e.preventDefault(); });
    document.addEventListener('dragleave', function (e) { if (!isFile(e)) return; dc = Math.max(0, dc - 1); if (!dc) ov.classList.remove('on'); });
    document.addEventListener('drop', function (e) { if (!isFile(e)) return; e.preventDefault(); dc = 0; ov.classList.remove('on'); readFiles(e.dataTransfer.files); });
  }
  function paintPst() {
    var b = $('[data-pst]'); if (!b) return;
    var dot = $('.dot', b), t = $('span', b), own = S.prices ? (S.prices.items || []).length : 0, ven = S.prices ? (S.prices.vend || []).length : 0;
    dot.className = 'dot ' + ({ ok: 'ok', load: 'load', err: 'err', pass: 'err' }[S.pst] || '');
    var narrow = window.innerWidth < 600;
    var bc = bookCount();
    t.textContent = S.pst === 'load' ? 'Загружаю цены…' : S.pst === 'ok' ? (narrow ? 'Цены: ' + (own + ven + bc) : 'Цены: ' + (bc ? 'мои ' + bc + ' · ' : '') + 'документы ' + own + (ven ? ' · поставщики ' + ven : '')) :
      S.pst === 'err' ? 'Цены: нет связи' : S.pst === 'pass' ? 'Войти — подтянуть цены' : 'Подключить цены';
    ticker();
  }
  /* бегущая строка сверху: короткая сводка */
  function ticker() {
    var el = $('[data-tick]'); if (!el) return;
    var ids = Object.keys(S.db), own = S.prices ? (S.prices.items || []).length : 0, ven = S.prices ? (S.prices.vend || []).length : 0;
    var next = ids.map(function (k) { return deadline(S.db[k].deadline); }).filter(function (x) { return x && x.left > 0; }).sort(function (a, b) { return a.left - b.left; })[0];
    var items = ['Расчётов: ' + ids.length];
    if (next) items.push('Ближайшая подача: ' + next.full + ' · ' + next.txt);
    if (S.pst === 'ok') items.push('Мои цены: ' + own + (ven ? ' · у поставщиков: ' + ven : ''));
    items.push('Налог 8% с выручки', 'НДС не вычитается', 'Фруктовый Дом');
    var one = '<span>' + items.map(function (t) { return '<i></i>' + esc(t); }).join('') + '</span>';
    var html = one + one + one + one;
    if (el._h !== html) { el._h = html; el.innerHTML = html; }
  }
  /* надпись из точек (как табло) */
  var DM = { 'К': ['10001', '10010', '10100', '11000', '10100', '10010', '10001'], 'О': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    'Н': ['10001', '10001', '10001', '11111', '10001', '10001', '10001'], 'Т': ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    'Р': ['11110', '10001', '10001', '11110', '10000', '10000', '10000'], 'А': ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    'Ы': ['100001', '100001', '100001', '111001', '100101', '100101', '111001'] };
  function dmSvg(word) {
    var x = 0, c = [];
    word.split('').forEach(function (ch, n) {
      var g = DM[ch]; if (!g) { x += 3; return; }
      g.forEach(function (row, y) { row.split('').forEach(function (v, i) { if (v === '1') c.push('<circle cx="' + (x + i + .5) + '" cy="' + (y + .5) + '" r=".4" style="transition-delay:' + (n * 30) + 'ms"/>'); }); });
      x += g[0].length + 1;
    });
    return '<svg class="dm" viewBox="0 0 ' + (x - 1) + ' 7" aria-hidden="true">' + c.join('') + '</svg>';
  }
  function dotArt() {
    var c = [], W = 23, H = 7;
    for (var i = 0; i < W; i++) for (var j = 0; j < H; j++) {
      var d = Math.abs(i - (W - 1) / 2) / ((W - 1) / 2), wave = .5 + .5 * Math.cos(d * Math.PI * 1.5);
      var r = .2 + .3 * Math.pow(wave, 1.2) * (1 - Math.abs(j - 3) / 6);
      c.push('<circle cx="' + (i + .5) + '" cy="' + (j + .5) + '" r="' + r.toFixed(3) + '" style="animation-delay:' + ((i * 70 + j * 40) % 1400) + 'ms"/>');
    }
    return '<svg class="dmx" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' + c.join('') + '</svg>';
  }
  /* плавающая плашка снизу: появляется, когда главный блок ушёл за верх экрана */
  function fpWatch(target, html, cls, go) {
    var fp = $('[data-fp]'); if (!fp) return;
    if (S.fpObs) { S.fpObs.disconnect(); S.fpObs = null; }
    S.fpGo = go; fpSet(html, cls);
    if (!target || !window.IntersectionObserver) { fp.classList.remove('on'); return; }
    S.fpObs = new IntersectionObserver(function (es) { es.forEach(function (e) { fp.classList.toggle('on', !e.isIntersecting && e.boundingClientRect.top < 0); }); }, { threshold: 0 });
    S.fpObs.observe(target);
  }
  /* три кнопки статуса внизу экрана (закреплены) */
  var ST3 = [['go', 'Участвуем'], ['skip', 'Не участвуем'], ['think', 'Думаем']];
  function stSet(d) {
    var b = $('[data-stbar]'); if (!b) return;
    S.root.classList.toggle('hasst', !!d);
    if (!d) { b.classList.remove('on'); return; }
    b.innerHTML = '<i></i>' + ST3.map(function (x) { return '<button data-st="' + x[0] + '" class="' + x[0] + '">' + x[1] + '</button>'; }).join('');
    var mark = function (instant) {
      var on = $('[data-st="' + d.status + '"]', b), i = $('i', b);
      $$('button', b).forEach(function (x) { x.classList.toggle('on', x === on); });
      b.className = 'stbar on' + (on ? ' s-' + d.status : '');
      if (!on) { i.style.opacity = '0'; return; }
      if (instant) i.style.transition = 'none';
      i.style.opacity = '1'; i.style.width = on.offsetWidth + 'px'; i.style.transform = 'translateX(' + on.offsetLeft + 'px)';
      if (instant) { void i.offsetWidth; i.style.transition = ''; }
    };
    $$('button', b).forEach(function (x) {
      x.onclick = function () {
        var k = x.getAttribute('data-st'); d.status = d.status === k ? '' : k; mark();
        var sp = $('[data-stp]'); if (sp) { sp.className = 'pill st ' + d.status; sp.hidden = !d.status; sp.textContent = ST_K[d.status] || ''; }
        touch(d); toast(d.status ? 'Статус: ' + ST_K[d.status] : 'Статус снят');
      };
    });
    requestAnimationFrame(function () { b.classList.add('on'); mark(true); });
  }
  function fpSet(html, cls) { var fp = $('[data-fp]'); if (!fp) return; if (fp._h !== html) { fp._h = html; fp.innerHTML = html; } fp.className = 'fpill ' + (cls || '') + (fp.classList.contains('on') ? ' on' : ''); }

  /* ───────── главная ───────── */
  function list() {
    var q = norm(S.q);
    return Object.keys(S.db).map(function (k) { return S.db[k]; }).filter(function (d) {
      if (S.hst === 'new') { if (!d.fresh) return false; } else if (S.hst && (d.status || '') !== (S.hst === '-' ? '' : S.hst)) return false;
      return !q || norm(d.title + ' ' + d.customer + ' ' + d.number + ' ' + (d.note || '')).indexOf(q) >= 0;
    }).sort(function (a, b) {
      var x = deadline(a.deadline), y = deadline(b.deadline), xl = x ? x.left : 9e15, yl = y ? y.left : 9e15;
      if ((xl < 0) !== (yl < 0)) return xl < 0 ? 1 : -1;
      if (xl < 0) return yl - xl;
      return xl - yl || String(b.updated).localeCompare(String(a.updated));
    });
  }
  function cardHtml(d, i) {
    var c = calc(d), dl = deadline(d.deadline), share = d.items.length ? c.known / d.items.length : 0;
    return '<button class="card' + (dl && dl.cls === 'gone' ? ' gone' : '') + (d.fresh ? ' fresh' : '') + '" data-open="' + esc(d.number) + '" style="animation-delay:' + Math.min(i * 40, 400) + 'ms">' +
      '<div><div class="t">' + esc(d.title || 'Закупка ' + d.number) + '</div><div class="c">' + esc(d.customer || '№ ' + d.number) + '</div>' + (d.added ? '<div class="c dz">разбор ' + esc(dtRu(d.added)) + '</div>' : '') + '</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap">' + (d.fresh ? '<span class="pill nw" title="Добавил Claude, вы ещё не открывали"><i></i>Новый от Claude</span>' : '') + (dl ? '<span class="pill ' + dl.cls + '" title="' + esc(dl.full) + '">' + esc(dl.txt) + '</span>' : '') +
      '<span class="pill">−' + fnum(d.cut || 0, 1) + '%</span>' + (d.status ? '<span class="pill st ' + d.status + '">' + esc(ST_K[d.status]) + '</span>' : '') + (d.note ? '<span class="pill" title="' + esc(d.note) + '">заметка</span>' : '') + '</div>' +
      '<div class="nums"><div><small>НМЦК</small><b>' + rub(d.nmck) + '</b></div><div style="text-align:right"><small>' + (c.full ? 'Прибыль' : 'Цены: ' + c.known + ' из ' + d.items.length) + '</small>' +
      (c.full ? '<b class="' + (c.profit < 0 ? 'neg' : 'pos') + '">' + rub(c.profit) + '</b>' : '<b class="mut">—</b>') + '</div></div>' +
      '<div class="prog"><i style="width:' + Math.round(share * 100) + '%"></i></div></button>';
  }
  function home(quiet) {
    S.cur = null; var main = $('#fdc-main'); if (!main) return;
    var ids = list(), all = Object.keys(S.db).length;
    var html = '<div class="pg' + (quiet ? '' : S.dir < 0 ? ' back' : '') + '"' + (quiet ? ' style="animation:none"' : '') + '><div class="w">' +
      '<div class="drop" data-drop><div class="ic">' + IC.up + '</div><b>Загрузите архив или файл закупки</b><div class="mut">Архивы .zip из ЕИС или файлы .json от Claude / ChatGPT — можно несколько сразу</div>' +
      '<div class="row"><button class="btn pri" data-pick>' + IC.up.replace('width="24" height="24"', 'width="17" height="17"') + 'Выбрать файл</button><button class="btn sec" data-paste>' + IC.paste + 'Вставить текст</button></div>' +
      appHint() +
      '<div class="aihome">' + (aiOn() ? '<span class="dt on"></span>Разбор ИИ подключён · <button class="lnkb" data-aiset>настройки</button>' : '<span class="dt"></span>Разбор ИИ для архивов 223-ФЗ · <button class="lnkb" data-aiset>подключить Claude</button>') + '</div>' +
      '<input type="file" accept=".json,application/json,.txt,.zip,application/zip" multiple hidden data-file></div>' +
      (all ? '<div class="bar"><h2>Расчёты <span class="mut" style="font-weight:600">' + all + '</span></h2>' +
        (all > 4 ? '<label class="find">' + IC.find + '<input class="inp" data-q placeholder="Поиск по названию или заказчику" value="' + esc(S.q) + '"></label>' : '') + '</div>' +
        hstHtml() + '<div class="grid" data-grid>' + (ids.length ? ids.map(cardHtml).join('') : '<div class="empty">Ничего не нашлось</div>') + '</div>' :
        '<div class="empty">Здесь появятся ваши расчёты.<br>Сохраняются на этом устройстве' + (connected() ? ' и в таблице «Контракты ФД»' : '') + '.</div>') +
      '</div></div>';
    main.innerHTML = html;
    if (quiet) $$('.card', main).forEach(function (c) { c.style.animation = 'none'; });
    var fi = $('[data-file]'), dz = $('[data-drop]');
    $('[data-pick]').onclick = function () { fi.click(); };
    fi.onchange = function () { readFiles(fi.files); fi.value = ''; };
    $('[data-paste]').onclick = pasteDlg;
    $('[data-aiset]').onclick = function () { aiDlg(); };
    var ib = $('[data-inst]'); if (ib) ib.onclick = function () { if (!S.bip) return; S.bip.prompt(); S.bip.userChoice.then(function (r) { if (r && r.outcome === 'accepted') toast('Приложение «Контракты» установлено'); S.bip = null; home(true); }); };
    ['dragenter', 'dragover'].forEach(function (ev) { dz.addEventListener(ev, function () { dz.classList.add('on'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { dz.addEventListener(ev, function () { dz.classList.remove('on'); }); });
    var qi = $('[data-q]');
    if (qi) qi.oninput = function () {
      S.q = qi.value; var g = $('[data-grid]'), l = list();
      g.innerHTML = l.length ? l.map(cardHtml).join('') : '<div class="empty">Ничего не нашлось</div>'; bindCards();
    };
    bindCards();
    ticker();
    stSet(null);
    fpWatch(dz, IC.up.replace('width="24" height="24"', 'width="16" height="16"') + '<b>Загрузить файл закупки</b>', '', function () { fi.click(); });
  }
  function hstHtml() {
    var n = {}, all = 0, fr = 0; Object.keys(S.db).forEach(function (k) { var s = S.db[k].status || '-'; n[s] = (n[s] || 0) + 1; all++; if (S.db[k].fresh) fr++; });
    var keys = ST.map(function (x) { return x[0]; }).filter(function (k) { return n[k]; });
    if (!keys.length && !fr) return '';
    if (S.hst === 'new' ? !fr : S.hst && !n[S.hst]) S.hst = '';
    return '<div class="hst" data-hst>' + '<button data-h="" class="' + (!S.hst ? 'on' : '') + '">Все<b>' + all + '</b></button>' +
      (fr ? '<button data-h="new" class="nw' + (S.hst === 'new' ? ' on' : '') + '">Новые от Claude<b>' + fr + '</b></button>' : '') +
      keys.map(function (k) { return '<button data-h="' + k + '" class="' + k + (S.hst === k ? ' on' : '') + '">' + ST_K[k] + '<b>' + n[k] + '</b></button>'; }).join('') +
      (n['-'] ? '<button data-h="-" class="' + (S.hst === '-' ? 'on' : '') + '">Без статуса<b>' + n['-'] + '</b></button>' : '') + '</div>';
  }
  function bindCards() {
    $$('[data-h]').forEach(function (b) { b.onclick = function () { S.hst = b.getAttribute('data-h'); $$('[data-h]').forEach(function (x) { x.classList.toggle('on', x === b); }); var g = $('[data-grid]'), l = list(); g.innerHTML = l.length ? l.map(cardHtml).join('') : '<div class="empty">Ничего не нашлось</div>'; bindCards(); }; }); $$('[data-open]').forEach(function (b) { b.onclick = function () { go(b.getAttribute('data-open')); }; }); }

  /* ───────── расчёт контракта ───────── */
  function view(id, quiet) {
    var d = S.db[id]; if (!d) return go('');
    if (S.cur !== id) { S.tz = {}; if (!quiet) S.histNew = id; }
    S.cur = id;
    if (d.fresh) { delete d.fresh; touch(d); }
    var main = $('#fdc-main'), dl = deadline(d.deadline), c = calc(d);
    var url = d.url || 'https://zakupki.gov.ru/epz/order/extendedsearch/results.html?searchString=' + encodeURIComponent(d.number);
    main.innerHTML = '<div class="pg' + (quiet ? '' : S.dir < 0 ? ' back' : '') + '"' + (quiet ? ' style="animation:none"' : '') + '><div class="w">' +
      '<button class="backl" data-back>' + IC.back + 'Все расчёты</button>' +
      '<div class="head"><div class="tx"><h1>' + esc(d.title || 'Закупка ' + d.number) + '</h1><div class="meta">' +
      (d.customer ? '<span>' + esc(d.customer) + '</span>' : '') + '<a class="lnk" href="' + esc(url) + '" target="_blank" rel="noopener">№ ' + esc(d.number) + '</a>' +
 (d.added ? '<span class="dz" title="Когда закупка добавлена на сайт">разбор ' + esc(dtRu(d.added)) + '</span>' : '') +
      '<span data-stp class="pill st ' + (d.status || '') + '"' + (d.status ? '' : ' hidden') + '>' + esc(ST_K[d.status] || '') + '</span></div></div>' +
      '<button class="hbtn" data-info><i class="vd ' + esc(d.info && d.info.verdict && d.info.verdict.level || '') + '"></i>' + IC.info + 'Описание</button>' +
      (d.info && d.info.src === 'ai' ? '' : '<button class="hbtn ai" data-ai>' + IC.ai + 'Разбор ИИ</button>') +
      '<button class="ib" data-sum title="Скопировать сводку для MAX">' + IC.cp + '</button>' +
      '<button class="ib" data-exp title="Скачать файл с моими ценами">' + IC.dl + '</button><button class="ib" data-del title="Удалить расчёт">' + IC.del + '</button></div>' +
      kfHtml(d, dl) + stHtml(d) +
      '<section class="panel" style="' + (quiet ? 'animation:none' : '') + '">' +
      '<div class="cutrow"><span class="l">Снижение на торгах</span><label class="cutbox"><input data-cutn inputmode="decimal" value="' + fnum(d.cut || 0, 1) + '">%</label>' +
      '<div class="quick">' + [0, 5, 10, 15, 20, 25, 30].map(function (v) { return '<button data-q="' + v + '">' + v + '%</button>'; }).join('') + '</div></div>' +
      '<div class="rng"><div class="tr"></div><div class="be" data-be></div><input type="range" min="0" max="50" step="0.5" value="' + Math.min(50, d.cut || 0) + '" data-cut aria-label="Снижение"></div>' +
      '<div class="scale"><span>0%</span><span>10%</span><span>20%</span><span>30%</span><span>40%</span><span>50%</span></div>' +
      '<div class="bel" data-bel></div><div class="tgm" data-tgm></div>' +
      '<div class="tiles">' +
      '<label class="tile edit" title="Можно вписать цену, по которой готовы подписать контракт"><small>Цена контракта</small><div class="tin"><input data-price inputmode="decimal"><span>₽</span></div><em data-k1></em></label>' +
      '<button class="tile" data-t="tax"><small data-taxl>Налог</small><b data-v="tax"></b><em>с суммы контракта</em></button>' +
      '<button class="tile" data-t="cost"><small>Закупка</small><b data-v="cost"></b><em data-k3></em></button>' +
      '<label class="tile edit"><small>Логистика</small><div class="tin"><input data-log inputmode="decimal" placeholder="0"><span>₽</span></div><em><button class="lnkb" data-logi>' + (d.logi && d.logi.n ? d.logi.n + ' рейсов × ' + rub(d.logi.p) : 'посчитать по рейсам') + '</button></em></label>' +
      '<button class="tile big" data-t="profit"><small data-pl>Прибыль</small><b data-v="profit"></b><em data-v="margin"></em></button>' +
      '</div><div class="pm" data-pm></div><div data-warn></div></section>' +
      '<div class="lhd"><h2>Позиции <span class="mut" style="font-weight:600">' + d.items.length + '</span></h2>' +
      '<button class="btn sec cpl" data-cpl title="Скопировать список товаров для закупщика">' + IC.cp + '<span>Список</span></button>' +
      '<div class="seg" data-seg><i></i><button data-f="all">Все</button><button data-f="miss">Без цены<b data-cnt="miss"></b></button><button data-f="minus">В минус<b data-cnt="minus"></b></button></div></div>' +
      '<div class="lines" data-lines></div>' +
      '<p class="mut sm" style="margin-top:14px">Налог ' + fnum(c.tax * 100, 1) + '% считается с полной суммы контракта, НДС не вычитается. Расчёт сохраняется сам' + (connected() ? ' — на этом устройстве и в таблице.' : ' на этом устройстве.') + '</p>' +
      '</div></div>';
    if (quiet) $$('.panel', main).forEach(function (p) { p.style.animation = 'none'; });
    var cutR = $('[data-cut]'), cutN = $('[data-cutn]'), priceI = $('[data-price]'), logI = $('[data-log]');
    moneyIn(priceI); moneyIn(logI);
    logI.value = d.logistics ? moneyShow(d.logistics) : '';
    var setCut = function (v, from) {
      v = Math.max(0, Math.min(99, Math.round(v * 10) / 10)); d.cut = v;
      if (from !== 'r') cutR.value = Math.min(50, v);
      if (from !== 'n') cutN.value = fnum(v, 1);
      upd(from); touchSoon(d);
    };
    S.setCut = setCut;
    cutR.oninput = function () { setCut(Number(cutR.value), 'r'); };
    cutN.oninput = function () { var v = num(cutN.value); if (v !== null) setCut(v, 'n'); };
    cutN.onblur = function () { cutN.value = fnum(d.cut, 1); };
    $$('[data-q]', main.querySelector('.quick')).forEach(function (b) { b.onclick = function () { setCut(Number(b.getAttribute('data-q'))); }; });
    priceI.oninput = function () { var v = num(priceI.value), cc = calc(d); if (v !== null && cc.sum > 0) setCut((1 - v / cc.sum) * 100, 'p'); };
    priceI.onblur = function () { upd(); };
    logI.oninput = function () { d.logistics = Math.max(0, num(logI.value) || 0); upd('l'); touchSoon(d); };
    [priceI, logI, cutN].forEach(function (i) { i.onkeydown = function (e) { if (e.key === 'Enter') i.blur(); }; });
    $('[data-back]').onclick = function () { go(''); };
    $('[data-exp]').onclick = function () { exportFile(d); };
    $('[data-info]').onclick = function () { infoDlg(d); };
    $('[data-del]').onclick = function () { delDlg(d); };
    var aib = $('[data-ai]'); if (aib) aib.onclick = function () { aiStart(d); };
    $('[data-sum]').onclick = function () { copyText(sumText(d), 'Сводка скопирована — вставьте в MAX'); };
    $('[data-cpl]').onclick = function () { copyText(listText(d), 'Список товаров скопирован'); };
    $('[data-logi]').onclick = function (e) { e.preventDefault(); logiDlg(d); };
    var i2 = $('[data-info2]'); if (i2) i2.onclick = function () { infoDlg(d); };
    var nt = $('[data-note]'), ntFit = function () { nt.style.height = '34px'; nt.style.height = Math.min(240, nt.scrollHeight + 2) + 'px'; };
    nt.oninput = function () { d.note = nt.value.slice(0, 2000); ntFit(); touchSoon(d); }; ntFit();
    $$('[data-t]').forEach(function (b) { b.onclick = function () { tileDlg(b.getAttribute('data-t')); }; });
    $$('[data-f]').forEach(function (b) { b.onclick = function () { S.filter = b.getAttribute('data-f'); lines(true); seg(); }; });
    S.filter = S.filter || 'all';
    lines(!quiet); upd(); seg(true);
    ticker();
    if (S.histNew === id) { S.histNew = null; histAdd(d); }
    stSet(d);
    fpWatch($('.tiles', main), S.fpHtml || '', S.fpCls || '', function () { $('.panel').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); });
  }
  /* Главное на виду: срок подачи, до какого числа контракт, куда возить */
  function kfHtml(d, dl) {
    var t = termOf(d), pts = points(d), more = pts.length > 3 ? pts.length - 3 : 0;
    var IC_MAP = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
    var IC_RT = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16"/></svg>';
    return '<section class="kf">' +
      '<div class="kc' + (dl ? ' ' + dl.cls : '') + '"><small>Подача заявок до</small><b>' + (dl ? esc(dl.full) : '—') + '</b><em>' + (dl ? esc(dl.txt) : 'нет в файле') + '</em></div>' +
      '<div class="kc' + (t && t.gone ? ' gone' : '') + '"' + (t ? ' title="' + esc(t.src) + '"' : '') + '><small>Контракт действует до</small><b>' + (t ? esc(t.full) : '—') + '</b><em>' + (t ? esc(t.txt) : 'срок не указан — см. «Описание»') + '</em></div>' +
      '<div class="kc ad"><small>' + (pts.length ? 'Доставка · ' + pts.length + ' ' + plural(pts.length, 'адрес', 'адреса', 'адресов') : 'Доставка') + '</small>' +
      (pts.length ? pts.slice(0, 3).map(function (p, j) {
        return '<div class="ar"><span class="no">' + (j + 1) + '</span><div class="at"><b>' + esc(p.address || p.name) + '</b>' + (p.name && p.address || p.note ? '<span>' + esc([p.address ? p.name : '', p.note].filter(Boolean).join(' · ')) + '</span>' : '') + '</div>' +
          '<a class="ya" href="' + esc(yMap(p)) + '" target="_blank" rel="noopener" title="Открыть в Яндекс Картах">' + IC_MAP + '<span>Карта</span></a>' +
          '<a class="ya" href="' + esc(yRoute([p])) + '" target="_blank" rel="noopener" title="Маршрут от вас в Яндекс Картах">' + IC_RT + '<span>Маршрут</span></a></div>';
      }).join('') + '<div class="arf">' + (more ? '<button class="lnkb" data-info2>ещё ' + more + ' ' + plural(more, 'адрес', 'адреса', 'адресов') + ' — в «Описании»</button>' : '') +
        (pts.length > 1 ? '<a class="lnkb" href="' + esc(yRoute(pts.slice(0, 8))) + '" target="_blank" rel="noopener">Маршрут по всем адресам ↗</a>' : '') + '</div>'
        : '<div class="mut sm" style="margin-top:6px">Адреса нет в файле — нажмите «Разбор ИИ» или пришлите архив в Claude.</div>') +
      '</div></section>';
  }
  function stHtml(d) {
    return '<div class="strow">' +
      '<textarea class="inp nt" data-note rows="1" placeholder="Заметка: с кем говорил, что уточнить, решение…">' + esc(d.note || '') + '</textarea></div>';
  }
  /* Сводка для MAX */
  function sumText(d) {
    var c = calc(d), dl = deadline(d.deadline), t = termOf(d), pts = points(d), L = [];
    L.push((d.title || 'Закупка') + ' — № ' + d.number);
    if (d.customer) L.push('Заказчик: ' + d.customer);
    L.push('НМЦК: ' + rub(d.nmck));
    if (dl) L.push('Подача до: ' + dl.full + ' (' + dl.txt + ')');
    if (t) L.push('Контракт до: ' + t.full);
    if (d.status) L.push('Статус: ' + ST_K[d.status]);
    L.push('');
    L.push('Снижение ' + fnum(d.cut || 0, 1) + '% → цена ' + rub(c.rev));
    L.push('Закупка: ' + rub(c.cost) + (c.full ? '' : ' (цены у ' + c.known + ' из ' + d.items.length + ')') + ' · налог ' + fnum(c.tax * 100, 1) + '%: ' + rub(c.taxSum) + (c.log ? ' · логистика: ' + rub(c.log) : ''));
    L.push('Прибыль: ' + rub(c.profit) + ' · маржа ' + fnum(c.margin * 100, 1) + '%');
    var mo = monthsOf(d); if (mo) L.push('В месяц (' + mo.n + ' мес.): чистыми ' + rub(c.profit / mo.n) + ' · закупка ' + rub(c.cost / mo.n));
    if (c.be !== null) L.push(c.be > 0 ? 'Без убытка можно снижать до ' + fnum(Math.floor(c.be * 1000) / 10, 1) + '% (мин. цена ' + rub(c.sum * (1 - c.be)) + ')' : 'Убыток даже без снижения');
    if (pts.length) { L.push(''); L.push('Доставка:'); pts.forEach(function (p, j) { L.push((j + 1) + ') ' + (p.address || p.name) + (p.note ? ' — ' + p.note : '')); }); }
    if (d.note) { L.push(''); L.push('Заметка: ' + d.note); }
    if (d.url) { L.push(''); L.push(d.url); }
    return L.join('\n');
  }
  function listText(d) {
    return (d.title || 'Закупка № ' + d.number) + '\n' + d.items.map(function (it, j) { return (j + 1) + '. ' + it.name + ' — ' + qty(it.quantity) + ' ' + it.unit + (it.purchase_price !== null ? ' (закупка ' + rubk(it.purchase_price) + ')' : ''); }).join('\n');
  }
  function logiDlg(d) {
    var L = d.logi || { n: 0, p: 0 };
    var s = sheet('<div class="hd"><div class="tx"><h2>Посчитать логистику</h2><div class="mut sm" style="margin-top:4px">Сколько рейсов за весь контракт и сколько стоит один рейс (бензин, водитель, грузчики).</div></div><button class="ib" data-x>' + IC.x + '</button></div>' +
      '<div class="bd"><div class="lgg"><label><small>Рейсов за контракт</small><input class="inp" data-lgn inputmode="numeric" value="' + (L.n || '') + '" placeholder="например, 50"></label>' +
      '<label><small>Один рейс, ₽</small><input class="inp" data-lgp inputmode="decimal" value="' + moneyShow(L.p || null) + '" placeholder="например, 3 000"></label></div>' +
      '<div class="lgt" data-lt></div></div>' +
      '<div class="ft"><button class="btn gh" data-x>Отмена</button><button class="btn pri" data-ok>Поставить в расчёт</button></div>');
    var n = $('[data-lgn]', s.el), p = $('[data-lgp]', s.el), out = $('[data-lt]', s.el); moneyIn(p);
    var r = function () { var a = Math.max(0, Math.round(num(n.value) || 0)), b = Math.max(0, num(p.value) || 0); out.innerHTML = a && b ? a + ' × ' + rub(b) + ' = <b>' + rub(a * b) + '</b>' : 'Впишите оба числа'; return { n: a, p: b }; };
    n.oninput = p.oninput = r; r(); setTimeout(function () { n.focus(); }, 60);
    $('[data-ok]', s.el).onclick = function () { var v = r(); if (!v.n || !v.p) return; d.logi = v; d.logistics = v.n * v.p; s.close(); touch(d); view(d.number, true); toast('Логистика: ' + rub(d.logistics)); };
  }
  function touchSoon(d) { clearTimeout(S.timers.t); S.timers.t = setTimeout(function () { touch(d); }, 500); }
  function seg(instant) {
    var g = $('[data-seg]'); if (!g) return;
    var on = $('[data-f="' + S.filter + '"]', g) || $('[data-f]', g), i = $('i', g);
    $$('button', g).forEach(function (b) { b.classList.toggle('on', b === on); });
    if (instant) { i.style.transition = 'none'; }
    i.style.width = on.offsetWidth + 'px'; i.style.transform = 'translateX(' + (on.offsetLeft - 3) + 'px)';
    if (instant) { void i.offsetWidth; i.style.transition = ''; }
  }
  function lineVisible(it, l) {
    if (S.filter === 'miss') return it.purchase_price === null;
    if (S.filter === 'minus') return l.pr !== null && l.pr < 0;
    return true;
  }
  function srcHtml(it) {
    if (it.purchase_price === null) {
      var n = S.idx.length ? suggest(it, '', '', 5).length : 0;
      return '<button class="src find" data-pick><i class="d"></i><span>' + (S.idx.length ? (n ? 'Подобрать · похожих ' + n + (n >= 5 ? '+' : '') : 'Найти цену') : 'Найти цену') + '</span></button>';
    }
    var s = it.src || { kind: 'hand' };
    var txt = s.kind === 'file' ? 'Из файла' : s.kind === 'hand' ? 'Вручную' : s.kind === 'book' ? 'Моя цена' + (norm(s.name) !== norm(it.name) ? ': ' + s.name : '') : (s.auto ? 'Проверьте: ' : '') + s.name;
    var sub = s.kind === 'own' || s.kind === 'vend' ? s.who + (s.date ? ' · ' + dRu(s.date) : '') : s.kind === 'book' ? 'запомнена' + (s.date ? ' ' + dRu(s.date) : '') : '';
    var ubad = !s.conv && s.unit && it.unit && unitN(s.unit) !== unitN(it.unit);
    var warn = ubad ? ' title="Единица цены — «' + esc(s.unit) + '», в закупке — «' + esc(it.unit) + '»"' : ' title="' + esc(txt) + '"';
    return '<button class="src' + (s.auto ? ' auto' : '') + '" data-pick' + warn + '><i class="d"></i><div style="min-width:0"><span>' + esc(txt) + '</span>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div></button>' +
      (s.conv ? '<span class="cvn">пересчёт: ' + esc(s.conv) + '</span>' : ubad ? '<span class="ul">цена за «' + esc(s.unit) + '», нужна за «' + esc(it.unit) + '»</span>' : '');
  }
  function lines(anim) {
    var d = S.db[S.cur], box = $('[data-lines]'); if (!d || !box) return;
    var c = calc(d), rows = [], j = 0;
    d.items.forEach(function (it, i) {
      if (!lineVisible(it, c.lines[i])) return;
      rows.push('<div class="lr' + (anim ? ' in' : '') + '" data-i="' + i + '" style="' + (anim ? 'animation-delay:' + Math.min(j++ * 25, 350) + 'ms' : '') + '">' +
        '<div class="c1 nm">' + esc(it.name) + (it.note ? '<small>' + esc(it.note) + '</small>' : '') +
        (it.spec ? '<button class="tzb' + (S.tz[i] ? ' on' : '') + '" data-tz>Требования ТЗ ' + IC.down + '</button>' : '') + '</div>' +
        '<div class="c2"><span class="lb">Количество</span>' + (it.qe ? '<div class="qew"><input class="mi qi" data-qi inputmode="decimal" value="' + esc(qty(it.quantity)) + '"><span>' + esc(it.unit) + '</span></div><small class="qen" title="Заказчик не указал количество — впишите своё">примерно</small>' : qty(it.quantity) + ' ' + esc(it.unit)) + '</div>' +
        '<div class="c3 r"><span class="lb">НМЦК за ед.</span>' + rubk(it.unit_price) + '<div class="n2" data-after></div></div>' +
        '<div class="c4 pp"><span class="lb">Закупка за ед.</span><div class="miw"><input class="mi" data-pp inputmode="decimal" placeholder="нет цены" value="' + moneyShow(it.purchase_price) + '"></div><div data-src>' + srcHtml(it) + '</div></div>' +
        '<div class="c5 r pr"><span class="lb">Прибыль по строке</span><b data-lp></b><div class="n2" data-lm></div><div class="mb"><i data-lb></i></div></div>' +
        (it.spec ? '<div class="c6 tzw' + (S.tz[i] ? ' on' : '') + '"><div><div class="tz">' + esc(it.spec) + '</div></div></div>' : '') + '</div>');
    });
    box.innerHTML = '<div class="lr th"><div>Товар</div><div>Количество</div><div class="r">НМЦК за ед.</div><div>Закупка за ед.</div><div class="r">Прибыль по строке</div></div>' +
      (rows.length ? rows.join('') : '<div class="empty">' + (S.filter === 'miss' ? 'Все цены заполнены' : 'Убыточных позиций нет') + '</div>');
    $$('.lr[data-i]', box).forEach(bindLine);
    updLines();
  }
  function bindLine(row) {
    var d = S.db[S.cur], i = Number(row.getAttribute('data-i')), it = d.items[i], inp = $('[data-pp]', row);
    moneyIn(inp);
    var qi = $('[data-qi]', row);
    if (qi) {
      qi.oninput = function () { var v = num(qi.value); if (v && v > 0) { it.quantity = v; upd(); touchSoon(d); } };
      qi.onblur = function () { qi.value = qty(it.quantity); };
      qi.onfocus = function () { qi.select(); };
      qi.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); var nx = row.nextElementSibling; while (nx && !$('[data-qi]', nx)) nx = nx.nextElementSibling; if (nx) $('[data-qi]', nx).focus(); else qi.blur(); } };
    }
    var tb = $('[data-tz]', row);
    if (tb) tb.onclick = function () { S.tz[i] = !S.tz[i]; tb.classList.toggle('on', S.tz[i]); $('.tzw', row).classList.toggle('on', S.tz[i]); };
    inp.oninput = function () {
      var v = num(inp.value);
      it.purchase_price = v === null ? null : v;
      if (v === null) { delete it.src; it.noAuto = true; } else { it.src = { kind: 'hand' }; delete it.noAuto; bookFromInput(d, it); }
      $('[data-src]', row).innerHTML = srcHtml(it); bindPick(row);
      upd(); touchSoon(d);
    };
    inp.onblur = function () { inp.value = moneyShow(it.purchase_price); setTimeout(function () { if (!document.body.contains(row)) return; $('[data-src]', row).innerHTML = srcHtml(it); bindPick(row); }, 1300); if (S.filter !== 'all') { lines(false); seg(); } };
    inp.onkeydown = function (e) {
      if (e.key !== 'Enter') return; e.preventDefault();
      var nx = row.nextElementSibling; while (nx && !$('[data-pp]', nx)) nx = nx.nextElementSibling;
      if (nx) { var ni = $('[data-pp]', nx); ni.focus(); ni.select(); } else inp.blur();
    };
    bindPick(row);
  }
  function bindPick(row) { var b = $('[data-pick]', row); if (b) b.onclick = function () { pickDlg(Number(row.getAttribute('data-i'))); }; }
  function upd(from) {
    var d = S.db[S.cur]; if (!d) return;
    var c = calc(d), M = $('#fdc-main');
    var bePct = c.be === null ? null : c.be * 100;
    /* полоса снижения: до точки безубыточности — цвет бренда, дальше — красный */
    var p = Math.min(50, d.cut) / 50 * 100, b = bePct === null ? 101 : Math.max(0, Math.min(100, bePct / 50 * 100));
    var tr = $('.rng .tr', M), ac = '#161616', bad = '#B5361F';
    tr.style.background = p <= b ? 'linear-gradient(90deg,' + ac + ' 0 ' + p + '%,#EFEFEA ' + p + '% ' + Math.min(b, 100) + '%,#F6DCD9 ' + Math.min(b, 100) + '% 100%)'
      : 'linear-gradient(90deg,' + ac + ' 0 ' + b + '%,' + bad + ' ' + b + '% ' + p + '%,#F6DCD9 ' + p + '% 100%)';
    var be = $('[data-be]', M); be.style.left = Math.min(100, b) + '%'; be.style.opacity = bePct === null || bePct > 50 || bePct < 0 ? '0' : '.7';
    var bel = $('[data-bel]', M);
    if (c.full) {
      bel.innerHTML = bePct <= 0 ? '<span class="neg">Убыток даже без снижения — закупка и логистика дороже контракта.</span>' :
        'Без убытка можно снижать до <b>' + fnum(Math.floor(bePct * 10) / 10, 1) + '%</b> · минимальная цена <b>' + rub(c.sum * (1 - bePct / 100)) + '</b>';
    } else bel.innerHTML = '<span>Не хватает закупочных цен у ' + c.miss + ' ' + plural(c.miss, 'позиции', 'позиций', 'позиций') + ' — порог без убытка появится, когда заполните все.</span>';
    var tg = $('[data-tgm]', M), th = '';
    if (c.full && c.sum > 0) {
      th = '<span>Нужна маржа:</span>' + [5, 10, 15, 20].map(function (m) {
        var den = 1 - c.tax - m / 100, cut = den > 0 ? (1 - (c.cost + c.log) / den / c.sum) * 100 : -1;
        cut = Math.floor(cut * 10) / 10;
        return cut < 0 ? '<button disabled title="Не получится даже без снижения">' + m + '% · нельзя</button>' : '<button data-tg="' + cut + '" title="Снижение до ' + fnum(cut, 1) + '% даст маржу ' + m + '%">' + m + '% → до −' + fnum(cut, 1) + '%</button>';
      }).join('');
    }
    if (tg._h !== th) { tg._h = th; tg.innerHTML = th; $$('[data-tg]', tg).forEach(function (b) { b.onclick = function () { if (S.setCut) S.setCut(Number(b.getAttribute('data-tg'))); }; }); }
    var priceI = $('[data-price]', M);
    if (from !== 'p' && document.activeElement !== priceI) priceI.value = moneyShow(Math.round(c.rev));
    $('[data-k1]', M).textContent = Math.abs(c.sum - d.nmck) > Math.max(1, d.nmck * 0.002) ? 'позиции ' + rub(c.sum) + ', НМЦК ' + rub(d.nmck) : 'НМЦК ' + rub(d.nmck);
    $('[data-taxl]', M).textContent = 'Налог ' + fnum(c.tax * 100, 1) + '%';
    tw($('[data-v="tax"]', M), c.taxSum, rub);
    tw($('[data-v="cost"]', M), c.cost, rub);
    $('[data-k3]', M).textContent = c.full ? 'все ' + d.items.length + ' позиций' : c.known + ' из ' + d.items.length + ' позиций';
    var big = $('[data-t="profit"]', M);
    big.classList.toggle('pos', c.full && c.profit >= 0); big.classList.toggle('neg', c.profit < 0 && (c.full || c.known > 0));
    $('[data-pl]', M).textContent = c.full ? 'Прибыль' : 'Прибыль по ' + c.known + ' из ' + d.items.length;
    tw($('[data-v="profit"]', M), c.profit, rub);
    tw($('[data-v="margin"]', M), c.margin * 100, function (v) { return 'маржа ' + fnum(v, 1) + '% от выручки'; });
    var pm = $('[data-pm]', M), mo = monthsOf(d), ph;
    ph = mo ? '<button class="pmh" data-pmset title="Изменить число месяцев">В месяц · ' + mo.n + ' мес.' + (mo.own ? '' : ' <span>' + esc(mo.how) + '</span>') + ' <i>изменить</i></button>' +
      '<div class="pmc' + (c.profit < 0 ? ' neg' : ' pos') + '"><small>Чистыми в месяц</small><b>' + rub(c.profit / mo.n) + '</b></div>' +
      '<div class="pmc"><small>Закупка в месяц</small><b>' + rub(c.cost / mo.n) + '</b>' + (c.full ? '' : '<em>по ' + c.known + ' из ' + d.items.length + '</em>') + '</div>' +
      '<div class="pmc"><small>Выручка в месяц</small><b>' + rub(c.rev / mo.n) + '</b></div>' +
      (c.log ? '<div class="pmc"><small>Логистика в месяц</small><b>' + rub(c.log / mo.n) + '</b></div>' : '')
      : '<button class="pmh" data-pmset>Посчитать в месяц — <i>впишите срок поставок</i></button>';
    if (pm._h !== ph) { pm._h = ph; pm.innerHTML = ph; $('[data-pmset]', pm).onclick = function () { monthsDlg(d); }; }
    $$('.tile b', M).forEach(function (b) { b.classList.toggle('long', b.textContent.length > 11); });
    var w = $('[data-warn]', M), wh = '';
    if (c.miss && S.idx.length) wh = '<div class="note"><span>Нет закупочной цены у ' + c.miss + ' ' + plural(c.miss, 'позиции', 'позиций', 'позиций') + '.</span><span class="sp"></span><button class="btn sec" data-showmiss style="height:34px">Показать</button></div>';
    else if (c.miss && !connected()) wh = '<div class="note info"><span>Подключите таблицу — закупочные цены с сайта документов подставятся сами.</span><span class="sp"></span><button class="btn sec" data-conn style="height:34px">Подключить</button></div>';
    var qes = d.items.filter(function (x) { return x.qe; }).length;
    if (qes) wh = '<div class="note"><span>Заказчик не указал количество у ' + qes + ' ' + plural(qes, 'позиции', 'позиций', 'позиций') + ' (оплата по цене за единицу). Впишите примерное количество за весь срок — поле «примерно» в строке' + (d.info && d.info.src === 'ai' ? '' : ', или нажмите «Разбор ИИ» — он поищет объёмы в документах') + '.</span></div>' + wh;
    var autos = d.items.filter(function (x) { return x.src && x.src.auto; }).length;
    if (autos) wh += '<div class="note info"><span>' + autos + ' ' + plural(autos, 'цена подобрана', 'цены подобраны', 'цен подобрано') + ' по похожему названию — проверьте (жёлтая подпись под ценой).</span></div>';
    if (w.innerHTML !== wh) {
      w.innerHTML = wh;
      var sm = $('[data-showmiss]', w); if (sm) sm.onclick = function () { S.filter = 'miss'; lines(true); seg(); $('[data-lines]').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); };
      var cn = $('[data-conn]', w); if (cn) cn.onclick = pstDlg;
    }
    $('[data-cnt="miss"]', M).textContent = c.miss || '';
    $('[data-cnt="minus"]', M).textContent = c.minus || '';
    S.fpHtml = '<span>' + (c.full ? 'Прибыль' : 'Прибыль по ' + c.known + '/' + d.items.length) + '</span><b>' + rub(c.profit) + '</b><span class="fs">·</span><span>маржа ' + fnum(c.margin * 100, 1) + '%</span><span class="fs">·</span><span>−' + fnum(d.cut, 1) + '%</span>';
    S.fpCls = c.profit < 0 && c.known ? 'neg' : c.full ? 'pos' : '';
    if (S.cur) fpSet(S.fpHtml, S.fpCls);
    $$('.quick button', M).forEach(function (bb) { bb.classList.toggle('on', Number(bb.getAttribute('data-q')) === d.cut); });
    updLines(c);
  }
  function updLines(c) {
    var d = S.db[S.cur]; if (!d) return; c = c || calc(d);
    $$('.lr[data-i]').forEach(function (row) {
      var i = Number(row.getAttribute('data-i')), it = d.items[i], l = c.lines[i];
      var ae = $('[data-after]', row), ah = (d.cut ? '<span>после торгов <b>' + rubk(it.unit_price * c.k) + '</b></span>' : '') + '<span>минус налог ' + fnum(c.tax * 100, 0) + '% <b>' + rubk(it.unit_price * c.k * (1 - c.tax)) + '</b></span>';
      if (ae._h !== ah) { ae._h = ah; ae.innerHTML = ah; }
      var lp = $('[data-lp]', row), lm = $('[data-lm]', row), lb = $('[data-lb]', row);
      if (l.pr === null) { lp.className = 'mut'; lp._v = undefined; lp.textContent = '—'; lm.textContent = 'нет закупочной цены'; lb.style.width = '0'; return; }
      lp.className = l.pr < 0 ? 'neg' : 'pos';
      tw(lp, l.pr, rub);
      lm.textContent = 'маржа ' + fnum(l.m * 100, 1) + '%';
      lb.style.width = Math.min(100, Math.abs(l.m) * 250) + '%'; lb.className = l.pr < 0 ? 'neg' : '';
    });
  }

  /* ───────── окна ───────── */
  function sheet(html, onClose) {
    var ov = document.createElement('div'); ov.className = 'ov'; ov.innerHTML = '<div class="sh" role="dialog" aria-modal="true">' + html + '</div>';
    S.root.appendChild(ov);
    var close = function () {
      if (ov._c) return; ov._c = 1; ov.classList.add('out'); document.removeEventListener('keydown', key);
      setTimeout(function () { ov.remove(); }, 220); if (onClose) onClose();
    };
    var key = function (e) { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', key);
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(); });
    $$('[data-x]', ov).forEach(function (b) { b.onclick = close; });
    return { el: ov, close: close };
  }
  function pasteDlg() {
    var s = sheet('<div class="hd"><div class="tx"><h2>Вставить текст</h2><div class="mut sm" style="margin-top:4px">Скопируйте ответ ChatGPT или Claude с данными закупки целиком и вставьте сюда.</div></div><button class="ib" data-x>' + IC.x + '</button></div>' +
      '<div class="bd"><textarea class="inp" data-t placeholder="{ &quot;schema&quot;: &quot;frudom-contract-v1&quot;, … }"></textarea><div class="errt" data-e></div></div>' +
      '<div class="ft"><button class="btn gh" data-x>Отмена</button><button class="btn pri" data-ok>Открыть расчёт</button></div>');
    var t = $('[data-t]', s.el); setTimeout(function () { t.focus(); }, 60);
    $('[data-ok]', s.el).onclick = function () {
      try { var r = importData(parseText(t.value)); s.close(); toast(r.upd ? 'Расчёт обновлён' : 'Закупка добавлена'); go(r.d.number); }
      catch (e) { $('[data-e]', s.el).textContent = e.message; }
    };
  }
  /* ───────── описание контракта ───────── */
  var VLBL = { ok: 'Можно участвовать', care: 'Участвовать осторожно', bad: 'Лучше не участвовать' };
  function infoDlg(d) {
    var I = d.info || {}, dl = deadline(d.deadline), c = calc(d), facts = (I.facts || []).slice();
    var base = [{ k: 'Заказчик', v: d.customer }, { k: 'НМЦК', v: rub(d.nmck) }, { k: 'Подача заявок до', v: dl ? dl.full + ' · ' + dl.txt : '' }, { k: 'Позиций', v: d.items.length + ' · ' + qty(d.items.reduce(function (a, x) { return a + (unitN(x.unit) === 'кг' ? x.quantity : 0); }, 0)) + ' кг' }];
    facts = base.filter(function (x) { return x.v; }).concat(facts);
    var pts = (I.points || []).filter(function (p) { return p && (p.address || p.lat); });
    var v = I.verdict && I.verdict.text ? I.verdict : null;
    var flags = (I.flags || []).slice().sort(function (a, b) { var o = { red: 0, yellow: 1, green: 2 }; return (o[a.level] || 1) - (o[b.level] || 1); });
    var html = '<div class="hd"><div class="tx"><h2>' + esc(d.title || 'Закупка ' + d.number) + '</h2><div class="mut sm" style="margin-top:4px">№ ' + esc(d.number) + (d.url ? ' · <a class="lnk" href="' + esc(d.url) + '" target="_blank" rel="noopener">открыть закупку ↗</a>' : '') + '</div></div><button class="ib" data-x>' + IC.x + '</button></div><div class="bd">' +
      (v ? '<div class="vdb ' + esc(v.level || '') + '"><div><b>' + esc(VLBL[v.level] || 'Вывод') + '</b>' + esc(v.text) + '</div></div>' : '') +
      (I.summary ? '<div class="sum">' + esc(I.summary) + '</div>' : '') +
      (flags.length ? '<div class="h3">Подводные камни</div>' + flags.map(function (f, j) { return '<div class="flag ' + esc(f.level || 'yellow') + '" style="animation-delay:' + Math.min(j * 30, 300) + 'ms"><i></i><b>' + esc(f.title) + '</b>' + (f.why ? '<div>' + esc(f.why) + '</div>' : '') + '</div>'; }).join('') : '') +
      (pts.length ? '<div class="h3">Куда возить · ' + pts.length + ' ' + plural(pts.length, 'адрес', 'адреса', 'адресов') + '</div><div class="map" data-map><div class="ms"><span><span class="ld"></span> Загружаю карту…</span></div></div>' +
        '<div class="pts">' + pts.map(function (p, j) { return '<button class="pt" data-pt="' + j + '"><span class="no">' + (j + 1) + '</span><b>' + esc(p.name || 'Адрес ' + (j + 1)) + '</b><small>' + esc(p.address || '') + (p.note ? ' · ' + esc(p.note) : '') + '</small><a href="https://yandex.ru/maps/?text=' + encodeURIComponent(p.address || (p.lat + ',' + p.lng)) + '" target="_blank" rel="noopener">Яндекс Карты ↗</a></button>'; }).join('') + '</div>' : '') +
      '<div class="h3">Главные условия</div><div class="facts">' + facts.map(function (f, j) { return '<div class="fact" style="animation-delay:' + Math.min(j * 25, 300) + 'ms"><small>' + esc(f.k) + '</small><span>' + esc(f.v) + '</span></div>'; }).join('') + '</div>' +
      (I.sections || []).map(function (sc) { return sc && sc.items && sc.items.length ? '<div class="sec"><div class="h3">' + esc(sc.title) + '</div><ul>' + sc.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' : ''; }).join('') +
      (!d.info || I.src === 'notice' ? '<div class="note info" style="margin-top:18px"><span>' + (I.src === 'notice' ? 'Это данные из извещения ЕИС — сайт прочитал их сам. Вывода и подводных камней из договора и ТЗ здесь пока нет.' : 'В файле этой закупки нет описания.') + '</span><span class="sp"></span><button class="btn sec" data-aigo style="height:34px">' + IC.ai + 'Разбор ИИ</button></div>' : '') +
      (I.ai ? '<div class="aimeta">Разбор ИИ: ' + esc((AI_MODELS.filter(function (x) { return x[0] === I.ai.model; })[0] || [0, I.ai.model])[1].split(' — ')[0]) + ' · ' + esc(dRu(I.ai.at)) + (I.ai.cost ? ' · ≈ $' + fnum(I.ai.cost, 2) : '') + (I.ai.skip && I.ai.skip.length ? ' · не прочитано: ' + esc(I.ai.skip.join(', ')) : '') + ' · <button class="lnkb" data-aigo>разобрать заново</button></div>' : '') +
      '</div>';
    var s = sheet(html); $('.sh', s.el).classList.add('wide');
    $$('[data-aigo]', s.el).forEach(function (b) { b.onclick = function () { s.close(); aiStart(d); }; });
    if (pts.length) setTimeout(function () { drawMap(d, pts, $('[data-map]', s.el), s.el); }, RM ? 0 : 380);
  }
  function leaflet() {
    if (window.L && window.L.map) return Promise.resolve(window.L);
    if (S.lp) return S.lp;
    var load = function (base) {
      return new Promise(function (res, rej) {
        var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = base + 'leaflet.css'; document.head.appendChild(l);
        var sc = document.createElement('script'); sc.src = base + 'leaflet.js'; sc.onload = function () { window.L ? res(window.L) : rej(); }; sc.onerror = rej; document.head.appendChild(sc);
      });
    };
    S.lp = load('https://unpkg.com/leaflet@1.9.4/dist/').catch(function () { return load('https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/'); });
    S.lp.catch(function () { S.lp = null; });
    return S.lp;
  }
  /* Координаты адреса: из файла, из памяти браузера или через OpenStreetMap (по одному запросу в секунду). */
  function geocode(p) {
    if (num(p.lat) !== null && num(p.lng) !== null) return Promise.resolve(p);
    var key = norm(p.address), G = {}; try { G = JSON.parse(ls('fdc-geo-v1') || '{}') || {}; } catch (e) { G = {}; }
    if (G[key]) { p.lat = G[key][0]; p.lng = G[key][1]; return Promise.resolve(p); }
    var wait = Math.max(0, (S.geoAt || 0) + 1100 - Date.now()); S.geoAt = Date.now() + wait;
    return new Promise(function (r) { setTimeout(r, wait); }).then(function () {
      return fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ru&accept-language=ru&q=' + encodeURIComponent(p.address));
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (j && j[0]) { p.lat = Number(j[0].lat); p.lng = Number(j[0].lon); G[key] = [p.lat, p.lng]; try { localStorage.setItem('fdc-geo-v1', JSON.stringify(G)); } catch (e) { /* пусто */ } }
      return p;
    }).catch(function () { return p; });
  }
  function drawMap(d, pts, box, ov) {
    if (!box) return;
    var fail = function (t) { box.innerHTML = '<div class="ms">' + t + '</div>'; };
    var had = pts.map(function (p) { return num(p.lat) !== null; });
    leaflet().then(function (L) {
      return pts.reduce(function (ch, p) { return ch.then(function () { return geocode(p); }); }, Promise.resolve()).then(function () {
        if (!document.body.contains(box)) return;
        var ok = pts.filter(function (p) { return num(p.lat) !== null; });
        if (!ok.length) return fail('Не нашёл адреса на карте — откройте их в Яндекс Картах');
        box.innerHTML = '';
        var m = L.map(box, { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd', attribution: '© OpenStreetMap, © CARTO' }).addTo(m);
        var mk = [];
        pts.forEach(function (p, j) {
          if (num(p.lat) === null) return;
          var k = L.marker([p.lat, p.lng], { icon: L.divIcon({ className: '', html: '<div class="mk">' + (j + 1) + '</div>', iconSize: [30, 30], iconAnchor: [15, 15] }) }).addTo(m)
            .bindPopup('<b>' + esc(p.name || '') + '</b><br>' + esc(p.address || ''));
          mk[j] = k;
        });
        var b = L.latLngBounds(ok.map(function (p) { return [p.lat, p.lng]; }));
        if (ok.length === 1) m.setView(b.getCenter(), 15); else m.fitBounds(b, { padding: [40, 40], maxZoom: 15 });
        setTimeout(function () { m.invalidateSize(); }, 60);
        $$('[data-pt]', ov).forEach(function (bt) {
          bt.onclick = function (e) { if (e.target.closest('a')) return; var j = Number(bt.getAttribute('data-pt')), k = mk[j]; if (!k) return; m.flyTo(k.getLatLng(), 16, { duration: RM ? 0 : .6 }); k.openPopup(); box.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' }); };
        });
        /* найденные координаты запоминаем в расчёте — на других устройствах карта откроется сразу */
        if (pts.some(function (p, j) { return !had[j] && num(p.lat) !== null; })) touch(d);
      });
    }).catch(function () { fail('Карта не загрузилась — проверьте интернет. Адреса можно открыть в Яндекс Картах.'); });
  }
  /* Прошедшие закупки убираются сами через 2 дня после окончания приёма заявок.
   * Не трогаем «Участвуем», «Заявка подана», «Выиграли» — их удаляют только руками. */
  var KEEP_ST = { go: 1, sent: 1, won: 1 };
  function purgeOld(quiet) {
    var gone = [];
    Object.keys(S.db).forEach(function (k) {
      var d = S.db[k], dl = deadline(d.deadline);
      if (!dl || dl.left > -2 * 864e5 || KEEP_ST[d.status]) return;
      delete S.db[k]; S.gone = S.gone || {}; S.gone[k] = 1; zipDrop(k); gone.push(k);
      if (connected() && S.sync !== 'off') api('cdel', { id: k }).catch(function () { /* пусто */ });
    });
    if (!gone.length) return 0;
    saveLocal();
    if (!quiet) toast('Убраны прошедшие закупки: ' + gone.length + ' (приём заявок закончился больше 2 дней назад)');
    if (S.cur && !S.db[S.cur]) go(''); else if (!S.cur) home(true);
    return gone.length;
  }
  function delDlg(d) {
    var s = sheet('<div class="hd"><div class="tx"><h2>Удалить расчёт?</h2><div class="mut sm" style="margin-top:4px">' + esc(d.title || d.number) + '</div></div><button class="ib" data-x>' + IC.x + '</button></div>' +
      '<div class="bd mut">Расчёт пропадёт ' + (connected() ? 'на всех устройствах и из таблицы' : 'из этого браузера') + '. Файл закупки можно будет загрузить заново.</div>' +
      '<div class="ft"><button class="btn gh" data-x>Отмена</button><button class="btn pri" data-ok style="background:var(--bad)">Удалить</button></div>');
    $('[data-ok]', s.el).onclick = function () {
      delete S.db[d.number]; S.gone = S.gone || {}; S.gone[d.number] = 1; saveLocal(); zipDrop(d.number);
      if (connected()) api('cdel', { id: d.number }).catch(function () { });
      s.close(); toast('Расчёт удалён'); go('');
    };
  }
  function exportFile(d) {
    var out = JSON.parse(JSON.stringify(d));
    var blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'contract-' + d.number + '.json'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500); toast('Файл скачан');
  }
  function tileDlg(t) {
    var d = S.db[S.cur], c = calc(d);
    if (t === 'cost') { S.filter = c.miss ? 'miss' : 'all'; lines(true); seg(); $('[data-lines]').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); return; }
    var top = c.lines.map(function (l, i) { return { l: l, it: d.items[i], i: i }; }).filter(function (x) { return x.l.pr !== null; }).sort(function (a, b) { return a.l.pr - b.l.pr; });
    var rowLink = function (x) { return '<button class="opt" data-go="' + x.i + '"><div class="on1">' + esc(x.it.name) + '</div><div class="op ' + (x.l.pr < 0 ? 'neg' : 'pos') + '">' + rub(x.l.pr) + '<small class="mut">' + fnum(x.l.m * 100, 1) + '%</small></div><div class="on2">' + qty(x.it.quantity) + ' ' + esc(x.it.unit) + ' · закупка ' + rubk(x.it.purchase_price) + ' · продажа ' + rubk(x.it.unit_price * c.k) + '</div></button>'; };
    var html = '<div class="hd"><div class="tx"><h2>' + (t === 'tax' ? 'Налог' : 'Как получилась прибыль') + '</h2><div class="mut sm" style="margin-top:4px">Снижение ' + fnum(d.cut, 1) + '%</div></div><button class="ib" data-x>' + IC.x + '</button></div><div class="bd">' +
      '<div class="brk"><span>Цена контракта' + (c.full ? '' : ' (по позициям с ценой)') + '</span><b>' + rub(c.full ? c.rev : c.kRev) + '</b>' +
      '<span>− Налог ' + fnum(c.tax * 100, 1) + '% с суммы контракта</span><b>' + rub((c.full ? c.rev : c.kRev) * c.tax) + '</b>' +
      '<span>− Закупка</span><b>' + rub(c.cost) + '</b><span>− Логистика</span><b>' + rub(c.log) + '</b>' +
      '<span class="s">= Прибыль</span><b class="s ' + (c.profit < 0 ? 'neg' : 'pos') + '">' + rub(c.profit) + '</b></div>' +
      (t === 'tax' ? '<p class="mut sm" style="margin-top:16px">Налог ' + fnum(c.tax * 100, 1) + '% берётся с полной суммы контракта. НДС не вычитается — он считается отдельно.</p>' : '') +
      (!c.full ? '<p class="mut sm" style="margin-top:16px">Нет закупочной цены у ' + c.miss + ' ' + plural(c.miss, 'позиции', 'позиций', 'позиций') + ' — они в прибыль не вошли.</p>' : '') +
      (t === 'profit' && top.length ? '<div class="lab">Хуже всего</div>' + top.slice(0, 4).map(rowLink).join('') + (top.length > 4 ? '<div class="lab">Лучше всего</div>' + top.slice(-3).reverse().map(rowLink).join('') : '') : '') +
      '</div>';
    var s = sheet(html);
    $$('[data-go]', s.el).forEach(function (b) { b.onclick = function () { s.close(); focusLine(Number(b.getAttribute('data-go'))); }; });
  }
  function focusLine(i) {
    if (S.filter !== 'all') { S.filter = 'all'; lines(false); seg(); }
    var r = $('.lr[data-i="' + i + '"]'); if (!r) return;
    r.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' });
    r.classList.add('flash'); setTimeout(function () { r.classList.remove('flash'); }, 1400);
  }
  function pickDlg(i) {
    var d = S.db[S.cur], it = d.items[i], c = calc(d), kind = '', q = '';
    if (!S.idx.length) {
      var s0 = sheet('<div class="hd"><div class="tx"><h2>' + esc(it.name) + '</h2></div><button class="ib" data-x>' + IC.x + '</button></div><div class="bd mut">' +
        (connected() ? (S.pst === 'load' ? 'Цены ещё загружаются…' : 'Цены с сайта документов не загрузились. Можно вписать цену вручную в поле строки.') :
          'Чтобы выбирать закупочные цены с сайта документов, подключите таблицу «Контракты ФД». Пока можно вписать цену вручную в поле строки.') + '</div>' +
        '<div class="ft"><button class="btn gh" data-x>Закрыть</button>' + (connected() ? '<button class="btn pri" data-r>Загрузить цены</button>' : '<button class="btn pri" data-c>Подключить</button>') + '</div>');
      var r0 = $('[data-r]', s0.el), c0 = $('[data-c]', s0.el);
      if (r0) r0.onclick = function () { s0.close(); loadPrices(true); };
      if (c0) c0.onclick = function () { s0.close(); setTimeout(pstDlg, 230); };
      return;
    }
    var remember = true;
    var s = sheet('<div class="hd"><div class="tx"><h2>' + esc(it.name) + '</h2><div class="mut sm" style="margin-top:4px">' + qty(it.quantity) + ' ' + esc(it.unit) + ' · продажа ' + rubk(it.unit_price * c.k) + ' за ' + esc(it.unit || 'ед.') + ' после снижения</div></div><button class="ib" data-x>' + IC.x + '</button></div>' +
      '<div class="bd fix"><label class="find" style="max-width:none;margin:0">' + IC.find + '<input class="inp" data-s placeholder="Поиск товара в моих ценах и прайсах поставщиков"></label>' +
      '<div class="tabs"><button data-k="" class="on">Все</button><button data-k="book">Мои цены</button><button data-k="own">Документы ФД</button><button data-k="vend">Поставщики</button></div></div>' +
      '<div class="bd res" data-res></div>' +
      '<div class="ft"><label class="chk"><input type="checkbox" data-rem checked>Запомнить для таких позиций</label>' +
      (it.purchase_price !== null ? '<button class="btn gh dang" data-clr>Убрать цену</button>' : '') + '<button class="btn sec" data-hand>Ввести вручную</button></div>');
    var si = $('[data-s]', s.el), res = $('[data-res]', s.el), kb = -1, found = [];
    var draw = function () {
      found = suggest(it, q, kind, 60); kb = -1;
      var sell = it.unit_price * c.k * (1 - c.tax);
      res.innerHTML = found.length ? (q ? '' : '<div class="lab" style="margin-top:0">Похожие по названию</div>') + found.map(function (x, j) {
        var cc = x.c, cv = cConv(cc, it), pr = sell - cv.p, cur = it.src && it.src.key === cc.key;
        var um = cv.bad;
        return '<button class="opt' + (cur ? ' cur' : '') + '" data-j="' + j + '" style="animation-delay:' + Math.min(j * 18, 250) + 'ms"><div class="on1">' + esc(cc.name) + (cc.kind === 'vend' && cc.product && norm(cc.product) !== norm(cc.name) ? ' <span class="mut" style="font-weight:500">→ ' + esc(cc.product) + '</span>' : '') + '</div>' +
          '<div class="op">' + rubk(cv.p) + (cv.how ? '<span class="pu"> / ' + esc(it.unit) + '</span>' : '') + '<small class="' + (pr < 0 ? 'neg' : 'pos') + '">' + (pr >= 0 ? '+' : '') + fnum(pr, 2) + ' ₽ с ' + esc(it.unit || 'ед.') + '</small></div>' +
          '<div class="on2">' + esc(cc.who) + (cc.date ? ' · ' + dRu(cc.date) : '') + (cv.how ? ' · ' + esc(cv.how) : cc.unit ? ' · за ' + esc(cc.unit) : '') + (um ? ' <span class="ul">· другая единица, в названии нет веса</span>' : '') + '</div></button>';
      }).join('') : '<div class="empty">' + (q ? 'Ничего не нашлось. Попробуйте одно слово, например «' + esc((stems(it.name)[0] || '').slice(0, 5)) + '».' : 'Похожих товаров нет — найдите поиском или впишите цену вручную.') + '</div>';
      $$('[data-j]', res).forEach(function (b) { b.onclick = function () { pick(found[Number(b.getAttribute('data-j'))].c); }; });
    };
    var pick = function (cc) {
      it.purchase_price = cConv(cc, it).p; it.src = srcOf(cc, false, it); delete it.noAuto;
      if (cc.kind === 'book' && remember && norm(cc.name) !== norm(it.name)) { bookSet(it, cc.price); it.src.key = 'b|' + bookKey(it); }
      if (remember) { S.map[mapKey(it, true)] = cc.key; S.map[mapKey(it, false)] = cc.key; try { localStorage.setItem(LS.map, JSON.stringify(S.map)); } catch (e) { /* пусто */ } }
      s.close(); touch(d); refreshLine(i, true);
    };
    var tm;
    si.oninput = function () { clearTimeout(tm); tm = setTimeout(function () { q = si.value.trim(); draw(); }, 120); };
    si.onkeydown = function (e) {
      var opts = $$('[data-j]', res);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); kb = Math.max(0, Math.min(opts.length - 1, kb + (e.key === 'ArrowDown' ? 1 : -1))); opts.forEach(function (o, j) { o.classList.toggle('kb', j === kb); }); if (opts[kb]) opts[kb].scrollIntoView({ block: 'nearest' }); }
      if (e.key === 'Enter' && found.length) { e.preventDefault(); pick(found[Math.max(0, kb)].c); }
    };
    $$('[data-k]', s.el).forEach(function (b) { b.onclick = function () { kind = b.getAttribute('data-k'); $$('[data-k]', s.el).forEach(function (x) { x.classList.toggle('on', x === b); }); draw(); }; });
    $('[data-rem]', s.el).onchange = function (e) { remember = e.target.checked; };
    var clr = $('[data-clr]', s.el); if (clr) clr.onclick = function () { it.purchase_price = null; delete it.src; it.noAuto = true; s.close(); touch(d); refreshLine(i); };
    $('[data-hand]', s.el).onclick = function () { s.close(); setTimeout(function () { var r = $('.lr[data-i="' + i + '"] [data-pp]'); if (r) { r.focus(); r.select(); } }, 240); };
    draw();
    if (window.innerWidth > 600) setTimeout(function () { si.focus(); }, 80);
  }
  function refreshLine(i, flash) {
    var d = S.db[S.cur], it = d.items[i], row = $('.lr[data-i="' + i + '"]');
    if (row) {
      var inp = $('[data-pp]', row); inp.value = moneyShow(it.purchase_price);
      if (flash) { inp.classList.remove('got'); void inp.offsetWidth; inp.classList.add('got'); }
      $('[data-src]', row).innerHTML = srcHtml(it); bindPick(row);
    }
    upd();
    if (S.filter !== 'all' && row && !lineVisible(it, calc(d).lines[i])) setTimeout(function () { lines(false); seg(); }, 450);
  }
  function pstDlg() {
    var fixed = /^https:\/\//.test(String(window.FDC_API || '').trim());
    var own = S.prices ? (S.prices.items || []).length : 0, ven = S.prices ? (S.prices.vend || []).length : 0;
    var info = S.pst === 'err' ? '<div class="errt" style="margin-top:0">' + esc(S.perr || 'Нет связи со скриптом') + '</div>' : S.pst === 'ok' ? '<div class="note info" style="margin-top:0">С сайта документов: ' + own + ' · у поставщиков: ' + ven + (S.prices && S.prices.at ? ' · обновлено ' + new Date(S.prices.at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '') + '</div>' +
      (S.perr ? '<div class="errt">Цены поставщиков: ' + esc(S.perr) + '</div>' : '') +
      (S.sync === 'off' ? '<div class="errt">Скрипт таблицы старый — расчёты пока хранятся только в этом браузере. Обновите Code.gs.</div>' : '') : '';
    var bks = Object.keys(S.book).filter(function (k) { return S.book[k] && S.book[k].price !== null && S.book[k].price !== undefined; })
      .sort(function (a, b) { return String(S.book[b].at).localeCompare(String(S.book[a].at)); });
    var bookHtml = '<div class="lab">Мои цены калькулятора · ' + bks.length + '</div>' +
      (bks.length ? '<div data-bkl>' + bks.map(function (k) { var b = S.book[k]; return '<div class="opt" style="grid-template-columns:minmax(0,1fr) auto auto;align-items:center"><div class="on1">' + esc(b.name) + '</div><div class="op">' + rubk(b.price) + '<small class="mut">за ' + esc(b.unit || 'ед.') + '</small></div><button class="ib" data-bkdel="' + esc(k) + '" title="Забыть эту цену">' + IC.x + '</button><div class="on2">запомнена ' + esc(dRu(b.date)) + '</div></div>'; }).join('') + '</div>'
        : '<div class="mut sm">Пока пусто. Впишите цену в строке товара — она запомнится и подставится в такие же позиции следующих закупок.</div>');
    var s = sheet('<div class="hd"><div class="tx"><h2>Закупочные цены</h2><div class="mut sm" style="margin-top:4px">Сначала — мои цены калькулятора (то, что вы вписывали руками). Если там нет — цены с сайта документов: склад, закупки, «Мой прайс», прайсы поставщиков.</div></div><button class="ib" data-x>' + IC.x + '</button></div>' +
      '<div class="bd">' + info +
      (connected() && S.pst === 'ok' ? '' :
        (fixed ? '' : '<label class="lab">Адрес скрипта таблицы «Контракты ФД»</label><input class="inp" data-api placeholder="https://script.google.com/macros/s/…/exec" value="' + esc(S.api) + '">') +
        '<label class="lab">Пароль</label><input class="inp" data-pw type="password" autocomplete="current-password" placeholder="Пароль из листа «Настройки»">' +
        '<div class="mut sm" style="margin-top:8px">Пароль запоминается на этом устройстве. Расчёты тоже будут сохраняться в таблицу — их видно на телефоне и компьютере.</div>') +
      '<div class="errt" data-e></div>' + bookHtml + '</div>' +
      '<div class="ft">' + (connected() ? '<button class="btn gh" data-out>Выйти</button><span class="sp" style="flex:1"></span><button class="btn sec" data-r>' + IC.ref + 'Обновить цены</button>' : '') +
      (connected() && S.pst === 'ok' ? '<button class="btn pri" data-x>Готово</button>' : '<button class="btn pri" data-ok>Подключить</button>') + '</div>');
    var r = $('[data-r]', s.el); if (r) r.onclick = function () { s.close(); loadPrices(true); };
    $$('[data-bkdel]', s.el).forEach(function (b) {
      b.onclick = function () {
        var k = b.getAttribute('data-bkdel'); bookDel(k);
        var row = b.closest('.opt'); row.style.transition = 'opacity .3s,transform .3s'; row.style.opacity = '0'; row.style.transform = 'translateX(16px)';
        setTimeout(function () { row.remove(); }, 300);
        Object.keys(S.db).forEach(function (id) { var dd = S.db[id], ch = 0; dd.items.forEach(function (it) { if (it.src && it.src.kind === 'book' && it.src.key === 'b|' + k) { it.purchase_price = null; delete it.src; ch++; } }); if (ch) { fill(dd); dd.updated = nowIso(); push(id); } });
        saveLocal(); soft(); toast('Цена забыта');
      };
    });
    var out = $('[data-out]', s.el); if (out) out.onclick = function () { S.pass = ''; ls(LS.pass, null); S.prices = null; S.idx = []; S.byKey = {}; ls(LS.prices, null); S.pst = 'off'; S.sync = 'local'; paintPst(); s.close(); toast('Вы вышли'); if (S.cur) view(S.cur, true); else home(true); };
    var ok = $('[data-ok]', s.el);
    if (ok) {
      var pw = $('[data-pw]', s.el); setTimeout(function () { (pw || ok).focus(); }, 80);
      var go2 = function () {
        var ai = $('[data-api]', s.el), e = $('[data-e]', s.el);
        if (ai) { var u = ai.value.trim(); if (!/^https:\/\/script\.google\.com\//.test(u)) { e.textContent = 'Адрес должен начинаться с https://script.google.com/'; return; } S.api = u; ls(LS.api, u); }
        if (!S.api) { e.textContent = 'Нет адреса скрипта'; return; }
        S.pass = pw.value.trim(); if (!S.pass) { e.textContent = 'Введите пароль'; return; }
        ok.disabled = true; ok.innerHTML = '<span class="ld"></span>Проверяю';
        api('prices').then(function () {
          ls(LS.pass, S.pass); s.close(); toast('Подключено'); loadPrices(); pull();
        }).catch(function (x) {
          ok.disabled = false; ok.textContent = 'Подключить'; if (x.message !== 'pass') { S.pass = ''; paintPst(); }
          e.textContent = x.message === 'pass' ? 'Пароль не подошёл' : /Неизвестная команда/.test(x.message) ? OLD_SCRIPT :
            /Failed to fetch|NetworkError|Load failed|JSON|Unexpected token/i.test(x.message) ? 'Не удалось связаться со скриптом. Проверьте адрес и интернет.' : 'Скрипт ответил ошибкой: ' + x.message;
        });
      };
      ok.onclick = go2; if (pw) pw.onkeydown = function (ev) { if (ev.key === 'Enter') go2(); };
    }
  }

  /* ───────── переходы ───────── */
  function go(id) {
    var h = id ? '#c=' + encodeURIComponent(id) : '#';
    if (location.hash === h || (!id && !location.hash)) { route(); return; }
    location.hash = h;
  }
  function route() {
    var m = location.hash.match(/^#c=(.+)$/), id = m ? decodeURIComponent(m[1]) : '';
    S.dir = id ? 1 : -1;
    if (location.hash === '#history') { S.page = 'hist'; S.cur = null; navSync(); histView(); window.scrollTo(0, 0); return; }
    S.page = id && S.db[id] ? 'c' : 'home'; navSync();
    if (id && S.db[id]) { view(id); window.scrollTo(0, 0); }
    else { var was = S.cur; home(); if (!was) window.scrollTo(0, 0); else setTimeout(function () { var c = $('[data-open="' + (window.CSS && window.CSS.escape ? window.CSS.escape(was) : was) + '"]'); if (c) c.scrollIntoView({ block: 'center' }); }, 0); }
  }

  /* ───────── запуск ───────── */
  function start() {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    if (!document.querySelector('link[data-fdc-font]')) {
      var pc = document.createElement('link'); pc.rel = 'preconnect'; pc.href = 'https://fonts.gstatic.com'; pc.crossOrigin = ''; document.head.appendChild(pc);
      var fl = document.createElement('link'); fl.rel = 'stylesheet'; fl.setAttribute('data-fdc-font', '1');
      fl.href = 'https://fonts.googleapis.com/css2?family=Onest:wght@400..800&display=swap';
      document.head.appendChild(fl);
    }
    var host = document.getElementById('fdc-root');
    if (!host) { host = document.createElement('div'); host.id = 'fdc-root'; document.body.appendChild(host); }
    host.innerHTML = '<div id="fdc"></div>'; S.root = host.firstChild;
    S.api = String(window.FDC_API || '').trim(); if (!/^https:\/\//.test(S.api)) S.api = ls(LS.api);
    /* старый адрес скрипта (Code.gs v1, другой проект) → новый (18.11.2026) */
    if (MOVED[S.api]) S.api = MOVED[S.api];
    S.pass = ls(LS.pass);
    try { S.db = JSON.parse(ls(LS.db) || '{}') || {}; } catch (e) { S.db = {}; }
    try { S.map = JSON.parse(ls(LS.map) || '{}') || {}; } catch (e) { S.map = {}; }
    /* расчёты из прошлого калькулятора (calculator.html) */
    try {
      var old = JSON.parse(ls(LS.old) || '{}') || {}, moved = 0;
      Object.keys(old).forEach(function (k) { if (!S.db[k]) { try { S.db[k] = normalize(old[k]); moved++; } catch (e) { /* пусто */ } } });
      if (moved) saveLocal();
    } catch (e) { /* пусто */ }
    try { S.book = JSON.parse(ls(LS.book) || '{}') || {}; } catch (e) { S.book = {}; }
    try { S.hist = JSON.parse(ls(LS.hist) || '[]') || []; } catch (e) { S.hist = []; }
    S.histClr = ls('fdc-hist-clr');
    try { var pc = JSON.parse(ls(LS.prices) || 'null'); if (pc && connected()) { S.prices = pc; S.pst = 'ok'; } } catch (e) { /* пусто */ }
    buildIdx();
    if (!connected()) S.pst = S.api ? 'pass' : 'off';
    shell(); route(); takeShare(); purgeOld();
    window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); S.bip = e; if (S.page === 'home') home(true); });
    window.addEventListener('hashchange', route);
    window.addEventListener('resize', function () { seg(true); });
    if (connected()) {
      var fresh = S.prices && Date.now() - (S.prices.at || 0) < 10 * 60e3;
      if (!fresh) loadPrices(); else paintPst();
      pull();
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden || !connected()) return;
      if (!S.prices || Date.now() - (S.prices.at || 0) > 10 * 60e3) loadPrices();
      pull();
    });
  }
  window.FDC = { ver: VER };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
