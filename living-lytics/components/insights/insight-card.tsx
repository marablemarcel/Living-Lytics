'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Lightbulb, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  AlertCircle, 
  Info, 
  CheckCircle,
  Eye,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  Sparkles
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface Insight {
  id: string
  content: string
  recommendations: string[]
  priority: 'high' | 'medium' | 'low'
  category: 'trend' | 'anomaly' | 'opportunity' | 'performance' | 'attribution' | 'root_cause' | 'strategic' | 'general'
  platform: string
  model_used: string
  tokens_used: number
  cost: number
  metadata: Record<string, any>
  dismissed: boolean
  viewed_at?: string | null
  actioned_at?: string | null
  feedback?: 'helpful' | 'not_helpful' | null
  feedback_at?: string | null
  confidence_score?: number
  created_at: string
}

export interface InsightCardProps {
  insight: Insight
  onView?: (id: string) => void
  onDismiss?: (id: string) => void
  onFeedback?: (id: string, feedback: 'helpful' | 'not_helpful') => void
  showActions?: boolean
}

/**
 * Get icon for insight category
 */
function getCategoryIcon(category: string) {
  switch (category) {
    case 'trend':
      return <TrendingUp className="h-4 w-4" />
    case 'anomaly':
      return <AlertCircle className="h-4 w-4" />
    case 'opportunity':
      return <Sparkles className="h-4 w-4" />
    case 'performance':
      return <Activity className="h-4 w-4" />
    case 'attribution':
      return <Users className="h-4 w-4" />
    case 'root_cause':
      return <Info className="h-4 w-4" />
    case 'strategic':
      return <DollarSign className="h-4 w-4" />
    default:
      return <Lightbulb className="h-4 w-4" />
  }
}

/**
 * Get priority badge configuration
 */
function getPriorityConfig(priority: string) {
  switch (priority) {
    case 'high':
      return {
        icon: <AlertCircle className="h-3 w-3" />,
        className: 'bg-red-500 hover:bg-red-600 text-white',
        label: 'High Priority'
      }
    case 'medium':
      return {
        icon: <Info className="h-3 w-3" />,
        className: 'bg-blue-500 hover:bg-blue-600 text-white',
        label: 'Medium Priority'
      }
    case 'low':
      return {
        icon: <CheckCircle className="h-3 w-3" />,
        className: 'bg-gray-500 hover:bg-gray-600 text-white',
        label: 'Low Priority'
      }
    default:
      return {
        icon: null,
        className: 'bg-gray-200 text-gray-700',
        label: 'Unknown'
      }
  }
}

/**
 * Get confidence badge color
 */
function getConfidenceBadge(score?: number) {
  if (!score) return null
  
  if (score >= 0.8) {
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">High Confidence</Badge>
  } else if (score >= 0.5) {
    return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Preliminary</Badge>
  }
  return null
}

/**
 * InsightCard Component
 * 
 * Displays an AI-generated marketing insight with actions and metadata
 */
export function InsightCard({ 
  insight, 
  onView, 
  onDismiss, 
  onFeedback,
  showActions = true 
}: InsightCardProps) {
  const [localFeedback, setLocalFeedback] = useState<'helpful' | 'not_helpful' | null>(
    insight.feedback || null
  )
  const [isViewed, setIsViewed] = useState(!!insight.viewed_at)
  
  const priorityConfig = getPriorityConfig(insight.priority)
  const isNew = !insight.viewed_at && !insight.dismissed
  const isActioned = !!insight.actioned_at
  
  const handleView = () => {
    if (!isViewed) {
      setIsViewed(true)
      onView?.(insight.id)
    }
  }
  
  const handleDismiss = () => {
    onDismiss?.(insight.id)
  }
  
  const handleFeedback = (feedback: 'helpful' | 'not_helpful') => {
    setLocalFeedback(feedback)
    onFeedback?.(insight.id, feedback)
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "transition-all",
        insight.dismissed && "opacity-60"
      )}
    >
      <Card 
        className={cn(
          "hover:shadow-lg transition-shadow",
          isNew && "ring-2 ring-blue-500 ring-offset-2"
        )}
        role="article"
        aria-label={`Insight: ${insight.category}`}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {getCategoryIcon(insight.category)}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-lg capitalize">
                    {insight.category} Insight
                  </CardTitle>
                  {isNew && (
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      New
                    </Badge>
                  )}
                  {isActioned && (
                    <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3" />
                      Actioned
                    </Badge>
                  )}
                  {getConfidenceBadge(insight.confidence_score)}
                </div>
                <CardDescription className="text-sm">
                  {insight.content}
                </CardDescription>
              </div>
            </div>
            <Badge className={cn('shrink-0', priorityConfig.className)}>
              <span className="flex items-center gap-1">
                {priorityConfig.icon}
                <span className="capitalize">{insight.priority}</span>
              </span>
            </Badge>
          </div>
        </CardHeader>
        
        {insight.recommendations && insight.recommendations.length > 0 && (
          <CardContent className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                🎯 Recommended Actions:
              </h4>
              <ul className="space-y-1.5">
                {insight.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {showActions && (
              <div className="flex flex-wrap gap-2 pt-3 border-t">
                {isNew && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleView}
                    className="gap-1"
                    aria-label="Mark insight as read"
                  >
                    <Eye className="h-4 w-4" />
                    Mark as Read
                  </Button>
                )}
                
                {!insight.dismissed && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDismiss}
                    className="gap-1"
                    aria-label="Dismiss insight"
                  >
                    <EyeOff className="h-4 w-4" />
                    Dismiss
                  </Button>
                )}
                
                <div className="flex gap-1 ml-auto">
                  <Button
                    variant={localFeedback === 'helpful' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleFeedback('helpful')}
                    className="gap-1"
                    aria-label="Mark as helpful"
                    disabled={!!localFeedback}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {localFeedback === 'helpful' && 'Helpful'}
                  </Button>
                  <Button
                    variant={localFeedback === 'not_helpful' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleFeedback('not_helpful')}
                    className="gap-1"
                    aria-label="Mark as not helpful"
                    disabled={!!localFeedback}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    {localFeedback === 'not_helpful' && 'Not Helpful'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
        
        <CardFooter className="text-xs text-muted-foreground flex items-center justify-between">
          <span>
            Generated {formatDistanceToNow(new Date(insight.created_at), { addSuffix: true })}
          </span>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="capitalize text-xs">
              {insight.platform}
            </Badge>
            {insight.confidence_score && (
              <span className="text-xs text-muted-foreground">
                {Math.round(insight.confidence_score * 100)}% confidence
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
