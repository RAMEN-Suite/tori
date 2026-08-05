import { Injectable } from '@angular/core';
import { EmConfig } from '../../interfaces';
import { LanguageKey } from '../models/config/LanguageOptions';
import { ShortcutOverrides } from '../shortcuts/shortcut-keymap.service';

interface StorageMap {
  EM_CONFIG_STORE_KEY: EmConfig;
  EM_LANGUAGE_STORE_KEY: LanguageKey;
  EM_SHORTCUT_STORE_KEY: ShortcutOverrides;
}

@Injectable({
  providedIn: 'root',
})
export class LocalStoreService {
  public saveData<K extends keyof StorageMap>(
    key: K,
    value: StorageMap[K],
  ): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  public getData<K extends keyof StorageMap>(key: K): StorageMap[K] | null {
    const value = localStorage.getItem(key);

    if (value === null) {
      return null;
    }

    return JSON.parse(value) as StorageMap[K];
  }

  public removeData(key: keyof StorageMap) {
    localStorage.removeItem(key);
  }

  public clearData() {
    localStorage.clear();
  }
}
