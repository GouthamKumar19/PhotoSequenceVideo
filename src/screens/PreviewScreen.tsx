import React, { useMemo } from 'react';
import { Button, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useSelection } from '../context/SelectionContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

const PreviewScreen: React.FC<Props> = ({ navigation }) => {
  const { selectedPhotos } = useSelection();
  const hasPhotos = selectedPhotos.length >= 3;
  const estimatedDuration = useMemo(() => selectedPhotos.length * 2.5, [selectedPhotos.length]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Preview Slideshow</Text>
      <Text style={styles.subtitle}>
        Preview the sequence and transitions before exporting the final video.
      </Text>

      {!hasPhotos && (
        <Text style={styles.emptyState}>
          No photos selected. Please go back and pick at least three images.
        </Text>
      )}

      {hasPhotos && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeading}>{`Photos: ${selectedPhotos.length}`}</Text>
          <Text style={styles.summaryText}>{`Estimated length: ${estimatedDuration.toFixed(1)}s`}</Text>
          <Text style={styles.summaryText}>Transitions and audio will be applied here.</Text>
        </View>
      )}

      <FlatList
        data={selectedPhotos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.previewItem}>
            <Image source={{ uri: item.uri }} style={styles.previewImage} resizeMode="cover" />
            <View style={styles.captionContainer}>
              <Text style={styles.captionText}>{item.filename ?? 'Unnamed photo'}</Text>
              <Text style={styles.captionMeta}>{`${item.width ?? '–'} x ${item.height ?? '–'}`}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={null}
      />

      <View style={styles.ctaRow}>
        <Button title="Back to Picker" onPress={() => navigation.navigate('Picker')} />
        <Button
          title="Continue to Export"
          onPress={() => navigation.navigate('Export')}
          disabled={!hasPhotos}
        />
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
  emptyState: {
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
  listContent: {
    gap: 12,
  },
  previewItem: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#11161E',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  previewImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  captionContainer: {
    flex: 1,
    gap: 4,
  },
  captionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  captionMeta: {
    fontSize: 13,
    color: '#AAB3C5',
  },
  ctaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});

export default PreviewScreen;
