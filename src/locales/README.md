# Internationalization (i18n) System

This directory contains translation files for the Passi City College website.

## Supported Languages

- **English (en)** - Default language
- **Filipino (fil)** - National language of the Philippines
- **Hiligaynon (hil)** - Regional language spoken in Iloilo

## Usage

### In Components

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>{t('hero.description')}</p>
      
      {/* Change language */}
      <button onClick={() => setLanguage('fil')}>
        Switch to Filipino
      </button>
    </div>
  );
}
```

### Translation Keys

Translation keys use dot notation to access nested values:

```tsx
t('auth.login.title')        // "Welcome Back"
t('nav.home')                // "Home"
t('programs.title')          // "Our Programs"
```

## Adding New Translations

1. Add the key-value pair to all language files (en.json, fil.json, hil.json)
2. Use the same structure in all files
3. Use the `t()` function in your components

Example:

```json
// en.json
{
  "newSection": {
    "title": "New Section",
    "description": "This is a new section"
  }
}

// fil.json
{
  "newSection": {
    "title": "Bagong Seksyon",
    "description": "Ito ay isang bagong seksyon"
  }
}

// hil.json
{
  "newSection": {
    "title": "Bag-o nga Seksyon",
    "description": "Ini isa ka bag-o nga seksyon"
  }
}
```

## Language Switcher

The language switcher is available in the navigation bar. Users can select their preferred language, and the selection is saved to localStorage for persistence across sessions.

## Best Practices

1. **Always provide translations for all languages** - If a translation is missing, the key will be displayed
2. **Use descriptive keys** - Make keys self-explanatory (e.g., `auth.login.submit` instead of `btn1`)
3. **Keep translations consistent** - Use the same terminology across the application
4. **Test all languages** - Ensure UI doesn't break with longer translations
5. **Consider context** - Some words may have different meanings in different contexts

## File Structure

```
src/locales/
├── en.json       # English translations
├── fil.json      # Filipino translations
├── hil.json      # Hiligaynon translations
└── README.md     # This file
```

## Translation Guidelines

### Filipino (Tagalog)
- Use formal Filipino for official content
- Use common Filipino words that are widely understood
- Avoid overly technical Tagalog terms that might confuse users

### Hiligaynon (Ilonggo)
- Use standard Hiligaynon spelling and grammar
- Consider that many users may code-switch between Hiligaynon and English
- Use terms that are commonly used in Iloilo region

## Contributing

When adding new features:
1. Add English translations first
2. Work with native speakers for Filipino and Hiligaynon translations
3. Test the UI with all languages to ensure proper display
4. Update this README if adding new translation sections
