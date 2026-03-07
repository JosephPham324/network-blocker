import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Plus, Globe } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useBlockRules } from '../../hooks/useBlockRules';

export default function BlockListScreen() {
  const { user } = useAuth();
  const { rules, toggleRule } = useBlockRules(user);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Block Rules</Text>
        <Text style={styles.subtitle}>Manage your digital boundaries</Text>
      </View>

      <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
        <Plus color="#FFFFFF" size={24} />
        <Text style={styles.addButtonText}>Add New Rule</Text>
      </TouchableOpacity>

      <View style={styles.listContainer}>
        {rules.map((rule) => (
          <View key={rule.id} style={styles.ruleItem}>
            <View style={styles.ruleIconContainer}>
              <Globe color="#5C6B73" size={20} />
            </View>
            <View style={styles.ruleDetails}>
              <Text style={styles.ruleDomain}>{rule.domain}</Text>
              <Text style={styles.ruleGroup}>{rule.group || 'General'}</Text>
            </View>
            <Switch
              trackColor={{ false: '#EBE7DE', true: '#52796F' }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#EBE7DE"
              onValueChange={() => toggleRule(rule.id, rule.is_active)}
              value={rule.is_active}
            />
          </View>
        ))}
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
  addButton: {
    backgroundColor: '#52796F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#52796F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  listContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EBE7DE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F1EA',
  },
  ruleIconContainer: {
    backgroundColor: '#F4F1EA',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  ruleDetails: {
    flex: 1,
  },
  ruleDomain: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F3E46',
    marginBottom: 4,
  },
  ruleGroup: {
    fontSize: 12,
    color: '#A0ABC0',
  },
});
