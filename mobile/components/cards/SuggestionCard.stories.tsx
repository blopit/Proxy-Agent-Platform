/**
 * SuggestionCard Stories - React Native Storybook
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import SuggestionCard from './SuggestionCard';

const meta = {
  title: 'Cards/SuggestionCard',
  component: SuggestionCard,
  argTypes: {
    onAdd: { action: 'add' },
    onDismiss: { action: 'dismiss' },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 20, backgroundColor: '#002b36' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof SuggestionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample brand icons (Gmail, Slack, GitHub)
const gmailIcon = {
  iconSvg: 'M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z',
  iconColor: '#EA4335',
  name: 'Gmail',
};

const slackIcon = {
  iconSvg: 'M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z',
  iconColor: '#4A154B',
  name: 'Slack',
};

const githubIcon = {
  iconSvg: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  iconColor: '#181717',
  name: 'GitHub',
};

export const Default: Story = {
  args: {
    text: 'Schedule team sync meeting for project kickoff',
    sources: [gmailIcon],
  },
};

export const MultipleSources: Story = {
  args: {
    text: 'Review pull request #123 and update documentation',
    sources: [githubIcon, slackIcon],
  },
};

export const ThreeSources: Story = {
  args: {
    text: 'Follow up on email from client about deliverables',
    sources: [gmailIcon, slackIcon, githubIcon],
  },
};

export const WithMetadata: Story = {
  args: {
    text: 'Respond to urgent message from Sarah',
    sources: [slackIcon],
    metadata: '2h ago',
  },
};

export const LongText: Story = {
  args: {
    text: 'This is a very long suggestion text that should be truncated with an ellipsis because it exceeds the available space in the card component',
    sources: [gmailIcon, slackIcon],
    metadata: 'Gmail',
  },
};

export const ShortText: Story = {
  args: {
    text: 'Call John',
    sources: [slackIcon],
  },
};

export const WithTimeMetadata: Story = {
  args: {
    text: 'Review code changes before standup',
    sources: [githubIcon],
    metadata: '30m',
  },
};
