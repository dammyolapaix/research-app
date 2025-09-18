'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

import { ChatPanel } from './chat-panel'
import { RightPanel } from './right-panel'

export type ResearchStep = {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  substeps?: ResearchSubstep[]
  result?: string
}

export type ResearchSubstep = {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  details?: string
}

export type ChatMessage = {
  id: string
  content: string
  type: 'user' | 'assistant'
  timestamp: Date
}

export function ResearchInterface() {
  const [isResearching, setIsResearching] = useState(false)
  const [currentQuery, setCurrentQuery] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [steps, setSteps] = useState<ResearchStep[]>([])
  const [literatureReview, setLiteratureReview] = useState('')

  // Mock data for demonstration
  const mockSteps: ResearchStep[] = [
    {
      id: '1',
      title: 'Analyzing Research Query',
      description:
        'Breaking down your research question into searchable components',
      status: 'completed',
      substeps: [
        { id: '1a', title: 'Extract key concepts', status: 'completed' },
        { id: '1b', title: 'Identify search terms', status: 'completed' },
        { id: '1c', title: 'Generate search strategies', status: 'completed' },
      ],
    },
    {
      id: '2',
      title: 'Searching Academic Databases',
      description: 'Querying OpenAlex for relevant research papers',
      status: 'in-progress',
      substeps: [
        {
          id: '2a',
          title: 'institutional quality inflation relationship',
          status: 'completed',
        },
        {
          id: '2b',
          title: 'central bank independence inflation',
          status: 'in-progress',
        },
        {
          id: '2c',
          title: 'governance inflation economics',
          status: 'pending',
        },
      ],
    },
    {
      id: '3',
      title: 'Evaluating Papers',
      description: 'Analyzing relevance and quality of found papers',
      status: 'pending',
      substeps: [
        { id: '3a', title: 'Content extraction', status: 'pending' },
        { id: '3b', title: 'Relevance scoring', status: 'pending' },
        { id: '3c', title: 'Quality assessment', status: 'pending' },
      ],
    },
    {
      id: '4',
      title: 'Generating Summaries',
      description: 'Creating concise summaries of relevant papers',
      status: 'pending',
    },
    {
      id: '5',
      title: 'Deep Research Analysis',
      description: 'Conducting recursive analysis for comprehensive coverage',
      status: 'pending',
    },
    {
      id: '6',
      title: 'Literature Review Generation',
      description:
        'Synthesizing findings into a comprehensive literature review',
      status: 'pending',
    },
  ]

  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      content:
        'I want to research the effect of institutional qualities on inflation',
      type: 'user',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: '2',
      content:
        "I'll help you research the effect of institutional qualities on inflation. Let me break this down into comprehensive search strategies and find relevant academic papers for you.",
      type: 'assistant',
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
    },
    {
      id: '3',
      content:
        "I've identified several key research dimensions: central bank independence, governance quality, legal frameworks, and property rights. Currently searching academic databases...",
      type: 'assistant',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
    },
  ]

  const mockLiteratureReview = `# The Effect of Institutional Qualities on Inflation

## Introduction

The relationship between institutional qualities and inflation has emerged as a crucial area of economic research, revealing that the strength and effectiveness of a country's institutions play a fundamental role in determining inflationary outcomes. This comprehensive analysis examines how various dimensions of institutional quality impact inflation control and monetary stability across developed and developing economies.

## Central Bank Independence: The Foundation of Price Stability

Central bank independence stands as the most extensively studied institutional factor affecting inflation outcomes. Research consistently demonstrates that countries with more independent central banks experience significantly lower inflation rates. This relationship operates through several mechanisms that enhance monetary policy credibility and effectiveness.

The evidence from developing countries is particularly compelling. A comprehensive study of 118 developing countries from 1980 to 2013 found that higher central bank independence is associated with lower inflation rates, with this effect being stronger in more democratic countries but still present in non-democratic ones. The relationship is robust across different specifications and methodologies, suggesting that all dimensions of central bank independence contribute to curbing inflation.

Long-term benefits of central bank independence are even more pronounced than short-term effects...`

  const handleSendMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      type: 'user',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setCurrentQuery('')

    // Mock AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content:
          "I'll start researching this topic for you. Let me search for relevant academic papers and analyze the current state of research.",
        type: 'assistant',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    }, 1000)
  }

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Desktop Layout */}
      <div className="hidden w-full md:flex">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Chat Interface */}
          <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
            <div className="flex h-full flex-col border-r border-gray-800">
              <ChatPanel
                messages={isResearching ? mockMessages : messages}
                currentQuery={currentQuery}
                onQueryChange={setCurrentQuery}
                onSendMessage={handleSendMessage}
                isResearching={isResearching}
              />
            </div>
          </ResizablePanel>

          {/* Resizable Handle */}
          <ResizableHandle withHandle />

          {/* Right Panel - Steps and Results with Tabs */}
          <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
            <RightPanel
              steps={isResearching ? mockSteps : steps}
              literatureReview={
                isResearching ? mockLiteratureReview : literatureReview
              }
              isGenerating={isResearching}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile Layout */}
      <div className="flex w-full flex-col md:hidden">
        <ResizablePanelGroup direction="vertical" className="h-full">
          {/* Mobile Chat - Full width */}
          <ResizablePanel defaultSize={65} minSize={40} maxSize={80}>
            <ChatPanel
              messages={isResearching ? mockMessages : messages}
              currentQuery={currentQuery}
              onQueryChange={setCurrentQuery}
              onSendMessage={handleSendMessage}
              isResearching={isResearching}
            />
          </ResizablePanel>

          {/* Resizable Handle for Mobile */}
          <ResizableHandle withHandle />

          {/* Mobile Bottom Panel - Steps/Results */}
          <ResizablePanel defaultSize={35} minSize={20} maxSize={60}>
            <div className="border-t border-gray-800">
              <RightPanel
                steps={isResearching ? mockSteps : steps}
                literatureReview={
                  isResearching ? mockLiteratureReview : literatureReview
                }
                isGenerating={isResearching}
                isMobile={true}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Demo Toggle Button */}
      <Button
        onClick={() => setIsResearching(!isResearching)}
        className="fixed right-4 bottom-4 z-50"
        variant="outline"
      >
        {isResearching ? 'Stop Demo' : 'Start Demo'}
      </Button>
    </div>
  )
}
