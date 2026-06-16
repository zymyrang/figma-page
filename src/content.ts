// ============================================================
//  СОДЕРЖИМОЕ САЙТА — единственное место для правки текстов
// ============================================================
//
// Контент двуязычный: блок RU и блок EN с одинаковой структурой.
// Меняйте только текст внутри кавычек "...", не трогайте имена полей.
// Язык переключается свитчером в шапке (см. LanguageProvider).
//
// ============================================================

// ---- автохелпер для русской типографики (не редактировать) -------
// Приклеивает предлоги/союзы к следующему слову, частицы же/бы/ли —
// к предыдущему, неразрывным пробелом. На английский не влияет
// (регэксп кириллический).
function nbsp(s: string): string {
  const NBSP = String.fromCharCode(0xa0);
  return s
    .replace(
      /(?<=\s|^)(из-за|из-под|чтобы|через|между|перед|когда|если|либо|чтоб|обо|изо|для|при|под|над|без|про|или|что|чем|как|ко|на|по|до|за|от|из|во|со|об|но|не|ни|то|да|в|к|с|у|о|и|а|я)\s+/giu,
      "$1" + NBSP,
    )
    .replace(/\s+(же|бы|ли)(?=[\s.,!?;:)»…]|$)/giu, NBSP + "$1");
}

function process<T>(value: T): T {
  if (typeof value === "string") return nbsp(value) as unknown as T;
  if (Array.isArray(value))
    return value.map((v) => process(v)) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value as object)) {
      out[k] = process((value as Record<string, unknown>)[k]);
    }
    return out as T;
  }
  return value;
}

