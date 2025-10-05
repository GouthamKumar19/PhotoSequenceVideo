import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useSelection, type SelectedPhoto } from '../context/SelectionContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Picker'>;

const MIN_PHOTOS = 3;
const MAX_PHOTOS = 5;

const PhotoPickerScreen: React.FC<Props> = ({ navigation }) => {
  const { selectedPhotos, setSelectedPhotos } = useSelection();
  const [permissionStatus, requestPermission] = ImagePicker.useMediaLibraryPermissions();
  const [isRequesting, setIsRequesting] = useState(false);

  const hasEnoughPhotos = selectedPhotos.length >= MIN_PHOTOS;
  const remainingCount = MAX_PHOTOS - selectedPhotos.length;

  useEffect(() => {
    if (!permissionStatus) {
      requestPermission();
      return;
    }

    if (!permissionStatus.granted && !permissionStatus.canAskAgain) {
      Alert.alert(
        'Permission needed',
        'Please enable photo library access in Settings to select images.'
      );
    }
  }, [permissionStatus, requestPermission]);

  const ensurePermission = useCallback(async () => {
    if (permissionStatus?.granted) {
      return true;
    }

    const response = await requestPermission();

    if (!response?.granted) {
      Alert.alert('Permission required', 'Photo library access is needed to pick images.');
      return false;
    }

    return true;
  }, [permissionStatus, requestPermission]);

  const handlePickImages = useCallback(async () => {
    const granted = await ensurePermission();
    if (!granted || isRequesting) {
      return;
    }

    try {
      setIsRequesting(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: MAX_PHOTOS,
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const slicedAssets = result.assets.slice(0, MAX_PHOTOS);
      const mappedAssets: SelectedPhoto[] = slicedAssets.map((asset) => ({
        id: asset.assetId ?? asset.uri,
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        filename: asset.fileName ?? undefined,
      }));

      setSelectedPhotos(mappedAssets);

      if (mappedAssets.length < MIN_PHOTOS) {
        Alert.alert(
          `Select ${MIN_PHOTOS} photos`,
          `Please pick at least ${MIN_PHOTOS} photos to continue.`
        );
      }
    } catch (error) {
      Alert.alert('Could not load photos', 'Something went wrong while opening the gallery.');
    } finally {
      setIsRequesting(false);
    }
  }, [ensurePermission, isRequesting, setSelectedPhotos]);

  const handleContinue = useCallback(() => {
    if (!hasEnoughPhotos) {
      Alert.alert('Not enough photos', `Pick at least ${MIN_PHOTOS} photos to proceed.`);
      return;
    }

    navigation.navigate('Preview');
  }, [hasEnoughPhotos, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select 3-5 photos</Text>
      <Text style={styles.subtitle}>
        Choose photos from your gallery. We will animate them with smooth transitions.
      </Text>

      <Pressable
        style={({ pressed }) => [styles.pickButton, pressed && styles.pickButtonPressed]}
        onPress={handlePickImages}
        disabled={isRequesting}
      >
        <Text style={styles.pickButtonText}>
          {isRequesting ? 'Opening gallery…' : 'Pick photos'}
        </Text>
        <Text style={styles.pickButtonHint}>{`You can choose up to ${MAX_PHOTOS} photos`}</Text>
      </Pressable>

      <View style={styles.selectionSummary}>
        <Text style={styles.selectionText}>{`Selected: ${selectedPhotos.length}`}</Text>
        {!hasEnoughPhotos && (
          <Text style={styles.selectionHint}>{`Pick ${MIN_PHOTOS - selectedPhotos.length} more`}</Text>
        )}
        {hasEnoughPhotos && (
          <Text style={styles.selectionHint}>
            {`Ready to continue${remainingCount > 0 ? ` · ${remainingCount} slots left` : ''}`}
          </Text>
        )}
      </View>

      <FlatList
        style={styles.list}
        horizontal
        data={selectedPhotos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Image source={{ uri: item.uri }} style={styles.previewImage} resizeMode="cover" />
        )}
        contentContainerStyle={styles.listContent}
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyState}>No photos selected yet.</Text>}
      />

      <Button title="Continue to Preview" onPress={handleContinue} disabled={!hasEnoughPhotos} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
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
  pickButton: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#1D9BF0',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  pickButtonPressed: {
    opacity: 0.8,
  },
  pickButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pickButtonHint: {
    marginTop: 4,
    fontSize: 13,
    color: '#E8F5FE',
  },
  selectionSummary: {
    alignItems: 'center',
    gap: 4,
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  selectionHint: {
    fontSize: 14,
    color: '#AAB3C5',
  },
  list: {
    flexGrow: 0,
    width: '100%',
  },
  listContent: {
    gap: 12,
    alignItems: 'center',
  },
  previewImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
  },
  emptyState: {
    fontSize: 14,
    color: '#AAB3C5',
  },
});

export default PhotoPickerScreen;
