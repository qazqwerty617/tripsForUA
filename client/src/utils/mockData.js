// Frontend-only mock data used when backend API is unavailable.
// Structure mirrors server seed data and API responses.

export const destinations = [
  {
    _id: 'dst_iceland',
    name: 'Iceland',
    nameUk: 'Ісландія',
    country: 'Ісландія',
    flag: '🇮🇸',
    slug: 'iceland',
    shortDescription: 'Країна вогню, льоду та північного сяйва',
    image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800'
    ],
    continent: 'Europe',
    featured: true
  },
  {
    _id: 'dst_madeira',
    name: 'Madeira',
    nameUk: 'Мадейра',
    country: 'Португалія',
    flag: '🇵🇹',
    slug: 'madeira',
    shortDescription: 'Острів вічної весни з вражаючими краєвидами',
    image: 'https://images.unsplash.com/photo-1603623660476-ae82cd1c5293?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1603623660476-ae82cd1c5293?w=800'
    ],
    continent: 'Europe',
    featured: true
  },
  {
    _id: 'dst_switzerland',
    name: 'Switzerland',
    nameUk: 'Швейцарія',
    country: 'Швейцарія',
    flag: '🇨🇭',
    slug: 'switzerland',
    shortDescription: 'Серце Альп з казковими пейзажами',
    image: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800'
    ],
    continent: 'Europe',
    featured: true
  }
]

export const tours = [
  {
    _id: 'tour_iceland',
    destination: {
      _id: 'dst_iceland',
      name: 'Iceland',
      nameUk: 'Ісландія',
      flag: '🇮🇸'
    },
    title: 'Ісландія: Вогонь та Лід',
    shortDescription: 'Класичний тур по Ісландії з північним сяйвом',
    description: 'Незабутня подорож по найкрасивішим місцям Ісландії.',
    price: 1850,
    duration: '7 днів / 6 ночей',
    startDate: '2025-12-15T00:00:00.000Z',
    endDate: '2025-12-22T00:00:00.000Z',
    maxParticipants: 14,
    availableSpots: 8,
    images: ['https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800'],
    highlights: ['Золоте Кільце', 'Льодовикова лагуна'],
    included: ['Проживання', 'Транспорт', 'Гід'],
    notIncluded: ['Авіаквитки', 'Харчування'],
    featured: true,
    status: 'active'
  },
  {
    _id: 'tour_madeira',
    destination: {
      _id: 'dst_madeira',
      name: 'Madeira',
      nameUk: 'Мадейра',
      flag: '🇵🇹'
    },
    title: 'Мадейра: Острів Вічної Весни',
    shortDescription: 'Хайкінг та природа Мадейри',
    description: 'Відкрийте для себе красу Мадейри.',
    price: 1290,
    duration: '7 днів / 6 ночей',
    startDate: '2025-03-10T00:00:00.000Z',
    endDate: '2025-03-17T00:00:00.000Z',
    maxParticipants: 15,
    availableSpots: 12,
    images: ['https://images.unsplash.com/photo-1603623660476-ae82cd1c5293?w=800'],
    highlights: ['Левади', 'Cabo Girão'],
    included: ['Проживання', 'Трансфери', 'Гід'],
    notIncluded: ['Переліт', 'Їжа'],
    featured: true,
    status: 'active'
  },
  {
    _id: 'tour_switzerland',
    destination: {
      _id: 'dst_switzerland',
      name: 'Switzerland',
      nameUk: 'Швейцарія',
      flag: '🇨🇭'
    },
    title: 'Швейцарія: Альпійська Казка',
    shortDescription: 'Тур по найкрасивіших місцях Альп',
    description: 'Найкрасивіші місця Швейцарських Альп.',
    price: 2150,
    duration: '8 днів / 7 ночей',
    startDate: '2025-06-20T00:00:00.000Z',
    endDate: '2025-06-28T00:00:00.000Z',
    maxParticipants: 12,
    availableSpots: 9,
    images: ['https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800'],
    highlights: ['Юнгфрауйох', 'Маттерхорн'],
    included: ['Готелі', 'Трансфери', 'Гід'],
    notIncluded: ['Авіаквитки', 'Харчування'],
    featured: true,
    status: 'active'
  }
]
