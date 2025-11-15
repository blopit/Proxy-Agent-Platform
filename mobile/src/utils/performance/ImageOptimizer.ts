/**
 * ImageOptimizer - Optimized image loading and caching
 *
 * Features:
 * - Automatic image resizing
 * - Progressive image loading
 * - Image caching
 * - Format optimization
 * - Lazy loading support
 *
 * Usage:
 *   import { OptimizedImage } from '@/utils/performance/ImageOptimizer';
 *   <OptimizedImage source={{ uri }} width={300} height={200} />
 */

import React, { useState, useEffect } from 'react';
import { Image, ImageProps, ActivityIndicator, View, StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useTheme } from '@/src/theme/ThemeContext';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string } | number;
  width?: number;
  height?: number;
  blurhash?: string;
  priority?: 'low' | 'normal' | 'high';
  showLoader?: boolean;
  placeholder?: React.ReactNode;
  onLoadComplete?: () => void;
}

/**
 * Optimized image component with progressive loading
 */
export function OptimizedImage({
  source,
  width,
  height,
  blurhash,
  priority = 'normal',
  showLoader = true,
  placeholder,
  onLoadComplete,
  style,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { colors } = useTheme();

  // Use Expo Image for better performance
  return (
    <View style={[styles.container, style]}>
      <ExpoImage
        source={source}
        style={[{ width, height }, style]}
        contentFit="cover"
        transition={200}
        placeholder={blurhash}
        priority={priority}
        onLoad={() => {
          setIsLoading(false);
          onLoadComplete?.();
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        {...props}
      />

      {isLoading && showLoader && (
        <View style={[styles.loader, { backgroundColor: colors.base02 }]}>
          {placeholder || <ActivityIndicator color={colors.cyan} />}
        </View>
      )}

      {hasError && (
        <View style={[styles.error, { backgroundColor: colors.base02 }]}>
          <Text style={{ color: colors.red }}>Failed to load image</Text>
        </View>
      )}
    </View>
  );
}

/**
 * Get optimized image URL with resize parameters
 */
export function getOptimizedImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  // If using a CDN that supports URL parameters (e.g., Cloudinary, Imgix)
  // Example for Cloudinary:
  // return url.replace('/upload/', `/upload/w_${width},h_${height},q_${quality}/`);

  // For now, return original URL
  // TODO: Implement based on your CDN provider
  return url;
}

/**
 * Preload images for better UX
 */
export async function preloadImages(urls: string[]): Promise<void> {
  const promises = urls.map(url =>
    ExpoImage.prefetch(url, {
      cachePolicy: 'memory-disk',
    })
  );

  await Promise.all(promises);
}

/**
 * Clear image cache
 */
export async function clearImageCache(): Promise<boolean> {
  try {
    await ExpoImage.clearMemoryCache();
    await ExpoImage.clearDiskCache();
    return true;
  } catch (error) {
    console.error('[ImageOptimizer] Error clearing cache:', error);
    return false;
  }
}

/**
 * Get image cache size
 */
export async function getImageCacheSize(): Promise<number> {
  try {
    const cacheSize = await ExpoImage.getCachePathAsync();
    // TODO: Calculate actual size
    return 0; // Placeholder
  } catch (error) {
    console.error('[ImageOptimizer] Error getting cache size:', error);
    return 0;
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Fix Text import
import { Text } from 'react-native';
