import { Tabs } from 'expo-router';
import { Link2, Plus } from 'lucide-react-native';

// Icon component for sub-tabs
const SubTabBarIcon = ({
  Icon,
  color
}: {
  Icon: React.ComponentType<{ color: string; size: number }>;
  color: string;
}) => <Icon color={color} size={20} />;

export default function CaptureLayout() {
  return (
    <Tabs
      initialRouteName="add"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2aa198', // Solarized cyan
        tabBarInactiveTintColor: '#586e75', // Solarized base01
        tabBarStyle: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#073642', // Solarized base02
          borderBottomColor: '#586e75',
          borderBottomWidth: 1,
          height: 44,
          paddingTop: 0,
          paddingBottom: 0,
          paddingHorizontal: 12,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: 44,
          height: 44,
          padding: 0,
          margin: 0,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      <Tabs.Screen
        name="connect"
        options={{
          title: 'Connect',
          tabBarIcon: ({ color }) => <SubTabBarIcon Icon={Link2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color }) => <SubTabBarIcon Icon={Plus} color={color} />,
        }}
      />
    </Tabs>
  );
}
