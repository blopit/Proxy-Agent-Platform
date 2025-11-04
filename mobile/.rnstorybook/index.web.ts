/* Web-specific story loader - manual imports for Metro compatibility */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorybookUI, configure } from '@storybook/react-native';

// Manual story imports (web-compatible - no require.context)
import '../components/cards/SuggestionCard.stories';
import '../components/cards/TaskCardBig.stories';
import '../components/ConnectionElement.stories';
import '../components/connections/ConnectionElement.stories';
import '../components/core/BiologicalTabs.stories';
import '../components/core/CaptureSubtabs.stories';
import '../components/core/ChevronButton.stories';
import '../components/core/ChevronElement.stories';
import '../components/core/EnergyGauge.stories';
import '../components/core/SimpleTabs.stories';
import '../components/core/SubTabs.stories';
import '../components/ui/Badge.stories';
import '../components/ui/Button.stories';

// Configure storybook
configure(() => {
  // Stories are already imported above
}, module);

const StorybookUIRoot = getStorybookUI({
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
});

export default StorybookUIRoot;
