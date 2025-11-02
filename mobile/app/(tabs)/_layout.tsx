import { Tabs } from 'expo-router';
import { Plus, Search, Target, Calendar } from 'lucide-react-native';
import { View, Text } from 'react-native';
import { useProfile } from '@/src/contexts/ProfileContext';
import { Svg, Path } from 'react-native-svg';

// Arrow-shaped tab icon (|>)
const TabBarIcon = ({
  Icon,
  color,
  focused
}: {
  Icon: React.ComponentType<{ color: string; size: number }>;
  color: string;
  focused: boolean;
}) => {
  const width = 60;
  const height = 44;

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Arrow shape: |> */}
        <Path
          d={`
            M 4 4
            L ${width - 10} 4
            L ${width - 4} ${height / 2}
            L ${width - 10} ${height - 4}
            L 4 ${height - 4}
            Z
          `}
          fill={focused ? `${color}33` : 'transparent'}
          stroke={color}
          strokeWidth={focused ? 2 : 1}
        />
      </Svg>
      <View style={{ position: 'absolute' }}>
        <Icon color={color} size={20} />
      </View>
    </View>
  );
};

// Calendar icon with current day number overlaid - with arrow shape
const CalendarWithDate = ({ color, focused }: { color: string; focused: boolean }) => {
  const currentDay = new Date().getDate();
  const width = 60;
  const height = 44;

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Arrow shape: |> */}
        <Path
          d={`
            M 4 4
            L ${width - 10} 4
            L ${width - 4} ${height / 2}
            L ${width - 10} ${height - 4}
            L 4 ${height - 4}
            Z
          `}
          fill={focused ? `${color}33` : 'transparent'}
          stroke={color}
          strokeWidth={focused ? 2 : 1}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        <Calendar color={color} size={20} />
        <Text
          style={{
            position: 'absolute',
            color: color,
            fontSize: 8,
            fontWeight: '700',
            top: 7,
          }}
        >
          {currentDay}
        </Text>
      </View>
    </View>
  );
};

// Profile avatar with initials - with arrow shape
const ProfileAvatar = ({ color, focused }: { color: string; focused: boolean }) => {
  const { activeProfile } = useProfile();
  const width = 60;
  const height = 44;

  const getInitials = (profile: string) => {
    switch (profile) {
      case 'personal':
        return 'P';
      case 'lionmotel':
        return 'LM';
      case 'aiservice':
        return 'AI';
      default:
        return 'P';
    }
  };

  const initials = getInitials(activeProfile);

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Arrow shape: |> */}
        <Path
          d={`
            M 4 4
            L ${width - 10} 4
            L ${width - 4} ${height / 2}
            L ${width - 10} ${height - 4}
            L 4 ${height - 4}
            Z
          `}
          fill={focused ? `${color}33` : 'transparent'}
          stroke={color}
          strokeWidth={focused ? 2 : 1}
        />
      </Svg>
      <View
        style={{
          position: 'absolute',
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 1.5,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
        }}
      >
        <Text
          style={{
            color: color,
            fontSize: 9,
            fontWeight: '700',
            textAlign: 'center',
          }}
        >
          {initials}
        </Text>
      </View>
    </View>
  );
};

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
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="capture"
        options={{
          title: 'Capture',
          tabBarIcon: ({ color, focused }) => <TabBarIcon Icon={Plus} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="scout"
        options={{
          title: 'Scout',
          tabBarIcon: ({ color, focused }) => <TabBarIcon Icon={Search} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="hunter"
        options={{
          title: 'Hunter',
          tabBarIcon: ({ color, focused }) => <TabBarIcon Icon={Target} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => <CalendarWithDate color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="mapper"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <ProfileAvatar color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
