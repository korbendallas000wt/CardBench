import { useState } from 'react';
import { changelog } from '../changelog';

const typeLabels = {
  added: '✨ Добавлено',
  changed: '🔄 Изменено',
  fixed: '🐛 Исправлено',
  removed: '🗑️ Удалено',
};

const typeColors = {
  added: 'text-green-400',
  changed: 'text-blue-400',
  fixed: 'text-yellow-400',
  removed: 'text-red-400',
};

export default function VersionInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const currentVersion = changelog[0]?.version || '1.0.0';

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gray-800/80 backdrop-blur-sm text-gray-300 px-3 py-1.5 rounded-lg shadow-lg hover:bg-gray-700 hover:text-white transition-colors text-xs border border-white/10"
        >
          v{currentVersion} • История версий
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div 
            className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">История версий</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-2xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar">
              {changelog.map((version, idx) => (
                <div key={idx} className="mb-6 last:mb-0">
                  <div className="flex items-baseline gap-3 mb-3">
                    <h3 className="text-lg font-bold text-purple-400">
                      v{version.version}
                    </h3>
                    <span className="text-sm text-gray-500">{version.date}</span>
                  </div>
                  <ul className="space-y-2">
                    {version.changes.map((change, changeIdx) => (
                      <li key={changeIdx} className="flex gap-2 text-sm">
                        <span className={`font-semibold whitespace-nowrap ${typeColors[change.type]}`}>
                          {typeLabels[change.type]}:
                        </span>
                        <span className="text-gray-300">{change.description}</span>
                      </li>
                    ))}
                  </ul>
                  {idx < changelog.length - 1 && (
                    <hr className="mt-6 border-white/10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
