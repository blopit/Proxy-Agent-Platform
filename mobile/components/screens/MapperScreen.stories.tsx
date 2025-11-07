import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Map, ZoomIn, ZoomOut, Maximize, GitBranch } from 'lucide-react-native';
import { THEME } from '../../src/theme/colors';
import { Text } from '@/src/components/ui/Text';

/**
 * Mapper Screen - Complete composition showing the Task Graph/Dependency interface
 *
 * This is a SCREEN STORY that composes multiple components:
 * - Task dependency graph visualization (placeholder)
 * - Zoom controls
 * - Filter by priority/tags
 * - Task details panel
 *
 * Based on: mobile/TABS_AND_DATA_FLOW_PLAN.md - Mapper Tab
 *
 * NOTE: Full graph visualization component would use react-native-svg or similar
 * This story shows the layout and UI chrome around where the graph would render
 */

const meta = {
  title: 'Screens/Mapper',
  component: MapperScreen,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MapperScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock graph data structure
interface TaskNode {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dependencies: string[]; // IDs of tasks this depends on
  x: number; // Position in graph
  y: number;
}

const mockTaskNodes: TaskNode[] = [
  {
    id: 't1',
    title: 'Design API',
    status: 'completed',
    priority: 'HIGH',
    dependencies: [],
    x: 50,
    y: 100,
  },
  {
    id: 't2',
    title: 'Implement Backend',
    status: 'completed',
    priority: 'HIGH',
    dependencies: ['t1'],
    x: 200,
    y: 100,
  },
  {
    id: 't3',
    title: 'Write Tests',
    status: 'in-progress',
    priority: 'MEDIUM',
    dependencies: ['t2'],
    x: 350,
    y: 50,
  },
  {
    id: 't4',
    title: 'Create Frontend',
    status: 'in-progress',
    priority: 'HIGH',
    dependencies: ['t1'],
    x: 350,
    y: 150,
  },
  {
    id: 't5',
    title: 'Integration Testing',
    status: 'pending',
    priority: 'MEDIUM',
    dependencies: ['t3', 't4'],
    x: 500,
    y: 100,
  },
  {
    id: 't6',
    title: 'Deploy to Production',
    status: 'pending',
    priority: 'HIGH',
    dependencies: ['t5'],
    x: 650,
    y: 100,
  },
];

// Mapper Screen Component
interface MapperScreenProps {
  tasks?: TaskNode[];
  showControls?: boolean;
}

function MapperScreen({
  tasks = mockTaskNodes,
  showControls = true,
}: MapperScreenProps) {
  const [zoom, setZoom] = useState(1);
  const [selectedTask, setSelectedTask] = useState<TaskNode | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  const zoomIn = () => setZoom(Math.min(2, zoom + 0.25));
  const zoomOut = () => setZoom(Math.max(0.5, zoom - 0.25));
  const resetZoom = () => setZoom(1);

  // Calculate stats
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;

  // Filter tasks
  const filteredTasks = filterPriority
    ? tasks.filter((t) => t.priority === filterPriority)
    : tasks;

  // Get task color
  const getTaskColor = (task: TaskNode): string => {
    if (task.status === 'completed') return THEME.green;
    if (task.status === 'in-progress') return THEME.orange;
    return THEME.base01;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Map size={24} color={THEME.violet} />
          <Text style={styles.title}>Mapper</Text>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <View style={[styles.statDot, { backgroundColor: THEME.green }]} />
          <Text style={styles.statText}>{completedCount} Done</Text>
        </View>
        <View style={styles.stat}>
          <View style={[styles.statDot, { backgroundColor: THEME.orange }]} />
          <Text style={styles.statText}>{inProgressCount} Active</Text>
        </View>
        <View style={styles.stat}>
          <View style={[styles.statDot, { backgroundColor: THEME.base01 }]} />
          <Text style={styles.statText}>{pendingCount} Pending</Text>
        </View>
      </View>

      {/* Priority Filters */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterPriority === null && styles.filterButtonActive,
          ]}
          onPress={() => setFilterPriority(null)}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterPriority === null && styles.filterButtonTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterPriority === 'HIGH' && styles.filterButtonActive,
          ]}
          onPress={() => setFilterPriority('HIGH')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterPriority === 'HIGH' && styles.filterButtonTextActive,
            ]}
          >
            High
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterPriority === 'MEDIUM' && styles.filterButtonActive,
          ]}
          onPress={() => setFilterPriority('MEDIUM')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterPriority === 'MEDIUM' && styles.filterButtonTextActive,
            ]}
          >
            Medium
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterPriority === 'LOW' && styles.filterButtonActive,
          ]}
          onPress={() => setFilterPriority('LOW')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterPriority === 'LOW' && styles.filterButtonTextActive,
            ]}
          >
            Low
          </Text>
        </TouchableOpacity>
      </View>

      {/* Graph Area - Placeholder for actual graph visualization */}
      <View style={styles.graphContainer}>
        <ScrollView
          horizontal
          contentContainerStyle={[
            styles.graphContent,
            { transform: [{ scale: zoom }] },
          ]}
        >
          {/* Simplified graph visualization using View components */}
          <View style={styles.graph}>
            {filteredTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskNode,
                  {
                    left: task.x * zoom,
                    top: task.y * zoom,
                    borderColor: getTaskColor(task),
                    backgroundColor:
                      selectedTask?.id === task.id
                        ? getTaskColor(task) + '40'
                        : getTaskColor(task) + '20',
                  },
                ]}
                onPress={() => setSelectedTask(task)}
              >
                <Text style={styles.taskNodeTitle} numberOfLines={1}>
                  {task.title}
                </Text>
                <View style={styles.taskNodeBadge}>
                  <Text style={[styles.taskNodeStatus, { color: getTaskColor(task) }]}>
                    {task.status}
                  </Text>
                </View>

                {/* Dependency indicators */}
                {task.dependencies.length > 0 && (
                  <View style={styles.dependencyIndicator}>
                    <GitBranch size={12} color={THEME.base01} />
                    <Text style={styles.dependencyCount}>{task.dependencies.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {/* Connection lines would be drawn here using SVG */}
            <Text style={styles.graphPlaceholder}>
              Graph connections would render here using react-native-svg
            </Text>
          </View>
        </ScrollView>

        {/* Zoom Controls */}
        {showControls && (
          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
              <ZoomIn size={20} color={THEME.base1} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={resetZoom}>
              <Maximize size={20} color={THEME.base1} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
              <ZoomOut size={20} color={THEME.base1} />
            </TouchableOpacity>
            <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
          </View>
        )}
      </View>

      {/* Selected Task Panel */}
      {selectedTask && (
        <View style={styles.detailPanel}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>{selectedTask.title}</Text>
            <TouchableOpacity onPress={() => setSelectedTask(null)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[styles.detailValue, { color: getTaskColor(selectedTask) }]}>
              {selectedTask.status}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Priority:</Text>
            <Text style={styles.detailValue}>{selectedTask.priority}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dependencies:</Text>
            <Text style={styles.detailValue}>
              {selectedTask.dependencies.length === 0
                ? 'None'
                : `${selectedTask.dependencies.length} task(s)`}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

// === Basic Views ===

export const Default: Story = {
  render: () => <MapperScreen />,
};

export const WithoutControls: Story = {
  render: () => <MapperScreen showControls={false} />,
};

// === Graph Variants ===

export const SimpleGraph: Story = {
  render: () => (
    <MapperScreen
      tasks={[
        {
          id: 't1',
          title: 'Task A',
          status: 'completed',
          priority: 'HIGH',
          dependencies: [],
          x: 100,
          y: 100,
        },
        {
          id: 't2',
          title: 'Task B',
          status: 'in-progress',
          priority: 'HIGH',
          dependencies: ['t1'],
          x: 300,
          y: 100,
        },
        {
          id: 't3',
          title: 'Task C',
          status: 'pending',
          priority: 'MEDIUM',
          dependencies: ['t2'],
          x: 500,
          y: 100,
        },
      ]}
    />
  ),
};

export const ComplexGraph: Story = {
  render: () => <MapperScreen tasks={mockTaskNodes} />,
};

// === Status Filters ===

export const AllCompleted: Story = {
  render: () => (
    <MapperScreen
      tasks={mockTaskNodes.map((t) => ({ ...t, status: 'completed' as const }))}
    />
  ),
};

export const MixedProgress: Story = {
  render: () => <MapperScreen tasks={mockTaskNodes} />,
};

// === Interactive Demo ===

export const FullyInteractive: Story = {
  render: () => <MapperScreen />,
};

// === Styles ===

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.base03,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.base1,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.base02,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statText: {
    fontSize: 14,
    color: THEME.base0,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: THEME.base02,
  },
  filterButtonActive: {
    backgroundColor: THEME.violet + '30',
  },
  filterButtonText: {
    fontSize: 14,
    color: THEME.base0,
  },
  filterButtonTextActive: {
    color: THEME.violet,
    fontWeight: '600',
  },
  graphContainer: {
    flex: 1,
    position: 'relative',
  },
  graphContent: {
    minWidth: 800,
    minHeight: 400,
  },
  graph: {
    width: 800,
    height: 400,
    position: 'relative',
    backgroundColor: THEME.base02,
  },
  graphPlaceholder: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    fontSize: 12,
    color: THEME.base01,
    fontStyle: 'italic',
  },
  taskNode: {
    position: 'absolute',
    width: 120,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  taskNodeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.base1,
    marginBottom: 4,
  },
  taskNodeBadge: {
    marginTop: 4,
  },
  taskNodeStatus: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dependencyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dependencyCount: {
    fontSize: 10,
    color: THEME.base01,
  },
  zoomControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: THEME.base02,
    borderRadius: 8,
    padding: 8,
    gap: 8,
  },
  zoomButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.base03,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomText: {
    fontSize: 12,
    color: THEME.base0,
    textAlign: 'center',
    marginTop: 4,
  },
  detailPanel: {
    backgroundColor: THEME.base02,
    borderTopWidth: 1,
    borderTopColor: THEME.base01,
    padding: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.base1,
    flex: 1,
  },
  closeButton: {
    fontSize: 24,
    color: THEME.base01,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: THEME.base01,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.base1,
  },
});
