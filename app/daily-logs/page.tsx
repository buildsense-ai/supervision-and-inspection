"use client"

import DashboardLayout from "../dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Download, Edit, FileText } from "lucide-react"
import Link from "next/link"

/**
 * 监理日志页面数据操作
 *
 * 数据操作:
 * 1. 数据检索 (Read)
 *    - 来源: 硬编码的 mockDailyLogs 数组
 *    - 元素: 监理日志列表，包含ID、日期、状态、天气等
 *
 * 2. 数据展示 (Read)
 *    - 来源: mockDailyLogs 数组
 *    - 操作: 展示监理日志详情
 */

// Mock data for daily logs
const mockDailyLogs = [
  {
    id: "1",
    date: "2025-05-10",
    status: "draft",
    weather: "晴",
  },
  {
    id: "2",
    date: "2025-05-11",
    status: "final",
    weather: "多云",
  },
  {
    id: "3",
    date: "2025-05-12",
    status: "draft",
    weather: "小雨",
  },
  {
    id: "4",
    date: "2025-05-13",
    status: "final",
    weather: "晴",
  },
]

export default function DailyLogsPage() {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">监理日志列表</h1>
        <Button asChild>
          <Link href="/daily-logs/edit/new">新建监理日志</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockDailyLogs.map((log) => (
          <Card key={log.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Badge variant={log.status === "draft" ? "secondary" : "outline"}>
                  {log.status === "draft" ? "AI草稿" : "最终版"}
                </Badge>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-3">监理日志 - {log.date}</h3>
              <div className="flex items-center text-xs text-muted-foreground gap-1 mb-2">
                <Calendar className="h-3 w-3" />
                <span>{log.date}</span>
              </div>
              <div className="text-xs text-muted-foreground mb-2">天气: {log.weather}</div>
            </CardContent>
            <CardFooter className="px-6 pb-6 pt-0 flex justify-between">
              {log.status === "draft" ? (
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <Link href={`/daily-logs/edit/${log.id}`}>
                    <Edit className="h-4 w-4" />
                    审阅编辑
                  </Link>
                </Button>
              ) : (
                <div></div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/daily-logs/preview/${log.id}`}>查看详情</Link>
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  下载
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  )
}
