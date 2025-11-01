import type { Meta, StoryObj } from '@storybook/nextjs';
import SuggestionCard from './SuggestionCard';
import { siGmail, siGooglecalendar, siSlack, siGoogledrive, siNotion, siTrello } from 'simple-icons';

const meta: Meta<typeof SuggestionCard> = {
  title: 'Mobile/SuggestionCard',
  component: SuggestionCard,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    text: { control: 'text' },
    metadata: { control: 'text' },
    onAdd: { action: 'added' },
    onDismiss: { action: 'dismissed' }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper to convert simple-icons to Source format
const toSource = (icon: typeof siGmail, name: string) => ({
  iconSvg: icon.path,
  iconColor: `#${icon.hex}`,
  name
});

/**
 * Single source suggestion from Gmail
 */
export const SingleSource: Story = {
  args: {
    text: 'Follow up with John about quarterly review',
    sources: [toSource(siGmail, 'Gmail')],
    metadata: '2h ago'
  }
};

/**
 * Two sources - suggestion from Gmail and Calendar
 */
export const TwoSources: Story = {
  args: {
    text: 'Schedule team meeting for next week',
    sources: [
      toSource(siGmail, 'Gmail'),
      toSource(siGooglecalendar, 'Google Calendar')
    ],
    metadata: '1h ago'
  }
};

/**
 * Three sources - suggestion from multiple apps
 */
export const ThreeSources: Story = {
  args: {
    text: 'Review design files and share feedback',
    sources: [
      toSource(siSlack, 'Slack'),
      toSource(siGoogledrive, 'Google Drive'),
      toSource(siNotion, 'Notion')
    ],
    metadata: '30m ago'
  }
};

/**
 * Without metadata badge
 */
export const NoMetadata: Story = {
  args: {
    text: 'Reply to Sarah\'s question about the project timeline',
    sources: [toSource(siSlack, 'Slack')],
    onAdd: () => console.log('Added'),
    onDismiss: () => console.log('Dismissed')
  }
};

/**
 * Long text that gets truncated with ellipsis
 */
export const LongTextTruncation: Story = {
  args: {
    text: 'This is a very long suggestion text that should be truncated with an ellipsis when it exceeds the available space in the card',
    sources: [
      toSource(siGmail, 'Gmail'),
      toSource(siTrello, 'Trello')
    ],
    metadata: 'Today'
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    )
  ]
};

/**
 * Multiple suggestions in a list
 */
export const SuggestionList: Story = {
  render: () => (
    <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <SuggestionCard
        text="Follow up with John about quarterly review"
        sources={[toSource(siGmail, 'Gmail')]}
        metadata="2h ago"
        onAdd={() => console.log('Added')}
        onDismiss={() => console.log('Dismissed')}
      />
      <SuggestionCard
        text="Schedule team meeting for next week"
        sources={[
          toSource(siGmail, 'Gmail'),
          toSource(siGooglecalendar, 'Google Calendar')
        ]}
        metadata="1h ago"
        onAdd={() => console.log('Added')}
        onDismiss={() => console.log('Dismissed')}
      />
      <SuggestionCard
        text="Review design files and share feedback with the team"
        sources={[
          toSource(siSlack, 'Slack'),
          toSource(siGoogledrive, 'Google Drive'),
          toSource(siNotion, 'Notion')
        ]}
        metadata="30m ago"
        onAdd={() => console.log('Added')}
        onDismiss={() => console.log('Dismissed')}
      />
      <SuggestionCard
        text="Update project documentation"
        sources={[toSource(siNotion, 'Notion')]}
        onAdd={() => console.log('Added')}
        onDismiss={() => console.log('Dismissed')}
      />
    </div>
  )
};

/**
 * Various metadata styles
 */
export const MetadataVariations: Story = {
  render: () => (
    <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <SuggestionCard
        text="Recent suggestion with time"
        sources={[toSource(siGmail, 'Gmail')]}
        metadata="5m ago"
        onAdd={() => console.log('Added')}
        onDismiss={() => console.log('Dismissed')}
      />
      <SuggestionCard
        text="Suggestion with date"
        sources={[toSource(siSlack, 'Slack')]}
        metadata="Today"
        onAdd={() => console.log('Added')}
        onDismiss={() => console.log('Dismissed')}
      />
      <SuggestionCard
        text="High priority suggestion"
        sources={[toSource(siTrello, 'Trello')]}
        metadata="Urgent"
        onAdd={() => console.log('Added')}
        onDismiss={() => console.log('Dismissed')}
      />
      <SuggestionCard
        text="Suggestion from specific source"
        sources={[
          toSource(siGmail, 'Gmail'),
          toSource(siGooglecalendar, 'Google Calendar')
        ]}
        metadata="Gmail"
        onAdd={() => console.log('Added')}
        onDismiss={() => console.log('Dismissed')}
      />
    </div>
  )
};
