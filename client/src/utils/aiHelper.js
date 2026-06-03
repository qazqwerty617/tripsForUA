// ==========================================
// AI Helper — Smart AI for tours
// Uses Pollinations AI for text & images
// ==========================================

// --- Translation map for better AI prompts ---
const translationMap = {
  'італія': 'Italy', 'рим': 'Rome', 'венеція': 'Venice', 'флоренція': 'Florence',
  'амальфі': 'Amalfi Coast', 'позітано': 'Positano', 'мілан': 'Milan', 'неаполь': 'Naples',
  'сицилія': 'Sicily', 'сардинія': 'Sardinia', 'верона': 'Verona', 'тоскана': 'Tuscany',
  'греція': 'Greece', 'афіни': 'Athens', 'санторіні': 'Santorini', 'крит': 'Crete',
  'міконос': 'Mykonos', 'корфу': 'Corfu', 'родос': 'Rhodes', 'закінтос': 'Zakynthos',
  'іспанія': 'Spain', 'барселона': 'Barcelona', 'мадрид': 'Madrid', 'мальорка': 'Mallorca',
  'ібіца': 'Ibiza', 'тенеріфе': 'Tenerife', 'валенсія': 'Valencia', 'севілья': 'Seville',
  'франція': 'France', 'париж': 'Paris', 'ніцца': 'Nice', 'канни': 'Cannes',
  'прованс': 'Provence', 'марсель': 'Marseille', 'ліон': 'Lyon', 'бордо': 'Bordeaux',
  'туреччина': 'Turkey', 'стамбул': 'Istanbul', 'каппадокія': 'Cappadocia',
  'анталія': 'Antalya', 'бодрум': 'Bodrum', 'ізмір': 'Izmir', 'аланія': 'Alanya',
  'єгипет': 'Egypt', 'хургада': 'Hurghada', 'шарм-ель-шейх': 'Sharm el Sheikh',
  'каїр': 'Cairo', 'луксор': 'Luxor', 'александрія': 'Alexandria',
  'таїланд': 'Thailand', 'пхукет': 'Phuket', 'бангкок': 'Bangkok', 'паттайя': 'Pattaya',
  'самуї': 'Koh Samui', 'краби': 'Krabi', 'чіангмай': 'Chiang Mai',
  'мальдіви': 'Maldives', 'балі': 'Bali', 'шрі-ланка': 'Sri Lanka',
  'ісландія': 'Iceland', 'рейк\'явік': 'Reykjavik',
  'норвегія': 'Norway', 'осло': 'Oslo', 'берген': 'Bergen',
  'німеччина': 'Germany', 'берлін': 'Berlin', 'мюнхен': 'Munich', 'баварія': 'Bavaria',
  'австрія': 'Austria', 'відень': 'Vienna', 'зальцбург': 'Salzburg', 'інсбрук': 'Innsbruck',
  'швейцарія': 'Switzerland', 'цюріх': 'Zurich', 'женева': 'Geneva', 'берн': 'Bern',
  'чорногорія': 'Montenegro', 'будва': 'Budva', 'котор': 'Kotor',
  'хорватія': 'Croatia', 'дубровник': 'Dubrovnik', 'спліт': 'Split', 'загреб': 'Zagreb',
  'чехія': 'Czech Republic', 'прага': 'Prague', 'карлові вари': 'Karlovy Vary',
  'польща': 'Poland', 'краків': 'Krakow', 'варшава': 'Warsaw', 'гданськ': 'Gdansk',
  'португалія': 'Portugal', 'лісабон': 'Lisbon', 'порту': 'Porto', 'мадейра': 'Madeira',
  'великобританія': 'United Kingdom', 'лондон': 'London', 'единбург': 'Edinburgh',
  'нідерланди': 'Netherlands', 'амстердам': 'Amsterdam',
  'оае': 'UAE', 'дубай': 'Dubai', 'абу-дабі': 'Abu Dhabi',
  'японія': 'Japan', 'токіо': 'Tokyo', 'кіото': 'Kyoto', 'осака': 'Osaka',
  'марокко': 'Morocco', 'марракеш': 'Marrakech',
  'мексика': 'Mexico', 'канкун': 'Cancun',
  'домінікана': 'Dominican Republic', 'пунта-кана': 'Punta Cana',
  'куба': 'Cuba', 'гавана': 'Havana',
  'чилі': 'Chile', 'аргентина': 'Argentina', 'буенос-айрес': 'Buenos Aires',
  'бразилія': 'Brazil', 'ріо-де-жанейро': 'Rio de Janeiro',
  'індонезія': 'Indonesia', 'в\'єтнам': 'Vietnam',
  'індія': 'India', 'гоа': 'Goa', 'делі': 'Delhi',
  'кіпр': 'Cyprus', 'лімассол': 'Limassol', 'пафос': 'Paphos',
  'мальта': 'Malta', 'валлетта': 'Valletta',
  'фінляндія': 'Finland', 'гельсінкі': 'Helsinki',
  'швеція': 'Sweden', 'стокгольм': 'Stockholm',
  'данія': 'Denmark', 'копенгаген': 'Copenhagen',
  'угорщина': 'Hungary', 'будапешт': 'Budapest',
  'болгарія': 'Bulgaria', 'софія': 'Sofia',
  'румунія': 'Romania', 'бухарест': 'Bucharest',
  'словенія': 'Slovenia', 'любляна': 'Ljubljana',
  'грузія': 'Georgia', 'тбілісі': 'Tbilisi', 'батумі': 'Batumi',
  'вірменія': 'Armenia', 'єреван': 'Yerevan',
  'азербайджан': 'Azerbaijan', 'баку': 'Baku',
  'сінгапур': 'Singapore',
  'малайзія': 'Malaysia', 'куала-лумпур': 'Kuala Lumpur',
  'філіппіни': 'Philippines', 'маніла': 'Manila',
  'сейшели': 'Seychelles', 'маврикій': 'Mauritius',
  'занзібар': 'Zanzibar', 'танзанія': 'Tanzania',
  'кенія': 'Kenya', 'найробі': 'Nairobi',
  'південна африка': 'South Africa', 'кейптаун': 'Cape Town',
};

