'use client'

import { useState } from 'react'

import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'

import type { ResearchStep } from './research-interface'

type StepsPanelProps = {
  steps: ResearchStep[]
  isVisible: boolean
}

export function StepsPanel({ steps, isVisible }: StepsPanelProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())

  if (!isVisible) return null

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
      }
      return newSet
    })
  }

  const getStepIcon = (status: ResearchStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in-progress':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getSubstepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'in-progress':
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />
      default:
        return <Clock className="h-3 w-3 text-gray-500" />
    }
  }

  const completedSteps = steps.filter(
    (step) => step.status === 'completed'
  ).length
  const totalSteps = steps.length
  const progressPercentage =
    totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  return (
    <div className="h-full">
      {/* Steps */}
      <ScrollArea className="h-full">
        <div className="space-y-2 p-3">
          {steps.map((step, index) => (
            <Collapsible
              key={step.id}
              open={expandedSteps.has(step.id)}
              onOpenChange={() => toggleStep(step.id)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto w-full justify-start p-2 text-left hover:bg-gray-800/50"
                >
                  <div className="flex w-full items-start gap-2">
                    <div className="mt-0.5 flex items-center gap-1">
                      {step.substeps && step.substeps.length > 0 ? (
                        expandedSteps.has(step.id) ? (
                          <ChevronDown className="h-3 w-3 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-gray-400" />
                        )
                      ) : (
                        <div className="w-3" />
                      )}
                      {getStepIcon(step.status)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-blue-400">
                          Step {index + 1}
                        </span>
                      </div>
                      <p className="truncate text-sm font-medium text-white">
                        {step.title}
                      </p>
                      <p className="line-clamp-2 text-xs text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Button>
              </CollapsibleTrigger>

              {step.substeps && step.substeps.length > 0 && (
                <CollapsibleContent className="mt-1 ml-6 space-y-1">
                  {step.substeps.map((substep) => (
                    <div
                      key={substep.id}
                      className="flex items-center gap-2 rounded p-1.5 text-xs"
                    >
                      {getSubstepIcon(substep.status)}
                      <span
                        className={`flex-1 ${
                          substep.status === 'completed'
                            ? 'text-gray-300'
                            : substep.status === 'in-progress'
                              ? 'text-blue-300'
                              : substep.status === 'error'
                                ? 'text-red-300'
                                : 'text-gray-500'
                        }`}
                      >
                        {substep.title}
                      </span>
                    </div>
                  ))}
                </CollapsibleContent>
              )}
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
