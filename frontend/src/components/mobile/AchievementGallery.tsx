'use client'

import React from 'react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementGalleryProps {
  achievements: Achievement[];
}

const AchievementGallery: React.FC<AchievementGalleryProps> = ({ achievements }) => {
  // Get border color based on rarity
  const getRarityColor = (rarity: string = 'common') => {
    switch (rarity) {
      case 'legendary':
        return 'border-[#cb4b16] shadow-lg shadow-[#cb4b16]/50';
      case 'epic':
        return 'border-[#6c71c4] shadow-lg shadow-[#6c71c4]/50';
      case 'rare':
        return 'border-[#268bd2] shadow-md shadow-[#268bd2]/30';
      default:
        return 'border-[#859900]';
    }
  };

  // Get background based on rarity
  const getRarityBg = (rarity: string = 'common') => {
    switch (rarity) {
      case 'legendary':
        return 'bg-gradient-to-br from-[#cb4b16]/20 to-[#dc322f]/20';
      case 'epic':
        return 'bg-gradient-to-br from-[#6c71c4]/20 to-[#268bd2]/20';
      case 'rare':
        return 'bg-gradient-to-br from-[#268bd2]/20 to-[#2aa198]/20';
      default:
        return 'bg-[#073642]';
    }
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <div>
      {/* Stats Header */}
      <div className="px-4 py-3 bg-[#073642] border-b border-[#586e75]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-[#93a1a1]">
              {unlockedAchievements.length}
            </div>
            <div className="text-xs text-[#586e75]">Achievements Unlocked</div>
          </div>
          <div>
            <div className="text-lg text-[#586e75]">
              {unlockedAchievements.length} / {achievements.length}
            </div>
            <div className="text-xs text-[#586e75]">
              {Math.round((unlockedAchievements.length / achievements.length) * 100)}% Complete
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full h-2 bg-[#002b36] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#859900] via-[#268bd2] to-[#cb4b16] transition-all duration-500"
            style={{
              width: `${(unlockedAchievements.length / achievements.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="px-4 py-4">
          <h3 className="text-sm font-bold text-[#93a1a1] mb-3 flex items-center gap-2">
            <span>🏆</span>
            <span>Unlocked ({unlockedAchievements.length})</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {unlockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`
                  p-4 rounded-xl border-2
                  ${getRarityColor(achievement.rarity)}
                  ${getRarityBg(achievement.rarity)}
                  transition-all duration-300
                  hover:scale-105
                `}
              >
                {/* Icon */}
                <div className="text-4xl mb-2 text-center">
                  {achievement.icon}
                </div>

                {/* Name */}
                <h4 className="text-sm font-bold text-[#93a1a1] text-center mb-1">
                  {achievement.name}
                </h4>

                {/* Description */}
                <p className="text-xs text-[#586e75] text-center mb-2">
                  {achievement.description}
                </p>

                {/* Rarity Badge */}
                {achievement.rarity && achievement.rarity !== 'common' && (
                  <div className="text-center">
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-bold uppercase
                      ${achievement.rarity === 'legendary' ? 'bg-[#cb4b16] text-[#fdf6e3]' :
                        achievement.rarity === 'epic' ? 'bg-[#6c71c4] text-[#fdf6e3]' :
                        'bg-[#268bd2] text-[#fdf6e3]'}
                    `}>
                      {achievement.rarity}
                    </span>
                  </div>
                )}

                {/* Unlocked Date */}
                {achievement.unlockedAt && (
                  <div className="text-xs text-[#586e75] text-center mt-2">
                    Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div className="px-4 py-4 border-t border-[#073642]">
          <h3 className="text-sm font-bold text-[#586e75] mb-3 flex items-center gap-2">
            <span>🔒</span>
            <span>Locked ({lockedAchievements.length})</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {lockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="p-4 rounded-xl border-2 border-[#586e75] bg-[#073642] opacity-60"
              >
                {/* Locked Icon */}
                <div className="text-4xl mb-2 text-center grayscale">
                  {achievement.icon}
                </div>

                {/* Name */}
                <h4 className="text-sm font-bold text-[#586e75] text-center mb-1">
                  ???
                </h4>

                {/* Hint */}
                <p className="text-xs text-[#586e75] text-center">
                  {achievement.description}
                </p>

                {/* Lock Icon */}
                <div className="text-center mt-2">
                  <span className="text-lg">🔒</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {achievements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-bold text-[#93a1a1] mb-2">
            No Achievements Yet
          </h3>
          <p className="text-[#586e75] text-center">
            Complete tasks and reach milestones to unlock achievements!
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementGallery;