// ============================================================
//  РУССКИЙ КОНТЕНТ
// ============================================================
const ruContent = {
  ui: {
    learnMore: "Подробнее",
    readCase: "прочитать кейс",
    comingSoon: "скоро",
    hypothesis: "гипотеза",
    solution: "Решение",
    result: "Результат",
    variantA: "Вариант А",
    variantB: "Вариант B",
    why: "Почему так",
    step: "шаг",
    back: "Назад",
  },

  site: {
    name: "Жаркын Калыш",
    navLinks: [
      {
        label: "CV",
        href: "https://drive.google.com/file/d/1IAsOP_65Figocd-37Q0DyOS85sA121I7/view?usp=sharing",
      },
      { label: "Телеграм", href: "https://t.me/unluckycat1" },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/zharkyn-kalysh-82820b198",
      },
    ],
    footer: {
      copyright: "© 2026 by me · claude code · bunch of caffeine",
    },
  },

  home: {
    bio: {
      greetingWords: ["Привет!", "Hi!", "こんにちは!", "مرحبا!"],
      name: "Я Жаркын.",
      prefix:
        "Продуктовый дизайнер c 6 лет опыта \nпроектирования различных B2C, B2B продуктов в финтехе и телекоме.",
    },
    experience: {
      label: "Опыт",
      albumTitle: "Career",
      albumYears: "2020–∞",
      accent: "#D85A30",
      tracks: [
        { company: "Freedom Bank", duration: "2020 — 2021" },
        { company: "Теле2", duration: "2021 — 2022" },
        { company: "Т-Банк", duration: "2022 — 2024" },
        {
          company: "Альфа-Банк",
          duration: "2024 — сейчас",
          current: true,
        },
      ],
    },
    projectsLabel: "Что я делаю в Альфа-Банке",
    projectPreviewText: "АДеньги —\nпартнёр\nАльфа-Банка",
    playground: {
      hint: "порисуй чё-нибудь и отпусти на волю",
      clear: "очистить",
      release: "отпустить ↗",
    },
    projects: [
      {
        href: "/projects/alfabank-passport",
        name: "Как анкета с селфи принесла \n+50 млн за 2025",
        tags: "",
        description: "Сократил время заполнения анкеты — вместо заполнения полей теперь можно сфоткать паспорт.",
        metric1Label: "",
        metric1Value: "",
        metric2Label: "",
        metric2Value: "",
      },
      {
        href: "/projects/alfabank-mfo",
        name: "Поднял конверсию \nи take rate в 2 раза у микрозаймов",
        tags: "",
        description: "Переработал страницу микрозаймов на сайте.",
        metric1Label: "",
        metric1Value: "",
        metric2Label: "",
        metric2Value: "",
      },
    ],
    tbankProjectsLabel: "Что я делал в Т-Банке",
    tbankProjects: [
      {
        href: "#",
        name: "T-Bank — финансовое суперприложение",
        tags: "",
        description: "",
        metric1Label: "",
        metric1Value: "",
        metric2Label: "",
        metric2Value: "",
      },
    ],
    about: {
      title: "Помимо дизайна",
      body: "Занимаюсь болдерингом и изучаю японский. Пока не дошёл до уровня смотреть аниме без субтитров, но всё впереди.",
      cats: "/figma/2.jpg",
      capybaras: "/figma/1.png",
      video: "/figma/3.mp4",
      nintendo: "/figma/4.jpg",
      nowPlaying: {
        track: "4 Raws",
        artist: "EsDeeKid",
        cover: "/figma/4-raws-cover.jpg",
        url: "https://open.spotify.com/track/554qQSs9lpRVq6TlaaiIKT",
        bg: "#1e1e1e",
      },
    },
  },

  alfabank: {
    intro: {
      title: "Чем занимаюсь в Альфе",
      body: "Отвечаю за страницу кредитов и МФО на сайте, занимаюсь полным циклом анкет — от начала заявки до выдачи кредита и микрозаймов.",
    },
    factsheet: [
      { label: "Период", value: "Март 2024 — сейчас" },
      { label: "Роль", value: "Продуктовый дизайнер" },
      { label: "Пользователи", value: "NewToBank и клиенты банка" },
      { label: "Платформа", value: "Mobile, desktop" },
      {
        label: "Команда",
        value:
          "ПО, продуктовый диз, \nсистемный аналитик, \nфронтэндер, бэкендер, тестер",
      },
      { label: "Дизайн-система", value: "Alfa Design System" },
    ],
  },

  alfabankMfo: {
    intro: {
      title: "МФО",
      body: "Четыре гипотезы и AB-тесты на странице микрозаймов на сайте Альфа-Банка. В два раза поднял общий CR, в полтора — Take Rate займов.",
    },
    toc: [
      { id: "context", label: "Контекст" },
      { id: "before", label: "Как было до" },
      { id: "problem", label: "Проблема" },
      { id: "insights", label: "Инсайты" },
      { id: "hypotheses", label: "Гипотезы" },
      { id: "quick-offers", label: "Быстрые офферы" },
      { id: "postanalysis", label: "Постанализ" },
    ],
    projectTitle: "Как я поднял конверсию \nи take rate в 2 раза у микрозаймов",
    summary: {
      body: "Переработал страницу микрозаймов на сайте Альфа-Банка. \nКонверсия в заявку выросла в 2 раза, Take Rate займов — в ~2 раза.",
      stats: [
        { value: "в 2 раза", description: "повысил общую конверсию в заявку" },
        { value: "в 1.5 раза", description: "повысил Take Rate займов" },
      ],
    },
    credits: [
      {
        label: "Роль",
        value:
          "Product Designer — discovery, UX-гипотезы, A/B-тесты, пилот нового UI",
      },
      { label: "Команда", value: "PM, аналитик, 2 разработчика" },
      { label: "Сроки", value: "Q3 — Q4 2025" },
    ],
    heroVideo: "/projects/alfabank/preview.mp4",
    context: {
      label: "Контекст",
      body: "Альфа-Деньги — один из ключевых продуктов для привлечения клиентов на микрозаймы. Клиент может заполнить онлайн-анкету и получить микрозайм в течении 5 минут на карту.",
      metrics: [
        { value: "~ 550 K", label: "MAU" },
        { value: "10%", label: "CR" },
        { value: "9%", label: "TR" },
      ],
      note: "Данные за 2025 год",
    },
    before: {
      label: "Как выглядел раздел раньше",
      body: "На странице критичных проблем особо не было. Страница несколько лет спокойно работала, приносила заявки, не вызывала потока жалоб. Метрики держались в норме, показатель отказов — в зелёной зоне.",
      video: "/projects/alfabank/how-it-was.mov",
    },
    problem: {
      title: "А в чём тогда проблема?",
      body: "Я уже давно понимал, что страница устарела и было ощущение, \nчто я недополучаю конверсию. Промониторил сеансы по вебвизору, поговорил с пользователями на интервью и выяснил:",
      stats: [
        {
          value: "34%",
          description: "не доскролливали до формы заявки \nи уходили",
        },
        {
          value: "7 из 8 респов",
          description: "возвращались к началу страницы \nв поисках условий",
        },
      ],
      bodyExtra:
        "Сама страница обросла огромным количеством легаси и каждая новая UX-доработка должна была пройти через понимание технических ограничений, которые местами очень сильно вставляли палки в колёса.",
      taskTitle: "Определение задачи",
      taskGoals:
        "Цель на квартал: поднять CR с 10% и TR с 9%. Сверх продуктовой задачи — пилотировать новый UI Альфа-Банка на этой странице.",
      taskBody:
        "Была квартальная цель - увеличить CR и TR. Можно было экспериментировать и использовать все доступные ресуры на обкатку. \nНу а я, как дизайнер, получил особое поручение, обкатать новый UI Альфа-Банка на этом промежутке и в принципе понять, какой раздел МФО должен быть в будущем. \n\nМного экспериментировал и тестировал разные гипотезы. Расскажу \nо самых важных, которые положительно повлияли на конверсию",
    },
    hypotheses: [
      {
        index: 1,
        hypothesis:
          "Если добавить СТА-кнопку \nв начале страницы, \nто пользователи с большей вероятностью дойдут до заявки",
        solution: "АБ тест: добавить вариант с кнопкой \nи без",
        after: "/projects/alfabank/hypothesis-1-after.mp4",
        before: "/projects/alfabank/hypothesis-1-before.png",
        resultLabel: "Вариант А показал себя лучше: \nCR в заявку больше на",
        resultValue: "7 п.п",
      },
      {
        index: 2,
        hypothesis:
          "Если перенести бенефиты \nи заявку наверх, то повышу конверсию в заявку\n ⠀⠀⠀⠀⠀⠀⠀",
        solution:
          "АБ тест: сократить текст бенефитов \nи перенести с заявкой выше",
        after: "/projects/alfabank/hypothesis-2-after.png",
        before: "/projects/alfabank/hypothesis-2-before.png",
        resultLabel: "Тут тоже вариант А выигрышный. \nCR в заявку вырос на",
        resultValue: "3 п.п",
      },
    ],
    research: {
      label: "Как решали",
      intro: "Полез в вебвизор и вытянул пользователей на интервью.",
      insightsLead: "Из этого вылезли инсайты:",
      insights: [
        "Берут деньги не «вообще», а под конкретные жизненные ситуации: закрыть другой кредит, дожить до зарплаты, сделать косметический ремонт. Универсальный оффер «возьмите займ» не цепляет — он не про их задачу.",
        "У других МФО и банков офферы такие же общие, без сегментации. В нише никто пока не разговаривает с пользователем на языке его ситуации — значит, это свободный карман.",
      ],
      bonusInsightLead: "Первый инсайт",
      bonusInsight:
        "На интервью выяснил, что пользователи на эмоциональном уровне побаиваются самих слов «микрозайм», «займ» и упоминания МФО.",
      secondInsightLead: "Второй инсайт",
      secondInsight: "Самые частые причины взять микрозайм:",
      secondInsightCauses: [
        "закрыть другой кредит",
        "дожить до ЗП",
        "купить лекарства",
      ],
    },
    scaryWords: {
      surrounding: ["мфо", "штраф", "проценты", "комиссия", "заём", "залог"],
      central: "микрозайм",
    },
    howWeSolved: {
      label: "Как решали",
      steps: [
        "Везде убрал слова-блокаторы, часть заменил на более мягкие синонимы. Например: «займ» → «деньги», «одобрение» → «решение \nза 1 минуту» и т.д.",
        "Запустил АБ-тест с двумя вариантами, чтобы снизить тревожность пользователя.",
      ],
      variants: [
        {
          label: "Вариант 1",
          src: "/projects/alfabank/block%20words%20-%201v.mov",
          caption:
            "Этот вариант статзначимых изменений \nв конверсию не дал — предполагаю, \nиз-за баннерной слепоты.",
        },
        {
          label: "Вариант 2",
          src: "/projects/alfabank/block%20words%20-%202v.png",
          caption:
            "2 вариант разместил под заявку — это дало буст примерно на +2 п.п. \nРешил оставить так.",
        },
      ],
    },
    insightUsage: {
      title: "Как использовали инсайт",
      body: "Я предположил, что если показать пользователю быстрые офферы под его задачу — CR в заявку вырастет, потому что человеку не нужно «переводить» свою ситуацию в параметры кредита. Решил не делать АБ, а сразу пошёл в целевую группу, чтобы нащупать интерес.",
      flowLabel: "Путь пользователя",
      flow: [
        "Заходит на страницу",
        "Видит блок с готовыми вариантами под жизненные сценарии",
        "Узнаёт свою ситуацию и кликает «Получить»",
        "Плавный скролл к форме заявки",
        "Поля предзаполнены под сценарий: цель, сумма и срок",
        "При желании корректирует поля",
        "Вводит контактные данные",
        "Отправляет заявку",
      ],
      video: "/projects/alfabank/2%20insight.mov",
      metrics: [
        {
          label: "CTR",
          value: "27%",
          note: "невысокий, но спрос в целом есть",
        },
        {
          label: "CR",
          value: "4%",
          note: "пользователей подали заявку через быстрые офферы",
        },
        { label: "TR", value: "—", note: "статзначимых изменений нет" },
      ],
      conclusion:
        "Ставка на quick offers не оправдалась по take rate: спрос есть — CTR 27%, но в одобренные займы он пока не сконвертировался. Гипотеза почему: набор жизненных ситуаций был узким, а предзаполнение бралось по медиане сегмента, а не по профилю пользователя. Это валидирую полным A/B-тестом — в follow-up на 2026.",
    },
    postanalysis: {
      title: "Постанализ и выводы",
      body: "За Q3-Q4 2025 перебрал несколько десятков гипотез — в кейс вошли только те, что реально двигали метрики. Главное, что я вынес: точечные UX-правки дают стабильный, но небольшой прирост. Настоящий скачок случался там, где я переставал говорить на языке банка и начинал — на языке пользователя.\n\nЗашло не всё, и это нормально. Часть гипотез не дала статзначимого эффекта, часть показала спрос без сдвига метрики. Но каждая проверка, даже неудачная, подсказывала, куда копать дальше.",
      statsLead:
        "Удвоение CR — это накопленный эффект серии тестов за Q3–Q4. На странице показаны три самых показательных; в сумме десятки мелких улучшений и смена языка коммуникации дали выход с 10% до 20%.",
      stats: [
        { value: "10% → 20% (×2)", description: "CR" },
        { value: "9% → 14% (×1.5)", description: "Take Rate" },
      ],
      futureTitle: "Что хочется доделать",
      future: [
        "Докрутить быстрые офферы: расширить набор жизненных сценариев и проверить их полноценным АБ-тестом, а не только в целевой группе.",
        "Сделать предзаполнение умнее — подтягивать сумму и срок не по медиане сегмента, а по профилю и истории конкретного пользователя.",
      ],
    },
  },

  alfabankPassport: {
    intro: {
      title: "Анкета через паспорт",
      body: "Было два шага: сначала пользователь заполнял имя, фамилию и контакты, потом — паспортные данные вручную. Сделал проще: он фотографирует паспорт и селфи, а он получает заём до 50 000 ₽.",
    },
    toc: [
      { id: "context", label: "Контекст" },
      { id: "problem", label: "Проблема" },
      { id: "discovery", label: "Дискавери" },
      { id: "user-flow", label: "Юзерфлоу" },
      { id: "hypotheses", label: "Гипотезы" },
      { id: "edge-cases", label: "Крайние случаи" },
      { id: "rejected", label: "Отклонили" },
      { id: "postanalysis", label: "Постанализ" },
    ],
    projectTitle: "Новая анкета принесла \n+50 млн ₽ за 2025",
    summary: {
      body: "Сократил заполнение анкеты на микрозаём с 8 минут до 2: пользователь фотографирует паспорт и селфи, и получает заём до 50 000 ₽.",
      stats: [
        { value: "60 сек", description: "на заполнение анкеты вместо 8 минут" },
        { value: "+ 30 п.п.", description: "конверсия в подачу заявки" },
      ],
    },
    credits: [
      {
        label: "Роль",
        value:
          "Lead Product Designer — discovery, проектирование флоу, A/B-тесты",
      },
      { label: "Команда", value: "PM, 2 разработчика, ML-инженер, аналитик, QA-инженер" },
      { label: "Сроки", value: "февраль 2025 — август 2025" },
    ],
    heroVideos: {
      left: "/projects/alfabank/paspp-ru-left.mov",
      center: "/projects/alfabank/paspp-ru-cent.mov",
      right: "/projects/alfabank/paspp-ru-right.mov",
    },
    heroBubbles: [
      "Хочу деньги срочно",
      "Слишком много полей",
      "Не помню паспорт",
    ],
    context: {
      label: "Контекст",
      body: "Альфа-Деньги — микрозаймы до 50 000 ₽ на карту за 5 минут. Было два шага: сначала пользователь заполнял имя, фамилию и контакты, потом — паспортные данные вручную.",
      metrics: [
        { value: "10 полей", label: "в старой анкете" },
        { value: "8 минут", label: "среднее время заполнения" },
        { value: "35%", label: "бросали на блоке паспорта" },
      ],
      howItWasLabel: "Как выглядел раздел до",
      howItWasShots: [
        "/projects/alfabank/pasp-howitwas1-ru.png",
        "/projects/alfabank/pasp-howitwas2-ru.png",
      ],
    },
    problem: {
      label: "Какие были проблемы",
      body: "",
      user: {
        title: "У пользователя",
        points: [
          "Нужны деньги срочно, а заполнять анкету нет времени",
          "Слишком много полей — устаёт и бросает",
          "Списывать 10 полей с паспорта на телефоне — долго и с опечатками",
        ],
      },
      business: {
        title: "У бизнеса",
        points: [
          "Теряем 35% при заполнении паспортных данных",
          "Каждый шаг анкеты съедает по несколько процентов конверсии",
          "Ошибки → правки вручную → задержка выдачи",
        ],
      },
    },
    goals: {
      label: "Цели",
      items: [
        { label: "STEPS", from: "12", to: "3" },
        { label: "TIME", from: "8m", to: "1m" },
        { label: "SUBMIT RATE", from: "45%", to: "70%" },
      ],
      marquee: ["8 → 3 мин", "Отвал 35% → <20%", "Take rate 7% → 10%+"],
      body: "Сократить заполнение формы с 8 до ~3 минут. Снизить отвал на паспортном блоке с 35% до <20%. Поднять take rate с 7% до 10%+.",
    },
    role: {
      label: "Моя роль",
      body: "Полный цикл продуктового дизайна: исследование, прототипы, дизайн UI, тесты с пользователями, сопровождение разработки.",
      bullets: [
        "UX-research: 20 сессий в вебвизоре + 8 глубинных интервью",
        "20 экранов + edge-кейсы (ошибки распознавания, нет камеры, отказ)",
        "Юзабилити-тесты с 5 респондентами",
        "Сопровождение разработки до релиза",
      ],
    },
    discovery: {
      label: "Дискавери",
      body: "Подключил поэкранную аналитику в Amplitude и увидел: почти 80% отвала на паспортном блоке приходится на поля серии и номера паспорта. Интервью с пользователями, бросившими заявку, показали две причины: вбивать данные с паспорта на телефоне — долго и с опечатками, а у части людей паспорта не было под рукой в момент заявки.",
      findings: [
        {
          title: "Где именно бросают на форме?",
          body: "На шаге ввода паспортных данных — 35% слив. Устают печатать или ищут паспорт по квартире.",
        },
        {
          title: "А что у пользователей в голове?",
          body: "На интервью большинство сказали одно и то же — лень печатать или не помнят свои паспортные данные наизусть.",
        },
      ],
      insightLead: "Главный инсайт",
      insight:
        "Клиент МФО приходит в момент срочной нужды: деньги нужны сегодня, на счету минуты. В этом контексте фото паспорта воспринимается как честный обмен — быстрее, чем вспоминать и вбивать 10 полей. Срочность задачи перевешивает дискомфорт от фотографирования документа — это подтвердили интервью.",
    },
    userFlow: {
      label: "Юзерфлоу",
      body: "Понял, что поля «семейное положение» и «образование» не дают прироста точности выдачи — их вклад в предсказание дефолта оказался статистически незначимым. С учётом комментариев пользователей на интервью эти поля убрал. Сам заём пользователь получает уже в авторизованной зоне — внутри приложения банка.",
      bodyExtra:
        "Фото паспорта и селфи закрывают не только заполнение формы, но и KYC (know your customer — обязательную идентификацию клиента). Согласие на обработку биометрии встроил в шаг проверки данных — юристы требовали отдельный экран, договорился на чекбокс с раскрывающимся текстом, чтобы не добавлять лишний шаг.",
      before: {
        title: "Было",
        steps: [
          "Заполняет имя, фамилию и контакты",
          "Вводит паспортные данные вручную",
          "Вводит личные данные",
          "Получает одобрение или отказ",
        ],
      },
      after: {
        title: "Стало",
        steps: [
          "Снимает паспорт, адрес и селфи",
          "Проверяет распознанные данные и ставит галочки согласия",
          "Получает одобрение или отказ",
        ],
      },
    },
    hypothesesLabel: "Гипотезы",
    hypotheses: [
      {
        index: 1,
        hypothesis:
          "Если убрать ручной ввод паспортных полей и заменить на фото — вырастет конверсия в подачу",
        why: "Главный drop-off — на блоке паспорта. Плюс конкуренты уже так делают, и юзеры сами просят.",
        verdict: "Подтвердилась",
        resultLabel: "Вариант Б показал себя лучше. \nCR в отправку заявки:",
        resultValue: "37% → 55% (+18 пп)",
        variantA: "/projects/alfabank/mfo-1h-old-ru.mov",
        variantB: "/projects/alfabank/mfo-1h-new-ru.mov",
      },
      {
        index: 2,
        hypothesis:
          "Если во время скоринга писать пользователю, что происходит — он не закроет вкладку",
        why: "В тесте прототипа без анимации скоринга 3 из 5 закрывали страницу думая, что зависло.",
        verdict: "Подтвердилась",
        resultLabel: "Отвал на скоринге:",
        resultValue: "30% → 18% (−12 пп)",
        variantA: "/projects/alfabank/mfo-2h-old-ru.mov",
        variantB: "/projects/alfabank/mfo-2h-new-ru.mov",
      },
      {
        index: 3,
        hypothesis:
          "Если добавить кнопку, которая ведёт в приложение, и анимированный вижуал на одобренную сумму — take rate вырастет на 5–10 пп",
        why: "После одобрения пользователь не сразу понимает, что делать дальше. Анимированный визуал «вживляет» сумму в восприятие, а кнопка в приложение даёт чёткий следующий шаг.",
        verdict: "Подтвердилась",
        resultLabel: "Take rate вырос на",
        resultValue: "+ 8 п.п.",
        variantA: "/projects/alfabank/mfo-3h-old-ru.png",
        variantB: "/projects/alfabank/mfo-3h-new-ru.mov",
      },
      {
        index: 4,
        hypothesis:
          "Если отправлять заявку сразу после распознавания, без шага проверки, — уберём лишний экран и поднимем конверсию",
        why: "Меньше экранов — короче путь, выше конверсия в отправку.",
        verdict: "Не подтвердилась",
        failed: true,
        resultLabel:
          "Конверсия не выросла, местами просела: люди не доверяют автозаполнению и хотят сами убедиться, что данные распознаны верно, перед отправкой.",
        resultValue: "",
      },
      {
        index: 5,
        hypothesis:
          "Если начать с селфи — низкий барьер, просто лицо — вход будет мягче, а конверсия в первый шаг выше",
        why: "Селфи проще паспорта, логично начать с него.",
        verdict: "Не подтвердилась",
        failed: true,
        resultLabel:
          "Наоборот: селфи в самом начале отпугивало — непонятно, зачем банку лицо до контекста заявки. Статзначимого роста нет.",
        resultValue: "",
      },
    ],
    edgeCases: {
      label: "Ошибки и крайние случаи",
      items: [
        {
          title: "Редактирование полей",
          body: "Распознанные данные пользователь видит на экране проверки: может перепроверить их и отредактировать любое поле перед отправкой.",
          shots: [
            "/projects/alfabank/cc1-edit-ru.png",
            "/projects/alfabank/cc1-edit-active-ru.png",
          ],
        },
        {
          title: "Темно / блики",
          body: "Подсказки прямо в камере: «поднесите ближе», «слишком темно». Фонарик включается автоматически при низкой освещённости.",
          shots: [
            "/projects/alfabank/cc2-too-dark-ru.png",
            "/projects/alfabank/cc2-too-bright-ru.png",
          ],
        },
        {
          title: "Селфи не прошло liveness",
          body: "Даю 5 попыток с фото. Если не получилось — переключаю на ручной ввод.",
          shots: ["/projects/alfabank/cc3-manual-ru.png"],
        },
      ],
    },
    solution: {
      label: "Решение",
      body: "Вся анкета свелась к трём фото и одному экрану проверки. Пользователь снимает паспорт и селфи, ждёт скоринг — и получает уже заполненную форму, где остаётся только проставить галочки согласия и отправить.",
      flowLabel: "Весь флоу целиком",
      steps: [
        {
          n: "01",
          title: "Лендинг с тремя шагами",
          body: "Три карточки-инструкции и одна кнопка «Сделать фото паспорта» — ни одного поля для ручного ввода.",
        },
        {
          n: "02",
          title: "Главный разворот паспорта",
          body: "Полноэкранная камера с маской под разворот и счётчиком «1 из 3». Рядом — подсказка «как надо и как не надо».",
        },
        {
          n: "03",
          title: "Страница с пропиской",
          body: "Та же камера, маска под лист с пропиской. Счётчик переключается на «2 из 3».",
        },
        {
          n: "04",
          title: "Селфи для liveness",
          body: "Фронтальная камера, овал под лицо и подсказка «поморгайте» — проверка, что перед камерой живой человек.",
        },
        {
          n: "05",
          title: "Скоринг в три стадии",
          body: "Вместо одного спиннера — три фазы с подписями. Воспринимаемое ожидание становится короче.",
        },
        {
          n: "06",
          title: "Предзаполненная анкета",
          body: "Десять полей уже распознаны. Остаётся проверить их, проставить галочки согласия и отправить.",
        },
      ],
    },
    rejected: {
      label: "Отклонённые идеи",
      body: "Не всё, что обсуждалось, попало в MVP. Часть отверг сразу, часть положил в backlog — расскажу про самые показательные.",
      items: [
        {
          title: "Загрузка из галереи",
          reason:
            "Открывает дыру для фрода — можно подать чужой паспорт, найденный в интернете. С камерой in-app я вижу, что фото сделано здесь и сейчас.",
          verdict: "Отказались",
        },
        {
          title: "Видео-верификация вместо селфи",
          reason:
            "Дороже в интеграции, медленнее для пользователя. Уровень защиты сопоставим с liveness-фото.",
          verdict: "Отказались",
        },
      ],
    },
    postanalysis: {
      title: "Постанализ и выводы",
      body: "После релиза собирал метрики 2 месяца. АБ-тест: 50% трафика — новый флоу, 50% — старая анкета. Тестовая группа уверенно обогнала контрольную, и флоу выкатил на 100%.",
      stats: [
        { value: "в 2 раза", description: "быстрее заполнение анкеты" },
        { value: "7% → 15%", description: "take rate", note: "вдвое выше цели в 10%" },
        { value: "+ 50 млн ₽", description: "доход за 2025" },
      ],
      statsNote:
        "Считал как инкремент: (новый take rate − старый) × средний чек займа × объём заявок за 2025 по данным A/B-теста.",
      learningsTitle: "Что узнал по дороге",
      learnings: [
        "Важно дать пользователю выбор: заполнить через паспорт или вручную. Бывают кейсы, когда паспорта нет рядом, но человек помнит данные наизусть — без альтернативы такой пользователь уходит. Это войдёт в доработку Q2 2026.",
      ],
      futureTitle: "Что хочется доделать",
      future: [
        "Anti-fraud по банковской карте — ещё один слой проверки против фрода.",
        "Бесконтактная встреча с курьером для подписи документов.",
        "Расширить паттерн «анкета через фото» на ипотеку и автокредит.",
      ],
    },
  },
};

