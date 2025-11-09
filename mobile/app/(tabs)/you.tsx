/**
 * You Tab - Profile, Settings, and Account Management
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  User,
  Settings,
  Shield,
  BarChart3,
  Bell,
  Palette,
  Lock,
  Mail,
  HelpCircle,
  ChevronRight,
} from 'lucide-react-native';
import { THEME } from '@/src/theme/colors';
import ProfileSwitcher from '@/components/ProfileSwitcher';
import { useProfile } from '@/src/contexts/ProfileContext';

export default function YouScreen() {
  const { activeProfile, setActiveProfile } = useProfile();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userEmail}>john.doe@example.com</Text>
        </View>

        {/* Profile Switcher */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Profile</Text>
          <ProfileSwitcher selectedProfile={activeProfile} onProfileChange={setActiveProfile} />
        </View>

        {/* Statistics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Statistics</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${THEME.green}30` }]}>
                <BarChart3 size={24} color={THEME.green} />
              </View>
              <Text style={styles.statNumber}>47</Text>
              <Text style={styles.statLabel}>Tasks Completed</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${THEME.cyan}30` }]}>
                <BarChart3 size={24} color={THEME.cyan} />
              </View>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${THEME.yellow}30` }]}>
                <BarChart3 size={24} color={THEME.yellow} />
              </View>
              <Text style={styles.statNumber}>8.2</Text>
              <Text style={styles.statLabel}>Avg Daily Tasks</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${THEME.violet}30` }]}>
                <BarChart3 size={24} color={THEME.violet} />
              </View>
              <Text style={styles.statNumber}>92%</Text>
              <Text style={styles.statLabel}>Completion Rate</Text>
            </View>
          </View>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>

          <View style={styles.settingsGroup}>
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <Palette size={20} color={THEME.base0} />
                <Text style={styles.settingText}>Theme</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>Dark</Text>
                <ChevronRight size={20} color={THEME.base01} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <Bell size={20} color={THEME.base0} />
                <Text style={styles.settingText}>Notifications</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>On</Text>
                <ChevronRight size={20} color={THEME.base01} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <Settings size={20} color={THEME.base0} />
                <Text style={styles.settingText}>Preferences</Text>
              </View>
              <ChevronRight size={20} color={THEME.base01} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.settingsGroup}>
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <Mail size={20} color={THEME.base0} />
                <Text style={styles.settingText}>Email</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>john.doe@...</Text>
                <ChevronRight size={20} color={THEME.base01} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <Lock size={20} color={THEME.base0} />
                <Text style={styles.settingText}>Password</Text>
              </View>
              <ChevronRight size={20} color={THEME.base01} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <Shield size={20} color={THEME.base0} />
                <Text style={styles.settingText}>Security</Text>
              </View>
              <ChevronRight size={20} color={THEME.base01} />
            </TouchableOpacity>
          </View>
        </View>

        {/* About/Help Section */}
        <View style={styles.section}>
          <View style={styles.settingsGroup}>
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <HelpCircle size={20} color={THEME.base0} />
                <Text style={styles.settingText}>Help & Support</Text>
              </View>
              <ChevronRight size={20} color={THEME.base01} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Version Info */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Proxy Agent v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.base03,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for tab bar
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.base02,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: THEME.green,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.base0,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: THEME.base01,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.base01,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: THEME.base02,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: THEME.base0,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: THEME.base01,
    textAlign: 'center',
  },
  settingsGroup: {
    backgroundColor: THEME.base02,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.base01,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingText: {
    fontSize: 15,
    color: THEME.base0,
  },
  settingValue: {
    fontSize: 14,
    color: THEME.base01,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 12,
    color: THEME.base01,
  },
});
