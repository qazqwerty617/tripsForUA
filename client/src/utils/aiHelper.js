export function generateSmartTourTitle(country, city) {
  if (!country) return 'Неймовірна подорож';
  
  const countryAdjMap = {
    'Греція': ['Грецький', 'Грецька', 'Грецьке', 'Егейський', 'Олімп'],
    'Італія': ['Італійський', 'Італійська', 'Тосканський', 'Римський', 'Венеціанський'],
    'Іспанія': ['Іспанський', 'Іспанська', 'Каталонський', 'Сонячний', 'Іберійський'],
    'Франція': ['Французький', 'Французька', 'Прованський', 'Паризький', 'Королівський'],
    'Туреччина': ['Турецький', 'Турецька', 'Східний', 'Анатолійський', 'Османський'],
    'Єгипет': ['Єгипетський', 'Єгипетська', 'Нільський', 'Фараонський', 'Пустельний'],
    'Таїланд': ['Тайський', 'Тайська', 'Екзотичний', 'Сіамський', 'Тропічний'],
    'Ісландія': ['Ісландійський', 'Ісландська', 'Крижаний', 'Вулканічний', 'Північний'],
    'Норвегія': ['Норвезький', 'Норвезька', 'Фьордовий', 'Північний', 'Полярний'],
    'Німеччина': ['Німецький', 'Німецька', 'Баварський', 'Альпійський'],
    'Австрія': ['Австрійський', 'Австрійська', 'Альпійський', 'Віденський'],
    'Швейцарія': ['Швейцарський', 'Швейцарська', 'Альпійський', 'Королівський'],
    'Чорногорія': ['Адріатичний', 'Адріатична', 'Чорногорський', 'Чорногорська'],
    'Хорватія': ['Адріатичний', 'Адріатична', 'Хорватський', 'Хорватська'],
    'Чехія': ['Чеський', 'Чеська', 'Богемський', 'Празький'],
    'Польща': ['Польський', 'Польська', 'Краківський', 'Балтійський']
  };

  const adjs = countryAdjMap[country] || ['Неймовірний', 'Магічний', 'Загадковий', 'Золотий', 'Смарагдовий', 'Королівський', 'Казковий', 'Великий', 'Райський', 'Величний'];
  const nouns = [
    'Секрети', 'Скарби', 'Легенди', 'Магія', 'Перлина', 'Серце', 'Таємниці', 'Шарм', 'Сонце', 'Обійми',
    'Казка', 'Бриз', 'Краса', 'Вогні', 'Пригоди', 'Симфонія', 'Шлях', 'Контрасти', 'Горизонти', 'Мрія'
  ];

  const cityPart = city ? city : country;

  // Selection gender helper
  const selectedGenderAdj = (adj, noun) => {
    const lastChar = noun.slice(-1);
    if (['а', 'я'].includes(lastChar)) {
      if (adj.endsWith('ий')) return adj.slice(0, -2) + 'а';
      if (adj.endsWith('ій')) return adj.slice(0, -2) + 'я';
    }
    if (['е', 'о'].includes(lastChar)) {
      if (adj.endsWith('ий')) return adj.slice(0, -2) + 'е';
      if (adj.endsWith('ій')) return adj.slice(0, -2) + 'є';
    }
    return adj;
  };

  // Custom templates
  const templates = [
    () => {
      const adj = adjs[Math.floor(Math.random() * adjs.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      return `${noun} ${adj.toLowerCase()}х доріг: ${cityPart}`;
    },
    () => {
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const adj = adjs[Math.floor(Math.random() * adjs.length)];
      return `${noun} ${selectedGenderAdj(adj, noun)}: ${cityPart}`;
    },
    () => {
      const adj = adjs[Math.floor(Math.random() * adjs.length)];
      return `${selectedGenderAdj(adj, 'Казка')} казка: ${cityPart}`;
    },
    () => {
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      return `${noun} ${cityPart}`;
    },
    () => {
      const adj = adjs[Math.floor(Math.random() * adjs.length)];
      return `${adj} пригода в ${cityPart}`;
    },
    () => `${cityPart}: Симфонія вражень`,
    () => `${cityPart}: Золоті горизонти`,
    () => `Перлина в серці ${country}`,
    () => {
      const adj = adjs[Math.floor(Math.random() * adjs.length)];
      return `${selectedGenderAdj(adj, 'Одіссея')} Одіссея: ${cityPart}`;
    }
  ];

  const randTemplate = templates[Math.floor(Math.random() * templates.length)];
  return randTemplate();
}

export async function generateAiTitle(country, city) {
  const fallbackTitle = generateSmartTourTitle(country, city);
  
  if (!country) return fallbackTitle;

  const randomSeed = Math.floor(Math.random() * 10000000);
  const titleStyles = [
    "романтичний та загадковий стиль",
    "яскравий та емоційний стиль",
    "величний та преміальний тон",
    "пригодницький та екзотичний настрій",
    "сучасний та лаконічний стиль",
    "поетичний та надихаючий стиль"
  ];
  const selectedStyle = titleStyles[Math.floor(Math.random() * titleStyles.length)];

  const prompt = `Ти креативний копірайтер для туристичної агенції. Придумай ОДИН короткий, привабливий маркетинговий заголовок для туру в країну ${country}${city ? ', місто ' + city : ''} (максимум 4-5 слів). Застосуй ${selectedStyle}. Поверни ТІЛЬКИ цей заголовок українською мовою, без лапок, крапок або зайвого вступного тексту.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

    const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai&seed=${randomSeed}&t=${Date.now()}`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const text = await response.text();
      const cleaned = text.replace(/["'«»]/g, '').trim();
      if (cleaned && cleaned.length > 5 && cleaned.length < 80) {
        return cleaned;
      }
    }
  } catch (error) {
    console.warn("Pollinations AI error, using premium local generator:", error);
  }

  return fallbackTitle;
}

export async function generateAiDescription(destinationName) {
  const localFallbackDesc = {
    'Греція': [
      'Греція — колиска європейської цивілізації, країна величних міфів, білосніжних пляжів та лагідного сонця. Відкрийте для себе дивовижні острови, смачну місцеву кухню та стародавню архітектуру Афін.',
      'Греція захоплює дух своїми біло-блакитними краєвидами Санторіні та величним Акрополем. Ідеальне місце для тих, хто мріє про поєднання античної історії та теплого середземноморського моря.',
      'Відчуйте справжню грецьку гостинність, насолоджуючись золотавими пляжами Криту та шумом хвиль Егейського моря. Країна легенд та незабутніх смаків чекає на вас!'
    ],
    'Італія': [
      'Італія — країна мистецтва, кохання та неймовірної гастрономії. Насолоджуйтеся романтичними каналами Венеції, шедеврами епохи Відродження у Флоренції та величчю вічного міста Рим.',
      'Подорож до Італії — це свято життя, наповнене ароматами свіжої пасти, величчю Колізею та мальовничими краєвидами Амальфітанського узбережжя.',
      'Італія зачаровує з першого погляду: від засніжених Альп до теплих вод Сицилії. Пориньте в атмосферу dolce vita та доторкніться до світової спадщини.'
    ],
    'Іспанія': [
      'Іспанія — сонячний край пристрасного фламенко, неповторної архітектури Гауді та золотистих середземноморських пляжів. Відкрийте для себе темпераментну Барселону та величний Мадрид.',
      'Іспанія дарує незабутні емоції від галасливих фестивалів, величних соборів та безкінечного узбережжя Коста-Брава. Відкрийте для себе пристрасну та теплу іберійську культуру.',
      'Відчуйте ритм іспанської фієсти, насолодіться вишуканою тапасом та архітектурними шедеврами під лагідним іспанським сонцем.'
    ],
    'Франція': [
      'Франція — синонім витонченого стилю, романтики та високої кухні. Відвідайте величний Париж, квітучий Прованс або розкішний Лазурний берег для незабутніх вражень.',
      'Франція відкриває перед вами вишукані шато долини Луари, лавандові поля Провансу та величні Ейфелеву вежу і Лувр у серці Парижа.',
      'Зануртеся в атмосферу французької романтики, спробуйте свіжі круасани та проведіть вечір під шепіт хвиль розкішного Середземного моря.'
    ],
    'Туреччина': [
      'Туреччина — унікальний міст між сходом та заходом, що поєднує античні скарбниці, розкішні спа-курорти та неймовірну східну гостинність на узбережжях чотирьох морів.',
      'Туреччина заворожує польотами повітряних куль над Каппадокією та теплими пісками Середземного моря. Тут кожна вулиця дихає історією великих імперій.',
      'Відпочинок у Туреччині — це ідеальний сервіс, дивовижні каньйони, величні мечеті Стамбула та незабутній колорит східного базару.'
    ],
    'Єгипет': [
      'Єгипет — країна величних пірамід, містичних сфінксів та казкового підводного світу Червоного моря. Тут давня історія переплітається з комфортним пляжним відпочинком.',
      'Єгипет запрошує вас дослідити величні гробниці Луксора та зануритися в кришталево чисті води Червоного моря серед коралових рифів Хургади.',
      'Стародавній Єгипет вражає своїми пірамідами Гізи, загадками фараонів та розкішним all inclusive відпочинком на золотавих берегах Шарм-ель-Шейха.'
    ]
  };

  const choices = localFallbackDesc[destinationName] || [
    `${destinationName} — дивовижне місце, яке вабить мандрівників своєю унікальною атмосферою, неповторним колоритом, розкішними краєвидами та незабутньою гостинністю. Ідеальний вибір для вашої наступної відпустки!`,
    `Відкрийте для себе чарівність напрямку ${destinationName}. Неймовірні краєвиди, привітні люди, дивовижна історія та незабутній відпочинок гарантують вам найкращі емоції.`,
    `Подорож у ${destinationName} — це шанс відволіктися від буденності та зануритися у світ пригод, красивих локацій та неповторної атмосфери цієї дивовижної країни.`
  ];

  const fallback = choices[Math.floor(Math.random() * choices.length)];

  if (!destinationName) return fallback;

  const randomSeed = Math.floor(Math.random() * 10000000);
  const angles = [
    "романтичну атмосферу та елітні враження",
    "історичні пам'ятки, величну культуру та архітектуру",
    "дивовижну місцеву кухню, традиції та колорит",
    "неймовірну дику природу, пляжі та чудові краєвиди",
    "активні пригоди, цікаві прогулянки та яскраві екскурсії",
    "комфортабельний відпочинок, пляжний релакс та повну гармонію"
  ];
  const selectedAngle = angles[Math.floor(Math.random() * angles.length)];

  const prompt = `Ти професійний копірайтер для елітної туристичної агенції. Напиши ОДИН красивий, захоплюючий опис для туристичного напрямку: "${destinationName}" (2-3 речення, приблизно 30-40 слів). Зроби особливий акцент на ${selectedAngle}. Текст має бути виключно українською мовою, без зайвих вступних слів, лапок або привітань.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai&seed=${randomSeed}&t=${Date.now()}`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const text = await response.text();
      const cleaned = text.replace(/["'«»]/g, '').trim();
      if (cleaned && cleaned.length > 30) {
        return cleaned;
      }
    }
  } catch (error) {
    console.warn("Pollinations AI error, using local fallback description:", error);
  }

  return fallback;
}

export async function generateAiTourDescription(country, city, title) {
  const place = city ? `${city}, ${country}` : country;
  const tourName = title || `Подорож у ${place}`;
  
  const fallbacks = [
    `Неймовірний екскурсійний тур "${tourName}". На вас чекає захоплююча подорож до визначних пам'яток, комфортабельне проживання, трансфер та супровід професійного гіда. Відкрийте для себе нові куточки нашої планети та отримайте море незабутніх емоцій!`,
    `Авторська мандрівка "${tourName}" — це унікальна можливість дослідити ${place} зсередини. На вас чекають мальовничі оглядові майданчики, таємниці стародавніх міст, смачна автентична вечеря та чудова компанія однодумців.`,
    `Приєднуйтесь до захоплюючого екскурсійного туру "${tourName}". Ми детально спланували маршрут у ${place}, щоб ви побачили найкращі пам'ятки без поспіху. Комфортний транспорт, затишні готелі та море незабутніх фотографій гарантовані!`
  ];
  const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];

  const randomSeed = Math.floor(Math.random() * 10000000);
  const angles = [
    "історичну спадщину, легенди та старовинну архітектуру",
    "приховані красиві локації, панорамні види та яскраві фото",
    "колоритну культуру, дегустації місцевих страв та гостинність",
    "незабутні активні прогулянки, легкість та насиченість екскурсій",
    "ексклюзивність маршруту, затишок та елітні враження від поїздки"
  ];
  const selectedAngle = angles[Math.floor(Math.random() * angles.length)];

  const prompt = `Ти професійний копірайтер для туристичної агенції. Напиши ОДИН красивий, захоплюючий опис для екскурсійного туру "${tourName}" у місті/країні ${place} (3-4 речення, приблизно 40-50 слів). Зроби особливий акцент на ${selectedAngle}. Текст має бути виключно українською мовою, без вступних слів, лапок або привітань.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai&seed=${randomSeed}&t=${Date.now()}`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const text = await response.text();
      const cleaned = text.replace(/["'«»]/g, '').trim();
      if (cleaned && cleaned.length > 30) {
        return cleaned;
      }
    }
  } catch (error) {
    console.warn("Pollinations AI error, using local fallback tour description:", error);
  }

  return fallback;
}

export async function generateAiAviaturyDescription(country, name) {
  const place = name ? `${name} (${country})` : country;
  const fallbacks = [
    `Запрошуємо вас у незабутню індивідуальну подорож у ${place}. Пакет відпочинку включає авіапереліт, швидкий трансфер, проживання в затишному готелі, страховку та чудовий сервіс. Насолоджуйтеся морем та безтурботним релаксом!`,
    `Подаруйте собі ідеальний відпочинок у ${place}! На вас чекає розкішне тепле узбережжя, комфортабельний готель з високим рейтингом та повна свобода планування ваших днів. Переліт та трансфер повністю включені у вартість.`,
    `Індивідуальний авіатур у ${place} — це ідеальне поєднання вигідної ціни, швидкого прямого перельоту та розкішного відпочинку біля теплого моря. Все сплановано для вашої максимальної зручності!`
  ];
  const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];

  const randomSeed = Math.floor(Math.random() * 10000000);
  const angles = [
    "пляжний релакс, теплі морські хвилі та золотистий пісок",
    "комфорт та розкіш готелю, смачне харчування та якісний сервіс",
    "можливість самостійних прогулянок, шопінг та романтичні вечори",
    "зручність подорожі: швидкі перельоти, включений трансфер та спокій",
    "екзотичний настрій, незабутні враження та повне відновлення сил"
  ];
  const selectedAngle = angles[Math.floor(Math.random() * angles.length)];

  const prompt = `Ти професійний копірайтер для туристичної агенції. Напиши ОДИН красивий, захоплюючий опис для індивідуальної подорожі в готель/резорт "${place}" (3-4 речення, приблизно 40-50 слів). Зроби особливий акцент на ${selectedAngle}. Текст має бути виключно українською мовою, без вступних слів, лапок або привітань.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai&seed=${randomSeed}&t=${Date.now()}`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const text = await response.text();
      const cleaned = text.replace(/["'«»]/g, '').trim();
      if (cleaned && cleaned.length > 30) {
        return cleaned;
      }
    }
  } catch (error) {
    console.warn("Pollinations AI error, using local fallback aviatury description:", error);
  }

  return fallback;
}
