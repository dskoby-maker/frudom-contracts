/* «Контракты ФД» — страница frudom.ru/contracts. Один файл: оформление и вся логика. Данные — из скрипта таблицы «Контракты ФД». */
(function () {
  'use strict';
  var VER = 2;
  var LS = { api: 'fdc-api', pass: 'fdc-pass', filter: 'fdc-filter' };
  var S = { api: '', pass: '', rows: null, state: null, filter: 'new', q: '', open: null, cache: {}, timer: null, map: null, drop: 0 };

  /* ───────── оформление ───────── */
  var CSS = [
    '#fdc{--bg:#F4F6F4;--sf:#fff;--ink:#1C2220;--mut:#65706A;--line:#DCE2DE;--ac:#6A2C4E;--ac2:#8a3d67;--ok:#2F6B45;--okb:#E7F2EA;--warn:#9A5B00;--warnb:#FBF1DD;--err:#B3261E;--errb:#FBE9E7;--r:16px;',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:var(--ink);background:var(--bg);min-height:100vh;min-height:100dvh;-webkit-text-size-adjust:100%;font-size:15px;line-height:1.45;-webkit-font-smoothing:antialiased;text-align:left}',
    '#fdc *,#fdc *:before,#fdc *:after{box-sizing:border-box}',
    '#fdc button,#fdc input,#fdc textarea{font:inherit;color:inherit}',
    '#fdc button{cursor:pointer;border:0;background:none;padding:0;-webkit-tap-highlight-color:transparent}',
    '#fdc .w{max-width:1120px;margin:0 auto;padding:0 20px}',
    '#fdc .top{position:sticky;top:0;z-index:20;background:rgba(244,246,244,.86);backdrop-filter:saturate(1.4) blur(14px);-webkit-backdrop-filter:saturate(1.4) blur(14px);border-bottom:1px solid transparent;transition:border-color .3s}',
    '#fdc .top.sc{border-color:var(--line)}',
    '#fdc .top .w{display:flex;align-items:center;gap:12px;height:64px}',
    '#fdc .brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:18px;letter-spacing:-.01em}',
    '#fdc .mark{width:30px;height:30px;border-radius:9px;background:var(--ac);display:grid;place-items:center;color:#fff}',
    '#fdc .sp{flex:1}',
    '#fdc .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:40px;padding:0 16px;border-radius:12px;font-weight:600;font-size:14px;transition:transform .15s,background .2s,box-shadow .2s,opacity .2s;white-space:nowrap}',
    '#fdc .btn:active{transform:scale(.96)}',
    '#fdc .btn.pri{background:var(--ac);color:#fff}#fdc .btn.pri:hover{background:var(--ac2)}',
    '#fdc .btn.sec{background:var(--sf);box-shadow:inset 0 0 0 1px var(--line)}#fdc .btn.sec:hover{box-shadow:inset 0 0 0 1px #b9c2bc}',
    '#fdc .btn.ok{background:var(--ok);color:#fff}#fdc .btn.no{background:var(--sf);color:var(--err);box-shadow:inset 0 0 0 1px #e7c4c0}',
    '#fdc .btn.gh{color:var(--mut);padding:0 10px}#fdc .btn.gh:hover{color:var(--ink);background:rgba(0,0,0,.04)}',
    '#fdc .btn[disabled]{opacity:.5;pointer-events:none}',
    '#fdc .ib{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;color:var(--mut);transition:background .2s,color .2s,transform .15s}',
    '#fdc .ib:hover{background:rgba(0,0,0,.05);color:var(--ink)}#fdc .ib:active{transform:scale(.92)}',
    '#fdc .ib.spin svg{animation:fdc-spin .8s linear infinite}',
    '@keyframes fdc-spin{to{transform:rotate(360deg)}}',
    /* вход */
    '#fdc .gate{min-height:100vh;display:grid;place-items:center;padding:24px}',
    '#fdc .gate .box{width:100%;max-width:360px;background:var(--sf);border-radius:22px;padding:32px 28px;box-shadow:0 1px 2px rgba(0,0,0,.04),0 18px 50px -18px rgba(40,20,30,.22);animation:fdc-up .5s cubic-bezier(.2,.8,.2,1) both}',
    '#fdc .gate h1{font-size:22px;margin:16px 0 4px;letter-spacing:-.02em}#fdc .gate p{margin:0 0 20px;color:var(--mut)}',
    '#fdc .inp{width:100%;height:46px;border-radius:12px;border:1px solid var(--line);background:#fff;padding:0 14px;outline:0;transition:border-color .2s,box-shadow .2s}',
    '#fdc textarea.inp{height:auto;padding:12px 14px;resize:vertical;min-height:96px;line-height:1.45}',
    '#fdc .inp:focus{border-color:var(--ac);box-shadow:0 0 0 4px rgba(106,44,78,.12)}',
    '#fdc .gate .btn{width:100%;height:46px;margin-top:12px}',
    '#fdc .errt{color:var(--err);font-size:13px;margin-top:10px;min-height:18px}',
    '#fdc .shake{animation:fdc-shake .35s}',
    '@keyframes fdc-shake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}',
    /* список */
    '#fdc .bar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:18px 0 6px}',
    '#fdc .seg{display:inline-flex;background:#E7EBE8;border-radius:12px;padding:3px;position:relative}',
    '#fdc .seg button{position:relative;z-index:1;height:34px;padding:0 14px;border-radius:9px;font-weight:600;font-size:14px;color:var(--mut);transition:color .25s}',
    '#fdc .seg button.on{color:var(--ink)}#fdc .seg button b{font-weight:600;opacity:.55;margin-left:5px}',
    '#fdc .seg i{position:absolute;top:3px;bottom:3px;left:0;border-radius:9px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.1);transition:transform .35s cubic-bezier(.3,.9,.3,1),width .35s cubic-bezier(.3,.9,.3,1)}',
    '#fdc .find{flex:1;min-width:180px;max-width:320px;position:relative}#fdc .find .inp{height:40px;padding-left:38px;background:var(--sf)}',
    '#fdc .find svg{position:absolute;left:12px;top:11px;color:var(--mut)}',
    '#fdc .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;padding:14px 0 60px}',
    '#fdc .card{display:flex;flex-direction:column;text-align:left;background:var(--sf);border-radius:var(--r);padding:18px 18px 16px;box-shadow:0 1px 2px rgba(0,0,0,.04);border:1px solid rgba(0,0,0,.04);transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s;animation:fdc-up .5s cubic-bezier(.2,.8,.2,1) both;position:relative;overflow:hidden;width:100%}',
    '@media(hover:hover){#fdc .card:hover{transform:translateY(-3px);box-shadow:0 14px 34px -16px rgba(30,40,35,.28)}}',
    '#fdc .card:active{transform:scale(.98);transition-duration:.1s}',
    '#fdc .card.yes{box-shadow:inset 3px 0 0 var(--ok),0 1px 2px rgba(0,0,0,.04)}#fdc .card.nope{opacity:.62}',
    '@keyframes fdc-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}',
    '#fdc .ct:empty{display:none}#fdc .ct{display:flex;gap:6px;align-items:center;flex-wrap:wrap;min-height:24px;margin-bottom:10px}',
    '#fdc .pill{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 9px;border-radius:999px;font-size:12px;font-weight:600;background:#EEF1EF;color:#4c5751;white-space:nowrap}',
    '#fdc .pill.hot{background:var(--errb);color:var(--err)}#fdc .pill.soon{background:var(--warnb);color:var(--warn)}#fdc .pill.gone{background:#EEF1EF;color:#8b948f}',
    '#fdc .pill.red{background:var(--errb);color:var(--err)}#fdc .pill.yel{background:var(--warnb);color:var(--warn)}#fdc .pill.grn{background:var(--okb);color:var(--ok)}',
    '#fdc .pill.dec{background:var(--ok);color:#fff}#fdc .pill.decn{background:#8b948f;color:#fff}',
    '#fdc .dot{width:6px;height:6px;border-radius:50%;background:currentColor}',
    '#fdc .ttl{font-weight:650;font-size:16px;line-height:1.3;letter-spacing:-.005em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
    '#fdc .cust{color:var(--mut);font-size:13.5px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#fdc .sum{font-size:26px;font-weight:700;letter-spacing:-.02em;margin-top:14px;font-variant-numeric:tabular-nums}#fdc .sum i{font-style:normal;font-weight:500;color:var(--mut);font-size:.7em;margin-left:3px}',
    '#fdc .meta{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:12px;padding-top:12px;border-top:1px solid #EEF1EF;color:var(--mut);font-size:13px}',
    '#fdc .meta span{display:inline-flex;align-items:center;gap:5px}#fdc .meta .pos{color:var(--ok);font-weight:600}#fdc .meta .neg{color:var(--err);font-weight:600}',
    '#fdc .work{display:flex;align-items:center;gap:10px;margin-top:14px;color:var(--mut);font-size:13.5px}',
    '#fdc .ld{width:16px;height:16px;border-radius:50%;border:2px solid var(--line);border-top-color:var(--ac);animation:fdc-spin .8s linear infinite;flex:none}',
    '#fdc .sk{height:12px;border-radius:6px;background:linear-gradient(90deg,#EEF1EF 25%,#f7f9f8 37%,#EEF1EF 63%);background-size:400% 100%;animation:fdc-sh 1.4s ease infinite;margin-top:10px}',
    '@keyframes fdc-sh{0%{background-position:100% 50%}100%{background-position:0 50%}}',
    '#fdc .empty{text-align:center;padding:80px 20px;color:var(--mut);animation:fdc-up .5s both}#fdc .empty b{display:block;color:var(--ink);font-size:18px;margin-bottom:6px}',
    '#fdc .hint{background:var(--warnb);color:#6b4300;border-radius:12px;padding:12px 14px;font-size:13.5px;margin-top:14px}',
    /* карточка контракта */
    '#fdc .view{animation:fdc-in .42s cubic-bezier(.2,.8,.2,1) both}#fdc .view.back{animation-name:fdc-inb}',
    '@keyframes fdc-in{from{opacity:0;transform:translateX(26px)}to{opacity:1;transform:none}}',
    '@keyframes fdc-inb{from{opacity:0;transform:translateX(-26px)}to{opacity:1;transform:none}}',
    '#fdc .bk{display:inline-flex;align-items:center;gap:4px;height:40px;padding:0 12px 0 6px;border-radius:12px;font-weight:600;color:var(--ac);margin-left:-6px;transition:background .2s}#fdc .bk:hover{background:rgba(106,44,78,.08)}',
    '#fdc .hero{padding:22px 0 6px}#fdc .hero h1{font-size:28px;line-height:1.2;letter-spacing:-.02em;margin:10px 0 6px;font-weight:700}',
    '#fdc .hero .sub{color:var(--mut)}',
    '#fdc .verd{display:flex;gap:12px;align-items:flex-start;border-radius:var(--r);padding:16px 18px;margin-top:18px;font-size:15px}',
    '#fdc .verd b{display:block;margin-bottom:2px}#fdc .verd svg{flex:none;margin-top:1px}',
    '#fdc .verd.ok{background:var(--okb);color:#1f4a30}#fdc .verd.care{background:var(--warnb);color:#6b4300}#fdc .verd.bad{background:var(--errb);color:#7d1a14}',
    '#fdc .tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:16px}',
    '#fdc .tile{background:var(--sf);border-radius:var(--r);padding:16px;border:1px solid rgba(0,0,0,.04);animation:fdc-up .5s cubic-bezier(.2,.8,.2,1) both}',
    '#fdc .tile small{display:block;color:var(--mut);font-size:12.5px;margin-bottom:6px}#fdc .tile b{font-size:19px;font-weight:700;letter-spacing:-.01em;font-variant-numeric:tabular-nums;line-height:1.25;display:block}',
    '#fdc .tile em{font-style:normal;display:block;color:var(--mut);font-size:12.5px;margin-top:3px}',
    '#fdc .sec{background:var(--sf);border-radius:var(--r);padding:20px;margin-top:16px;border:1px solid rgba(0,0,0,.04);animation:fdc-up .55s cubic-bezier(.2,.8,.2,1) both}',
    '#fdc .sec h2{font-size:17px;margin:0 0 14px;letter-spacing:-.01em;display:flex;align-items:center;gap:8px}#fdc .sec h2 span{color:var(--mut);font-weight:500;font-size:14px}',
    '#fdc .flag{border-radius:12px;padding:14px 16px;margin-top:10px;border-left:4px solid;transition:background .2s}',
    '#fdc .flag.red{background:var(--errb);border-color:var(--err)}#fdc .flag.yellow{background:var(--warnb);border-color:#d39a2c}',
    '#fdc .flag b{display:block;margin-bottom:3px}#fdc .flag q{display:block;quotes:none;margin-top:8px;font-size:13px;color:rgba(0,0,0,.6);border-left:2px solid rgba(0,0,0,.15);padding-left:10px;font-style:italic}',
    '#fdc .flag cite{font-style:normal;font-size:12px;color:rgba(0,0,0,.45);display:block;margin-top:4px}',
    '#fdc .kv{display:grid;grid-template-columns:200px 1fr;gap:10px 16px}#fdc .kv dt{color:var(--mut)}#fdc .kv dd{margin:0}',
    '#fdc .mapw{display:grid;grid-template-columns:1fr 320px;gap:16px}',
    '#fdc .map{height:340px;border-radius:12px;overflow:hidden;background:#E7EBE8;position:relative;z-index:0}',
    '#fdc .map .nomap{position:absolute;inset:0;display:grid;place-items:center;color:var(--mut);font-size:13.5px;text-align:center;padding:20px}',
    '#fdc .pts{max-height:340px;overflow:auto;margin:0;padding:0;list-style:none}',
    '#fdc .pts li{display:flex;gap:10px;padding:10px;border-radius:10px;cursor:pointer;transition:background .2s}#fdc .pts li:hover,#fdc .pts li.on{background:#F1F4F2}',
    '#fdc .pts .n{flex:none;width:24px;height:24px;border-radius:50%;background:var(--ac);color:#fff;font-size:12px;font-weight:700;display:grid;place-items:center}',
    '#fdc .pts .n.off{background:#b9c2bc}#fdc .pts small{display:block;color:var(--mut);font-size:12.5px}#fdc .pts a{color:var(--ac);font-size:12.5px;text-decoration:none}',
    '#fdc .pin{width:28px;height:28px;border-radius:50% 50% 50% 2px;background:var(--ac);transform:rotate(-45deg);display:grid;place-items:center;box-shadow:0 3px 8px rgba(0,0,0,.3);border:2px solid #fff;animation:fdc-drop .5s cubic-bezier(.3,1.4,.5,1) both}',
    '#fdc .pin b{transform:rotate(45deg);color:#fff;font-size:12px;font-weight:700}',
    '@keyframes fdc-drop{from{opacity:0;transform:rotate(-45deg) translate(14px,-14px)}}',
    '#fdc .mon{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}',
    '#fdc .mon div{border-radius:12px;background:#F6F8F7;padding:14px}#fdc .mon small{display:block;color:var(--mut);font-size:12.5px;margin-bottom:4px}',
    '#fdc .mon b{font-size:19px;font-variant-numeric:tabular-nums;letter-spacing:-.01em}#fdc .mon .pf{background:var(--okb)}#fdc .mon .pf b{color:var(--ok)}#fdc .mon .pf.neg{background:var(--errb)}#fdc .mon .pf.neg b{color:var(--err)}',
    '#fdc .sl{margin-top:18px}#fdc .sl label{display:flex;justify-content:space-between;font-size:14px;margin-bottom:8px}#fdc .sl label b{font-variant-numeric:tabular-nums}',
    '#fdc input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;background:linear-gradient(90deg,var(--ac) var(--p,0%),#E1E6E3 var(--p,0%));outline:0}',
    '#fdc input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.3),0 0 0 1px rgba(0,0,0,.06);cursor:grab;transition:transform .15s}',
    '#fdc input[type=range]::-webkit-slider-thumb:active{transform:scale(1.15)}',
    '#fdc input[type=range]::-moz-range-thumb{width:22px;height:22px;border:0;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.3)}',
    '#fdc .note{color:var(--mut);font-size:13px;margin-top:12px}',
    '#fdc table{width:100%;border-collapse:collapse;font-size:14px}#fdc th{text-align:left;color:var(--mut);font-weight:500;font-size:12.5px;padding:0 10px 8px 0;border-bottom:1px solid var(--line);white-space:nowrap}',
    '#fdc td{padding:10px 10px 10px 0;border-bottom:1px solid #EEF1EF;vertical-align:top}#fdc td.r,#fdc th.r{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}#fdc td small{display:block;color:var(--mut);font-size:12.5px}',
    '#fdc td .pos{color:var(--ok);font-weight:600}#fdc td .neg{color:var(--err);font-weight:600}#fdc td .na{color:#a3aca7}',
    '#fdc .more{margin-top:12px}',
    '#fdc .req{margin:0;padding-left:18px}#fdc .req li{margin:4px 0}',
    '#fdc .links{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}',
    '#fdc .act{position:sticky;bottom:0;z-index:15;background:rgba(244,246,244,.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-top:1px solid var(--line);margin-top:24px}',
    '#fdc .act .w{display:flex;gap:10px;align-items:center;padding-top:12px;padding-bottom:12px}#fdc .act .btn{height:46px;padding:0 22px;font-size:15px}',
    '#fdc .act .st{color:var(--mut);font-size:13.5px}',
    /* окно и подсказка */
    '#fdc .ov{position:fixed;inset:0;z-index:50;background:rgba(20,26,23,.42);display:grid;place-items:center;padding:20px;animation:fdc-fade .25s both}',
    '#fdc .dlg{width:100%;max-width:480px;background:var(--sf);border-radius:22px;padding:24px;animation:fdc-pop .35s cubic-bezier(.2,.9,.3,1.1) both;max-height:90vh;overflow:auto}',
    '#fdc .dlg h3{margin:0 0 4px;font-size:19px}#fdc .dlg p{margin:0 0 16px;color:var(--mut);font-size:14px}',
    '#fdc .dz{margin-top:12px;border:1.5px dashed #c5cdc8;border-radius:12px;padding:18px;text-align:center;color:var(--mut);cursor:pointer;transition:border-color .2s,background .2s;font-size:14px}',
    '#fdc .dz:hover,#fdc .dz.on{border-color:var(--ac);background:rgba(106,44,78,.04);color:var(--ink)}#fdc .dz b{color:var(--ink)}',
    '#fdc .dlg .row{display:flex;gap:10px;justify-content:flex-end;margin-top:18px}',
    '@keyframes fdc-fade{from{opacity:0}}@keyframes fdc-pop{from{opacity:0;transform:translateY(16px) scale(.97)}}',
    '#fdc .toast{position:fixed;left:50%;bottom:28px;z-index:60;transform:translate(-50%,30px);opacity:0;background:#1C2220;color:#fff;padding:12px 18px;border-radius:12px;font-size:14px;transition:transform .35s cubic-bezier(.2,.9,.3,1.1),opacity .3s;pointer-events:none;max-width:90vw}',
    '#fdc .toast.on{transform:translate(-50%,0);opacity:1}',
    '@media(max-width:820px){#fdc .tiles,#fdc .mon{grid-template-columns:repeat(2,1fr)}#fdc .mapw{grid-template-columns:1fr}#fdc .pts{max-height:none}#fdc .kv{grid-template-columns:1fr;gap:2px 0}#fdc .kv dd{margin-bottom:10px}#fdc .hero h1{font-size:23px}}',
    '#fdc .tb{display:none}',
    '#fdc .grab{display:none}',
    '@media(max-width:560px){#fdc .w{padding:0 14px}#fdc{font-size:16px}#fdc .inp{font-size:16px;height:48px}#fdc .grid{grid-template-columns:1fr;gap:12px;padding-bottom:calc(40px + env(safe-area-inset-bottom))}',
    '#fdc .top .w{height:56px;gap:6px}#fdc .ib{width:44px;height:44px}#fdc .btn .lbl{display:none}#fdc .top [data-add]{width:44px;height:44px;padding:0;border-radius:50%}',
    '#fdc.det .brand,#fdc.det [data-add],#fdc.det [data-ref],#fdc.det [data-out],#fdc.det .sp{display:none}#fdc.det .tb{display:flex;align-items:center;min-width:0;flex:1;gap:2px}',
    '#fdc .tb .ib{color:var(--ac);margin-left:-10px;flex:none}#fdc .tb b{font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:0;transform:translateY(6px);transition:opacity .25s,transform .25s}#fdc .top.sc .tb b{opacity:1;transform:none}',
    '#fdc .hero{padding-top:8px}#fdc .hero .bk{display:none}#fdc .hero h1{font-size:22px;margin-top:8px}',
    '#fdc .bar{padding-top:12px;gap:10px}#fdc .find{max-width:none;flex-basis:100%}#fdc .seg{width:100%}#fdc .seg button{flex:1;padding:0 6px;height:38px}',
    '#fdc .card{padding:16px}#fdc .sum{font-size:24px}#fdc .tiles{gap:10px}#fdc .tile{padding:14px}#fdc .tile b{font-size:17px}#fdc .mon{gap:10px}#fdc .mon b{font-size:17px}',
    '#fdc .sec{padding:16px;margin-top:12px}#fdc .verd{padding:14px}#fdc .map{height:250px}#fdc .pts li{padding:10px 4px}',
    '#fdc table,#fdc tbody,#fdc tr,#fdc td{display:block}#fdc thead{display:none}#fdc tr{padding:12px 0;border-bottom:1px solid #EEF1EF;display:grid;grid-template-columns:1fr 1fr;gap:4px 12px}#fdc tr:last-child{border:0}',
    '#fdc td{border:0;padding:0}#fdc td:first-child{grid-column:1/-1;font-weight:600;margin-bottom:4px}#fdc td:first-child small{font-weight:400}#fdc td.r{text-align:left;white-space:normal;font-size:15px}#fdc td[data-l]:before{content:attr(data-l);display:block;color:var(--mut);font-size:12px}',
    '#fdc .more{width:100%}#fdc .links .btn{flex:1 1 46%}',
    '#fdc .act{padding-bottom:env(safe-area-inset-bottom)}#fdc .act .st{display:none}#fdc .act .btn{flex:1;height:50px;font-size:16px;border-radius:14px}',
    '#fdc .toast{bottom:calc(88px + env(safe-area-inset-bottom))}',
    '#fdc .ov{place-items:end center;padding:0}#fdc .dlg{max-width:none;border-radius:22px 22px 0 0;padding:10px 18px calc(18px + env(safe-area-inset-bottom));animation:fdc-sheet .38s cubic-bezier(.2,.9,.3,1) both;max-height:92dvh;overscroll-behavior:contain}',
    '#fdc .grab{display:block;width:38px;height:4px;border-radius:2px;background:#d3d9d5;margin:0 auto 14px}#fdc .dlg .row .btn{flex:1;height:50px;font-size:16px}',
    '#fdc .gate{align-items:start;padding-top:12vh}#fdc .gate .btn{height:50px;font-size:16px}}',
    '@keyframes fdc-sheet{from{transform:translateY(100%)}}',
    '#fdc .ov.bye{animation:fdc-fade .22s reverse both}#fdc .ov.bye .dlg{transition:transform .22s ease-in,opacity .22s;transform:translateY(40px);opacity:0}',
    '@media(pointer:coarse){#fdc input[type=range]{height:8px}#fdc input[type=range]::-webkit-slider-thumb{width:30px;height:30px}#fdc input[type=range]::-moz-range-thumb{width:30px;height:30px}#fdc .sl{padding:4px 4px 0}}',
    '#fdc .maphint{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);z-index:500;background:rgba(28,34,32,.82);color:#fff;font-size:12.5px;padding:6px 12px;border-radius:999px;pointer-events:none;transition:opacity .3s;white-space:nowrap}',
    '@media(prefers-reduced-motion:reduce){#fdc *{animation-duration:.01ms!important;transition-duration:.01ms!important}}'
  ].join('');

  var IC = {
    logo: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
    plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    ref: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5"/></svg>',
    out: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l4-4-4-4M14 12H4"/></svg>',
    find: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>',
    pin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    cal: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>',
    ok: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/></svg>',
    warn: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4M12 17v.5"/></svg>',
    ext: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5h5v5M19 5l-8 8M11 6H6a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-5"/></svg>'
  };

  /* ───────── мелочи ───────── */
  var root;
  function esc(s) { return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(sel, el) { return (el || root).querySelector(sel); }
  function $$(sel, el) { return Array.prototype.slice.call((el || root).querySelectorAll(sel)); }
  function money(n, dec) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    var f = dec ? (Math.round(n * 100) / 100).toFixed(2) : String(Math.round(n));
    var p = f.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return p.join(',');
  }
  function rub(n, dec) { return money(n, dec) + ' ₽'; }
  function qty(n) { return n === null || n === undefined ? '—' : String(Math.round(n * 1000) / 1000).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k) || ''; if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* без памяти тоже работает */ } return ''; }
  function plural(n, a, b, c) { var m = Math.abs(n) % 100, k = m % 10; return m > 10 && m < 20 ? c : k === 1 ? a : k > 1 && k < 5 ? b : c; }
  function toast(t) { var el = $('.toast'); if (!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove('on'); }, 2800); }

  function dl(s) {
    var m = String(s || '').match(/(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
    if (!m) return null;
    var d = new Date(m[1] + '-' + m[2] + '-' + m[3] + 'T' + (m[4] || '23') + ':' + (m[5] || '59') + ':00+03:00');
    var left = d.getTime() - Date.now(), days = Math.floor(left / 864e5);
    var o = { date: m[3] + '.' + m[2], full: m[3] + '.' + m[2] + '.' + m[1] + (m[4] ? ', ' + m[4] + ':' + m[5] : ''), time: m[4] ? m[4] + ':' + m[5] : '', left: left, cls: '', txt: '' };
    if (left < 0) { o.cls = 'gone'; o.txt = 'приём окончен'; }
    else if (days < 1) { o.cls = 'hot'; var h = Math.floor(left / 36e5); o.txt = h < 1 ? 'меньше часа' : 'осталось ' + h + ' ч'; }
    else { o.cls = days <= 2 ? 'hot' : days <= 5 ? 'soon' : ''; o.txt = 'осталось ' + days + ' ' + plural(days, 'день', 'дня', 'дней'); }
    return o;
  }

  function api(a, data) {
    var body = { a: a, pass: S.pass }; for (var k in (data || {})) body[k] = data[k];
    return fetch(S.api, { method: 'POST', body: JSON.stringify(body), redirect: 'follow' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok && j.err === 'pass') { S.pass = ''; ls(LS.pass, null); gate('Пароль не подошёл'); throw new Error('pass'); }
        if (!j.ok) throw new Error(j.err || 'Ошибка');
        return j;
      });
  }

  /* ───────── вход ───────── */
  function gate(err) {
    stop(); S.rows = null;
    var needApi = !S.api;
    root.innerHTML = '<div class="gate"><form class="box"><div class="mark" style="width:44px;height:44px;border-radius:13px">' + IC.logo.replace(/18/g, '24') + '</div>' +
      '<h1>Контракты</h1><p>' + (needApi ? 'Вставьте адрес скрипта таблицы «Контракты ФД» и пароль.' : 'Введите пароль, чтобы открыть список.') + '</p>' +
      (needApi ? '<input class="inp" name="api" placeholder="https://script.google.com/macros/s/…/exec" autocomplete="off" style="margin-bottom:10px">' : '') +
      '<input class="inp" name="pass" type="password" placeholder="Пароль" autocomplete="current-password">' +
      '<button class="btn pri" type="submit">Войти</button><div class="errt">' + esc(err || '') + '</div></form><div class="toast"></div></div>';
    var f = $('form');
    if (err) f.classList.add('shake');
    setTimeout(function () { var i = $(needApi ? '[name=api]' : '[name=pass]'); if (i) i.focus(); }, 50);
    f.onsubmit = function (e) {
      e.preventDefault();
      if (needApi) { var u = f.api.value.trim(); if (!/^https:\/\/script\.google\.com\//.test(u)) { $('.errt').textContent = 'Адрес должен начинаться с https://script.google.com/'; return; } S.api = u; ls(LS.api, u); }
      S.pass = f.pass.value.trim(); if (!S.pass) return;
      var b = $('button', f); b.disabled = true; b.textContent = 'Проверяю…';
      api('list').then(function (j) { ls(LS.pass, S.pass); S.rows = j.rows; S.state = j.state; shell(); route(); })
        .catch(function (x) { if (x.message !== 'pass') { b.disabled = false; b.textContent = 'Войти'; $('.errt').textContent = 'Не удалось связаться со скриптом. Проверьте адрес и интернет.'; } });
    };
  }

  /* ───────── каркас ───────── */
  function shell() {
    root.innerHTML = '<div class="top"><div class="w"><div class="tb"><button class="ib" data-tback aria-label="Назад">' + IC.back + '</button><b></b></div><div class="brand"><div class="mark">' + IC.logo + '</div>Контракты</div><div class="sp"></div>' +
      '<button class="btn pri" data-add>' + IC.plus + '<span class="lbl">Добавить</span></button>' +
      '<button class="ib" data-ref title="Обновить">' + IC.ref + '</button><button class="ib" data-out title="Выйти">' + IC.out + '</button></div></div>' +
      '<div id="fdc-main"></div><div class="toast"></div>';
    $('[data-add]').onclick = addDlg;
    $('[data-tback]').onclick = function () { location.hash = ''; };
    $('[data-ref]').onclick = function () { load(true); };
    $('[data-out]').onclick = function () { S.pass = ''; ls(LS.pass, null); location.hash = ''; gate(); };
    window.addEventListener('scroll', function () { var t = $('.top'); if (t) t.classList.toggle('sc', window.scrollY > 4); }, { passive: true });
  }

  function load(loud) {
    var b = $('[data-ref]'); if (b) b.classList.add('spin');
    return api('list').then(function (j) {
      var was = JSON.stringify(S.rows); S.rows = j.rows; S.state = j.state;
      if (b) b.classList.remove('spin');
      if (JSON.stringify(j.rows) !== was) { if (S.open) { var r = byId(S.open); if (r && (!S.cache[S.open] || S.cache[S.open].status !== r.status)) { delete S.cache[S.open]; detail(S.open, true); } } else list(true); }
      if (loud) toast('Обновлено');
      plan();
    }).catch(function (e) { if (b) b.classList.remove('spin'); if (loud && e.message !== 'pass') toast('Нет связи со скриптом'); });
  }
  function busy() { return (S.rows || []).some(function (r) { return r.status !== 'готов' && r.status !== 'ошибка'; }); }
  function plan() { stop(); S.timer = setTimeout(function () { if (document.hidden) plan(); else load(); }, busy() ? 15000 : 90000); }
  function stop() { clearTimeout(S.timer); }
  function byId(id) { return (S.rows || []).filter(function (r) { return r.id === id; })[0]; }

  function route() {
    var m = location.hash.match(/c=([^&]+)/), id = m ? decodeURIComponent(m[1]) : null;
    if (id && byId(id)) { if (!S.open) S.scroll = window.scrollY; detail(id); }
    else { var back = !!S.open; S.open = null; root.classList.remove('det'); list(); if (back) window.scrollTo(0, S.scroll || 0); }
    plan();
  }

  /* ───────── список ───────── */
  var FILTERS = [['new', 'Новые'], ['yes', 'Берём'], ['no', 'Отказ'], ['all', 'Все']];
  function inFilter(r, f) { return f === 'all' || (f === 'new' && !r.decision) || (f === 'yes' && r.decision === 'берём') || (f === 'no' && r.decision === 'отказ'); }

  function list(quiet) {
    var main = $('#fdc-main'); if (!main) return;
    var keep = quiet && $('.grid');
    var cnt = {}; FILTERS.forEach(function (f) { cnt[f[0]] = S.rows.filter(function (r) { return inFilter(r, f[0]); }).length; });
    var st = S.state || {}, hint = '';
    if (!st.ai) hint = 'В таблице «Контракты ФД» на листе «Настройки» не вставлен ключ ИИ — документы пока не разбираются.';
    else if (!st.bot) hint = 'Ключ бота Макс ещё не вставлен. Пока можно добавлять контракты кнопкой «Добавить».';
    if (!keep) {
      main.innerHTML = '<div class="w view' + (S.wasOpen ? ' back' : '') + '"><div class="bar"><div class="seg"><i></i>' +
        FILTERS.map(function (f) { return '<button data-f="' + f[0] + '">' + f[1] + '<b></b></button>'; }).join('') + '</div>' +
        '<div class="find">' + IC.find + '<input class="inp" placeholder="Поиск по названию и заказчику" value="' + esc(S.q) + '"></div></div>' +
        '<div class="hintw"></div><div class="grid"></div></div>';
      S.wasOpen = false;
      $$('.seg button').forEach(function (b) { b.onclick = function () { S.filter = b.getAttribute('data-f'); ls(LS.filter, S.filter); seg(); cards(); }; });
      $('.find input').oninput = function () { S.q = this.value; cards(true); };
    }
    $('.hintw').innerHTML = hint ? '<div class="hint">' + esc(hint) + '</div>' : '';
    $$('.seg button').forEach(function (b) { $('b', b).textContent = cnt[b.getAttribute('data-f')] || ''; });
    seg(); cards(keep);
  }
  function seg() {
    $$('.seg button').forEach(function (b) {
      var on = b.getAttribute('data-f') === S.filter; b.classList.toggle('on', on);
      if (on) { var i = $('.seg i'); i.style.width = b.offsetWidth + 'px'; i.style.transform = 'translateX(' + b.offsetLeft + 'px)'; }
    });
  }

  function cards(still) {
    var q = S.q.trim().toLowerCase();
    var rows = S.rows.filter(function (r) { return inFilter(r, S.filter) && (!q || (r.title + ' ' + (r.brief && r.brief.customer || '') + ' ' + r.id).toLowerCase().indexOf(q) >= 0); });
    var rank = function (r) { if (r.status !== 'готов') return -1; var d = dl(r.deadline); return !d ? 9e15 : d.left < 0 ? 8e15 - d.left : d.left; };
    rows.sort(function (a, b) { return rank(a) - rank(b); });
    var g = $('.grid');
    if (!rows.length) {
      g.innerHTML = '<div class="empty" style="grid-column:1/-1"><b>' + (q ? 'Ничего не нашлось' : S.filter === 'new' ? 'Новых контрактов нет' : 'Здесь пока пусто') + '</b>' +
        (q ? 'Попробуйте другое слово.' : 'Перешлите боту в Максе сообщение тендерщика с архивом — или нажмите «Добавить».') + '</div>';
      return;
    }
    g.innerHTML = rows.map(function (r, i) { return card(r, still ? -1 : i); }).join('');
    $$('.card', g).forEach(function (c) { c.onclick = function () { location.hash = 'c=' + encodeURIComponent(c.getAttribute('data-id')); }; });
  }

  function flagPill(b) {
    if (!b) return '';
    if (b.red) return '<span class="pill red"><span class="dot"></span>' + b.red + ' ' + plural(b.red, 'серьёзное', 'серьёзных', 'серьёзных') + '</span>';
    if (b.yellow) return '<span class="pill yel"><span class="dot"></span>' + b.yellow + ' ' + plural(b.yellow, 'замечание', 'замечания', 'замечаний') + '</span>';
    return '<span class="pill grn"><span class="dot"></span>без замечаний</span>';
  }

  function card(r, i) {
    var d = dl(r.deadline), b = r.brief, h = '<button class="card' + (r.decision === 'берём' ? ' yes' : r.decision === 'отказ' ? ' nope' : '') + '" data-id="' + esc(r.id) + '" style="animation-delay:' + (i < 0 ? '0s;animation:none' : Math.min(i, 12) * 45 + 'ms') + '">';
    h += '<div class="ct">';
    if (r.decision) h += '<span class="pill ' + (r.decision === 'берём' ? 'dec' : 'decn') + '">' + esc(r.decision === 'берём' ? 'Берём' : 'Отказ') + '</span>';
    if (d) h += '<span class="pill ' + d.cls + '">' + IC.cal + 'до ' + d.date + ' · ' + d.txt + '</span>';
    if (r.status === 'готов') h += flagPill(b);
    h += '</div><div class="ttl">' + esc(r.title || 'Закупка ' + r.id) + '</div>';
    if (b && b.customer) h += '<div class="cust">' + esc(b.customer + (b.city ? ' · ' + b.city : '')) + '</div>';
    h += '<div class="sum">' + (r.sum ? money(r.sum) + '<i>₽</i>' : '<span style="color:#a3aca7;font-size:18px;font-weight:500">сумма не указана</span>') + '</div>';
    if (r.status === 'готов' && b) {
      var m = [];
      if (b.term) m.push('<span>' + esc(b.term) + '</span>');
      if (b.points) m.push('<span>' + IC.pin + b.points + ' ' + plural(b.points, 'точка', 'точки', 'точек') + '</span>');
      if (b.profit !== null && b.profit !== undefined) m.push('<span class="' + (b.profit >= 0 ? 'pos' : 'neg') + '">прибыль ≈ ' + rub(b.profit) + (b.cover < 100 ? ' <span style="font-weight:400;color:var(--mut)">(' + b.cover + '% суммы)</span>' : '') + '</span>');
      if (m.length) h += '<div class="meta">' + m.join('') + '</div>';
    } else if (r.status === 'ошибка') {
      h += '<div class="work" style="color:var(--err)">' + esc(r.error || 'Не удалось разобрать') + '</div>';
    } else if (r.status === 'ждёт архив') {
      h += '<div class="work">Ждём архив с документами</div>';
    } else {
      h += '<div class="work"><span class="ld"></span>ИИ читает документы…</div><div class="sk" style="width:86%"></div><div class="sk" style="width:58%"></div>';
    }
    return h + '</button>';
  }

  /* ───────── карточка контракта ───────── */
  function detail(id, quiet) {
    S.open = id; S.wasOpen = true;
    var main = $('#fdc-main'), r = byId(id);
    root.classList.add('det'); var tb = $('.tb b'); if (tb) tb.textContent = r.title || 'Закупка';
    if (!quiet) { window.scrollTo(0, 0); main.innerHTML = '<div class="w view"><div class="hero"><button class="bk" data-back>' + IC.back + 'Назад</button><h1>' + esc(r.title || '') + '</h1><div class="sk" style="width:40%"></div><div class="sk" style="width:70%;margin-top:26px;height:80px;border-radius:16px"></div></div></div>'; bindBack(); }
    if (S.cache[id]) return paint(S.cache[id], quiet);
    api('get', { id: id }).then(function (j) { S.cache[id] = j.row; if (S.open === id) paint(j.row, quiet); })
      .catch(function (e) { if (e.message !== 'pass') toast(e.message); });
  }
  function bindBack() { var b = $('[data-back]'); if (b) b.onclick = function () { location.hash = ''; }; }

  function kv(pairs) {
    var h = pairs.filter(function (p) { return p[1]; }).map(function (p) { return '<dt>' + esc(p[0]) + '</dt><dd>' + esc(p[1]) + '</dd>'; }).join('');
    return h ? '<dl class="kv">' + h + '</dl>' : '';
  }

  function paint(r, quiet) {
    var main = $('#fdc-main'), D = r.data || {}, a = D.ai || {}, d = dl(r.deadline || a.deadline), M = D.money || {}, flags = a.flags || [], pts = D.points || [];
    var done = r.status === 'готов' && r.data;
    var h = '<div class="w' + (quiet ? '' : ' view') + '"><div class="hero"><button class="bk" data-back>' + IC.back + 'Назад</button>';
    h += '<div class="ct" style="margin:10px 0 0">';
    if (r.decision) h += '<span class="pill ' + (r.decision === 'берём' ? 'dec' : 'decn') + '">' + (r.decision === 'берём' ? 'Берём' : 'Отказ') + '</span>';
    [a.law, a.method, a.smp && /^да/i.test(a.smp) ? 'только для малого бизнеса' : ''].filter(String).forEach(function (t) { h += '<span class="pill">' + esc(t) + '</span>'; });
    h += '</div><h1>' + esc(r.title || 'Закупка ' + r.id) + '</h1>';
    var c = a.customer || {};
    if (c.short || c.name) h += '<div class="sub">' + esc((c.short || c.name) + (c.city ? ' · ' + c.city : '') + (c.inn ? ' · ИНН ' + c.inn : '')) + '</div>';
    h += '</div>';

    if (!done) {
      if (r.status === 'ошибка') h += '<div class="verd bad">' + IC.warn + '<div><b>Не удалось разобрать документы</b>' + esc(r.error || '') + '</div></div>';
      else if (r.status === 'ждёт архив') h += '<div class="verd care">' + IC.warn + '<div><b>Ждём архив с документами</b>Пришло только сообщение. Перешлите боту архив или добавьте его кнопкой «Добавить».</div></div>';
      else h += '<div class="sec"><div class="work" style="margin:0"><span class="ld"></span>ИИ читает документы. Обычно это занимает 1–3 минуты — страница обновится сама.</div><div class="sk" style="width:90%;margin-top:18px"></div><div class="sk" style="width:70%"></div><div class="sk" style="width:80%"></div></div>';
      h += '<div class="tiles"><div class="tile"><small>Сумма</small><b>' + (r.sum ? rub(r.sum) : '—') + '</b></div><div class="tile"><small>Подача заявок</small><b>' + (d ? 'до ' + d.date : '—') + '</b>' + (d ? '<em>' + d.txt + '</em>' : '') + '</div></div>';
    } else {
      var v = a.verdict || {}, vn = { ok: 'Можно участвовать', care: 'Можно, но осторожно', bad: 'Лучше пропустить' };
      if (v.level) h += '<div class="verd ' + esc(v.level) + '">' + (v.level === 'ok' ? IC.ok : IC.warn) + '<div><b>' + vn[v.level] + '</b>' + esc(v.text || '') + '</div></div>';

      var pay = a.payment || {}, term = a.term || {};
      h += '<div class="tiles">' +
        '<div class="tile" style="animation-delay:40ms"><small>Сумма контракта</small><b data-count="' + (r.sum || a.sum || 0) + '">' + rub(r.sum || a.sum) + '</b></div>' +
        '<div class="tile" style="animation-delay:90ms"><small>Подача заявок</small><b>' + (d ? 'до ' + d.date + (d.time ? ', ' + d.time : '') : '—') + '</b>' + (d ? '<em style="' + (d.cls === 'hot' ? 'color:var(--err)' : '') + '">' + d.txt + '</em>' : '') + '</div>' +
        '<div class="tile" style="animation-delay:140ms"><small>Срок контракта</small><b>' + esc(term.text || '—') + '</b>' + (term.to ? '<em>до ' + esc(term.to) + '</em>' : '') + '</div>' +
        '<div class="tile" style="animation-delay:190ms"><small>Оплата</small><b>' + esc(pay.text || '—') + '</b>' + (pay.advance ? '<em>' + esc(pay.advance) + '</em>' : '') + '</div></div>';

      if (a.summary) h += '<div class="sec" style="animation-delay:120ms"><h2>Коротко</h2>' + esc(a.summary) + '</div>';

      if (flags.length) {
        var red = flags.filter(function (f) { return f.level === 'red'; });
        h += '<div class="sec" style="animation-delay:160ms"><h2>Подводные камни <span>' + flags.length + '</span></h2>';
        red.concat(flags.filter(function (f) { return f.level !== 'red'; })).forEach(function (f) {
          h += '<div class="flag ' + (f.level === 'red' ? 'red' : 'yellow') + '"><b>' + esc(f.title) + '</b>' + esc(f.why) + (f.quote ? '<q>«' + esc(f.quote) + '»<cite>' + esc(f.doc || '') + '</cite></q>' : '') + '</div>';
        });
        h += '</div>';
      }

      var dv = a.delivery || {};
      var dk = kv([['Как часто', dv.freq], ['Срок по заявке', dv.lead], ['Партии', dv.batch], ['Срок годности', dv.shelf], ['Разгрузка и тара', dv.unload]]);
      if (dk) h += '<div class="sec" style="animation-delay:200ms"><h2>Поставка</h2>' + dk + '</div>';

      if (pts.length) {
        h += '<div class="sec" style="animation-delay:240ms"><h2>Куда везти <span>' + pts.length + ' ' + plural(pts.length, 'точка', 'точки', 'точек') + '</span></h2><div class="mapw"><div class="map"><div class="nomap">Загружаю карту…</div></div><ul class="pts">' +
          pts.map(function (p, i) {
            return '<li data-i="' + i + '"><span class="n' + (p.lat ? '' : ' off') + '">' + (i + 1) + '</span><div>' + (p.name ? '<b>' + esc(p.name) + '</b><br>' : '') + esc(p.address) +
              '<small>' + (p.lat ? '' : 'не нашлась на карте · ') + '<a target="_blank" rel="noopener" href="https://yandex.ru/maps/?text=' + encodeURIComponent(p.address) + '">открыть в Яндекс Картах</a></small></div></li>';
          }).join('') + '</ul></div></div>';
      }

      h += '<div class="sec" style="animation-delay:280ms"><h2>Деньги по вашим закупочным ценам</h2>';
      if (M.matched) {
        h += '<div class="mon"><div><small>Выручка</small><b data-m="rev"></b></div><div><small>Закупка</small><b data-m="cost"></b></div><div><small>Налог ' + esc(M.taxPct) + '%</small><b data-m="tax"></b></div><div class="pf"><small>Прибыль</small><b data-m="pf"></b></div></div>';
        h += '<div class="sl"><label><span>Если на торгах цена упадёт на</span><b data-m="dp">0%</b></label><input type="range" min="0" max="50" step="0.5" value="0"></div>';
        var nt = [];
        if (M.cover < 100) nt.push('Расчёт только по товарам, на которые есть ваша закупочная цена: ' + M.matched + ' из ' + M.all + ' (' + M.cover + '% суммы). Остальные нужно посчитать отдельно.');
        if (M.drop !== null && M.drop !== undefined) nt.push(M.drop > 0 ? 'В ноль выходите при снижении цены на ' + String(M.drop).replace('.', ',') + '%.' : 'По начальной цене контракт убыточный.');
        nt.push('Без доставки и прочих расходов.');
        h += '<div class="note">' + esc(nt.join(' ')) + '</div>';
      } else {
        h += '<div class="note" style="margin:0">' + esc(!D.costsN ? 'Закупочные цены не подключены: вставьте ссылку на таблицу «Документы ФД» в лист «Настройки».' : D.posErr ? 'Не удалось выписать товары из документов.' : 'Среди ваших закупочных цен не нашлось товаров из этой закупки.') + '</div>';
      }
      h += '</div>';

      if ((D.pos || []).length) {
        h += '<div class="sec" style="animation-delay:320ms"><h2>Товары <span>' + D.pos.length + (D.posMore ? '+' : '') + '</span></h2><div class="tbl"></div></div>';
      }

      var sc = a.security || {}, rq = a.requirements || [];
      var sk = kv([['Обеспечение заявки', sc.bid], ['Обеспечение контракта', sc.contract], ['Штрафы', sc.penalty], ['Площадка', a.platform], ['Торги / итоги', a.auction]]);
      if (sk || rq.length) h += '<div class="sec" style="animation-delay:360ms"><h2>Условия и требования</h2>' + sk + (rq.length ? '<ul class="req" style="margin-top:' + (sk ? 14 : 0) + 'px">' + rq.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') + '</div>';
    }

    h += '<div class="sec" style="animation-delay:400ms"><h2>Заметка</h2><textarea class="inp" data-note placeholder="Например: звонил заказчику, уточнил график">' + esc(r.note || '') + '</textarea><div class="links">' +
      (r.url ? '<a class="btn sec" target="_blank" rel="noopener" href="' + esc(/^https?:\/\//.test(r.url) ? r.url : '#') + '" style="text-decoration:none;color:inherit">Открыть закупку ' + IC.ext + '</a>' : '') +
      (r.archive ? '<a class="btn sec" target="_blank" rel="noopener" href="' + esc(r.archive) + '" style="text-decoration:none;color:inherit">Архив документов ' + IC.ext + '</a>' : '') +
      (r.hasFiles ? '<button class="btn gh" data-redo>Разобрать заново</button>' : '') + '<button class="btn gh" data-del>Удалить</button></div>';
    var foot = [];
    if (r.from) foot.push('Прислал(а): ' + r.from);
    if (D.files && D.files.length) foot.push('Прочитано документов: ' + D.files.length);
    if (D.cut && D.cut.length) foot.push('Частично: ' + D.cut.join('; '));
    if (D.unread && D.unread.length) foot.push('Не прочитаны: ' + D.unread.join('; '));
    if (foot.length) h += '<div class="note">' + esc(foot.join(' · ')) + '</div>';
    h += '</div></div>';

    h += '<div class="act"><div class="w"><button class="btn ok" data-dec="берём">' + (r.decision === 'берём' ? 'Берём ✓' : 'Берём') + '</button><button class="btn no" data-dec="отказ">' + (r.decision === 'отказ' ? 'Отказ ✓' : 'Отказ') + '</button><span class="st">' + (r.decision ? 'Нажмите ещё раз, чтобы снять решение' : 'Решение можно поменять в любой момент') + '</span></div></div>';

    main.innerHTML = h;
    bindBack();
    $$('[data-dec]').forEach(function (b) {
      b.onclick = function () {
        var v = b.getAttribute('data-dec'), nv = r.decision === v ? '' : v;
        b.disabled = true;
        api('decide', { id: r.id, decision: nv }).then(function () { r.decision = nv; var row = byId(r.id); if (row) row.decision = nv; toast(nv ? 'Сохранено: ' + nv : 'Решение снято'); try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) { } paint(r, true); }).catch(function (e) { b.disabled = false; if (e.message !== 'pass') toast(e.message); });
      };
    });
    var nt2 = $('[data-note]'), tm;
    nt2.oninput = function () { clearTimeout(tm); tm = setTimeout(function () { api('note', { id: r.id, note: nt2.value }).then(function () { r.note = nt2.value; toast('Заметка сохранена'); }).catch(function () { }); }, 900); };
    var rd = $('[data-redo]'); if (rd) rd.onclick = function () { rd.disabled = true; api('redo', { id: r.id }).then(function () { delete S.cache[r.id]; toast('Поставил в очередь'); load(); }).catch(function (e) { rd.disabled = false; toast(e.message); }); };
    $('[data-del]').onclick = function () {
      dialog('<h3>Удалить контракт?</h3><p>Карточка исчезнет из списка. Архив на Google Диске останется.</p><div class="row"><button class="btn sec" data-x>Отмена</button><button class="btn pri" data-y style="background:var(--err)">Удалить</button></div>', function (box, close) {
        $('[data-y]', box).onclick = function () { api('del', { id: r.id }).then(function () { close(); S.rows = S.rows.filter(function (x) { return x.id !== r.id; }); delete S.cache[r.id]; location.hash = ''; toast('Удалено'); }).catch(function (e) { toast(e.message); }); };
      });
    };
    if (done) {
      if (!quiet) $$('[data-count]').forEach(countUp);
      if (M.matched) moneyUI(M);
      if ((D.pos || []).length) posTable(D);
      if (pts.length) mapUI(pts);
    }
  }

  function countUp(el) {
    var to = Number(el.getAttribute('data-count')) || 0, t0 = performance.now();
    if (!to || (window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches)) return;
    (function step(t) { var k = Math.min(1, (t - t0) / 700), e = 1 - Math.pow(1 - k, 3); el.textContent = rub(to * e); if (k < 1) requestAnimationFrame(step); })(t0);
  }

  function moneyUI(M) {
    var sl = $('.sl input'), box = $('.mon .pf');
    function draw() {
      var d = Number(sl.value), rev = M.revM * (1 - d / 100), tax = rev * M.taxPct / 100, pf = rev - M.cost - tax;
      $('[data-m=rev]').textContent = rub(rev); $('[data-m=cost]').textContent = rub(M.cost); $('[data-m=tax]').textContent = rub(tax); $('[data-m=pf]').textContent = rub(pf);
      $('[data-m=dp]').textContent = String(d).replace('.', ',') + '%'; box.classList.toggle('neg', pf < 0);
      sl.style.setProperty('--p', d * 2 + '%');
    }
    sl.oninput = draw; draw();
  }

  function posTable(D) {
    var box = $('.tbl'), all = D.pos, lim = 12, open = false;
    function draw() {
      var rows = open ? all : all.slice(0, lim);
      box.innerHTML = '<table><thead><tr><th>Товар</th><th class="r">Количество</th><th class="r">Цена контракта</th><th class="r">Ваша закупка</th><th class="r">Разница</th></tr></thead><tbody>' +
        rows.map(function (p) {
          var has = p.mp !== undefined && p.mp !== null, mine = has ? p.mp * (p.k || 1) : null, diff = has && p.p !== null && p.q !== null ? (p.p - mine) * p.q : null;
          return '<tr><td>' + esc(p.n) + (p.ch ? '<small>' + esc(p.ch) + '</small>' : '') + (has ? '<small>ваш товар: ' + esc(p.mn) + '</small>' : '') + '</td>' +
            '<td class="r" data-l="Количество">' + qty(p.q) + ' ' + esc(p.u) + '</td><td class="r" data-l="Цена контракта">' + (p.p !== null ? rub(p.p, true) : '<span class="na">—</span>') + '</td>' +
            '<td class="r" data-l="Ваша закупка">' + (has ? rub(mine, true) : '<span class="na">нет цены</span>') + '</td>' +
            '<td class="r" data-l="Разница">' + (diff === null ? '<span class="na">—</span>' : '<span class="' + (diff >= 0 ? 'pos' : 'neg') + '">' + (diff >= 0 ? '+' : '−') + rub(Math.abs(diff)) + '</span>') + '</td></tr>';
        }).join('') + '</tbody></table>' +
        (all.length > lim ? '<button class="btn sec more">' + (open ? 'Свернуть' : 'Показать все ' + all.length) + '</button>' : '') +
        (D.posMore ? '<div class="note">Показаны не все товары — список слишком длинный. Полный смотрите в документах.</div>' : '');
      var b = $('.more', box); if (b) b.onclick = function () { open = !open; draw(); };
    }
    draw();
  }

  /* ───────── карта ───────── */
  var LEAF = ['https://unpkg.com/leaflet@1.9.4/dist/', 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/'];
  function leaflet(cb, n) {
    if (window.L && window.L.map) return cb(true);
    n = n || 0; if (n >= LEAF.length) return cb(false);
    var c = document.createElement('link'); c.rel = 'stylesheet'; c.href = LEAF[n] + 'leaflet.css'; document.head.appendChild(c);
    var s = document.createElement('script'); s.src = LEAF[n] + 'leaflet.js';
    s.onload = function () { cb(!!(window.L && window.L.map)); }; s.onerror = function () { leaflet(cb, n + 1); };
    document.head.appendChild(s);
  }
  function mapUI(pts) {
    var el = $('.map'), ok = pts.filter(function (p) { return p.lat; });
    $$('.pts li').forEach(function (li) { li.onclick = function (e) { if (e.target.tagName === 'A') return; focus(Number(li.getAttribute('data-i'))); }; });
    var marks = {}, map = null;
    function focus(i) {
      $$('.pts li').forEach(function (li) { li.classList.toggle('on', Number(li.getAttribute('data-i')) === i); });
      if (map && marks[i]) { map.flyTo(marks[i].getLatLng(), Math.max(map.getZoom(), 14), { duration: .8 }); marks[i].openPopup(); }
    }
    if (!ok.length) { $('.nomap', el).textContent = 'Адреса не нашлись на карте — откройте их по ссылкам справа.'; return; }
    leaflet(function (good) {
      if (!good || !document.body.contains(el)) { var nm = $('.nomap', el); if (nm) nm.textContent = 'Карта не загрузилась — откройте адреса по ссылкам справа.'; return; }
      el.innerHTML = '';
      try {
        var L = window.L;
        var touch = window.matchMedia && matchMedia('(pointer:coarse)').matches;
        map = L.map(el, { scrollWheelZoom: false, attributionControl: true, dragging: !touch });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
        var bb = [];
        pts.forEach(function (p, i) {
          if (!p.lat) return;
          var ic = L.divIcon({ className: '', html: '<div class="pin" style="animation-delay:' + Math.min(i, 20) * 60 + 'ms"><b>' + (i + 1) + '</b></div>', iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -26] });
          marks[i] = L.marker([p.lat, p.lng], { icon: ic }).addTo(map).bindPopup('<b>' + esc(p.name || 'Точка ' + (i + 1)) + '</b><br>' + esc(p.address));
          marks[i].on('click', function () { $$('.pts li').forEach(function (li) { li.classList.toggle('on', Number(li.getAttribute('data-i')) === i); }); });
          bb.push([p.lat, p.lng]);
        });
        if (bb.length === 1) map.setView(bb[0], 13); else map.fitBounds(bb, { padding: [36, 36] });
        var hint = null;
        if (touch) { hint = document.createElement('div'); hint.className = 'maphint'; hint.textContent = 'Нажмите на карту, чтобы двигать'; el.appendChild(hint); }
        el.addEventListener('click', function () { map.scrollWheelZoom.enable(); if (map.dragging) map.dragging.enable(); if (hint) hint.style.opacity = 0; });
      } catch (e) { el.innerHTML = '<div class="nomap">Карта не загрузилась — откройте адреса по ссылкам справа.</div>'; }
    });
  }

  /* ───────── окна ───────── */
  function dialog(html, init) {
    var ov = document.createElement('div'); ov.className = 'ov'; ov.innerHTML = '<div class="dlg"><div class="grab"></div>' + html + '</div>';
    root.appendChild(ov);
    var prevOv = document.documentElement.style.overflow; document.documentElement.style.overflow = 'hidden';
    function close() {
      if (ov.classList.contains('bye')) return;
      ov.classList.add('bye'); document.documentElement.style.overflow = prevOv; document.removeEventListener('keydown', key);
      setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 230);
    }
    function key(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', key);
    ov.onclick = function (e) { if (e.target === ov) close(); };
    $$('[data-x]', ov).forEach(function (b) { b.onclick = close; });
    init($('.dlg', ov), close);
  }

  function addDlg() {
    dialog('<h3>Добавить контракт</h3><p>Вставьте сообщение тендерщика и приложите архив с документами. Достаточно чего-то одного.</p>' +
      '<textarea class="inp" placeholder="Поставка продуктов питания&#10;до 20.11.2026 09:00&#10;1 332 285 руб.&#10;https://zakupki.gov.ru/…"></textarea>' +
      '<div class="dz"><b>Выбрать архив</b> или перетащить сюда<br><span>ZIP, а также PDF, Word, Excel</span></div><input type="file" accept=".zip,.pdf,.doc,.docx,.xls,.xlsx,.rtf" hidden>' +
      '<div class="errt"></div><div class="row"><button class="btn sec" data-x>Отмена</button><button class="btn pri" data-y>Добавить</button></div>', function (box, close) {
        var file = null, dz = $('.dz', box), inp = $('input[type=file]', box), err = $('.errt', box);
        function pick(f) { if (!f) return; if (f.size > 25e6) { err.textContent = 'Файл больше 25 МБ — такой не пройдёт.'; return; } file = f; dz.innerHTML = '<b>' + esc(f.name) + '</b><br><span>' + Math.round(f.size / 1024) + ' КБ · нажмите, чтобы заменить</span>'; err.textContent = ''; }
        dz.onclick = function () { inp.click(); }; inp.onchange = function () { pick(inp.files[0]); };
        dz.ondragover = function (e) { e.preventDefault(); dz.classList.add('on'); }; dz.ondragleave = function () { dz.classList.remove('on'); };
        dz.ondrop = function (e) { e.preventDefault(); dz.classList.remove('on'); pick(e.dataTransfer.files[0]); };
        $('[data-y]', box).onclick = function () {
          var text = $('textarea', box).value.trim(), b = this;
          if (!text && !file) { err.textContent = 'Вставьте сообщение или приложите архив.'; return; }
          b.disabled = true; b.textContent = 'Отправляю…';
          var send = function (b64) {
            api('add', { text: text, file: b64 || '', fileName: file ? file.name : '' }).then(function () { close(); toast(file ? 'Принято. ИИ уже читает документы' : 'Добавлено. Ждём архив'); S.filter = 'new'; load(); })
              .catch(function (e) { b.disabled = false; b.textContent = 'Добавить'; if (e.message !== 'pass') err.textContent = e.message; });
          };
          if (!file) return send();
          var fr = new FileReader(); fr.onload = function () { send(String(fr.result).split(',')[1]); }; fr.onerror = function () { b.disabled = false; b.textContent = 'Добавить'; err.textContent = 'Не удалось прочитать файл.'; }; fr.readAsDataURL(file);
        };
      });
  }

  /* ───────── запуск ───────── */
  function start() {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var host = document.getElementById('fdc-root');
    if (!host) { host = document.createElement('div'); host.id = 'fdc-root'; document.body.appendChild(host); }
    host.innerHTML = '<div id="fdc"></div>'; root = host.firstChild;
    S.api = String(window.FDC_API || '').trim(); if (!/^https:\/\//.test(S.api)) S.api = ls(LS.api);
    S.pass = ls(LS.pass); S.filter = ls(LS.filter) || 'new';
    window.addEventListener('hashchange', function () { if (S.rows) route(); });
    window.addEventListener('resize', function () { if (S.rows && !S.open && $('.seg')) seg(); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden && S.rows) load(); });
    if (!S.api || !S.pass) return gate();
    root.innerHTML = '<div class="gate"><span class="ld" style="width:28px;height:28px;border-width:3px"></span></div>';
    api('list').then(function (j) { S.rows = j.rows; S.state = j.state; shell(); route(); })
      .catch(function (e) { if (e.message !== 'pass') gate('Не удалось связаться со скриптом. Проверьте интернет и попробуйте ещё раз.'); });
  }
  window.FDC = { ver: VER };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
