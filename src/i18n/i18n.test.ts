import { DEFAULT_LANG, getLang, setLang, t } from './index';
import type { Lang } from './index';
import { STRINGS } from './strings';

describe('i18n', () => {
  afterEach(() => setLang(DEFAULT_LANG));

  it('has identical keys in all languages', () => {
    const keys = Object.keys(STRINGS.pt).sort();
    expect(Object.keys(STRINGS.en).sort()).toEqual(keys);
    expect(Object.keys(STRINGS.es).sort()).toEqual(keys);
  });

  it('has no empty strings', () => {
    for (const lang of ['pt', 'en', 'es'] as Lang[]) {
      for (const value of Object.values(STRINGS[lang])) expect(value).not.toBe('');
    }
  });

  it('defaults to pt and falls back to pt for an unknown lang', () => {
    expect(getLang()).toBe('pt');
    expect(t('menuStart')).toBe('Iniciar');
    expect(t('menuStart', 'xx' as Lang)).toBe('Iniciar');
    setLang('xx' as Lang);
    expect(getLang()).toBe('pt');
  });

  it('setLang/getLang change the default language', () => {
    setLang('en');
    expect(getLang()).toBe('en');
    expect(t('menuStart')).toBe('Start');
    expect(t('menuStart', 'es')).toBe('Iniciar');
    setLang('es');
    expect(t('menuSave')).toBe('Guardar');
  });
});
