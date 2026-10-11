/* Onyx Executive Miami - instant quote widget (English, Spanish, Russian).
   Modes: transfer (airport / port / city zones, optional return ride) and by the hour.
   Data: quote-data.js (built from the price workbook by scripts/build-quote-data.py).
   Mount: <div data-onyx-quote></div>. Language comes from <html lang>.
   Links with data-qw-mode="hourly" (or "transfer") switch the tab and scroll to the widget.
   Lead delivery: set "endpoint" in quote-data.js (see docs/lead-capture/README.md);
   without it the request opens in WhatsApp, as the old booking form did. */
(function () {
  var D = window.ONYX_QUOTE;
  if (!D) return;
  var WA = '17869316699';
  var PHONE = '+17869316699';
  var H = D.hourly || { rate: 100, min: 3, max: 12, discFrom: 6, discPct: 20 };
  var RET = D.returnDiscountPct == null ? 20 : D.returnDiscountPct;
  var LANG = ((document.documentElement.lang || 'en').slice(0, 2).toLowerCase());
  if (LANG !== 'es' && LANG !== 'ru') LANG = 'en';

  /* ---------- text (en / es usted / ru vy) ---------- */
  var S = {
    eyebrow: { en: 'Instant quote', es: 'Cotización instantánea', ru: 'Мгновенный расчёт' },
    title: { en: 'See your fare in seconds.', es: 'Conozca su tarifa en segundos.', ru: 'Узнайте стоимость за секунды.' },
    sub: { en: 'Fixed rates, confirmed in writing. No meter, no surge.', es: 'Tarifas fijas, confirmadas por escrito. Sin taxímetro ni recargos por demanda.', ru: 'Фиксированные тарифы, подтверждение в письменном виде. Без счётчика и без надбавок за спрос.' },
    tabTransfer: { en: 'Transfer', es: 'Traslado', ru: 'Трансфер' },
    tabHourly: { en: 'By the hour', es: 'Por horas', ru: 'Почасово' },
    pickup: { en: 'Pickup', es: 'Recogida', ru: 'Откуда' },
    dropoff: { en: 'Drop-off', es: 'Destino', ru: 'Куда' },
    start: { en: 'Start location', es: 'Punto de inicio', ru: 'Место подачи' },
    hours: { en: 'Hours', es: 'Horas', ru: 'Продолжительность' },
    hoursOpt: { en: '{n} hours', es: '{n} horas', ru: '{n} ч' },
    occasion: { en: 'Occasion', es: 'Motivo', ru: 'Повод' },
    occList: {
      en: ['Night out', 'Birthday', 'Business', 'Wedding', 'Concert or game', 'Sightseeing', 'Other'],
      es: ['Salida nocturna', 'Cumpleaños', 'Negocios', 'Boda', 'Concierto o partido', 'Turismo', 'Otro'],
      ru: ['Вечер в городе', 'День рождения', 'Деловая встреча', 'Свадьба', 'Концерт или матч', 'Экскурсия', 'Другое']
    },
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
    roundKicker: { en: 'Round trip · Chevrolet Suburban', es: 'Ida y vuelta · Chevrolet Suburban', ru: 'Туда и обратно · Chevrolet Suburban' },
    roundCap: { en: 'One booking, one confirmation', es: 'Una reserva, una confirmación', ru: 'Одна бронь, одно подтверждение' },
    outLabel: { en: 'Outbound {p}', es: 'Ida {p}', ru: 'Туда {p}' },
    retLabel: { en: 'Return {p}', es: 'Regreso {p}', ru: 'Обратно {p}' },
    saveLabel: { en: 'You save {s}', es: 'Ahorra {s}', ru: 'Экономия {s}' },
    returnLabel: { en: 'Add your ride back — save {p}%', es: 'Añada su regreso: ahorre {p} %', ru: 'Добавьте обратный рейс — скидка {p}%' },
    returnSub: { en: 'Return ride {r} instead of {f}', es: 'Regreso {r} en lugar de {f}', ru: 'Обратный рейс {r} вместо {f}' },
    hKicker: { en: 'By the hour · {n} h', es: 'Por horas · {n} h', ru: 'Почасовая аренда · {n} ч' },
    hCap: { en: '{n} h × {r}/h', es: '{n} h × {r}/h', ru: '{n} ч × {r}/ч' },
    hCapDisc: { en: '{n} h × {r}/h · {d}% off from {f} hours', es: '{n} h × {r}/h · {d} % de descuento desde {f} horas', ru: '{n} ч × {r}/ч · скидка {d}% от {f} часов' },
    hFact1: { en: 'Fuel and tolls included', es: 'Combustible y peajes incluidos', ru: 'Топливо и дороги включены' },
    hFact2: { en: 'Stops and waiting included', es: 'Paradas y esperas incluidas', ru: 'Остановки и ожидание включены' },
    hFact3: { en: '{m}-hour minimum', es: 'Mínimo {m} horas', ru: 'Минимум {m} ч.' },
    choose: { en: 'Choose date & time', es: 'Elegir fecha y hora', ru: 'Выбрать дату и время' },
    fDate: { en: 'Date', es: 'Fecha', ru: 'Дата' },
    fTime: { en: 'Pickup time', es: 'Hora de recogida', ru: 'Время подачи' },
    fRDate: { en: 'Return date', es: 'Fecha de regreso', ru: 'Дата обратного рейса' },
    fRTime: { en: 'Return pickup time', es: 'Hora de recogida del regreso', ru: 'Время подачи на обратный рейс' },
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
    late: { en: 'Late-night pickup (midnight–6 a.m.): total <b>{p}</b> including the 30% supplement.', es: 'Recogida nocturna (00:00–6:00): total <b>{p}</b> con el recargo del 30 %.', ru: 'Ночная подача (00:00–06:00): итого <b>{p}</b> с учётом надбавки 30%.' },
    errFill: { en: 'Please fill in date, time, name, phone and email.', es: 'Complete fecha, hora, nombre, teléfono y correo electrónico.', ru: 'Заполните дату, время, имя, телефон и email.' },
    errReturn: { en: 'Please add the return date and time.', es: 'Añada la fecha y la hora del regreso.', ru: 'Укажите дату и время обратного рейса.' },
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
    note: { en: '<b>Per vehicle, one way.</b> Gratuity, tolls and airport/port parking not included. 30% supplement midnight–6 a.m. An exact street address can adjust the fare; you always approve it in writing first.', es: '<b>Por vehículo, solo ida.</b> No incluye propina, peajes ni estacionamiento en aeropuerto/puerto. Recargo del 30 % de 00:00 a 6:00. Una dirección exacta puede ajustar la tarifa; usted siempre la aprueba por escrito antes.', ru: '<b>За автомобиль, в одну сторону.</b> Чаевые, платные дороги и парковка в аэропорту/порту не включены. Надбавка 30% с 00:00 до 06:00. Точный адрес может изменить цену; вы всегда согласовываете её в письменном виде.' },
    noteH: { en: '<b>Per vehicle, by the hour.</b> {d}% off from {f} hours. Gratuity not included; fuel and tolls are. 30% supplement midnight–6 a.m. Stops and waiting within your booked time are included; you always approve the fare in writing first.', es: '<b>Por vehículo, por horas.</b> {d} % de descuento desde {f} horas. No incluye propina; combustible y peajes sí. Recargo del 30 % de 00:00 a 6:00. Las paradas y esperas dentro del tiempo reservado están incluidas; usted siempre aprueba la tarifa por escrito antes.', ru: '<b>За автомобиль, почасово.</b> Скидка {d}% от {f} часов. Чаевые не включены; топливо и платные дороги включены. Надбавка 30% с 00:00 до 06:00. Остановки и ожидание в рамках заказанного времени включены; цену вы всегда согласовываете письменно заранее.' }
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
  function lateNight(timeStr) {
    if (!timeStr) return false;
    var h = parseInt(timeStr.split(':')[0], 10);
    return h >= 0 && h < 6;
  }
  function lateFee(base) { return roundTo(base * (1 + D.lateNightPct / 100), D.pricing.round); }
  function leg(base, timeStr) { return lateNight(timeStr) ? lateFee(base) : base; }

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

  /* By the hour: rate x hours; from discFrom hours the whole booking gets discPct off. */
  function hourly(n) {
    var disc = n >= H.discFrom;
    var rate = disc ? H.rate * (100 - H.discPct) / 100 : H.rate;
    return { hours: n, rate: rate, disc: disc, price: roundTo(n * rate, 5) };
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
  function hourOptions() {
    var h = '';
    for (var n = H.min; n <= H.max; n++) h += '<option value="' + n + '"' + (n === H.min ? ' selected' : '') + '>' + esc(t('hoursOpt', { n: n })) + '</option>';
    return h;
  }
  function occOptions() {
    var h = '', list = S.occList[LANG] || S.occList.en;
    for (var i = 0; i < list.length; i++) h += '<option value="' + i + '"' + (i === 0 ? ' selected' : '') + '>' + esc(list[i]) + '</option>';
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
      '<div class="qw-tabs" role="tablist">' +
      '<button type="button" role="tab" class="qw-tab" id="' + uid + 'tt" data-mode="transfer" aria-selected="true">' + t('tabTransfer') + '</button>' +
      '<button type="button" role="tab" class="qw-tab" id="' + uid + 'th" data-mode="hourly" aria-selected="false" tabindex="-1">' + t('tabHourly') + '</button></div>' +
      '<div class="qw-route qw-pane-transfer">' +
      '<div class="qw-field"><div class="qw-lr"><label for="' + uid + 'f">' + t('pickup') + '</label></div><select id="' + uid + 'f" class="qw-from">' + opts + '</select></div>' +
      '<div class="qw-field"><div class="qw-lr"><label for="' + uid + 't">' + t('dropoff') + '</label>' +
      '<button type="button" class="qw-swap" aria-label="' + esc(t('swapAria')) + '"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 13V3M2 5.5L4.5 3 7 5.5M11.5 3v10M9 10.5l2.5 2.5 2.5-2.5"/></svg>' + t('swap') + '</button></div>' +
      '<select id="' + uid + 't" class="qw-to">' + opts + '</select></div>' +
      '</div>' +
      '<div class="qw-route qw-pane-hourly" hidden>' +
      '<div class="qw-field"><div class="qw-lr"><label for="' + uid + 'hs">' + t('start') + '</label></div><select id="' + uid + 'hs" class="qw-hstart">' + opts + '</select></div>' +
      '<div class="qw-two"><div class="qw-field"><div class="qw-lr"><label for="' + uid + 'hh">' + t('hours') + '</label></div><select id="' + uid + 'hh" class="qw-hours">' + hourOptions() + '</select></div>' +
      '<div class="qw-field"><div class="qw-lr"><label for="' + uid + 'ho">' + t('occasion') + '</label></div><select id="' + uid + 'ho" class="qw-occ">' + occOptions() + '</select></div></div>' +
      '</div>' +
      '<div class="qw-result" aria-live="polite"></div>' +
      '<form class="qw-form" hidden novalidate>' +
      '<div class="qw-grid">' +
      '<div class="qw-field"><label for="' + uid + 'd">' + t('fDate') + '</label><input id="' + uid + 'd" name="date" type="date" required></div>' +
      '<div class="qw-field"><label for="' + uid + 'tm">' + t('fTime') + '</label><input id="' + uid + 'tm" name="time" type="time" required></div>' +
      '<div class="qw-field qw-ret" hidden><label for="' + uid + 'rd">' + t('fRDate') + '</label><input id="' + uid + 'rd" name="returnDate" type="date"></div>' +
      '<div class="qw-field qw-ret" hidden><label for="' + uid + 'rt">' + t('fRTime') + '</label><input id="' + uid + 'rt" name="returnTime" type="time"></div>' +
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
      '<p class="qw-note"></p>' +
      '</div>';

    var from = root.querySelector('.qw-from'), to = root.querySelector('.qw-to');
    var hstart = root.querySelector('.qw-hstart'), hoursSel = root.querySelector('.qw-hours'), occSel = root.querySelector('.qw-occ');
    var result = root.querySelector('.qw-result'), form = root.querySelector('.qw-form');
    var done = root.querySelector('.qw-done'), late = root.querySelector('.qw-late'), err = root.querySelector('.qw-err');
    var note = root.querySelector('.qw-note');
    var tabs = root.querySelectorAll('.qw-tab');
    var paneT = root.querySelector('.qw-pane-transfer'), paneH = root.querySelector('.qw-pane-hourly');
    var retFields = root.querySelectorAll('.qw-ret');
    var state = { mode: 'transfer', q: null, ret: false, total: 0, late: false };
    from.value = 'h:MIA';
    hstart.value = 'p:0';
    var def = null;
    for (var i = 0; i < places.length; i++) { if (places[i][0].indexOf('Miami Beach') === 0) def = i; }
    to.value = 'p:' + (def == null ? 0 : def);
    if (def != null) hstart.value = 'p:' + def;
    var now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    var today = now.toISOString().slice(0, 10);
    form.elements.date.min = today; form.elements.returnDate.min = today;

    function labelOf(sel) { return sel.options[sel.selectedIndex].text; }
    function enName(v) {
      if (v === 'x') return 'Other city or street address';
      return v.charAt(0) === 'h' ? hubs[v.slice(2)].label : places[parseInt(v.slice(2), 10)][0];
    }
    function occEn() { return S.occList.en[parseInt(occSel.value, 10)] || ''; }

    /* totals for the current mode, time-aware (late-night supplement per pickup) */
    function compute() {
      var tm = form.elements.time.value, rt = form.elements.returnTime.value;
      if (state.mode === 'hourly') {
        var h = hourly(parseInt(hoursSel.value, 10));
        state.h = h; state.late = lateNight(tm);
        state.total = leg(h.price, tm);
        return;
      }
      var q = state.q;
      if (!q) { state.total = 0; state.late = false; return; }
      var out = leg(q.price, tm);
      var back = Math.round(q.price * (100 - RET) / 100);
      state.out = out; state.backBase = back; state.back = leg(back, rt);
      state.late = lateNight(tm) || (state.ret && lateNight(rt));
      state.total = out + (state.ret ? state.back : 0);
    }

    function renderNote() { note.innerHTML = state.mode === 'hourly' ? t('noteH', { d: H.discPct, f: H.discFrom }) : t('note'); }

    function render() {
      done.hidden = true;
      renderNote();
      if (state.mode === 'hourly') { renderHourly(); return; }
      var q = quote(from.value, to.value);
      state.q = q;
      if (!q) {
        var same = from.value === to.value && from.value !== 'x';
        var wa = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Hi, I’d like a quote.\nPickup: ' + enName(from.value) + '\nDrop-off: ' + enName(to.value));
        result.innerHTML = '<p class="qw-msg">' + (same ? t('same') : t('custom')) + '</p>' +
          (same ? '' : '<div class="qw-actions"><a class="btn btn-gold" href="' + wa + '" target="_blank" rel="noopener">WhatsApp</a><a class="btn btn-ghost" href="tel:' + PHONE + '">' + t('call') + '</a></div>');
        form.hidden = true; state.total = 0;
        return;
      }
      compute();
      var airport = q.hub.kind === 'airport';
      var back = state.backBase, saved = q.price - back;
      var shown = state.ret ? state.total : state.out;
      var top, facts;
      if (state.ret) {
        top = '<div><span class="qw-kicker">' + t('roundKicker') + '</span><span class="qw-cap">' + t('roundCap') + '</span></div>';
        facts = '<li>' + t('outLabel', { p: money(state.out) }) + '</li><li>' + t('retLabel', { p: money(state.back) }) + '</li><li>' + t('saveLabel', { s: money(saved) }) + '</li>';
      } else {
        top = '<div><span class="qw-kicker">' + t('car') + '</span><span class="qw-cap">' + t('cap') + '</span></div>';
        facts = '<li>' + t('mi', { n: Math.round(q.miles) }) + '</li><li>' + t('drive', { t: q.free + (q.rush > q.free ? '–' + q.rush : '') }) + '</li><li>' + (airport ? t('wait') : t('door')) + '</li>';
      }
      result.innerHTML =
        '<div class="qw-fare"><div class="qw-fare-top">' + top +
        '<div class="qw-amt" aria-label="' + esc(t('fareAria', { n: shown })) + '">' + money(shown) + '</div></div>' +
        '<ul class="qw-facts">' + facts + '</ul></div>' +
        '<label class="qw-return"><input type="checkbox" class="qw-ret-cb"' + (state.ret ? ' checked' : '') + '>' +
        '<span class="qw-return-t"><b>' + t('returnLabel', { p: RET }) + '</b><i>' + t('returnSub', { r: money(back), f: money(q.price) }) + '</i></span></label>' +
        (form.hidden ? '<button type="button" class="btn btn-gold qw-reserve">' + t('choose') + '</button>' : '');
      bindResult();
      updateLate();
    }

    function renderHourly() {
      state.q = { hub: { id: 'HOURLY' }, place: enName(hstart.value) };
      compute();
      var h = state.h, shown = state.total;
      var cap = h.disc ? t('hCapDisc', { n: h.hours, r: money(h.rate), d: H.discPct, f: H.discFrom }) : t('hCap', { n: h.hours, r: money(h.rate) });
      result.innerHTML =
        '<div class="qw-fare"><div class="qw-fare-top">' +
        '<div><span class="qw-kicker">' + t('hKicker', { n: h.hours }) + '</span><span class="qw-cap">' + cap + '</span></div>' +
        '<div class="qw-amt" aria-label="' + esc(t('fareAria', { n: shown })) + '">' + money(shown) + '</div></div>' +
        '<ul class="qw-facts"><li>' + t('hFact1') + '</li><li>' + t('hFact2') + '</li><li>' + t('hFact3', { m: H.min }) + '</li></ul></div>' +
        (form.hidden ? '<button type="button" class="btn btn-gold qw-reserve">' + t('choose') + '</button>' : '');
      bindResult();
      updateLate();
    }

    function bindResult() {
      var b = result.querySelector('.qw-reserve');
      if (b) b.addEventListener('click', function () {
        form.hidden = false; b.remove();
        if (typeof gtag === 'function') gtag('event', 'quote_reserve_open', { event_category: 'quote', event_label: state.mode + ':' + (state.q ? state.q.place : ''), value: state.total });
        form.elements.date.focus();
      });
      var cb = result.querySelector('.qw-ret-cb');
      if (cb) cb.addEventListener('change', function () { state.ret = cb.checked; syncRet(); render(); });
    }

    function syncRet() {
      for (var i = 0; i < retFields.length; i++) retFields[i].hidden = !(state.mode === 'transfer' && state.ret);
      form.elements.returnDate.required = state.ret; form.elements.returnTime.required = state.ret;
    }

    function updateLate() {
      compute();
      var amt = result.querySelector('.qw-amt');
      if (amt) {
        var shown = state.mode === 'hourly' ? state.total : (state.ret ? state.total : state.out);
        amt.textContent = money(shown);
        amt.setAttribute('aria-label', t('fareAria', { n: shown }));
        if (state.mode === 'transfer' && state.ret) {
          var l1 = result.querySelector('.qw-facts li:nth-child(1)'), l2 = result.querySelector('.qw-facts li:nth-child(2)');
          if (l1 && l2) { l1.textContent = t('outLabel', { p: money(state.out) }); l2.textContent = t('retLabel', { p: money(state.back) }); }
        }
      }
      late.hidden = !state.late;
      if (state.late) late.innerHTML = t('late', { p: money(state.total) });
    }

    function setMode(mode, focusTab) {
      state.mode = mode;
      for (var i = 0; i < tabs.length; i++) {
        var on = tabs[i].getAttribute('data-mode') === mode;
        tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
        tabs[i].tabIndex = on ? 0 : -1;
        if (on && focusTab) tabs[i].focus();
      }
      paneT.hidden = mode !== 'transfer'; paneH.hidden = mode !== 'hourly';
      syncRet(); form.hidden = true; done.hidden = true; err.hidden = true;
      if (typeof gtag === 'function') gtag('event', 'quote_mode', { event_category: 'quote', event_label: mode });
      render();
    }
    for (var ti = 0; ti < tabs.length; ti++) {
      (function (tab) {
        tab.addEventListener('click', function () { setMode(tab.getAttribute('data-mode')); });
        tab.addEventListener('keydown', function (ev) {
          if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') { ev.preventDefault(); setMode(state.mode === 'transfer' ? 'hourly' : 'transfer', true); }
        });
      })(tabs[ti]);
    }
    root.__qw = { setMode: setMode };

    var tracked = false;
    function changed() {
      render();
      if (!tracked && state.q && typeof gtag === 'function') { tracked = true; gtag('event', 'quote_view', { event_category: 'quote', event_label: state.mode + ':' + state.q.place, value: state.total }); }
    }
    from.addEventListener('change', changed);
    to.addEventListener('change', changed);
    hstart.addEventListener('change', changed);
    hoursSel.addEventListener('change', changed);
    occSel.addEventListener('change', changed);
    root.querySelector('.qw-swap').addEventListener('click', function () { var a = from.value; from.value = to.value; to.value = a; changed(); });
    form.elements.time.addEventListener('change', updateLate);
    form.elements.returnTime.addEventListener('change', updateLate);
    form.elements.date.addEventListener('change', function () { form.elements.returnDate.min = form.elements.date.value || today; });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!state.total) return;
      var f = form.elements;
      err.hidden = true;
      var missing = [];
      ['date', 'time', 'name', 'phone', 'email'].forEach(function (k) { if (!f[k].value.trim()) missing.push(k); });
      if (missing.length) { err.textContent = t('errFill'); err.hidden = false; return; }
      if (state.mode === 'transfer' && state.ret && (!f.returnDate.value || !f.returnTime.value)) { err.textContent = t('errReturn'); err.hidden = false; return; }
      if (!/^\S+@\S+\.\S+$/.test(f.email.value.trim())) { err.textContent = t('errMail'); err.hidden = false; return; }
      if (f.website.value) return; /* honeypot */
      compute();
      var hm = state.mode === 'hourly';
      /* The request goes to the dispatcher, so route names stay in English whatever the page language. */
      var payload = {
        submitted: new Date().toISOString(), page: location.pathname, lang: LANG,
        service: hm ? 'hourly' : 'transfer',
        pickup: hm ? enName(hstart.value) : enName(from.value), dropoff: hm ? '' : enName(to.value),
        hours: hm ? state.h.hours : '',
        returnTrip: !hm && state.ret, returnDate: (!hm && state.ret) ? f.returnDate.value : '', returnTime: (!hm && state.ret) ? f.returnTime.value : '',
        quotedFare: state.total, lateNight: !!state.late,
        date: f.date.value, time: f.time.value, passengers: f.pax.value, flight: f.flight.value.trim(),
        address: f.address.value.trim(), name: f.name.value.trim(), phone: f.phone.value.trim(),
        email: f.email.value.trim(), notes: ((hm ? '[' + occEn() + '] ' : '') + f.notes.value.trim()).trim()
      };
      if (typeof gtag === 'function') gtag('event', 'generate_lead', { event_category: 'quote', event_label: state.mode + ':' + (state.q ? state.q.place : ''), value: state.total, currency: 'USD' });
      var routeShown = hm ? labelOf(hstart) + ' · ' + t('hoursOpt', { n: state.h.hours }) : labelOf(from) + ' → ' + labelOf(to) + (state.ret ? ' ⇄' : '');
      var summary = money(state.total) + ' · ' + routeShown + ' · ' + payload.date + ' ' + payload.time;
      var waLines = ['New ' + (hm ? 'hourly' : (state.ret ? 'round-trip' : 'ride')) + ' request — Onyx Executive Miami (' + LANG.toUpperCase() + ' site)', '',
        'Quoted total: ' + money(state.total) + (payload.lateNight ? ' (incl. late-night supplement)' : '')];
      if (hm) waLines.push('By the hour: ' + payload.hours + ' h from ' + payload.pickup);
      else waLines.push('Pickup: ' + payload.pickup, 'Drop-off: ' + payload.dropoff);
      waLines.push('Address: ' + (payload.address || '—'), 'Date/time: ' + payload.date + ' ' + payload.time);
      if (payload.returnTrip) waLines.push('Return: ' + payload.returnDate + ' ' + payload.returnTime);
      waLines.push('Passengers: ' + payload.passengers, 'Flight: ' + (payload.flight || '—'), 'Name: ' + payload.name, 'Phone: ' + payload.phone, 'Email: ' + payload.email, 'Notes: ' + (payload.notes || '—'));
      var waUrl = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(waLines.join('\n'));

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

  /* Links elsewhere on the page: <a href="#instant-quote" data-qw-mode="hourly"> opens that tab. */
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('[data-qw-mode]');
    if (!a || !roots.length || !roots[0].__qw) return;
    roots[0].__qw.setMode(a.getAttribute('data-qw-mode'));
  });
  if (location.hash === '#hourly' && roots.length && roots[0].__qw) roots[0].__qw.setMode('hourly');
})();
