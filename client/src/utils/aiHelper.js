// ==========================================
// AI Helper — Smart AI for tours
// ==========================================

// --- Translation map ---
const translationMap = {
  'італія':'Italy','рим':'Rome','венеція':'Venice','флоренція':'Florence',
  'амальфі':'Amalfi Coast','позітано':'Positano','мілан':'Milan','неаполь':'Naples',
  'сицилія':'Sicily','сардинія':'Sardinia','верона':'Verona','тоскана':'Tuscany',
  'греція':'Greece','афіни':'Athens','санторіні':'Santorini','крит':'Crete',
  'міконос':'Mykonos','корфу':'Corfu','родос':'Rhodes','закінтос':'Zakynthos',
  'іспанія':'Spain','барселона':'Barcelona','мадрид':'Madrid','мальорка':'Mallorca',
  'ібіца':'Ibiza','тенеріфе':'Tenerife','валенсія':'Valencia','севілья':'Seville',
  'франція':'France','париж':'Paris','ніцца':'Nice','канни':'Cannes',
  'прованс':'Provence','марсель':'Marseille','ліон':'Lyon','бордо':'Bordeaux',
  'туреччина':'Turkey','стамбул':'Istanbul','каппадокія':'Cappadocia',
  'анталія':'Antalya','бодрум':'Bodrum','ізмір':'Izmir','аланія':'Alanya',
  'єгипет':'Egypt','хургада':'Hurghada','шарм-ель-шейх':'Sharm el Sheikh',
  'каїр':'Cairo','луксор':'Luxor','александрія':'Alexandria',
  'таїланд':'Thailand','пхукет':'Phuket','бангкок':'Bangkok','паттайя':'Pattaya',
  'самуї':'Koh Samui','краби':'Krabi','чіангмай':'Chiang Mai',
  'мальдіви':'Maldives','балі':'Bali','шрі-ланка':'Sri Lanka',
  'ісландія':'Iceland',"рейк'явік":'Reykjavik',
  'норвегія':'Norway','осло':'Oslo','берген':'Bergen',
  'німеччина':'Germany','берлін':'Berlin','мюнхен':'Munich','баварія':'Bavaria',
  'австрія':'Austria','відень':'Vienna','зальцбург':'Salzburg','інсбрук':'Innsbruck',
  'швейцарія':'Switzerland','цюріх':'Zurich','женева':'Geneva','берн':'Bern',
  'чорногорія':'Montenegro','будва':'Budva','котор':'Kotor',
  'хорватія':'Croatia','дубровник':'Dubrovnik','спліт':'Split','загреб':'Zagreb',
  'чехія':'Czech Republic','прага':'Prague','карлові вари':'Karlovy Vary',
  'польща':'Poland','краків':'Krakow','варшава':'Warsaw','гданськ':'Gdansk',
  'португалія':'Portugal','лісабон':'Lisbon','порту':'Porto','мадейра':'Madeira',
  'великобританія':'United Kingdom','лондон':'London','единбург':'Edinburgh',
  'нідерланди':'Netherlands','амстердам':'Amsterdam',
  'оае':'UAE','дубай':'Dubai','абу-дабі':'Abu Dhabi',
  'японія':'Japan','токіо':'Tokyo','кіото':'Kyoto','осака':'Osaka',
  'марокко':'Morocco','марракеш':'Marrakech',
  'мексика':'Mexico','канкун':'Cancun',
  'домінікана':'Dominican Republic','пунта-кана':'Punta Cana',
  'куба':'Cuba','гавана':'Havana',
  'чилі':'Chile','аргентина':'Argentina','буенос-айрес':'Buenos Aires',
  'бразилія':'Brazil','ріо-де-жанейро':'Rio de Janeiro',
  'індонезія':'Indonesia',"в'єтнам":'Vietnam',
  'індія':'India','гоа':'Goa','делі':'Delhi',
  'кіпр':'Cyprus','лімассол':'Limassol','пафос':'Paphos',
  'мальта':'Malta','валлетта':'Valletta',
  'фінляндія':'Finland','гельсінкі':'Helsinki',
  'швеція':'Sweden','стокгольм':'Stockholm',
  'данія':'Denmark','копенгаген':'Copenhagen',
  'угорщина':'Hungary','будапешт':'Budapest',
  'болгарія':'Bulgaria','софія':'Sofia',
  'румунія':'Romania','бухарест':'Bucharest',
  'словенія':'Slovenia','любляна':'Ljubljana',
  'грузія':'Georgia','тбілісі':'Tbilisi','батумі':'Batumi',
  'вірменія':'Armenia','єреван':'Yerevan',
  'азербайджан':'Azerbaijan','баку':'Baku',
  'сінгапур':'Singapore','малайзія':'Malaysia','куала-лумпур':'Kuala Lumpur',
  'філіппіни':'Philippines','маніла':'Manila',
  'сейшели':'Seychelles','маврикій':'Mauritius',
  'занзібар':'Zanzibar','танзанія':'Tanzania',
  'кенія':'Kenya','найробі':'Nairobi',
  'південна африка':'South Africa','кейптаун':'Cape Town',
  'україна':'Ukraine','київ':'Kyiv','львів':'Lviv','одеса':'Odesa',
  'харків':'Kharkiv','дніпро':'Dnipro','запоріжжя':'Zaporizhzhia',
  'івано-франківськ':'Ivano-Frankivsk','яремче':'Yaremche','буковель':'Bukovel',
  'карпати':'Carpathian Mountains','закарпаття':'Zakarpattia','ужгород':'Uzhhorod',
  'мукачево':'Mukachevo','чернівці':'Chernivtsi','тернопіль':'Ternopil',
  'луцьк':'Lutsk','рівне':'Rivne','житомир':'Zhytomyr','вінниця':'Vinnytsia',
  'полтава':'Poltava','чернігів':'Chernihiv','суми':'Sumy',
  'херсон':'Kherson','миколаїв':'Mykolaiv','черкаси':'Cherkasy',
  'хмельницький':'Khmelnytskyi','крим':'Crimea',
};

