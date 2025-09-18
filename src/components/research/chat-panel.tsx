'use client'

import { useEffect, useRef, useState } from 'react'

import { Bot, Send, User } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

import type { ChatMessage } from './research-interface'

type ChatPanelProps = {
  messages: ChatMessage[]
  currentQuery: string
  onQueryChange: (query: string) => void
  onSendMessage: (message: string) => void
  isResearching: boolean
}

export function ChatPanel({
  messages,
  currentQuery,
  onQueryChange,
  onSendMessage,
  isResearching,
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState(currentQuery)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(currentQuery)
  }, [currentQuery])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim())
      setInputValue('')
      onQueryChange('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-lg font-semibold text-white">Research Assistant</h2>
        <p className="text-sm text-gray-400">
          Ask me to research any academic topic
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-500">
              <Bot className="mx-auto mb-4 h-12 w-12" />
              <p className="mb-2 text-lg font-medium">
                Start a research conversation
              </p>
              <p className="text-sm">
                Ask me to research any academic topic and I'll find relevant
                papers for you.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback
                    className={`text-xs ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-200'
                    }`}
                  >
                    {message.type === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`max-w-[80%] ${message.type === 'user' ? 'items-end' : 'items-start'} flex flex-col`}
                >
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <span className="mt-1 text-xs text-gray-500">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to research something..."
            className="flex-1 border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
            disabled={isResearching}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isResearching}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {isResearching && (
          <p className="mt-2 text-xs text-yellow-400">
            Research in progress...
          </p>
        )}
      </div>
    </div>
  )
}

