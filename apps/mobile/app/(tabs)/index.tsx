import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BarChart3, Clock, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useBlockRules } from '../../hooks/useBlockRules';

export default function DashboardScreen() {
  const { user } = useAuth();
  const stats = useAnalytics(user);
  const { rules } = useBlockRules(user);

  const rulesActiveCount = rules ? rules.filter((r: any) => r.is_active).length : 0;
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Focus</Text>
        <Text style={styles.subtitle}>Overview of your digital habits</Text>
      </View>

      <View style={styles.statsContainer}>
        {/* Rules Active Card */}
        <View style={styles.cardWhite}>
          <View style={styles.cardHeader}>
            <ShieldCheck size={24} color="#52796F" />
          </View>
          <Text style={styles.statValueEmerald}>{rulesActiveCount}</Text>
          <Text style={styles.statLabel}>RULES ACTIVE</Text>
        </View>

        {/* Time Saved Card */}
        <View style={styles.cardPrimary}>
          <View style={styles.cardHeader}>
            <Clock size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.statValueWhite}>{stats.time_saved_minutes}m</Text>
          <Text style={styles.statLabelWhite}>TIME SAVED TODAY</Text>
        </View>
      </View>

      <View style={styles.analysisContainer}>
        <View style={styles.analysisIconContainer}>
          <BarChart3 size={48} color="#EBE7DE" />
        </View>
        <Text style={styles.analysisTitle}>Weekly Analysis</Text>
        <Text style={styles.analysisDesc}>
          Your focus sessions have increased by 20% compared to last week. Keep up the good work!
        </Text>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  cardWhite: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBE7DE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPrimary: {
    flex: 1,
    backgroundColor: '#52796F',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#52796F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    marginBottom: 16,
  },
  statValueEmerald: {
    fontSize: 48,
    fontWeight: '800',
    color: '#52796F',
    marginBottom: 4,
  },
  statValueWhite: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A0ABC0',
    letterSpacing: 1,
  },
  statLabelWhite: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  analysisContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBE7DE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  analysisIconContainer: {
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'serif',
    color: '#354F52',
    marginBottom: 8,
  },
  analysisDesc: {
    fontSize: 14,
    color: '#A0ABC0',
    textAlign: 'center',
    lineHeight: 22,
  },
});
