import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

export type Profile = 'personal' | 'lionmotel' | 'aiservice';

export interface ProfileSwitcherProps {
  selectedProfile: Profile;
  onProfileChange: (profile: Profile) => void;
}

const PROFILES = {
  personal: { label: 'Personal', icon: '👤' },
  lionmotel: { label: 'Lion Motel', icon: '🏨' },
  aiservice: { label: 'AI Service', icon: '🤖' },
};

const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({
  selectedProfile,
  onProfileChange,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Profile</Text>

      <TouchableOpacity
        style={styles.selector}
        onPress={() => setShowMenu(!showMenu)}
      >
        <View style={styles.selectedInfo}>
          <Text style={styles.emoji}>{PROFILES[selectedProfile].icon}</Text>
          <Text style={styles.text}>{PROFILES[selectedProfile].label}</Text>
        </View>
        <ChevronDown color="#586e75" size={20} />
      </TouchableOpacity>

      {showMenu && (
        <View style={styles.menu}>
          {(Object.keys(PROFILES) as Profile[]).map((profile) => (
            <TouchableOpacity
              key={profile}
              style={[
                styles.menuItem,
                selectedProfile === profile && styles.menuItemActive
              ]}
              onPress={() => {
                onProfileChange(profile);
                setShowMenu(false);
              }}
            >
              <Text style={styles.emoji}>{PROFILES[profile].icon}</Text>
              <Text style={[
                styles.menuText,
                selectedProfile === profile && styles.menuTextActive
              ]}>
                {PROFILES[profile].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
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
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#586e75',
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#93a1a1',
  },
  menu: {
    marginTop: 8,
    backgroundColor: '#073642',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#586e75',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#586e75',
  },
  menuItemActive: {
    backgroundColor: '#2aa19822',
  },
  menuText: {
    fontSize: 16,
    color: '#93a1a1',
  },
  menuTextActive: {
    color: '#2aa198',
    fontWeight: '600',
  },
});

export default ProfileSwitcher;
