"use client"

import DashboardLayout from "../dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Download, Edit, FileText, Users } from "lucide-react"

/**
 * 会议纪要页面数据操作
 *
 * 数据操作:
 * 1. 数据检索 (Read)
 *    - 来源: 硬编码的 mockMeetingMinutes 数组
 *    - 元素: 会议纪要列表，包含ID、标题、日期、状态、参会人数等
 *
 * 2. 数据展示 (Read)
 *    - 来源: mockMeetingMinutes 数组
 *    - 操作: 展示会议纪要详情
 */

// Mock data for meeting minutes
const mockMeetingMinutes = [
  {
    id: "1",
    title: "项目例会",
    date: "2025-05-10",
    status: "draft",
    attendees: 12,
  },
  {
    id: "2",
    title: "质量专题会",
    date: "2025-05-12",
    status: "final",
    attendees: 8,
  },
  {
    id: "3",
    title: "安全专题会",
    date: "2025-05-14",
    status: "draft",
    attendees: 15,
  },
  {
    id: "4",
    title: "进度协调会",
    date: "2025-05-16",
    status: "final",
    attendees: 10,
  },
]

export default function MeetingMinutesPage() {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">会议纪要列表</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockMeetingMinutes.map((meeting) => (
          <Card key={meeting.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Badge variant={meeting.status === "draft" ? "secondary" : "outline"}>
                  {meeting.status === "draft" ? "AI草稿" : "最终版"}
                </Badge>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-3">{meeting.title}</h3>
              <div className="flex items-center text-xs text-muted-foreground gap-1 mb-2">
                <Calendar className="h-3 w-3" />
                <span>{meeting.date}</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground gap-1 mb-2">
                <Users className="h-3 w-3" />
                <span>参会人数: {meeting.attendees}</span>
              </div>
            </CardContent>
            <CardFooter className="px-6 pb-6 pt-0 flex justify-between">
              {meeting.status === "draft" ? (
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  审阅编辑
                </Button>
              ) : (
                <div></div>
              )}
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                下载
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  )
}
