import React, { useMemo } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useSelection } from '../context/SelectionContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Export'>;

const ExportScreen: React.FC<Props> = ({ navigation }) => {
  const { selectedPhotos, resetSelection } = useSelection();
  const readyToExport = selectedPhotos.length >= 3;
  const estimatedDuration = useMemo(() => selectedPhotos.length * 2.5, [selectedPhotos.length]);

  const handleRestart = () => {
    resetSelection();
    navigation.navigate('Picker');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Export Video</Text>
      <Text style={styles.subtitle}>
        Rendering will export transitions with background music into an MP4 file.
      </Text>

      {!readyToExport && (
        <Text style={styles.warning}>
          Add at least three photos to build a video. Return to the picker to choose images.
        </Text>
      )}

      {readyToExport && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeading}>{`Photos queued: ${selectedPhotos.length}`}</Text>
          <Text style={styles.summaryText}>{`Estimated length: ${estimatedDuration.toFixed(1)}s`}</Text>
          <Text style={styles.summaryText}>Export pipeline will merge transitions with audio here.</Text>
        </View>
      )}

      <View style={styles.actions}>
        <Button title="Start Over" onPress={handleRestart} />
        <Button title="Export (coming soon)" onPress={() => {}} disabled={!readyToExport} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  warning: {
    fontSize: 16,
    color: '#F2B8B5',
  },
  summaryCard: {
    backgroundColor: '#11161E',
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  summaryHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  summaryText: {
    fontSize: 14,
    color: '#C0C6D4',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
});

export default ExportScreen;
