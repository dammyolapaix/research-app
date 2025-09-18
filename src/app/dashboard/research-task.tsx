'use client'

import { useRealtimeRun } from '@trigger.dev/react-hooks'

import { findAndSummarizePapersTask } from '@/services/trigger/find-summarize-papers'

export default function ResearchTask({ taskId }: { taskId: string }) {
  const { run, error } =
    useRealtimeRun<typeof findAndSummarizePapersTask>(taskId)

  if (!run && !error) {
    return (
      <div className="grid min-h-screen place-items-center bg-gray-900 p-8">
        <div className="text-gray-200">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-gray-900 p-8">
        <div className="text-rose-500">Error: {error.message}</div>
      </div>
    )
  }

  if (!run) {
    return (
      <div className="grid min-h-screen place-items-center bg-gray-900 p-8">
        <div className="text-gray-200">No run data available</div>
      </div>
    )
  }

  console.log('Run: ', run.metadata)

  return (
    <div className="text-white">
      <div>ResearchTask: {taskId}</div>

      {!run.output ? (
        <div>
          <h2>Status</h2>
          {/* @ts-ignore */}
          <div>{run.metadata?.status?.label}</div>
        </div>
      ) : (
        <div>
          <h2>Literature Review</h2>
          <div>{run.output.literatureReview}</div>
        </div>
      )}
    </div>
  )
}
