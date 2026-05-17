import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, useTheme } from 'react-native-paper';

export default function HomeScreen({ navigation }) {
  const [request, setRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleProcessRequest = () => {
    if (!request.trim()) return;
    setLoading(true);
    
    // Simulate AI parsing delay
    setTimeout(() => {
      setLoading(false);
      // Mock parsing result based on the user's requirements
      const mockParsedIntent = {
        service_type: request.toLowerCase().includes('ac') ? 'AC Repair' : 
                      request.toLowerCase().includes('clean') ? 'Cleaning' : 
                      request.toLowerCase().includes('plumb') ? 'Plumbing' : 
                      request.toLowerCase().includes('electric') ? 'Electrical' : 'Tutoring',
        location: request.includes('G-10') ? 'G-10' : 
                  request.includes('G-11') ? 'G-11' :
                  request.includes('G-13') ? 'G-13' :
                  request.includes('F-10') ? 'F-10' :
                  request.includes('I-8') ? 'I-8' : 'F-7',
        urgency: request.toLowerCase().includes('jaldi') || request.toLowerCase().includes('urgent') ? 'High' : 'Normal',
        preferred_time: 'Today afternoon',
        confidence_score: 92
      };
      navigation.navigate('Understanding', { intent: mockParsedIntent });
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
            ServiceOrchestrator
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Your AI-Powered Service Booking Platform
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            label="What do you need help with?"
            placeholder="e.g., Mera AC theek karna hai G-10 mein"
            value={request}
            onChangeText={setRequest}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />
          {loading ? (
            <ActivityIndicator animating={true} size="large" style={styles.loader} />
          ) : (
            <Button 
              mode="contained" 
              onPress={handleProcessRequest} 
              style={styles.button}
              disabled={!request.trim()}
            >
              Analyze Request
            </Button>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  subtitle: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#fff'
  },
  button: {
    paddingVertical: 8,
  },
  loader: {
    marginVertical: 10,
  }
});
