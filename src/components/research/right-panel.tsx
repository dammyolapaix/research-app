'use client'

import { useState } from 'react'

import { CheckCircle, Clock, FileText, List } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

import type { ResearchStep } from './research-interface'
import { ResultPanel } from './result-panel'
import { StepsPanel } from './steps-panel'

type RightPanelProps = {
  steps: ResearchStep[]
  literatureReview: string
  isGenerating: boolean
  isMobile?: boolean
}

export function RightPanel({
  steps,
  literatureReview,
  isGenerating,
  isMobile = false,
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<'steps' | 'results'>('steps')

  const completedSteps = steps.filter(
    (step) => step.status === 'completed'
  ).length
  const totalSteps = steps.length
  const progressPercentage =
    totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0
  const hasSteps = steps.length > 0
  const hasResults = literatureReview.length > 0

  // Auto-switch to results when literature review is available and steps are completed
  if (
    hasResults &&
    !isGenerating &&
    activeTab === 'steps' &&
    completedSteps === totalSteps &&
    totalSteps > 0
  ) {
    setTimeout(() => setActiveTab('results'), 500)
  }

  return (
    <div className="flex h-full flex-col bg-gray-900">
      {/* Header with Tabs */}
      <div className="border-b border-gray-800 bg-gray-900">
        {/* Progress Bar - Only show when research is active */}
        {(isGenerating || hasSteps) && (
          <div className="border-b border-gray-800 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                Research Progress
              </span>
              <span className="text-xs text-gray-400">
                {completedSteps}/{totalSteps} steps
              </span>
            </div>
            <Progress value={progressPercentage} className="h-1" />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex">
          <Button
            variant={activeTab === 'steps' ? 'default' : 'ghost'}
            className={`flex-1 rounded-none border-r border-gray-800 ${
              activeTab === 'steps'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'hover:bg-gray-800'
            }`}
            onClick={() => setActiveTab('steps')}
            disabled={!hasSteps && !isGenerating}
          >
            <List className="mr-2 h-4 w-4" />
            Research Steps
            {isGenerating && (
              <div className="ml-2 h-2 w-2 animate-pulse rounded-full bg-yellow-400"></div>
            )}
          </Button>
          <Button
            variant={activeTab === 'results' ? 'default' : 'ghost'}
            className={`flex-1 rounded-none ${
              activeTab === 'results'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'hover:bg-gray-800'
            }`}
            onClick={() => setActiveTab('results')}
            disabled={!hasResults && !isGenerating}
          >
            <FileText className="mr-2 h-4 w-4" />
            Literature Review
            {isGenerating && activeTab === 'results' && (
              <div className="ml-2 h-2 w-2 animate-pulse rounded-full bg-yellow-400"></div>
            )}
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'steps' ? (
          <div className="h-full">
            {hasSteps || isGenerating ? (
              <StepsPanel steps={steps} isVisible={true} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-gray-500">
                  <List className="mx-auto mb-4 h-16 w-16" />
                  <h3 className="mb-2 text-xl font-medium">
                    No Research Steps
                  </h3>
                  <p className="text-sm">
                    Start a research conversation to see the research process
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <ResultPanel
            literatureReview={literatureReview}
            isGenerating={isGenerating}
          />
        )}
      </div>

      {/* Mobile-specific footer with quick stats */}
      {isMobile && (hasSteps || hasResults) && (
        <div className="border-t border-gray-800 p-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                <span>{completedSteps} completed</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{totalSteps - completedSteps} remaining</span>
              </div>
            </div>
            {hasResults && (
              <span>{Math.round(literatureReview.length / 1000)}k chars</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
