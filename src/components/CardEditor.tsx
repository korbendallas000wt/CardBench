import { useState, useRef, useCallback } from 'react';
import { CardData, CardSettings, Attribute, TextAttribute, ImageAttribute, DEFAULT_SETTINGS, FONT_OPTIONS, STANDARD_SIZES } from '../types';
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
  
  const defaultAttrs: Attribute[] = editCard?.attributes && editCard.attributes.length > 0 
    ? editCard.attributes 
    : [{ type: 'text', id: generateId(), content: 'Текст атрибута', x: 10, y: 80, fontSize: 12, color: '#ffffff', fontFamily: 'Arial, sans-serif', rotation: 0 }];
    
  const [attributes, setAttributes] = useState<Attribute[]>(defaultAttrs);
  const [image, setImage] = useState<string | null>(editCard?.image ?? null);
  const [settings, setSettings] = useState<CardSettings>(editCard?.settings ?? { ...DEFAULT_SETTINGS });
  const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showAiGen, setShowAiGen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

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

  const translatePrompt = async () => {
    if (!aiPrompt.trim()) return;
    if (!/[а-яА-ЯёЁ]/.test(aiPrompt)) {
      setGenerateError("Промпт уже на английском языке");
      setTimeout(() => setGenerateError(null), 2000);
      return;
    }
    
    setIsTranslating(true);
    setGenerateError(null);
    
    try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(aiPrompt)}&langpair=ru|en`);
      const data = await response.json();
      if (data.responseStatus === 200 && data.responseData.translatedText) {
        setAiPrompt(data.responseData.translatedText);
      } else {
        throw new Error("API вернул ошибку");
      }
    } catch (error) {
      console.warn("Не удалось перевести промпт:", error);
      setGenerateError("Не удалось перевести. Попробуйте вручную или отправьте как есть.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setGeneratedImage(null);
    setGenerateError(null);
    
    const enhancedPrompt = `${aiPrompt}, high quality, digital art, card game illustration, detailed, masterpiece`;
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const seed = Math.floor(Math.random() * 100000);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${seed}`;
    
    // Настраиваем таймаут на 60 секунд (60000 мс)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId); // Отменяем таймер, если ответ получен

      if (!response.ok) {
        switch (response.status) {
          case 400: throw new Error("Ошибка 400: Неверный запрос. Проверьте промпт.");
          case 401: throw new Error("Ошибка 401: Неавторизованный запрос. Сервис временно ограничил доступ.");
          case 402: throw new Error("Ошибка 402: Лимит исчерпан или запрос заблокирован. Попробуйте изменить промпт или отключить VPN.");
          case 403: throw new Error("Ошибка 403: Доступ запрещён. Проверьте работу на опубликованном сайте или отключите блокировщики.");
          case 429: throw new Error("Ошибка 429: Слишком много запросов. Подождите минуту и попробуйте снова.");
          case 500: throw new Error("Ошибка 500: Внутренняя ошибка сервера генерации. Попробуйте позже.");
          case 503: throw new Error("Ошибка 503: Сервис временно перегружен или недоступен. Попробуйте через минуту.");
          default: throw new Error(`Ошибка сети: Статус ${response.status}.`);
        }
      }
      
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) throw new Error(`Получен не файл изображения, а: ${blob.type}.`);

      const reader = new FileReader();
      reader.onloadend = () => {
        setGeneratedImage(reader.result as string);
        setIsGenerating(false);
      };
      reader.onerror = () => {
        setIsGenerating(false);
        setGenerateError("Ошибка при обработке данных изображения.");
      };
      reader.readAsDataURL(blob);
    } catch (error: any) {
      clearTimeout(timeoutId);
      setIsGenerating(false);
      if (error.name === 'AbortError') {
        setGenerateError("Превышено время ожидания (60 сек). Сервер перегружен, попробуйте позже.");
      } else {
        setGenerateError(error.message || "Неизвестная ошибка сети");
      }
    }
  };

  const handleUseGeneratedImage = () => {
    if (generatedImage) {
      setImage(generatedImage);
      setShowAiGen(false);
      setAiPrompt('');
      setGeneratedImage(null);
      setGenerateError(null);
    }
  };

  const updateSetting = <K extends keyof CardSettings>(key: K, value: CardSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const addTextAttribute = () => {
    setAttributes(prev => [...prev, {
      type: 'text', id: generateId(), content: 'Новый текст', x: 10, y: 10, fontSize: 14, color: '#ffffff', fontFamily: 'Arial, sans-serif', rotation: 0
    }]);
  };

  const addImageAttribute = () => {
    setAttributes(prev => [...prev, {
      type: 'image', id: generateId(), imageUrl: '', x: 10, y: 10, width: 30, height: 30, borderRadius: 0, rotation: 0
    }]);
  };

  const updateAttribute = (id: string, field: string, value: any) => {
    setAttributes(prev => prev.map(attr => attr.id === id ? { ...attr, [field]: value } : attr));
  };

  const removeAttribute = (id: string) => {
    setAttributes(prev => prev.filter(attr => attr.id !== id));
  };

  const moveAttribute = (index: number, direction: 'up' | 'down') => {
    setAttributes(prev => {
      const next = [...prev];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= next.length) return prev;
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next;
    });
  };

  const handleAttrImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      updateAttribute(id, 'imageUrl', base64);
    }
  };

  const handleSave = () => {
    const now = Date.now();
    const card: CardData = {
      id: editCard?.id ?? generateId(),
      title, description, attributes, rules, image, settings,
      createdAt: editCard?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(card);
  };

  const previewCard: CardData = {
    id: 'preview', title, description, attributes, rules, image, settings,
    createdAt: 0, updatedAt: 0,
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-7xl mx-auto">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onCancel} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">← Назад</button>
          <h2 className="text-xl font-bold">{editCard ? 'Редактирование карточки' : 'Новая карточка'}</h2>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setActiveTab('content')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'content' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>📝 Контент</button>
          <button onClick={() => setActiveTab('style')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'style' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>🎨 Стиль</button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {activeTab === 'content' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Фон / Основное изображение</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500/50 transition-colors" onClick={() => fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                  {image ? (
                    <div className="relative">
                      <img src={image} alt="" className="max-h-32 mx-auto rounded" />
                      <button onClick={(e) => { e.stopPropagation(); setImage(null); }} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-600">✕</button>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <p className="text-2xl mb-2">🖼</p>
                      <p className="text-sm">Нажмите или перетащите изображение</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                
                <button onClick={() => setShowAiGen(!showAiGen)} className="mt-3 text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                  🎲 {showAiGen ? 'Скрыть ИИ-генератор' : 'Сгенерировать изображение (ИИ)'}
                </button>

                {showAiGen && (
                  <div className="mt-3 p-4 bg-black/20 border border-purple-500/20 rounded-lg space-y-3">
                    <textarea 
                      value={aiPrompt} 
                      onChange={(e) => setAiPrompt(e.target.value)} 
                      placeholder="Например: космический корабль, туманность" 
                      rows={2} 
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none" 
                    />
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2 flex-1">
                        {['космический корабль', 'фэнтези лес', 'магический кристалл', 'средневековый меч', 'древний свиток'].map(tag => (
                          <button key={tag} onClick={() => setAiPrompt(tag)} className="text-xs px-2 py-1 bg-white/5 hover:bg-purple-600/30 border border-white/10 rounded transition-colors">{tag}</button>
                        ))}
                      </div>
                      <button 
                        onClick={translatePrompt} 
                        disabled={isTranslating || !aiPrompt.trim()}
                        className="px-3 py-1 bg-green-600/30 hover:bg-green-600/50 border border-green-500/30 disabled:opacity-30 disabled:cursor-not-allowed rounded text-xs text-green-300 transition-colors whitespace-nowrap"
                        title="Перевести промпт на английский"
                      >
                        {isTranslating ? '⏳' : '→ EN'}
                      </button>
                    </div>
                    
                    <button onClick={handleAiGenerate} disabled={isGenerating || !aiPrompt.trim()} className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                      {isGenerating ? '⏳ Генерация...' : '✨ Сгенерировать'}
                    </button>
                    
                    {generateError && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-sm text-red-200">⚠️ {generateError}</div>}
                    
                    {generatedImage && (
                      <div className="space-y-3 pt-2 border-t border-white/10">
                        <img src={generatedImage} alt="Generated" className="w-full max-h-48 object-contain rounded-lg border border-white/10 bg-black/40" />
                        <div className="flex gap-2">
                          <button onClick={handleUseGeneratedImage} className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium">✅ Использовать</button>
                          <button onClick={() => { setGeneratedImage(null); setAiPrompt(''); setGenerateError(null); }} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm">Отмена</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Название</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название карточки..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">Элементы на карточке (Слои)</label>
                  <div className="flex gap-2">
                    <button onClick={addTextAttribute} className="text-xs px-2 py-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 rounded text-blue-300 transition-colors">+ Текст</button>
                    <button onClick={addImageAttribute} className="text-xs px-2 py-1 bg-green-600/30 hover:bg-green-600/50 border border-green-500/30 rounded text-green-300 transition-colors">+ Картинка</button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {attributes.map((attr, index) => (
                    <div key={attr.id} className="p-3 bg-black/20 border border-white/10 rounded-lg space-y-3 relative group">
                      <div className="absolute top-2 right-2 flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => moveAttribute(index, 'up')} disabled={index === 0} className="text-blue-400 hover:text-blue-300 disabled:opacity-30 disabled:cursor-not-allowed text-lg" title="Переместить выше">⬆️</button>
                        <button onClick={() => moveAttribute(index, 'down')} disabled={index === attributes.length - 1} className="text-blue-400 hover:text-blue-300 disabled:opacity-30 disabled:cursor-not-allowed text-lg" title="Переместить ниже">⬇️</button>
                        <button onClick={() => removeAttribute(attr.id)} className="text-red-400 hover:text-red-300 text-lg" title="Удалить слой">✕</button>
                      </div>
                      
                      {attr.type === 'text' ? (
                        <>
                          <div className="flex items-center gap-2 mb-2"><span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Текстовый слой #{index + 1}</span></div>
                          <textarea value={attr.content} onChange={(e) => updateAttribute(attr.id, 'content', e.target.value)} placeholder="Текст..." rows={2} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none resize-none" />
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-xs text-gray-400 mb-1">Позиция X (%): {attr.x}</label><input type="range" min={0} max={100} value={attr.x} onChange={(e) => updateAttribute(attr.id, 'x', Number(e.target.value))} className="w-full accent-blue-500" /></div>
                            <div><label className="block text-xs text-gray-400 mb-1">Позиция Y (%): {attr.y}</label><input type="range" min={0} max={100} value={attr.y} onChange={(e) => updateAttribute(attr.id, 'y', Number(e.target.value))} className="w-full accent-blue-500" /></div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div><label className="block text-xs text-gray-400 mb-1">Размер (px)</label><input type="number" value={attr.fontSize} onChange={(e) => updateAttribute(attr.id, 'fontSize', Number(e.target.value))} min={6} max={48} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:border-purple-500 focus:outline-none" /></div>
                            <div><label className="block text-xs text-gray-400 mb-1">Поворот (°)</label><input type="number" value={attr.rotation} onChange={(e) => updateAttribute(attr.id, 'rotation', Number(e.target.value))} min={-180} max={180} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:border-purple-500 focus:outline-none" /></div>
                            <div><label className="block text-xs text-gray-400 mb-1">Цвет</label><input type="color" value={attr.color} onChange={(e) => updateAttribute(attr.id, 'color', e.target.value)} className="w-full h-8 rounded cursor-pointer bg-transparent" /></div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Шрифт</label>
                            <select value={attr.fontFamily} onChange={(e) => updateAttribute(attr.id, 'fontFamily', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none">
                              {FONT_OPTIONS.map((f) => (<option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>))}
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-2"><span className="text-xs font-bold text-green-400 uppercase tracking-wider">Графический слой #{index + 1}</span></div>
                          <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center cursor-pointer hover:border-green-500/50 transition-colors relative">
                            {attr.imageUrl ? (
                              <div className="relative">
                                <img src={attr.imageUrl} alt="" className="max-h-24 mx-auto rounded" />
                                <button onClick={(e) => { e.stopPropagation(); updateAttribute(attr.id, 'imageUrl', ''); }} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600">✕</button>
                              </div>
                            ) : (<p className="text-xs text-gray-500">Нажмите для загрузки изображения</p>)}
                            <input type="file" accept="image/*" onChange={(e) => handleAttrImageUpload(attr.id, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-xs text-gray-400 mb-1">Позиция X (%): {attr.x}</label><input type="range" min={0} max={100} value={attr.x} onChange={(e) => updateAttribute(attr.id, 'x', Number(e.target.value))} className="w-full accent-green-500" /></div>
                            <div><label className="block text-xs text-gray-400 mb-1">Позиция Y (%): {attr.y}</label><input type="range" min={0} max={100} value={attr.y} onChange={(e) => updateAttribute(attr.id, 'y', Number(e.target.value))} className="w-full accent-green-500" /></div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-xs text-gray-400 mb-1">Ширина (%): {attr.width}</label><input type="range" min={5} max={100} value={attr.width} onChange={(e) => updateAttribute(attr.id, 'width', Number(e.target.value))} className="w-full accent-green-500" /></div>
                            <div><label className="block text-xs text-gray-400 mb-1">Высота (%): {attr.height}</label><input type="range" min={5} max={100} value={attr.height} onChange={(e) => updateAttribute(attr.id, 'height', Number(e.target.value))} className="w-full accent-green-500" /></div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-xs text-gray-400 mb-1">Поворот (°)</label><input type="number" value={attr.rotation} onChange={(e) => updateAttribute(attr.id, 'rotation', Number(e.target.value))} min={-180} max={180} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:border-purple-500 focus:outline-none" /></div>
                            <div><label className="block text-xs text-gray-400 mb-1">Скругление (px)</label><input type="number" value={attr.borderRadius} onChange={(e) => updateAttribute(attr.id, 'borderRadius', Number(e.target.value))} min={0} max={50} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:border-purple-500 focus:outline-none" /></div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Описание</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание карточки..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Правила</label>
                <textarea value={rules} onChange={(e) => setRules(e.target.value)} placeholder="Особые правила..." rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Стандартные размеры</label>
                <div className="flex flex-wrap gap-2">
                  {STANDARD_SIZES.map((size, i) => (
                    <button key={i} onClick={() => { if (size.width > 0) { updateSetting('width', size.width); updateSetting('height', size.height); } }} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-purple-600/20 hover:border-purple-500/30 transition-colors">{size.label}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-400 mb-1">Ширина (мм)</label><input type="number" value={settings.width} onChange={(e) => updateSetting('width', Number(e.target.value))} min={20} max={200} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">Высота (мм)</label><input type="number" value={settings.height} onChange={(e) => updateSetting('height', Number(e.target.value))} min={20} max={200} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none" /></div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Высота основного изображения: {settings.imageHeight}%</label>
                <input type="range" min={10} max={80} value={settings.imageHeight} onChange={(e) => updateSetting('imageHeight', Number(e.target.value))} className="w-full accent-purple-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Масштабирование основного изображения</label>
                <select value={settings.imageFit} onChange={(e) => updateSetting('imageFit', e.target.value as 'cover' | 'contain')} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none">
                  <option value="cover">Заполнение (cover)</option>
                  <option value="contain">Вместить (contain)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-400 mb-1">Толщина рамки (px)</label><input type="number" value={settings.borderWidth} onChange={(e) => updateSetting('borderWidth', Number(e.target.value))} min={0} max={10} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">Скругление карточки (px)</label><input type="number" value={settings.borderRadius} onChange={(e) => updateSetting('borderRadius', Number(e.target.value))} min={0} max={30} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none" /></div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Скругление основного изображения (px)</label>
                <input type="range" min={0} max={20} value={settings.imageRadius} onChange={(e) => updateSetting('imageRadius', Number(e.target.value))} className="w-full accent-purple-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Отступы (px): {settings.padding}</label>
                <input type="range" min={2} max={24} value={settings.padding} onChange={(e) => updateSetting('padding', Number(e.target.value))} className="w-full accent-purple-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-400 mb-1">Фон карточки</label><input type="color" value={settings.backgroundColor} onChange={(e) => updateSetting('backgroundColor', e.target.value)} className="w-full h-8 rounded cursor-pointer bg-transparent" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">Цвет рамки</label><input type="color" value={settings.borderColor} onChange={(e) => updateSetting('borderColor', e.target.value)} className="w-full h-8 rounded cursor-pointer bg-transparent" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">Цвет заголовка</label><input type="color" value={settings.titleColor} onChange={(e) => updateSetting('titleColor', e.target.value)} className="w-full h-8 rounded cursor-pointer bg-transparent" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">Цвет текста по умолчанию</label><input type="color" value={settings.textColor} onChange={(e) => updateSetting('textColor', e.target.value)} className="w-full h-8 rounded cursor-pointer bg-transparent" /></div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Шрифт по умолчанию</label>
                <select value={settings.fontFamily} onChange={(e) => updateSetting('fontFamily', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none">
                  {FONT_OPTIONS.map((f) => (<option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs text-gray-400 mb-1">Заголовок (px)</label><input type="number" value={settings.titleSize} onChange={(e) => updateSetting('titleSize', Number(e.target.value))} min={8} max={32} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">Текст (px)</label><input type="number" value={settings.textSize} onChange={(e) => updateSetting('textSize', Number(e.target.value))} min={6} max={24} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">Атрибуты (px)</label><input type="number" value={settings.attrSize} onChange={(e) => updateSetting('attrSize', Number(e.target.value))} min={6} max={20} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none" /></div>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <button onClick={handleSave} className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg font-medium transition-all">💾 {editCard ? 'Сохранить изменения' : 'Создать карточку'}</button>
          <button onClick={onCancel} className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-colors">Отмена</button>
        </div>
      </div>

      <div className="lg:w-80 flex-shrink-0">
        <div className="sticky top-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Предпросмотр</h3>
          <div className="flex justify-center bg-white/5 border border-white/10 rounded-xl p-6">
            <CardPreview card={previewCard} scale={1.5} />
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">{settings.width}×{settings.height} мм</p>
        </div>
      </div>
    </div>
  );
}
