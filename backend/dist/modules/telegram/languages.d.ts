export declare enum Language {
    ENGLISH = "en",
    ARABIC = "ar"
}
export interface Translations {
    welcome: string;
    selectLanguage: string;
    menu: string;
    invalidOption: string;
    appointmentConfirmed: string;
    [key: string]: string;
}
export declare const translations: Record<Language, any>;
export declare function translate(key: string, lang: Language, ...args: string[]): string;
