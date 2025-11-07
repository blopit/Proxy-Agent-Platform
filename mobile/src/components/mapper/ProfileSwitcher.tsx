import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Profile } from '@/src/contexts/ProfileContext';
import { Text } from '@/src/components/ui/Text';

interface ProfileSwitcherProps {
  selectedProfile: Profile;
  onProfileChange: (profile: Profile) => void;
  compact?: boolean;
}

export function ProfileSwitcher({
  selectedProfile,
  onProfileChange,
  compact = false,
}: ProfileSwitcherProps) {
  const [showMenu, setShowMenu] = useState(false);

  const profiles = {
    personal: { label: 'Personal', icon: '👤', color: '#268bd2' },
    lionmotel: { label: 'Lion Motel', icon: '🏨', color: '#cb4b16' },
    aiservice: { label: 'AI Service', icon: '🤖', color: '#6c71c4' },
  };

  const handleSelect = (profile: Profile) => {
    onProfileChange(profile);
    setShowMenu(false);
  };

  return (
    <View style={styles.container}>
      {!compact && (
        <Text style={styles.label}>Active Profile</Text>
      )}

      <TouchableOpacity
        style={[
          styles.selector,
          compact && styles.selectorCompact,
        ]}
        onPress={() => setShowMenu(!showMenu)}
      >
        <View style={styles.profileInfo}>
          <Text style={[
            styles.emoji,
            compact && styles.emojiCompact,
          ]}>
            {profiles[selectedProfile].icon}
          </Text>
          <Text style={[
            styles.text,
            compact && styles.textCompact,
          ]}>
            {profiles[selectedProfile].label}
          </Text>
        </View>
        <ChevronDown
          color="#586e75"
          size={compact ? 16 : 20}
        />
      </TouchableOpacity>

      {showMenu && (
        <View style={styles.menu}>
          {(Object.keys(profiles) as Profile[]).map((profile) => (
            <TouchableOpacity
              key={profile}
              style={[
                styles.menuItem,
                selectedProfile === profile && styles.menuItemActive,
              ]}
              onPress={() => handleSelect(profile)}
            >
              <Text style={styles.emoji}>{profiles[profile].icon}</Text>
              <View style={styles.menuItemContent}>
                <Text style={[
                  styles.menuText,
                  selectedProfile === profile && styles.menuTextActive,
                ]}>
                  {profiles[profile].label}
                </Text>
                {selectedProfile === profile && (
                  <View style={[
                    styles.activeDot,
                    { backgroundColor: profiles[profile].color }
                  ]} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#586e75',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#073642',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#586e75',
  },
  selectorCompact: {
    padding: 10,
    borderRadius: 8,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emoji: {
    fontSize: 24,
  },
  emojiCompact: {
    fontSize: 18,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#93a1a1',
  },
  textCompact: {
    fontSize: 14,
  },
  menu: {
    marginTop: 8,
    backgroundColor: '#073642',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#586e75',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(88, 110, 117, 0.3)',
  },
  menuItemActive: {
    backgroundColor: 'rgba(42, 161, 152, 0.1)',
  },
  menuItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuText: {
    fontSize: 16,
    color: '#93a1a1',
  },
  menuTextActive: {
    color: '#2aa198',
    fontWeight: '600',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
