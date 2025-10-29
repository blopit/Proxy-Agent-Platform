# FE-04: TaskTemplateLibrary Component (Week 4)

**Status**: 🟢 AVAILABLE
**Priority**: MEDIUM
**Dependencies**: BE-01 Task Templates Service (backend)
**Estimated Time**: 4 hours
**Approach**: Storybook-first

---

## 📋 Overview

Grid of pre-built task templates. Users can select template, preview steps, customize, and create task from template.

---

## 🎨 Component API

```typescript
interface TaskTemplateLibraryProps {
  category?: string;  // Filter by category
  onSelectTemplate: (template: TaskTemplate) => void;
}

interface TaskTemplate {
  template_id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  estimated_minutes: number;
  steps: TemplateStep[];
}
```

---

## 🎭 Storybook Stories

```typescript
export const AllTemplates: Story = {
  args: {
    onSelectTemplate: (t) => console.log('Selected:', t.name),
  },
};

export const AcademicOnly: Story = {
  args: {
    category: 'Academic',
  },
};

export const EmptyState: Story = {
  // No templates available
};
```

---

## 🏗️ Implementation

- Grid layout: 2 columns on mobile, 3-4 on desktop
- Template card: Icon + name + est. time + step count
- Click → Open preview modal with chevron timeline
- "Use Template" → Call `onSelectTemplate(template)`
- Fetch from: `GET /api/v1/task-templates?category={category}`

---

## ✅ Acceptance Criteria

- [ ] Grid displays template cards
- [ ] Filter by category works
- [ ] Preview modal shows steps
- [ ] "Use Template" triggers callback
- [ ] Empty state for no templates
- [ ] 3+ Storybook stories

---

**Depends on**: BE-01 backend service
