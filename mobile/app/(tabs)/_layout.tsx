import { Tabs as ExpoTabs } from 'expo-router';
import { Plus, Search, Target, Calendar, Map } from 'lucide-react-native';
import { Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs, TabItem } from '@/components/core/Tabs';

// Custom tab bar using base Tabs component
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const currentDay = new Date().getDate();

  const tabItems: TabItem[] = [
    {
      id: 'capture',
      icon: Plus,
      color: '#2aa198',
      description: 'Capture tasks',
    },
    {
      id: 'scout',
      icon: Search,
      color: '#268bd2',
      description: 'Scout for tasks',
    },
    {
      id: 'hunter',
      icon: Target,
      color: '#cb4b16',
      description: 'Hunt mode',
    },
    {
      id: 'today',
      icon: Calendar,
      color: '#d33682',
      description: 'Today tasks',
      renderContent: ({ color }) => (
        <>
          <Calendar size={24} color={color} />
          <Text
            style={{
              position: 'absolute',
              fontSize: 9,
              fontWeight: '700',
              top: 11,
              left: 0,
              right: 0,
              textAlign: 'center',
              color,
            }}
          >
            {currentDay}
          </Text>
        </>
      ),
    },
    {
      id: 'mapper',
      icon: Map,
      color: '#6c71c4',
      description: 'Map view',
    },
  ];

  const activeTabId = state.routes[state.index].name;

  const handleTabChange = (tabId: string) => {
    const index = tabItems.findIndex((tab) => tab.id === tabId);
    if (index !== -1) {
      const event = navigation.emit({
        type: 'tabPress',
        target: state.routes[index].key,
        canPreventDefault: true,
      });

      if (state.index !== index && !event.defaultPrevented) {
        navigation.navigate(state.routes[index].name);
      }
    }
  };

  return (
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
      <Tabs
        tabs={tabItems}
        activeTab={activeTabId}
        onChange={handleTabChange}
        showLabels={false}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <ExpoTabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#002b36' },
        animation: 'none',
      }}
    >
      <ExpoTabs.Screen name="capture" options={{ title: 'Capture' }} />
      <ExpoTabs.Screen name="scout" options={{ title: 'Scout' }} />
      <ExpoTabs.Screen name="hunter" options={{ title: 'Hunt' }} />
      <ExpoTabs.Screen name="today" options={{ title: 'Today' }} />
      <ExpoTabs.Screen name="mapper" options={{ title: 'Map' }} />
    </ExpoTabs>
  );
}
