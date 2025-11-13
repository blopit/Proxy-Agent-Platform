# Storybook Setup

This project includes Storybook for component development, testing, and documentation.

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

The Storybook dependencies are already installed. If you need to reinstall:

```bash
pnpm install
```

## Running Storybook

### Development Mode

```bash
pnpm storybook
```

This starts Storybook in development mode on `http://localhost:6006`.

### Build for Production

```bash
pnpm build-storybook
```

This creates a static build of Storybook in the `storybook-static` directory.

## Testing with Storybook

### Test Runner

Run tests for all stories:

```bash
pnpm test-storybook
```

This uses the Storybook test runner to execute tests for all stories.

### Individual Component Tests

You can also run Jest tests for individual components:

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
```

## Writing Stories

### Basic Story Structure

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './YourComponent';

const meta: Meta<typeof YourComponent> = {
  title: 'Components/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Description of your component.',
      },
    },
  },
  argTypes: {
    // Define controls for your props
  },
};

export default meta;
type Story = StoryObj<typeof YourComponent>;

export const Default: Story = {
  args: {
    // Default props
  },
};
```

### Interactive Stories

Use the `play` function to add interactions:

```typescript
export const Interactive: Story = {
  args: {
    // props
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
  },
};
```

### Testing Stories

Add tests to your stories:

```typescript
export const WithTest: Story = {
  args: {
    // props
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test interactions
    const input = canvas.getByRole('textbox');
    await userEvent.type(input, 'test input');
    
    // Test assertions
    await expect(input).toHaveValue('test input');
  },
};
```

## Available Addons

- **@storybook/addon-essentials**: Core addons including controls, docs, viewport, etc.
- **@storybook/addon-interactions**: For testing user interactions
- **@storybook/addon-a11y**: Accessibility testing
- **@storybook/test-runner**: Automated testing of stories

## Configuration Files

- `.storybook/main.ts`: Main Storybook configuration
- `.storybook/preview.ts`: Global story parameters and decorators
- `.storybook/test-setup.ts`: Test utilities and mocks
- `.storybook/jest.config.js`: Jest configuration for Storybook tests

## Best Practices

### 1. Component Organization

Organize stories by feature or component type:

```
src/
  components/
    Button/
      Button.tsx
      Button.stories.tsx
      Button.test.tsx
    Form/
      Input.tsx
      Input.stories.tsx
      Input.test.tsx
```

### 2. Story Naming

Use descriptive names for your stories:

```typescript
export const Default: Story = { /* ... */ };
export const WithError: Story = { /* ... */ };
export const Loading: Story = { /* ... */ };
export const Disabled: Story = { /* ... */ };
```

### 3. Testing

- Use the `play` function for interaction testing
- Test different states and edge cases
- Use accessibility testing with the a11y addon
- Mock external dependencies appropriately

### 4. Documentation

- Add descriptions to your stories
- Use the `docs` parameter for additional context
- Include usage examples
- Document prop types and their purposes

## Troubleshooting

### Common Issues

1. **Import errors**: Make sure your path aliases are configured correctly in `tsconfig.json`
2. **Mock issues**: Check that mocks are properly set up in `test-setup.ts`
3. **Styling issues**: Ensure global CSS is imported in `preview.ts`

### Debug Mode

Run Storybook with debug logging:

```bash
DEBUG=storybook:* pnpm storybook
```

## Integration with CI/CD

The test runner can be integrated into your CI pipeline:

```yaml
# GitHub Actions example
- name: Run Storybook tests
  run: pnpm test-storybook
```

## Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Testing with Storybook](https://storybook.js.org/docs/writing-tests/introduction)
- [Addon Documentation](https://storybook.js.org/docs/addons/introduction)
