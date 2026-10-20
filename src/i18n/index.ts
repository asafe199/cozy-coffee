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

// review.ts comment codes (snake_case) -> their i18n key. Used by the review
// history overlay to show a friendly reason instead of the internal code.
const REVIEW_COMMENT_KEYS: Record<string, StringKey> = {
  order_never_prepared: 'reviewOrderNeverPrepared',
  missing_sugar: 'reviewMissingSugar',
  too_slow: 'reviewTooSlow',
  missing_butter: 'reviewMissingButter',
  untoasted_bread: 'reviewUntoastedBread',
  burned_toast: 'reviewBurnedToast',
  missing_ice: 'reviewMissingIce',
  wrong_flavor: 'reviewWrongFlavor',
  under_blended: 'reviewUnderBlended',
  over_blended: 'reviewOverBlended',
  missing_honey: 'reviewMissingHoney',
  missing_dressing: 'reviewMissingDressing',
  raw_pancakes: 'reviewRawPancakes',
  burned_pancakes: 'reviewBurnedPancakes',
};

export function reviewComment(code: string): string {
  const key = REVIEW_COMMENT_KEYS[code];
  return key ? t(key) : code;
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
    juiceFlavorNames: {
      orange: t('flavorOrange'),
      lemonade: t('flavorLemonade'),
      watermelon: t('flavorWatermelon'),
      mango: t('flavorMango'),
      pineapple: t('flavorPineapple'),
      strawberryBanana: t('flavorStrawberryBanana'),
      mangoPineapple: t('flavorMangoPineapple'),
      milkshakeChocolate: t('flavorMilkshakeChocolate'),
      milkshakeStrawberry: t('flavorMilkshakeStrawberry'),
      milkshakeVanilla: t('flavorMilkshakeVanilla'),
    },
  };
}
