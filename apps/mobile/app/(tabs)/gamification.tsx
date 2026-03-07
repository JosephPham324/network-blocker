import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Trophy, Timer, Zap, Leaf } from 'lucide-react-native';

export default function GamificationScreen() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isFocusing, setIsFocusing] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isFocusing && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isFocusing) {
      setIsFocusing(false);
      alert("Focus Session Complete! +50 Tokens");
    }
    return () => clearInterval(interval);
  }, [isFocusing, timeLeft]);

  const toggleTimer = () => {
    if (!isFocusing) {
      setTimeLeft(25 * 60);
      setIsFocusing(true);
    } else {
      setIsFocusing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Gamification</Text>
        <Text style={styles.subtitle}>Stay focused and earn rewards</Text>
      </View>

      {/* Focus Timer */}
      <View style={styles.timerCard}>
        <View style={styles.timerHeader}>
          <Timer size={24} color="#354F52" />
          <Text style={styles.timerCardTitle}>Focus Session</Text>
        </View>
        <Text style={[styles.timerDisplay, isFocusing && styles.timerDisplayActive]}>
          {formatTime(timeLeft)}
        </Text>
        <TouchableOpacity 
          style={[styles.timerButton, isFocusing && styles.timerButtonActive]} 
          onPress={toggleTimer}
          activeOpacity={0.8}
        >
          <Text style={styles.timerButtonText}>
            {isFocusing ? 'Give Up' : 'Start Focus'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🌱</Text>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>TREES PLANTED</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>DAY STREAK</Text>
        </View>
      </View>

      {/* Token Shop Preview */}
      <View style={styles.shopCard}>
        <View style={styles.shopHeader}>
          <View style={styles.shopTitleRow}>
            <Trophy size={20} color="#354F52" />
            <Text style={styles.shopTitle}>Token Shop</Text>
          </View>
          <View style={styles.balanceBadge}>
            <Text style={styles.balanceText}>150 🪙</Text>
          </View>
        </View>

        <View style={styles.shopItem}>
          <View style={styles.shopItemIcon}>
            <Zap size={24} color="#E29578" />
          </View>
          <View style={styles.shopItemContent}>
            <Text style={styles.shopItemTitle}>Focus Boost</Text>
            <Text style={styles.shopItemDesc}>Double token re-wards for 1 hour</Text>
          </View>
          <Text style={styles.shopItemCost}>50 🪙</Text>
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
  timerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBE7DE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  timerCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#354F52',
  },
  timerDisplay: {
    fontSize: 64,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#354F52',
    marginBottom: 24,
  },
  timerDisplayActive: {
    color: '#E29578',
  },
  timerButton: {
    backgroundColor: '#354F52',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 32,
    shadowColor: '#354F52',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  timerButtonActive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  timerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBE7DE',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#52796F',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A0ABC0',
    marginTop: 4,
    letterSpacing: 1,
  },
  shopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#EBE7DE',
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  shopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shopTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#354F52',
    fontFamily: 'serif',
  },
  balanceBadge: {
    backgroundColor: '#52796F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  balanceText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FDFCF8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EBE7DE',
  },
  shopItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EBE7DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  shopItemContent: {
    flex: 1,
  },
  shopItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F3E46',
    marginBottom: 4,
  },
  shopItemDesc: {
    fontSize: 12,
    color: '#5C6B73',
  },
  shopItemCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#52796F',
  },
});
