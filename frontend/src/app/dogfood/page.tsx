'use client';

import { useState, useEffect } from 'react';
import BiologicalTabs from '@/components/mobile/core/BiologicalTabs';
import TaskCardBig from '@/components/mobile/cards/TaskCardBig';
import ChevronProgress, { ChevronStep } from '@/components/mobile/animations/ChevronProgress';
import { Card } from '@/components/ui/card';
import WorkflowBrowser, { Workflow } from '@/components/workflows/WorkflowBrowser';
import WorkflowExecutionSteps from '@/components/workflows/WorkflowExecutionSteps';
import WorkflowContextDisplay from '@/components/workflows/WorkflowContextDisplay';

interface Task {
  task_id: string;
  title: string;
  description?: string;
  delegation_mode: string;
  priority: string;
  estimated_hours: number;
  status: string;
  created_at: string;
  tags?: string | string[];
  is_meta_task?: boolean;
  project_id?: string;
  scope?: string;
  capture_type?: string;
}

interface Assignment {
  assignment_id: string;
  task_id: string;
  status: string;
  assigned_at: string;
  accepted_at?: string;
  completed_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
}

interface WorkflowStep {
  stepId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  tddPhase?: 'red' | 'green' | 'refactor';
  validationCommand?: string;
  expectedOutcome?: string;
  icon: string;
}

interface WorkflowExecution {
  executionId: string;
  workflowId: string;
  taskId: string;
  steps: WorkflowStep[];
  currentStepIndex: number;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

const API_URL = 'http://localhost:8000';
const AGENT_ID = 'shrenil';

type TaskFilter = 'all' | 'coding' | 'personal' | 'unassigned' | 'meta';

export default function DogfoodPage() {
  const [activeTab, setActiveTab] = useState('focus'); // Start in focus mode
  const [energy] = useState(75);
  const [timeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('meta');
  const [assigningToAI, setAssigningToAI] = useState<string | null>(null);

  // Workflow state
  const [isWorkflowBrowserOpen, setIsWorkflowBrowserOpen] = useState(false);
  const [availableWorkflows, setAvailableWorkflows] = useState<Workflow[]>([]);
  const [selectedTaskForWorkflow, setSelectedTaskForWorkflow] = useState<string | null>(null);
  const [currentWorkflowExecution, setCurrentWorkflowExecution] = useState<WorkflowExecution | null>(null);
  const [generatingSteps, setGeneratingSteps] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadAllTasks();
  }, [taskFilter]);

  const loadData = async () => {
    await Promise.all([loadAllTasks(), loadMyAssignments()]);
    setLoading(false);
  };

  const loadAllTasks = async () => {
    try {
      const filterParam = taskFilter ? `?filter=${taskFilter}` : '';
      const response = await fetch(`${API_URL}/api/v1/delegation/tasks${filterParam}`);
      if (response.ok) {
        const data = await response.json();
        setAllTasks(data);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadMyAssignments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/delegation/assignments/agent/${AGENT_ID}`);
      if (response.ok) {
        const data = await response.json();
        setMyAssignments(data);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const assignTask = async (taskId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/delegation/delegate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: taskId,
          assignee_id: AGENT_ID,
          assignee_type: 'human',
          estimated_hours: allTasks.find(t => t.task_id === taskId)?.estimated_hours || 6.0,
        }),
      });

      if (response.ok) {
        await loadMyAssignments();
        setActiveTab('hunt'); // Switch to Hunter mode
      }
    } catch (error) {
      console.error('Error assigning task:', error);
    }
  };

  const acceptAssignment = async (assignmentId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/delegation/assignments/${assignmentId}/accept`, {
        method: 'POST',
      });

      if (response.ok) {
        await loadMyAssignments();
      }
    } catch (error) {
      console.error('Error accepting assignment:', error);
    }
  };

