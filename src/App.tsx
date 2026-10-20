import { useState, useEffect, useCallback } from 'react';
import { CardData } from './types';
import { saveCards, loadCards } from './utils';
import CardEditor from './components/CardEditor';
import CardGallery from './components/CardGallery';
import PrintView from './components/PrintView';
import ImportExport from './components/ImportExport';
import VersionInfo from './components/VersionInfo';

type View = 'gallery' | 'editor' | 'print';

function App() {
  const [view, setView] = useState<View>('gallery');
  const [cards, setCards] = useState<CardData[]>([]);
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [printCards, setPrintCards] = useState<CardData[]>([]);
  const [showImportExport, setShowImportExport] = useState(false);

  useEffect(() => {
    setCards(loadCards());
  }, []);

  useEffect(() => {
    if (cards.length > 0 || localStorage.getItem('card-game-cards')) {
      saveCards(cards);
    }
  }, [cards]);

  const handleNewCard = useCallback(() => {
    setEditingCard(null);
    setView('editor');
  }, []);

  const handleEditCard = useCallback((card: CardData) => {
    setEditingCard(card);
    setView('editor');
  }, []);

  const handleSaveCard = useCallback((card: CardData) => {
    setCards(prev => {
      const exists = prev.find(c => c.id === card.id);
      if (exists) {
        return prev.map(c => c.id === card.id ? card : c);
      }
      return [...prev, card];
    });
    setView('gallery');
    setEditingCard(null);
  }, []);

  const handleDeleteCard = useCallback((id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleDuplicateCard = useCallback((card: CardData) => {
    const duplicate: CardData = {
      ...card,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
      title: card.title ? `${card.title} (копия)` : 'Копия',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCards(prev => [...prev, duplicate]);
  }, []);

  const handlePrint = useCallback((cardsToPrint: CardData[]) => {
    setPrintCards(cardsToPrint);
    setView('print');
  }, []);

  const handleImport = useCallback((importedCards: CardData[]) => {
    setCards(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const newCards = importedCards.filter(c => !existingIds.has(c.id));
      return [...prev, ...newCards];
    });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setView('gallery');
    setEditingCard(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white relative">
      {view !== 'print' && (
        <header className="border-b border-white/5 bg-black/20 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🃏</span>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Card Bench
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Генератор карточек для настольных игр</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowImportExport(true)}
                className="px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-sm transition-colors"
                title="Импорт/Экспорт"
              >
                📦
              </button>
              <button
                onClick={handleNewCard}
                className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-sm font-medium transition-all"
              >
                <span className="hidden sm:inline">✨ Новая карточка</span>
                <span className="sm:hidden">+</span>
              </button>
            </div>
          </div>
        </header>
      )}

      <main>
        {view === 'gallery' && (
          <CardGallery
            cards={cards}
            onEdit={handleEditCard}
            onDelete={handleDeleteCard}
            onDuplicate={handleDuplicateCard}
            onPrint={handlePrint}
            onNew={handleNewCard}
          />
        )}

        {view === 'editor' && (
          <CardEditor
            editCard={editingCard}
            onSave={handleSaveCard}
            onCancel={handleCancelEdit}
          />
        )}

        {view === 'print' && (
          <PrintView
            cards={printCards}
            onBack={() => setView('gallery')}
          />
        )}
      </main>

      {showImportExport && (
        <ImportExport
          cards={cards}
          onImport={handleImport}
          onClose={() => setShowImportExport(false)}
        />
      )}

      <VersionInfo />
    </div>
  );
}

export default App;
