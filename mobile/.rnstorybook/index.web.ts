/* Web-specific story loader - manual imports for Metro compatibility */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { start, View } from '@storybook/react-native';

// Manual story imports (web-compatible - no require.context)

// Auth
import * as LoginStories from '../components/auth/Login.stories';
import * as SignupStories from '../components/auth/Signup.stories';
import * as OnboardingFlowStories from '../components/auth/OnboardingFlow.stories';

// Cards
import * as SuggestionCardStories from '../components/cards/SuggestionCard.stories';
import * as TaskCardBigStories from '../components/cards/TaskCardBig.stories';

// Connections
import * as ConnectionElementStories from '../components/connections/ConnectionElement.stories';

// Core
import * as BiologicalTabsStories from '../components/core/BiologicalTabs.stories';
import * as CaptureSubtabsStories from '../components/core/CaptureSubtabs.stories';
import * as ChevronButtonStories from '../components/core/ChevronButton.stories';
import * as ChevronElementStories from '../components/core/ChevronElement.stories';
import * as ChevronStepStories from '../components/core/ChevronStep.stories';
import * as SimpleTabsStories from '../components/core/SimpleTabs.stories';
import * as SubTabsStories from '../components/core/SubTabs.stories';
import * as TabsStories from '../components/core/Tabs.stories';

// Focus
import * as FocusTimerStories from '../components/focus/FocusTimer.stories';

// Profile
import * as ProfileSwitcherStories from '../components/ProfileSwitcher.stories';

// Screens
import * as ScoutScreenStories from '../components/screens/ScoutScreen.stories';
import * as HunterScreenStories from '../components/screens/HunterScreen.stories';
import * as TodayScreenStories from '../components/screens/TodayScreen.stories';
import * as MapperScreenStories from '../components/screens/MapperScreen.stories';

// Shared
import * as BionicTextStories from '../components/shared/BionicText.stories';
import * as BionicTextCardStories from '../components/shared/BionicTextCard.stories';

// Tasks
import * as TaskListStories from '../components/tasks/TaskList.stories';

// Timeline
import * as TimelineViewStories from '../components/timeline/TimelineView.stories';

// UI
import * as BadgeStories from '../components/ui/Badge.stories';
import * as ButtonStories from '../components/ui/Button.stories';
import * as CardStories from '../components/ui/Card.stories';

// Import preview configuration
const previewAnnotations = [
  require('./preview'),
  require('@storybook/react-native/preview'),
];

// Create a mock require.context object that Storybook expects
const storyModules = {
  // Auth
  './auth/Login.stories.tsx': LoginStories,
  './auth/Signup.stories.tsx': SignupStories,
  './auth/OnboardingFlow.stories.tsx': OnboardingFlowStories,

  // Cards
  './cards/SuggestionCard.stories.tsx': SuggestionCardStories,
  './cards/TaskCardBig.stories.tsx': TaskCardBigStories,

  // Connections
  './connections/ConnectionElement.stories.tsx': ConnectionElementStories,

  // Core
  './core/BiologicalTabs.stories.tsx': BiologicalTabsStories,
  './core/CaptureSubtabs.stories.tsx': CaptureSubtabsStories,
  './core/ChevronButton.stories.tsx': ChevronButtonStories,
  './core/ChevronElement.stories.tsx': ChevronElementStories,
  './core/ChevronStep.stories.tsx': ChevronStepStories,
  './core/SimpleTabs.stories.tsx': SimpleTabsStories,
  './core/SubTabs.stories.tsx': SubTabsStories,
  './core/Tabs.stories.tsx': TabsStories,

  // Focus
  './focus/FocusTimer.stories.tsx': FocusTimerStories,

  // Profile
  './ProfileSwitcher.stories.tsx': ProfileSwitcherStories,

  // Screens
  './screens/ScoutScreen.stories.tsx': ScoutScreenStories,
  './screens/HunterScreen.stories.tsx': HunterScreenStories,
  './screens/TodayScreen.stories.tsx': TodayScreenStories,
  './screens/MapperScreen.stories.tsx': MapperScreenStories,

  // Shared
  './shared/BionicText.stories.tsx': BionicTextStories,
  './shared/BionicTextCard.stories.tsx': BionicTextCardStories,

  // Tasks
  './tasks/TaskList.stories.tsx': TaskListStories,

  // Timeline
  './timeline/TimelineView.stories.tsx': TimelineViewStories,

  // UI
  './ui/Badge.stories.tsx': BadgeStories,
  './ui/Button.stories.tsx': ButtonStories,
  './ui/Card.stories.tsx': CardStories,
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
  shouldPersistSelection: true,
  tabOpen: 1, // Open addons panel by default (0 = sidebar, 1 = addons)
  enableWebsockets: true,
});

export default StorybookUIRoot;