function translate(text) {
  if (!text) return '';
  return translationMap[text.toLowerCase().trim()] || text;
}

// --- Verified Unsplash photo IDs (full correct IDs, no auto-prefix) ---
// Format: full numeric ID as it appears on unsplash.com/photo-XXXXXX
const unsplashPhotos = {
  'rome':         ['1552832230-c0197dd311b5','1529260839382-3f77210b457b','1515542622106-78bda8ba0e5b'],
  'venice':       ['1516483638261-f4dbaf036963','1527631746610-bca00a040d60','1520175480921-4edfa2983e0f'],
  'florence':     ['1534447677768-be436bb09401','1541185933-ef5d8ed016c2','1528114039593-4366cc08227d'],
  'amalfi coast': ['1533900298318-6b8da08a523e','1486848520232-a548232c95b7'],
  'positano':     ['1533900298318-6b8da08a523e','1524168272322-47aa26d83af7'],
  'italy':        ['1516483638261-f4dbaf036963','1552832230-c0197dd311b5','1534447677768-be436bb09401'],
  'athens':       ['1603565816030-6b389eeb23cb','1516450360452-9312f5e86fc7'],
  'santorini':    ['1533105079780-92b9be482077','1469854523086-cc02fe5d8800','1570077188670-e3a8d69ac5ff'],
  'crete':        ['1533105079780-92b9be482077','1507525428034-b723cf961d3e'],
  'mykonos':      ['1570077188670-e3a8d69ac5ff','1533105079780-92b9be482077'],
  'greece':       ['1533105079780-92b9be482077','1516450360452-9312f5e86fc7','1469854523086-cc02fe5d8800'],
  'barcelona':    ['1539650116574-8efeb43e2750','1523531294919-4bea7c65e894'],
  'madrid':       ['1539650116574-8efeb43e2750','1543783207-ec64e4d95325'],
  'spain':        ['1539650116574-8efeb43e2750','1523531294919-4bea7c65e894'],
  'paris':        ['1499856871958-5b9647a6409a','1502602898657-3e91760cbb34','1508050919630-b13ccd264022'],
  'france':       ['1499856871958-5b9647a6409a','1502602898657-3e91760cbb34'],
  'istanbul':     ['1524231757912-21f4fe3a7200','1541432901042-2d8bd64b4a9b'],
  'cappadocia':   ['1507608869274-d3177c8bb4c7'],
  'turkey':       ['1524231757912-21f4fe3a7200','1541432901042-2d8bd64b4a9b'],
  'egypt':        ['1539768156677-4007e4a2e3ea','1572252009286-0573f55406e3'],
  'hurghada':     ['1507525428034-b723cf961d3e','1514282401047-d79a71a590e8'],
  'sharm el sheikh':['1507525428034-b723cf961d3e','1514282401047-d79a71a590e8'],
  'maldives':     ['1507525428034-b723cf961d3e','1439066615861-d1af74d74000','1514282401047-d79a71a590e8'],
  'bali':         ['1537996194471-e657df975ab4','1537953773345-d172ccf13cf1'],
  'thailand':     ['1552465011-b4e21bf6e79a','1507525428034-b723cf961d3e'],
  'phuket':       ['1552465011-b4e21bf6e79a','1507525428034-b723cf961d3e'],
  'dubai':        ['1512453979798-5ea266f8880c','1526495124232-a04e18491f5a'],
  'uae':          ['1512453979798-5ea266f8880c','1518684079-3c830dcef090'],
  'switzerland':  ['1506744038136-46273834b3fb','1464822759023-fed622ff2c3b','1470071459604-3b5ec3a7fe05'],
  'vienna':       ['1516550135131-5eb2e84f5c59'],
  'austria':      ['1506744038136-46273834b3fb','1464822759023-fed622ff2c3b'],
  'prague':       ['1519677182759-1f97f63d5349'],
  'czech republic':['1519677182759-1f97f63d5349'],
  'croatia':      ['1534787939-38c2e7c2e36e'],
  'dubrovnik':    ['1534787939-38c2e7c2e36e'],
  'montenegro':   ['1534787939-38c2e7c2e36e'],
  'london':       ['1513635269975-59663e0ac1ad','1526129318838-c28cb4e98d76'],
  'united kingdom':['1513635269975-59663e0ac1ad','1526129318838-c28cb4e98d76'],
  'amsterdam':    ['1534351450-445156f75d70'],
  'iceland':      ['1504829857-cdc59a585072'],
  'norway':       ['1506905925346-3baf31cb7cc5','1470071459604-3b5ec3a7fe05'],
  'japan':        ['1528164344-68ecdcbcb064','1540959733-de49d4db9174'],
  'tokyo':        ['1540959733-de49d4db9174'],
  'morocco':      ['1553444836-64313cfcdc43'],
  'marrakech':    ['1553444836-64313cfcdc43'],
  'portugal':     ['1555881400-b5e48e8ba7c5','1552773858-6e39e4c5b458'],
  'lisbon':       ['1555881400-b5e48e8ba7c5','1552773858-6e39e4c5b458'],
  'budapest':     ['1509631179-18dd5dc325a5'],
  'hungary':      ['1509631179-18dd5dc325a5'],
  'georgia':      ['1565008880-ef428a16ed5e'],
  'tbilisi':      ['1565008880-ef428a16ed5e'],
  'batumi':       ['1565008880-ef428a16ed5e'],
  'cyprus':       ['1507525428034-b723cf961d3e'],
  'sri lanka':    ['1537996194471-e657df975ab4'],
  'seychelles':   ['1507525428034-b723cf961d3e','1439066615861-d1af74d74000'],
  'mauritius':    ['1439066615861-d1af74d74000'],
  'singapore':    ['1565967088-5e5c44a72a53'],
  'mexico':       ['1518105779-78dedbd700c4'],
  'cancun':       ['1507525428034-b723cf961d3e','1514282401047-d79a71a590e8'],
  'cuba':         ['1518105779-78dedbd700c4'],
  'brazil':       ['1483728642662-38f5f3d862f6'],
  'rio de janeiro':['1483728642662-38f5f3d862f6'],
  'argentina':    ['1612275691040-4d2e56e8b7cf'],
  'cape town':    ['1580060228-a1961d80b036'],
  'kyiv':         ['1568322445389-f64ac2515020'],
  'ukraine':      ['1568322445389-f64ac2515020'],
  'lviv':         ['1559827260-dc66d52bef19'],
  'bukovel':      ['1506905925346-3baf31cb7cc5'],
  'carpathian mountains':['1506905925346-3baf31cb7cc5','1470071459604-3b5ec3a7fe05'],
};

