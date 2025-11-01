# Mobile Reorganization - Bugfix

**Date**: October 30, 2025
**Issue**: Storybook runtime error - missing ChevronStep and ConnectionElement imports

---

## 🐛 Issue

After the mobile component reorganization, Storybook threw runtime errors:

```
Error: Cannot find module './ChevronStep'
Error: Cannot find module './ConnectionElement'
```

**Affected Files**:
- `components/mobile/modals/CaptureModal.tsx`
- `components/mobile/navigation/MiniChevronNav.tsx`

---

## ✅ Fix Applied

Updated relative imports in the affected files to point to the new locations:

### CaptureModal.tsx
```typescript
// BEFORE (broken)
import ChevronStep from './ChevronStep';
import ConnectionElement, { ConnectionStatus } from './ConnectionElement';

// AFTER (fixed)
import ChevronStep from '../core/ChevronStep';
import ConnectionElement, { ConnectionStatus } from '../connections/ConnectionElement';
```

### MiniChevronNav.tsx
```typescript
// BEFORE (broken)
import ChevronStep from './ChevronStep';

// AFTER (fixed)
import ChevronStep from '../core/ChevronStep';
```

---

## ✅ Verification

- ✅ Webpack compilation successful
- ✅ No module resolution errors
- ✅ Storybook should now load CaptureModal story correctly

---

## 📝 Root Cause

During the reorganization, these files had relative imports (`./`) that assumed the components were in the same directory. After moving:
- `ChevronStep.tsx` → `core/`
- `ConnectionElement.tsx` → `connections/`

The relative imports needed to be updated to the new paths.

---

**Status**: ✅ **RESOLVED**
