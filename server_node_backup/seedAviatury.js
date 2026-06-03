const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Aviatur = require('./models/Aviatur');

dotenv.config();

// Дані авіатурів
const aviaturyData = [
  {
    name: "Крит",
    country: "Греція",
    flag: "🇬🇷",
    price: 450,

    nights: 6,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "Сніданок"],
    notIncluded: ["Екскурсії", "Обід та вечеря", "Страховка"],
    status: "active",
    hot: true
  },
  {
    name: "Корфу",
    country: "Греція",
    flag: "🇬🇷",
    price: 480,

    nights: 6,
    image: "https://images.unsplash.com/photo-sRRD3LOhdq0?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "Сніданок"],
    notIncluded: ["Екскурсії", "Обід та вечеря", "Страховка"],
    status: "active",
    hot: true
  },
  {
    name: "Родос",
    country: "Греція",
    flag: "🇬🇷",
    price: 460,

    nights: 6,
    image: "https://images.unsplash.com/photo-w9SMSrezuB8?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "Сніданок"],
    notIncluded: ["Екскурсії", "Обід та вечеря", "Страховка"],
    status: "active"
  },
  {
    name: "Закінтос",
    country: "Греція",
    flag: "🇬🇷",
    price: 490,

    nights: 6,
    image: "https://images.unsplash.com/photo-nWlTowAYE1c?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "Сніданок"],
    notIncluded: ["Екскурсії", "Обід та вечеря", "Страховка"],
    status: "active"
  },
  {
    name: "Майорка",
    country: "Іспанія",
    flag: "🇪🇸",
    price: 520,

    nights: 6,
    image: "https://images.unsplash.com/photo-O0xdBP5yCqo?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "Сніданок"],
    notIncluded: ["Екскурсії", "Обід та вечеря", "Страховка"],
    status: "active",
    hot: true
  },
  {
    name: "Тенеріфе",
    country: "Іспанія",
    flag: "🇪🇸",
    price: 550,

    nights: 6,
    image: "https://images.unsplash.com/photo-LAey-PFjHBU?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "Сніданок"],
    notIncluded: ["Екскурсії", "Обід та вечеря", "Страховка"],
    status: "active"
  },
  {
    name: "Лансароте",
    country: "Іспанія",
    flag: "🇪🇸",
    price: 530,

    nights: 6,
    image: "https://images.unsplash.com/photo-1612450648733-87005afd995d?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "Сніданок"],
    notIncluded: ["Екскурсії", "Обід та вечеря", "Страховка"],
    status: "active"
  },
  {
    name: "Фуертевентура",
    country: "Іспанія",
    flag: "🇪🇸",
    price: 540,

    nights: 6,
    image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "Сніданок"],
    notIncluded: ["Екскурсії", "Обід та вечеря", "Страховка"],
    status: "active"
  },
  {
    name: "Гран-Канарія",
    country: "Іспанія",
    flag: "🇪🇸",
    price: 545,

    nights: 6,
    image: "https://images.unsplash.com/photo-1600011689032-8b628b8a8747?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "Сніданок"],
    notIncluded: ["Екскурсії", "Обід та вечеря", "Страховка"],
    status: "active"
  },
  {
    name: "Коста-Брава",
    country: "Іспанія",
    flag: "🇪🇸",
    price: 480,

    nights: 6,
    image: "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "Сніданок"],
    notIncluded: ["Екскурсії", "Обід та вечеря", "Страховка"],
    status: "active"
  },
  {
    name: "Торревʼєха",
    country: "Іспанія",
    flag: "🇪🇸",
    price: 470,

    nights: 6,
    image: "https://images.unsplash.com/photo-1562832135-14a35d25edef?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "Сніданок"],
    notIncluded: ["Екскурсії", "Обід та вечеря", "Страховка"],
    status: "active"
  },
  {
    name: "Коста-Дорада",
    country: "Іспанія",
    flag: "🇪🇸",
    price: 490,

    nights: 6,
    image: "https://images.unsplash.com/photo-1568849676085-51415703900f?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "Сніданок"],
    notIncluded: ["Екскурсії", "Обід та вечеря", "Страховка"],
    status: "active"
  },
  {
    name: "Марбелья",
    country: "Іспанія",
    flag: "🇪🇸",
    price: 560,

    nights: 6,
    image: "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "Сніданок"],
    notIncluded: ["Екскурсії", "Обід та вечеря", "Страховка"],
    status: "active"
  },
  {
    name: "Аліканте",
    country: "Іспанія",
    flag: "🇪🇸",
    price: 475,

    nights: 6,
    image: "https://images.unsplash.com/photo-1523905330026-b8bd1f5f320e?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "Сніданок"],
    notIncluded: ["Екскурсії", "Обід та вечеря", "Страховка"],
    status: "active"
  },
  {
    name: "Адріатичне узбережжя",
    country: "Хорватія",
    flag: "🇭🇷",
    price: 500,

    nights: 6,
    image: "https://images.unsplash.com/photo-1526481280695-3c469673580d?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "Сніданок"],
    notIncluded: ["Екскурсії", "Обід та вечеря", "Страховка"],
    status: "active"
  },
  {
    name: "Задар",
    country: "Хорватія",
    flag: "🇭🇷",
    price: 510,

    nights: 6,
    image: "https://images.unsplash.com/photo-1568849676085-51415703900f?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "Сніданок"],
    notIncluded: ["Екскурсії", "Обід та вечеря", "Страховка"],
    status: "active"
  },
  {
    name: "Чорногорія",
    country: "Чорногорія",
    flag: "🇲🇪",
    price: 420,

    nights: 6,
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "Сніданок"],
    notIncluded: ["Екскурсії", "Обід та вечеря", "Страховка"],
    status: "active"
  },
  {
    name: "Албанія",
    country: "Албанія",
    flag: "🇦🇱",
    price: 380,

    nights: 6,
    image: "https://images.unsplash.com/photo-1604327697270-ded7b9d3c539?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "Сніданок"],
    notIncluded: ["Екскурсії", "Обід та вечеря", "Страховка"],
    status: "active"
  },
  {
    name: "Анталія",
    country: "Туреччина",
    flag: "🇹🇷",
    price: 350,

    nights: 6,
    image: "https://images.unsplash.com/photo-1559589689-577aabd1dbda?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "All Inclusive"],
    notIncluded: ["Екскурсії", "Страховка", "Алкогольні напої"],
    status: "active",
    hot: true
  },
  {
    name: "Шарм-ель-Шейх",
    country: "Єгипет",
    flag: "🇪🇬",
    price: 400,

    nights: 6,
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "All Inclusive"],
    notIncluded: ["Екскурсії", "Страховка", "Алкогольні напої"],
    status: "active"
  },
  {
    name: "Хургада",
    country: "Єгипет",
    flag: "🇪🇬",
    price: 380,

    nights: 6,
    image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "All Inclusive"],
    notIncluded: ["Екскурсії", "Страховка", "Алкогольні напої"],
    status: "active"
  },
  {
    name: "Париж",
    country: "Франція",
    flag: "🇫🇷",
    price: 580,

    nights: 4,
    image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання"],
    notIncluded: ["Харчування", "Екскурсії", "Страховка"],
    status: "active"
  },
  {
    name: "Рим",
    country: "Італія",
    flag: "🇮🇹",
    price: 550,

    nights: 4,
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання"],
    notIncluded: ["Харчування", "Екскурсії", "Страховка"],
    status: "active"
  },
  {
    name: "Венеція",
    country: "Італія",
    flag: "🇮🇹",
    price: 570,

    nights: 4,
    image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання"],
    notIncluded: ["Харчування", "Екскурсії", "Страховка"],
    status: "active"
  },
  {
    name: "Амстердам",
    country: "Нідерланди",
    flag: "🇳🇱",
    price: 540,

    nights: 4,
    image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання"],
    notIncluded: ["Харчування", "Екскурсії", "Страховка"],
    status: "active"
  },
  {
    name: "Барселона",
    country: "Іспанія",
    flag: "🇪🇸",
    price: 520,

    nights: 4,
    image: "https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання"],
    notIncluded: ["Харчування", "Екскурсії", "Страховка"],
    status: "active"
  },
  {
    name: "Мадрид",
    country: "Іспанія",
    flag: "🇪🇸",
    price: 510,

    nights: 4,
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання"],
    notIncluded: ["Харчування", "Екскурсії", "Страховка"],
    status: "active"
  },
  {
    name: "Валенсія",
    country: "Іспанія",
    flag: "🇪🇸",
    price: 500,

    nights: 4,
    image: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання"],
    notIncluded: ["Харчування", "Екскурсії", "Страховка"],
    status: "active"
  },
  {
    name: "Афіни",
    country: "Греція",
    flag: "🇬🇷",
    price: 480,

    nights: 4,
    image: "https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання"],
    notIncluded: ["Харчування", "Екскурсії", "Страховка"],
    status: "active"
  },
  {
    name: "Мадейра",
    country: "Португалія",
    flag: "🇵🇹",
    price: 560,

    nights: 6,
    image: "https://images.unsplash.com/photo-HXOgKJucTAw?w=800&auto=format&fit=crop",
    included: ["Переліт", "Трансфер", "Проживання", "Сніданок"],
    notIncluded: ["Екскурсії", "Обід та вечеря", "Страховка"],
    status: "active"
  }
];

