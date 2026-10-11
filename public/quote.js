/* Onyx Executive Miami - instant quote widget (English, Spanish, Russian).
   Data: quote-data.js (built from the price workbook by scripts/build-quote-data.py).
   Mount: <div data-onyx-quote></div>. Language comes from <html lang>.
   Lead delivery: set "endpoint" in quote-data.js (see docs/lead-capture/README.md);
   without it the request opens in WhatsApp, as the old booking form did. */
(function () {
  var D = window.ONYX_QUOTE;
  if (!D) return;
  var WA = '17869316699';
  var PHONE = '+17869316699';
  var LANG = ((document.documentElement.lang || 'en').slice(0, 2).toLowerCase());
  if (LANG !== 'es' && LANG !== 'ru') LANG = 'en';

  /* ---------- text (en / es usted / ru vy) ---------- */
  var S = {
    eyebrow: { en: 'Instant quote', es: 'Cotización instantánea', ru: 'Мгновенный расчёт' },
    title: { en: 'See your fare in seconds.', es: 'Conozca su tarifa en segundos.', ru: 'Узнайте стоимость за секунды.' },
    sub: { en: 'Fixed rates, confirmed in writing. No meter, no surge.', es: 'Tarifas fijas, confirmadas por escrito. Sin taxímetro ni recargos por demanda.', ru: 'Фиксированные тарифы, подтверждение в письменном виде. Без счётчика и без надбавок за спрос.' },
    pickup: { en: 'Pickup', es: 'Recogida', ru: 'Откуда' },
    dropoff: { en: 'Drop-off', es: 'Destino', ru: 'Куда' },
    swap: { en: 'Swap', es: 'Invertir', ru: 'Поменять' },
    swapAria: { en: 'Swap pickup and drop-off', es: 'Invertir recogida y destino', ru: 'Поменять местами «откуда» и «куда»' },
    gHubs: { en: 'Airports & cruise ports', es: 'Aeropuertos y puertos de cruceros', ru: 'Аэропорты и круизные порты' },
    gMD: { en: 'Miami-Dade County', es: 'Condado de Miami-Dade', ru: 'Округ Майами-Дейд' },
    gBR: { en: 'Broward County', es: 'Condado de Broward', ru: 'Округ Броуорд' },
    gPB: { en: 'Palm Beach County', es: 'Condado de Palm Beach', ru: 'Округ Палм-Бич' },
    gNo: { en: 'Not listed', es: 'No figura en la lista', ru: 'Нет в списке' },
    other: { en: 'Other city or street address', es: 'Otra ciudad o dirección', ru: 'Другой город или адрес' },
    car: { en: 'Chevrolet Suburban', es: 'Chevrolet Suburban', ru: 'Chevrolet Suburban' },
    cap: { en: 'Brand-new SUV · up to 6 passengers', es: 'SUV nueva · hasta 6 pasajeros', ru: 'Новый внедорожник · до 6 пассажиров' },
    fareAria: { en: 'Fixed fare {n} dollars', es: 'Tarifa fija: {n} dólares', ru: 'Фиксированная цена: {n} долларов' },
    mi: { en: '~{n} mi', es: '~{n} mi', ru: '~{n} миль' },
    drive: { en: '~{t} min drive', es: '~{t} min de trayecto', ru: '~{t} мин в пути' },
    wait: { en: '60 min free wait', es: '60 min de espera gratis', ru: '60 мин ожидания бесплатно' },
    door: { en: 'Door-to-door', es: 'De puerta a puerta', ru: 'От двери до двери' },
    choose: { en: 'Choose date & time', es: 'Elegir fecha y hora', ru: 'Выбрать дату и время' },
    fDate: { en: 'Date', es: 'Fecha', ru: 'Дата' },
    fTime: { en: 'Pickup time', es: 'Hora de recogida', ru: 'Время подачи' },
    fPax: { en: 'Passengers', es: 'Pasajeros', ru: 'Пассажиры' },
    fFlight: { en: 'Flight / vessel no.', es: 'N.º de vuelo / barco', ru: 'Номер рейса / судна' },
    pFlight: { en: 'If applicable', es: 'Si corresponde', ru: 'Если есть' },
    fAddr: { en: 'Street address', es: 'Dirección', ru: 'Адрес' },
    pAddr: { en: 'Hotel, residence or office address', es: 'Hotel, residencia u oficina', ru: 'Отель, дом или офис' },
    fName: { en: 'Name', es: 'Nombre', ru: 'Имя' },
    fPhone: { en: 'Phone / WhatsApp', es: 'Teléfono / WhatsApp', ru: 'Телефон / WhatsApp' },
    fEmail: { en: 'Email', es: 'Correo electrónico', ru: 'Email' },
    fNotes: { en: 'Notes', es: 'Notas', ru: 'Комментарий' },
    pNotes: { en: 'Luggage, child seat, company / billing', es: 'Equipaje, silla infantil, empresa / facturación', ru: 'Багаж, детское кресло, компания / счёт' },
    send: { en: 'Send reservation request', es: 'Enviar solicitud de reserva', ru: 'Отправить заявку на бронь' },
    sending: { en: 'Sending…', es: 'Enviando…', ru: 'Отправка…' },
    late: { en: 'Late-night pickup (midnight–6 a.m.): <b>{p}</b> including the 30% supplement.', es: 'Recogida nocturna (00:00–6:00): <b>{p}</b> con el recargo del 30 %.', ru: 'Ночная подача (00:00–06:00): <b>{p}</b> с учётом надбавки 30%.' },
    errFill: { en: 'Please fill in date, time, name, phone and email.', es: 'Complete fecha, hora, nombre, teléfono y correo electrónico.', ru: 'Заполните дату, время, имя, телефон и email.' },
    errMail: { en: 'Please enter a valid email address.', es: 'Introduzca un correo electrónico válido.', ru: 'Введите корректный email.' },
    errSend: { en: 'Could not send. Please <a href="{u}" target="_blank" rel="noopener">use WhatsApp</a> or call +1 786 931 6699.', es: 'No se pudo enviar. <a href="{u}" target="_blank" rel="noopener">Use WhatsApp</a> o llame al +1 786 931 6699.', ru: 'Не удалось отправить. <a href="{u}" target="_blank" rel="noopener">Напишите в WhatsApp</a> или позвоните +1 786 931 6699.' },
    custom: { en: 'This route needs a custom quote — send us the details and we will reply with a fixed price.', es: 'Esta ruta requiere una cotización personalizada: envíe los detalles y le responderemos con un precio fijo.', ru: 'Для этого маршрута нужен индивидуальный расчёт — отправьте детали, и мы ответим с фиксированной ценой.' },
    same: { en: 'Choose two different locations.', es: 'Elija dos ubicaciones distintas.', ru: 'Выберите два разных места.' },
    call: { en: 'Call', es: 'Llamar', ru: 'Позвонить' },
    callInstead: { en: 'Call instead', es: 'Llamar en su lugar', ru: 'Позвонить' },
    okTitle: { en: 'Request received.', es: 'Solicitud recibida.', ru: 'Заявка получена.' },
    okText: { en: 'We will confirm the fare and your vehicle in writing shortly. For anything urgent call <a href="tel:{p}">+1 786 931 ONYX (6699)</a>.', es: 'En breve le confirmaremos por escrito la tarifa y su vehículo. Si es urgente, llame al <a href="tel:{p}">+1 786 931 ONYX (6699)</a>.', ru: 'Скоро мы подтвердим в письменном виде цену и автомобиль. Если это срочно, позвоните по номеру <a href="tel:{p}">+1 786 931 ONYX (6699)</a>.' },
    waTitle: { en: 'Almost done.', es: 'Casi listo.', ru: 'Почти готово.' },
    waText: { en: 'Your request is ready in WhatsApp — press send there to submit it.', es: 'Su solicitud está lista en WhatsApp: pulse enviar allí para enviarla.', ru: 'Ваша заявка готова в WhatsApp — нажмите «отправить» там, чтобы отправить её.' },
    waOpen: { en: 'Open WhatsApp', es: 'Abrir WhatsApp', ru: 'Открыть WhatsApp' },
    note: { en: '<b>Per vehicle, one way.</b> Gratuity, tolls and airport/port parking not included. 30% supplement midnight–6 a.m. An exact street address can adjust the fare; you always approve it in writing first.', es: '<b>Por vehículo, solo ida.</b> No incluye propina, peajes ni estacionamiento en aeropuerto/puerto. Recargo del 30 % de 00:00 a 6:00. Una dirección exacta puede ajustar la tarifa; usted siempre la aprueba por escrito antes.', ru: '<b>За автомобиль, в одну сторону.</b> Чаевые, платные дороги и парковка в аэропорту/порту не включены. Надбавка 30% с 00:00 до 06:00. Точный адрес может изменить цену; вы всегда согласовываете её в письменном виде.' }
  };
  function t(k, v) {
    var s = (S[k] && (S[k][LANG] || S[k].en)) || k;
    if (v) for (var n in v) s = s.split('{' + n + '}').join(v[n]);
    return s;
  }

  /* Airport / port / zone names: English is in quote-data.js; Spanish only changes a few words. */
  var NAMES = {
    es: { 'Miami International Airport (MIA)': 'Aeropuerto de Miami (MIA)', 'Fort Lauderdale Airport (FLL)': 'Aeropuerto de Fort Lauderdale (FLL)', 'Palm Beach Airport (PBI)': 'Aeropuerto de Palm Beach (PBI)', 'PortMiami Cruise Terminals': 'Terminales de cruceros de PortMiami', 'Port Everglades Cruise Terminals': 'Terminales de cruceros de Port Everglades', 'Downtown Miami / Brickell': 'Centro de Miami / Brickell', 'Palm Beach (island)': 'Palm Beach (isla)' },
    ru: {
      'Miami International Airport (MIA)': 'Аэропорт Майами (MIA)', 'Fort Lauderdale Airport (FLL)': 'Аэропорт Форт-Лодердейл (FLL)', 'Palm Beach Airport (PBI)': 'Аэропорт Палм-Бич (PBI)',
      'PortMiami Cruise Terminals': 'Круизные терминалы PortMiami', 'Port Everglades Cruise Terminals': 'Круизные терминалы Port Everglades',
      'Downtown Miami / Brickell': 'Даунтаун Майами / Брикелл', 'Miami Beach / South Beach': 'Майами-Бич / Саут-Бич', 'Coral Gables': 'Корал-Гейблс', 'Key Biscayne': 'Ки-Бискейн', 'Doral': 'Дорал',
      'Miami Springs / Medley / Sweetwater': 'Майами-Спрингс / Медли / Суитуотер', 'Hialeah / Miami Lakes': 'Хайалиа / Майами-Лейкс', 'Kendall / Pinecrest / South Miami': 'Кендалл / Пайнкрест / Саут-Майами',
      'Cutler Bay / Palmetto Bay': 'Катлер-Бэй / Палметто-Бэй', 'Homestead / Florida City': 'Хоумстед / Флорида-Сити', 'North Miami / Miami Shores': 'Норт-Майами / Майами-Шорс', 'North Miami Beach / Miami Gardens': 'Норт-Майами-Бич / Майами-Гарденс',
      'Bal Harbour / Surfside / Bay Harbor': 'Бал-Харбор / Сёрфсайд / Бэй-Харбор', 'Sunny Isles Beach': 'Санни-Айлс-Бич', 'Aventura / Golden Beach': 'Авентура / Голден-Бич',
      'Hollywood / Hallandale Beach / Dania Beach': 'Голливуд / Халландейл-Бич / Дания-Бич', 'Miramar / Pembroke Pines': 'Мирамар / Пембрук-Пайнс', 'Davie / Weston / Cooper City': 'Дейви / Уэстон / Купер-Сити', 'Fort Lauderdale': 'Форт-Лодердейл',
      'Plantation / Sunrise / Wilton Manors': 'Плантейшен / Санрайз / Уилтон-Мэнорс', 'Pompano Beach / Lighthouse Point': 'Помпано-Бич / Лайтхаус-Пойнт', 'Coral Springs / Parkland': 'Корал-Спрингс / Паркленд', 'Deerfield Beach': 'Дирфилд-Бич',
      'Boca Raton': 'Бока-Ратон', 'Delray Beach / Highland Beach': 'Делрей-Бич / Хайленд-Бич', 'Boynton Beach / Ocean Ridge': 'Бойнтон-Бич / Оушен-Ридж', 'Lake Worth Beach / Lantana': 'Лейк-Уэрт-Бич / Лантана',
      'Wellington / Royal Palm Beach': 'Веллингтон / Ройал-Палм-Бич', 'West Palm Beach': 'Уэст-Палм-Бич', 'Palm Beach (island)': 'Палм-Бич (остров)', 'Palm Beach Gardens / North Palm Beach': 'Палм-Бич-Гарденс / Норт-Палм-Бич', 'Jupiter / Tequesta': 'Джупитер / Текеста'
    }
  };
  function nm(s) { return (NAMES[LANG] && NAMES[LANG][s]) || s; }

  var hubs = {}, hubOrder = [], places = D.places;
  D.hubs.forEach(function (h) { hubs[h[0]] = { id: h[0], label: h[1], kind: h[2] }; hubOrder.push(h[0]); });

  function money(n) { return '$' + n; }
  function roundTo(n, step) { return Math.round(n / step) * step; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  /* A route is priceable when exactly one end is an airport/port and the other a zone. */
  function quote(from, to) {
    if (!from || !to || from === to || from === 'x' || to === 'x') return null;
    var fh = from.charAt(0) === 'h', th = to.charAt(0) === 'h';
    if (fh === th) return null;
    var hub = fh ? from.slice(2) : to.slice(2);
    var pi = parseInt(fh ? to.slice(2) : from.slice(2), 10);
    var row = D.table[hub] && D.table[hub][pi];
    if (!row) return null;
    return { hub: hubs[hub], place: places[pi][0], miles: row[0], free: row[1], rush: row[2], price: row[3] };
  }

  function lateNight(timeStr) {
    if (!timeStr) return false;
    var h = parseInt(timeStr.split(':')[0], 10);
    return h >= 0 && h < 6;
  }

  function optionHtml() {
    var h = '<optgroup label="' + esc(t('gHubs')) + '">';
    hubOrder.forEach(function (id) { h += '<option value="h:' + id + '">' + esc(nm(hubs[id].label)) + '</option>'; });
    h += '</optgroup>';
    [['Miami-Dade', 'gMD'], ['Broward', 'gBR'], ['Palm Beach', 'gPB']].forEach(function (c) {
      h += '<optgroup label="' + esc(t(c[1])) + '">';
      places.forEach(function (p, i) { if (p[1] === c[0]) h += '<option value="p:' + i + '">' + esc(nm(p[0])) + '</option>'; });
      h += '</optgroup>';
    });
    h += '<optgroup label="' + esc(t('gNo')) + '"><option value="x">' + esc(t('other')) + '</option></optgroup>';
    return h;
  }

  function mount(root, n) {
    var uid = 'qw' + n;
    var opts = optionHtml();
    root.innerHTML =
      '<div class="qw" role="group" aria-label="' + esc(t('eyebrow')) + '">' +
      '<div class="qw-head"><p class="qw-eyebrow">' + t('eyebrow') + '</p>' +
      '<div class="qw-title" role="heading" aria-level="2">' + t('title') + '</div>' +
      '<p class="qw-sub">' + t('sub') + '</p></div>' +
      '<div class="qw-route">' +
      '<div class="qw-field"><div class="qw-lr"><label for="' + uid + 'f">' + t('pickup') + '</label></div><select id="' + uid + 'f" class="qw-from">' + opts + '</select></div>' +
      '<div class="qw-field"><div class="qw-lr"><label for="' + uid + 't">' + t('dropoff') + '</label>' +
      '<button type="button" class="qw-swap" aria-label="' + esc(t('swapAria')) + '"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 13V3M2 5.5L4.5 3 7 5.5M11.5 3v10M9 10.5l2.5 2.5 2.5-2.5"/></svg>' + t('swap') + '</button></div>' +
      '<select id="' + uid + 't" class="qw-to">' + opts + '</select></div>' +
      '</div>' +
      '<div class="qw-result" aria-live="polite"></div>' +
      '<form class="qw-form" hidden novalidate>' +
      '<div class="qw-grid">' +
      '<div class="qw-field"><label for="' + uid + 'd">' + t('fDate') + '</label><input id="' + uid + 'd" name="date" type="date" required></div>' +
      '<div class="qw-field"><label for="' + uid + 'tm">' + t('fTime') + '</label><input id="' + uid + 'tm" name="time" type="time" required></div>' +
      '<div class="qw-field"><label for="' + uid + 'p">' + t('fPax') + '</label><select id="' + uid + 'p" name="pax"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5</option><option>6</option></select></div>' +
      '<div class="qw-field"><label for="' + uid + 'fl">' + t('fFlight') + '</label><input id="' + uid + 'fl" name="flight" type="text" placeholder="' + esc(t('pFlight')) + '"></div>' +
      '<div class="qw-field qw-full"><label for="' + uid + 'a">' + t('fAddr') + '</label><input id="' + uid + 'a" name="address" type="text" placeholder="' + esc(t('pAddr')) + '"></div>' +
      '<div class="qw-field"><label for="' + uid + 'n">' + t('fName') + '</label><input id="' + uid + 'n" name="name" type="text" autocomplete="name" required></div>' +
      '<div class="qw-field"><label for="' + uid + 'ph">' + t('fPhone') + '</label><input id="' + uid + 'ph" name="phone" type="tel" autocomplete="tel" placeholder="+1 &hellip;" required></div>' +
      '<div class="qw-field qw-full"><label for="' + uid + 'e">' + t('fEmail') + '</label><input id="' + uid + 'e" name="email" type="email" autocomplete="email" required></div>' +
      '<div class="qw-field qw-full"><label for="' + uid + 'nt">' + t('fNotes') + '</label><input id="' + uid + 'nt" name="notes" type="text" placeholder="' + esc(t('pNotes')) + '"></div>' +
      '<input class="qw-hp" name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '</div>' +
      '<p class="qw-late" hidden></p>' +
      '<p class="qw-err" role="alert" hidden></p>' +
      '<button type="submit" class="btn btn-gold qw-send">' + t('send') + '</button>' +
      '</form>' +
      '<div class="qw-done" hidden></div>' +
      '<p class="qw-note">' + t('note') + '</p>' +
      '</div>';

    var from = root.querySelector('.qw-from'), to = root.querySelector('.qw-to');
    var result = root.querySelector('.qw-result'), form = root.querySelector('.qw-form');
    var done = root.querySelector('.qw-done'), late = root.querySelector('.qw-late'), err = root.querySelector('.qw-err');
    var state = { q: null, total: 0 };
    from.value = 'h:MIA';
    var def = null;
    for (var i = 0; i < places.length; i++) { if (places[i][0].indexOf('Miami Beach') === 0) def = i; }
    to.value = 'p:' + (def == null ? 0 : def);
    var d = form.elements.date;
    var now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    d.min = now.toISOString().slice(0, 10);

    function lateFee(base) { return roundTo(base * (1 + D.lateNightPct / 100), D.pricing.round); }
    function labelOf(sel) { return sel.options[sel.selectedIndex].text; }

    function render() {
      done.hidden = true;
      var q = quote(from.value, to.value);
      state.q = q;
      if (q) { state.total = q.price; }
      if (!q) {
        var same = from.value === to.value && from.value !== 'x';
        var wa = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Hi, I’d like a quote.\nPickup: ' + labelOf(from) + '\nDrop-off: ' + labelOf(to));
        result.innerHTML = '<p class="qw-msg">' + (same ? t('same') : t('custom')) + '</p>' +
          (same ? '' : '<div class="qw-actions"><a class="btn btn-gold" href="' + wa + '" target="_blank" rel="noopener">WhatsApp</a><a class="btn btn-ghost" href="tel:' + PHONE + '">' + t('call') + '</a></div>');
        form.hidden = true;
        return;
      }
      var airport = q.hub.kind === 'airport';
      result.innerHTML =
        '<div class="qw-fare"><div class="qw-fare-top">' +
        '<div><span class="qw-kicker">' + t('car') + '</span><span class="qw-cap">' + t('cap') + '</span></div>' +
        '<div class="qw-amt" aria-label="' + esc(t('fareAria', { n: q.price })) + '">' + money(q.price) + '</div></div>' +
        '<ul class="qw-facts"><li>' + t('mi', { n: Math.round(q.miles) }) + '</li><li>' + t('drive', { t: q.free + (q.rush > q.free ? '–' + q.rush : '') }) + '</li>' +
        '<li>' + (airport ? t('wait') : t('door')) + '</li></ul></div>' +
        (form.hidden ? '<button type="button" class="btn btn-gold qw-reserve">' + t('choose') + '</button>' : '');
      var b = result.querySelector('.qw-reserve');
      if (b) b.addEventListener('click', function () {
        form.hidden = false; b.remove();
        if (typeof gtag === 'function') gtag('event', 'quote_reserve_open', { event_category: 'quote', event_label: q.hub.id + ':' + q.place, value: q.price });
        form.elements.date.focus();
      });
      updateLate();
    }

    function updateLate() {
      var q = state.q; if (!q) return;
      var isLate = lateNight(form.elements.time.value);
      state.total = isLate ? lateFee(q.price) : q.price;
      late.hidden = !isLate;
      if (isLate) late.innerHTML = t('late', { p: money(state.total) });
    }

    var tracked = false;
    function changed() {
      render();
      if (!tracked && state.q && typeof gtag === 'function') { tracked = true; gtag('event', 'quote_view', { event_category: 'quote', event_label: state.q.hub.id + ':' + state.q.place, value: state.q.price }); }
    }
    from.addEventListener('change', changed);
    to.addEventListener('change', changed);
    root.querySelector('.qw-swap').addEventListener('click', function () { var a = from.value; from.value = to.value; to.value = a; changed(); });
    form.elements.time.addEventListener('change', updateLate);

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var q = state.q; if (!q) return;
      var f = form.elements;
      err.hidden = true;
      var missing = [];
      ['date', 'time', 'name', 'phone', 'email'].forEach(function (k) { if (!f[k].value.trim()) missing.push(k); });
      if (missing.length) { err.textContent = t('errFill'); err.hidden = false; return; }
      if (!/^\S+@\S+\.\S+$/.test(f.email.value.trim())) { err.textContent = t('errMail'); err.hidden = false; return; }
      if (f.website.value) return; /* honeypot */
      /* The request goes to the dispatcher, so route names stay in English whatever the page language. */
      var enFrom = from.value.charAt(0) === 'h' ? hubs[from.value.slice(2)].label : places[parseInt(from.value.slice(2), 10)][0];
      var enTo = to.value.charAt(0) === 'h' ? hubs[to.value.slice(2)].label : places[parseInt(to.value.slice(2), 10)][0];
      var payload = {
        submitted: new Date().toISOString(), page: location.pathname, lang: LANG,
        pickup: enFrom, dropoff: enTo,
        quotedFare: state.total, baseFare: q.price, lateNight: lateNight(f.time.value),
        date: f.date.value, time: f.time.value, passengers: f.pax.value, flight: f.flight.value.trim(),
        address: f.address.value.trim(), name: f.name.value.trim(), phone: f.phone.value.trim(),
        email: f.email.value.trim(), notes: f.notes.value.trim()
      };
      if (typeof gtag === 'function') gtag('event', 'generate_lead', { event_category: 'quote', event_label: q.hub.id + ':' + q.place, value: state.total, currency: 'USD' });
      var summary = money(state.total) + ' · ' + labelOf(from) + ' → ' + labelOf(to) + ' · ' + payload.date + ' ' + payload.time;
      var waText = ['New ride request — Onyx Executive Miami (' + LANG.toUpperCase() + ' site)', '', 'Quoted fare: ' + money(state.total) + (payload.lateNight ? ' (incl. late-night supplement)' : ''),
        'Pickup: ' + payload.pickup, 'Drop-off: ' + payload.dropoff, 'Address: ' + (payload.address || '—'),
        'Date/time: ' + payload.date + ' ' + payload.time, 'Passengers: ' + payload.passengers, 'Flight: ' + (payload.flight || '—'),
        'Name: ' + payload.name, 'Phone: ' + payload.phone, 'Email: ' + payload.email, 'Notes: ' + (payload.notes || '—')].join('\n');
      var waUrl = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(waText);

      function finish(sent) {
        form.hidden = true; result.innerHTML = '';
        done.hidden = false;
        done.innerHTML = sent
          ? '<p class="qw-ok">' + t('okTitle') + '</p><p class="qw-msg">' + esc(summary) + '</p><p class="qw-msg">' + t('okText', { p: PHONE }) + '</p>'
          : '<p class="qw-ok">' + t('waTitle') + '</p><p class="qw-msg">' + t('waText') + '</p><div class="qw-actions"><a class="btn btn-gold" href="' + waUrl + '" target="_blank" rel="noopener">' + t('waOpen') + '</a><a class="btn btn-ghost" href="tel:' + PHONE + '">' + t('callInstead') + '</a></div>';
      }

      if (D.endpoint) {
        var btn = form.querySelector('.qw-send'); btn.disabled = true; btn.textContent = t('sending');
        fetch(D.endpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) })
          .then(function () { finish(true); })
          .catch(function () { btn.disabled = false; btn.textContent = t('send'); err.innerHTML = t('errSend', { u: waUrl }); err.hidden = false; });
      } else {
        window.open(waUrl, '_blank');
        finish(false);
      }
    });

    render();
  }

  var roots = document.querySelectorAll('[data-onyx-quote]');
  for (var i = 0; i < roots.length; i++) mount(roots[i], i);
})();
