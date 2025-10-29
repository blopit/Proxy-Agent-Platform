import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useState } from 'react';
import MiniChevronNav, { type MiniChevronSection } from './MiniChevronNav';
import MapSubtabs, { type MapSubtab } from './MapSubtabs';
import MapSection from './MapSection';
import RitualModal from './RitualModal';

// ============================================================================
// MiniChevronNav Stories
// ============================================================================

const chevronNavMeta: Meta<typeof MiniChevronNav> = {
  title: 'Components/Mobile/Mapper/MiniChevronNav',
  component: MiniChevronNav,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#002b36' },
        { name: 'light', value: '#fdf6e3' },
      ],
    },
  },
  tags: ['autodocs'],
};

export default chevronNavMeta;
type ChevronNavStory = StoryObj<typeof MiniChevronNav>;

const mapSections: MiniChevronSection[] = [
  { id: 'stats', icon: '📊', label: 'Stats' },
  { id: 'wins', icon: '🏆', label: 'Wins' },
  { id: 'reflect', icon: '💭', label: 'Reflect' },
  { id: 'trends', icon: '📈', label: 'Trends' },
];

const planSections: MiniChevronSection[] = [
  { id: 'rituals', icon: '🌅', label: 'Rituals' },
  { id: 'vision', icon: '🧭', label: 'Vision' },
  { id: 'goals', icon: '🎯', label: 'Goals' },
  { id: 'horizons', icon: '📅', label: 'Horizons' },
];

export const MAPSections: ChevronNavStory = {
  render: function MAPSectionsStory() {
    const [currentSection, setCurrentSection] = useState('stats');

    return (
      <div style={{ height: '100vh', backgroundColor: '#002b36' }}>
        <MiniChevronNav
          sections={mapSections}
          currentSection={currentSection}
          onNavigate={setCurrentSection}
        />
        <div style={{ padding: '20px', color: '#93a1a1', textAlign: 'center' }}>
          <p style={{ fontSize: '14px' }}>Click chevrons to navigate</p>
          <p style={{ fontSize: '12px', color: '#586e75', marginTop: '8px' }}>
            Current section: {currentSection}
          </p>
        </div>
      </div>
    );
  },
};

export const PLANSections: ChevronNavStory = {
  render: function PLANSectionsStory() {
    const [currentSection, setCurrentSection] = useState('rituals');

    return (
      <div style={{ height: '100vh', backgroundColor: '#002b36' }}>
        <MiniChevronNav
          sections={planSections}
          currentSection={currentSection}
          onNavigate={setCurrentSection}
        />
        <div style={{ padding: '20px', color: '#93a1a1', textAlign: 'center' }}>
          <p style={{ fontSize: '14px' }}>Click chevrons to navigate</p>
          <p style={{ fontSize: '12px', color: '#586e75', marginTop: '8px' }}>
            Current section: {currentSection}
          </p>
        </div>
      </div>
    );
  },
};

export const ProgressAnimation: ChevronNavStory = {
  render: function ProgressAnimationStory() {
    const [currentIndex, setCurrentIndex] = useState(0);

    React.useEffect(() => {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % mapSections.length);
      }, 2000);

      return () => clearInterval(interval);
    }, []);

    return (
      <div style={{ height: '100vh', backgroundColor: '#002b36' }}>
        <MiniChevronNav
          sections={mapSections}
          currentSection={mapSections[currentIndex].id}
        />
        <div style={{ padding: '20px', color: '#93a1a1', textAlign: 'center' }}>
          <p style={{ fontSize: '14px' }}>Auto-progressing through sections</p>
          <p style={{ fontSize: '12px', color: '#586e75', marginTop: '8px' }}>
            Watch the chevrons update as the active section changes
          </p>
        </div>
      </div>
    );
  },
};

// ============================================================================
// MapSubtabs Stories
// ============================================================================

const subtabsMeta: Meta<typeof MapSubtabs> = {
  title: 'Components/Mobile/Mapper/MapSubtabs',
  component: MapSubtabs,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#002b36' },
        { name: 'light', value: '#fdf6e3' },
      ],
    },
  },
  tags: ['autodocs'],
};

