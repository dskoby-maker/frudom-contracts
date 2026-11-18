/* «Контракты ФД» — калькулятор контрактов (frudom.ru/contracts и calculator.html).
 * Один файл без сборки: оформление + логика.
 * Файл закупки (frudom-contract-v1) делает ChatGPT/Claude, его загружают сюда. Закупочные цены — с сайта документов
 * (таблица «Документы ФД») через скрипт таблицы «Контракты ФД» (действие prices). Расчёты хранятся в браузере
 * и в листе «Калькулятор» той же таблицы (clist / cput / cdel), чтобы были одинаковыми на всех устройствах. */
(function () {
  'use strict';
  var VER = 13;
  var LS = { api: 'fdc-api', pass: 'fdc-pass', db: 'fdc-calc-v1', old: 'fdc-tenders-v1', prices: 'fdc-prices-v1', map: 'fdc-match-v1' };
  var S = {
    api: '', pass: '', db: {}, map: {}, prices: null, idx: [], pst: 'off', perr: '', sync: 'local',
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
    '#fdc .lr{display:grid;grid-template-columns:minmax(0,1fr) 104px 132px 210px 150px;gap:16px;align-items:center;padding:18px 22px;border-top:1px solid var(--line);transition:background .3s}',
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
    '@media(prefers-reduced-motion:reduce){#fdc *,#fdc *:before,#fdc *:after{animation-duration:.01ms!important;transition-duration:.01ms!important}}'
  ].join('\n');

  var IC = {
    logo: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>',
    up: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M7 9l5-5 5 5"/><path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"/></svg>',
    find: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    x: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    dl: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    del: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>',
    ref: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></svg>',
    wand: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="m4 20 10-10M14 4v3M19 9h-3M17 5l-2 2M18.5 14.5l-1.5-1.5"/></svg>',
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
  function toast(t) {
    var el = $('.toast'); if (!el) return;
    el.textContent = t; el.classList.add('on');
    clearTimeout(S.timers.toast); S.timers.toast = setTimeout(function () { el.classList.remove('on'); }, 2600);
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
        if (!d || !d.number) return; seen[d.number] = 1;
        var mine = S.db[d.number];
        if (!mine || String(d.updated || '') > String(mine.updated || '')) {
          if (!mine && S.gone && S.gone[d.number]) return;
          S.db[d.number] = d; changed++;
        }
      });
      Object.keys(S.db).forEach(function (id) { if (!seen[id]) push(id); });
      S.sync = 'cloud';
      if (changed) { saveLocal(); applyPrices(); if (S.cur && !S.db[S.cur]) go(''); else soft(); }
      paintPst();
    }).catch(function (e) { if (e.message === 'Неизвестная команда') S.sync = 'off'; paintPst(); });
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
      info: cleanInfo(d.info)
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
    files.forEach(function (f) {
      chain = chain.then(function () {
        if (f.size > 3e6) throw new Error('файл больше 3 МБ');
        return f.text();
      }).then(function (t) { done.push(importData(parseText(t))); })
        .catch(function (e) { errs.push(f.name + ': ' + e.message); });
    });
    chain.then(function () {
      if (errs.length) toast(errs[0]);
      if (done.length === 1) { toast(done[0].upd ? 'Расчёт обновлён' : 'Закупка добавлена'); go(done[0].d.number); }
      else if (done.length > 1) { toast('Добавлено закупок: ' + done.length); home(); }
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
    return { a: ha / A.length, b: hb / c.st.length, s: ha / A.length * 0.75 + hb / c.st.length * 0.25 + (c.kind === 'own' ? 0.03 : 0) };
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
    S.idx = idx; S.byKey = {}; idx.forEach(function (c) { S.byKey[c.key] = c; });
  }
  function better(x, y) {
    if (Math.abs(x.sc.s - y.sc.s) > 0.001) return x.sc.s > y.sc.s;
    if (x.c.kind !== y.c.kind) return x.c.kind === 'own';
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
  function srcOf(c, auto) { return { kind: c.kind, key: c.key, name: c.product && c.kind === 'vend' ? c.name : c.name, who: c.who, date: c.date, unit: c.unit, auto: !!auto }; }
  /* Подставляет цены, где их нет: сначала то, что я выбирал раньше, потом уверенное совпадение по названию.
   * Цены, взятые с сайта, обновляет до свежих. Возвращает число изменённых позиций. */
  function fill(d) {
    if (!S.idx.length) return 0;
    var n = 0, names = {};
    d.items.forEach(function (it) { var k = norm(it.name); names[k] = (names[k] || 0) + 1; });
    d.items.forEach(function (it) {
      if (it.src && (it.src.kind === 'own' || it.src.kind === 'vend') && S.byKey[it.src.key]) {
        var c = S.byKey[it.src.key];
        if (c.price !== it.purchase_price) { it.purchase_price = c.price; it.src.date = c.date; n++; }
        return;
      }
      if (it.purchase_price !== null || it.noAuto) return;
      var m = S.map[mapKey(it, true)] || (names[norm(it.name)] === 1 ? S.map[mapKey(it, false)] : null);
      if (m && S.byKey[m]) { var cm = S.byKey[m]; it.purchase_price = cm.price; it.src = srcOf(cm, false); n++; return; }
      var best = suggest(it, '', '', 1)[0];
      if (best && best.sc.a >= 0.99 && best.sc.b >= 0.5 && (!best.c.unit || !it.unit || unitN(best.c.unit) === unitN(it.unit))) { it.purchase_price = best.c.price; it.src = srcOf(best.c, true); n++; }
    });
    return n;
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
    if (!S.cur) return home(true);
    var a = document.activeElement, M = $('#fdc-main');
    if (a && M && M.contains(a) && /INPUT|TEXTAREA/.test(a.tagName)) { upd(); return; }
    var y = window.scrollY; view(S.cur, true); window.scrollTo(0, y);
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
          (j.items || []).forEach(function (it) { try { done.push(importData(parseText(it.text))); } catch (e) { errs.push(it.name + ': ' + e.message); } });
          if (done.length === 1) { toast(done[0].upd ? 'Расчёт обновлён' : 'Закупка добавлена'); go(done[0].d.number); }
          else if (done.length > 1) { toast('Добавлено закупок: ' + done.length); go(''); }
          else toast(errs[0] || 'В присланном нет данных закупки');
        });
      });
    }).catch(function () { /* пусто */ });
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
      '<button class="pst" data-pst><i class="dot"></i><span></span></button></div></div>' +
      '<div id="fdc-main"></div><div class="toast"></div><button class="fpill" data-fp></button><div class="dragov">Отпустите файл — добавлю закупку</div>';
    $('[data-fp]').onclick = function () { var t = S.fpGo; if (t) t(); };
    $('[data-home]').onclick = function (e) { e.preventDefault(); go(''); };
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
    t.textContent = S.pst === 'load' ? 'Загружаю цены…' : S.pst === 'ok' ? (narrow ? 'Цены: ' + (own + ven) : 'Цены: мои ' + own + (ven ? ' · поставщиков ' + ven : '')) :
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
  function fpSet(html, cls) { var fp = $('[data-fp]'); if (!fp) return; if (fp._h !== html) { fp._h = html; fp.innerHTML = html; } fp.className = 'fpill ' + (cls || '') + (fp.classList.contains('on') ? ' on' : ''); }

  /* ───────── главная ───────── */
  function list() {
    var q = norm(S.q);
    return Object.keys(S.db).map(function (k) { return S.db[k]; }).filter(function (d) {
      return !q || norm(d.title + ' ' + d.customer + ' ' + d.number).indexOf(q) >= 0;
    }).sort(function (a, b) {
      var x = deadline(a.deadline), y = deadline(b.deadline), xl = x ? x.left : 9e15, yl = y ? y.left : 9e15;
      if ((xl < 0) !== (yl < 0)) return xl < 0 ? 1 : -1;
      if (xl < 0) return yl - xl;
      return xl - yl || String(b.updated).localeCompare(String(a.updated));
    });
  }
  function cardHtml(d, i) {
    var c = calc(d), dl = deadline(d.deadline), share = d.items.length ? c.known / d.items.length : 0;
    return '<button class="card' + (dl && dl.cls === 'gone' ? ' gone' : '') + '" data-open="' + esc(d.number) + '" style="animation-delay:' + Math.min(i * 40, 400) + 'ms">' +
      '<div><div class="t">' + esc(d.title || 'Закупка ' + d.number) + '</div><div class="c">' + esc(d.customer || '№ ' + d.number) + '</div></div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap">' + (dl ? '<span class="pill ' + dl.cls + '" title="' + esc(dl.full) + '">' + esc(dl.txt) + '</span>' : '') +
      '<span class="pill">−' + fnum(d.cut || 0, 1) + '%</span></div>' +
      '<div class="nums"><div><small>НМЦК</small><b>' + rub(d.nmck) + '</b></div><div style="text-align:right"><small>' + (c.full ? 'Прибыль' : 'Цены: ' + c.known + ' из ' + d.items.length) + '</small>' +
      (c.full ? '<b class="' + (c.profit < 0 ? 'neg' : 'pos') + '">' + rub(c.profit) + '</b>' : '<b class="mut">—</b>') + '</div></div>' +
      '<div class="prog"><i style="width:' + Math.round(share * 100) + '%"></i></div></button>';
  }
  function home(quiet) {
    S.cur = null; var main = $('#fdc-main'); if (!main) return;
    var ids = list(), all = Object.keys(S.db).length;
    var html = '<div class="pg' + (quiet ? '' : S.dir < 0 ? ' back' : '') + '"' + (quiet ? ' style="animation:none"' : '') + '><div class="w">' +
      '<div class="drop" data-drop><div class="ic">' + IC.up + '</div><b>Загрузите файл закупки</b><div class="mut">Перетащите сюда файл .json от ChatGPT или Claude — откроется расчёт</div>' +
      '<div class="row"><button class="btn pri" data-pick>' + IC.up.replace('width="24" height="24"', 'width="17" height="17"') + 'Выбрать файл</button><button class="btn sec" data-paste>' + IC.paste + 'Вставить текст</button></div>' +
      appHint() +
      '<input type="file" accept=".json,application/json,.txt" multiple hidden data-file></div>' +
      (all ? '<div class="bar"><h2>Расчёты <span class="mut" style="font-weight:600">' + all + '</span></h2>' +
        (all > 4 ? '<label class="find">' + IC.find + '<input class="inp" data-q placeholder="Поиск по названию или заказчику" value="' + esc(S.q) + '"></label>' : '') + '</div>' +
        '<div class="grid" data-grid>' + (ids.length ? ids.map(cardHtml).join('') : '<div class="empty">Ничего не нашлось</div>') + '</div>' :
        '<div class="empty">Здесь появятся ваши расчёты.<br>Сохраняются на этом устройстве' + (connected() ? ' и в таблице «Контракты ФД»' : '') + '.</div>') +
      '</div></div>';
    main.innerHTML = html;
    if (quiet) $$('.card', main).forEach(function (c) { c.style.animation = 'none'; });
    var fi = $('[data-file]'), dz = $('[data-drop]');
    $('[data-pick]').onclick = function () { fi.click(); };
    fi.onchange = function () { readFiles(fi.files); fi.value = ''; };
    $('[data-paste]').onclick = pasteDlg;
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
    fpWatch(dz, IC.up.replace('width="24" height="24"', 'width="16" height="16"') + '<b>Загрузить файл закупки</b>', '', function () { fi.click(); });
  }
  function bindCards() { $$('[data-open]').forEach(function (b) { b.onclick = function () { go(b.getAttribute('data-open')); }; }); }

  /* ───────── расчёт контракта ───────── */
  function view(id, quiet) {
    var d = S.db[id]; if (!d) return go('');
    if (S.cur !== id) S.tz = {};
    S.cur = id;
    var main = $('#fdc-main'), dl = deadline(d.deadline), c = calc(d);
    var url = d.url || 'https://zakupki.gov.ru/epz/order/extendedsearch/results.html?searchString=' + encodeURIComponent(d.number);
    main.innerHTML = '<div class="pg' + (quiet ? '' : S.dir < 0 ? ' back' : '') + '"' + (quiet ? ' style="animation:none"' : '') + '><div class="w">' +
      '<button class="backl" data-back>' + IC.back + 'Все расчёты</button>' +
      '<div class="head"><div class="tx"><h1>' + esc(d.title || 'Закупка ' + d.number) + '</h1><div class="meta">' +
      (d.customer ? '<span>' + esc(d.customer) + '</span>' : '') + '<a class="lnk" href="' + esc(url) + '" target="_blank" rel="noopener">№ ' + esc(d.number) + '</a>' +
      (dl ? '<span class="pill ' + dl.cls + '" title="Подача до ' + esc(dl.full) + '">' + esc(dl.txt) + ' · до ' + esc(dl.full) + '</span>' : '') + '</div></div>' +
      '<button class="hbtn" data-info><i class="vd ' + esc(d.info && d.info.verdict && d.info.verdict.level || '') + '"></i>' + IC.info + 'Описание</button>' +
      '<button class="ib" data-exp title="Скачать файл с моими ценами">' + IC.dl + '</button><button class="ib" data-del title="Удалить расчёт">' + IC.del + '</button></div>' +
      '<section class="panel" style="' + (quiet ? 'animation:none' : '') + '">' +
      '<div class="cutrow"><span class="l">Снижение на торгах</span><label class="cutbox"><input data-cutn inputmode="decimal" value="' + fnum(d.cut || 0, 1) + '">%</label>' +
      '<div class="quick">' + [0, 5, 10, 15, 20, 25, 30].map(function (v) { return '<button data-q="' + v + '">' + v + '%</button>'; }).join('') + '</div></div>' +
      '<div class="rng"><div class="tr"></div><div class="be" data-be></div><input type="range" min="0" max="50" step="0.5" value="' + Math.min(50, d.cut || 0) + '" data-cut aria-label="Снижение"></div>' +
      '<div class="scale"><span>0%</span><span>10%</span><span>20%</span><span>30%</span><span>40%</span><span>50%</span></div>' +
      '<div class="bel" data-bel></div>' +
      '<div class="tiles">' +
      '<label class="tile edit" title="Можно вписать цену, по которой готовы подписать контракт"><small>Цена контракта</small><div class="tin"><input data-price inputmode="decimal"><span>₽</span></div><em data-k1></em></label>' +
      '<button class="tile" data-t="tax"><small data-taxl>Налог</small><b data-v="tax"></b><em>с суммы контракта</em></button>' +
      '<button class="tile" data-t="cost"><small>Закупка</small><b data-v="cost"></b><em data-k3></em></button>' +
      '<label class="tile edit"><small>Логистика</small><div class="tin"><input data-log inputmode="decimal" placeholder="0"><span>₽</span></div><em>доставка, водители</em></label>' +
      '<button class="tile big" data-t="profit"><small data-pl>Прибыль</small><b data-v="profit"></b><em data-v="margin"></em></button>' +
      '</div><div data-warn></div></section>' +
      '<div class="lhd"><h2>Позиции <span class="mut" style="font-weight:600">' + d.items.length + '</span></h2>' +
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
    $$('[data-t]').forEach(function (b) { b.onclick = function () { tileDlg(b.getAttribute('data-t')); }; });
    $$('[data-f]').forEach(function (b) { b.onclick = function () { S.filter = b.getAttribute('data-f'); lines(true); seg(); }; });
    S.filter = S.filter || 'all';
    lines(!quiet); upd(); seg(true);
    ticker();
    fpWatch($('.tiles', main), S.fpHtml || '', S.fpCls || '', function () { $('.panel').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); });
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
    var txt = s.kind === 'file' ? 'Из файла' : s.kind === 'hand' ? 'Вручную' : (s.auto ? 'Проверьте: ' : '') + s.name;
    var sub = s.kind === 'own' || s.kind === 'vend' ? s.who + (s.date ? ' · ' + dRu(s.date) : '') : '';
    var warn = s.unit && it.unit && unitN(s.unit) !== unitN(it.unit) ? ' title="Единица цены — «' + esc(s.unit) + '», в закупке — «' + esc(it.unit) + '»"' : ' title="' + esc(txt) + '"';
    return '<button class="src' + (s.auto ? ' auto' : '') + '" data-pick' + warn + '><i class="d"></i><div style="min-width:0"><span>' + esc(txt) + '</span>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div></button>' +
      (s.unit && it.unit && unitN(s.unit) !== unitN(it.unit) ? '<span class="ul">цена за «' + esc(s.unit) + '», нужна за «' + esc(it.unit) + '»</span>' : '');
  }
  function lines(anim) {
    var d = S.db[S.cur], box = $('[data-lines]'); if (!d || !box) return;
    var c = calc(d), rows = [], j = 0;
    d.items.forEach(function (it, i) {
      if (!lineVisible(it, c.lines[i])) return;
      rows.push('<div class="lr' + (anim ? ' in' : '') + '" data-i="' + i + '" style="' + (anim ? 'animation-delay:' + Math.min(j++ * 25, 350) + 'ms' : '') + '">' +
        '<div class="c1 nm">' + esc(it.name) + (it.note ? '<small>' + esc(it.note) + '</small>' : '') +
        (it.spec ? '<button class="tzb' + (S.tz[i] ? ' on' : '') + '" data-tz>Требования ТЗ ' + IC.down + '</button>' : '') + '</div>' +
        '<div class="c2"><span class="lb">Количество</span>' + qty(it.quantity) + ' ' + esc(it.unit) + '</div>' +
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
    var tb = $('[data-tz]', row);
    if (tb) tb.onclick = function () { S.tz[i] = !S.tz[i]; tb.classList.toggle('on', S.tz[i]); $('.tzw', row).classList.toggle('on', S.tz[i]); };
    inp.oninput = function () {
      var v = num(inp.value);
      it.purchase_price = v === null ? null : v;
      if (v === null) { delete it.src; it.noAuto = true; } else { it.src = { kind: 'hand' }; delete it.noAuto; }
      $('[data-src]', row).innerHTML = srcHtml(it); bindPick(row);
      upd(); touchSoon(d);
    };
    inp.onblur = function () { inp.value = moneyShow(it.purchase_price); if (S.filter !== 'all') { lines(false); seg(); } };
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
    var w = $('[data-warn]', M), wh = '';
    if (c.miss && S.idx.length) wh = '<div class="note"><span>Нет закупочной цены у ' + c.miss + ' ' + plural(c.miss, 'позиции', 'позиций', 'позиций') + '.</span><span class="sp"></span><button class="btn sec" data-showmiss style="height:34px">Показать</button></div>';
    else if (c.miss && !connected()) wh = '<div class="note info"><span>Подключите таблицу — закупочные цены с сайта документов подставятся сами.</span><span class="sp"></span><button class="btn sec" data-conn style="height:34px">Подключить</button></div>';
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
      $('[data-after]', row).textContent = d.cut ? '→ ' + rubk(it.unit_price * c.k) : '';
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
      (!d.info ? '<div class="note info" style="margin-top:18px">В файле этой закупки нет описания. Пришлите документы закупки в чат Claude — он сделает файл с описанием, подводными камнями и адресами.</div>' : '') +
      '</div>';
    var s = sheet(html); $('.sh', s.el).classList.add('wide');
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
  function delDlg(d) {
    var s = sheet('<div class="hd"><div class="tx"><h2>Удалить расчёт?</h2><div class="mut sm" style="margin-top:4px">' + esc(d.title || d.number) + '</div></div><button class="ib" data-x>' + IC.x + '</button></div>' +
      '<div class="bd mut">Расчёт пропадёт ' + (connected() ? 'на всех устройствах и из таблицы' : 'из этого браузера') + '. Файл закупки можно будет загрузить заново.</div>' +
      '<div class="ft"><button class="btn gh" data-x>Отмена</button><button class="btn pri" data-ok style="background:var(--bad)">Удалить</button></div>');
    $('[data-ok]', s.el).onclick = function () {
      delete S.db[d.number]; S.gone = S.gone || {}; S.gone[d.number] = 1; saveLocal();
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
      '<div class="bd" style="padding-bottom:6px"><label class="find" style="max-width:none;margin:0">' + IC.find + '<input class="inp" data-s placeholder="Поиск товара в моих ценах и прайсах поставщиков"></label>' +
      '<div class="tabs"><button data-k="" class="on">Все</button><button data-k="own">Мои цены</button><button data-k="vend">Поставщики</button></div></div>' +
      '<div class="bd" data-res style="min-height:200px"></div>' +
      '<div class="ft"><label class="chk"><input type="checkbox" data-rem checked>Запомнить для таких позиций</label>' +
      (it.purchase_price !== null ? '<button class="btn gh dang" data-clr>Убрать цену</button>' : '') + '<button class="btn sec" data-hand>Ввести вручную</button></div>');
    var si = $('[data-s]', s.el), res = $('[data-res]', s.el), kb = -1, found = [];
    var draw = function () {
      found = suggest(it, q, kind, 60); kb = -1;
      var sell = it.unit_price * c.k * (1 - c.tax);
      res.innerHTML = found.length ? (q ? '' : '<div class="lab" style="margin-top:0">Похожие по названию</div>') + found.map(function (x, j) {
        var cc = x.c, pr = sell - cc.price, cur = it.src && it.src.key === cc.key;
        var um = cc.unit && it.unit && unitN(cc.unit) !== unitN(it.unit);
        return '<button class="opt' + (cur ? ' cur' : '') + '" data-j="' + j + '" style="animation-delay:' + Math.min(j * 18, 250) + 'ms"><div class="on1">' + esc(cc.name) + (cc.kind === 'vend' && cc.product && norm(cc.product) !== norm(cc.name) ? ' <span class="mut" style="font-weight:500">→ ' + esc(cc.product) + '</span>' : '') + '</div>' +
          '<div class="op">' + rubk(cc.price) + '<small class="' + (pr < 0 ? 'neg' : 'pos') + '">' + (pr >= 0 ? '+' : '') + fnum(pr, 2) + ' ₽ с ' + esc(it.unit || 'ед.') + '</small></div>' +
          '<div class="on2">' + esc(cc.who) + (cc.date ? ' · ' + dRu(cc.date) : '') + (cc.unit ? ' · за ' + esc(cc.unit) : '') + (um ? ' <span class="ul">· другая единица</span>' : '') + '</div></button>';
      }).join('') : '<div class="empty">' + (q ? 'Ничего не нашлось. Попробуйте одно слово, например «' + esc((stems(it.name)[0] || '').slice(0, 5)) + '».' : 'Похожих товаров нет — найдите поиском или впишите цену вручную.') + '</div>';
      $$('[data-j]', res).forEach(function (b) { b.onclick = function () { pick(found[Number(b.getAttribute('data-j'))].c); }; });
    };
    var pick = function (cc) {
      it.purchase_price = cc.price; it.src = srcOf(cc, false); delete it.noAuto;
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
    var info = S.pst === 'err' ? '<div class="errt" style="margin-top:0">' + esc(S.perr || 'Нет связи со скриптом') + '</div>' : S.pst === 'ok' ? '<div class="note info" style="margin-top:0">Мои закупочные цены: <b>' + own + '</b> · цены поставщиков: <b>' + ven + '</b>' + (S.prices && S.prices.at ? ' · обновлено ' + new Date(S.prices.at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '') + '</div>' +
      (S.perr ? '<div class="errt">Цены поставщиков: ' + esc(S.perr) + '</div>' : '') +
      (S.sync === 'off' ? '<div class="errt">Скрипт таблицы старый — расчёты пока хранятся только в этом браузере. Обновите Code.gs.</div>' : '') : '';
    var s = sheet('<div class="hd"><div class="tx"><h2>Закупочные цены</h2><div class="mut sm" style="margin-top:4px">Берутся с сайта документов (таблица «Документы ФД»): склад, закупки, «Мой прайс» и прайсы поставщиков.</div></div><button class="ib" data-x>' + IC.x + '</button></div>' +
      '<div class="bd">' + info +
      (connected() && S.pst === 'ok' ? '' :
        (fixed ? '' : '<label class="lab">Адрес скрипта таблицы «Контракты ФД»</label><input class="inp" data-api placeholder="https://script.google.com/macros/s/…/exec" value="' + esc(S.api) + '">') +
        '<label class="lab">Пароль</label><input class="inp" data-pw type="password" autocomplete="current-password" placeholder="Пароль из листа «Настройки»">' +
        '<div class="mut sm" style="margin-top:8px">Пароль запоминается на этом устройстве. Расчёты тоже будут сохраняться в таблицу — их видно на телефоне и компьютере.</div>') +
      '<div class="errt" data-e></div></div>' +
      '<div class="ft">' + (connected() ? '<button class="btn gh" data-out>Выйти</button><span class="sp" style="flex:1"></span><button class="btn sec" data-r>' + IC.ref + 'Обновить цены</button>' : '') +
      (connected() && S.pst === 'ok' ? '<button class="btn pri" data-x>Готово</button>' : '<button class="btn pri" data-ok>Подключить</button>') + '</div>');
    var r = $('[data-r]', s.el); if (r) r.onclick = function () { s.close(); loadPrices(true); };
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
    try { var pc = JSON.parse(ls(LS.prices) || 'null'); if (pc && connected()) { S.prices = pc; buildIdx(); S.pst = 'ok'; } } catch (e) { /* пусто */ }
    if (!connected()) S.pst = S.api ? 'pass' : 'off';
    shell(); route(); takeShare();
    window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); S.bip = e; if (!S.cur) home(true); });
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
