/**
 * Ambient declarations for Mailspring's runtime-provided modules.
 *
 * Mailspring injects these into the plugin at runtime but does not ship
 * TypeScript declarations, so we declare them as `any`. When you are ready to
 * invest in types, replace `any` here (or add real `.d.ts` files) and tighten
 * the call sites.
 */

declare const AppEnv: any;

declare module 'mailspring-exports' {
  export const React: any;
  export const Actions: any;
  export const ComponentRegistry: any;
  export const ExtensionRegistry: any;
  export const PreferencesUIStore: any;
  export const localized: (message: string, ...args: any[]) => string;
  export const Thread: any;
  export const Message: any;
  export const DatabaseStore: any;
  export const QuerySubscriptionPool: any;
  export class Model {}
}

declare module 'mailspring-component-kit' {
  export const RetinaImg: any;
  export const Flexbox: any;
  export const Menu: any;
  export const MenuItem: any;
  export const ButtonDropdown: any;
}

declare module '@electron/remote' {
  export const shell: any;
  export const dialog: any;
  export const BrowserWindow: any;
  export const getCurrentWindow: () => any;
}
