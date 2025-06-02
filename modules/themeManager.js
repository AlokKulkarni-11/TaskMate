export class ThemeManager {
  constructor() {
    this.storageKey = 'theme';
    this.darkClass = 'dark';
  }

  async initTheme() {
    const savedTheme = await this._getStoredTheme();
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this._applyDarkTheme();
    } else {
      this._applyLightTheme();
    }
  }

  async toggleTheme() {
    const isDark = document.documentElement.classList.contains(this.darkClass);
    if (isDark) {
      this._applyLightTheme();
      await this._storeTheme('light');
    } else {
      this._applyDarkTheme();
      await this._storeTheme('dark');
    }
  }

  _applyDarkTheme() {
    document.documentElement.classList.add(this.darkClass);
  }

  _applyLightTheme() {
    document.documentElement.classList.remove(this.darkClass);
  }

  async _getStoredTheme() {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.storageKey], (result) => {
        resolve(result[this.storageKey]);
      });
    });
  }

  async _storeTheme(theme) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [this.storageKey]: theme }, () => {
        resolve();
      });
    });
  }
}
