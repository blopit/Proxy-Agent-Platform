import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ProfileSwitcher from '../../components/ProfileSwitcher';
import { useProfile } from '@/src/contexts/ProfileContext';

export default function MapperScreen() {
  const { activeProfile, setActiveProfile } = useProfile();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🗺️</Text>
          <Text style={styles.title}>Mapper Mode</Text>
          <Text style={styles.subtitle}>
            Big picture view & planning
          </Text>
        </View>

        {/* Profile Switcher */}
        <ProfileSwitcher
          selectedProfile={activeProfile}
          onProfileChange={setActiveProfile}
        />

        {/* Profile-specific content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Overview - {activeProfile === 'personal' ? 'Personal' : activeProfile === 'lionmotel' ? 'Lion Motel' : 'AI Service'}
          </Text>

          {/* Stats placeholder */}
          <View style={styles.card}>
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Tasks</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
          </View>

          {/* Weekly progress placeholder */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weekly Progress</Text>
            <Text style={styles.cardDescription}>
              Visualize your task landscape and dependencies.{'\n'}
              Perfect for weekly planning sessions.
            </Text>
          </View>

          {/* Zones placeholder */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Task Zones</Text>
            <View style={styles.zoneList}>
              <View style={styles.zoneItem}>
                <Text style={styles.zoneEmoji}>🔥</Text>
                <Text style={styles.zoneText}>Main Focus</Text>
                <Text style={styles.zoneCount}>4</Text>
              </View>
              <View style={styles.zoneItem}>
                <Text style={styles.zoneEmoji}>⚡</Text>
                <Text style={styles.zoneText}>Urgent Today</Text>
                <Text style={styles.zoneCount}>2</Text>
              </View>
              <View style={styles.zoneItem}>
                <Text style={styles.zoneEmoji}>🎯</Text>
                <Text style={styles.zoneText}>Quick Wins</Text>
                <Text style={styles.zoneCount}>6</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002b36',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for tab bar
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6c71c4', // Solarized violet
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#93a1a1',
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#93a1a1',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#073642', // Solarized base02
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#586e75',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6c71c4',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#839496',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#93a1a1',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#839496',
    lineHeight: 20,
  },
  zoneList: {
    gap: 12,
  },
  zoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  zoneEmoji: {
    fontSize: 24,
  },
  zoneText: {
    flex: 1,
    fontSize: 15,
    color: '#93a1a1',
  },
  zoneCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c71c4',
    backgroundColor: 'rgba(108, 113, 196, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 36,
    textAlign: 'center',
  },
});
