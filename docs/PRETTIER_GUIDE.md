# Prettier & Code Formatting Guide

## Összefoglaló a frissítésekről

A Prettier konfigurációt frissítettük, hogy jobban kezelje a formázási problémákat, beleértve a "Delete CR" hibákat és az üres space-eket.

## ✅ Mit oldottunk meg

### 1. **Line Ending problémák (Delete CR)**

- `endOfLine: "lf"` - Minden fájl Unix-style line ending-et használ
- `.editorconfig` fájlban `end_of_line = lf`
- VS Code beállításokban `files.eol: "\n"`

### 2. **Üres space-ek és sorok**

- `trim_trailing_whitespace: true` - automatikusan eltávolítja a sor végén lévő space-eket
- `insert_final_newline: true` - biztosítja a fájl végén lévő új sort
- `useTabs: false` - space-eket használ tab helyett

### 3. **Javított Prettier beállítások**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100,
  "endOfLine": "lf",
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

## 🚀 Elérhető parancsok

### Backend formázás

```bash
cd backend
npm run format          # Formázza a fájlokat
npm run format:check    # Ellenőrzi a formázást
npm run format:fix      # Prettier + ESLint javítás
npm run lint:check      # Csak ESLint ellenőrzés
```

### Projekt szintű formázás

```bash
npm run format          # Formázza az egész projektet
npm run format:check    # Ellenőrzi a formázást
npm run lint:fix        # ESLint javítás
```

## 🔧 Automatikus formázás

### VS Code beállítások

- **Format on Save**: Automatikus formázás mentéskor
- **Auto Fix**: ESLint hibák automatikus javítása
- **Organize Imports**: Import-ok rendezése

### Git Hooks

- **Pre-commit hook**: Automatikusan formázza a staged fájlokat
- **Lint-staged**: Csak a módosított fájlokat ellenőrzi

## 📝 Konfiguráció fájlok

1. **`.prettierrc`** - Prettier beállítások (root, backend, frontend)
2. **`.editorconfig`** - Szerkesztő beállítások
3. **`.vscode/settings.json`** - VS Code workspace beállítások
4. **`package.json`** - lint-staged konfiguráció
5. **`.husky/pre-commit`** - Git hook automatikus formázáshoz

## ✨ Előnyök

- ✅ Konzisztens kód formázás
- ✅ Automatikus CR/LF probléma megoldás
- ✅ Üres space-ek automatikus eltávolítása
- ✅ Commit előtti automatikus formázás
- ✅ VS Code integráció
- ✅ Team-wide konzisztencia

## 🛠️ Troubleshooting

Ha továbbra is "Delete CR" hibaüzeneteket látsz:

1. Futtasd: `npm run format` (projekt szinten)
2. Vagy: `npm run format:fix` (backend-ben)
3. Ellenőrizd VS Code beállításokat
4. Git konfigurációban: `git config core.autocrlf false`
