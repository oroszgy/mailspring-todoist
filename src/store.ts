/**
 * Thin settings layer over Mailspring's Config store.
 *
 * Keys are namespaced with the package name (`mailspring-todoist`) and declared
 * as a schema in `main.ts`.
 */

const PREFIX = 'mailspring-todoist';

export interface Settings {
  apiToken: string;
  defaultProjectId: string;
  defaultDueString: string;
  includeSnippet: boolean;
  includeLink: boolean;
}

export function getSettings(): Settings {
  return {
    apiToken: AppEnv.config.get(`${PREFIX}.apiToken`) || '',
    defaultProjectId: AppEnv.config.get(`${PREFIX}.defaultProjectId`) || '',
    defaultDueString: AppEnv.config.get(`${PREFIX}.defaultDueString`) || '',
    includeSnippet: AppEnv.config.get(`${PREFIX}.includeSnippet`) !== false,
    includeLink: AppEnv.config.get(`${PREFIX}.includeLink`) !== false,
  };
}

export function setSetting(key: keyof Settings, value: any): void {
  AppEnv.config.set(`${PREFIX}.${key}`, value);
}

export function hasToken(): boolean {
  return getSettings().apiToken.length > 0;
}
