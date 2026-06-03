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

  const prompt = `Ти креативний копірайтер для туристичної агенції. Придумай ОДИН короткий, привабливий маркетинговий заголовок для туру в країну ${country}${city ? ', місто ' + city : ''} (максимум 4-5 слів). Поверни ТІЛЬКИ цей заголовок українською мовою, без лапок, крапок або зайвого вступного тексту.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

    const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai`, {
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
    'Греція': 'Греція — колиска європейської цивілізації, країна величних міфів, білосніжних пляжів та лагідного сонця. Відкрийте для себе дивовижні острови, смачну місцеву кухню та стародавню архітектуру Афін.',
    'Італія': 'Італія — країна мистецтва, кохання та неймовірної гастрономії. Насолоджуйтеся романтичними каналами Венеції, шедеврами епохи Відродження у Флоренції та величчю вічного міста Рим.',
    'Іспанія': 'Іспанія — сонячний край пристрасного фламенко, неповторної архітектури Гауді та золотистих середземноморських пляжів. Відкрийте для себе темпераментну Барселону та величний Мадрид.',
    'Франція': 'Франція — синонім витонченого стилю, романтики та високої кухні. Відвідайте величний Париж, квітучий Прованс або розкішний Лазурний берег для незабутніх вражень.',
    'Туреччина': 'Туреччина — унікальний міст між сходом та заходом, що поєднує античні скарбниці, розкішні спа-курорти та неймовірну східну гостинність на узбережжях чотирьох морів.',
    'Єгипет': 'Єгипет — країна величних пірамід, містичних сфінксів та казкового підводного світу Червоного моря. Тут давня історія переплітається з комфортним пляжним відпочинком.'
  };

  const fallback = localFallbackDesc[destinationName] || `${destinationName} — дивовижне місце, яке вабить мандрівників своєю унікальною атмосферою, неповторним колоритом, розкішними краєвидами та незабутньою гостинністю. Ідеальний вибір для вашої наступної відпустки!`;

  if (!destinationName) return fallback;

  const prompt = `Ти професійний копірайтер для елітної туристичної агенції. Напиши ОДИН красивий, захоплюючий опис для туристичного напрямку: "${destinationName}" (2-3 речення, приблизно 30-40 слів). Текст має бути виключно українською мовою, без зайвих вступних слів, лапок або привітань.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai`, {
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
