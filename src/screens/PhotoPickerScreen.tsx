import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Picker'>;

const PhotoPickerScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select 3-5 photos</Text>
      <Text style={styles.subtitle}>
        Placeholder UI for picking images from the device gallery.
      </Text>
      <Button title="Continue to Preview" onPress={() => navigation.navigate('Preview')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0E1116',
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#C0C6D4',
    textAlign: 'center',
  },
});

export default PhotoPickerScreen;
