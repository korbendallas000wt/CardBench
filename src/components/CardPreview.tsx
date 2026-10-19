import { CardData } from '../types';
import { mmToPx } from '../utils';

interface Props {
  card: CardData;
  scale?: number;
  forPrint?: boolean;
}

export default function CardPreview({ card, scale = 1, forPrint = false }: Props) {
  const { settings } = card;
  const widthPx = mmToPx(settings.width) * scale;
  const heightPx = mmToPx(settings.height) * scale;

  const scaled = (val: number) => val * scale;

  return (
    <div
      className="card-preview relative overflow-hidden flex flex-col"
      style={{
        width: `${widthPx}px`,
        height: `${heightPx}px`,
        borderRadius: `${scaled(settings.borderRadius)}px`,
        border: `${scaled(settings.borderWidth)}px solid ${settings.borderColor}`,
        backgroundColor: settings.backgroundColor,
        fontFamily: settings.fontFamily,
        boxSizing: 'border-box',
      }}
    >
      {/* Image Section */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{
          height: `${(settings.imageHeight / 100) * heightPx}px`,
          margin: `${scaled(settings.padding)}px`,
          marginBottom: 0,
          borderRadius: `${scaled(settings.imageRadius)}px`,
        }}
      >
        {card.image ? (
          <img
            src={card.image}
            alt={card.title}
            className="w-full h-full"
            style={{ objectFit: settings.imageFit }}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: scaled(32), height: scaled(32) }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Text Section */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{
          padding: `${scaled(settings.padding)}px`,
        }}
      >
        {/* Title */}
        {card.title && (
          <h3
            className="font-bold leading-tight mb-1 truncate"
            style={{
              fontSize: `${scaled(settings.titleSize)}px`,
              color: settings.titleColor,
            }}
          >
            {card.title}
          </h3>
        )}

        {/* Attributes */}
        {card.attributes.length > 0 && card.attributes.some(a => a.label || a.value) && (
          <div className="mb-1 flex flex-wrap gap-x-2 gap-y-0.5">
            {card.attributes.filter((a: { label: string; value: string }) => a.label || a.value).map((attr: { label: string; value: string }, i: number) => (
              <span
                key={i}
                className="inline-flex items-center gap-0.5"
                style={{ fontSize: `${scaled(settings.attrSize)}px` }}
              >
                {attr.label && (
                  <span className="font-semibold" style={{ color: settings.titleColor }}>
                    {attr.label}:
                  </span>
                )}
                {attr.value && (
                  <span style={{ color: settings.textColor }}>{attr.value}</span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {card.description && (
          <p
            className="leading-snug overflow-hidden flex-1"
            style={{
              fontSize: `${scaled(settings.textSize)}px`,
              color: settings.textColor,
              display: '-webkit-box',
              WebkitLineClamp: forPrint ? 'unset' : 4,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {card.description}
          </p>
        )}

        {/* Rules */}
        {card.rules && (
          <div
            className="mt-auto border-t pt-1"
            style={{
              borderColor: settings.borderColor + '33',
              fontSize: `${scaled(settings.attrSize)}px`,
              color: settings.textColor,
            }}
          >
            <span className="font-semibold italic">Правила: </span>
            {card.rules}
          </div>
        )}
      </div>
    </div>
  );
}
