/* Web-specific story loader - manual imports for Metro compatibility */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { start, View } from '@storybook/react-native';

// Manual story imports (web-compatible - no require.context)
import * as SuggestionCardStories from '../components/cards/SuggestionCard.stories';
import * as TaskCardBigStories from '../components/cards/TaskCardBig.stories';
import * as ConnectionElementStories from '../components/ConnectionElement.stories';
import * as ConnectionElementStories2 from '../components/connections/ConnectionElement.stories';
import * as BiologicalTabsStories from '../components/core/BiologicalTabs.stories';
import * as CaptureSubtabsStories from '../components/core/CaptureSubtabs.stories';
import * as ChevronButtonStories from '../components/core/ChevronButton.stories';
import * as ChevronElementStories from '../components/core/ChevronElement.stories';
import * as EnergyGaugeStories from '../components/core/EnergyGauge.stories';
import * as SimpleTabsStories from '../components/core/SimpleTabs.stories';
import * as SubTabsStories from '../components/core/SubTabs.stories';
import * as BadgeStories from '../components/ui/Badge.stories';
import * as ButtonStories from '../components/ui/Button.stories';

// Import preview configuration
const previewAnnotations = [
  require('./preview'),
  require('@storybook/react-native/preview'),
];

// Create story entries manually
const storyList = [
  SuggestionCardStories,
  TaskCardBigStories,
  ConnectionElementStories,
  ConnectionElementStories2,
  BiologicalTabsStories,
  CaptureSubtabsStories,
  ChevronButtonStories,
  ChevronElementStories,
  EnergyGaugeStories,
  SimpleTabsStories,
  SubTabsStories,
  BadgeStories,
  ButtonStories,
];

// Initialize Storybook view
const view: View = start({
  annotations: previewAnnotations,
  storyEntries: [
    {
      titlePrefix: '',
      directory: './components',
      files: '**/*.stories.tsx',
      importPathMatcher: /\.stories\.tsx$/,
      req: () => storyList,
    },
  ],
});

// Get Storybook UI
const StorybookUIRoot = view.getStorybookUI({
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
});

export default StorybookUIRoot;
