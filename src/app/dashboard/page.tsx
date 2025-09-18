import { Calendar, Eye, Heart } from 'lucide-react'

import { TriggerProvider } from '@/components/trigger-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { PromptInput } from './prompt-input'
import ResearchTask from './research-task'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    taskId: string
    publicAccessToken: string
  }>
}) {
  const { taskId, publicAccessToken } = await searchParams

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/50 to-slate-900/80"></div>
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl"></div>
      <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl"></div>

      {/* Hero Section */}
      {/* Search Input */}
      {taskId && publicAccessToken ? (
        <TriggerProvider accessToken={publicAccessToken}>
          <ResearchTask taskId={taskId} />
        </TriggerProvider>
      ) : (
        <PromptInput />
      )}

      {/* Community Section - Below the hero */}
      <section className="relative z-10 container mx-auto px-6 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-white">
              From the Community
            </h2>
            <p className="text-slate-400">
              Explore trending research and popular papers
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select defaultValue="popular">
              <SelectTrigger className="w-32 border-slate-700 bg-slate-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-700 bg-slate-800">
                <SelectItem value="popular" className="text-white">
                  Popular
                </SelectItem>
                <SelectItem value="recent" className="text-white">
                  Recent
                </SelectItem>
                <SelectItem value="trending" className="text-white">
                  Trending
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              View All →
            </Button>
          </div>
        </div>

        {/* Filter Tags */}
        <div className="mb-8 flex flex-wrap gap-2">
          {[
            'All',
            'AI/ML',
            'Economics',
            'Medicine',
            'Physics',
            'Computer Science',
            'Biology',
          ].map((tag) => (
            <Badge
              key={tag}
              variant={tag === 'All' ? 'default' : 'outline'}
              className={`cursor-pointer transition-colors ${
                tag === 'All'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'border-slate-600 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Research Papers Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Macroeconomic Determinants of Inflation in Ghana',
              author: 'Dr. Kwame Asante',
              institution: 'University of Ghana',
              year: '2023',
              views: 1247,
              likes: 89,
              tags: ['Economics', 'Macroeconomics'],
              abstract:
                'A comprehensive analysis of inflation determinants using co-integration approach...',
            },
            {
              title: 'AI-Powered Research Analysis Framework',
              author: 'Dr. Sarah Johnson',
              institution: 'MIT',
              year: '2024',
              views: 2156,
              likes: 156,
              tags: ['AI/ML', 'Research Methods'],
              abstract:
                'Novel framework for automated research paper analysis and insight generation...',
            },
            {
              title: 'Climate Change Impact on Agricultural Productivity',
              author: 'Dr. Maria Rodriguez',
              institution: 'Stanford University',
              year: '2023',
              views: 1893,
              likes: 134,
              tags: ['Climate Science', 'Agriculture'],
              abstract:
                'Longitudinal study examining climate change effects on crop yields across regions...',
            },
          ].map((paper, index) => (
            <Card
              key={index}
              className="group cursor-pointer border-slate-700 bg-slate-800/50 transition-colors hover:bg-slate-800/70"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight text-white transition-colors group-hover:text-purple-300">
                      {paper.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-slate-400">
                      {paper.author} • {paper.institution}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                  >
                    {paper.year}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 line-clamp-3 text-sm text-slate-300">
                  {paper.abstract}
                </p>
                <div className="mb-4 flex flex-wrap gap-1">
                  {paper.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-slate-700 text-xs text-slate-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{paper.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{paper.likes}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>2 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
