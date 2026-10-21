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
    version: '1.2.3',
    date: '2026-10-20',
    changes: [
      { type: 'fixed', description: 'Добавлен таймаут 60 секунд для генерации ИИ (предотвращение зависаний)' },
      { type: 'fixed', description: 'Добавлена обработка ошибки 503 (Service Unavailable)' },
      { type: 'changed', description: 'Уточнено сообщение об ошибке 402 с подсказкой изменить промпт' },
    ],
  },
  {
    version: '1.2.2',
    date: '2026-10-20',
    changes: [
      { type: 'changed', description: 'Убрана дублирующая кнопка "Новая" из тулбара галереи' },
      { type: 'added', description: 'Добавлена кнопка массового удаления выбранных карточек' },
    ],
  },
  {
    version: '1.2.1',
    date: '2026-10-20',
    changes: [
      { type: 'fixed', description: 'Улучшена обработка ошибок ИИ-генерации (добавлены конкретные сообщения для статусов 400, 401, 402, 403, 429, 500)' },
    ],
  },
  {
    version: '1.2.0',
    date: '2026-10-20',
    changes: [
      { type: 'added', description: 'Система атрибутов-слоёв с точным позиционированием (текст и изображения)' },
      { type: 'added', description: 'Ползунки для управления позицией X/Y, размером, поворотом и скруглением элементов' },
      { type: 'added', description: 'Поддержка наложения элементов друг на друга в любом порядке' },
    ],
  },
  {
    version: '1.1.1',
    date: '2026-10-20',
    changes: [
      { type: 'changed', description: 'Переименование приложения из Card Forge в Card Bench для соответствия названию проекта' },
    ],
  },
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
      { type: 'added', description: 'Начальная версия приложения Card Bench' },
      { type: 'added', description: 'Редактор, галерея и превью карточек' },
      { type: 'added', description: 'Импорт/экспорт данных и режим печати' },
      { type: 'added', description: 'Автоматический деплой на GitHub Pages' },
    ],
  },
];