// Correct Unsplash URL — IDs are already full and correct, no modification needed
function getUnsplashUrl(photoId) {
  return `https://images.unsplash.com/photo-${photoId}?w=1200&q=85&auto=format&fit=crop`;
}

// ==========================================
// TEXT AI — puter.js (free, no key, no rate limit)
// Falls back to smart local templates
// ==========================================

async function callPuterAI(prompt) {
  try {
    // puter.js is loaded via CDN in index.html — check if available
    if (typeof window !== 'undefined' && window.puter && window.puter.ai) {
      const response = await window.puter.ai.chat(prompt, {
        model: 'gpt-4o-mini',
        max_tokens: 200,
      });
      const text = typeof response === 'string'
        ? response
        : response?.message?.content || response?.choices?.[0]?.message?.content || '';
      return text.trim() || null;
    }
  } catch (e) {
    console.warn('puter.ai failed:', e.message);
  }

  // Fallback: Pollinations GET (simple, may work when not rate-limited)
  try {
    const seed = Math.floor(Math.random() * 99999999);
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 7000);
    const res = await fetch(
      `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai&seed=${seed}&nologo=true`,
      { signal: controller.signal }
    );
    clearTimeout(tid);
    if (res.ok) {
      const t = (await res.text()).trim();
      // Strip preambles
      const cleaned = t
        .replace(/^(Ось|Звичайно|Ок,?\s*ось|Тут|Ваш|Готово)[^\n:]*[:\n]\s*/i, '')
        .replace(/[\"\'*#]/g, '')
        .trim();
      if (cleaned.length > 5) return cleaned;
    }
  } catch (e) {
    console.warn('Pollinations fallback failed:', e.message);
  }

  return null;
}

// ==========================================
// TITLE GENERATION
// ==========================================

export function generateSmartTourTitle(country, city) {
  if (!country) return 'Неймовірна подорож';
  const place = city || country;
  const templates = [
    `Перлина ${country}: ${place}`,
    `Золоті горизонти ${place}`,
    `${place}: Симфонія вражень`,
    `Магічна подорож у ${place}`,
    `Серце ${country}`,
    `Казкова ${place}`,
    `Скарби ${country}: ${place}`,
    `${place} — мрія мандрівника`,
    `Незабутня ${place}`,
    `Таємниці ${country}`,
    `Легенди ${place}`,
    `Розкішна ${place}`,
    `${place}: Дорога до мрії`,
    `Величний ${place}`,
    `${country}: Пригода мрій`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function generateAiTitle(country, city) {
  const fallback = generateSmartTourTitle(country, city);
  if (!country) return fallback;

  const engCountry = translate(country);
  const engCity = translate(city);
  const place = engCity && engCity !== engCountry ? `${engCity}, ${engCountry}` : engCountry;

  const styles = ['romantic','majestic and premium','adventurous','poetic','luxurious and elegant','dreamy'];
  const style = styles[Math.floor(Math.random() * styles.length)];

  const prompt = `You are a travel copywriter. Create ONE short catchy tour title for "${place}" (3-5 words max). Style: ${style}. Reply ONLY with the title in Ukrainian. No quotes, no punctuation.`;

  const result = await callPuterAI(prompt);
  if (result && result.length > 3 && result.length < 80 && !result.includes('http')) {
    return result;
  }
  return fallback;
}

// ==========================================
// DESCRIPTION GENERATION
// ==========================================

export async function generateAiDescription(destinationName) {
  const fb = [
    `${destinationName || 'Цей напрямок'} — дивовижне місце, яке вабить мандрівників своєю унікальною атмосферою, розкішними краєвидами та незабутньою гостинністю. Ідеальний вибір для наступної відпустки!`,
    `Відкрийте для себе ${destinationName || 'цей край'} — місце, де кожен куточок дихає красою та історією. Неймовірні краєвиди, автентична кухня та щира гостинність чекають на вас.`,
  ];
  const fallback = fb[Math.floor(Math.random() * fb.length)];
  if (!destinationName) return fallback;

  const engName = translate(destinationName);
  const angles = [
    'romantic atmosphere and golden sunsets','historical landmarks and architecture',
    'local cuisine and vibrant culture','stunning nature, beaches and landscapes',
    'exciting adventures and excursions','peaceful relaxation and harmony',
  ];
  const angle = angles[Math.floor(Math.random() * angles.length)];
  const tones = ['luxurious','poetic','warm and inviting','inspirational'];
  const tone = tones[Math.floor(Math.random() * tones.length)];

  const prompt = `You are an elite travel copywriter. Write a beautiful 2-3 sentence description for destination "${engName}". Focus on: ${angle}. Tone: ${tone}. Write in Ukrainian ONLY. Start directly with text, no preamble, no quotes.`;

  const result = await callPuterAI(prompt);
  if (result && result.length > 25 && !result.includes('http')) return result;
  return fallback;
}

export async function generateAiTourDescription(country, city, title) {
  const place = city ? `${city}, ${country}` : country;
  const tourName = title || `Подорож у ${place}`;
  const fb = [
    `Відкрийте для себе ${place} разом із нашим ексклюзивним туром «${tourName}». Вас чекають визначні пам'ятки, автентична кухня та незабутні враження під супроводом досвідченого гіда.`,
    `Тур «${tourName}» — це ваш шанс побачити найкраще з ${place}. Продуманий маршрут, комфортне проживання та море яскравих вражень.`,
    `Приєднуйтесь до захоплюючої мандрівки «${tourName}» — найкращі пам'ятки ${place}, автентична атмосфера та фотографії на все життя!`,
  ];
  const fallback = fb[Math.floor(Math.random() * fb.length)];

  const engCountry = translate(country);
  const engCity = translate(city);
  const engPlace = engCity && engCity !== engCountry ? `${engCity}, ${engCountry}` : engCountry;

  const angles = [
    'historical landmarks and architecture','scenic panoramas and landscapes',
    'local culture and cuisine','comfortable premium experience',
    'active excursions and sightseeing',
  ];
  const angle = angles[Math.floor(Math.random() * angles.length)];
  const tones = ['premium and elegant','emotional and inspiring','romantic'];
  const tone = tones[Math.floor(Math.random() * tones.length)];

  const prompt = `You are a travel copywriter. Write a 3-4 sentence tour description for "${tourName}" in ${engPlace}. Focus on: ${angle}. Tone: ${tone}. Write in Ukrainian ONLY. No quotes, no preamble, start directly.`;

  const result = await callPuterAI(prompt);
  if (result && result.length > 30 && !result.includes('http')) return result;
  return fallback;
}

export async function generateAiAviaturyDescription(country, name) {
  const place = name ? `${name} (${country})` : country;
  const fb = [
    `Запрошуємо у незабутній авіатур до ${place}! Пакет включає переліт, трансфер та проживання в затишному готелі. Відпочинок вашої мрії вже чекає.`,
    `${place} — ідеальне місце для відпочинку душі й тіла. Тепле море, розкішний готель та все включено. Переліт і трансфер організуємо ми.`,
    `Індивідуальний авіатур у ${place} — вигідна ціна, прямий переліт і розкішний відпочинок біля моря. Бронюйте вже сьогодні!`,
  ];
  const fallback = fb[Math.floor(Math.random() * fb.length)];

  const engCountry = translate(country);
  const engName = translate(name);
  const engPlace = engName && engName !== engCountry ? `${engName}, ${engCountry}` : engCountry;

  const angles = [
    'beach relaxation and warm turquoise sea','hotel luxury and all-inclusive comfort',
    'exotic vibes and unforgettable impressions','fast flights and seamless travel experience',
  ];
  const angle = angles[Math.floor(Math.random() * angles.length)];
  const tones = ['prestigious','relaxing and warm','dreamy and elegant'];
  const tone = tones[Math.floor(Math.random() * tones.length)];

  const prompt = `You are a travel copywriter. Write a 3-4 sentence vacation package description for "${engPlace}". Focus on: ${angle}. Tone: ${tone}. Write in Ukrainian ONLY. No quotes, no preamble, start directly.`;

  const result = await callPuterAI(prompt);
  if (result && result.length > 30 && !result.includes('http')) return result;
  return fallback;
}

// ==========================================
// IMAGE GENERATION
// ==========================================

export function generateAiImage(country, cityOrHotel) {
  const engCountry = translate(country);
  const engCity = translate(cityOrHotel);

  const cleanCity = (engCity || '').toLowerCase().trim();
  const cleanCountry = (engCountry || '').toLowerCase().trim();

  // Try curated Unsplash first
  let photoIds = unsplashPhotos[cleanCity] || unsplashPhotos[cleanCountry] || null;

  // 60% chance to use curated photo if available (guarantees variety on repeated clicks)
  if (photoIds && photoIds.length > 0 && Math.random() < 0.6) {
    const id = photoIds[Math.floor(Math.random() * photoIds.length)];
    return getUnsplashUrl(id) + `&sig=${Math.floor(Math.random() * 999999)}`;
  }

  // Fallback: Pollinations Flux AI image (works for any destination)
  const locationStr = [engCity, engCountry].filter(Boolean).join(', ');
  const styles = [
    'professional travel photography of',
    'stunning golden hour landscape of',
    'breathtaking travel magazine photo of',
    'scenic panoramic view of',
    'luxury vacation photography of',
    'vibrant colorful cityscape of',
    'dreamy aerial photography of',
  ];
  const style = styles[Math.floor(Math.random() * styles.length)];
  const query = `${style} ${locationStr}, 4K ultra HD, photorealistic, vibrant colors, professional lighting, travel magazine quality`;
  const seed = Math.floor(Math.random() * 99999999);

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}?width=1200&height=800&nologo=true&seed=${seed}&model=flux`;
}
