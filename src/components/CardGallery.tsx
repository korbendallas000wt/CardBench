import { useState } from 'react';
import { CardData } from '../types';
import CardPreview from './CardPreview';

interface Props {
  cards: CardData[];
  onEdit: (card: CardData) => void;
  onDelete: (id: string) => void;
  onDuplicate: (card: CardData) => void;
  onPrint: (cards: CardData[]) => void;
  onNew: () => void;
}

export default function CardGallery({ cards, onEdit, onDelete, onDuplicate, onPrint, onNew }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === cards.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cards.map(c => c.id)));
    }
  };

  const printSelected = () => {
    const toPrint = selectedIds.size > 0
      ? cards.filter(c => selectedIds.has(c.id))
      : cards;
    onPrint(toPrint);
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  if (cards.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🃏</div>
        <h2 className="text-2xl font-bold mb-2">Пока нет карточек</h2>
        <p className="text-gray-400 mb-6">Создайте свою первую карточку для настольной игры!</p>
        <button
          onClick={onNew}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg font-medium transition-all"
        >
          ✨ Создать карточку
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">
            Мои карточки <span className="text-gray-500 text-base">({cards.length})</span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={selectAll}
            className="px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-sm transition-colors"
          >
            {selectedIds.size === cards.length ? '☐ Снять всё' : '☑ Выбрать всё'}
          </button>
          <button
            onClick={printSelected}
            className="px-3 py-2 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 rounded-lg text-sm text-emerald-400 transition-colors"
          >
            🖨️ Печать {selectedIds.size > 0 ? `(${selectedIds.size})` : '(все)'}
          </button>
          <button
            onClick={onNew}
            className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-sm font-medium transition-all"
          >
            + Новая
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`relative group bg-white/5 border rounded-xl p-3 transition-all hover:bg-white/10 ${
              selectedIds.has(card.id) ? 'border-purple-500 ring-1 ring-purple-500/50' : 'border-white/10'
            }`}
          >
            {/* Selection checkbox */}
            <div
              className="absolute top-2 left-2 z-10 cursor-pointer"
              onClick={() => toggleSelect(card.id)}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                selectedIds.has(card.id)
                  ? 'bg-purple-600 border-purple-500'
                  : 'border-white/30 bg-black/30 backdrop-blur-sm'
              }`}>
                {selectedIds.has(card.id) && <span className="text-xs text-white">✓</span>}
              </div>
            </div>

            {/* Card Preview */}
            <div className="flex justify-center mb-3 mt-2">
              <CardPreview card={card} scale={0.8} />
            </div>

            {/* Card Info */}
            <div className="text-center">
              <p className="text-sm font-medium truncate">{card.title || 'Без названия'}</p>
              <p className="text-xs text-gray-500 mt-1">
                {card.settings.width}×{card.settings.height} мм
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(card)}
                className="flex-1 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded text-xs text-blue-400 transition-colors"
              >
                ✏️
              </button>
              <button
                onClick={() => onDuplicate(card)}
                className="py-1.5 px-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded text-xs text-purple-400 transition-colors"
                title="Дублировать"
              >
                📋
              </button>
              <button
                onClick={() => onPrint([card])}
                className="py-1.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded text-xs text-emerald-400 transition-colors"
                title="Печать"
              >
                🖨️
              </button>
              <button
                onClick={() => handleDelete(card.id)}
                className={`py-1.5 px-2 border rounded text-xs transition-colors ${
                  confirmDelete === card.id
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-red-600/20 hover:bg-red-600/30 border-red-500/30 text-red-400'
                }`}
                title={confirmDelete === card.id ? 'Подтвердить удаление' : 'Удалить'}
              >
                {confirmDelete === card.id ? '✓?' : '🗑️'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
