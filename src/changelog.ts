export interface Change {
  type: 'added' | 'changed' | 'fixed' | 'removed';
  description: string;
}

export interface Version {
  version: string;
  date: string;
  changes: Change[];
}

export const changelog: Version[] = [
  {
    version: '1.1.0',
    date: '2026-10-20',
    changes: [
      { type: 'added', description: 'Интеграция ИИ-генерации изображений через Pollinations.ai' },
      { type: 'added', description: 'Панель генерации с быстрыми тегами в редакторе карточек' },
      { type: 'added', description: 'Автоматическая конвертация сгенерированного изображения в base64 для автономности карточки' },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-10-19',
    changes: [
      { type: 'added', description: 'Начальная версия приложения Card Forge' },
      { type: 'added', description: 'Редактор, галерея и превью карточек' },
      { type: 'added', description: 'Импорт/экспорт данных и режим печати' },
      { type: 'added', description: 'Автоматический деплой на GitHub Pages' },
    ],
  },
];