function translate(text) {
  if (!text) return '';
  const clean = text.toLowerCase().trim();
  return translationMap[clean] || text;
}

// --- Curated Unsplash photo IDs per destination ---
// Each entry maps to multiple Unsplash photo IDs for variety
const unsplashPhotos = {
  'rome': ['552832230-c0197dd311b5', '529260839382-3f77210b457b', '515542622106-78bda8ba0e5b', '531572753322-ad063cecc140'],
  'venice': ['527631746610-bca00a040d60', '520175480921-4edfa2983e0f', '512100356356-de1b84283e18'],
  'florence': ['541185933-ef5d8ed016c2', '528114039593-4366cc08227d', '534447677768-be436bb09401'],
  'amalfi coast': ['533900298318-6b8da08a523e', '516483638261-f4dbaf036963', '486848520232-a548232c95b7'],
  'positano': ['533900298318-6b8da08a523e', '524168272322-47aa26d83af7', '516483638261-f4dbaf036963'],
  'italy': ['498503182468-3b51cbb6cb24', '471306224500-6d0d218be372', '516483638261-f4dbaf036963'],
  'athens': ['603565816030-6b389eeb23cb', '555992336-03a23c7b20eb', '516450360452-9312f5e86fc7'],
  'santorini': ['570077188670-e3a8d69ac5ff', '469854523086-cc02fe5d8800', '533105079780-92b9be482077'],
  'crete': ['533105079780-92b9be482077', '507525428034-b723cf961d3e', '516450360452-9312f5e86fc7'],
  'mykonos': ['570077188670-e3a8d69ac5ff', '533105079780-92b9be482077', '469854523086-cc02fe5d8800'],
  'greece': ['533105079780-92b9be482077', '516450360452-9312f5e86fc7', '570077188670-e3a8d69ac5ff'],
  'barcelona': ['583779457094-0e34a99e91b3', '523531294919-4bea7c65e894', '539650116574-8efeb43e2750'],
  'madrid': ['539650116574-8efeb43e2750', '543783207-ec64e4d95325', '509840841025-9088ba78a826'],
  'spain': ['509840841025-9088ba78a826', '543783207-ec64e4d95325', '511527661048-7fe73d85e9a4'],
  'paris': ['502602898657-3e91760cbb34', '499856871958-5b9647a6409a', '508050919630-b13ccd264022', '522093007474-d86e9bf7ba6f'],
  'france': ['502602898657-3e91760cbb34', '499856871958-5b9647a6409a'],
  'istanbul': ['524231757912-21f4fe3a7200', '541432901042-2d8bd64b4a9b', '527838832700-50592524df7e'],
  'cappadocia': ['507608869274-d3177c8bb4c7', '641130601667-900caba58d26'],
  'turkey': ['541432901042-2d8bd64b4a9b', '524231757912-21f4fe3a7200'],
  'egypt': ['572252009286-0573f55406e3', '539768156677-4007e4a2e3ea'],
  'hurghada': ['507525428034-b723cf961d3e', '514282401047-d79a71a590e8'],
  'sharm el sheikh': ['507525428034-b723cf961d3e', '514282401047-d79a71a590e8'],
  'maldives': ['507525428034-b723cf961d3e', '514282401047-d79a71a590e8', '439066615861-d1af74d74000'],
  'bali': ['537996194471-e657df975ab4', '537953773345-d172ccf13cf1', '544550581-1765c4b5f5be'],
  'thailand': ['552465011-b4e21bf6e79a', '528181304800-2f19084187f3', '507525428034-b723cf961d3e'],
  'phuket': ['552465011-b4e21bf6e79a', '507525428034-b723cf961d3e'],
  'dubai': ['512453979798-5ea266f8880c', '526495124232-a04e18491f5a', '518684079-3c830dcef090'],
  'uae': ['512453979798-5ea266f8880c', '518684079-3c830dcef090'],
  'switzerland': ['506744038136-46273834b3fb', '464822759023-fed622ff2c3b', '470071459604-3b5ec3a7fe05'],
  'vienna': ['516550135131-5eb2e84f5c59', '609764846928-96acac94b8a5'],
  'austria': ['506744038136-46273834b3fb', '464822759023-fed622ff2c3b'],
  'prague': ['519677182759-1f97f63d5349', '562883681-f882cf67c1c7'],
  'czech republic': ['519677182759-1f97f63d5349', '562883681-f882cf67c1c7'],
  'croatia': ['534787939-38c2e7c2e36e', '555400038-66b52117aca4'],
  'dubrovnik': ['534787939-38c2e7c2e36e', '555400038-66b52117aca4'],
  'montenegro': ['534787939-38c2e7c2e36e', '570077188670-e3a8d69ac5ff'],
  'london': ['526129318838-c28cb4e98d76', '513635269975-59663e0ac1ad'],
  'united kingdom': ['526129318838-c28cb4e98d76', '513635269975-59663e0ac1ad'],
  'amsterdam': ['534351450-445156f75d70', '512100356356-de1b84283e18'],
  'iceland': ['504829857-cdc59a585072', '531227286-9a9fc0ee2404'],
  'norway': ['506905925346-3baf31cb7cc5', '470071459604-3b5ec3a7fe05'],
  'japan': ['528164344-68ecdcbcb064', '540959733-de49d4db9174'],
  'tokyo': ['540959733-de49d4db9174', '536098338-e7ce1fd58df2'],
  'morocco': ['553444836-64313cfcdc43', '489749798-d095ef9ab5c5'],
  'portugal': ['552773858-6e39e4c5b458', '555881400-b5e48e8ba7c5'],
  'lisbon': ['552773858-6e39e4c5b458', '555881400-b5e48e8ba7c5'],
  'budapest': ['509631179-18dd5dc325a5', '577593359-d81e0e74c51c'],
  'hungary': ['509631179-18dd5dc325a5', '577593359-d81e0e74c51c'],
  'georgia': ['565008880-ef428a16ed5e', '563720529-4f1e72c7f8ca'],
  'tbilisi': ['565008880-ef428a16ed5e', '563720529-4f1e72c7f8ca'],
  'batumi': ['565008880-ef428a16ed5e'],
  'cyprus': ['507525428034-b723cf961d3e', '533105079780-92b9be482077'],
  'sri lanka': ['537996194471-e657df975ab4', '544550581-1765c4b5f5be'],
  'seychelles': ['507525428034-b723cf961d3e', '439066615861-d1af74d74000'],
  'mauritius': ['507525428034-b723cf961d3e', '439066615861-d1af74d74000'],
  'singapore': ['565967088-5e5c44a72a53', '522093007474-d86e9bf7ba6f'],
  'mexico': ['518105779-78dedbd700c4', '507525428034-b723cf961d3e'],
  'cancun': ['507525428034-b723cf961d3e', '514282401047-d79a71a590e8'],
  'cuba': ['518105779-78dedbd700c4', '533105079780-92b9be482077'],
  'brazil': ['483728642662-38f5f3d862f6', '518684079-3c830dcef090'],
  'rio de janeiro': ['483728642662-38f5f3d862f6'],
  'argentina': ['612275691040-4d2e56e8b7cf'],
  'cape town': ['580060228-a1961d80b036'],
};

