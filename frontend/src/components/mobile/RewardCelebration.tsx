'use client'

import React, { useEffect, useState } from 'react';
import { physics, animation as animationConfig, zIndex } from '@/lib/design-system';

/**
 * RewardCelebration - Dopamine-engineered celebration component
 *
 * Triggers visual celebrations based on reward tier:
 * - normal: Simple checkmark
 * - good: Small confetti
 * - great: Confetti
 * - amazing: Fireworks
 * - legendary: Epic explosion
 * - critical_hit: Screen takeover
 */

interface RewardCelebrationProps {
  tier: 'normal' | 'good' | 'great' | 'amazing' | 'legendary' | 'critical_hit';
  xp: number;
  multiplier: number;
  bonusReason: string;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

export default function RewardCelebration({
  tier,
  xp,
  multiplier,
  bonusReason,
  onComplete
}: RewardCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Generate particles based on tier
    const particleCount = getParticleCount(tier);
    const newParticles = generateParticles(particleCount, tier);
    setParticles(newParticles);

    // Auto-hide after animation
    const duration = getDuration(tier);
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [tier, onComplete]);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + physics.gravity,
            life: p.life - 1
          }))
          .filter(p => p.life > 0 && p.y < window.innerHeight)
      );
    }, animationConfig.frameRate);

    return () => clearInterval(interval);
  }, [particles.length]);

  if (!show) return null;

  const tierConfig = getTierConfig(tier);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: zIndex.modal }}>
      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.life / 100,
            transition: 'opacity 0.1s'
          }}
        />
      ))}

      {/* Center celebration message */}
      <div className="flex items-center justify-center h-full">
        <div className={`
          bg-gradient-to-br ${tierConfig.gradient}
          text-white px-8 py-6 rounded-2xl shadow-2xl
          transform ${tierConfig.animation}
          pointer-events-auto
        `}>
          {/* Tier icon/emoji */}
          <div className="text-6xl text-center mb-3">
            {tierConfig.emoji}
          </div>

          {/* XP amount with multiplier */}
          <div className="text-center">
            <div className={`text-5xl font-bold ${tierConfig.textSize}`}>
              +{xp} XP
            </div>
            {multiplier > 1 && (
              <div className="text-2xl font-semibold mt-1 opacity-90">
                {multiplier}x Multiplier!
              </div>
            )}
          </div>

          {/* Bonus reason */}
          <div className="text-center mt-3 text-lg opacity-90">
            {bonusReason}
          </div>
        </div>
      </div>

      {/* Screen flash for legendary/critical */}
      {(tier === 'legendary' || tier === 'critical_hit') && (
        <div
          className="absolute inset-0 bg-white animate-flash"
          style={{
            animation: 'flash 0.5s ease-out'
          }}
        />
      )}

      {/* Screen shake for critical hit */}
      {tier === 'critical_hit' && (
        <style>{`
          @keyframes flash {
            0% { opacity: 0.8; }
            100% { opacity: 0; }
          }
        `}</style>
      )}
    </div>
  );
}

// Helper functions

function getParticleCount(tier: string): number {
  const counts = {
    normal: 0,
    good: 20,
    great: 50,
    amazing: 100,
    legendary: 200,
    critical_hit: 500
  };
  return counts[tier as keyof typeof counts] || 20;
}

function getDuration(tier: string): number {
  const durations = {
    normal: 1000,
    good: 1500,
    great: 2000,
    amazing: 2500,
    legendary: 3000,
    critical_hit: 4000
  };
  return durations[tier as keyof typeof durations] || 1500;
}

function generateParticles(count: number, tier: string): Particle[] {
  const particles: Particle[] = [];
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  const colors = getColorPalette(tier);

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = tier === 'critical_hit' ? physics.particleSpeed.fast :
                  tier === 'legendary' ? physics.particleSpeed.medium :
                  physics.particleSpeed.slow;
    const velocity = speed + Math.random() * speed;

    particles.push({
      id: i,
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - physics.particleSpeed.slow,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: tier === 'critical_hit' ? 12 : tier === 'legendary' ? 8 : 6,
      life: 100
    });
  }

  return particles;
}

