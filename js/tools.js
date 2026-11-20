/* Interactive tools for Illuminate Cultural Nutrition:
   Build Your Caribbean Plate, the health-goal quiz, the insurance checker,
   the booking section and the WhatsApp button. All text is bilingual
   ({en, ht}) and re-renders when the visitor switches language. */
(function () {
    'use strict';

    var CFG = Object.assign({
        bookingUrl: 'https://my.practicebetter.io/#/628070ec2a53bd15316c52f2/bookings?s=6291995c3f42dbed50def316',
        whatsappNumber: '19102906479',
        phoneDisplay: '910-290-6479',
        phoneTel: '9102906479',
        email: 'info@iculturalnutrition.com',
        emailFormAction: ''
    }, window.ICN_CONFIG || {});

    var t = function (o) { return window.ICN.t(o); };
    var esc = function (s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    };
    window.ICN.track = window.ICN.track || function (name, data) {
        if (typeof window.gtag === 'function') window.gtag('event', name, data || {});
        if (typeof window.plausible === 'function') window.plausible(name, { props: data || {} });
    };

    /* Opens the Practice Better scheduler in a pop-up on larger screens
       (their site cannot be embedded in a frame), otherwise a new tab. */
    function openBooking(e, source) {
        window.ICN.track('booking_click', { source: source || 'tool' });
        if (window.innerWidth < 768) return; // let the link open normally
        // Open a blank pop-up first and cut its link back to this tab before loading the
        // scheduler, so the external page can't redirect the site (same as rel="noopener").
        var w = window.open('', '_blank', 'width=560,height=820');
        if (!w) return; // pop-up blocked: the link opens in a new tab instead
        e.preventDefault();
        try { w.opener = null; } catch (err) { /* ignore */ }
        w.location.href = CFG.bookingUrl;
    }
    function bookBtn(label, source, cls) {
        return '<a class="icn-btn ' + (cls || 'icn-btn--primary') + '" href="' + esc(CFG.bookingUrl) +
            '" target="_blank" rel="noopener" data-icn-book="' + esc(source) + '">' + esc(label) + '</a>';
    }
    document.addEventListener('click', function (e) {
        var a = e.target.closest('[data-icn-book]');
        if (a) openBooking(e, a.getAttribute('data-icn-book'));
    });

    /* Sends an email address and message to the configured email platform, or falls
       back to opening a pre-filled email to the practice when none is configured.
       Resolves 'sent' only when the platform confirms it (a 2xx response; the platform
       must allow CORS, as Formspree and similar form services do), otherwise 'error'. */
    function submitEmail(email, subject, body, fields) {
        if (CFG.emailFormAction) {
            var fd = new FormData();
            fd.append('email', email);
            fd.append('source', subject);
            fd.append('message', body);
            Object.keys(fields || {}).forEach(function (k) { fd.append(k, fields[k]); });
            return fetch(CFG.emailFormAction, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
                .then(function (res) { return res.ok ? 'sent' : 'error'; }, function () { return 'error'; });
        }
        location.href = 'mailto:' + CFG.email + '?subject=' + encodeURIComponent(subject) +
            '&body=' + encodeURIComponent(body + '\n\nEmail: ' + email);
        return Promise.resolve('mailto');
    }

    /* ======================================================================
       1. Build Your Caribbean Plate
       ====================================================================== */
    var ZONES = {
        veg: { en: 'Vegetables', ht: 'Legim', share: { en: 'about ½ the plate', ht: 'apeprè ½ asyèt la' } },
        protein: { en: 'Protein', ht: 'Pwoteyin', share: { en: 'about ¼', ht: 'apeprè ¼' } },
        starch: { en: 'Starch', ht: 'Lanmidon', share: { en: 'about ¼', ht: 'apeprè ¼' } }
    };
    var CATS = [
        { id: 'veg', label: { en: 'Vegetables', ht: 'Legim' } },
        { id: 'protein', label: { en: 'Protein', ht: 'Pwoteyin' } },
        { id: 'starch', label: { en: 'Starches', ht: 'Lanmidon' } },
        { id: 'extra', label: { en: 'Sides & drinks', ht: 'Akonpayman ak bwason' } }
    ];
    var FOODS = [
        { id: 'legim', cat: 'veg', name: { en: 'Legim (vegetable stew)', ht: 'Legim' },
          tip: { en: 'Legim is packed with eggplant, cabbage and spinach — a delicious way to fill half your plate.',
                 ht: 'Legim plen berejèn, chou ak zepina — yon bon fason pou ranpli mwatye asyèt ou.' } },
        { id: 'salad', cat: 'veg', name: { en: 'Cabbage & tomato salad', ht: 'Salad chou ak tomat' },
          tip: { en: 'Fresh and crunchy, it fills you up with very few calories.',
                 ht: 'Li fre e li kraze anba dan, li plen vant ou san anpil kalori.' } },
        { id: 'kalalou', cat: 'veg', name: { en: 'Okra (kalalou)', ht: 'Kalalou' },
          tip: { en: 'Okra’s fiber helps keep blood sugar steadier after a meal.',
                 ht: 'Fib ki nan kalalou ede kenbe sik nan san an pi estab apre ou fin manje.' } },
        { id: 'zepina', cat: 'veg', name: { en: 'Spinach / callaloo', ht: 'Zepina / kalalou fèy' },
          tip: { en: 'Leafy greens bring iron, folate and fiber. Add them to soups and sauces.',
                 ht: 'Fèy vèt yo bay fè, folat ak fib. Mete yo nan soup ak nan sòs.' } },
        { id: 'pwatann', cat: 'veg', name: { en: 'Green beans', ht: 'Pwa tann' },
          tip: { en: 'Sauté with garlic and epis for big flavor.',
                 ht: 'Sote yo ak lay ak epis pou bon gou.' } },
        { id: 'pikliz', cat: 'veg', name: { en: 'Pikliz', ht: 'Pikliz' },
          tip: { en: 'All the spicy flavor you love. Go easy if you watch your salt for blood pressure.',
                 ht: 'Tout gou pike ou renmen an. Pa mete twòp si w ap veye sèl pou tansyon.' } },
        { id: 'poul', cat: 'protein', name: { en: 'Stewed chicken (poul nan sòs)', ht: 'Poul nan sòs' },
          tip: { en: 'A lean choice. Removing the skin cuts saturated fat.',
                 ht: 'Yon bon chwa ki pa gra. Retire po a pou diminye grès.' } },
        { id: 'pwason', cat: 'protein', name: { en: 'Fish (pwason gwo sèl)', ht: 'Pwason gwo sèl' },
          tip: { en: 'Fish is heart-friendly. Steaming or grilling keeps it light.',
                 ht: 'Pwason bon pou kè a. Fè l bouyi oswa griye pou l rete lejè.' } },
        { id: 'griyo', cat: 'protein', name: { en: 'Griot (fried pork)', ht: 'Griyo' },
          tip: { en: 'Keep the flavor! Try baking or air-frying griot, and keep the portion about the size of your palm.',
                 ht: 'Kenbe gou a! Eseye kwit griyo nan fou oswa nan air fryer, epi kenbe pòsyon an gwosè pla men w.' } },
        { id: 'aranso', cat: 'protein', name: { en: 'Smoked herring (aransò)', ht: 'Aransò' },
          tip: { en: 'Big flavor, but salty. Soaking it first helps if you watch your blood pressure.',
                 ht: 'Anpil gou, men li sale. Tranpe l anvan si w ap veye tansyon w.' } },
        { id: 'kabrit', cat: 'protein', name: { en: 'Goat (kabrit)', ht: 'Kabrit' },
          tip: { en: 'Trim visible fat and enjoy it in a tomato-based sauce.',
                 ht: 'Retire grès ou wè yo epi manje l nan yon sòs tomat.' } },
        { id: 'pwa', cat: 'protein', name: { en: 'Beans / lentils (sòs pwa)', ht: 'Sòs pwa / lantiy' },
          tip: { en: 'Beans and lentils give you protein AND fiber — a double win.',
                 ht: 'Pwa ak lantiy ba ou pwoteyin AK fib — de fwa pi bon.' } },
        { id: 'ze', cat: 'protein', name: { en: 'Eggs', ht: 'Ze' },
          tip: { en: 'Quick, affordable protein. Boiled or scrambled with vegetables is a great start.',
                 ht: 'Pwoteyin rapid ki pa koute chè. Bouyi oswa bat ak legim se yon bon kòmansman.' } },
        { id: 'diriakpwa', cat: 'starch', name: { en: 'Rice & beans (diri ak pwa)', ht: 'Diri ak pwa' },
          tip: { en: 'Yes, you can keep your rice! The beans add fiber. Aim for about a quarter of the plate.',
                 ht: 'Wi, ou ka kenbe diri ou! Pwa yo ajoute fib. Vize apeprè yon ka asyèt la.' } },
        { id: 'diriblan', cat: 'starch', name: { en: 'White rice', ht: 'Diri blan' },
          tip: { en: 'Mixing in beans, or switching some to brown rice, adds fiber.',
                 ht: 'Melanje l ak pwa, oswa pran yon ti diri nwa, ajoute fib.' } },
        { id: 'bannannpeze', cat: 'starch', name: { en: 'Fried plantain (bannann peze)', ht: 'Bannann peze' },
          tip: { en: 'Delicious! Enjoy boiled or baked plantain more often than fried.',
                 ht: 'Bon gou anpil! Manje bannann bouyi oswa kwit nan fou pi souvan pase fri.' } },
        { id: 'bannannbouyi', cat: 'starch', name: { en: 'Boiled green plantain', ht: 'Bannann vèt bouyi' },
          tip: { en: 'Green plantain digests slowly, so it is gentler on blood sugar.',
                 ht: 'Bannann vèt dijere dousman, kidonk li pi dou pou sik nan san.' } },
        { id: 'mayi', cat: 'starch', name: { en: 'Cornmeal (mayi moulen)', ht: 'Mayi moulen' },
          tip: { en: 'Pairs perfectly with sòs pwa. Keep it to about a quarter of the plate.',
                 ht: 'Li mache byen ak sòs pwa. Kenbe l apeprè yon ka asyèt la.' } },
        { id: 'patat', cat: 'starch', name: { en: 'Sweet potato', ht: 'Patat dous' },
          tip: { en: 'Fiber and vitamin A — a great starch choice.',
                 ht: 'Fib ak vitamin A — yon bon chwa lanmidon.' } },
        { id: 'veritab', cat: 'starch', name: { en: 'Breadfruit (lam veritab)', ht: 'Lam veritab' },
          tip: { en: 'Filling and full of fiber. Boiled or roasted is best.',
                 ht: 'Li plen vant e li gen anpil fib. Bouyi oswa boukannen pi bon.' } },
        { id: 'foufou', cat: 'starch', name: { en: 'Fufu', ht: 'Foufou' },
          tip: { en: 'A smaller ball with extra soup vegetables keeps it balanced.',
                 ht: 'Yon ti boul pi piti ak plis legim nan soup la kenbe l balanse.' } },
        { id: 'zaboka', cat: 'extra', name: { en: 'Avocado (zaboka)', ht: 'Zaboka' },
          tip: { en: 'Healthy fat that keeps you full. A few slices on the side is perfect.',
                 ht: 'Bon grès ki kenbe vant ou plen. Kèk tranch sou kote a parfè.' } },
        { id: 'mango', cat: 'extra', name: { en: 'Fresh mango', ht: 'Mango fre' },
          tip: { en: 'Whole fruit beats juice, because the fiber is still there.',
                 ht: 'Fwi antye pi bon pase ji, paske fib la toujou la.' } },
        { id: 'ji', cat: 'extra', name: { en: 'Juice or soda', ht: 'Ji oswa kola' },
          tip: { en: 'Sweet drinks raise blood sugar fast. Try water with lime, or unsweetened tea.',
                 ht: 'Bwason sikre fè sik nan san monte vit. Eseye dlo ak sitwon, oswa te san sik.' } },
        { id: 'dlo', cat: 'extra', name: { en: 'Water with lime', ht: 'Dlo ak sitwon' },
          tip: { en: 'The best drink for every plate.',
                 ht: 'Pi bon bwason pou tout asyèt.' } }
    ];
    var FOOD = {};
    FOODS.forEach(function (f) { FOOD[f.id] = f; });

    var plate = { picked: [], cat: 'veg', lastTip: null };

    function readSharedPlate() {
        try {
            var p = new URLSearchParams(location.search).get('plate');
            // Keep every valid food from the link (duplicates dropped) so the recipient sees the same plate.
            if (p) plate.picked = p.split(',').filter(function (id, i, all) { return FOOD[id] && all.indexOf(id) === i; });
        } catch (e) { /* ignore */ }
    }

    function plateChecks() {
        var count = { veg: 0, protein: 0, starch: 0 };
        plate.picked.forEach(function (id) { if (count[FOOD[id].cat] !== undefined) count[FOOD[id].cat]++; });
        var checks = [];
        checks.push(count.veg ? { ok: true, text: { en: 'Vegetables cover about half the plate.', ht: 'Legim kouvri apeprè mwatye asyèt la.' } }
            : { ok: false, text: { en: 'Add vegetables — they should fill about half your plate.', ht: 'Ajoute legim — yo dwe ranpli apeprè mwatye asyèt ou.' } });
        checks.push(count.protein ? { ok: true, text: { en: 'Protein is on the plate (about a quarter).', ht: 'Gen pwoteyin sou asyèt la (apeprè yon ka).' } }
            : { ok: false, text: { en: 'Add a protein like chicken, fish or beans for about a quarter.', ht: 'Ajoute yon pwoteyin tankou poul, pwason oswa pwa pou apeprè yon ka.' } });
        if (!count.starch) checks.push({ ok: false, text: { en: 'Add your favorite starch — rice, plantain and cornmeal are welcome here!', ht: 'Ajoute lanmidon ou pi renmen an — diri, bannann ak mayi moulen akeyi isit la!' } });
        else if (count.starch > 1) checks.push({ ok: true, warn: true, text: { en: 'You picked ' + count.starch + ' starches. Enjoy them, but keep them together to about a quarter of the plate.', ht: 'Ou chwazi ' + count.starch + ' lanmidon. Manje yo, men kenbe yo ansanm apeprè yon ka asyèt la.' } });
        else checks.push({ ok: true, text: { en: 'Your starch fits in about a quarter of the plate.', ht: 'Lanmidon ou an antre nan apeprè yon ka asyèt la.' } });
        var balanced = count.veg && count.protein && count.starch;
        return { checks: checks, balanced: balanced, count: count };
    }

    function renderPlate() {
        var root = document.getElementById('plate-builder');
        if (!root) return;
        var status = plateChecks();
        var zoneHtml = function (z) {
            var items = plate.picked.filter(function (id) { return FOOD[id].cat === z; });
            return '<div class="icn-zone icn-zone--' + z + (items.length ? '' : ' is-empty') + '">' +
                '<div class="icn-zone-label">' + esc(t(ZONES[z])) + '<small>' + esc(t(ZONES[z].share)) + '</small></div>' +
                items.map(function (id) { return '<span class="icn-on-plate">' + esc(t(FOOD[id].name)) + '</span>'; }).join('') +
                '</div>';
        };
        var sides = plate.picked.filter(function (id) { return FOOD[id].cat === 'extra'; });
        var foods = FOODS.filter(function (f) { return f.cat === plate.cat; });
        var tip = plate.lastTip ? FOOD[plate.lastTip] : null;
        var verdict = status.balanced
            ? t({ en: 'Beautiful, balanced plate — and it is still your food!', ht: 'Bèl asyèt balanse — e se toujou manje pa w!' })
            : t({ en: 'Keep going: tap foods on the right to build your plate.', ht: 'Kontinye: peze sou manje yo pou bati asyèt ou.' });

        root.innerHTML =
            '<div class="icn-wrap">' +
            '<div class="icn-center"><span class="icn-eyebrow">' + esc(t({ en: 'Interactive tool', ht: 'Zouti entèaktif' })) + '</span>' +
            '<h2>' + esc(t({ en: 'Build Your Caribbean Plate', ht: 'Bati Asyèt Karayibeyen Ou' })) + '</h2>' +
            '<p class="icn-lead">' + esc(t({ en: 'Tap the foods you love. No food is off-limits — we will show you how to balance your plate so it works for your health.',
                ht: 'Peze sou manje ou renmen yo. Pa gen manje ki entèdi — n ap montre w kijan pou balanse asyèt ou pou l bon pou sante w.' })) + '</p></div>' +
            '<div class="icn-plate-grid">' +
            '<div class="icn-plate-col">' +
            '<div class="icn-plate" role="group" aria-label="' + esc(t({ en: 'Your plate', ht: 'Asyèt ou' })) + '">' + zoneHtml('veg') + zoneHtml('protein') + zoneHtml('starch') + '</div>' +
            '<div class="icn-side">' + (sides.length ? '<span class="icn-side-label">' + esc(t({ en: 'On the side', ht: 'Sou kote' })) + '</span>' : '') +
            sides.map(function (id) { return '<span class="icn-on-plate">' + esc(t(FOOD[id].name)) + '</span>'; }).join('') + '</div>' +
            '<div class="icn-meter" aria-live="polite">' + status.checks.map(function (c) {
                return '<div class="icn-check ' + (c.warn ? 'is-warn' : c.ok ? 'is-ok' : '') + '"><span class="icn-check-dot" aria-hidden="true">' +
                    (c.warn ? '!' : c.ok ? '✓' : '') + '</span><span>' + esc(t(c.text)) + '</span></div>';
            }).join('') + '</div>' +
            '<div class="icn-verdict">' + esc(verdict) + '</div>' +
            '</div>' +
            '<div>' +
            '<div class="icn-cats" role="tablist" aria-label="' + esc(t({ en: 'Food groups', ht: 'Gwoup manje' })) + '">' + CATS.map(function (c) {
                return '<button type="button" class="icn-cat" role="tab" aria-selected="' + (plate.cat === c.id) + '" data-cat="' + c.id + '">' + esc(t(c.label)) + '</button>';
            }).join('') + '</div>' +
            '<div class="icn-foods" role="tabpanel">' + foods.map(function (f) {
                var on = plate.picked.indexOf(f.id) > -1;
                return '<button type="button" class="icn-chip" aria-pressed="' + on + '" data-food="' + f.id + '"><span class="icn-chip-dot icn-chip-dot--' + f.cat + '" aria-hidden="true"></span>' + esc(t(f.name)) + '</button>';
            }).join('') + '</div>' +
            '<div class="icn-tip" aria-live="polite">' + (tip
                ? '<strong>' + esc(t(tip.name)) + ':</strong> ' + esc(t(tip.tip))
                : esc(t({ en: 'Tip: start with vegetables, then add a protein and your favorite starch.', ht: 'Konsèy: kòmanse ak legim, apre sa ajoute yon pwoteyin ak lanmidon ou pi renmen an.' }))) + '</div>' +
            '<div class="icn-btn-row">' +
            bookBtn(t({ en: 'Get a plan made for you', ht: 'Jwenn yon plan pou ou menm' }), 'plate') +
            '<button type="button" class="icn-btn icn-btn--ghost" data-plate-share>' + esc(t({ en: 'Share my plate', ht: 'Pataje asyèt mwen' })) + '</button>' +
            '<button type="button" class="icn-btn icn-btn--ghost" data-plate-reset>' + esc(t({ en: 'Start over', ht: 'Rekòmanse' })) + '</button>' +
            '</div>' +
            '<p class="icn-note" data-plate-msg></p>' +
            '<p class="icn-note">' + esc(t({ en: 'General education based on the balanced-plate method, not medical advice. Your needs may differ — your dietitian will tailor this to you.',
                ht: 'Sa se edikasyon jeneral ki baze sou metòd asyèt balanse a, se pa konsèy medikal. Bezwen ou ka diferan — dyetetisyen ou ap adapte l pou ou.' })) + '</p>' +
            '</div></div></div>';
    }

    function initPlate() {
        var root = document.getElementById('plate-builder');
        if (!root) return;
        readSharedPlate();
        renderPlate();
        root.addEventListener('click', function (e) {
            var cat = e.target.closest('[data-cat]');
            var food = e.target.closest('[data-food]');
            if (cat) { plate.cat = cat.getAttribute('data-cat'); renderPlate(); root.querySelector('[data-cat="' + plate.cat + '"]').focus(); return; }
            if (food) {
                var id = food.getAttribute('data-food');
                var i = plate.picked.indexOf(id);
                if (i > -1) { plate.picked.splice(i, 1); plate.lastTip = null; }
                else { plate.picked.push(id); plate.lastTip = id; window.ICN.track('plate_add', { food: id }); }
                renderPlate();
                var again = root.querySelector('[data-food="' + id + '"]');
                if (again) again.focus();
                return;
            }
            if (e.target.closest('[data-plate-reset]')) { plate.picked = []; plate.lastTip = null; renderPlate(); return; }
            if (e.target.closest('[data-plate-share]')) sharePlate(root);
        });
    }

    function sharePlate(root) {
        var url = location.origin + location.pathname + '?plate=' + plate.picked.join(',') +
            (window.ICN.lang() === 'ht' ? '&lang=ht' : '') + '#plate-builder';
        var text = t({ en: 'I built my Caribbean plate with Illuminate Cultural Nutrition — build yours!', ht: 'Mwen bati asyèt karayibeyen mwen ak Illuminate Cultural Nutrition — bati pa w tou!' });
        var msg = root.querySelector('[data-plate-msg]');
        window.ICN.track('plate_share', { items: plate.picked.length });
        if (navigator.share) {
            navigator.share({ title: 'Build Your Caribbean Plate', text: text, url: url }).catch(function () { /* cancelled */ });
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(function () {
                msg.textContent = t({ en: 'Link copied! Paste it anywhere to share your plate.', ht: 'Lyen an kopye! Kole l nenpòt kote pou pataje asyèt ou.' });
            }, function () { msg.textContent = url; });
        } else {
            msg.textContent = url;
        }
    }

    /* ======================================================================
       2. Health-goal quiz (no diagnoses or medical details are asked)
       ====================================================================== */
    var QUESTIONS = [
        { id: 'goal', q: { en: 'What would you most like help with?', ht: 'Ak kisa ou ta renmen plis èd?' },
          help: { en: 'Pick the one that matters most right now.', ht: 'Chwazi sa ki pi enpòtan pou ou kounye a.' },
          options: [
              { v: 'sugar', l: { en: 'Keeping my blood sugar steady', ht: 'Kenbe sik nan san m estab' } },
              { v: 'heart', l: { en: 'Healthy blood pressure & heart', ht: 'Bon tansyon ak yon kè an sante' } },
              { v: 'gut', l: { en: 'Better digestion', ht: 'Pi bon dijesyon' }, s: { en: 'Less bloating or heartburn', ht: 'Mwens gonfleman oswa zègrè' } },
              { v: 'family', l: { en: 'Feeding my family & kids well', ht: 'Bay fanmi m ak timoun yo bon manje' } },
              { v: 'energy', l: { en: 'More energy & eating better overall', ht: 'Plis enèji ak manje pi byen an jeneral' } }
          ] },
        { id: 'food', q: { en: 'Which favorite would you never give up?', ht: 'Ki manje ou pi renmen ou pa ta janm kite?' },
          help: { en: 'Good news: you don’t have to.', ht: 'Bon nouvèl: ou pa oblije.' },
          options: [
              { v: 'rice', l: { en: 'Rice (diri ak pwa, diri blan)', ht: 'Diri (diri ak pwa, diri blan)' } },
              { v: 'plantain', l: { en: 'Plantains & root vegetables', ht: 'Bannann ak viv' } },
              { v: 'fried', l: { en: 'Griot & fried foods', ht: 'Griyo ak fritay' } },
              { v: 'bread', l: { en: 'Bread, pastries & sweets', ht: 'Pen, pate ak bagay dous' } },
              { v: 'drinks', l: { en: 'Juice, soda & sweet drinks', ht: 'Ji, kola ak bwason sikre' } }
          ] },
        { id: 'format', q: { en: 'How would you like to work together?', ht: 'Kijan ou ta renmen travay ansanm?' },
          help: { en: 'You can change this later.', ht: 'Ou ka chanje sa pita.' },
          options: [
              { v: 'online', l: { en: 'One-on-one online visits', ht: 'Konsiltasyon an liy, yon pou yon' } },
              { v: 'cooking', l: { en: 'Cooking class or grocery tour', ht: 'Kou kwizin oswa vizit makèt' }, s: { en: 'In-home in the Triangle area, NC, or virtual', ht: 'Lakay ou nan zòn Triangle, NC, oswa an liy' } },
              { v: 'group', l: { en: 'A workshop for my church, school or group', ht: 'Yon atelye pou legliz, lekòl oswa gwoup mwen' } }
          ] }
    ];
    var GOAL_RESULT = {
        sugar: { title: { en: 'Steady blood sugar, still with your favorite foods', ht: 'Sik estab, toujou ak manje ou renmen yo' },
                 tip: { en: 'Pair every starch with protein and vegetables, and swap sweet drinks for water with lime. Small swaps add up fast.',
                        ht: 'Mete chak lanmidon ak pwoteyin ak legim, epi ranplase bwason sikre ak dlo sitwon. Ti chanjman yo fè gwo diferans vit.' },
                 service: { en: 'Diabetes and blood sugar nutrition support', ht: 'Sipò nitrisyon pou dyabèt ak sik nan san' } },
        heart: { title: { en: 'A heart-healthy plan that keeps the flavor', ht: 'Yon plan ki bon pou kè a e ki kenbe gou a' },
                 tip: { en: 'Flavor with fresh epis, garlic, lime and herbs instead of extra salt or bouillon cubes.',
                        ht: 'Bay manje gou ak epis fre, lay, sitwon ak fèy olye ou mete plis sèl oswa magi.' },
                 service: { en: 'Blood pressure and heart health nutrition', ht: 'Nitrisyon pou tansyon ak sante kè' } },
        gut: { title: { en: 'Calmer digestion, one meal at a time', ht: 'Yon dijesyon pi kalm, yon repa alafwa' },
               tip: { en: 'Eat slowly, add fiber gradually and drink water through the day. We will help you find your trigger foods.',
                      ht: 'Manje dousman, ajoute fib tikal pa tikal epi bwè dlo pandan jounen an. N ap ede w jwenn manje ki deranje w.' },
               service: { en: 'Digestive health support', ht: 'Sipò pou sante dijestif' } },
        family: { title: { en: 'Healthy family meals everyone will eat', ht: 'Repa an sante pou tout fanmi an manje' },
                  tip: { en: 'Build the family plate together: let kids choose a vegetable and help cook it — they eat what they make.',
                         ht: 'Bati asyèt fanmi an ansanm: kite timoun yo chwazi yon legim epi ede kwit li — yo manje sa yo fè.' },
                  service: { en: 'Family, kids and teen nutrition', ht: 'Nitrisyon pou fanmi, timoun ak adolesan' } },
        energy: { title: { en: 'More energy from the foods you know', ht: 'Plis enèji ak manje ou konnen yo' },
                  tip: { en: 'Don’t skip breakfast, and include protein at every meal to avoid the afternoon crash.',
                         ht: 'Pa sote manje maten, epi mete pwoteyin nan chak repa pou evite bès enèji apremidi.' },
                  service: { en: 'One-on-one nutrition counseling', ht: 'Konsiltasyon nitrisyon yon pou yon' } }
    };
    var FOOD_RESULT = {
        rice: { en: 'Keep your rice — a quarter of the plate, with beans, is a great fit.', ht: 'Kenbe diri ou — yon ka asyèt la, ak pwa, mache byen.' },
        plantain: { en: 'Boiled or baked plantain and viv fit beautifully into a balanced plate.', ht: 'Bannann ak viv bouyi oswa kwit nan fou antre byen nan yon asyèt balanse.' },
        fried: { en: 'Keep the griot! Baking or air-frying keeps the flavor with less oil.', ht: 'Kenbe griyo a! Kwit li nan fou oswa air fryer kenbe gou a ak mwens lwil.' },
        bread: { en: 'Enjoy bread and sweets in smaller portions, alongside protein.', ht: 'Manje pen ak bagay dous an pi piti pòsyon, ansanm ak pwoteyin.' },
        drinks: { en: 'Try half juice, half water to start, then work toward water with lime.', ht: 'Kòmanse ak mwatye ji, mwatye dlo, epi tikal pa tikal pase a dlo ak sitwon.' }
    };
    var FORMAT_RESULT = {
        online: { en: 'Convenient online visits from home.', ht: 'Konsiltasyon an liy fasil, soti lakay ou.' },
        cooking: { en: 'Cooking classes and grocery tours, in-home in the Triangle area or virtual.', ht: 'Kou kwizin ak vizit makèt, lakay ou nan zòn Triangle oswa an liy.' },
        group: { en: 'Workshops and talks for churches, schools and community groups.', ht: 'Atelye ak konferans pou legliz, lekòl ak gwoup kominote.' }
    };
    var QUIZ_THANKS = {
        sent: { en: 'Thank you! Check your email.', ht: 'Mèsi! Tcheke imèl ou.' },
        mailto: { en: 'Almost done: send the email that just opened so we can reply with your results.',
                  ht: 'Prèske fini: voye imèl ki fenk louvri a pou nou ka reponn ou ak rezilta ou.' },
        error: { en: 'Sorry, that didn’t go through. Please try again, or email us at ' + CFG.email + '.',
                 ht: 'Padon, sa pa pase. Tanpri eseye ankò, oswa ekri nou nan ' + CFG.email + '.' }
    };

    /* The full quiz result as plain text, in the visitor's language, for the email. */
    function quizResultText() {
        var g = GOAL_RESULT[quiz.answers.goal];
        return t(g.title) + '\n\n' +
            t({ en: 'Your tip:', ht: 'Konsèy ou:' }) + ' ' + t(g.tip) + ' ' + t(FOOD_RESULT[quiz.answers.food]) + '\n\n' +
            t({ en: 'Best fit for you:', ht: 'Sa ki pi bon pou ou:' }) + ' ' + t(g.service) + '. ' + t(FORMAT_RESULT[quiz.answers.format]);
    }
    function focusQuestion(root) {
        var focus = root.querySelector('#icn-q-title, #icn-quiz-result');
        if (focus) focus.focus({ preventScroll: true });
    }
    var quiz = { step: 0, answers: {}, sent: false };

    function renderQuiz() {
        var root = document.getElementById('health-quiz');
        if (!root) return;
        var head = '<div class="icn-center"><span class="icn-eyebrow">' + esc(t({ en: '60-second quiz', ht: 'Kesyonè 60 segonn' })) + '</span>' +
            '<h2>' + esc(t({ en: 'What’s Your Health Goal?', ht: 'Ki Objektif Sante Ou?' })) + '</h2>' +
            '<p class="icn-lead">' + esc(t({ en: 'Answer 3 quick questions and get a tip made for you, plus the service that fits best.',
                ht: 'Reponn 3 ti kesyon rapid epi jwenn yon konsèy pou ou, ak sèvis ki pi bon pou ou.' })) + '</p></div>';
        var body;
        if (quiz.step < QUESTIONS.length) {
            var q = QUESTIONS[quiz.step];
            body = '<div class="icn-progress" aria-hidden="true"><span style="width:' + Math.round((quiz.step / QUESTIONS.length) * 100) + '%"></span></div>' +
                '<p class="icn-q" id="icn-q-title" tabindex="-1">' + esc(t(q.q)) + '</p><p class="icn-q-help">' + esc(t(q.help)) + '</p>' +
                '<div class="icn-options" role="group" aria-labelledby="icn-q-title">' + q.options.map(function (o) {
                    return '<button type="button" class="icn-option" data-answer="' + o.v + '">' + esc(t(o.l)) + (o.s ? '<small>' + esc(t(o.s)) + '</small>' : '') + '</button>';
                }).join('') + '</div>' +
                '<div class="icn-quiz-nav"><span>' + esc(t({ en: 'Question', ht: 'Kesyon' })) + ' ' + (quiz.step + 1) + ' / ' + QUESTIONS.length + '</span>' +
                (quiz.step ? '<button type="button" class="icn-link-btn" data-quiz-back>← ' + esc(t({ en: 'Back', ht: 'Retounen' })) + '</button>' : '<span></span>') + '</div>';
        } else {
            var g = GOAL_RESULT[quiz.answers.goal];
            body = '<div class="icn-result" tabindex="-1" id="icn-quiz-result">' +
                '<div class="icn-progress" aria-hidden="true"><span style="width:100%"></span></div>' +
                '<span class="icn-eyebrow">' + esc(t({ en: 'Your result', ht: 'Rezilta ou' })) + '</span>' +
                '<h3>' + esc(t(g.title)) + '</h3>' +
                '<div class="icn-result-box"><strong>' + esc(t({ en: 'Your tip:', ht: 'Konsèy ou:' })) + '</strong> ' + esc(t(g.tip)) + ' ' + esc(t(FOOD_RESULT[quiz.answers.food])) + '</div>' +
                '<div class="icn-result-box"><strong>' + esc(t({ en: 'Best fit for you:', ht: 'Sa ki pi bon pou ou:' })) + '</strong> ' + esc(t(g.service)) + '. ' + esc(t(FORMAT_RESULT[quiz.answers.format])) + '</div>' +
                '<div class="icn-btn-row">' + bookBtn(t({ en: 'Book my free 15-minute call', ht: 'Pran apèl gratis 15 minit mwen' }), 'quiz') +
                '<button type="button" class="icn-btn icn-btn--ghost" data-quiz-restart>' + esc(t({ en: 'Retake quiz', ht: 'Refè kesyonè a' })) + '</button></div>' +
                '<form class="icn-email" data-quiz-email novalidate>' +
                '<p style="width:100%;margin:14px 0 0;font-weight:700">' + esc(t({ en: 'Want your results and the free Healthy Caribbean Starter Guide by email?', ht: 'Ou vle rezilta ou ak Gid gratis pou Kòmanse Manje Karayibeyen an Sante pa imèl?' })) + '</p>' +
                '<label class="icn-sr" for="icn-quiz-email">' + esc(t({ en: 'Email address', ht: 'Adrès imèl' })) + '</label>' +
                '<input id="icn-quiz-email" type="email" name="email" required autocomplete="email" placeholder="' + esc(t({ en: 'Your email', ht: 'Imèl ou' })) + '">' +
                '<button type="submit" class="icn-btn icn-btn--green">' + esc(t({ en: 'Send it to me', ht: 'Voye l ban mwen' })) + '</button>' +
                '</form><p class="icn-thanks" role="status" data-quiz-thanks>' + (quiz.sent ? esc(t(QUIZ_THANKS[quiz.sent])) : '') + '</p>' +
                '<p class="icn-note">' + esc(t({ en: 'We never ask for medical details here. Your answers stay in your browser unless you send them.', ht: 'Nou pa janm mande detay medikal isit la. Repons ou rete nan navigatè w sòf si ou voye yo.' })) + '</p>' +
                '</div>';
        }
        root.innerHTML = '<div class="icn-wrap icn-wrap--narrow">' + head + '<div class="icn-card">' + body + '</div></div>';
    }

    function initQuiz() {
        var root = document.getElementById('health-quiz');
        if (!root) return;
        renderQuiz();
        root.addEventListener('click', function (e) {
            var ans = e.target.closest('[data-answer]');
            if (ans) {
                quiz.answers[QUESTIONS[quiz.step].id] = ans.getAttribute('data-answer');
                if (quiz.step === 0) window.ICN.track('quiz_start');
                quiz.step++;
                if (quiz.step === QUESTIONS.length) window.ICN.track('quiz_complete', { goal: quiz.answers.goal });
                renderQuiz();
                focusQuestion(root);
                return;
            }
            if (e.target.closest('[data-quiz-back]')) { quiz.step = Math.max(0, quiz.step - 1); renderQuiz(); focusQuestion(root); return; }
            if (e.target.closest('[data-quiz-restart]')) { quiz = { step: 0, answers: {}, sent: false }; renderQuiz(); focusQuestion(root); }
        });
        root.addEventListener('submit', function (e) {
            var form = e.target.closest('[data-quiz-email]');
            if (!form) return;
            e.preventDefault();
            var input = form.email;
            if (!input.checkValidity()) { input.reportValidity(); return; }
            var body = t({ en: 'Hi Willande,\n\nPlease send me my quiz results and the Healthy Caribbean Starter Guide.\n\nMy results:\n',
                ht: 'Bonjou Willande,\n\nTanpri voye rezilta kesyonè mwen ak Gid pou Kòmanse a.\n\nRezilta mwen:\n' }) + quizResultText();
            var fields = { goal: quiz.answers.goal, food: quiz.answers.food, format: quiz.answers.format, language: window.ICN.lang() };
            submitEmail(input.value, 'Health goal quiz: ' + quiz.answers.goal, body, fields).then(function (mode) {
                // 'sent' = confirmed by the email platform; 'mailto' = only a draft was opened;
                // 'error' = the platform rejected it or could not be reached.
                quiz.sent = mode;
                if (mode === 'sent') window.ICN.track('quiz_email');
                var thanks = root.querySelector('[data-quiz-thanks]');
                if (thanks) thanks.textContent = t(QUIZ_THANKS[mode]);
            });
        });
    }

    /* ======================================================================
       3. Insurance checker
       ====================================================================== */
    var PLANS = [
        { v: '', l: { en: 'Choose your insurance…', ht: 'Chwazi asirans ou…' } },
        { v: 'aetna', l: { en: 'Aetna', ht: 'Aetna' }, accepted: true },
        { v: 'bcbs', l: { en: 'Blue Cross Blue Shield (BCBS)', ht: 'Blue Cross Blue Shield (BCBS)' }, accepted: true },
        { v: 'other', l: { en: 'Another insurance plan', ht: 'Yon lòt plan asirans' } },
        { v: 'none', l: { en: 'I don’t have insurance', ht: 'Mwen pa gen asirans' } }
    ];
    var ins = { plan: '' };

    function renderInsurance() {
        var root = document.getElementById('insurance-checker');
        if (!root) return;
        var plan = PLANS.filter(function (p) { return p.v === ins.plan; })[0];
        var result;
        if (!ins.plan) {
            result = '<div class="icn-ins-result"><h3>' + esc(t({ en: 'Is my insurance accepted?', ht: 'Èske yo aksepte asirans mwen?' })) + '</h3><p>' +
                esc(t({ en: 'Choose your plan to find out in one click.', ht: 'Chwazi plan ou pou w konnen nan yon sèl klik.' })) + '</p></div>';
        } else if (plan.accepted) {
            result = '<div class="icn-ins-result is-yes"><h3>' + esc(t({ en: 'Yes! We accept ', ht: 'Wi! Nou aksepte ' })) + esc(t(plan.l)) + '.</h3><p>' +
                esc(t({ en: 'Nutrition counseling coverage depends on your specific plan. Bring your insurance card to your free call and we will go over it together.',
                    ht: 'Kouvèti pou konsiltasyon nitrisyon depann de plan ou. Pote kat asirans ou nan apèl gratis la epi n ap gade l ansanm.' })) + '</p>' +
                '<div class="icn-btn-row">' + bookBtn(t({ en: 'Book my free call', ht: 'Pran apèl gratis mwen' }), 'insurance') + '</div></div>';
        } else if (ins.plan === 'other') {
            result = '<div class="icn-ins-result is-maybe"><h3>' + esc(t({ en: 'Let’s check together.', ht: 'Ann tcheke ansanm.' })) + '</h3><p>' +
                esc(t({ en: 'We may still be able to work with your plan. Ask during your free call, or call or text us.',
                    ht: 'Nou ka toujou travay ak plan ou. Mande pandan apèl gratis la, oswa rele oswa voye mesaj ban nou.' })) +
                ' <a href="tel:' + CFG.phoneTel + '">' + esc(CFG.phoneDisplay) + '</a></p>' +
                '<div class="icn-btn-row">' + bookBtn(t({ en: 'Book my free call', ht: 'Pran apèl gratis mwen' }), 'insurance') + '</div></div>';
        } else {
            result = '<div class="icn-ins-result is-self"><h3>' + esc(t({ en: 'No insurance? No problem.', ht: 'Pa gen asirans? Pa gen pwoblèm.' })) + '</h3><p>' +
                esc(t({ en: 'We offer self-pay options and will work out a plan that fits your budget.',
                    ht: 'Nou gen opsyon pou peye tèt ou epi n ap fè yon plan ki mache ak bidjè ou.' })) + '</p>' +
                '<div class="icn-btn-row">' + bookBtn(t({ en: 'Ask about self-pay on a free call', ht: 'Mande sou peye tèt ou nan yon apèl gratis' }), 'insurance') + '</div></div>';
        }
        root.innerHTML = '<div class="icn-wrap"><div class="icn-ins">' +
            '<div><span class="icn-eyebrow">' + esc(t({ en: 'Insurance checker', ht: 'Verifye asirans' })) + '</span>' +
            '<h2>' + esc(t({ en: 'Check Your Coverage', ht: 'Tcheke Kouvèti Ou' })) + '</h2>' +
            '<p class="icn-lead">' + esc(t({ en: 'Medical nutrition therapy is often covered by insurance. See where you stand before you book.',
                ht: 'Asirans souvan kouvri terapi nitrisyon medikal. Gade kote ou ye anvan ou pran randevou.' })) + '</p>' +
            '<label for="icn-plan">' + esc(t({ en: 'My insurance is:', ht: 'Asirans mwen se:' })) + '</label>' +
            '<select id="icn-plan">' + PLANS.map(function (p) {
                return '<option value="' + p.v + '"' + (p.v === ins.plan ? ' selected' : '') + (p.v ? '' : ' disabled') + '>' + esc(t(p.l)) + '</option>';
            }).join('') + '</select></div>' +
            '<div aria-live="polite">' + result + '</div>' +
            '</div></div>';
    }

    function initInsurance() {
        var root = document.getElementById('insurance-checker');
        if (!root) return;
        renderInsurance();
        root.addEventListener('change', function (e) {
            if (e.target.id !== 'icn-plan') return;
            ins.plan = e.target.value;
            window.ICN.track('insurance_check', { plan: ins.plan });
            renderInsurance();
            var sel = document.getElementById('icn-plan');
            if (sel) sel.focus();
        });
    }

    /* ======================================================================
       4. Booking section
       ====================================================================== */
    function renderBooking() {
        var root = document.getElementById('book');
        if (!root) return;
        root.innerHTML = '<div class="icn-wrap"><div class="icn-book">' +
            '<div><span class="icn-eyebrow">' + esc(t({ en: 'Free 15-minute call', ht: 'Apèl gratis 15 minit' })) + '</span>' +
            '<h2>' + esc(t({ en: 'Book Your Free Call in 2 Minutes', ht: 'Pran Apèl Gratis Ou nan 2 Minit' })) + '</h2>' +
            '<ol class="icn-steps">' +
            '<li>' + esc(t({ en: 'Pick a time that works for you.', ht: 'Chwazi yon lè ki bon pou ou.' })) + '</li>' +
            '<li>' + esc(t({ en: 'Share your goals and ask any questions, in English or Kreyòl.', ht: 'Pale de objektif ou epi poze tout kesyon ou, an angle oswa an kreyòl.' })) + '</li>' +
            '<li>' + esc(t({ en: 'Leave with a clear next step — no pressure, no judgment.', ht: 'Ale ak yon pwochen etap ki klè — san presyon, san jijman.' })) + '</li>' +
            '</ol></div>' +
            '<div class="icn-book-card"><h3>' + esc(t({ en: 'Ready when you are', ht: 'Nou pare lè ou pare' })) + '</h3>' +
            '<p>' + esc(t({ en: 'Opens our secure scheduling page.', ht: 'Sa ap louvri paj randevou sekirize nou an.' })) + '</p>' +
            bookBtn(t({ en: 'Choose a time', ht: 'Chwazi yon lè' }), 'booking-section') +
            '<div class="icn-book-alt">' +
            '<span>' + esc(t({ en: 'Prefer to talk first?', ht: 'Ou pito pale anvan?' })) + '</span>' +
            '<a href="tel:' + CFG.phoneTel + '">' + esc(t({ en: 'Call or text', ht: 'Rele oswa voye mesaj' })) + ' ' + esc(CFG.phoneDisplay) + '</a>' +
            '<a href="' + waLink() + '" target="_blank" rel="noopener" data-icn-wa-link>' + esc(t({ en: 'Message us on WhatsApp', ht: 'Ekri nou sou WhatsApp' })) + '</a>' +
            '</div>' +
            '<div data-icn-booking-widget></div>' +
            '</div></div></div>';
    }

    /* ======================================================================
       5. WhatsApp button
       ====================================================================== */
    function waLink() {
        var msg = t({ en: 'Hi! I found you on your website and I’d like to learn more about nutrition counseling.',
            ht: 'Bonjou! Mwen jwenn ou sou sit entènèt ou a epi mwen ta renmen konnen plis sou konsiltasyon nitrisyon.' });
        return 'https://wa.me/' + CFG.whatsappNumber + '?text=' + encodeURIComponent(msg);
    }
    var WA_ICON = '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.5.7 4.9 2 6.9L3.2 29l6.7-2.1c1.9 1 4 1.6 6.1 1.6 7 0 12.7-5.7 12.7-12.7S23 3 16 3zm0 23.2c-2 0-3.9-.6-5.6-1.6l-.4-.2-4 1.2 1.3-3.9-.3-.4c-1.1-1.7-1.7-3.7-1.7-5.7C5.3 9.8 10.1 5 16 5s10.7 4.8 10.7 10.7S21.9 26.2 16 26.2zm5.9-8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.6 5.8 5 .8.4 1.4.6 1.9.7.8.3 1.6.2 2.2.1.7-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg>';

    function renderWhatsApp() {
        var a = document.querySelector('.icn-wa');
        if (!a) {
            a = document.createElement('a');
            a.className = 'icn-wa';
            a.target = '_blank';
            a.rel = 'noopener';
            a.addEventListener('click', function () { window.ICN.track('whatsapp_click', { source: 'floating' }); });
            document.body.appendChild(a);
        }
        a.href = waLink();
        a.setAttribute('aria-label', t({ en: 'Chat with us on WhatsApp', ht: 'Pale ak nou sou WhatsApp' }));
        a.innerHTML = WA_ICON + '<span>' + esc(t({ en: 'Chat on WhatsApp', ht: 'Ekri nou sou WhatsApp' })) + '</span>';
    }

    /* ====================================================================== */
    function renderAll() {
        renderPlate();
        renderQuiz();
        renderInsurance();
        renderBooking();
        renderWhatsApp();
    }

    function init() {
        initPlate();
        initQuiz();
        initInsurance();
        renderBooking();
        renderWhatsApp();
        window.ICN.onLang(renderAll);
        window.ICN.initLang();
        if (location.hash === '#plate-builder' || /[?&]plate=/.test(location.search)) {
            var pb = document.getElementById('plate-builder');
            if (pb) setTimeout(function () { pb.scrollIntoView(); }, 50);
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
