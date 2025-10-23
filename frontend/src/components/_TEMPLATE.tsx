/**
 * Component Template
 *
 * This template provides a starting point for new React components with:
 * - Proper imports (React, design system, types)
 * - TypeScript interface for props
 * - JSDoc documentation
 * - Design system usage examples
 * - Proper export pattern
 *
 * USAGE:
 * 1. Copy this file to your desired location
 * 2. Rename the file (e.g., MyComponent.tsx)
 * 3. Replace "Template" with your component name
 * 4. Define your props interface
 * 5. Implement component logic
 * 6. Add to COMPONENT_CATALOG.md when done
 */

'use client'

import React, { useState } from 'react'
import {
  spacing,
  semanticColors,
  fontSize,
  borderRadius,
  iconSize,
  shadow,
  duration
} from '@/lib/design-system'

// Optional: Import icons from lucide-react
// import { Search, Bot, Zap } from 'lucide-react'

/**
 * Props interface for Template component
 *
 * Always define TypeScript interfaces for all props.
 * Include JSDoc comments for each prop to explain usage.
 */
interface TemplateProps {
  /**
   * The main title to display
   */
  title: string

  /**
   * Optional description text
   */
  description?: string

  /**
   * Callback function when user clicks
   */
  onClick?: () => void

  /**
   * Whether the component is in a loading state
   * @default false
   */
  isLoading?: boolean

  /**
   * Child elements to render
   */
  children?: React.ReactNode
}

/**
 * Template Component
 *
 * A template component demonstrating best practices for creating new components.
 * This shows proper use of design system tokens, TypeScript types, and JSDoc comments.
 *
 * @example
 * ```tsx
 * <Template
 *   title="Hello World"
 *   description="This is an example"
 *   onClick={() => console.log('clicked')}
 * >
 *   <p>Child content here</p>
 * </Template>
 * ```
 *
 * @param props - Component props (see TemplateProps interface)
 * @returns React component
 */
