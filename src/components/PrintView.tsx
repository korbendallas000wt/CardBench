import { CardData } from '../types';
import CardPreview from './CardPreview';

interface Props {
  cards: CardData[];
  onBack: () => void;
}

export default function PrintView({ cards, onBack }: Props) {
  const handlePrint = () => {
    window.print();
  };

  // Calculate how many cards fit on a page based on the first card's size
  // We'll use CSS grid for layout
  const cardWidth = cards[0]?.settings.width ?? 63;
  const cardHeight = cards[0]?.settings.height ?? 88;

  return (
    <div className="min-h-screen bg-white">
      {/* Screen-only controls */}
      <div className="print:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 flex items-center justify-between shadow-lg">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
        >
          ← Назад
        </button>
        <div className="text-sm text-gray-300">
          Карточек для печати: <span className="font-bold text-white">{cards.length}</span>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
        >
          🖨️ Печать
        </button>
      </div>

      {/* Print area */}
      <div className="pt-20 print:pt-0">
        <div
          className="print-card-grid mx-auto"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, ${cardWidth}mm)`,
            gap: '2mm',
            padding: '5mm',
            maxWidth: '210mm',
            margin: '0 auto',
          }}
        >
          {cards.map((card, index) => (
            <div
              key={`${card.id}-${index}`}
              className="print-card-item"
              style={{
                width: `${cardWidth}mm`,
                height: `${cardHeight}mm`,
                pageBreakInside: 'avoid',
              }}
            >
              <CardPreview card={card} scale={1} forPrint={true} />
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="print:hidden max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-3">📋 Инструкция по печати</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Нажмите кнопку «Печать» или Ctrl+P / Cmd+P</li>
            <li>• В настройках печати выберите размер бумаги (A4)</li>
            <li>• Установите поля: «Минимальные» или «Нет»</li>
            <li>• Отключите «Колонтитулы» если возможно</li>
            <li>• Масштаб: 100% (не «по размеру страницы»)</li>
            <li>• Для двусторонней печати — выберите соответствующую опцию</li>
            <li>• Рекомендуется плотная бумага 200-300 г/м²</li>
          </ul>
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-400">
              💡 Совет: размеры карточек заданы в мм и будут точно соответствовать при печати с масштабом 100%.
              После печати можно наклеить на картон нужной толщины для долговечности.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
