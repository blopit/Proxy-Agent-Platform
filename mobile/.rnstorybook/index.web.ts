/* Web-specific story loader - manual imports for Metro compatibility */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { start, View } from '@storybook/react-native';

// Manual story imports (web-compatible - no require.context)
import * as AuthenticationStories from '../components/auth/Authentication.stories';
import * as SuggestionCardStories from '../components/cards/SuggestionCard.stories';
import * as TaskCardBigStories from '../components/cards/TaskCardBig.stories';
import * as ConnectionElementStories from '../components/connections/ConnectionElement.stories';
import * as BiologicalTabsStories from '../components/core/BiologicalTabs.stories';
import * as CaptureSubtabsStories from '../components/core/CaptureSubtabs.stories';
import * as ChevronButtonStories from '../components/core/ChevronButton.stories';
import * as ChevronElementStories from '../components/core/ChevronElement.stories';
import * as EnergyGaugeStories from '../components/core/EnergyGauge.stories';
import * as SimpleTabsStories from '../components/core/SimpleTabs.stories';
import * as SubTabsStories from '../components/core/SubTabs.stories';
import * as BionicTextStories from '../components/shared/BionicText.stories';
import * as BionicTextCardStories from '../components/shared/BionicTextCard.stories';
import * as BadgeStories from '../components/ui/Badge.stories';
import * as ButtonStories from '../components/ui/Button.stories';

// Import preview configuration
const previewAnnotations = [
  require('./preview'),
  require('@storybook/react-native/preview'),
];

// Create a mock require.context object that Storybook expects
const storyModules = {
  './auth/Authentication.stories.tsx': AuthenticationStories,
  './cards/SuggestionCard.stories.tsx': SuggestionCardStories,
  './cards/TaskCardBig.stories.tsx': TaskCardBigStories,
  './connections/ConnectionElement.stories.tsx': ConnectionElementStories,
  './core/BiologicalTabs.stories.tsx': BiologicalTabsStories,
  './core/CaptureSubtabs.stories.tsx': CaptureSubtabsStories,
  './core/ChevronButton.stories.tsx': ChevronButtonStories,
  './core/ChevronElement.stories.tsx': ChevronElementStories,
  './core/EnergyGauge.stories.tsx': EnergyGaugeStories,
  './core/SimpleTabs.stories.tsx': SimpleTabsStories,
  './core/SubTabs.stories.tsx': SubTabsStories,
  './shared/BionicText.stories.tsx': BionicTextStories,
  './shared/BionicTextCard.stories.tsx': BionicTextCardStories,
  './ui/Badge.stories.tsx': BadgeStories,
  './ui/Button.stories.tsx': ButtonStories,
};

// Create a function that mimics require.context
function createRequireContext() {
  const req: any = (key: string) => storyModules[key];
  req.keys = () => Object.keys(storyModules);
  req.resolve = (key: string) => key;
  return req;
}

// Initialize Storybook view
const view: View = start({
  annotations: previewAnnotations,
  storyEntries: [
    {
      titlePrefix: '',
      directory: '../components',
      files: '**/*.stories.tsx',
      importPathMatcher: /\.stories\.tsx$/,
      req: createRequireContext(),
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
