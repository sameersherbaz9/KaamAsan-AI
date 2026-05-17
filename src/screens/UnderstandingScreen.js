import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme, Divider, ProgressBar } from 'react-native-paper';

export default function UnderstandingScreen({ route, navigation }) {
  const { intent } = route.params;
  const theme = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Here's what we understood
      </Text>

      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.row}>
            <Text variant="labelLarge" style={styles.label}>Service Type</Text>
            <Text variant="bodyLarge" style={styles.value}>{intent.service_type}</Text>
          </View>
          <Divider style={styles.divider} />
          
          <View style={styles.row}>
            <Text variant="labelLarge" style={styles.label}>Location</Text>
            <Text variant="bodyLarge" style={styles.value}>{intent.location}</Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.row}>
            <Text variant="labelLarge" style={styles.label}>Urgency</Text>
            <Text variant="bodyLarge" style={[styles.value, { color: intent.urgency === 'High' ? theme.colors.error : theme.colors.primary }]}>
              {intent.urgency}
            </Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.row}>
            <Text variant="labelLarge" style={styles.label}>Preferred Time</Text>
            <Text variant="bodyLarge" style={styles.value}>{intent.preferred_time}</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.confidenceContainer}>
        <Text variant="bodyMedium" style={styles.confidenceText}>
          AI Confidence: {intent.confidence_score}%
        </Text>
        <ProgressBar progress={intent.confidence_score / 100} color={theme.colors.primary} style={styles.progressBar} />
      </View>

      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('Providers', { intent })}
        style={styles.button}
      >
        Find Best Providers
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
    marginBottom: 30,
    backgroundColor: '#f8f9fa',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  label: {
    color: '#666',
  },
  value: {
    fontWeight: '500',
  },
  divider: {
    marginVertical: 5,
  },
  confidenceContainer: {
    marginBottom: 30,
  },
  confidenceText: {
    marginBottom: 10,
    textAlign: 'center',
    color: '#555',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    paddingVertical: 8,
  }
});
