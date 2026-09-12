const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Destination = require('./models/Destination');
const Tour = require('./models/Tour');
const Review = require('./models/Review');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB підключено'))
  .catch((err) => console.error('❌ Помилка підключення:', err));

const destinations = [
  {
    name: 'Madeira',
    nameUk: 'Мадейра',
    country: 'Португалія',
    flag: '🇵🇹',
    slug: 'madeira',
    description: 'Мадейра - португальський острів у Атлантичному океані, відомий своїми мальовничими пейзажами, левадами (іригаційними каналами) та субтропічним кліматом. Це справжній рай для любителів природи та хайкінгу.',
    shortDescription: 'Острів вічної весни з вражаючими краєвидами',
    image: 'https://images.unsplash.com/photo-1603623660476-ae82cd1c5293?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1603623660476-ae82cd1c5293?w=800',
      'https://images.unsplash.com/photo-1600058461984-f8b8f964fdc1?w=800',
      'https://images.unsplash.com/photo-1549768831-1e3ede558f1a?w=800',
      'https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=800'
    ],
    continent: 'Europe',
    featured: true,
    popularityScore: 95
  },
  {
    name: 'Iceland',
    nameUk: 'Ісландія',
    country: 'Ісландія',
    flag: '🇮🇸',
    slug: 'iceland',
    description: 'Ісландія - країна вогню та льоду, де вулкани співіснують з льодовиками. Тут ви знайдете гейзери, водоспади, чорні пляжі та північне сяйво. Унікальна природа та космічні пейзажі роблять Ісландію незабутнім місцем.',
    shortDescription: 'Країна вогню, льоду та північного сяйва',
    image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800',
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800',
      'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=800',
      'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800'
    ],
    continent: 'Europe',
    featured: true,
    popularityScore: 98
  },
  {
    name: 'Norway',
    nameUk: 'Норвегія',
    country: 'Норвегія',
    flag: '🇳🇴',
    slug: 'norway',
    description: 'Норвегія - країна фьордів, гір та північного сяйва. Вражаючі пейзажі, чисте повітря та скандинавська культура. Тут можна побачити найкрасивіші фьорди світу, каскадні водоспади та мальовничі села.',
    shortDescription: 'Казкова країна фьордів та гір',
    image: 'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?w=800',
      'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800',
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'
    ],
    continent: 'Europe',
    featured: true,
    popularityScore: 90
  },
  {
    name: 'Dolomites',
    nameUk: 'Доломіти',
    country: 'Італія',
    flag: '🇮🇹',
    slug: 'dolomites',
    description: 'Доломітові Альпи - гірський масив у Північній Італії, що входить до списку Всесвітньої спадщини ЮНЕСКО. Унікальні скелі, альпійські луки, кришталево чисті озера та італійська гостинність створюють неповторну атмосферу.',
    shortDescription: 'Альпійська казка з вражаючими вершинами',
    image: 'https://images.unsplash.com/photo-1611416517780-eff3a13b0359?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1611416517780-eff3a13b0359?w=800',
      'https://images.unsplash.com/photo-1590691815188-5d27e4b13c0c?w=800',
      'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
    ],
    continent: 'Europe',
    featured: true,
    popularityScore: 92
  },
  {
    name: 'Switzerland',
    nameUk: 'Швейцарія',
    country: 'Швейцарія',
    flag: '🇨🇭',
    slug: 'switzerland',
    description: 'Швейцарія - серце Альп, країна гір, озер та шоколаду. Мальовничі альпійські села, кришталеві озера, снігові вершини та найкрасивіші панорами Європи. Ідеальне місце для любителів гір та природи.',
    shortDescription: 'Серце Альп з казковими пейзажами',
    image: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
      'https://images.unsplash.com/photo-1580837119756-563d608dd119?w=800'
    ],
    continent: 'Europe',
    featured: true,
    popularityScore: 94
  },
  {
    name: 'Kenya',
    nameUk: 'Кенія',
    country: 'Кенія',
    flag: '🇰🇪',
    slug: 'kenya',
    description: 'Кенія - країна сафарі, де можна побачити Велику П\'ятірку африканських тварин. Національні парки, савани, гора Кілімандж��ро на горизонті, та культура масаїв створюють незабутні враження.',
    shortDescription: 'Африканське сафарі та дика природа',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
      'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800',
      'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=800',
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800'
    ],
    continent: 'Africa',
    featured: true,
    popularityScore: 88
  },
  {
    name: 'Madagascar',
    nameUk: 'Мадагаскар',
    country: 'Мадагаскар',
    flag: '🇲🇬',
    slug: 'madagascar',
    description: 'Мадагаскар - унікальний острів з неймовірним біорізноманіттям. 90% тварин та рослин є ендеміками. Лемури, баобаби, тропічні ліси та незаймані пляжі роблять Мадагаскар справжнім природним музеєм.',
    shortDescription: 'Острів лемурів та баобабів',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800',
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
    ],
    continent: 'Africa',
    featured: true,
    popularityScore: 85
  },
  {
    name: 'Mauritius',
    nameUk: 'Маврикій',
    country: 'Маврикій',
    flag: '🇲🇺',
    slug: 'mauritius',
    description: 'Маврикій - тропічний рай в Індійському океані. Білосніжні пляжі, бірюзова вода, коралові рифи та розкішна природа. Ідеальне місце для відпочинку, дайвінгу та романтичних подорожей.',
    shortDescription: 'Тропічний рай з білосніжними пляжами',
    image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800',
      'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?w=800',
      'https://images.unsplash.com/photo-1589197331516-5c8e16ae6dd9?w=800',
      'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800'
    ],
    continent: 'Africa',
    featured: true,
    popularityScore: 87
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Destination.deleteMany();
    await Tour.deleteMany();
    await Review.deleteMany();

    console.log('🗑️  Старі дані видалено');

    // Create admin user
    const admin = await User.create({
      name: 'Адміністратор',
      email: process.env.ADMIN_EMAIL || 'admin@tripsforua.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin'
    });

    console.log('✅ Адмін створено:', admin.email);

    // Create destinations
    const createdDestinations = await Destination.insertMany(destinations);
    console.log('✅ Напрямки створено:', createdDestinations.length);

    // Create sample tours
    const tours = [
      {
        destination: createdDestinations.find(d => d.slug === 'iceland')._id,
        title: 'Ісландія: Вогонь та Лід',
        country: 'Ісландія',
        city: 'Рейк\'явік',
        description: 'Незабутня подорож по найкрасивішим місцям Ісландії. Відвідаємо Золоте Кільце, чорні пляжі, льодовикові лагуни, водоспади та гейзери. Шанс побачити північне сяйво!',
        shortDescription: 'Класичний тур по Ісландії з північним сяйвом',
        price: 1850,
        originalPrice: 2200,
        duration: '7 днів / 6 ночей',
        startDate: new Date('2024-12-15'),
        endDate: new Date('2024-12-22'),
        maxParticipants: 14,
        availableSpots: 8,
        images: ['https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800'],
        highlights: [
          'Золоте Кільце Ісландії',
          'Льодовикова лагуна Йокульсарлон',
          'Водоспади Гюдльфосс та Скогафосс',
          'Чорні пляжі Рейнісфьяра',
          'Полювання за північним сяйвом',
          'Геотермальні джерела'
        ],
        included: [
          'Проживання в готелях',
          'Транспорт',
          'Професійний гід',
          'Медична страховка'
        ],
        notIncluded: [
          'Авіаквитки',
          'Харчування',
          'Додаткові екскурсії'
        ],
        featured: true,
        status: 'active'
      },
      {
        destination: createdDestinations.find(d => d.slug === 'madeira')._id,
        title: 'Мадейра: Острів Вічної Весни',
        country: 'Португалія',
        city: 'Фуншал',
        description: 'Відкрийте для себе красу Мадейри - острова з субтропічним кліматом, мальовничими левадами та вражаючими видами. Хайкінг по гірських стежках, океанські пейзажі та португальська кухня.',
        shortDescription: 'Хайкінг та природа Мадейри',
        price: 1290,
        originalPrice: 1550,
        duration: '7 днів / 6 ночей',
        startDate: new Date('2025-03-10'),
        endDate: new Date('2025-03-17'),
        maxParticipants: 15,
        availableSpots: 12,
        images: ['https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=800'],
        highlights: [
          'Хайкінг по левадам',
          'Найвищі скелі Європи - Cabo Girão',
          'Ботанічні сади Фуншала',
          'Дегустація мадери',
          'Природні басейни Порту Моніш',
          'Схід сонця на Pico do Arieiro'
        ],
        included: [
          'Проживання',
          'Трансфери',
          'Україномовний гід',
          'Страховка'
        ],
        notIncluded: [
          'Переліт',
          'Їжа',
          'Особисті витрати'
        ],
        featured: true,
        status: 'active'
      },
      {
        destination: createdDestinations.find(d => d.slug === 'switzerland')._id,
        title: 'Швейцарія: Альпійська Казка',
        country: 'Швейцарія',
        city: 'Інтерлакен',
        description: 'Найкрасивіші місця Швейцарських Альп. Інтерлакен, Юнгфрау, Церматт та Маттерхорн. Гірські озера, панорамні потяги та альпійська архітектура.',
        shortDescription: 'Тур по найкрасивіших місцях Альп',
        price: 2150,
        originalPrice: 2500,
        duration: '8 днів / 7 ночей',
        startDate: new Date('2025-06-20'),
        endDate: new Date('2025-06-28'),
        maxParticipants: 12,
        availableSpots: 9,
        images: ['https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800'],
        highlights: [
          'Юнгфрауйох - "Вершина Європи"',
          'Маттерхорн та Церматт',
          'Панорамні потяг Glacier Express',
          'Озера Люцерн та Тун',
          'Водоспад Штаубах',
          'Альпійські села'
        ],
        included: [
          'Готелі 3-4*',
          'Всі трансфери',
          'Гід',
          'Страховка',
          'Деякі вхідні квитки'
        ],
        notIncluded: [
          'Авіаквитки',
          'Харчування',
          'Канатні дороги (додатково)'
        ],
        featured: true,
        status: 'active'
      },
      {
        destination: createdDestinations.find(d => d.slug === 'kenya')._id,
        title: 'Кенія: Африканське Сафарі',
        country: 'Кенія',
        city: 'Найробі',
        description: 'Незабутнє сафарі по найкращим національним паркам Кенії. Побачте Велику П\'ятірку, великої міграції та відчуйте дух Африки. Професійні рейнджери та комфортні лоджі.',
        shortDescription: 'Сафарі та дика природа Кенії',
        price: 3200,
        originalPrice: 3750,
        duration: '10 днів / 9 ночей',
        startDate: new Date('2025-08-05'),
        endDate: new Date('2025-08-15'),
        maxParticipants: 10,
        availableSpots: 6,
        images: ['https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800'],
        highlights: [
          'Національний парк Масаї Мара',
          'Озеро Накуру з фламінго',
          'Амбоселі та Кілімантжаро',
          'Велика П\'ятірка тварин',
          'Зустріч з масаями',
          'Сафарі на джипах 4x4'
        ],
        included: [
          'Проживання в лоджах',
          'Всі сафарі',
          'Трансфери',
          'Повне харчування',
          'Рейнджер-гід',
          'Страховка'
        ],
        notIncluded: [
          'Міжнародний переліт',
          'Віза',
          'Чайові',
          'Напої'
        ],
        featured: true,
        status: 'active'
      },
      {
        destination: createdDestinations.find(d => d.slug === 'norway')._id,
        title: 'Норвегія: Країна Фьордів',
        country: 'Норвегія',
        city: 'Берген',
        description: 'Подорож по найкрасивіших фьордах Норвегії. Берген, Гейрангер-фьорд, Тролтунга та Язик Троля. Вражаючі пейзажі та скандинавська культура.',
        shortDescription: 'Тур по норвезьких фьордах',
        price: 2450,
        originalPrice: 2900,
        duration: '9 днів / 8 ночей',
        startDate: new Date('2025-07-12'),
        endDate: new Date('2025-07-21'),
        maxParticipants: 13,
        availableSpots: 10,
        images: ['https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?w=800'],
        highlights: [
          'Гейрангер-фьорд (UNESCO)',
          'Трекінг на Тролтунгу',
          'Берген та набережна Брюгген',
          'Фломська залізниця',
          'Водоспад "Сім сестер"',
          'Панорамні дороги'
        ],
        included: [
          'Розміщення',
          'Транспорт',
          'Гід',
          'Страховка'
        ],
        notIncluded: [
          'Переліт',
          'Харчування',
          'Додаткові активності'
        ],
        featured: false,
        status: 'active'
      }
    ];

    const createdTours = await Tour.insertMany(tours);
    console.log('✅ Тури створено:', createdTours.length);

    const reviews = [
      {
        tourTitle: 'Мадейра: Острів вічної весни',
        travelDate: 'Вересень 2024',
        authorName: 'Анастасія Коваленко',
        authorCity: 'Київ',
        rating: 5,
        text: 'Неймовірна подорож! Організація на найвищому рівні: від зустрічі в аеропорту до кожного трекінгу вздовж левад. Краєвиди з піків просто захоплюють дух, а компанія зібралася дуже душевна. Обов\'язково поїду з вами ще!',
        isPublished: true,
        order: 0
      },
      {
        tourTitle: 'Ісландія: Країна вогню та льоду',
        travelDate: 'Липень 2024',
        authorName: 'Дмитро та Олена',
        authorCity: 'Львів',
        rating: 5,
        text: 'Це була мрія усього життя, і вона здійснилася на всі 100%. Водоспади, гейзери, чорні пляжі Віка та купання в термальних джерелах — вражень на роки вперед. Гід знав усі секретні локації без натовпів туристів!',
        isPublished: true,
        order: 1
      },
      {
        tourTitle: 'Норвегія: Долина Фіордів та Тролтунга',
        travelDate: 'Серпень 2024',
        authorName: 'Михайло Сидоренко',
        authorCity: 'Дніпро',
        rating: 5,
        text: 'Тур перевершив усі сподівання! Чіткий таймінг, комфортне житло та шалена краса норвезьких фіордів. Підйом на Язик Троля був викликом, але підтримка команди допомогла подолати весь маршрут на одному диханні.',
        isPublished: true,
        order: 2
      }
    ];

    const createdReviews = await Review.insertMany(reviews);
    console.log('✅ Відгуки створено:', createdReviews.length);

    console.log('\n🎉 База даних успішно заповнена!');
    console.log(`\n👤 Дані для входу в адмін-панель:`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Пароль: ${process.env.ADMIN_PASSWORD || 'admin123'}`);

    process.exit();
  } catch (error) {
    console.error('❌ Помилка:', error);
    process.exit(1);
  }
};

seedDatabase();
