import { useState, useRef, useCallback } from 'react';
import { CardData, CardSettings, Attribute, DEFAULT_SETTINGS, FONT_OPTIONS, STANDARD_SIZES } from '../types';
import { generateId, fileToBase64 } from '../utils';
import CardPreview from './CardPreview';

interface Props {
  editCard?: CardData | null;
  onSave: (card: CardData) => void;
  onCancel: () => void;
}

export default function CardEditor({ editCard, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(editCard?.title ?? '');
  const [description, setDescription] = useState(editCard?.description ?? '');
  const [rules, setRules] = useState(editCard?.rules ?? '');
  const [attributes, setAttributes] = useState<Attribute[]>(
    editCard?.attributes ?? [{ label: '', value: '' }, { label: '', value: '' }]
  );
  const [image, setImage] = useState<string | null>(editCard?.image ?? null);
  const [settings, setSettings] = useState<CardSettings>(editCard?.settings ?? { ...DEFAULT_SETTINGS });
  const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setImage(base64);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const base64 = await fileToBase64(file);
      setImage(base64);
    }
  }, []);

  const updateSetting = <K extends keyof CardSettings>(key: K, value: CardSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateAttribute = (index: number, field: 'label' | 'value', val: string) => {
    setAttributes(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const addAttribute = () => {
    setAttributes(prev => [...prev, { label: '', value: '' }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const now = Date.now();
    const card: CardData = {
      id: editCard?.id ?? generateId(),
      title,
      description,
      attributes: attributes.filter(a => a.label || a.value),
      rules,
      image,
      settings,
      createdAt: editCard?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(card);
  };

  const previewCard: CardData = {
    id: 'preview',
    title,
    description,
    attributes: attributes.filter(a => a.label || a.value),
    rules,
    image,
    settings,
    createdAt: 0,
    updatedAt: 0,
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-7xl mx-auto">
      {/* Left: Editor */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onCancel}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
          >
            ← Назад
          </button>
          <h2 className="text-xl font-bold">
            {editCard ? 'Редактирование карточки' : 'Новая карточка'}
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'content' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            📝 Контент
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'style' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            🎨 Стиль
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {activeTab === 'content' ? (
            <>
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Изображение</label>
                <div
                  className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {image ? (
                    <div className="relative">
                      <img src={image} alt="" className="max-h-32 mx-auto rounded" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setImage(null); }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <p className="text-2xl mb-2">🖼️</p>
                      <p className="text-sm">Нажмите или перетащите изображение</p>
                      <p className="text-xs mt-1">PNG, JPG, WebP</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Название</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Название карточки..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Attributes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Атрибуты</label>
                <div className="space-y-2">
                  {attributes.map((attr, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={attr.label}
                        onChange={(e) => updateAttribute(i, 'label', e.target.value)}
                        placeholder="Название"
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={attr.value}
                        onChange={(e) => updateAttribute(i, 'value', e.target.value)}
                        placeholder="Значение"
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                      />
                      <button
                        onClick={() => removeAttribute(i)}
                        className="text-red-400 hover:text-red-300 text-lg px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addAttribute}
                  className="mt-2 text-sm text-purple-400 hover:text-purple-300"
                >
                  + Добавить атрибут
                </button>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Описание</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Описание карточки..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              {/* Rules */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Правила</label>
                <textarea
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  placeholder="Особые правила..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>
            </>
          ) : (
            <>
              {/* Standard Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Стандартные размеры</label>
                <div className="flex flex-wrap gap-2">
                  {STANDARD_SIZES.map((size, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (size.width > 0) {
                          updateSetting('width', size.width);
                          updateSetting('height', size.height);
                        }
                      }}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-purple-600/20 hover:border-purple-500/30 transition-colors"
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Ширина (мм)</label>
                  <input
                    type="number"
                    value={settings.width}
                    onChange={(e) => updateSetting('width', Number(e.target.value))}
                    min={20}
                    max={200}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Высота (мм)</label>
                  <input
                    type="number"
                    value={settings.height}
                    onChange={(e) => updateSetting('height', Number(e.target.value))}
                    min={20}
                    max={200}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Image Height */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Высота изображения: {settings.imageHeight}%</label>
                <input
                  type="range"
                  min={10}
                  max={80}
                  value={settings.imageHeight}
                  onChange={(e) => updateSetting('imageHeight', Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* Image Fit */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Масштабирование изображения</label>
                <select
                  value={settings.imageFit}
                  onChange={(e) => updateSetting('imageFit', e.target.value as 'cover' | 'contain')}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="cover">Заполнение (cover)</option>
                  <option value="contain">Вместить (contain)</option>
                </select>
              </div>

              {/* Border */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Толщина рамки (px)</label>
                  <input
                    type="number"
                    value={settings.borderWidth}
                    onChange={(e) => updateSetting('borderWidth', Number(e.target.value))}
                    min={0}
                    max={10}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Скругление (px)</label>
                  <input
                    type="number"
                    value={settings.borderRadius}
                    onChange={(e) => updateSetting('borderRadius', Number(e.target.value))}
                    min={0}
                    max={30}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Image Radius */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Скругление изображения (px)</label>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={settings.imageRadius}
                  onChange={(e) => updateSetting('imageRadius', Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* Padding */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Отступы (px): {settings.padding}</label>
                <input
                  type="range"
                  min={2}
                  max={24}
                  value={settings.padding}
                  onChange={(e) => updateSetting('padding', Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Фон карточки</label>
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                    className="w-full h-8 rounded cursor-pointer bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Цвет рамки</label>
                  <input
                    type="color"
                    value={settings.borderColor}
                    onChange={(e) => updateSetting('borderColor', e.target.value)}
                    className="w-full h-8 rounded cursor-pointer bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Цвет заголовка</label>
                  <input
                    type="color"
                    value={settings.titleColor}
                    onChange={(e) => updateSetting('titleColor', e.target.value)}
                    className="w-full h-8 rounded cursor-pointer bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Цвет текста</label>
                  <input
                    type="color"
                    value={settings.textColor}
                    onChange={(e) => updateSetting('textColor', e.target.value)}
                    className="w-full h-8 rounded cursor-pointer bg-transparent"
                  />
                </div>
              </div>

              {/* Font */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Шрифт</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => updateSetting('fontFamily', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Sizes */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Заголовок</label>
                  <input
                    type="number"
                    value={settings.titleSize}
                    onChange={(e) => updateSetting('titleSize', Number(e.target.value))}
                    min={8}
                    max={32}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Текст</label>
                  <input
                    type="number"
                    value={settings.textSize}
                    onChange={(e) => updateSetting('textSize', Number(e.target.value))}
                    min={6}
                    max={24}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Атрибуты</label>
                  <input
                    type="number"
                    value={settings.attrSize}
                    onChange={(e) => updateSetting('attrSize', Number(e.target.value))}
                    min={6}
                    max={20}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg font-medium transition-all"
          >
            💾 {editCard ? 'Сохранить изменения' : 'Создать карточку'}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="lg:w-80 flex-shrink-0">
        <div className="sticky top-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Предпросмотр</h3>
          <div className="flex justify-center bg-white/5 border border-white/10 rounded-xl p-6">
            <CardPreview card={previewCard} scale={1.5} />
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            {settings.width}×{settings.height} мм
          </p>
        </div>
      </div>
    </div>
  );
}
