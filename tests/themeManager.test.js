import { ThemeManager } from '../modules/themeManager.js';

class MockChromeStorage {
  constructor() {
    this.store = {};
  }
  get(keys, callback) {
    const result = {};
    keys.forEach(key => {
      result[key] = this.store[key];
    });
    callback(result);
  }
  set(items, callback) {
    Object.assign(this.store, items);
    callback();
  }
}

global.chrome = {
  storage: {
    local: new MockChromeStorage()
  }
};

describe('ThemeManager', () => {
  let themeManager;

  beforeEach(() => {
    themeManager = new ThemeManager();
    document.documentElement.classList.remove('dark');
  });

  test('initializes theme to dark if stored', async () => {
    chrome.storage.local.store['theme'] = 'dark';
    await themeManager.initTheme();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('initializes theme to light if stored', async () => {
    chrome.storage.local.store['theme'] = 'light';
    await themeManager.initTheme();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('toggles theme from light to dark', async () => {
    await themeManager._storeTheme('light');
    await themeManager.initTheme();
    await themeManager.toggleTheme();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('toggles theme from dark to light', async () => {
    await themeManager._storeTheme('dark');
    await themeManager.initTheme();
    await themeManager.toggleTheme();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
