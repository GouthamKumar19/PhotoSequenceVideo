import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Button, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useSelection } from '../context/SelectionContext';
import SlideshowPreview from '../components/SlideshowPreview';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

const DEFAULT_AUDIO = require('../../assets/audio/default-track.wav');

const PreviewScreen: React.FC<Props> = ({ navigation }) => {
  const { selectedPhotos } = useSelection();
  const hasPhotos = selectedPhotos.length >= 3;
  const estimatedDuration = useMemo(() => selectedPhotos.length * 2.5, [selectedPhotos.length]);
  const [audioReady, setAudioReady] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const unloadSound = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch (error) {
        // Swallow unload edge cases; preview screen is best-effort.
      }
      soundRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    return () => {
      unloadSound();
    };
  }, [unloadSound]);

  React.useEffect(() => {
    let isMounted = true;

    const prepareSound = async () => {
      if (!hasPhotos) {
        setAudioReady(false);
        setIsPlaying(false);
        if (soundRef.current) {
          try {
            await soundRef.current.stopAsync();
            await soundRef.current.setPositionAsync(0);
          } catch (error) {
            // ignore reset issues
          }
        }
        return;
      }

      if (soundRef.current) {
        setAudioReady(true);
        return;
      }

      setAudioLoading(true);
      try {
        const { sound } = await Audio.Sound.createAsync(DEFAULT_AUDIO, {
          volume: 0.7,
          isLooping: true,
        });

        if (!isMounted) {
          await sound.unloadAsync();
          return;
        }

        soundRef.current = sound;
        setAudioReady(true);
      } catch (error) {
        if (isMounted) {
          setAudioReady(false);
        }
      } finally {
        if (isMounted) {
          setAudioLoading(false);
        }
      }
    };

    prepareSound();

    return () => {
      isMounted = false;
    };
  }, [hasPhotos]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const playOnFocus = async () => {
        if (!hasPhotos || !audioReady || !soundRef.current) {
          return;
        }

        try {
          await soundRef.current.playAsync();
          if (isActive) {
            setIsPlaying(true);
          }
        } catch (error) {
          if (isActive) {
            setIsPlaying(false);
          }
        }
      };

      playOnFocus();

      return () => {
        isActive = false;
        if (soundRef.current) {
          soundRef.current.pauseAsync();
        }
        setIsPlaying(false);
      };
    }, [audioReady, hasPhotos])
  );

  const handleToggleAudio = useCallback(async () => {
    if (!soundRef.current || !audioReady) {
      return;
    }

    try {
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) {
        return;
      }

      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      // toggle failure is non-fatal for preview
    }
  }, [audioReady]);

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
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryHeading}>{`Photos: ${selectedPhotos.length}`}</Text>
            <Text style={styles.summaryText}>{`Estimated length: ${estimatedDuration.toFixed(1)}s`}</Text>
            <Text style={styles.summaryText}>Transitions and audio will be applied here.</Text>
          </View>

          <SlideshowPreview photos={selectedPhotos} />

          <View style={styles.audioRow}>
            <View>
              <Text style={styles.audioLabel}>Background track</Text>
              <Text style={styles.audioStatus}>
                {audioLoading
                  ? 'Loading…'
                  : audioReady
                  ? isPlaying
                    ? 'Playing'
                    : 'Paused'
                  : 'Audio unavailable'}
              </Text>
            </View>
            <Button
              title={isPlaying ? 'Pause music' : 'Play music'}
              onPress={handleToggleAudio}
              disabled={!audioReady || audioLoading}
            />
          </View>
        </>
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
  audioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#11161E',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  audioLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  audioStatus: {
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
