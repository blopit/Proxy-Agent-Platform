/**
 * AI-Powered Focus Button Component
 *
 * Demonstrates Epic 2.2 AI integration:
 * - AI duration recommendations
 * - AI energy tracking
 * - AI-optimized focus sessions
 */

'use client';

import { useState } from 'react';
import { startAIPoweredWorkSession, getAIDurationRecommendation } from '@/lib/ai-api';

export default function AIFocusButton() {
  const [loading, setLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);

  const handleStartAISession = async () => {
    setLoading(true);

    try {
      // Get user's current task (in real app, this would come from input)
      const taskDescription = 'Working on complex debugging session';

      // Use AI to start optimized work session
      const result = await startAIPoweredWorkSession(taskDescription);

      setActiveSession(result.session);
      setAiRecommendation(result.durationRecommendation);

      // Show AI insights to user
      if (result.durationRecommendation) {
        alert(
          `🤖 AI Analysis:\n\n` +
            `Recommended Duration: ${result.durationRecommendation.recommended_duration} minutes\n` +
            `Confidence: ${(result.durationRecommendation.confidence * 100).toFixed(0)}%\n` +
            `Reasoning: ${result.durationRecommendation.reasoning}\n\n` +
            `Energy Level: ${result.energy?.energy_level}/10 (${result.energy?.trend})\n` +
            `Tip: ${result.energy?.immediate_recommendations[0] || 'Stay focused!'}`
        );
      }
    } catch (error) {
      console.error('AI session error:', error);
      alert('Failed to start AI-powered session');
    } finally {
      setLoading(false);
    }
  };

  const handleGetAIRecommendation = async () => {
    setLoading(true);

    try {
      const taskDescription = 'Complex feature implementation';
      const result = await getAIDurationRecommendation(taskDescription);

      if (result.data) {
        setAiRecommendation(result.data);
        alert(
          `🤖 AI Duration Recommendation:\n\n` +
            `${result.data.recommended_duration} minutes\n\n` +
            `${result.data.reasoning}\n\n` +
            `Confidence: ${(result.data.confidence * 100).toFixed(0)}%\n` +
            `Alternatives: ${result.data.alternative_durations.join(', ')} min`
        );
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('AI recommendation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md space-y-4">
      <h3 className="text-lg font-bold text-gray-800">
        🤖 AI-Powered Focus (Epic 2.2)
      </h3>

      <div className="space-y-2">
        {/* AI Recommendation Button */}
        <button
          onClick={handleGetAIRecommendation}
          disabled={loading}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 transition-all"
        >
          {loading ? '🤖 Analyzing...' : '💡 Get AI Duration Recommendation'}
        </button>

        {/* AI Session Start Button */}
        <button
          onClick={handleStartAISession}
          disabled={loading || activeSession}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 transition-all"
        >
          {activeSession
            ? '✅ Session Active'
            : loading
            ? '🤖 Starting AI Session...'
            : '🚀 Start AI-Powered Work Session'}
        </button>
      </div>

      {/* AI Insights Display */}
      {aiRecommendation && (
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
          <p className="text-sm font-semibold text-purple-800 mb-2">
            🤖 AI Recommendation:
          </p>
          <p className="text-sm text-gray-700 mb-1">
            <strong>Duration:</strong> {aiRecommendation.recommended_duration} minutes
          </p>
          <p className="text-sm text-gray-700 mb-1">
            <strong>Confidence:</strong> {(aiRecommendation.confidence * 100).toFixed(0)}%
          </p>
          <p className="text-sm text-gray-600 italic">
            "{aiRecommendation.reasoning}"
          </p>
          {aiRecommendation.alternative_durations && (
            <p className="text-xs text-gray-500 mt-2">
              Alternatives: {aiRecommendation.alternative_durations.join(', ')} min
            </p>
          )}
        </div>
      )}

      {/* Active Session Display */}
      {activeSession && (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <p className="text-sm font-semibold text-green-800 mb-2">
            ✅ Active Session:
          </p>
          <p className="text-sm text-gray-700 mb-1">
            <strong>Technique:</strong> {activeSession.technique}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Duration:</strong> {activeSession.planned_duration} minutes
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center mt-4">
        Powered by Epic 2.2 AI: Real OpenAI GPT-4 integration
      </p>
    </div>
  );
}