export const SubtabsInteractive: StoryObj<typeof MapSubtabs> = {
  render: function SubtabsInteractiveStory() {
    const [activeTab, setActiveTab] = useState<MapSubtab>('map');

    return (
      <div style={{ height: '100vh', backgroundColor: '#002b36' }}>
        <div style={{ padding: '16px', borderBottom: '2px solid #073642' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#93a1a1', marginBottom: '8px' }}>
            🗺️ Mapper Mode
          </h2>
          <p style={{ fontSize: '13px', color: '#586e75' }}>
            Consolidate memory & recalibrate priorities
          </p>
        </div>

        <MapSubtabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div style={{ padding: '20px', color: '#93a1a1' }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#073642',
            borderRadius: '8px',
            border: '2px solid #268bd2',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
              {activeTab === 'map' ? '🗺️ MAP Tab Content' : '🎯 PLAN Tab Content'}
            </h3>
            <p style={{ fontSize: '13px', color: '#586e75' }}>
              {activeTab === 'map'
                ? 'Dashboard, Achievements, Reflection, Trends'
                : 'Rituals, Vision, Goals, Time Horizons'}
            </p>
          </div>
        </div>
      </div>
    );
  },
};

export const SubtabsWithSections: StoryObj<typeof MapSubtabs> = {
  render: function SubtabsWithSectionsStory() {
    const [activeTab, setActiveTab] = useState<MapSubtab>('map');
    const [currentSection, setCurrentSection] = useState('stats');

    const sections = activeTab === 'map' ? mapSections : planSections;

    React.useEffect(() => {
      setCurrentSection(sections[0].id);
    }, [activeTab]);

    return (
      <div style={{ height: '100vh', backgroundColor: '#002b36', display: 'flex', flexDirection: 'column' }}>
        <MapSubtabs activeTab={activeTab} onTabChange={setActiveTab} />
        <MiniChevronNav
          sections={sections}
          currentSection={currentSection}
          onNavigate={setCurrentSection}
        />
        <div style={{ flex: 1, padding: '20px', color: '#93a1a1', overflow: 'auto' }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#073642',
            borderRadius: '8px',
            border: '2px solid #268bd2',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
              {sections.find(s => s.id === currentSection)?.icon} {sections.find(s => s.id === currentSection)?.label}
            </h3>
            <p style={{ fontSize: '13px', color: '#586e75' }}>
              Content for this section would go here
            </p>
          </div>
        </div>
      </div>
    );
  },
};

// ============================================================================
// MapSection Stories
// ============================================================================

const sectionMeta: Meta<typeof MapSection> = {
  title: 'Components/Mobile/Mapper/MapSection',
  component: MapSection,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#002b36' },
      ],
    },
  },
  tags: ['autodocs'],
};

export const SingleSection: StoryObj<typeof MapSection> = {
  render: () => (
    <MapSection id="stats" title="Dashboard" icon="📊" showScrollHint>
      <div style={{
        padding: '16px',
        backgroundColor: '#073642',
        borderRadius: '12px',
        border: '2px solid #268bd2',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#93a1a1', marginBottom: '12px' }}>
          Level & XP
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#268bd2' }}>5</div>
            <div style={{ fontSize: '12px', color: '#586e75' }}>Level</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#93a1a1' }}>1,250</div>
            <div style={{ fontSize: '12px', color: '#586e75' }}>Total XP</div>
          </div>
        </div>
      </div>
    </MapSection>
  ),
};

export const FullMapFlow: StoryObj<typeof MapSection> = {
  render: () => (
    <div style={{ height: '100vh', overflowY: 'auto', scrollSnapType: 'y mandatory' }}>
      <MapSection id="stats" title="Dashboard" icon="📊" showScrollHint scrollHintText="Swipe for Achievements">
        <div style={{
          padding: '16px',
          backgroundColor: '#073642',
          borderRadius: '12px',
          border: '2px solid #268bd2',
          marginBottom: '16px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#93a1a1', marginBottom: '12px' }}>
            📊 Weekly Stats
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#268bd2' }}>12</div>
              <div style={{ fontSize: '11px', color: '#586e75' }}>Tasks</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#859900' }}>450</div>
              <div style={{ fontSize: '11px', color: '#586e75' }}>XP</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#b58900' }}>120m</div>
              <div style={{ fontSize: '11px', color: '#586e75' }}>Focus</div>
            </div>
          </div>
        </div>
      </MapSection>

      <MapSection id="wins" title="Achievements" icon="🏆" showScrollHint scrollHintText="Swipe for Reflection">
        <div style={{
          padding: '16px',
          backgroundColor: '#073642',
          borderRadius: '12px',
          border: '2px solid #b58900',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#93a1a1', marginBottom: '12px' }}>
            🏆 Recent Achievements
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['First Steps', 'Streak Master', 'Level Up!'].map((achievement) => (
              <div
                key={achievement}
                style={{
                  padding: '12px',
                  backgroundColor: '#002b36',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#93a1a1',
                }}
              >
                ✨ {achievement}
              </div>
            ))}
          </div>
        </div>
      </MapSection>

      <MapSection id="reflect" title="Reflection" icon="💭">
        <div style={{
          padding: '16px',
          backgroundColor: '#073642',
          borderRadius: '12px',
          border: '2px solid #6c71c4',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#93a1a1', marginBottom: '12px' }}>
            💭 Weekly Reflection
          </h3>
          <p style={{ fontSize: '13px', color: '#586e75' }}>
            Take a moment to reflect on your progress this week...
          </p>
        </div>
      </MapSection>
    </div>
  ),
};

// ============================================================================
// RitualModal Stories
// ============================================================================

const ritualMeta: Meta<typeof RitualModal> = {
  title: 'Components/Mobile/Mapper/RitualModal',
  component: RitualModal,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#002b36' },
      ],
    },
  },
  tags: ['autodocs'],
};

export const MorningRitual: StoryObj<typeof RitualModal> = {
  render: function MorningRitualStory() {
    const [isOpen, setIsOpen] = useState(true);

    // Mock it as morning (override getTimeOfDay)
    React.useEffect(() => {
      // Force morning time for demo
      const originalDate = Date;
      global.Date = class extends originalDate {
        getHours() {
          return 9; // 9 AM
        }
      } as any;

      return () => {
        global.Date = originalDate;
      };
    }, []);

    return (
      <div style={{ height: '100vh', backgroundColor: '#002b36', padding: '20px' }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#268bd2',
            color: '#fdf6e3',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Open Morning Ritual
        </button>

        <RitualModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onComplete={(data) => {
            console.log('Ritual completed:', data);
            setIsOpen(false);
          }}
          urgentTasks={[
            { title: 'Review project proposal' },
            { title: 'Call dentist' },
            { title: 'Submit expense report' },
          ]}
        />
      </div>
    );
  },
};

export const EveningRitual: StoryObj<typeof RitualModal> = {
  render: function EveningRitualStory() {
    const [isOpen, setIsOpen] = useState(true);

    // Mock it as evening
    React.useEffect(() => {
      const originalDate = Date;
      global.Date = class extends originalDate {
        getHours() {
          return 20; // 8 PM
        }
      } as any;

      return () => {
        global.Date = originalDate;
      };
    }, []);

    return (
      <div style={{ height: '100vh', backgroundColor: '#002b36', padding: '20px' }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6c71c4',
            color: '#fdf6e3',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Open Evening Ritual
        </button>

        <RitualModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onComplete={(data) => {
            console.log('Ritual completed:', data);
            setIsOpen(false);
          }}
          completedToday={[
            { title: 'Replied to client email' },
            { title: 'Finished project draft' },
            { title: 'Called dentist' },
          ]}
          todayStats={{ tasks: 7, focusMinutes: 45, xp: 350 }}
        />
      </div>
    );
  },
};

export const MiddayCheckpoint: StoryObj<typeof RitualModal> = {
  render: function MiddayCheckpointStory() {
    const [isOpen, setIsOpen] = useState(true);

    React.useEffect(() => {
      const originalDate = Date;
      global.Date = class extends originalDate {
        getHours() {
          return 13; // 1 PM
        }
      } as any;

      return () => {
        global.Date = originalDate;
      };
    }, []);

    return (
      <div style={{ height: '100vh', backgroundColor: '#002b36', padding: '20px' }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#b58900',
            color: '#fdf6e3',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Open Midday Checkpoint
        </button>

        <RitualModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onComplete={(data) => {
            console.log('Checkpoint completed:', data);
            setIsOpen(false);
          }}
        />
      </div>
    );
  },
};

export const CompleteMapperSystem: StoryObj<typeof MapSection> = {
  render: function CompleteMapperSystemStory() {
    const [activeTab, setActiveTab] = useState<MapSubtab>('map');
    const [currentSection, setCurrentSection] = useState('stats');
    const [showRitual, setShowRitual] = useState(false);

    const sections = activeTab === 'map' ? mapSections : planSections;

    React.useEffect(() => {
      setCurrentSection(sections[0].id);
    }, [activeTab]);

    return (
      <div style={{ height: '100vh', backgroundColor: '#002b36', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '2px solid #073642' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#93a1a1', marginBottom: '8px' }}>
            🗺️ Mapper Mode
          </h2>
          <p style={{ fontSize: '13px', color: '#586e75' }}>
            Complete system demonstration
          </p>
        </div>

        {/* Subtabs */}
        <MapSubtabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Mini Chevron Nav */}
        <MiniChevronNav
          sections={sections}
          currentSection={currentSection}
          onNavigate={setCurrentSection}
        />

        {/* Content */}
        <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#073642',
            borderRadius: '12px',
            border: '2px solid #268bd2',
            marginBottom: '16px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#93a1a1', marginBottom: '8px' }}>
              {sections.find(s => s.id === currentSection)?.icon}{' '}
              {sections.find(s => s.id === currentSection)?.label}
            </h3>
            <p style={{ fontSize: '13px', color: '#586e75', marginBottom: '12px' }}>
              This is the content area for the selected section.
            </p>

            {currentSection === 'rituals' && (
              <button
                onClick={() => setShowRitual(true)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#cb4b16',
                  color: '#fdf6e3',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                🌅 Open Morning Ritual
              </button>
            )}
          </div>
        </div>

        {/* Ritual Modal */}
        <RitualModal
          isOpen={showRitual}
          onClose={() => setShowRitual(false)}
          onComplete={(data) => {
            console.log('Ritual completed:', data);
            setShowRitual(false);
          }}
          urgentTasks={[
            { title: 'Review project proposal' },
            { title: 'Call dentist' },
          ]}
        />
      </div>
    );
  },
};
