/**
 * EnergyGauge - React Native Version
 * Circular energy gauge with SVG progress ring
 *
 * Features:
 * - Circular progress using react-native-svg
 * - Two variants: micro (compact) and expanded (full)
 * - Energy-based color blending
 * - Trend indicators
 * - AI recommendations
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface EnergyGaugeProps {
  energy: number; // 0-100
  trend?: 'rising' | 'falling' | 'stable';
  predictedNextHour?: number;
  variant?: 'micro' | 'expanded';
}

const EnergyGauge: React.FC<EnergyGaugeProps> = ({
  energy,
  trend = 'stable',
  predictedNextHour,
  variant = 'expanded',
}) => {
  // Get color based on energy level (smooth blending)
  const getEnergyColor = () => {
    if (energy >= 70) return '#859900'; // Solarized green (high)
    if (energy >= 40) return '#b58900'; // Solarized yellow (medium)
    return '#dc322f'; // Solarized red (low)
  };

  // Get energy level text
  const getEnergyLevel = () => {
    if (energy >= 70) return 'High Energy';
    if (energy >= 40) return 'Medium Energy';
    return 'Low Energy';
  };

  // Get trend icon
  const getTrendIcon = () => {
    switch (trend) {
      case 'rising':
        return '📈';
      case 'falling':
        return '📉';
      default:
        return '➡️';
    }
  };

  // Get AI recommendation
  const getRecommendation = () => {
    if (energy >= 70) {
      return 'Your energy is high! Perfect for tackling challenging tasks in Hunter mode.';
    }
    if (energy >= 40) {
      return 'Moderate energy. Try medium-priority tasks or take micro-breaks between tasks.';
    }
    return 'Low energy detected. Focus on 5-min tasks or recovery activities to rebuild.';
  };

  // Micro variant
  if (variant === 'micro') {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (energy / 100) * circumference;

    return (
      <View style={styles.microContainer}>
        {/* Compact circular gauge */}
        <View style={styles.microGauge}>
          <Svg width={64} height={64} viewBox="0 0 64 64" style={styles.svg}>
            {/* Background circle */}
            <Circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="#073642"
              strokeWidth="6"
            />
            {/* Energy progress circle */}
            <Circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke={getEnergyColor()}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin="32, 32"
            />
          </Svg>
          {/* Center percentage */}
          <View style={styles.centerContent}>
            <Text style={[styles.microPercentage, { color: getEnergyColor() }]}>
              {energy}%
            </Text>
          </View>
        </View>

        {/* Info section */}
        <View style={styles.microInfo}>
          <Text style={styles.microLevel}>{getEnergyLevel()}</Text>
          <View style={styles.microTrend}>
            <Text style={styles.trendIcon}>{getTrendIcon()}</Text>
            <Text style={styles.trendText}>{trend}</Text>
          </View>
        </View>

        {/* Prediction badge */}
        {predictedNextHour !== undefined && (
          <View style={styles.predictionBadge}>
            <Text style={styles.predictionLabel}>Next Hr</Text>
            <Text style={styles.predictionValue}>{predictedNextHour}%</Text>
          </View>
        )}
      </View>
    );
  }

  // Expanded variant
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (energy / 100) * circumference;

  return (
    <View style={styles.expandedContainer}>
      {/* Circular Energy Gauge */}
      <View style={styles.gaugeContainer}>
        <Svg width={200} height={200} viewBox="0 0 200 200" style={styles.svg}>
          {/* Background circle */}
          <Circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#073642"
            strokeWidth="12"
          />
          {/* Energy progress circle */}
          <Circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={getEnergyColor()}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin="100, 100"
          />
        </Svg>

        {/* Center content */}
        <View style={styles.centerContent}>
          <Text style={[styles.percentage, { color: getEnergyColor() }]}>
            {energy}%
          </Text>
          <Text style={styles.levelText}>{getEnergyLevel()}</Text>
        </View>
      </View>

      {/* Trend Indicator */}
      <View style={styles.trendContainer}>
        <Text style={styles.trendIconLarge}>{getTrendIcon()}</Text>
        <View>
          <Text style={styles.trendLabelLarge}>TREND</Text>
          <Text style={styles.trendValueLarge}>{trend}</Text>
        </View>
      </View>

      {/* Prediction */}
      {predictedNextHour !== undefined && (
        <View style={styles.predictionContainer}>
          <Text style={styles.predictionLabelLarge}>Predicted in 1 hour</Text>
          <Text style={styles.predictionValueLarge}>{predictedNextHour}%</Text>
        </View>
      )}

      {/* AI Recommendation */}
      <View style={styles.recommendationContainer}>
        <Text style={styles.recommendationLabel}>💡 AI Recommendation</Text>
        <Text style={styles.recommendationText}>{getRecommendation()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Common
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Micro variant
  microContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  microGauge: {
    width: 64,
    height: 64,
    position: 'relative',
  },
  microPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  microInfo: {
    flex: 1,
    marginLeft: 12,
  },
  microLevel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#93a1a1',
  },
  microTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  trendIcon: {
    fontSize: 14,
  },
  trendText: {
    fontSize: 12,
    color: '#586e75',
    textTransform: 'capitalize',
  },
  predictionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#002b36',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2aa198',
  },
  predictionLabel: {
    fontSize: 10,
    color: '#586e75',
  },
  predictionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2aa198',
  },

  // Expanded variant
  expandedContainer: {
    alignItems: 'center',
  },
  gaugeContainer: {
    width: 200,
    height: 200,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  levelText: {
    fontSize: 14,
    color: '#586e75',
    marginTop: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#073642',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#586e75',
    gap: 8,
  },
  trendIconLarge: {
    fontSize: 24,
  },
  trendLabelLarge: {
    fontSize: 10,
    color: '#586e75',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trendValueLarge: {
    fontSize: 14,
    color: '#93a1a1',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  predictionContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#073642',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#586e75',
  },
  predictionLabelLarge: {
    fontSize: 10,
    color: '#586e75',
    textAlign: 'center',
    marginBottom: 4,
  },
  predictionValueLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2aa198',
    textAlign: 'center',
  },
  recommendationContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#073642',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#586e75',
    maxWidth: 320,
  },
  recommendationLabel: {
    fontSize: 10,
    color: '#586e75',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#93a1a1',
    lineHeight: 20,
  },
});

export default EnergyGauge;
