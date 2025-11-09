/**
 * Today Tab Layout - Contains subtabs for Day, Week, and Map views
 */

import { Tabs as ExpoTabs, useSegments, useRouter } from 'expo-router';
import { View } from 'react-native';
import TodaySubTabs, { TodaySubTab } from '@/components/core/TodaySubTabs';

export default function TodayLayout() {
  const segments = useSegments();
  const router = useRouter();

  // Get active subtab from route segments
  const activeSubtab = (segments[segments.length - 1] as TodaySubTab) || 'day';

  const handleSubtabChange = (subtab: TodaySubTab) => {
    router.push(`/(tabs)/today/${subtab}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#002b36' }}>
      {/* Subtabs at top */}
      <TodaySubTabs activeTab={activeSubtab} onChange={handleSubtabChange} />

      {/* Content */}
      <ExpoTabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: '#002b36' },
          animation: 'none',
        }}
      >
        <ExpoTabs.Screen name="day" options={{ title: 'Today' }} />
        <ExpoTabs.Screen name="week" options={{ title: 'Week' }} />
        <ExpoTabs.Screen name="map" options={{ title: 'Map' }} />
      </ExpoTabs>
    </View>
  );
}
