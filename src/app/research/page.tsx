'use client'

import { useState } from 'react'

import { MessageSquare, SearchIcon } from 'lucide-react'

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from '@/components/ai-elements/chain-of-thought'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { Message, MessageContent } from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from '@/components/ai-elements/prompt-input'
import { ResultPanel } from '@/components/research/result-panel'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

export type ChatMessage = {
  id: string
  content: string
  from: 'user' | 'assistant' | 'system'
  timestamp: Date
}

const InputDemo = () => {
  const [text, setText] = useState<string>('')

  const handleSubmit = (message: PromptInputMessage) => {}

  const messages: ChatMessage[] = [
    {
      id: '1',
      content:
        'I want to research the effect of institutional qualities on inflation',
      from: 'user',
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
    },
    {
      id: '2',
      content:
        "I'll help you research the effect of institutional qualities on inflation. Let me break this down into comprehensive search strategies and find relevant academic papers for you.",
      from: 'assistant',
      timestamp: new Date(Date.now() - 19 * 60 * 1000),
    },
    {
      id: '3',
      content:
        "I've identified several key research dimensions: central bank independence, governance quality, legal frameworks, and property rights. Currently searching academic databases...",
      from: 'assistant',
      timestamp: new Date(Date.now() - 18 * 60 * 1000),
    },
    {
      id: '4',
      content:
        "I've found a number of papers related to central bank independence and inflation. Would you like a summary of the most relevant ones?",
      from: 'assistant',
      timestamp: new Date(Date.now() - 17 * 60 * 1000),
    },
    {
      id: '5',
      content:
        'Yes, please provide a summary of the most relevant papers on central bank independence.',
      from: 'user',
      timestamp: new Date(Date.now() - 16 * 60 * 1000),
    },
    {
      id: '6',
      content:
        "Paper 1: 'Central Bank Independence and Inflation: Evidence from Developing Countries' - This paper finds a strong negative correlation between central bank independence and inflation rates.",
      from: 'assistant',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
    },
    {
      id: '7',
      content:
        "Paper 2: 'Governance Quality and Macroeconomic Stability' - This study highlights the role of governance in maintaining low inflation.",
      from: 'assistant',
      timestamp: new Date(Date.now() - 14 * 60 * 1000),
    },
    {
      id: '8',
      content:
        'Can you also look for papers about legal frameworks and their impact on inflation?',
      from: 'user',
      timestamp: new Date(Date.now() - 13 * 60 * 1000),
    },
    {
      id: '9',
      content: 'Searching for papers on legal frameworks and inflation...',
      from: 'assistant',
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
    },
    {
      id: '10',
      content:
        "Paper 3: 'Legal Institutions and Price Stability' - This paper suggests that strong legal institutions contribute to lower inflation volatility.",
      from: 'assistant',
      timestamp: new Date(Date.now() - 11 * 60 * 1000),
    },
    {
      id: '11',
      content:
        'What about property rights? Are there any studies linking property rights to inflation?',
      from: 'user',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
    },
    {
      id: '12',
      content:
        "Yes, Paper 4: 'Property Rights and Economic Performance' - This research finds that secure property rights are associated with better inflation outcomes.",
      from: 'assistant',
      timestamp: new Date(Date.now() - 9 * 60 * 1000),
    },
    {
      id: '13',
      content:
        'Can you summarize the main findings across all these dimensions?',
      from: 'user',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
    },
    {
      id: '14',
      content:
        'Certainly! Across the literature, strong institutions—central bank independence, good governance, robust legal frameworks, and secure property rights—are consistently linked to lower and more stable inflation.',
      from: 'assistant',
      timestamp: new Date(Date.now() - 7 * 60 * 1000),
    },
    {
      id: '15',
      content:
        'Are there any notable exceptions or countries where these relationships do not hold?',
      from: 'user',
      timestamp: new Date(Date.now() - 6 * 60 * 1000),
    },
    {
      id: '16',
      content:
        'Some studies note exceptions in countries with political instability or weak enforcement, where institutional reforms have less immediate impact on inflation.',
      from: 'assistant',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: '17',
      content:
        'Thank you. Can you generate a brief literature review based on these findings?',
      from: 'user',
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
    },
    {
      id: '18',
      content:
        'Certainly! Here is a brief literature review: The effect of institutional qualities on inflation has been widely studied. Evidence shows that central bank independence, governance quality, legal frameworks, and property rights all play significant roles in maintaining price stability...',
      from: 'assistant',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
    },
    {
      id: '19',
      content:
        'This is very helpful. Can you suggest further reading or recent papers on this topic?',
      from: 'user',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
    },
    {
      id: '20',
      content:
        "Of course! I recommend 'Institutional Quality and Inflation: A Global Perspective' (2022) and 'The Political Economy of Inflation Control' (2021) for recent insights.",
      from: 'assistant',
      timestamp: new Date(Date.now() - 1 * 60 * 1000),
    },
  ]

  const mockLiteratureReview = `# The Effect of Institutional Qualities on Inflation

## Introduction

The relationship between institutional qualities and inflation has emerged as a crucial area of economic research, revealing that the strength and effectiveness of a country's institutions play a fundamental role in determining inflationary outcomes. This comprehensive analysis examines how various dimensions of institutional quality impact inflation control and monetary stability across developed and developing economies.

## Central Bank Independence: The Foundation of Price Stability

Central bank independence stands as the most extensively studied institutional factor affecting inflation outcomes. Research consistently demonstrates that countries with more independent central banks experience significantly lower inflation rates. This relationship operates through several mechanisms that enhance monetary policy credibility and effectiveness.

The evidence from developing countries is particularly compelling. A comprehensive study of 118 developing countries from 1980 to 2013 found that higher central bank independence is associated with lower inflation rates, with this effect being stronger in more democratic countries but still present in non-democratic ones. The relationship is robust across different specifications and methodologies, suggesting that all dimensions of central bank independence contribute to curbing inflation.

Long-term benefits of central bank independence are even more pronounced than short-term effects...`

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={40} minSize={40} maxSize={50}>
          <div className="flex h-full flex-col">
            <ScrollArea className="h-full overflow-y-scroll py-5">
              <div className="mx-auto w-11/12">
                <Conversation
                  className="relative w-full"
                  //   style={{ height: '700px' }}
                >
                  <ConversationContent>
                    {messages.length === 0 ? (
                      <ConversationEmptyState
                        icon={<MessageSquare className="size-12" />}
                        title="No messages yet"
                        description="Start a conversation to see messages here"
                      />
                    ) : (
                      messages.map((message, index) => (
                        <div key={message.id}>
                          <Message from={message.from}>
                            <MessageContent>{message.content}</MessageContent>
                          </Message>

                          {/* Show Chain of Thought for specific assistant messages */}
                          {message.from === 'assistant' &&
                            (message.content.includes('searching') ||
                              message.content.includes('found') ||
                              message.content.includes('research')) && (
                              <div className="mt-4 ml-4">
                                <ChainOfThought defaultOpen>
                                  <ChainOfThoughtHeader />
                                  <ChainOfThoughtContent>
                                    <ChainOfThoughtStep
                                      icon={SearchIcon}
                                      label="Searching for information"
                                      status="complete"
                                    >
                                      <ChainOfThoughtSearchResults>
                                        <ChainOfThoughtSearchResult>
                                          Result 1
                                        </ChainOfThoughtSearchResult>
                                      </ChainOfThoughtSearchResults>
                                    </ChainOfThoughtStep>
                                  </ChainOfThoughtContent>
                                </ChainOfThought>
                              </div>
                            )}
                        </div>
                      ))
                    )}
                  </ConversationContent>
                  <ConversationScrollButton />
                </Conversation>
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>

            <div className="bg-white">
              <PromptInput onSubmit={handleSubmit} globalDrop multiple>
                <PromptInputBody>
                  <PromptInputTextarea
                    onChange={(e) => setText(e.target.value)}
                    value={text}
                  />
                </PromptInputBody>
                <PromptInputToolbar>
                  <PromptInputSubmit disabled={!text} />
                </PromptInputToolbar>
              </PromptInput>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={60} minSize={50} maxSize={60}>
          <ResultPanel
            literatureReview={mockLiteratureReview}
            isGenerating={true}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default InputDemo
