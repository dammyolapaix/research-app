'use client'

import { useState } from 'react'

import { Copy, Download, FileText, Maximize2, Minimize2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

import { ResearchEditor } from './research-editor'

type ResultPanelProps = {
  literatureReview: string
  isGenerating: boolean
}

export function ResultPanel({
  literatureReview,
  isGenerating,
}: ResultPanelProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(literatureReview)
    // You could add a toast notification here
  }

  const handleDownload = () => {
    const blob = new Blob([literatureReview], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'literature-review.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatMarkdown = (text: string) => {
    // Simple markdown-to-HTML conversion for display
    return text
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-2xl font-bold text-white mb-4 mt-6 first:mt-0">$1</h1>'
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-xl font-semibold text-white mb-3 mt-5">$1</h2>'
      )
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-lg font-medium text-white mb-2 mt-4">$1</h3>'
      )
      .replace(/^\* (.*$)/gim, '<li class="text-gray-300 mb-1">$1</li>')
      .replace(
        /^([^<\n]+)$/gim,
        '<p class="text-gray-300 mb-3 leading-relaxed">$1</p>'
      )
      .replace(/\n\n/g, '\n')
  }

  if (!literatureReview && !isGenerating) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900">
        <div className="text-center text-gray-500">
          <FileText className="mx-auto mb-4 h-16 w-16" />
          <h3 className="mb-2 text-xl font-medium">No Research Yet</h3>
          <p className="text-sm">
            Start a research conversation to see results here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex h-full flex-col bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">
              Literature Review
            </h2>
            {isGenerating && (
              <div className="flex items-center gap-2 text-sm text-yellow-400">
                <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-400"></div>
                Generating...
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8 text-gray-400 hover:text-white"
              disabled={!literatureReview}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="h-8 w-8 text-gray-400 hover:text-white"
              disabled={!literatureReview}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 text-gray-400 hover:text-white"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isGenerating && !literatureReview ? (
          <ScrollArea className="h-full p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 bg-gray-800" />
              <Skeleton className="h-4 w-full bg-gray-800" />
              <Skeleton className="h-4 w-full bg-gray-800" />
              <Skeleton className="h-4 w-2/3 bg-gray-800" />

              <div className="mt-8">
                <Skeleton className="h-6 w-1/2 bg-gray-800" />
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full bg-gray-800" />
                  <Skeleton className="h-4 w-full bg-gray-800" />
                  <Skeleton className="h-4 w-3/4 bg-gray-800" />
                </div>
              </div>

              <div className="mt-8">
                <Skeleton className="h-6 w-2/3 bg-gray-800" />
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full bg-gray-800" />
                  <Skeleton className="h-4 w-5/6 bg-gray-800" />
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="h-full">
            <ResearchEditor
              initialContent={formatMarkdown(literatureReview)}
              onContentChange={(content) => {
                // Here you could handle content changes if needed
                console.log('Content updated:', content)
              }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      {literatureReview && !isGenerating && (
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Generated {new Date().toLocaleString()}</span>
            <span>{literatureReview.length} characters</span>
          </div>
        </div>
      )}
    </div>
  )
}
