import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Bell, Shield, LogOut, ChevronRight } from 'lucide-react-native';
import { auth } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { user } = useAuth();
  const [blockingEnabled, setBlockingEnabled] = React.useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace('/login');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Preferences and Account Control</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <Shield color="#52796F" size={20} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Master Blocking Switch</Text>
              <Text style={styles.settingDesc}>Enable/Disable all blocking</Text>
            </View>
            <Switch
              trackColor={{ false: '#EBE7DE', true: '#52796F' }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#EBE7DE"
              onValueChange={setBlockingEnabled}
              value={blockingEnabled}
            />
          </View>

          <View style={[styles.settingRow, styles.lastRow]}>
            <View style={styles.settingIconContainer}>
              <Bell color="#52796F" size={20} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDesc}>Get reminders & achievements</Text>
            </View>
            <Switch
              trackColor={{ false: '#EBE7DE', true: '#52796F' }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#EBE7DE"
              onValueChange={setNotificationsEnabled}
              value={notificationsEnabled}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT ({user?.email || 'Mock User'})</Text>
        <View style={styles.card}>
          <TouchableOpacity style={[styles.settingRow, styles.lastRow]} onPress={handleLogout} activeOpacity={0.7}>
            <View style={[styles.settingIconContainer, { backgroundColor: '#FEE2E2' }]}>
              <LogOut color="#EF4444" size={20} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: '#EF4444' }]}>Log Out</Text>
            </View>
            <ChevronRight color="#A0ABC0" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCF8',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#354F52',
    fontFamily: 'serif',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0ABC0',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A0ABC0',
    marginBottom: 12,
    letterSpacing: 1,
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EBE7DE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F1EA',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  settingIconContainer: {
    backgroundColor: '#E6F0ED',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F3E46',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
    color: '#A0ABC0',
  },
});
