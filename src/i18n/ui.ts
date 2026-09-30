// Interface strings shared by every page: header, mobile menu, footer, mobile call bar, 404.
// Page copy lives in the pages themselves (src/pages/<lang>/*.astro, generated from English).

export const LANGS = ['en', 'es', 'ru'] as const;
export type Lang = (typeof LANGS)[number];
export const SITE = 'https://onyxexecmiami.com';

// Prefix for page links: English pages live at the root, others under /es/ and /ru/.
export const prefix = (lang: Lang) => (lang === 'en' ? '/' : `/${lang}/`);

// Absolute URL of a page ("index.html" is the language root).
export function pageUrl(lang: Lang, page: string) {
  const base = lang === 'en' ? '/' : `/${lang}/`;
  return SITE + base + (page === 'index.html' ? '' : page);
}

export const ui = {
  en: {
    region: 'Miami-Dade · Broward · Palm Beach',
    airport: 'Airport', commercialAirports: 'Commercial Airports',
    mia: 'Miami (MIA)', fll: 'Fort Lauderdale (FLL)', pbi: 'Palm Beach (PBI)',
    privateAviationFbo: 'Private Aviation / FBO', allAirport: 'All Airport Transfers →',
    corporate: 'Corporate', services: 'Services',
    executiveChauffeur: 'Executive Chauffeur', eventTransportation: 'Event Transportation',
    schoolTransportation: 'School Transportation', longDistance: 'Long-Distance',
    fleet: 'Fleet', serviceArea: 'Service Area',
    aventura: 'Aventura', sunnyIsles: 'Sunny Isles Beach', balHarbour: 'Bal Harbour',
    brickell: 'Brickell / Downtown', fortLauderdale: 'Fort Lauderdale', miamiBeach: 'Miami Beach',
    allAreas: 'All Service Areas →', blog: 'Blog', contact: 'Contact',
    callCta: 'Call +1 786 931 ONYX (6699)', menu: 'Menu',
    footTag: 'Boutique executive transportation across South Florida.',
    fServices: 'Services', fAirport: 'Airport transfers', fPrivateAviation: 'Private aviation / FBO',
    fCorporate: 'Corporate', fExecutive: 'Executive chauffeur', fSchool: 'School transportation',
    fEvent: 'Event transportation', fLong: 'Long-distance',
    fCompany: 'Company', fStandard: 'The Onyx Standard', fVehicle: 'Our vehicle', fArea: 'Service area',
    fBlog: 'Blog', fFaq: 'FAQ', fContactLink: 'Contact', fContact: 'Contact',
    licensed: 'Licensed &amp; insured · Miami-Dade Permit #64666 · Direct booking by phone or WhatsApp',
    griddTitle: 'Member of the GRiDD Transportation Network', griddAlt: 'GRiDD Transportation Network member',
    call: 'Call', waQuote: 'Hi, I\'d like a quote.',
    nf: {
      title: 'Page not found | Onyx Executive Miami', eyebrow: 'Error 404 · Page not found',
      h1a: 'A wrong turn.', h1b: 'Your chauffeur knows the way back.',
      lead: 'The page you asked for has moved or never existed. Pick a destination below, or reach us directly — we answer the phone.',
      home: 'Back to Home', call: 'Call +1 786 931 ONYX', menuLabel: 'Main sections',
      alt: 'Black Onyx Executive Chevrolet Suburban on a rooftop with the Miami skyline behind it',
      tiles: [
        ['airport-transfers.html', 'Airport Transfers', 'MIA · FLL · PBI'],
        ['private-aviation.html', 'Private Aviation', 'FBO & jet-side'],
        ['corporate.html', 'Corporate', 'Accounts & roadshows'],
        ['executive-chauffeur.html', 'Executive Chauffeur', 'Hourly, as directed'],
        ['fleet.html', 'Fleet', 'Chevrolet Suburban'],
        ['service-area.html', 'Service Area', 'Miami-Dade to Palm Beach'],
        ['blog.html', 'Journal', 'Guides & local notes'],
        ['contact.html', 'Contact', 'Quote in minutes'],
      ],
    },
  },
  es: {
    region: 'Miami-Dade · Broward · Palm Beach',
    airport: 'Aeropuerto', commercialAirports: 'Aeropuertos Comerciales',
    mia: 'Miami (MIA)', fll: 'Fort Lauderdale (FLL)', pbi: 'Palm Beach (PBI)',
    privateAviationFbo: 'Aviación Privada / FBO', allAirport: 'Todos los Traslados →',
    corporate: 'Corporativo', services: 'Servicios',
    executiveChauffeur: 'Chófer Ejecutivo', eventTransportation: 'Transporte para Eventos',
    schoolTransportation: 'Transporte Escolar', longDistance: 'Larga Distancia',
    fleet: 'Flota', serviceArea: 'Zona de Servicio',
    aventura: 'Aventura', sunnyIsles: 'Sunny Isles Beach', balHarbour: 'Bal Harbour',
    brickell: 'Brickell / Centro', fortLauderdale: 'Fort Lauderdale', miamiBeach: 'Miami Beach',
    allAreas: 'Todas las Zonas →', blog: 'Blog', contact: 'Contacto',
    callCta: 'Llamar +1 786 931 ONYX (6699)', menu: 'Menú',
    footTag: 'Transporte ejecutivo boutique en el sur de Florida.',
    fServices: 'Servicios', fAirport: 'Traslados al aeropuerto', fPrivateAviation: 'Aviación privada / FBO',
    fCorporate: 'Corporativo', fExecutive: 'Chófer ejecutivo', fSchool: 'Transporte escolar',
    fEvent: 'Transporte para eventos', fLong: 'Larga distancia',
    fCompany: 'Compañía', fStandard: 'El Estándar Onyx', fVehicle: 'Nuestro vehículo', fArea: 'Zona de servicio',
    fBlog: 'Blog', fFaq: 'Preguntas frecuentes', fContactLink: 'Contacto', fContact: 'Contacto',
    licensed: 'Con licencia y seguro · Permiso de Miami-Dade #64666 · Reserva directa por teléfono o WhatsApp',
    griddTitle: 'Miembro de GRiDD Transportation Network', griddAlt: 'Miembro de GRiDD Transportation Network',
    call: 'Llamar', waQuote: 'Hola, quisiera una cotización.',
    nf: {
      title: 'Página no encontrada | Onyx Executive Miami', eyebrow: 'Error 404 · Página no encontrada',
      h1a: 'Un giro equivocado.', h1b: 'Su chófer conoce el camino de vuelta.',
      lead: 'La página que busca se ha movido o nunca existió. Elija un destino abajo o contáctenos directamente: respondemos el teléfono.',
      home: 'Volver al inicio', call: 'Llamar +1 786 931 ONYX', menuLabel: 'Secciones principales',
      alt: 'Chevrolet Suburban negro de Onyx Executive en una azotea con el horizonte de Miami detrás',
      tiles: [
        ['airport-transfers.html', 'Traslados al Aeropuerto', 'MIA · FLL · PBI'],
        ['private-aviation.html', 'Aviación Privada', 'FBO y pie de avión'],
        ['corporate.html', 'Corporativo', 'Cuentas y roadshows'],
        ['executive-chauffeur.html', 'Chófer Ejecutivo', 'Por horas, a disposición'],
        ['fleet.html', 'Flota', 'Chevrolet Suburban'],
        ['service-area.html', 'Zona de Servicio', 'De Miami-Dade a Palm Beach'],
        ['blog.html', 'Blog', 'Guías y notas locales'],
        ['contact.html', 'Contacto', 'Cotización en minutos'],
      ],
    },
  },
  ru: {
    region: 'Майами-Дейд · Бровард · Палм-Бич',
    airport: 'Аэропорт', commercialAirports: 'Коммерческие аэропорты',
    mia: 'Майами (MIA)', fll: 'Форт-Лодердейл (FLL)', pbi: 'Палм-Бич (PBI)',
    privateAviationFbo: 'Частная авиация / FBO', allAirport: 'Все трансферы →',
    corporate: 'Бизнесу', services: 'Услуги',
    executiveChauffeur: 'Executive-шофёр', eventTransportation: 'Транспорт для мероприятий',
    schoolTransportation: 'Школьный транспорт', longDistance: 'Дальние поездки',
    fleet: 'Автомобиль', serviceArea: 'Районы',
    aventura: 'Авентура', sunnyIsles: 'Санни-Айлс', balHarbour: 'Бал-Харбор',
    brickell: 'Бриквелл / Центр', fortLauderdale: 'Форт-Лодердейл', miamiBeach: 'Майами-Бич',
    allAreas: 'Все зоны →', blog: 'Блог', contact: 'Контакты',
    callCta: 'Позвонить +1 786 931 ONYX (6699)', menu: 'Меню',
    footTag: 'Бутиковый executive-транспорт по Южной Флориде.',
    fServices: 'Услуги', fAirport: 'Трансферы из аэропорта', fPrivateAviation: 'Частная авиация / FBO',
    fCorporate: 'Корпоративным клиентам', fExecutive: 'Executive-шофёр', fSchool: 'Школьный транспорт',
    fEvent: 'Транспорт для мероприятий', fLong: 'Дальние поездки',
    fCompany: 'Компания', fStandard: 'Стандарт Onyx', fVehicle: 'Наш автомобиль', fArea: 'Зона обслуживания',
    fBlog: 'Блог', fFaq: 'Вопросы и ответы', fContactLink: 'Контакты', fContact: 'Контакты',
    licensed: 'Лицензия и страховка · Miami-Dade Permit #64666 · Прямая запись по телефону или WhatsApp',
    griddTitle: 'Участник GRiDD Transportation Network', griddAlt: 'Участник GRiDD Transportation Network',
    call: 'Позвонить', waQuote: 'Здравствуйте, хотел бы узнать стоимость поездки.',
    nf: {
      title: 'Страница не найдена | Onyx Executive Miami', eyebrow: 'Ошибка 404 · Страница не найдена',
      h1a: 'Не тот поворот.', h1b: 'Ваш шофёр знает дорогу обратно.',
      lead: 'Страница, которую вы искали, переехала или никогда не существовала. Выберите раздел ниже или свяжитесь с нами напрямую — мы берём трубку.',
      home: 'На главную', call: 'Позвонить +1 786 931 ONYX', menuLabel: 'Основные разделы',
      alt: 'Чёрный Chevrolet Suburban Onyx Executive на крыше на фоне небоскрёбов Майами',
      tiles: [
        ['airport-transfers.html', 'Трансферы из аэропорта', 'MIA · FLL · PBI'],
        ['private-aviation.html', 'Частная авиация', 'FBO и к трапу'],
        ['corporate.html', 'Корпоративным клиентам', 'Договоры и роуд-шоу'],
        ['executive-chauffeur.html', 'Executive-шофёр', 'Почасово, по вашему плану'],
        ['fleet.html', 'Автомобиль', 'Chevrolet Suburban'],
        ['service-area.html', 'Зона обслуживания', 'От Майами-Дейд до Палм-Бич'],
        ['blog.html', 'Блог', 'Гайды и заметки'],
        ['contact.html', 'Контакты', 'Расчёт за минуты'],
      ],
    },
  },
} as const;
