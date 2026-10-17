import { STRINGS } from './strings';
import type { Lang, StringKey } from './strings';
import type { OrderWords } from '../game/orders';

export type { Lang, StringKey };

export const DEFAULT_LANG: Lang = 'pt';

let current: Lang = DEFAULT_LANG;

export function setLang(lang: Lang): void {
  current = lang in STRINGS ? lang : DEFAULT_LANG;
}

export function getLang(): Lang {
  return current;
}

export function t(key: StringKey, lang: Lang = current): string {
  return (STRINGS[lang] ?? STRINGS[DEFAULT_LANG])[key] ?? STRINGS[DEFAULT_LANG][key];
}

export function tf(key: StringKey, vars: Record<string, string | number>): string {
  return t(key).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

export function orderWords(): OrderWords {
  return {
    names: {
      coffee: t('wordCoffee'),
      toast: t('wordToast'),
      juice: t('wordJuice'),
      pancakes: t('wordPancakes'),
      salad: t('wordSalad'),
    },
    extras: {
      coffee: t('wordWithSugar'),
      toast: t('wordWithButter'),
      juice: t('wordWithIce'),
      pancakes: t('wordWithHoney'),
      salad: t('wordWithDressing'),
    },
  };
}
