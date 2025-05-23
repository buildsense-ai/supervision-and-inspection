"use client"

import { useState } from "react"
import DashboardLayout from "../dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Download, FileText } from "lucide-react"

/**
 * 文档页面数据操作
 *
 * 数据操作:
 * 1. 数据检索 (Read)
 *    - 来源: 硬编码的 mockDocuments 数组
 *    - 元素: 文档列表，包含ID、标题、类型、日期、相关问题等
 *
 * 2. 数据过滤 (Read)
 *    - 来源: mockDocuments 数组
 *    - 操作: 基于文档类型(全部/通知单/巡检记录/旁站记录/监理日志/会议纪要)过滤文档
 */
// Mock data for documents
const mockDocuments = [
  {
    id: "1",
    title: "监理工程师通知单-001",
    type: "notification",
    date: "2025-05-10",
    relatedIssues: ["基坑支护结构变形超出设计允许值"],
  },
  {
    id: "2",
    title: "监理工程师通知单-002",
    type: "notification",
    date: "2025-05-12",
    relatedIssues: ["混凝土浇筑过程中出现蜂窝麻面"],
  },
  {
    id: "3",
    title: "巡检记录-2025-05-13",
    type: "inspection",
    date: "2025-05-13",
    relatedIssues: ["钢筋保护层厚度不足", "模板支撑系统不稳固"],
  },
  {
    id: "4",
    title: "旁站监理记录-001",
    type: "supervision",
    date: "2025-05-14",
    relatedIssues: [],
  },
  {
    id: "5",
    title: "监理日志-2025-05-15",
    type: "daily-log",
    date: "2025-05-15",
    relatedIssues: [],
  },
  {
    id: "6",
    title: "会议纪要-项目例会-001",
    type: "meeting-minutes",
    date: "2025-05-16",
    relatedIssues: [],
  },
]

export default function DocumentsPage() {
  const [selectedType, setSelectedType] = useState<string>("all")

  const filteredDocuments =
    selectedType === "all" ? mockDocuments : mockDocuments.filter((doc) => doc.type === selectedType)

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "notification":
        return "通知单"
      case "inspection":
        return "巡检记录"
      case "supervision":
        return "旁站记录"
      case "daily-log":
        return "监理日志"
      case "meeting-minutes":
        return "会议纪要"
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "notification":
        return "destructive"
      case "inspection":
        return "default"
      case "supervision":
        return "secondary"
      case "daily-log":
        return "outline"
      case "meeting-minutes":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">已生成文档列表</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="筛选文档类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="notification">通知单</SelectItem>
              <SelectItem value="inspection">巡检记录</SelectItem>
              <SelectItem value="supervision">旁站记录</SelectItem>
              <SelectItem value="daily-log">监理日志</SelectItem>
              <SelectItem value="meeting-minutes">会议纪要</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Badge variant={getTypeColor(doc.type) as any}>{getTypeLabel(doc.type)}</Badge>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">{doc.title}</h3>
              <div className="flex items-center text-xs text-muted-foreground gap-1 mb-3">
                <Calendar className="h-3 w-3" />
                <span>{doc.date}</span>
              </div>

              {doc.relatedIssues.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-1">相关问题:</p>
                  <ul className="text-xs list-disc pl-4">
                    {doc.relatedIssues.map((issue, index) => (
                      <li key={index} className="line-clamp-1">
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter className="px-6 pb-6 pt-0 flex justify-end">
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