export default function Template({
  title,
  description,
  onClick,
  isLoading = false,
  children
}: TemplateProps) {
  // Local state example
  const [isHovered, setIsHovered] = useState(false)

  // Event handlers
  const handleClick = () => {
    if (onClick && !isLoading) {
      onClick()
    }
  }

  // Render
  return (
    <div
      className="flex flex-col"
      style={{
        // ✅ GOOD: Using design system tokens
        padding: spacing[4],                       // 16px
        backgroundColor: semanticColors.bg.secondary,
        borderRadius: borderRadius.lg,             // 16px
        boxShadow: shadow.md,
        border: `1px solid ${semanticColors.border.default}`,
        transition: `all ${duration.normal}`,     // 300ms
        cursor: onClick && !isLoading ? 'pointer' : 'default',
        opacity: isLoading ? 0.6 : 1
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between" style={{ marginBottom: spacing[3] }}>
        <h3
          style={{
            fontSize: fontSize.lg,                 // 18px
            fontWeight: 600,
            color: semanticColors.text.primary,
            margin: 0
          }}
        >
          {title}
        </h3>

        {isLoading && (
          <div style={{ color: semanticColors.text.secondary, fontSize: fontSize.sm }}>
            Loading...
          </div>
        )}
      </div>

      {/* Description Section (optional) */}
      {description && (
        <p
          style={{
            fontSize: fontSize.sm,                 // 14px
            color: semanticColors.text.secondary,
            marginBottom: spacing[3],
            lineHeight: 1.5
          }}
        >
          {description}
        </p>
      )}

      {/* Children Section */}
      {children && (
        <div style={{ marginTop: spacing[2] }}>
          {children}
        </div>
      )}

      {/* Example: Hover State Indicator */}
      {isHovered && onClick && !isLoading && (
        <div
          style={{
            marginTop: spacing[2],
            padding: `${spacing[1]} ${spacing[2]}`,
            backgroundColor: semanticColors.accent.primary,
            color: semanticColors.text.inverse,
            borderRadius: borderRadius.pill,
            fontSize: fontSize.xs,
            textAlign: 'center'
          }}
        >
          Click to interact
        </div>
      )}
    </div>
  )
}

/**
 * EXAMPLES & BEST PRACTICES
 *
 * 1. Always use design system tokens:
 *    ✅ padding: spacing[4]
 *    ❌ padding: '16px'
 *
 * 2. Always use semantic colors:
 *    ✅ color: semanticColors.text.primary
 *    ❌ color: '#93a1a1'
 *
 * 3. Always define TypeScript interfaces:
 *    ✅ interface MyProps { title: string }
 *    ❌ Using 'any' or no types
 *
 * 4. Always add JSDoc comments:
 *    ✅ /** Renders a card component * /
 *    ❌ No documentation
 *
 * 5. Follow 4px grid with spacing tokens:
 *    ✅ gap: spacing[2]  // 8px
 *    ❌ gap: '10px'      // Not on 4px grid
 *
 * 6. Use proper event handlers:
 *    ✅ onClick={handleClick}
 *    ❌ onClick={() => doSomething()} (inline arrow)
 *
 * 7. Add proper loading/disabled states:
 *    ✅ disabled={isLoading}
 *    ✅ opacity: isLoading ? 0.6 : 1
 *
 * 8. Clean up effects:
 *    ✅ return () => cleanup()
 *    ❌ No cleanup in useEffect
 */

/**
 * COMMON PATTERNS
 */

// Pattern 1: Conditional Styling
// Use JavaScript ternary or && instead of hardcoding values
const conditionalStyleExample = (isActive: boolean) => ({
  backgroundColor: isActive
    ? semanticColors.accent.primary
    : semanticColors.bg.secondary,
  color: isActive
    ? semanticColors.text.inverse
    : semanticColors.text.primary
})

// Pattern 2: Hover Effects
// Use state and onMouseEnter/onMouseLeave for hover effects
const hoverEffectExample = {
  transition: `all ${duration.normal}`,
  transform: 'scale(1)',
  // Apply in onMouseEnter:
  // style.transform = 'scale(1.02)'
}

// Pattern 3: Loading State
// Show loading indicator and disable interactions
const loadingStateExample = (isLoading: boolean) => ({
  opacity: isLoading ? 0.6 : 1,
  cursor: isLoading ? 'not-allowed' : 'pointer',
  pointerEvents: isLoading ? 'none' as const : 'auto' as const
})

// Pattern 4: Responsive Layout
// Use flexbox with design system spacing
const responsiveLayoutExample = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: spacing[2],
  padding: spacing[4],
  '@media (min-width: 768px)': {
    flexDirection: 'row' as const,
    gap: spacing[4]
  }
}

/**
 * TESTING CHECKLIST
 *
 * Before submitting your component:
 *
 * - [ ] All props have TypeScript types
 * - [ ] All design values use tokens (no hardcoded values)
 * - [ ] JSDoc comments added for component and all props
 * - [ ] Tested in browser at localhost:3000
 * - [ ] Loading states implemented and tested
 * - [ ] Error states handled gracefully
 * - [ ] Responsive design tested (mobile & desktop)
 * - [ ] Accessibility: keyboard navigation works
 * - [ ] No console errors or warnings
 * - [ ] Component added to COMPONENT_CATALOG.md
 */

/**
 * INTEGRATION CHECKLIST
 *
 * After creating your component:
 *
 * 1. Add to COMPONENT_CATALOG.md with:
 *    - Component name and purpose
 *    - Props interface
 *    - Usage example
 *    - Location link
 *
 * 2. If creating a reusable pattern, add to DONT_RECREATE.md
 *
 * 3. Run linting and type checking:
 *    npm run lint
 *    npm run type-check
 *
 * 4. Test in actual page/component where it will be used
 *
 * 5. Consider adding Storybook story (optional but recommended)
 */