function getColorPalette(tier: string): string[] {
  const palettes = {
    normal: ['#10b981'],
    good: ['#3b82f6', '#8b5cf6'],
    great: ['#f59e0b', '#ef4444', '#ec4899'],
    amazing: ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
    legendary: ['#fbbf24', '#f59e0b', '#dc2626', '#7c3aed'],
    critical_hit: ['#ff0000', '#ff4500', '#ffd700', '#ff1493', '#4169e1']
  };
  return palettes[tier as keyof typeof palettes] || palettes.good;
}

function getTierConfig(tier: string) {
  const configs = {
    normal: {
      emoji: '✓',
      gradient: 'from-green-500 to-green-600',
      animation: 'scale-100',
      textSize: 'text-5xl'
    },
    good: {
      emoji: '🎉',
      gradient: 'from-blue-500 to-blue-600',
      animation: 'animate-bounce',
      textSize: 'text-5xl'
    },
    great: {
      emoji: '🌟',
      gradient: 'from-purple-500 to-pink-500',
      animation: 'animate-bounce',
      textSize: 'text-6xl'
    },
    amazing: {
      emoji: '⭐',
      gradient: 'from-yellow-400 to-orange-500',
      animation: 'animate-pulse',
      textSize: 'text-7xl'
    },
    legendary: {
      emoji: '💎',
      gradient: 'from-purple-600 to-pink-600',
      animation: 'animate-pulse',
      textSize: 'text-8xl'
    },
    critical_hit: {
      emoji: '🔥',
      gradient: 'from-red-600 to-orange-600',
      animation: 'animate-ping',
      textSize: 'text-9xl'
    }
  };
  return configs[tier as keyof typeof configs] || configs.good;
}

/**
 * Quick celebration for micro-actions (checking off items, etc.)
 */
export function QuickCelebration({ message = "Nice!" }: { message?: string }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), animationConfig.celebration);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: zIndex.modal }}>
      <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg animate-bounce">
        <div className="text-2xl font-bold">✓ {message}</div>
      </div>
    </div>
  );
}

/**
 * Mystery box open animation
 */
export function MysteryBoxCelebration({
  rewardType,
  content,
  message,
  onComplete
}: {
  rewardType: string;
  content: any;
  message: string;
  onComplete?: () => void;
}) {
  const [stage, setStage] = useState<'shake' | 'open' | 'reveal'>('shake');

  useEffect(() => {
    const shakeTimer = setTimeout(() => setStage('open'), 1000);
    const openTimer = setTimeout(() => setStage('reveal'), 1500);
    const completeTimer = setTimeout(() => onComplete?.(), 3500);

    return () => {
      clearTimeout(shakeTimer);
      clearTimeout(openTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm" style={{ zIndex: zIndex.modal }}>
      <div className="text-center">
        {/* Mystery box */}
        {stage === 'shake' && (
          <div className="text-9xl animate-bounce">
            🎁
          </div>
        )}

        {/* Box opening */}
        {stage === 'open' && (
          <div className="text-9xl animate-spin">
            ✨
          </div>
        )}

        {/* Reward reveal */}
        {stage === 'reveal' && (
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white px-8 py-6 rounded-2xl shadow-2xl animate-bounce">
            <div className="text-6xl mb-3">
              {rewardType === 'xp_bonus' && '💰'}
              {rewardType === 'badge' && '🏆'}
              {rewardType === 'theme_unlock' && '🎨'}
              {rewardType === 'power_hour' && '⚡'}
              {rewardType === 'double_streak_protection' && '🛡️'}
            </div>
            <div className="text-3xl font-bold">
              {message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