  const completeAssignment = async (assignmentId: string) => {
    const hours = prompt('How many hours did it take?', '4.0');
    if (!hours) return;

    try {
      const response = await fetch(`${API_URL}/api/v1/delegation/assignments/${assignmentId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actual_hours: parseFloat(hours) }),
      });

      if (response.ok) {
        await loadMyAssignments();
        setActiveTab('map'); // Switch to Mapper mode to see stats
      }
    } catch (error) {
      console.error('Error completing assignment:', error);
    }
  };

  const assignToClaude = async (taskId: string) => {
    setAssigningToAI(taskId);
    try {
      const response = await fetch(`${API_URL}/api/v1/delegation/tasks/${taskId}/assign-to-claude`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        alert(
          `✅ Task assigned to Claude Code!\n\n` +
          `PRP File: ${data.prp_file_path}\n\n` +
          `Next Step:\n${data.next_step}`
        );
        await loadMyAssignments();
      } else {
        const error = await response.json();
        alert(`❌ Failed to assign task: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error assigning to Claude:', error);
      alert('❌ Error assigning task to Claude Code');
    } finally {
      setAssigningToAI(null);
    }
  };

  const isTaskCoding = (task: Task): boolean => {
    const title = task.title || '';
    const tags = task.tags || [];
    const codingTags = ['coding', 'backend', 'frontend', 'refactor', 'test'];

    return (
      title.includes('BE-') ||
      title.includes('FE-') ||
      (typeof tags === 'string' ? tags : tags.join(',')).toLowerCase().split(',').some(
        tag => codingTags.includes(tag.trim())
      )
    );
  };

  // Workflow functions
  const loadAvailableWorkflows = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/workflows/`);
      if (response.ok) {
        const workflows = await response.json();
        // API returns array directly, map to frontend format
        setAvailableWorkflows(workflows.map((w: any) => ({
          workflowId: w.workflow_id,
          name: w.name,
          description: w.description,
          workflowType: w.workflow_type,
          expectedStepCount: w.expected_step_count,
          tags: w.tags,
        })));
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
  };

  const openWorkflowBrowser = async (taskId: string) => {
    setSelectedTaskForWorkflow(taskId);
    await loadAvailableWorkflows();
    setIsWorkflowBrowserOpen(true);
  };

  const executeWorkflow = async (workflowId: string) => {
    if (!selectedTaskForWorkflow) {
      console.log('❌ No task selected for workflow');
      return;
    }

    console.log('🚀 Executing workflow:', workflowId, 'for task:', selectedTaskForWorkflow);
    setGeneratingSteps(true);
    try {
      const task = allTasks.find(t => t.task_id === selectedTaskForWorkflow);
      if (!task) {
        console.log('❌ Task not found:', selectedTaskForWorkflow);
        return;
      }

      console.log('📋 Task found:', task.title);

      const requestBody = {
        workflow_id: workflowId,
        task_id: task.task_id,
        task_title: task.title,
        task_description: task.description || '',
        task_priority: task.priority,
        estimated_hours: task.estimated_hours,
        user_id: AGENT_ID,
        user_energy: Math.floor(energy / 33) + 1, // Convert 0-100 to 1-3
        time_of_day: timeOfDay,
        codebase_state: {
          tests_passing: 150,
          tests_failing: 5,
          recent_files: [],
        },
        recent_tasks: myAssignments
          .filter(a => a.status === 'completed')
          .slice(0, 3)
          .map(a => allTasks.find(t => t.task_id === a.task_id)?.title || ''),
      };

      console.log('📤 Sending request to API:', requestBody);

      const response = await fetch(`${API_URL}/api/v1/workflows/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Workflow execution response:', data);

        // Convert API response to frontend format
        const execution: WorkflowExecution = {
          executionId: data.execution_id,
          workflowId: data.workflow_id,
          taskId: data.task_id,
          steps: data.steps.map((step: any) => ({
            stepId: step.step_id,
            title: step.title,
            description: step.description,
            estimatedMinutes: step.estimated_minutes,
            status: step.status,
            tddPhase: step.tdd_phase,
            validationCommand: step.validation_command,
            expectedOutcome: step.expected_outcome,
            icon: step.icon,
          })),
          currentStepIndex: 0,
          status: 'in_progress',
          createdAt: new Date().toISOString(),
        };

        console.log('💾 Setting workflow execution:', execution);
        setCurrentWorkflowExecution(execution);

        // Assign the task if not already assigned
        if (!myAssignments.find(a => a.task_id === task.task_id)) {
          console.log('🔄 Assigning task to user...');
          await assignTask(task.task_id);
        } else {
          console.log('✅ Task already assigned, switching to Hunter mode');
          setActiveTab('hunt'); // Switch to Hunter mode
        }
      } else {
        const errorData = await response.text();
        console.error('❌ API error:', errorData);
        alert(`❌ Failed to generate workflow steps: ${errorData}`);
      }
    } catch (error) {
      console.error('❌ Error executing workflow:', error);
      alert('❌ Failed to generate workflow steps');
    } finally {
      setGeneratingSteps(false);
    }
  };

  const completeWorkflowStep = (stepId: string) => {
    if (!currentWorkflowExecution) return;

    const updatedSteps = currentWorkflowExecution.steps.map(step =>
      step.stepId === stepId
        ? { ...step, status: 'completed' as const }
        : step
    );

    const completedCount = updatedSteps.filter(s => s.status === 'completed').length;
    const nextStepIndex = Math.min(completedCount, updatedSteps.length - 1);

    setCurrentWorkflowExecution({
      ...currentWorkflowExecution,
      steps: updatedSteps,
      currentStepIndex: nextStepIndex,
    });
  };

  const startWorkflowStep = (stepId: string) => {
    if (!currentWorkflowExecution) return;

    const updatedSteps = currentWorkflowExecution.steps.map(step =>
      step.stepId === stepId
        ? { ...step, status: 'in_progress' as const }
        : step
    );

    setCurrentWorkflowExecution({
      ...currentWorkflowExecution,
      steps: updatedSteps,
    });
  };

  // Get current in-progress assignment with task details
  const currentAssignment = myAssignments.find(a => a.status === 'in_progress');
  const currentTask = currentAssignment
    ? allTasks.find(t => t.task_id === currentAssignment.task_id)
    : null;

  // Debug logging for Hunter Mode
  if (activeTab === 'hunt') {
    console.log('🎯 Hunter Mode Debug:', {
      currentAssignment,
      currentTask: currentTask?.title,
      currentWorkflowExecution,
      hasWorkflow: !!currentWorkflowExecution,
      workflowTaskMatch: currentWorkflowExecution?.taskId === currentTask?.task_id,
    });
  }

  // Mock micro-steps for ChevronProgress
  const getMicroSteps = (task: Task | null): ChevronStep[] => {
    if (!task) return [];

    return [
      { id: '1', label: 'Design', status: 'done', icon: '📐' },
      { id: '2', label: 'Implement', status: 'active', icon: '⚡' },
      { id: '3', label: 'Test', status: 'pending', icon: '🧪' },
      { id: '4', label: 'Review', status: 'pending', icon: '👀' },
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dogfooding dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* BiologicalTabs Navigation */}
      <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700">
        <BiologicalTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          energy={energy}
          timeOfDay={timeOfDay}
          showLabels={true}
        />
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* SCOUT MODE - Browse all tasks */}
        {activeTab === 'scout' && (
          <div className="space-y-6">
            <div className="text-white mb-6">
              <h1 className="text-3xl font-bold mb-2">🔍 Scout Mode</h1>
              <p className="text-gray-400">Browse all tasks and assign work</p>
            </div>

            {/* Filter Buttons */}
            <Card className="p-4 bg-gray-800 border-gray-700">
              <div className="flex flex-wrap gap-2">
                {(['all', 'meta', 'coding', 'personal', 'unassigned'] as TaskFilter[]).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setTaskFilter(filter)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      taskFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {filter === 'meta' ? '🛠️ Dev Tasks' :
                     filter === 'coding' ? '💻 Coding' :
                     filter === 'personal' ? '👤 Personal' :
                     filter === 'unassigned' ? '📋 Unassigned' :
                     '🌐 All Tasks'}
                  </button>
                ))}
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {taskFilter === 'all' && 'Showing all tasks in the system'}
                {taskFilter === 'meta' && 'Showing development/meta tasks for building this app'}
                {taskFilter === 'coding' && 'Showing coding tasks (can be assigned to Claude Code)'}
                {taskFilter === 'personal' && 'Showing personal tasks and events'}
                {taskFilter === 'unassigned' && 'Showing tasks without assignments'}
              </p>
            </Card>

            {allTasks.length === 0 ? (
              <Card className="p-8 text-center bg-gray-800 border-gray-700">
                <p className="text-gray-400">No tasks found for this filter</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allTasks.map(task => {
                  const isCoding = isTaskCoding(task);
                  const humanAssigned = myAssignments.some(
                    a => a.task_id === task.task_id && a.status !== 'completed'
                  );
                  const aiAssigned = myAssignments.some(
                    a => a.task_id === task.task_id && a.status !== 'completed'
                  );

                  return (
                    <div key={task.task_id} className="relative">
                      <TaskCardBig
                        task={{
                          ...task,
                          task_id: task.task_id,
                          micro_steps: [],
                          tags: [task.delegation_mode],
                        }}
                      />

                      {/* Assignment Buttons */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        {!humanAssigned && !aiAssigned && (
                          <>
                            <div className="flex gap-2">
                              <button
                                onClick={() => assignTask(task.task_id)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                Assign to Me
                              </button>
                              {isCoding && (
                                <button
                                  onClick={() => assignToClaude(task.task_id)}
                                  disabled={assigningToAI === task.task_id}
                                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50"
                                >
                                  {assigningToAI === task.task_id ? '...' : '🤖 Claude'}
                                </button>
                              )}
                            </div>
                            <button
                              onClick={() => openWorkflowBrowser(task.task_id)}
                              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                            >
                              🤖 Generate Steps with AI
                            </button>
                          </>
                        )}
                        {(humanAssigned || aiAssigned) && (
                          <div className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
                            {aiAssigned ? '🤖 AI Assigned' : '✓ Assigned'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Workflow Browser Modal */}
            <WorkflowBrowser
              workflows={availableWorkflows}
              isOpen={isWorkflowBrowserOpen}
              onClose={() => setIsWorkflowBrowserOpen(false)}
              onSelect={executeWorkflow}
              taskTitle={selectedTaskForWorkflow ? allTasks.find(t => t.task_id === selectedTaskForWorkflow)?.title : undefined}
              taskDescription={selectedTaskForWorkflow ? allTasks.find(t => t.task_id === selectedTaskForWorkflow)?.description : undefined}
            />
          </div>
        )}

        {/* HUNTER MODE - Current task focus */}
        {activeTab === 'hunt' && (
          <div className="space-y-6">
            <div className="text-white mb-6">
              <h1 className="text-3xl font-bold mb-2">🎯 Hunter Mode</h1>
              <p className="text-gray-400">Focus on your current task</p>
            </div>

            {currentAssignment && currentTask ? (
              <div className="space-y-6">
                <TaskCardBig
                  task={{
                    ...currentTask,
                    task_id: currentTask.task_id,
                    micro_steps: [],
                    tags: [currentTask.delegation_mode, `${currentTask.estimated_hours}h`],
                  }}
                />

                {/* Workflow Context Display */}
                {currentWorkflowExecution && currentWorkflowExecution.taskId === currentTask.task_id && (
                  <WorkflowContextDisplay
                    userEnergy={Math.floor(energy / 33) + 1}
                    timeOfDay={timeOfDay}
                    codebaseState={{
                      testsPassing: 150,
                      testsFailing: 5,
                      recentFiles: [],
                    }}
                    recentTasks={myAssignments
                      .filter(a => a.status === 'completed')
                      .slice(0, 3)
                      .map(a => allTasks.find(t => t.task_id === a.task_id)?.title || '')}
                    compact={true}
                  />
                )}

                {/* AI-Generated Workflow Steps or Fallback */}
                {currentWorkflowExecution && currentWorkflowExecution.taskId === currentTask.task_id ? (
                  <WorkflowExecutionSteps
                    steps={currentWorkflowExecution.steps}
                    currentStepIndex={currentWorkflowExecution.currentStepIndex}
                    onStepComplete={completeWorkflowStep}
                    onStepStart={startWorkflowStep}
                    showDetails={true}
                  />
                ) : (
                  <>
                    {/* Fallback: Show option to generate workflow steps */}
                    <Card className="p-6 bg-gray-800 border-gray-700">
                      <div className="text-center">
                        <div className="text-4xl mb-4">🤖</div>
                        <h3 className="text-white text-lg font-semibold mb-2">
                          No AI-Powered Steps Yet
                        </h3>
                        <p className="text-gray-400 mb-4">
                          Generate personalized implementation steps for this task
                        </p>
                        <button
                          onClick={() => openWorkflowBrowser(currentTask.task_id)}
                          disabled={generatingSteps}
                          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                        >
                          {generatingSteps ? '⏳ Generating...' : '🤖 Generate Steps with AI'}
                        </button>
                      </div>
                    </Card>

                    {/* Fallback: Old ChevronProgress for basic tracking */}
                    <Card className="p-6 bg-gray-800 border-gray-700">
                      <h3 className="text-white text-lg font-semibold mb-4">Basic Task Progress</h3>
                      <ChevronProgress
                        steps={getMicroSteps(currentTask)}
                        variant="default"
                        showProgress={true}
                      />
                    </Card>
                  </>
                )}

                {/* Action Button */}
                <button
                  onClick={() => completeAssignment(currentAssignment.assignment_id)}
                  className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-bold"
                >
                  Complete Task
                </button>
              </div>
            ) : (
              <Card className="p-12 text-center bg-gray-800 border-gray-700">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-white text-xl font-semibold mb-2">No Active Task</h3>
                <p className="text-gray-400 mb-6">Go to Scout mode to find and assign a task</p>
                <button
                  onClick={() => setActiveTab('scout')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Tasks
                </button>
              </Card>
            )}

            {/* Workflow Browser Modal (also accessible from Hunter Mode) */}
            <WorkflowBrowser
              workflows={availableWorkflows}
              isOpen={isWorkflowBrowserOpen}
              onClose={() => setIsWorkflowBrowserOpen(false)}
              onSelect={executeWorkflow}
              taskTitle={selectedTaskForWorkflow ? allTasks.find(t => t.task_id === selectedTaskForWorkflow)?.title : undefined}
              taskDescription={selectedTaskForWorkflow ? allTasks.find(t => t.task_id === selectedTaskForWorkflow)?.description : undefined}
            />
          </div>
        )}

        {/* FOCUS MODE - Addiction Recovery & Single-Task Focus */}
        {activeTab === 'focus' && (
          <div className="space-y-6">
            <div className="text-white mb-6">
              <h1 className="text-3xl font-bold mb-2">🎯 Focus Recovery Mode</h1>
              <p className="text-gray-400">Break the addiction cycle. One task. One hour.</p>
            </div>

            {/* Crisis Intervention Card */}
            <Card className="p-8 bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-700">
              <div className="text-center space-y-4">
                <div className="text-6xl mb-4">🚨</div>
                <h2 className="text-2xl font-bold text-white">
                  Feeling Overwhelmed?
                </h2>
                <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                  You're in the right place. This mode is designed specifically for when you're stuck in unproductive patterns.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-3xl mb-2">⏱️</div>
                    <h3 className="text-white font-semibold mb-1">Just 1 Hour</h3>
                    <p className="text-gray-400 text-sm">Not the whole day. Just one focused hour.</p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-3xl mb-2">🎯</div>
                    <h3 className="text-white font-semibold mb-1">One Task Only</h3>
                    <p className="text-gray-400 text-sm">No multitasking. Close everything else.</p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-3xl mb-2">✨</div>
                    <h3 className="text-white font-semibold mb-1">Better Dopamine</h3>
                    <p className="text-gray-400 text-sm">Completion feels better than scrolling.</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Your Current Intervention Task */}
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
                <span>🔥</span> Your Focus Task
              </h3>

              {allTasks.find(t => t.title.includes('Break Addiction') || t.tags?.includes?.('focus-recovery')) ? (
                <div className="space-y-4">
                  <TaskCardBig
                    task={{
                      ...allTasks.find(t => t.title.includes('Break Addiction') || t.tags?.includes?.('focus-recovery'))!,
                      micro_steps: [],
                      tags: ['critical', 'focus-recovery'],
                    }}
                  />

                  <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                    <h4 className="text-yellow-300 font-semibold mb-2">📋 The Protocol:</h4>
                    <ol className="text-gray-300 space-y-2 text-sm">
                      <li>1. Close ALL tabs except this one</li>
                      <li>2. Put phone in another room</li>
                      <li>3. Set physical timer: 1 hour</li>
                      <li>4. Pick the SMALLEST task below</li>
                      <li>5. When distracted → Use Quick Capture (don't switch tasks)</li>
                      <li>6. After 1 hour → Mark complete and CELEBRATE</li>
                    </ol>
                  </div>

                  <button
                    onClick={() => {
                      const interventionTask = allTasks.find(t => t.title.includes('Break Addiction'));
                      if (interventionTask) assignTask(interventionTask.task_id);
                    }}
                    className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-bold"
                  >
                    ✅ Start My Focus Hour
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No focus task found. Let's create one.</p>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`${API_URL}/api/v1/tasks`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            project_id: 'default-project',
                            title: '🚨 Focus Recovery - ONE Hour',
                            description: 'Break the addiction cycle. Pick ONE task. Work for ONE hour.',
                            status: 'pending',
                            priority: 'critical',
                            category: 'personal',
                            tags: ['focus-recovery', 'intervention'],
                            estimated_hours: 1.0,
                          }),
                        });
                        if (response.ok) {
                          await loadAllTasks();
                        }
                      } catch (error) {
                        console.error('Error creating focus task:', error);
                      }
                    }}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    🚨 Create Focus Task Now
                  </button>
                </div>
              )}
            </Card>

            {/* Quick Wins - Smallest Tasks to Build Momentum */}
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h3 className="text-white text-xl font-semibold mb-4">
                ⚡ Quick Wins (Start Here)
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                These are the SMALLEST tasks. Pick one. Do it. Get the dopamine hit.
              </p>
              <div className="space-y-3">
                {allTasks
                  .filter(t => t.estimated_hours <= 2 && t.status !== 'completed')
                  .sort((a, b) => a.estimated_hours - b.estimated_hours)
                  .slice(0, 5)
                  .map(task => (
                    <div
                      key={task.task_id}
                      className="flex justify-between items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                      onClick={() => {
                        assignTask(task.task_id);
                        setActiveTab('hunt');
                      }}
                    >
                      <div>
                        <div className="text-white font-medium">{task.title}</div>
                        <div className="text-gray-400 text-sm">
                          {task.estimated_hours}h · {task.priority}
                        </div>
                      </div>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          assignTask(task.task_id);
                          setActiveTab('hunt');
                        }}
                      >
                        Start Now
                      </button>
                    </div>
                  ))}
              </div>
            </Card>

            {/* Emergency Capture - For When You're Distracted */}
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h3 className="text-white text-xl font-semibold mb-4">
                💭 Emergency Capture
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                When you feel the urge to switch tasks, capture the thought here instead.
              </p>
              <div className="space-y-3">
                <textarea
                  placeholder="What's distracting you right now? Write it here, then CLOSE THIS and return to work..."
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-4 min-h-[120px] focus:outline-none focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.metaKey) {
                      // Cmd+Enter to save and close
                      const textarea = e.currentTarget;
                      const text = textarea.value;
                      if (text.trim()) {
                        fetch(`${API_URL}/api/v1/tasks`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            project_id: 'default-project',
                            title: text.substring(0, 100),
                            description: text,
                            status: 'pending',
                            priority: 'low',
                            category: 'personal',
                            tags: ['captured', 'distraction'],
                            estimated_hours: 0.5,
                          }),
                        }).then(() => {
                          textarea.value = '';
                          alert('✅ Captured! Now get back to work.');
                        });
                      }
                    }
                  }}
                />
                <p className="text-gray-500 text-xs">
                  Press <kbd className="px-2 py-1 bg-gray-600 rounded">⌘</kbd> + <kbd className="px-2 py-1 bg-gray-600 rounded">Enter</kbd> to capture and return to work
                </p>
              </div>
            </Card>

            {/* The Science */}
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h3 className="text-white text-xl font-semibold mb-4">
                🧠 Why This Works (ADHD Science)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-green-400 font-semibold">✅ External Working Memory</h4>
                  <p className="text-gray-400 text-sm">
                    Capture system offloads thoughts from your brain, freeing up working memory for the task at hand.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-green-400 font-semibold">✅ Dopamine Replacement</h4>
                  <p className="text-gray-400 text-sm">
                    Task completion gives better dopamine than scrolling. Build the habit of healthy rewards.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-green-400 font-semibold">✅ Reduced Decision Fatigue</h4>
                  <p className="text-gray-400 text-sm">
                    System tells you exactly what to do next. No paralysis from too many choices.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-green-400 font-semibold">✅ Progress Visibility</h4>
                  <p className="text-gray-400 text-sm">
                    Visual progress bars give constant feedback. ADHD brains need frequent rewards.
                  </p>
                </div>
              </div>
            </Card>

            {/* Your Challenge */}
            <Card className="p-6 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-700">
              <h3 className="text-white text-xl font-semibold mb-4">
                🏆 7-Day Focus Challenge
              </h3>
              <p className="text-gray-300 mb-4">
                Use this platform to track your recovery from unproductive patterns:
              </p>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-5 h-5" />
                  <span>Day 1: Complete ONE 1-hour focus session</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-5 h-5" />
                  <span>Day 2: Use capture system instead of context-switching</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-5 h-5" />
                  <span>Day 3: Mark 1 task as complete (any size)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-5 h-5" />
                  <span>Day 4: Try 2 focus sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-5 h-5" />
                  <span>Day 5: Review progress in Mapper mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-5 h-5" />
                  <span>Day 6: Complete 3 small tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-5 h-5" />
                  <span>Day 7: Celebrate your progress!</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400 text-sm">
                  <strong className="text-white">Success metric:</strong> Complete 5 out of 7 days. That's 71% - way better than 0%.
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* MAPPER MODE - Progress and stats */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="text-white mb-6">
              <h1 className="text-3xl font-bold mb-2">🗺️ Mapper Mode</h1>
              <p className="text-gray-400">Review your progress and completed work</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6 bg-gray-800 border-gray-700">
                <div className="text-3xl font-bold text-blue-400">{myAssignments.length}</div>
                <div className="text-sm text-gray-400 mt-1">Total Assignments</div>
              </Card>
              <Card className="p-6 bg-gray-800 border-gray-700">
                <div className="text-3xl font-bold text-yellow-400">
                  {myAssignments.filter(a => a.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-400 mt-1">Pending</div>
              </Card>
              <Card className="p-6 bg-gray-800 border-gray-700">
                <div className="text-3xl font-bold text-green-400">
                  {myAssignments.filter(a => a.status === 'in_progress').length}
                </div>
                <div className="text-sm text-gray-400 mt-1">In Progress</div>
              </Card>
              <Card className="p-6 bg-gray-800 border-gray-700">
                <div className="text-3xl font-bold text-purple-400">
                  {myAssignments.filter(a => a.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-400 mt-1">Completed</div>
              </Card>
            </div>

            {/* Completed Tasks */}
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h3 className="text-white text-xl font-semibold mb-4">Completed Work</h3>
              {myAssignments.filter(a => a.status === 'completed').length === 0 ? (
                <p className="text-gray-400 text-center py-8">No completed tasks yet</p>
              ) : (
                <div className="space-y-3">
                  {myAssignments
                    .filter(a => a.status === 'completed')
                    .map(assignment => {
                      const task = allTasks.find(t => t.task_id === assignment.task_id);
                      return (
                        <div
                          key={assignment.assignment_id}
                          className="flex justify-between items-center p-4 bg-gray-700 rounded-lg"
                        >
                          <div>
                            <div className="text-white font-medium">
                              {task?.title || 'Unknown Task'}
                            </div>
                            <div className="text-gray-400 text-sm">
                              Completed: {assignment.completed_at ? new Date(assignment.completed_at).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                          <div className="text-green-400 font-semibold">
                            {assignment.actual_hours || 0}h
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </Card>

            {/* Pending Assignments */}
            {myAssignments.filter(a => a.status === 'pending').length > 0 && (
              <Card className="p-6 bg-gray-800 border-gray-700">
                <h3 className="text-white text-xl font-semibold mb-4">Pending Assignments</h3>
                <div className="space-y-3">
                  {myAssignments
                    .filter(a => a.status === 'pending')
                    .map(assignment => {
                      const task = allTasks.find(t => t.task_id === assignment.task_id);
                      return (
                        <div
                          key={assignment.assignment_id}
                          className="flex justify-between items-center p-4 bg-gray-700 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="text-white font-medium">
                              {task?.title || 'Unknown Task'}
                            </div>
                            <div className="text-gray-400 text-sm">
                              Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                            </div>
                          </div>
                          <button
                            onClick={() => acceptAssignment(assignment.assignment_id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Accept & Start
                          </button>
                        </div>
                      );
                    })}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
