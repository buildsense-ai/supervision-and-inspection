"use client"

import { BarChart3, AlertCircle, ClipboardList, Calendar, FileCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// Mock data imports
import { mockIssues, mockDailyLogs, mockSupervisionRecords, mockMeetingMinutes } from "@/lib/mock-data"

export function OverviewView() {
  // Calculate statistics
  const pendingIssues = mockIssues.filter((issue) => issue.status === "pending").length
  const resolvedIssues = mockIssues.filter((issue) => issue.status === "resolved").length
  const totalIssues = mockIssues.length
  const issueResolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-red-500" />
              问题记录
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold">{totalIssues}</div>
            <div className="text-xs text-muted-foreground mt-1">
              待处理: {pendingIssues} | 已闭环: {resolvedIssues}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-blue-500" />
              旁站记录
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold">{mockSupervisionRecords.length}</div>
            <div className="text-xs text-muted-foreground mt-1">本周新增: {mockSupervisionRecords.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-green-500" />
              监理日志
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold">{mockDailyLogs.length}</div>
            <div className="text-xs text-muted-foreground mt-1">本周新增: {mockDailyLogs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-amber-500" />
              会议纪要
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold">{mockMeetingMinutes.length}</div>
            <div className="text-xs text-muted-foreground mt-1">本周新增: {mockMeetingMinutes.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress section */}
      <Card>
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            问题闭环率
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm">{issueResolutionRate}%</span>
            <span className="text-xs text-muted-foreground">
              {resolvedIssues}/{totalIssues}
            </span>
          </div>
          <Progress value={issueResolutionRate} className="h-2" />
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card>
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm font-medium">最近活动</CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          {[...mockIssues, ...mockDailyLogs, ...mockSupervisionRecords, ...mockMeetingMinutes]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3)
            .map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="flex items-start gap-2 text-sm">
                  <Icon className={`h-4 w-4 mt-0.5 ${getIconColor(activity.type)}`} />
                  <div>
                    <p className="line-clamp-1">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
              )
            })}
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function for icon colors
function getIconColor(type: string) {
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
