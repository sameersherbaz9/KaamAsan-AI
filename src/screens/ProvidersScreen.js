import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, Avatar, useTheme, Chip } from 'react-native-paper';
import providersData from '../data/providers.json';

export default function ProvidersScreen({ route, navigation }) {
  const { intent } = route.params;
  const theme = useTheme();
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    // Filter and rank providers based on intent
    const filtered = providersData.filter(p => 
      p.service.includes(intent.service_type) && 
      p.location.area === intent.location
    );

    // AI Ranking Logic Mockup: (Rating * 10) + (On-time Score * 0.5) - (Cancellation * 2)
    const ranked = filtered.map(p => {
      const score = (p.rating * 10) + (p.on_time_score * 0.5) - (p.cancellation_rate * 2);
      let reasoning = "";
      if (p.rating >= 4.8) reasoning = "Highly rated by users in your area.";
      else if (p.on_time_score > 90) reasoning = "Excellent punctuality record.";
      else reasoning = "Good overall performance.";
      
      return { ...p, aiScore: score.toFixed(1), reasoning };
    }).sort((a, b) => b.aiScore - a.aiScore);

    // If no exact match, fallback to some default providers just to show the UI
    if (ranked.length === 0) {
      const fallback = providersData.slice(0, 3).map(p => ({
        ...p, aiScore: 85.0, reasoning: "Alternative provider available."
      }));
      setProviders(fallback);
    } else {
      setProviders(ranked);
    }
  }, [intent]);

  const renderProvider = ({ item }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Title
        title={item.name}
        subtitle={`${item.experience_years} years exp | ${item.reviews_count} reviews`}
        left={(props) => <Avatar.Icon {...props} icon="account-wrench" style={{ backgroundColor: theme.colors.primaryContainer }} />}
      />
      <Card.Content>
        <View style={styles.row}>
          <Chip icon="star" style={styles.chip}>{item.rating}</Chip>
          <Chip icon="clock-check-outline" style={styles.chip}>{item.on_time_score}% On-Time</Chip>
        </View>
        <Text variant="bodyMedium" style={styles.reasoning}>
          <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>AI Match: </Text>
          {item.reasoning}
        </Text>
        <Text variant="titleMedium" style={styles.price}>Base Rate: Rs. {item.base_rate}</Text>
      </Card.Content>
      <Card.Actions>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('Pricing', { provider: item, intent })}
        >
          Select
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Recommended Providers</Text>
      <FlatList
        data={providers}
        keyExtractor={item => item.id}
        renderItem={renderProvider}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    padding: 20,
    fontWeight: 'bold',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
  },
  row: {
    flexDirection: 'row',
    marginVertical: 10,
    gap: 10,
  },
  chip: {
    backgroundColor: '#e3f2fd',
  },
  reasoning: {
    marginTop: 5,
    fontStyle: 'italic',
    color: '#555',
  },
  price: {
    marginTop: 10,
    fontWeight: 'bold',
  }
});