function getUnsplashUrl(photoId) {
  return `https://images.unsplash.com/photo-${photoId}?w=1200&q=80`;
}

// ==========================================
// TEXT AI — Pollinations wrapper with retry
// ==========================================

async function callPollinationsText(prompt, timeoutMs = 8000) {
  const seed = Math.floor(Math.random() * 99999999);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(
      `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai&seed=${seed}&t=${Date.now()}&nologo=true`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const text = await response.text();
      // Clean up any markdown, quotes, extra whitespace
      let cleaned = text
        .replace(/^```[\s\S]*?```$/gm, '')
        .replace(/[\"\'«»\*\#]/g, '')
        .replace(/^\s*[\r\n]+/gm, '')
        .trim();

      // Remove any leading "Ось" / "Звичайно" / "Ок" type AI preambles
      cleaned = cleaned.replace(/^(Ось|Звичайно|Ок,?\s*ось|Тут ваш|Ваш|Готово)[^\n:]*[:\n]\s*/i, '').trim();

      return cleaned || null;
    }
  } catch (error) {
    console.warn('Pollinations AI call failed:', error.message);
  }

  return null;
}

// ==========================================
// TITLE GENERATION
// ==========================================

export function generateSmartTourTitle(country, city) {
  if (!country) return 'Неймовірна подорож';

  const cityPart = city || country;

  const templates = [
    `Перлина ${country}: ${cityPart}`,
    `Золоті горизонти ${cityPart}`,
    `${cityPart}: Симфонія вражень`,
    `Магічна подорож: ${cityPart}`,
    `Серце ${country}`,
    `Казкова ${cityPart}`,
    `Скарби ${country}: ${cityPart}`,
    `${cityPart} — мрія мандрівника`,
    `Незабутня ${cityPart}`,
    `Таємниці ${country}`,
    `Легенди ${cityPart}`,
    `Розкішна ${cityPart}`,
    `${cityPart}: Дорога до мрії`,
    `Величний ${cityPart}`,
    `${country}: Пригода мрій`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

export async function generateAiTitle(country, city) {
  const fallbackTitle = generateSmartTourTitle(country, city);
  if (!country) return fallbackTitle;

  const engCountry = translate(country);
  const engCity = translate(city);
  const place = engCity && engCity !== engCountry ? `${engCity}, ${engCountry}` : engCountry;

  const styles = [
    'romantic and mysterious',
    'bright and emotional',
    'majestic and premium',
    'adventurous and exotic',
    'modern and laconic',
    'poetic and inspiring',
    'luxurious and elegant',
  ];
  const style = styles[Math.floor(Math.random() * styles.length)];

  const prompt = `You are a creative copywriter for a premium travel agency. Create ONE short, catchy marketing title for a tour to ${place} (maximum 4-5 words). Style: ${style}. Return ONLY the title in Ukrainian language. No quotes, no periods, no extra text. Just the title.`;

  const result = await callPollinationsText(prompt, 6000);
  if (result && result.length > 3 && result.length < 80 && !result.includes('http')) {
    return result;
  }

  return fallbackTitle;
}

// ==========================================
// DESCRIPTION GENERATION
// ==========================================

export async function generateAiDescription(destinationName) {
  const fallbacks = [
    `${destinationName || 'Цей напрямок'} — дивовижне місце, яке вабить мандрівників своєю унікальною атмосферою, неповторним колоритом, розкішними краєвидами та незабутньою гостинністю. Ідеальний вибір для вашої наступної відпустки!`,
    `Відкрийте для себе чарівність напрямку ${destinationName || 'цього краю'}. Неймовірні краєвиди, привітні люди, дивовижна історія та незабутній відпочинок гарантують вам найкращі емоції.`,
  ];
  const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  if (!destinationName) return fallback;

  const engName = translate(destinationName);
  const angles = [
    'romantic atmosphere and elite experiences',
    'historical landmarks and magnificent architecture',
    'amazing local cuisine and vibrant traditions',
    'stunning natural beauty, beaches and landscapes',
    'active adventures and exciting excursions',
    'comfortable relaxation and total harmony',
  ];
  const angle = angles[Math.floor(Math.random() * angles.length)];

  const prompt = `You are a professional copywriter for an elite travel agency. Write ONE beautiful, captivating description for destination "${engName}" (2-3 sentences, about 30-40 words). Focus on: ${angle}. Write in Ukrainian language only. No quotes, no greetings, no preambles. Just the description text.`;

  const result = await callPollinationsText(prompt, 8000);
  if (result && result.length > 25 && !result.includes('http')) {
    return result;
  }

  return fallback;
}

export async function generateAiTourDescription(country, city, title) {
  const place = city ? `${city}, ${country}` : country;
  const tourName = title || `Подорож у ${place}`;

  const fallbacks = [
    `Неймовірний екскурсійний тур "${tourName}". На вас чекає захоплююча подорож до визначних пам'яток, комфортабельне проживання, трансфер та супровід професійного гіда. Відкрийте для себе нові куточки нашої планети!`,
    `Авторська мандрівка "${tourName}" — це унікальна можливість дослідити ${place} зсередини. Мальовничі оглядові майданчики, таємниці стародавніх міст та смачна автентична вечеря.`,
    `Приєднуйтесь до захоплюючого туру "${tourName}". Маршрут у ${place} спланований до дрібниць: найкращі пам'ятки, комфортний транспорт та море незабутніх фотографій!`,
  ];
  const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];

  const engCountry = translate(country);
  const engCity = translate(city);
  const engPlace = engCity && engCity !== engCountry ? `${engCity}, ${engCountry}` : engCountry;

  const angles = [
    'historical heritage, legends and ancient architecture',
    'hidden beautiful locations, panoramic views and stunning photos',
    'colorful culture, food tastings and local hospitality',
    'exciting active walks, lightness and richness of excursions',
    'exclusive route, comfort and elite travel experience',
  ];
  const angle = angles[Math.floor(Math.random() * angles.length)];

  const prompt = `You are a professional travel copywriter. Write ONE beautiful, captivating description for excursion tour "${tourName}" in ${engPlace} (3-4 sentences, about 40-60 words). Focus on: ${angle}. Write in Ukrainian language only. No quotes, no greetings, no preambles. Just the description.`;

  const result = await callPollinationsText(prompt, 8000);
  if (result && result.length > 30 && !result.includes('http')) {
    return result;
  }

  return fallback;
}

export async function generateAiAviaturyDescription(country, name) {
  const place = name ? `${name} (${country})` : country;

  const fallbacks = [
    `Запрошуємо вас у незабутню індивідуальну подорож у ${place}. Пакет відпочинку включає авіапереліт, швидкий трансфер, проживання в затишному готелі, страховку та чудовий сервіс.`,
    `Подаруйте собі ідеальний відпочинок у ${place}! Розкішне тепле узбережжя, комфортабельний готель та повна свобода планування. Переліт і трансфер включені.`,
    `Індивідуальний авіатур у ${place} — ідеальне поєднання вигідної ціни, швидкого прямого перельоту та розкішного відпочинку біля теплого моря.`,
  ];
  const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];

  const engCountry = translate(country);
  const engName = translate(name);
  const engPlace = engName && engName !== engCountry ? `${engName}, ${engCountry}` : engCountry;

  const angles = [
    'beach relaxation, warm sea waves and golden sand',
    'hotel comfort and luxury, delicious food and quality service',
    'self-guided walks, shopping and romantic evenings',
    'travel convenience: fast flights, included transfer and peace',
    'exotic mood, unforgettable impressions and full rejuvenation',
  ];
  const angle = angles[Math.floor(Math.random() * angles.length)];

  const prompt = `You are a professional travel copywriter. Write ONE beautiful, captivating description for individual vacation package to "${engPlace}" (3-4 sentences, about 40-60 words). Focus on: ${angle}. Write in Ukrainian language only. No quotes, no greetings, no preambles. Just the description.`;

  const result = await callPollinationsText(prompt, 8000);
  if (result && result.length > 30 && !result.includes('http')) {
    return result;
  }

  return fallback;
}

// ==========================================
// IMAGE GENERATION — Smart multi-strategy
// ==========================================

export function generateAiImage(country, cityOrHotel) {
  const engCountry = translate(country);
  const engCity = translate(cityOrHotel);

  const cleanCity = (engCity || '').toLowerCase().trim();
  const cleanCountry = (engCountry || '').toLowerCase().trim();

  // Strategy 1: Curated Unsplash photos (best quality, instant)
  let photoIds = null;
  if (cleanCity && unsplashPhotos[cleanCity]) {
    photoIds = unsplashPhotos[cleanCity];
  } else if (cleanCountry && unsplashPhotos[cleanCountry]) {
    photoIds = unsplashPhotos[cleanCountry];
  }

  if (photoIds && photoIds.length > 0) {
    const selectedId = photoIds[Math.floor(Math.random() * photoIds.length)];
    return `${getUnsplashUrl(selectedId)}&sig=${Math.floor(Math.random() * 999999)}`;
  }

  // Strategy 2: Pollinations AI image generation — works for ANY destination
  const locationStr = [engCity, engCountry].filter(Boolean).join(' ');
  const photoStyles = [
    'stunning aerial view photography of',
    'beautiful golden hour landscape photo of',
    'breathtaking travel photography of',
    'professional tourism photo of',
    'scenic panoramic view of',
    'luxury resort destination photo of',
    'vibrant colorful cityscape of',
    'dreamy sunset photography of',
  ];
  const style = photoStyles[Math.floor(Math.random() * photoStyles.length)];
  const queryStr = `${style} ${locationStr}, high resolution, 4K, professional photography, travel magazine style, vibrant colors, beautiful lighting`;
  const seed = Math.floor(Math.random() * 99999999);

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(queryStr)}?width=1200&height=800&nologo=true&seed=${seed}&t=${Date.now()}`;
}
