# FE-19: E2E Test Suite (Playwright)

**Delegation Mode**: ⚙️ DELEGATE | **Time**: 7-8 hours | **Dependencies**: All frontend components

## 📋 Overview
Comprehensive end-to-end tests covering complete user journeys using Playwright.

## Test Scenarios

### 1. Complete Task Flow
```typescript
test('user can create, break down, and complete a task', async ({ page }) => {
  // Login
  await page.goto('/');
  await page.fill('[data-testid="username"]', 'testuser');
  await page.click('[data-testid="login-button"]');

  // Create task in Capture mode
  await page.click('[data-testid="mode-capture"]');
  await page.fill('[data-testid="task-input"]', 'Complete homework');
  await page.click('[data-testid="create-task"]');

  // AI breakdown
  await page.click('[data-testid="ai-split-button"]');
  await page.waitForSelector('[data-testid="step-suggestion"]');
  await page.click('[data-testid="confirm-breakdown"]');

  // Start task in Hunter mode
  await page.click('[data-testid="mode-hunter"]');
  await page.click('[data-testid="start-task"]');

  // Complete steps
  for (let i = 0; i < 5; i++) {
    await page.click('[data-testid="complete-step"]');
  }

  // Verify XP earned
  await expect(page.locator('[data-testid="xp-earned"]')).toContainText('+');

  // Check analytics updated
  await page.click('[data-testid="mode-mapper"]');
  await expect(page.locator('[data-testid="tasks-completed-today"]')).toContainText('1');
});
```

### 2. Creature Interaction Flow
```typescript
test('user can adopt and interact with creature', async ({ page }) => {
  await loginAs(page, 'newuser');

  // Onboarding: Choose creature
  await page.click('[data-testid="species-dragon"]');
  await page.fill('[data-testid="creature-name"]', 'Sparky');
  await page.click('[data-testid="confirm-creature"]');

  // Feed creature
  await page.click('[data-testid="creature-widget"]');
  await page.click('[data-testid="feed-button"]');
  await expect(page.locator('[data-testid="hunger-level"]')).toHaveAttribute('data-value', '100');

  // Verify XP gained
  await expect(page.locator('[data-testid="creature-xp"]')).toContainText('+10');
});
```

### 3. Template Usage Flow
```typescript
test('user can use task template from library', async ({ page }) => {
  await loginAs(page, 'testuser');

  // Go to template library
  await page.click('[data-testid="mode-scout"]');
  await page.click('[data-testid="templates-tab"]');

  // Select homework template
  await page.click('[data-testid="template-homework"]');

  // Preview steps
  await expect(page.locator('[data-testid="template-steps"]')).toHaveCount(4);

  // Use template
  await page.click('[data-testid="use-template"]');

  // Verify task created
  await page.click('[data-testid="mode-hunter"]');
  await expect(page.locator('[data-testid="task-card"]')).toContainText('Homework');
});
```

### 4. Multi-Mode Navigation
```typescript
test('user can navigate between all biological modes', async ({ page }) => {
  await loginAs(page, 'testuser');

  const modes = ['capture', 'scout', 'hunter', 'mender', 'mapper'];

  for (const mode of modes) {
    await page.click(`[data-testid="mode-${mode}"]`);
    await expect(page.locator('[data-testid="active-mode"]')).toHaveAttribute('data-mode', mode);
    await page.waitForTimeout(500);  // Let animations settle
  }
});
```

### 5. Accessibility Test
```typescript
test('app is keyboard navigable', async ({ page }) => {
  await page.goto('/');

  // Tab through all focusable elements
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab');
    const focused = await page.locator(':focus');
    await expect(focused).toBeVisible();
  }

  // Enter activates buttons
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-testid="modal"]')).toBeVisible();

  // Escape closes modal
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-testid="modal"]')).not.toBeVisible();
});
```

## Test Organization
```
e2e/
├── task-management.spec.ts
├── creature-system.spec.ts
├── template-library.spec.ts
├── gamification.spec.ts
├── accessibility.spec.ts
├── mobile.spec.ts
└── fixtures/
    ├── test-users.ts
    └── mock-data.ts
```

## CI/CD Integration
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright
        run: pnpm playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## ✅ Acceptance Criteria
- [ ] 20+ E2E test scenarios
- [ ] All critical user journeys covered
- [ ] Mobile viewport tests
- [ ] Accessibility tests
- [ ] CI/CD integration
- [ ] Screenshot comparisons
- [ ] All tests pass consistently
