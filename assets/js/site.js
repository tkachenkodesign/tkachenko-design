/* ═══════════════════════════════════════════════════════════════
   tkachenko.design — поведінка сторінки
   (вигляд — у css/style.css, це лише те, що рухається)
   ═══════════════════════════════════════════════════════════════ */

(function () {

    /* ── НАЛАШТУВАННЯ ── */

    // Як часто плашка «→ type.tkachenko.design» міняє кольори, у мілісекундах.
    var INTERVAL = 1000;

    // Кольори — чисті відтінки кола: у HSB випадковий лише H (відтінок),
    // а S (насиченість) і B (яскравість) завжди 100%.

    // Наскільки далеко на колі (у градусах) відтінок тексту має стояти
    // від відтінку фону — щоб вони не були майже однаковими.
    // 0 — обмеження немає, кольори повністю незалежні.
    var MIN_HUE_DISTANCE = 20;


    /* ── Галерея: ряди однакової висоти ──
       У ряду ширину кожної картинки задає її пропорція (flex-grow =
       ширина / висота) — тоді висоти в ряду однакові. Для картинок це
       вже вписує build.py (якщо стоїть Pillow). Для відео й картинок без
       розмірів пропорцію дізнаємось тут, щойно вона відома. */
    document.querySelectorAll('.gallery-row > img, .gallery-row > video').forEach(function (el) {
        if (el.style.flexGrow) return;
        function set() {
            var w = el.naturalWidth || el.videoWidth;
            var h = el.naturalHeight || el.videoHeight;
            if (w && h) el.style.flexGrow = w / h;
        }
        if (el.tagName === 'VIDEO') {
            if (el.readyState >= 1) set(); else el.addEventListener('loadedmetadata', set);
        } else {
            if (el.complete) set(); else el.addEventListener('load', set);
        }
    });


    /* ── Менше руху ──
       Якщо в системі ввімкнено «зменшити рух», відео не крутяться
       самі (зʼявляються кнопки), а плашка лишається чорно-білою. */
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
        document.querySelectorAll('video[autoplay]').forEach(function (v) {
            v.removeAttribute('autoplay');
            v.pause();
            v.controls = true;
        });
        return;
    }


    /* ── Плашка магазину: випадковий фон і випадковий текст ──
       Обидва кольори — чисті відтінки (S = B = 100%).
       Фон — будь-який відтінок кола з однаковою ймовірністю.
       Текст — будь-який відтінок, що стоїть від фону далі ніж на
       MIN_HUE_DISTANCE в обидва боки. Його беремо одразу з дозволеної
       дуги (360° мінус «заборонена» смужка навколо фону), тож перебирати
       пари не треба й кожен дозволений відтінок однаково ймовірний. */
    var tabs = document.querySelectorAll('.tab--link');
    if (!tabs.length) return;

    // HSB → RGB для S = 100% і B = 100%: лишається тільки відтінок (0–360°)
    function hue(h) {
        function f(n) {
            var k = (n + h / 60) % 6;
            return Math.round(255 * (1 - Math.max(0, Math.min(k, 4 - k, 1))));
        }
        return [f(5), f(3), f(1)];
    }

    function toCss(rgb) {
        return 'rgb(' + rgb.join(',') + ')';
    }

    function pickPair() {
        var bgHue = Math.random() * 360;
        var allowed = 360 - 2 * MIN_HUE_DISTANCE;               // ширина дозволеної дуги
        var fgHue = (bgHue + MIN_HUE_DISTANCE + Math.random() * allowed) % 360;
        return { bg: hue(bgHue), fg: hue(fgHue) };
    }

    function tick() {
        var pair = pickPair();
        tabs.forEach(function (tab) {
            tab.style.backgroundColor = toCss(pair.bg);
            tab.style.color = toCss(pair.fg);   // підкреслення бере цей самий колір
        });
    }

    tick();                          // перша пара — одразу, без секунди чорно-білого
    setInterval(tick, INTERVAL);

})();
