import { lazy } from 'react';

const DYNAMIC_IMPORT_ERROR =
  /failed to fetch dynamically imported module|importing a module script failed|error loading dynamically imported module/i;

const AUTO_RELOAD_KEY = 'pm_dynamic_import_auto_reloaded';

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const isDynamicImportError = (error) =>
  DYNAMIC_IMPORT_ERROR.test(error?.message || '');

export const lazyWithRetry = (loader, attempts = 3) =>
  lazy(async () => {
    let lastError;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        const module = await loader();
        sessionStorage.removeItem(AUTO_RELOAD_KEY);
        return module;
      } catch (error) {
        lastError = error;

        if (!isDynamicImportError(error) || attempt === attempts - 1) {
          throw error;
        }

        await wait(300 * (attempt + 1));
      }
    }

    throw lastError;
  });

export const recoverDynamicImportError = (error) => {
  if (!isDynamicImportError(error)) {
    return false;
  }

  if (sessionStorage.getItem(AUTO_RELOAD_KEY) === '1') {
    return false;
  }

  sessionStorage.setItem(AUTO_RELOAD_KEY, '1');
  window.location.reload();
  return true;
};
