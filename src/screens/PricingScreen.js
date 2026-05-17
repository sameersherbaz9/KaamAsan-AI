import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Divider, useTheme } from 'react-native-paper';

export default function PricingScreen({ route, navigation }) {
  const { provider, intent } = route.params;
  const theme = useTheme();

  const baseRate = provider.base_rate;
  const platformFee = Math.round(baseRate * 0.05); // 5% fee
  const tax = Math.round((baseRate + platformFee) * 0.16); // 16% tax
  const total = baseRate + platformFee + tax;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Pricing Breakdown
      </Text>

      <Card style={styles.card} mode="elevated">
        <Card.Title title={`Provider: ${provider.name}`} subtitle={`Service: ${intent.service_type}`} />
        <Card.Content>
          <View style={styles.row}>
            <Text variant="bodyLarge" style={styles.label}>Base Rate</Text>
            <Text variant="bodyLarge" style={styles.value}>Rs. {baseRate}</Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.row}>
            <Text variant="bodyLarge" style={styles.label}>Platform Fee (5%)</Text>
            <Text variant="bodyLarge" style={styles.value}>Rs. {platformFee}</Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.row}>
            <Text variant="bodyLarge" style={styles.label}>Tax (16%)</Text>
            <Text variant="bodyLarge" style={styles.value}>Rs. {tax}</Text>
          </View>
          <Divider style={styles.divider} thickness={2} />

          <View style={styles.row}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Total Estimated Cost</Text>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Rs. {total}</Text>
          </View>
        </Card.Content>
      </Card>

      <Text variant="bodyMedium" style={styles.note}>
        Note: The final price may vary based on the actual work required on-site.
      </Text>

      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('Booking', { provider, intent, total })}
        style={styles.button}
      >
        Confirm & Book
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  label: {
    color: '#555',
  },
  value: {
    fontWeight: '500',
  },
  divider: {
    marginVertical: 5,
  },
  note: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  button: {
    paddingVertical: 8,
  }
});
