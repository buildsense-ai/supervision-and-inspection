"use client"

import { useState, useEffect, useRef } from "react"
import {
  AlertCircle,
  ClipboardList,
  Calendar,
  FileCheck,
  Edit,
  FileText,
  MapPin,
  Clock,
  Users,
  ChevronDown,
  Download,
  Share2,
  Trash2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Mock data imports (in a real app, this would come from API or context)
import { mockIssues, mockDailyLogs, mockSupervisionRecords, mockMeetingMinutes } from "@/lib/mock-data"

interface EventsViewProps {
  initialEventType?: "issue" | "supervision" | "daily-log" | "meeting"
  highlightedRecordId?: string
  searchQuery?: string
}

export function EventsView({ initialEventType, highlightedRecordId, searchQuery = "" }: EventsViewProps) {
  const [activeTab, setActiveTab] = useState<string>(initialEventType || "issue")
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const highlightedRef = useRef<HTMLDivElement>(null)

  // Update local search when prop changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  // Scroll to highlighted record if provided
  useEffect(() => {
    if (highlightedRecordId && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ behavior: "smooth", block: "center" })

      // Add a temporary highlight effect
      highlightedRef.current.classList.add("ring-2", "ring-primary", "ring-offset-2")
      setTimeout(() => {
        highlightedRef.current?.classList.remove("ring-2", "ring-primary", "ring-offset-2")
      }, 2000)

      // Auto-expand the highlighted card
      setExpandedCardId(highlightedRecordId)
    }
  }, [highlightedRecordId])

  // Reset selected events when tab changes
  useEffect(() => {
    setSelectedEvents([])
    setActiveFilters([])
  }, [activeTab])

  // Filter events based on active tab, search query, and filters
  const getFilteredEvents = () => {
    let events = []

    switch (activeTab) {
      case "issue":
        events = mockIssues
        break
      case "supervision":
        events = mockSupervisionRecords
        break
      case "daily-log":
        events = mockDailyLogs
        break
      case "meeting":
        events = mockMeetingMinutes
        break
      default:
        events = []
    }

    // Apply search filter
    if (localSearchQuery) {
      events = events.filter(
        (event) =>
          event.title.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
          (event.location && event.location.toLowerCase().includes(localSearchQuery.toLowerCase())) ||
          (event.description && event.description.toLowerCase().includes(localSearchQuery.toLowerCase())),
      )
    }

    // Apply tag filters
    if (activeFilters.length > 0) {
      events = events.filter((event) => {
        // Check if any of the event's tags match any of the active filters
        return (
          (event.tags && event.tags.some((tag) => activeFilters.includes(tag))) ||
          (activeFilters.includes("pending") && event.status === "pending") ||
          (activeFilters.includes("resolved") && event.status === "resolved") ||
          (activeFilters.includes("completed") && event.status === "completed")
        )
      })
    }

    return events
  }

  const filteredEvents = getFilteredEvents()

  const handleCheckboxChange = (eventId: string) => {
    setSelectedEvents((prev) => (prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]))
  }

  const toggleCardExpansion = (eventId: string) => {
    setExpandedCardId(expandedCardId === eventId ? null : eventId)
  }

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }

  // Get border color based on event type
  const getBorderColor = (type: string) => {
    switch (type) {
      case "issue":
        return "border-l-red-500"
      case "supervision":
        return "border-l-blue-500"
      case "daily-log":
        return "border-l-green-500"
      case "meeting":
        return "border-l-amber-500"
      default:
        return "border-l-primary"
    }
  }

  // Get icon color based on event type
  const getIconColor = (type: string) => {
    switch (type) {
      case "issue":
        return "text-red-500"
      case "supervision":
        return "text-blue-500"
      case "daily-log":
        return "text-green-500"
      case "meeting":
        return "text-amber-500"
      default:
        return "text-primary"
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="destructive">待处理</Badge>
      case "resolved":
        return <Badge variant="outline">已闭环</Badge>
      case "completed":
        return <Badge variant="outline">已完成</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Tab configuration
  const tabs = [
    {
      id: "issue",
      label: "问题记录",
      icon: AlertCircle,
      color: "text-red-500",
      count: mockIssues.length,
    },
    {
      id: "supervision",
      label: "旁站记录",
      icon: ClipboardList,
      color: "text-blue-500",
      count: mockSupervisionRecords.length,
    },
    {
      id: "daily-log",
      label: "监理日志",
      icon: Calendar,
      color: "text-green-500",
      count: mockDailyLogs.length,
    },
    {
      id: "meeting",
      label: "会议纪要",
      icon: FileCheck,
      color: "text-amber-500",
      count: mockMeetingMinutes.length,
    },
  ]

  // Filter tags based on active tab
  const getFilterTags = () => {
    switch (activeTab) {
      case "issue":
        return [
          { id: "pending", label: "待处理", color: "bg-red-100 text-red-800" },
          { id: "resolved", label: "已闭环", color: "bg-green-100 text-green-800" },
          { id: "structure", label: "结构", color: "bg-blue-100 text-blue-800" },
          { id: "electrical", label: "电气", color: "bg-amber-100 text-amber-800" },
          { id: "mechanical", label: "机械", color: "bg-purple-100 text-purple-800" },
        ]
      case "supervision":
        return [
          { id: "completed", label: "已完成", color: "bg-green-100 text-green-800" },
          { id: "foundation", label: "基础", color: "bg-blue-100 text-blue-800" },
          { id: "concrete", label: "混凝土", color: "bg-amber-100 text-amber-800" },
          { id: "steel", label: "钢结构", color: "bg-purple-100 text-purple-800" },
        ]
      case "daily-log":
        return [
          { id: "weather", label: "天气", color: "bg-blue-100 text-blue-800" },
          { id: "personnel", label: "人员", color: "bg-green-100 text-green-800" },
          { id: "progress", label: "进度", color: "bg-amber-100 text-amber-800" },
        ]
      case "meeting":
        return [
          { id: "coordination", label: "协调会", color: "bg-blue-100 text-blue-800" },
          { id: "technical", label: "技术交底", color: "bg-green-100 text-green-800" },
          { id: "safety", label: "安全会议", color: "bg-red-100 text-red-800" },
        ]
      default:
        return []
    }
  }

  const filterTags = getFilterTags()

  return (
    <div className="flex flex-col h-full">
      {/* Compact tabs */}
      <div className="flex overflow-x-auto pb-2 hide-scrollbar">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            size="sm"
            className={cn("flex items-center gap-1.5 mr-1.5 whitespace-nowrap", activeTab === tab.id && "bg-muted/80")}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className={`h-3.5 w-3.5 ${tab.color}`} />
            <span className="hidden sm:inline">{tab.label}</span>
            <Badge variant="secondary" className="ml-0.5 px-1 min-w-5 text-xs">
              {tab.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Search bar - removed since we now have global search */}

      {/* Filter tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {filterTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="outline"
            className={cn(
              "cursor-pointer transition-colors",
              activeFilters.includes(tag.id) ? tag.color : "hover:bg-muted",
            )}
            onClick={() => toggleFilter(tag.id)}
          >
            {tag.label}
          </Badge>
        ))}
      </div>

      {/* Selected items actions */}
      {selectedEvents.length > 0 && (
        <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5 rounded-md mb-3">
          <span className="text-sm font-medium">已选择 {selectedEvents.length} 项</span>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>导出所选</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>分享所选</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>删除所选</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
              合并
            </Button>
            <Button size="sm" className="h-7 px-2 text-xs">
              生成记录
            </Button>
          </div>
        </div>
      )}

      {/* Events list */}
      <div className="flex-1 overflow-auto -mx-4 px-4">
        <div className="grid gap-3">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Card
                key={event.id}
                className={cn(
                  "overflow-hidden border-l-4 transition-all duration-200",
                  getBorderColor(event.type),
                  event.id === highlightedRecordId && "ring-2 ring-primary",
                  expandedCardId === event.id && "shadow-md",
                )}
                ref={event.id === highlightedRecordId ? highlightedRef : null}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {/* Checkbox for selection */}
                      <Checkbox
                        id={`select-${event.id}`}
                        checked={selectedEvents.includes(event.id)}
                        onCheckedChange={() => handleCheckboxChange(event.id)}
                        className="h-3.5 w-3.5"
                        onClick={(e) => e.stopPropagation()}
                      />

                      {/* Status badge for issues */}
                      {event.type === "issue" && getStatusBadge(event.status)}
                    </div>
                    <div className="flex items-center gap-1">
                      <event.icon className={`h-4 w-4 ${getIconColor(event.type)}`} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleCardExpansion(event.id)}
                      >
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            expandedCardId === event.id && "rotate-180",
                          )}
                        />
                      </Button>
                    </div>
                  </div>

                  <div onClick={() => toggleCardExpansion(event.id)} className="cursor-pointer">
                    <h3 className="font-medium text-sm line-clamp-1 mb-1.5">{event.title}</h3>

                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{event.date}</span>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}

                      {event.time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{event.time}</span>
                        </div>
                      )}

                      {event.attendees && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{event.attendees}人</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded content */}
                  {expandedCardId === event.id && (
                    <div className="mt-3 pt-3 border-t text-sm">
                      <p className="text-muted-foreground mb-2">{event.description || "暂无详细描述"}</p>

                      {/* Tags */}
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {event.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Additional details specific to event type */}
                      {event.type === "issue" && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <p className="text-xs text-muted-foreground">责任单位</p>
                            <p className="text-xs font-medium">{event.responsibleUnit || "未指定"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">截止日期</p>
                            <p className="text-xs font-medium">{event.dueDate || "未设置"}</p>
                          </div>
                        </div>
                      )}

                      {event.type === "supervision" && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <p className="text-xs text-muted-foreground">监理工程师</p>
                            <p className="text-xs font-medium">{event.supervisor || "未指定"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">施工单位</p>
                            <p className="text-xs font-medium">{event.contractor || "未指定"}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex justify-end gap-1.5 p-2 pt-0 border-t mt-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>生成文档</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>编辑</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>没有找到符合条件的记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
