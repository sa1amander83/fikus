// Генератор имён для сортов гибискусов

const ADJECTIVES = [
  "Алая", "Алый", "Амурная", "Багровая", "Бархатная", "Бирюзовая",
  "Волшебная", "Вишнёвая", "Голубая", "Гранатовая", "Дивная",
  "Жемчужная", "Закатная", "Зарница", "Золотая", "Коралловая",
  "Кремовая", "Лазурная", "Лиловая", "Лунная", "Малиновая",
  "Мерцающая", "Нежная", "Огненная", "Персиковая", "Пурпурная",
  "Рубиновая", "Розовая", "Серебряная", "Сиреневая", "Снежная",
  "Тёмная", "Туманная", "Фиолетовая", "Шёлковая", "Янтарная",
  "Яркая",
];

const NOUNS_NATURE = [
  "Аврора", "Акация", "Астра", "Берёзка", "Бриз", "Ветерок",
  "Волна", "Гроза", "Горизонт", "Дымка", "Заря", "Звезда",
  "Ива", "Иней", "Комета", "Лагуна", "Луна", "Метель",
  "Мечта", "Мимоза", "Нимфа", "Облако", "Радуга", "Рассвет",
  "Река", "Роса", "Сирень", "Соната", "Туман", "Феерия",
  "Фея", "Черешня", "Шторм", "Этюд",
];

const FEMALE_NAMES = [
  "Агата", "Аделина", "Аксинья", "Александра", "Алина", "Альбина",
  "Анастасия", "Ангелина", "Анна", "Антонина", "Ариадна",
  "Афродита", "Валентина", "Валерия", "Василиса", "Вера",
  "Виктория", "Галина", "Дарья", "Диана", "Екатерина",
  "Елена", "Жанна", "Зинаида", "Зоя", "Инга", "Ирина",
  "Карина", "Кристина", "Ксения", "Лариса", "Лидия", "Лилия",
  "Людмила", "Любовь", "Маргарита", "Марина", "Мария",
  "Надежда", "Наталья", "Нина", "Оксана", "Ольга", "Полина",
  "Светлана", "София", "Тамара", "Татьяна", "Юлия",
];

const EPITHETS_LAT = [
  "Bella", "Bianca", "Blaze", "Candy", "Carmen", "Celeste",
  "Cherry", "Coral", "Crimson", "Crystal", "Desire", "Dream",
  "Eden", "Ember", "Fantasy", "Flame", "Flora", "Galaxy",
  "Glory", "Grace", "Halo", "Iris", "Ivory", "Jewel",
  "Luna", "Luxe", "Magenta", "Marvel", "Mystic", "Nova",
  "Opal", "Pearl", "Prism", "Queen", "Ruby", "Scarlet",
  "Silk", "Soleil", "Star", "Sunset", "Velvet", "Venus",
  "Viola", "Vision",
];

const PLACE_NAMES = [
  "Аляска", "Алтай", "Амур", "Байкал", "Дальний Восток",
  "Кавказ", "Камчатка", "Карелия", "Крым", "Ладога",
  "Ленинград", "Москва", "Нева", "Сибирь", "Сочи",
  "Таймыр", "Урал", "Байкал", "Волга",
];

type Strategy =
  | "adj_noun"
  | "female_name"
  | "latin"
  | "adj_name"
  | "place"
  | "noun_only";

const STRATEGIES: Strategy[] = [
  "adj_noun",
  "female_name",
  "latin",
  "adj_name",
  "place",
  "noun_only",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generate(): string {
  const strategy = pick(STRATEGIES);
  switch (strategy) {
    case "adj_noun":
      return `${pick(ADJECTIVES)} ${pick(NOUNS_NATURE)}`;
    case "female_name":
      return pick(FEMALE_NAMES);
    case "latin":
      return pick(EPITHETS_LAT);
    case "adj_name":
      return `${pick(ADJECTIVES)} ${pick(FEMALE_NAMES)}`;
    case "place":
      return pick(PLACE_NAMES);
    case "noun_only":
      return pick(NOUNS_NATURE);
  }
}

export function generateNames(count = 8): string[] {
  const results = new Set<string>();
  let attempts = 0;
  while (results.size < count && attempts < 200) {
    results.add(generate());
    attempts++;
  }
  return Array.from(results);
}
