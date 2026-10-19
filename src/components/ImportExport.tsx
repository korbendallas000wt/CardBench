import { useRef } from 'react';
import { CardData } from '../types';
import { exportCardsJSON, importCardsJSON } from '../utils';

interface Props {
  cards: CardData[];
  onImport: (cards: CardData[]) => void;
  onClose: () => void;
}

export default function ImportExport({ cards, onImport, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportCardsJSON(cards);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-cards-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importCardsJSON(reader.result as string);
      if (result) {
        onImport(result);
        onClose();
      } else {
        alert('Ошибка: неверный формат файла');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4">📦 Импорт / Экспорт</h3>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h4 className="font-medium mb-2">Экспорт</h4>
            <p className="text-sm text-gray-400 mb-3">
              Сохранить все {cards.length} карточек в файл JSON для переноса между устройствами.
            </p>
            <button
              onClick={handleExport}
              disabled={cards.length === 0}
              className="w-full py-2 bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 rounded-lg text-sm text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📥 Скачать JSON ({cards.length} карточек)
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h4 className="font-medium mb-2">Импорт</h4>
            <p className="text-sm text-gray-400 mb-3">
              Загрузить карточки из ранее сохранённого JSON-файла. Карточки будут добавлены к существующим.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 rounded-lg text-sm text-emerald-400 transition-colors"
            >
              📤 Загрузить JSON файл
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-sm transition-colors"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