// ============================================================
//  ENGLISH CONTENT
// ============================================================
const enContent = {
  ui: {
    learnMore: "Learn more",
    readCase: "read case",
    comingSoon: "coming soon",
    hypothesis: "Hypothesis",
    solution: "What I tested",
    result: "Result",
    variantA: "Variant A",
    variantB: "Variant B",
    why: "Why",
    step: "step",
    back: "Back",
  },

  site: {
    name: "Zharkyn Kalysh",
    navLinks: [
      {
        label: "CV",
        href: "https://drive.google.com/file/d/1q0kDKP4Ysc5DV2ukNpP7_zqon_XiWhcG/view?usp=sharing",
      },
      { label: "Telegram", href: "https://t.me/unluckycat1" },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/zharkyn-kalysh-82820b198",
      },
    ],
    footer: {
      copyright: "© 2026 by me · claude code · bunch of caffeine",
    },
  },

  home: {
    bio: {
      greetingWords: ["Hi!", "Bonjour!", "こんにちは!", "مرحبا!"],
      name: "I'm Zharkyn.",
      prefix:
        "Product designer with 6 years of experience \ndesigning B2C and B2B products in fintech and telecom.",
    },
    experience: {
      label: "Experience",
      albumTitle: "Career",
      albumYears: "2020–∞",
      accent: "#D85A30",
      tracks: [
        { company: "Freedom Bank", duration: "2020 - 2021" },
        { company: "Tele2", duration: "2021 - 2022" },
        { company: "T-Bank", duration: "2022 - 2024" },
        {
          company: "Alfa-Bank",
          duration: "2024 - now",
          current: true,
        },
      ],
    },
    projectsLabel: "What I do at Alfa-Bank",
    projectPreviewText: "AMoney —\nan Alfa-Bank\npartner",
    playground: {
      hint: "draw something and set it free",
      clear: "clear",
      release: "release ↗",
    },
    projects: [
      {
        href: "/projects/alfabank-passport",
        name: "How the selfie form brought in \n+$500K in 2025",
        tags: "",
        description: "Cut the form completion time — instead of filling out fields, the user just snaps their passport.",
        metric1Label: "",
        metric1Value: "",
        metric2Label: "",
        metric2Value: "",
      },
      {
        href: "/projects/alfabank-mfo",
        name: "Doubled conversion \nand take rate on microloans",
        tags: "",
        description: "Reworked the microloans page on the website.",
        metric1Label: "",
        metric1Value: "",
        metric2Label: "",
        metric2Value: "",
      },
    ],
    tbankProjectsLabel: "What I did at T-Bank",
    tbankProjects: [
      {
        href: "https://www.figma.com/proto/wGokqNgxSlXXwUIl6DXqsx/Zharkyn-Kalysh---portfolio?page-id=0%3A1&node-id=1-6184&viewport=212%2C605%2C0.04&t=Ebsy8h4o1OHeJUxc-1&scaling=contain&content-scaling=fixed&starting-point-node-id=1%3A6184",
        name: "T-Bank — all-in-one financial app",
        tags: "",
        description: "",
        hoverLabel: "View presentation",
        metric1Label: "",
        metric1Value: "",
        metric2Label: "",
        metric2Value: "",
      },
    ],
    about: {
      title: "Beyond design",
      body: "I do bouldering and I'm learning Japanese. Not quite at the level of watching anime without subtitles yet — but I'll get there.",
      cats: "/figma/2.jpg",
      capybaras: "/figma/1.png",
      video: "/figma/3.mp4",
      nintendo: "/figma/4.jpg",
      nowPlaying: {
        track: "4 Raws",
        artist: "EsDeeKid",
        cover: "/figma/4-raws-cover.jpg",
        url: "https://open.spotify.com/track/554qQSs9lpRVq6TlaaiIKT",
        bg: "#1e1e1e",
      },
    },
  },

  alfabank: {
    intro: {
      title: "What I do at Alfa-Bank",
      body: "I own the loans and microloans pages on the website and run the full application flow — from the first step all the way to loan and microloan disbursement.",
    },
    factsheet: [
      { label: "Period", value: "March 2024 — present" },
      { label: "Role", value: "Product designer" },
      { label: "Users", value: "New-to-bank and existing customers" },
      { label: "Platform", value: "Mobile, desktop" },
      {
        label: "Team",
        value:
          "PO, product designer, \nsystems analyst, \nfrontend, backend, QA",
      },
      { label: "Design system", value: "Alfa Design System" },
    ],
  },

  alfabankMfo: {
    intro: {
      title: "Microloans",
      body: "Four hypotheses and A/B tests on the Alfa-Bank microloans page. I doubled overall CR and lifted loan Take Rate by 1.5×.",
    },
    toc: [
      { id: "context", label: "Context" },
      { id: "before", label: "Before" },
      { id: "problem", label: "Problem" },
      { id: "insights", label: "Insights" },
      { id: "hypotheses", label: "Hypotheses" },
      { id: "quick-offers", label: "Quick offers" },
      { id: "postanalysis", label: "Post-analysis" },
    ],
    projectTitle: "How I doubled conversion \nand take rate on microloans",
    summary: {
      body: "I reworked the microloans page on the Alfa-Bank website. \nApplication conversion grew 2×, and loan Take Rate by roughly 2×.",
      stats: [
        { value: "×2", description: "lift in overall application conversion" },
        { value: "×1.5", description: "lift in loan Take Rate" },
      ],
    },
    credits: [
      {
        label: "Role",
        value:
          "Product Designer — discovery, UX hypotheses, A/B tests, piloting the new UI",
      },
      { label: "Team", value: "PM, analyst, 2 engineers" },
      { label: "Timeline", value: "Q3 — Q4 2025" },
    ],
    heroVideo: "/projects/alfabank/preview.mp4",
    context: {
      label: "Context",
      body: "Alfa-Money is one of the bank's key products for acquiring microloan customers. A customer fills out an online application and gets a microloan on their card within 5 minutes.",
      metrics: [
        { value: "~ 550 K", label: "MAU" },
        { value: "10%", label: "CR" },
        { value: "9%", label: "TR" },
      ],
      note: "Data for 2025",
    },
    before: {
      label: "How the section looked before",
      body: "There were no critical problems on the page. It had run quietly for years — bringing in applications, never causing a flood of complaints. Metrics held steady, and the bounce rate sat in the green.",
      video: "/projects/alfabank/old.mov",
    },
    problem: {
      title: "So where was the problem?",
      body: "I'd long sensed the page was dated and that I was leaving conversion on the table. \nI went through session recordings, ran user interviews, and found:",
      stats: [
        {
          value: "34%",
          description: "didn't scroll down to the form \nand left",
        },
        {
          value: "7 of 8 users",
          description: "scrolled back to the top \nlooking for the terms",
        },
      ],
      bodyExtra:
        "The page itself had piled up a huge amount of legacy code, and every new UX improvement had to clear a wall of technical constraints that often got badly in the way.",
      taskTitle: "Defining the task",
      taskGoals:
        "Quarterly goal: lift CR from 10% and TR from 9%. Beyond the product task — pilot Alfa-Bank's new UI on this page.",
      taskBody:
        "There was a quarterly goal — grow CR and TR. I was free to experiment and spend whatever resources I needed on it. \nAs the designer, I also got a special brief: pilot Alfa-Bank's new UI on this surface and, more broadly, figure out what the microloans section should become. \n\nI experimented a lot and tested different hypotheses. Here are the ones that mattered most — the ones that actually moved conversion.",
    },
    hypotheses: [
      {
        index: 1,
        hypothesis:
          "If I add a CTA button \nat the top of the page, \nmore users will reach the application",
        solution: "A/B test: a variant with the button \nand one without",
        after: "/projects/alfabank/1hA.mov",
        before: "/projects/alfabank/1hB.png",
        resultLabel: "Variant A won: \napplication CR higher by",
        resultValue: "7 pp",
      },
      {
        index: 2,
        hypothesis:
          "If I move the benefits \nand the form up, I'll raise application conversion\n ⠀⠀⠀⠀⠀⠀⠀",
        solution:
          "A/B test: trim the benefits copy \nand move it up with the form",
        after: "/projects/alfabank/2h-new-en.png",
        before: "/projects/alfabank/2hB.png",
        resultLabel: "Variant A won here too. \nApplication CR grew by",
        resultValue: "3 pp",
      },
    ],
    research: {
      label: "How I solved it",
      intro: "I dug into session recordings and pulled users into interviews.",
      insightsLead: "Here's what came out of it:",
      insights: [
        "People don't borrow money “in general” — they borrow for specific life situations: paying off another loan, making it to payday, doing some cosmetic repairs. A generic “take a loan” offer doesn't land — it isn't about their task.",
        "Other microloan providers and banks have equally generic, unsegmented offers. Nobody in the niche speaks to the user in the language of their situation — so it's an open opportunity.",
      ],
      bonusInsightLead: "First insight",
      bonusInsight:
        "In interviews I found that, on an emotional level, users are wary of the very words “microloan,” “loan,” and any mention of an MFO.",
      secondInsightLead: "Second insight",
      secondInsight: "The most common reasons people take a microloan:",
      secondInsightCauses: [
        "pay off another loan",
        "make it to payday",
        "buy medicine",
      ],
    },
    scaryWords: {
      surrounding: [
        "MFO",
        "penalty",
        "interest",
        "fee",
        "loan",
        "collateral",
      ],
      central: "microloan",
    },
    howWeSolved: {
      label: "How I solved it",
      steps: [
        "Removed the blocker words everywhere and replaced some with softer wording. For example: “loan” → “money,” “approval” → “a decision \nin 1 minute,” and so on.",
        "Ran an A/B test with two variants to lower user anxiety.",
      ],
      variants: [
        {
          label: "Variant 1",
          src: "/projects/alfabank/InsightA.mov",
          caption:
            "This variant produced no statistically \nsignificant change in conversion — \nlikely due to banner blindness.",
        },
        {
          label: "Variant 2",
          src: "/projects/alfabank/InsightB.png",
          caption:
            "I placed variant 2 right under the form — that gave a lift of about +2 pp. \nI kept it.",
        },
      ],
    },
    insightUsage: {
      title: "Putting the insight to work",
      body: "I assumed that showing users quick offers matched to their task would raise application CR — because they wouldn't have to “translate” their situation into loan parameters. Instead of an A/B test, I went straight to the target segment to gauge interest.",
      flowLabel: "User flow",
      flow: [
        "Lands on the page",
        "Sees a block of ready-made offers for real-life situations",
        "Recognizes their situation and taps “Get”",
        "Smooth scroll to the application form",
        "Fields are pre-filled for the scenario: purpose, amount and term",
        "Adjusts the fields if needed",
        "Enters contact details",
        "Submits the application",
      ],
      video: "/projects/alfabank/last.mov",
      metrics: [
        {
          label: "CTR",
          value: "27%",
          note: "modest, but the demand is there",
        },
        {
          label: "CR",
          value: "4%",
          note: "of users applied through the quick offers",
        },
        { label: "TR", value: "—", note: "no statistically significant change" },
      ],
      conclusion:
        "The bet on quick offers didn't pay off on take rate: the demand is there — 27% CTR — but it hasn't converted into approved loans yet. My hypothesis why: the set of life situations was too narrow, and the pre-fill was based on the segment median rather than each user's own profile. I'll validate this with a full A/B test — in a 2026 follow-up.",
    },
    postanalysis: {
      title: "Post-analysis and takeaways",
      body: "I went through several dozen hypotheses in Q3-Q4 2025 — only the ones that genuinely moved the metrics made it into this case. My main takeaway: targeted UX fixes give a steady but small gain. The real jumps happened when I stopped speaking the bank's language and started speaking the user's.\n\nNot everything landed, and that's fine. Some hypotheses showed no statistically significant effect, some showed demand without moving the metric. But every test, even a failed one, pointed to where to dig next.",
      statsLead:
        "Doubling CR was the cumulative effect of a series of tests across Q3–Q4. The page shows the three most telling ones; together, dozens of small improvements and a shift to the user's language took it from 10% to 20%.",
      stats: [
        { value: "10% → 20% (×2)", description: "CR" },
        { value: "9% → 14% (×1.5)", description: "Take Rate" },
      ],
      futureTitle: "What I'd still like to do",
      future: [
        "Push the quick offers further: expand the set of life situations and validate them with a full A/B test, not just within the target segment.",
        "Make pre-fill smarter — pull the amount and term from each user's own profile and history rather than the segment median.",
      ],
    },
  },

  alfabankPassport: {
    intro: {
      title: "Application via passport",
      body: "There used to be two steps: first the user filled in their name and contacts, then passport details by hand. I made it simpler: they snap their passport and a selfie, and they get a loan of up to $500.",
    },
    toc: [
      { id: "context", label: "Context" },
      { id: "problem", label: "Problem" },
      { id: "discovery", label: "Discovery" },
      { id: "user-flow", label: "User flow" },
      { id: "hypotheses", label: "Hypotheses" },
      { id: "edge-cases", label: "Edge cases" },
      { id: "rejected", label: "Rejected" },
      { id: "postanalysis", label: "Post-analysis" },
    ],
    projectTitle: "The new application form \nbrought in +$500K in 2025",
    summary: {
      body: "Cut the microloan application form from 8 minutes to 2: the user just snaps their passport and a selfie, and gets a loan of up to $500.",
      stats: [
        {
          value: "60 sec",
          description: "to complete the form, down from 8 minutes",
        },
        { value: "+ 30 pp", description: "conversion to application submitted" },
      ],
    },
    credits: [
      {
        label: "Role",
        value: "Lead Product Designer — discovery, flow design, A/B tests",
      },
      { label: "Team", value: "PM, 2 engineers, ML engineer, analyst, QA engineer" },
      { label: "Timeline", value: "February 2025 — August 2025" },
    ],
    heroVideos: {
      left: "/projects/alfabank/paspp-en-left.mov",
      center: "/projects/alfabank/paspp-en-cent.mov",
      right: "/projects/alfabank/paspp-en-right.mov",
    },
    heroBubbles: [
      "Need money fast",
      "Too many fields",
      "Can't recall passport",
    ],
    context: {
      label: "Context",
      body: "Alfa-Money — microloans up to $500 on your card in 5 minutes. There were two steps: first the user filled in their name and contacts, then passport details by hand.",
      metrics: [
        { value: "10 fields", label: "in the old form" },
        { value: "8 minutes", label: "average completion time" },
        { value: "35%", label: "dropped off at the passport block" },
      ],
      howItWasLabel: "How the section looked before",
      howItWasShots: [
        "/projects/alfabank/pasp-howitwas1-en.png",
        "/projects/alfabank/pasp-howitwas2-en.png",
      ],
    },
    problem: {
      label: "What problems I found",
      body: "",
      user: {
        title: "For the user",
        points: [
          "Need money fast, no time to fill out a form",
          "Too many fields — gets tired and quits",
          "Copying 10 passport fields on a phone — slow and typo-prone",
        ],
      },
      business: {
        title: "For the business",
        points: [
          "We lose 35% during passport data entry",
          "Every application step shifts a few % of CR",
          "Unclear data → manual fixes → delayed loan",
        ],
      },
    },
    goals: {
      label: "Goals",
      items: [
        { label: "STEPS", from: "12", to: "3" },
        { label: "TIME", from: "8m", to: "1m" },
        { label: "SUBMIT RATE", from: "45%", to: "70%" },
      ],
      marquee: ["8 → 3 min", "Drop-off 35% → <20%", "Take rate 7% → 10%+"],
      body: "Cut form filling from 8 to ~3 minutes. Cut passport-block drop-off from 35% to <20%. Lift take rate from 7% to 10%+.",
    },
    role: {
      label: "My role",
      body: "The full product design cycle: research, prototypes, UI design, user testing, and supporting development.",
      bullets: [
        "UX research: 20 session recordings + 8 in-depth interviews",
        "20 screens + edge cases (recognition errors, no camera, rejection)",
        "Usability tests with 5 participants",
        "Supporting development through to release",
      ],
    },
    discovery: {
      label: "Discovery",
      body: "I wired up per-screen analytics in Amplitude and saw it: nearly 80% of the drop-off at the passport block lands on the passport series and number fields. Interviews with people who abandoned the application surfaced two reasons: typing passport data on a phone is slow and typo-prone, and some people simply didn't have their passport on hand at the moment of applying.",
      findings: [
        {
          title: "Where exactly are they quitting?",
          body: "At the passport-details step — 35% drop off. They get tired of typing or looking for their passport around the apartment.",
        },
        {
          title: "What's going on in their heads?",
          body: "Most interviewees said the same thing — too lazy to type, or they don't remember their passport details by heart.",
        },
      ],
      insightLead: "The key insight",
      insight:
        "An MFO customer shows up in a moment of urgent need: they need the money today, the clock is ticking. In that context a passport photo reads as a fair trade — faster than recalling and typing out 10 fields. The urgency of the task outweighs the discomfort of photographing a document — the interviews confirmed it.",
    },
    userFlow: {
      label: "User flow",
      body: "Turns out the \"marital status\" and \"education\" fields weren't adding any accuracy — their effect on default prediction was statistically insignificant. That, plus what users told me in interviews, led me to remove them.",
      bodyExtra:
        "The passport photo and selfie cover not just filling out the form but also KYC (know your customer — the mandatory client identification). I built the biometrics-processing consent into the data-review step — legal wanted a separate screen, but I settled on a checkbox with expandable text so I wouldn't add an extra step.",
      before: {
        title: "Before",
        steps: [
          "Fills in name, last name and contacts",
          "Types passport details manually",
          "Fills in personal data",
          "Gets approval or rejection",
        ],
      },
      after: {
        title: "After",
        steps: [
          "Snaps passport, address and a selfie",
          "Reviews recognized data and ticks the consent boxes",
          "Gets approval or rejection",
        ],
      },
    },
    hypothesesLabel: "Hypotheses",
    hypotheses: [
      {
        index: 1,
        hypothesis:
          "If I remove manual entry of passport fields and replace it with a photo — conversion to submission will grow",
        why: "The main drop-off is at the passport block. Competitors already do this, and users ask for it themselves.",
        verdict: "Confirmed",
        resultLabel: "Variant B won. \nSubmission CR:",
        resultValue: "37% → 55% (+18 pp)",
        variantA: "/projects/alfabank/mfo-1h-old-en.mov",
        variantB: "/projects/alfabank/mfo-1h-new-en.mov",
      },
      {
        index: 2,
        hypothesis:
          "If I tell the user what's happening during scoring — they won't close the tab",
        why: "In prototype testing without a scoring animation, 3 of 5 closed the page thinking it had frozen.",
        verdict: "Confirmed",
        resultLabel: "Drop-off at scoring:",
        resultValue: "30% → 18% (−12 pp)",
        variantA: "/projects/alfabank/mfo-2h-old-en.mov",
        variantB: "/projects/alfabank/mfo-2h-new-en.mov",
      },
      {
        index: 3,
        hypothesis:
          "If I add a button that opens the app and an animated visual for the approved amount — take rate will grow by 5–10 pp",
        why: "After approval users don't immediately know what to do next. The animated visual makes the amount feel real, and the button gives a clear next step.",
        verdict: "Confirmed",
        resultLabel: "Take rate grew by",
        resultValue: "+ 8 pp",
        variantA: "/projects/alfabank/mfo-3h-old-en.png",
        variantB: "/projects/alfabank/mfo-3h-new-en.mov",
      },
      {
        index: 4,
        hypothesis:
          "If I submit the application right after recognition, skipping the review step — I'll cut an extra screen and lift conversion",
        why: "Fewer screens means a shorter path and higher submission conversion.",
        verdict: "Not confirmed",
        failed: true,
        resultLabel:
          "Conversion didn't grow, and dipped in places: people don't trust auto-fill and want to confirm the data was recognized correctly before submitting.",
        resultValue: "",
      },
      {
        index: 5,
        hypothesis:
          "If I start with the selfie — low barrier, just a face — the entry feels softer and first-step conversion goes up",
        why: "A selfie is easier than a passport, so it seems logical to start there.",
        verdict: "Not confirmed",
        failed: true,
        resultLabel:
          "The opposite: a selfie up front scared people off — it wasn't clear why the bank needed their face before any application context. No statistically significant lift.",
        resultValue: "",
      },
    ],
    edgeCases: {
      label: "Errors and edge cases",
      items: [
        {
          title: "Field editing",
          body: "The user sees the recognized data on the review screen: they can double-check it and edit any field before submitting.",
          shots: [
            "/projects/alfabank/cc1-edit-en.png",
            "/projects/alfabank/cc1-edit-active-en.png",
          ],
        },
        {
          title: "Dark / glare",
          body: "Hints right in the camera: “move closer,” “too dark.” The flashlight turns on automatically in low light.",
          shots: [
            "/projects/alfabank/cc2-too-dark-en.png",
            "/projects/alfabank/cc2-too-bright-en.png",
          ],
        },
        {
          title: "Selfie failed liveness",
          body: "I give 5 photo attempts. If it still doesn't work — I switch to manual entry.",
          shots: ["/projects/alfabank/cc3-manual-en.png"],
        },
      ],
    },
    solution: {
      label: "The solution",
      body: "The whole application boiled down to three photos and one review screen. The user shoots their passport and a selfie, waits for scoring — and gets a pre-filled form where all that's left is to tick the consent boxes and submit.",
      flowLabel: "The whole flow",
      steps: [
        {
          n: "01",
          title: "Landing with three steps",
          body: "Three instruction cards and a single button — “Photograph your passport.” Not one field to fill in by hand.",
        },
        {
          n: "02",
          title: "Passport main spread",
          body: "A full-screen camera with a mask for the spread and a “1 of 3” counter. A “do and don't” hint sits right next to it.",
        },
        {
          n: "03",
          title: "Registration page",
          body: "The same camera, a mask shaped for the registration page. The counter switches to “2 of 3.”",
        },
        {
          n: "04",
          title: "Selfie for liveness",
          body: "Front camera, an oval for the face and a “blink” prompt — a check that there's a real person in front of it.",
        },
        {
          n: "05",
          title: "Scoring in three stages",
          body: "Instead of a single spinner — three labeled phases. The perceived wait gets noticeably shorter.",
        },
        {
          n: "06",
          title: "Pre-filled form",
          body: "Ten fields are already recognized. All that's left is to check them, tick the consent boxes, and submit.",
        },
      ],
    },
    rejected: {
      label: "Rejected ideas",
      body: "Not everything I discussed made it into the MVP. Some ideas I rejected outright, some I parked in the backlog — here are the most telling ones.",
      items: [
        {
          title: "Upload from gallery",
          reason:
            "It opens a fraud hole — someone could submit a stranger's passport found online. With an in-app camera, I know the photo was taken here and now.",
          verdict: "Rejected",
        },
        {
          title: "Video verification instead of a selfie",
          reason:
            "More expensive to integrate, slower for the user. The level of protection is comparable to a liveness photo.",
          verdict: "Rejected",
        },
      ],
    },
    postanalysis: {
      title: "Post-analysis and takeaways",
      body: "After release I collected metrics for 2 months. An A/B test: 50% of traffic on the new flow, 50% on the old form. The test group clearly beat the control, and the flow was rolled out to 100%.",
      stats: [
        { value: "×2", description: "faster form completion" },
        { value: "7% → 15%", description: "take rate", note: "twice the 10% goal" },
        { value: "+ $500K", description: "2025 revenue" },
      ],
      statsNote:
        "Measured as an increment: (new take rate − old) × average loan size × 2025 application volume, based on the A/B test.",
      learningsTitle: "What I learned along the way",
      learnings: [
        "It matters to give users a choice — fill via passport or by hand. There are cases when the passport isn't nearby but the person remembers the details; without the alternative, that user just drops off. This is going into the Q2 2026 follow-up.",
      ],
      futureTitle: "What I'd still like to do",
      future: [
        "Bank-card anti-fraud — another layer of protection against fraud.",
        "A contactless courier handoff for signing documents.",
        "Extend the “application by photo” pattern to mortgages and auto loans.",
      ],
    },
  },
};

// ============================================================
//  ЭКСПОРТ
// ============================================================
const ru = process(ruContent);

export type Lang = "ru" | "en";
export type SiteContent = typeof ru;

export const content: Record<Lang, SiteContent> = {
  ru,
  en: process(enContent) as unknown as SiteContent,
};

// Дефолтные (русские) экспорты — нужны для типов в компонентах.
export const site = ru.site;
export const home = ru.home;
export const alfabank = ru.alfabank;
export const alfabankMfo = ru.alfabankMfo;
export const alfabankPassport = ru.alfabankPassport;