const seedAviatury = async () => {
  try {
    const args = process.argv.slice(2);
    const forceUpdate = args.includes('--force') || args.includes('--update');
    const fresh = args.includes('--fresh');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB підключено');

    if (fresh) {
      await Aviatur.deleteMany({});
      console.log('🗑️  Старі авіатури видалено (режим --fresh)');
    }

    const today = new Date();
    const withDates = aviaturyData.map((item, idx) => {
      const startOffset = (idx % 12) * 3;
      const from = new Date(today);
      from.setDate(from.getDate() + startOffset);
      const to = new Date(from);
      to.setDate(to.getDate() + 6 + (idx % 5));
      return {
        ...item,
        availableFrom: from,
        availableTo: to,
      };
    });

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of withDates) {
      if (fresh || forceUpdate) {
        await Aviatur.findOneAndUpdate(
          { name: item.name },
          item,
          { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );
        if (fresh) {
          created++;
        } else {
          updated++;
        }
      } else {
        const exists = await Aviatur.findOne({ name: item.name });
        if (exists) {
          skipped++;
          continue;
        }
        await Aviatur.create(item);
        created++;
      }
    }

    if (!forceUpdate && !fresh) {
      console.log(`✅ Додано ${created} нових авіатурів. Пропущено існуючих: ${skipped}.`);
    } else if (fresh) {
      console.log(`✅ Перезаписано ${created} авіатурів у режимі --fresh.`);
    } else {
      console.log(`✅ Оновлено або створено ${created + updated} авіатурів (оновлено: ${updated}, створено: ${created}).`);
    }

    console.log('ℹ️  За замовчуванням скрипт не перезаписує існуючі записи. Використовуйте --update для оновлення або --fresh для повного перезапису.');
    console.log('🎉 Seed завершено успішно!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Помилка:', error);
    process.exit(1);
  }
};

seedAviatury();
