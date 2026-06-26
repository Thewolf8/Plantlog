# PlantLog — Changes Package

## How to apply

### 1. Drop the `android/` folder into your project root
```
your-project/
├── android/        ← place here
├── src/
├── package.json
└── ...
```

### 2. Replace modified source files
Copy every file from `src/` in this package into your project's `src/` folder,
preserving the same directory structure.

### 3. After dropping in the android folder, run once:
```bash
npm run build
npx cap sync android
```
This populates `android/app/src/main/assets/public/` with your built app.

---

## Files changed (src/)
| File | What changed |
|---|---|
| `types/settings.ts` | Added `'amoled'` to `Theme` type |
| `context/ThemeContext.tsx` | AMOLED applies `.dark` + `.amoled` classes |
| `index.css` | Added `.amoled` CSS variable block (pure black) |
| `i18n/translations.ts` | Added `themeDarkBotanical` + `themeAmoled` keys (EN/AR/FR) |
| `pages/SettingsPage.tsx` | 3-button theme selector, AMOLED sub-option, all Checkboxes |
| `pages/ExportPage.tsx` | includePhotos/includeNotes → Checkbox |
| `pages/EditPlantPage.tsx` | isClimateDefiance → Checkbox |
| `pages/AddPlantPage.tsx` | 4 switches → Checkboxes |
| `components/InterventionForm.tsx` | isOrganic → Checkbox |
