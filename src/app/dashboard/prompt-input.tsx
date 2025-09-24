'use client'

import { useActionState } from 'react'

import { ArrowUp, Globe, Loader2, Paperclip, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { researchAction } from '@/lib/actions'

export const PromptInput = () => {
  const [state, action, pending] = useActionState(researchAction, {})

  return (
    <>
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <div className="w-full max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            What do you want to research?
          </h1>
          <p className="mb-8 text-lg text-slate-300">
            Find and analyze academic papers with AI-powered search and insights
          </p>

          {/* Search Input */}
          <form action={action} className="mx-auto mb-8 w-full max-w-4xl">
            <div className="relative">
              <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 shadow-2xl backdrop-blur-sm">
                {/* Text area - much larger for paragraphs */}
                <div className="mb-4">
                  <Textarea
                    placeholder="Ask ResearchAI to do a research on..."
                    className="h-[120px] w-full resize-none overflow-y-auto border-0 bg-transparent text-lg text-white placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                    rows={4}
                    name="prompt"
                    defaultValue={state?.state?.prompt}
                    required
                    disabled={pending}
                  />
                </div>

                {/* Icons below the text area - like Lovable */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-slate-400 hover:text-white"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-3 py-2 text-slate-400 hover:text-white"
                    >
                      <Paperclip className="mr-2 h-4 w-4" />
                      Attach
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-3 py-2 text-slate-400 hover:text-white"
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      Public
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      type="submit"
                      disabled={pending}
                      className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-3 hover:from-purple-600 hover:to-pink-600"
                    >
                      {pending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <ArrowUp className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Quick Actions */}
          {/* <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="outline"
              className="border-slate-600 px-6 py-3 text-slate-300 hover:bg-slate-800"
            >
              <Search className="mr-2 h-4 w-4" />
              Search Papers
            </Button>
            <Button
              variant="outline"
              className="border-slate-600 px-6 py-3 text-slate-300 hover:bg-slate-800"
            >
              <FileText className="mr-2 h-4 w-4" />
              Analyze Document
            </Button>
            <Button
              variant="outline"
              className="border-slate-600 px-6 py-3 text-slate-300 hover:bg-slate-800"
            >
              <User className="mr-2 h-4 w-4" />
              Find Authors
            </Button>
          </div> */}
        </div>
      </main>
    </>
  )
}
