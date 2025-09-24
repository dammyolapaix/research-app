'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { UIMessage, useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import hardenReactMarkdown from 'harden-react-markdown'
import { MessageSquare, SearchIcon, Wand2Icon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

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
import { OpenAlexParamsSchemasType } from '@/lib/research'

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from './ai-elements/chain-of-thought'
import { Loader } from './ai-elements/loader'
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from './ai-elements/sources'

// Create a hardened version of ReactMarkdown
const HardenedMarkdown = hardenReactMarkdown(ReactMarkdown)

type Props = {
  id: string
  initialMessages: UIMessage[]
}

export default function Chat({ id, initialMessages }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [input, setInput] = useState('')

  const { messages, sendMessage, status } = useChat({
    id,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: '/api/research',
      // only send the last message to the server:
      prepareSendMessagesRequest({ messages, id }) {
        return { body: { message: messages[messages.length - 1], id } }
      },
    }),
  })

  const prompt = searchParams.get('prompt')

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text)

    if (!hasText) return

    sendMessage({ text: message.text! })
    setInput('')
  }

  useEffect(() => {
    if (prompt) {
      handleSubmit({ text: prompt })
      router.push(pathname as '/research/[id]')
    }
  }, [prompt])

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
                  style={{ height: '700px' }}
                >
                  <ConversationContent>
                    {messages.length === 0 ? (
                      <ConversationEmptyState
                        icon={<MessageSquare className="size-12" />}
                        title="No messages yet"
                        description="Start a conversation to see messages here"
                      />
                    ) : (
                      messages.map((message) => (
                        <div key={message.id}>
                          {message.parts.map((part) => {
                            switch (part.type) {
                              case 'text':
                                return (
                                  <Message key={message.id} from={message.role}>
                                    <MessageContent key={message.id}>
                                      <HardenedMarkdown>
                                        {part.text}
                                      </HardenedMarkdown>
                                    </MessageContent>
                                  </Message>
                                )

                              case 'tool-generateOpenAlexParams':
                                return (
                                  <ChainOfThought defaultOpen>
                                    <ChainOfThoughtHeader />
                                    <ChainOfThoughtContent>
                                      <ChainOfThoughtStep
                                        icon={Wand2Icon}
                                        label="Generating search queries"
                                        status="complete"
                                      >
                                        <ChainOfThoughtSearchResults>
                                          {(
                                            part.output as OpenAlexParamsSchemasType
                                          )?.queries?.map((query) => (
                                            <ChainOfThoughtSearchResult
                                              key={query.search}
                                            >
                                              {query.search}
                                            </ChainOfThoughtSearchResult>
                                          ))}
                                        </ChainOfThoughtSearchResults>
                                      </ChainOfThoughtStep>
                                    </ChainOfThoughtContent>
                                  </ChainOfThought>
                                )

                              case 'tool-searchPapers':
                                const papers = part.output as Array<{
                                  title: string
                                  url: string
                                }>
                                return (
                                  <ChainOfThought defaultOpen>
                                    <ChainOfThoughtHeader />
                                    <ChainOfThoughtContent>
                                      <ChainOfThoughtStep
                                        icon={SearchIcon}
                                        label="Searching for papers"
                                        status="complete"
                                      >
                                        <Sources>
                                          <SourcesTrigger
                                            count={papers?.length || 0}
                                          >
                                            Found {papers?.length || 0} research
                                            papers
                                          </SourcesTrigger>
                                          <SourcesContent>
                                            {papers?.map((paper, index) => (
                                              <Source
                                                key={index}
                                                href={paper.url}
                                                title={paper.title}
                                              />
                                            ))}
                                          </SourcesContent>
                                        </Sources>
                                      </ChainOfThoughtStep>
                                    </ChainOfThoughtContent>
                                  </ChainOfThought>
                                )
                            }
                          })}
                        </div>
                      ))
                    )}
                    {status === 'submitted' && <Loader />}
                  </ConversationContent>
                  <ConversationScrollButton />
                </Conversation>
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>

            <div className="bg-white">
              <PromptInput onSubmit={handleSubmit} globalDrop>
                <PromptInputBody>
                  <PromptInputTextarea
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                  />
                </PromptInputBody>
                <PromptInputToolbar>
                  <PromptInputSubmit
                    disabled={!input && !status}
                    status={status}
                  />
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
