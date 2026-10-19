import { CardData } from './types';

const STORAGE_KEY = 'card-game-cards';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function saveCards(cards: CardData[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch (e) {
    console.error('Failed to save cards:', e);
  }
}

export function loadCards(): CardData[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load cards:', e);
    return [];
  }
}

export function exportCardsJSON(cards: CardData[]): string {
  return JSON.stringify(cards, null, 2);
}

export function importCardsJSON(json: string): CardData[] | null {
  try {
    const data = JSON.parse(json);
    if (Array.isArray(data)) return data;
    return null;
  } catch {
    return null;
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function mmToPx(mm: number, dpi: number = 96): number {
  return (mm / 25.4) * dpi;
}
