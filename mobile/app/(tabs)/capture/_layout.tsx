import { Tabs as ExpoTabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import SubTabs, { SubTab } from '@/components/core/Subtabs';
import { View } from 'react-native';

// Custom subtab bar using Subtabs component
function CustomSubTabBar({ state, navigation }: BottomTabBarProps) {
  const activeSubtabId = state.routes[state.index].name as SubTab;

  const handleSubTabChange = (subtabId: SubTab) => {
    const index = state.routes.findIndex((route) => route.name === subtabId);
    if (index !== -1 && state.index !== index) {
      navigation.navigate(state.routes[index].name);
    }
  };

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
      <SubTabs activeTab={activeSubtabId} onChange={handleSubTabChange} />
    </View>
  );
}

export default function CaptureLayout() {
  return (
    <ExpoTabs
      initialRouteName="add"
      tabBar={(props) => <CustomSubTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <ExpoTabs.Screen name="connect" options={{ title: 'Connect' }} />
      <ExpoTabs.Screen name="add" options={{ title: 'Add' }} />
      <ExpoTabs.Screen name="clarify" options={{ title: 'Clarify' }} />
    </ExpoTabs>
  );
}
