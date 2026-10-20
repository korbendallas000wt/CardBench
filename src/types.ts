export interface CardSettings {
  width: number;        // mm
  height: number;       // mm
  imageHeight: number;  // % of card height
  borderRadius: number; // px
  borderWidth: number;  // px
  borderColor: string;
  backgroundColor: string;
  titleColor: string;
  textColor: string;
  fontFamily: string;
  titleSize: number;    // px
  textSize: number;     // px
  attrSize: number;     // px
  padding: number;      // px
  imageFit: 'cover' | 'contain';
  imageRadius: number;  // px
}

export interface TextAttribute {
  type: 'text';
  id: string;
  content: string;
  x: number; // % от ширины карточки
  y: number; // % от высоты карточки
  fontSize: number; // px
  color: string;
  fontFamily: string;
  rotation: number; // градусы
}

export interface ImageAttribute {
  type: 'image';
  id: string;
  imageUrl: string; // base64 data URL
  x: number; // % от ширины карточки
  y: number; // % от высоты карточки
  width: number; // % от ширины карточки
  height: number; // % от высоты карточки
  borderRadius: number; // px
  rotation: number; // градусы
}

export type Attribute = TextAttribute | ImageAttribute;

export interface CardData {
  id: string;
  title: string;
  description: string;
  attributes: Attribute[];
  rules: string;
  image: string | null; // base64 data URL (основное изображение карточки)
  settings: CardSettings;
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_SETTINGS: CardSettings = {
  width: 63,
  height: 88,
  imageHeight: 50,
  borderRadius: 8,
  borderWidth: 2,
  borderColor: '#1a1a2e',
  backgroundColor: '#fefefe',
  titleColor: '#1a1a2e',
  textColor: '#333333',
  fontFamily: 'Georgia, serif',
  titleSize: 16,
  textSize: 11,
  attrSize: 10,
  padding: 10,
  imageFit: 'cover',
  imageRadius: 4,
};

export const FONT_OPTIONS = [
  { label: 'Georgia (Serif)', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Arial (Sans)', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Courier (Mono)', value: '"Courier New", monospace' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { label: 'Palatino', value: '"Palatino Linotype", "Book Antiqua", Palatino, serif' },
  { label: 'Impact', value: 'Impact, sans-serif' },
  { label: 'Comic Sans', value: '"Comic Sans MS", cursive' },
];

export const STANDARD_SIZES = [
  { label: 'Стандартная (63×88 мм)', width: 63, height: 88 },
  { label: 'Мини (41×63 мм)', width: 41, height: 63 },
  { label: 'Бридж (57×88 мм)', width: 57, height: 88 },
  { label: 'Таро (70×120 мм)', width: 70, height: 120 },
  { label: 'Покер (63×88 мм)', width: 63, height: 88 },
  { label: 'Квадрат (63×63 мм)', width: 63, height: 63 },
  { label: 'Широкая (88×63 мм)', width: 88, height: 63 },
  { label: 'Пользовательская', width: 0, height: 0 },
];
