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
    version: '1.0.0',
    date: '2026-10-20',
    changes: [
      { type: 'added', description: 'Начальная версия приложения Card Forge' },
      { type: 'added', description: 'Редактор, галерея и превью карточек' },
      { type: 'added', description: 'Импорт/экспорт данных и режим печати' },
      { type: 'added', description: 'Автоматический деплой на GitHub Pages' },
    ],
  },
];
