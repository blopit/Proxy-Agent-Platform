'use client'

import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, CheckCircle2 } from 'lucide-react';
import { colors, semanticColors, spacing, fontSize, borderRadius } from '@/lib/design-system';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Zone {
  zone_id: string;
  name: string;
  icon: string;
  simple_goal: string | null;
  color: string;
  sort_order: number;
  is_active: boolean;
}

interface ZoneProgress {
  zone_id: string;
  zone_name: string;
  zone_icon: string;
  tasks_completed_today: number;
  tasks_completed_this_week: number;
  tasks_completed_all_time: number;
}

interface CompassViewProps {
  userId?: string;
  onZoneSelect?: (zoneId: string) => void;
}

const CompassView: React.FC<CompassViewProps> = ({
  userId = 'mobile-user',
  onZoneSelect
}) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [progress, setProgress] = useState<Map<string, ZoneProgress>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  useEffect(() => {
    fetchCompassData();
  }, [userId]);

  const fetchCompassData = async () => {
    setIsLoading(true);
    try {
      // Fetch zones
      const zonesResponse = await fetch(
        `${API_URL}/api/v1/compass/zones?user_id=${userId}`
      );

      if (!zonesResponse.ok) {
        throw new Error('Failed to fetch zones');
      }

      const zonesData = await zonesResponse.json();
      const fetchedZones = zonesData.zones || [];
      setZones(fetchedZones);

      // Fetch progress for each zone
      const progressResponse = await fetch(
        `${API_URL}/api/v1/compass/progress?user_id=${userId}`
      );

      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        const progressMap = new Map<string, ZoneProgress>();

        (progressData.progress || []).forEach((p: ZoneProgress) => {
          progressMap.set(p.zone_id, p);
        });

        setProgress(progressMap);
      }
    } catch (err) {
      console.warn('Failed to fetch compass data:', err);
      setZones([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleZoneClick = (zoneId: string) => {
    setSelectedZone(zoneId);
    if (onZoneSelect) {
      onZoneSelect(zoneId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">🧭</div>
          <p style={{ color: semanticColors.text.secondary }}>Loading your Compass...</p>
        </div>
      </div>
    );
  }

  if (zones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4">
        <div className="text-6xl mb-4">🧭</div>
        <h3 className="text-xl font-bold mb-2" style={{ color: semanticColors.text.primary }}>
          No Compass Zones
        </h3>
        <p style={{ color: semanticColors.text.secondary, textAlign: 'center' }}>
          Your compass zones will appear here once created.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: semanticColors.bg.primary, padding: spacing[4] }}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🧭</span>
          <div>
            <h2 className="text-xl font-bold" style={{ color: semanticColors.text.primary }}>
              Compass
            </h2>
            <p className="text-sm" style={{ color: semanticColors.text.secondary }}>
              Your 3 life zones
            </p>
          </div>
        </div>
      </div>

      {/* Zones Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {zones.map((zone) => {
            const zoneProgress = progress.get(zone.zone_id);
            const tasksToday = zoneProgress?.tasks_completed_today || 0;
            const tasksWeek = zoneProgress?.tasks_completed_this_week || 0;
            const tasksAllTime = zoneProgress?.tasks_completed_all_time || 0;

            return (
              <div
                key={zone.zone_id}
                onClick={() => handleZoneClick(zone.zone_id)}
                className="rounded-lg p-4 cursor-pointer transition-all"
                style={{
                  backgroundColor: `${zone.color}15`,
                  border: `2px solid ${selectedZone === zone.zone_id ? zone.color : 'transparent'}`,
                  borderRadius: borderRadius.lg
                }}
              >
                {/* Zone Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{zone.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: zone.color }}>
                        {zone.name}
                      </h3>
                      {zone.simple_goal && (
                        <p className="text-sm mt-1" style={{ color: semanticColors.text.secondary }}>
                          {zone.simple_goal}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Today */}
                  <div
                    className="rounded-md p-2 text-center"
                    style={{
                      backgroundColor: semanticColors.bg.secondary,
                      border: `1px solid ${semanticColors.border.default}`
                    }}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Target size={14} style={{ color: semanticColors.text.secondary }} />
                      <span className="text-xs" style={{ color: semanticColors.text.secondary }}>
                        Today
                      </span>
                    </div>
                    <div className="text-xl font-bold" style={{ color: zone.color }}>
                      {tasksToday}
                    </div>
                  </div>

                  {/* This Week */}
                  <div
                    className="rounded-md p-2 text-center"
                    style={{
                      backgroundColor: semanticColors.bg.secondary,
                      border: `1px solid ${semanticColors.border.default}`
                    }}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp size={14} style={{ color: semanticColors.text.secondary }} />
                      <span className="text-xs" style={{ color: semanticColors.text.secondary }}>
                        Week
                      </span>
                    </div>
                    <div className="text-xl font-bold" style={{ color: zone.color }}>
                      {tasksWeek}
                    </div>
                  </div>

                  {/* All Time */}
                  <div
                    className="rounded-md p-2 text-center"
                    style={{
                      backgroundColor: semanticColors.bg.secondary,
                      border: `1px solid ${semanticColors.border.default}`
                    }}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle2 size={14} style={{ color: semanticColors.text.secondary }} />
                      <span className="text-xs" style={{ color: semanticColors.text.secondary }}>
                        Total
                      </span>
                    </div>
                    <div className="text-xl font-bold" style={{ color: zone.color }}>
                      {tasksAllTime}
                    </div>
                  </div>
                </div>

                {/* Balance Indicator */}
                {tasksWeek > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span style={{ color: semanticColors.text.secondary }}>
                        Weekly progress
                      </span>
                      <span style={{ color: zone.color, fontWeight: 600 }}>
                        {tasksWeek} {tasksWeek === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: semanticColors.bg.secondary }}
                    >
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (tasksWeek / 10) * 100)}%`,
                          backgroundColor: zone.color
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Balance Summary */}
      <div
        className="mt-4 p-4 rounded-lg"
        style={{
          backgroundColor: semanticColors.bg.secondary,
          border: `1px solid ${semanticColors.border.default}`
        }}
      >
        <div className="text-center">
          <p className="text-sm mb-1" style={{ color: semanticColors.text.secondary }}>
            Life Balance
          </p>
          <p className="text-xs" style={{ color: semanticColors.text.muted }}>
            Focus on all three zones for a balanced life
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompassView;
