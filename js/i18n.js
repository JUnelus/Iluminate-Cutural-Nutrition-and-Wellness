/* English / Kreyòl language switch.
   - Page text: elements whose English text matches a key in window.ICN_I18N_HT.blocks
     get their inner HTML swapped (originals are kept so English can be restored).
   - Interactive tools render their own text through ICN.t({en, ht}) and re-render on
     the "icn:langchange" event.
   - The choice is remembered in localStorage and can be linked with ?lang=ht. */
(function () {
    'use strict';

    var STORAGE_KEY = 'icn-lang';
    var listeners = [];
    var matches = null;          // [{el, key}]
    var attrMatches = null;      // [{el, attr, en}]
    var original = new Map();    // el -> English innerHTML
    var current = initialLang();

    var TITLES = {
        en: document.title,
        ht: 'Dyetetisyen Kiltirèl pou Fanmi Karayib ak Afriken | Illuminate Cultural Nutrition'
    };

    function initialLang() {
        try {
            var param = new URLSearchParams(location.search).get('lang');
            if (param === 'ht' || param === 'en') return param;
        } catch (e) { /* old browser */ }
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved === 'ht' || saved === 'en') return saved;
        } catch (e) { /* storage blocked */ }
        return 'en';
    }

    function norm(text) { return text.replace(/\s+/g, ' ').trim(); }

    function skip(el) {
        return el.closest('script, style, noscript, svg, [data-icn-tool], .icn-langbar, .icn-wa');
    }

    function collect() {
        var dict = window.ICN_I18N_HT;
        matches = [];
        attrMatches = [];
        if (!dict) return;
        var found = [];
        var all = document.body.getElementsByTagName('*');
        for (var i = 0; i < all.length; i++) {
            var el = all[i];
            if (skip(el)) continue;
            var key = norm(el.textContent || '');
            if (key && Object.prototype.hasOwnProperty.call(dict.blocks, key)) found.push({ el: el, key: key });
        }
        // Keep the innermost element when a wrapper and its child carry the same text.
        matches = found.filter(function (m) {
            return !found.some(function (o) { return o !== m && m.el.contains(o.el); });
        });
        var withAttrs = document.body.querySelectorAll('[alt], [placeholder], [aria-label]');
        for (var j = 0; j < withAttrs.length; j++) {
            var node = withAttrs[j];
            if (skip(node)) continue;
            ['alt', 'placeholder', 'aria-label'].forEach(function (attr) {
                var v = node.getAttribute(attr);
                if (v && dict.attrs && Object.prototype.hasOwnProperty.call(dict.attrs, v)) {
                    attrMatches.push({ el: node, attr: attr, en: v });
                }
            });
        }
    }

    function applyPage(lang) {
        if (!matches) collect();
        var dict = window.ICN_I18N_HT;
        matches.forEach(function (m) {
            if (!original.has(m.el)) original.set(m.el, m.el.innerHTML);
            m.el.innerHTML = lang === 'ht' && dict ? dict.blocks[m.key] : original.get(m.el);
        });
        attrMatches.forEach(function (m) {
            m.el.setAttribute(m.attr, lang === 'ht' ? dict.attrs[m.en] : m.en);
        });
        document.documentElement.lang = lang === 'ht' ? 'ht' : 'en-US';
        document.title = TITLES[lang];
    }

    function updateSwitches() {
        document.querySelectorAll('[data-icn-lang]').forEach(function (btn) {
            btn.setAttribute('aria-pressed', btn.getAttribute('data-icn-lang') === current ? 'true' : 'false');
        });
        // The hero's "Nou pale Kreyòl" button becomes a way back to English.
        document.querySelectorAll('[data-icn-lang-toggle] .elementor-button-text').forEach(function (span) {
            span.textContent = current === 'ht' ? 'Read in English — Click here' : 'Nou pale Kreyòl — Klike la a';
        });
    }

    function set(lang, opts) {
        if (lang !== 'en' && lang !== 'ht') return;
        current = lang;
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage blocked */ }
        applyPage(lang);
        updateSwitches();
        listeners.forEach(function (fn) { try { fn(lang); } catch (e) { console.error(e); } });
        document.dispatchEvent(new CustomEvent('icn:langchange', { detail: { lang: lang } }));
        if (!(opts && opts.silent) && window.ICN.track) window.ICN.track('language_switch', { lang: lang });
    }

    function buildBar() {
        if (document.querySelector('.icn-langbar')) return;
        var bar = document.createElement('div');
        bar.className = 'icn-langbar';
        bar.innerHTML =
            '<span aria-hidden="true">Language / Lang:</span>' +
            '<div class="icn-lang" role="group" aria-label="Language">' +
            '<button type="button" data-icn-lang="en" lang="en">English</button>' +
            '<button type="button" data-icn-lang="ht" lang="ht">Kreyòl</button>' +
            '</div>';
        var page = document.getElementById('page') || document.body;
        page.insertBefore(bar, page.firstChild);
        bar.addEventListener('click', function (e) {
            var b = e.target.closest('[data-icn-lang]');
            if (b) set(b.getAttribute('data-icn-lang'));
        });
    }

    function hookHeroButton() {
        document.querySelectorAll('a.elementor-button').forEach(function (a) {
            var span = a.querySelector('.elementor-button-text');
            if (span && /Nou pale Krey/.test(span.textContent)) {
                a.setAttribute('data-icn-lang-toggle', '');
                a.setAttribute('href', '?lang=ht');
                a.addEventListener('click', function (e) {
                    e.preventDefault();
                    set(current === 'ht' ? 'en' : 'ht');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
        });
    }

    window.ICN = window.ICN || {};
    window.ICN.lang = function () { return current; };
    window.ICN.t = function (obj) { return obj == null ? '' : (typeof obj === 'string' ? obj : (obj[current] || obj.en || '')); };
    window.ICN.onLang = function (fn) { listeners.push(fn); };
    window.ICN.setLang = set;
    window.ICN.initLang = function () {
        buildBar();
        hookHeroButton();
        if (current === 'ht') set('ht', { silent: true }); else updateSwitches();
    };
})();
