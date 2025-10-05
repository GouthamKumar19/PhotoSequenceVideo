import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { SelectedPhoto } from '../context/SelectionContext';

const TRANSITION_OFFSET = 36;

const AnimatedImage = Animated.createAnimatedComponent(ImageBackground);

type SlideshowPreviewProps = {
  photos: SelectedPhoto[];
  slideDurationMs?: number;
  transitionDurationMs?: number;
  aspectRatio?: number;
};

const SlideshowPreview: React.FC<SlideshowPreviewProps> = ({
  photos,
  slideDurationMs = 2500,
  transitionDurationMs = 650,
  aspectRatio = 16 / 9,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const transitionProgress = useSharedValue(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentIndexRef = useRef(0);
  const advanceSlideRef = useRef<() => void>(() => {});

  const hasMultiplePhotos = photos.length > 1;

  const containerHeight = useMemo(() => 280, []);
  const containerStyle = useMemo(
    () => ({
      aspectRatio,
      height: containerHeight,
      borderRadius: 16,
    }),
    [aspectRatio, containerHeight]
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback(() => {
    clearTimer();
    if (!hasMultiplePhotos) {
      return;
    }

    timerRef.current = setTimeout(() => {
      advanceSlideRef.current();
    }, slideDurationMs);
  }, [clearTimer, hasMultiplePhotos, slideDurationMs]);

  const advanceSlide = useCallback(() => {
    if (!hasMultiplePhotos) {
      return;
    }

    const nextIndex = (currentIndexRef.current + 1) % photos.length;

    setPreviousIndex(currentIndexRef.current);
    setCurrentIndex(nextIndex);
    currentIndexRef.current = nextIndex;

    transitionProgress.value = 0;
    transitionProgress.value = withTiming(
      1,
      {
        duration: transitionDurationMs,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(scheduleNext)();
        }
      }
    );
  }, [hasMultiplePhotos, photos.length, scheduleNext, transitionDurationMs, transitionProgress]);

  useEffect(() => {
    advanceSlideRef.current = advanceSlide;
  }, [advanceSlide]);

  useEffect(() => {
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    setPreviousIndex(null);
    transitionProgress.value = 1;

    if (photos.length === 0) {
      clearTimer();
      return;
    }

    if (photos.length === 1) {
      clearTimer();
      return;
    }

    scheduleNext();

    return () => {
      clearTimer();
    };
  }, [photos, clearTimer, scheduleNext, transitionProgress]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const previousImageStyle = useAnimatedStyle(() => ({
    opacity: interpolate(transitionProgress.value, [0, 1], [1, 0]),
    transform: [
      {
        translateX: interpolate(
          transitionProgress.value,
          [0, 1],
          [0, -TRANSITION_OFFSET]
        ),
      },
      {
        scale: interpolate(transitionProgress.value, [0, 1], [1, 0.96]),
      },
    ],
  }));

  const currentImageStyle = useAnimatedStyle(() => ({
    opacity: transitionProgress.value,
    transform: [
      {
        translateX: interpolate(
          transitionProgress.value,
          [0, 1],
          [TRANSITION_OFFSET, 0]
        ),
      },
      {
        scale: interpolate(transitionProgress.value, [0, 1], [1.02, 1]),
      },
    ],
  }));

  const currentPhoto = photos[currentIndex];
  const previousPhoto = previousIndex != null ? photos[previousIndex] : undefined;

  return (
    <View style={[styles.frame, { height: containerHeight }]}>
      <View style={[styles.innerFrame, containerStyle]}>
        {previousPhoto && (
          <AnimatedImage
            source={{ uri: previousPhoto.uri }}
            resizeMode="cover"
            style={[styles.image, previousImageStyle]}
          />
        )}
        {currentPhoto && (
          <AnimatedImage
            source={{ uri: currentPhoto.uri }}
            resizeMode="cover"
            style={[styles.image, currentImageStyle]}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerFrame: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#0C1015',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
});

export default SlideshowPreview;
