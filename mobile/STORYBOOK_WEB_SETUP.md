# Storybook Web Setup - Manual Story Imports

## Problem

React Native Storybook uses `require.context` for auto-discovering story files, which is a **webpack-only feature**. Since Expo web uses Metro bundler (not webpack), the default Storybook setup crashes on web with `require.context is not defined` errors.

## Solution Implemented

Created a **web-specific story loader** that manually imports all story files instead of using `require.context`.

### Files Modified:

1. **`mobile/.rnstorybook/index.web.ts`** (NEW)
   - Web-specific story loader with manual imports
   - No `require.context` - uses explicit imports instead
   - Platform-agnostic after import

2. **`mobile/app/storybook.tsx`** (MODIFIED)
   - Platform detection to use web-specific loader
   - Falls back to native loader for iOS/Android

3. **`mobile/metro.config.js`** (MODIFIED)
   - Added `generate: false` to prevent auto-regeneration
   - Allows manual control of story loading

##Usage

### Accessing Storybook:

- **Web**: http://localhost:7007/storybook
- **Native**: Navigate to `/storybook` route in Expo Go app

### Adding New Stories:

When you create a new `.stories.tsx` file, you **MUST manually add it** to `.rnstorybook/index.web.ts`:

```typescript
// Add new story import:
import '../components/your-component/YourComponent.stories';
```

### Current Stories (15 total):

```
components/auth/Authentication.stories.tsx
components/cards/SuggestionCard.stories.tsx
components/cards/TaskCardBig.stories.tsx
components/connections/ConnectionElement.stories.tsx
components/core/BiologicalTabs.stories.tsx
components/core/CaptureSubtabs.stories.tsx
components/core/ChevronButton.stories.tsx
components/core/ChevronElement.stories.tsx
components/core/EnergyGauge.stories.tsx
components/core/SimpleTabs.stories.tsx
components/core/SubTabs.stories.tsx
components/shared/BionicText.stories.tsx
components/shared/BionicTextCard.stories.tsx
components/ui/Badge.stories.tsx
components/ui/Button.stories.tsx
```

## Alternative Approaches (Not Implemented)

### Option 1: Native-Only Storybook
- Simplest: Don't support web at all
- Use iOS/Android Expo app only
- Most React Native developers use this approach

### Option 2: Add Webpack for Web
- Install `@expo/webpack-config`
- More complex, adds build overhead
- Would support `require.context` on web

## Troubleshooting

### Metro Not Bundling
- Restart with: `npm run storybook`
- Clear cache: `npx expo start --clear -c --port 7007`

### Stories Not Showing
- Check all story files are imported in `.rnstorybook/index.web.ts`
- Verify Platform.OS check in `app/storybook.tsx`

### Auto-Generation Reverting Changes
- `metro.config.js` has `generate: false`
- Native loader (`storybook.requires.ts`) may still auto-regenerate
- Web loader (`index.web.ts`) is manually maintained

## Files to Never Edit Automatically

- ❌ `.rnstorybook/storybook.requires.ts` (auto-generated for native)
- ✅ `.rnstorybook/index.web.ts` (manually maintained for web)
