import { Tabs } from 'expo-router';
import { Text } from 'react-native';

// Icon components - we'll use emojis for now, later replace with lucide-react-native
const TabBarIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2aa198', // Solarized cyan
        tabBarInactiveTintColor: '#586e75', // Solarized base01
        tabBarStyle: {
          backgroundColor: '#073642', // Solarized base02
          borderTopColor: '#586e75',
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="capture"
        options={{
          title: 'Capture',
          tabBarIcon: ({ focused }) => <TabBarIcon emoji="⚡" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="scout"
        options={{
          title: 'Scout',
          tabBarIcon: ({ focused }) => <TabBarIcon emoji="🔍" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ focused }) => <TabBarIcon emoji="📅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="mapper"
        options={{
          title: 'Mapper',
          tabBarIcon: ({ focused }) => <TabBarIcon emoji="🗺️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="hunter"
        options={{
          title: 'Hunter',
          tabBarIcon: ({ focused }) => <TabBarIcon emoji="🎯" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
