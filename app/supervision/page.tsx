"use client"

import DashboardLayout from "../dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, Clock, FileText, MapPin } from "lucide-react"

// Mock data for supervision records
const mockSupervisionRecords = [
  {
    id: "1",
    title: "混凝土浇筑旁站",
    date: "2025-05-10",
    time: "09:00-12:30",
    location: "A区3层板",
    conclusion: "合格",
    hasDocument: true,
  },
  {
    id: "2",
    title: "钢筋绑扎旁站",
    date: "2025-05-12",
    time: "14:00-16:30",
    location: "B区2层梁",
    conclusion: "合格",
    hasDocument: true,
  },
  {
    id: "3",
    title: "模板安装旁站",
    date: "2025-05-14",
    time: "08:30-11:00",
    location: "C区1层柱",
    conclusion: "不合格",
    hasDocument: true,
  },
  {
    id: "4",
    title: "基坑支护旁站",
    date: "2025-05-15",
    time: "13:00-15:30",
    location: "D区基坑",
    conclusion: "合格",
    hasDocument: false,
  },
]

/**
 * 旁站记录页面数据操作
 *
 * 数据操作:
 * 1. 数据检索 (Read)
 *    - 来源: 硬编码的 mockSupervisionRecords 数组
 *    - 元素: 旁站记录列表，包含ID、标题、日期、时间、位置、结论、文档标志等
 *
 * 2. 数据展示 (Read)
 *    - 来源: mockSupervisionRecords 数组
 *    - 操作: 展示旁站记录详情
 */
export default function SupervisionPage() {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">旁站记录列表</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockSupervisionRecords.map((record) => (
          <Card key={record.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Badge variant={record.conclusion === "合格" ? "outline" : "destructive"}>{record.conclusion}</Badge>
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-3">{record.title}</h3>
              <div className="flex items-center text-xs text-muted-foreground gap-1 mb-2">
                <Calendar className="h-3 w-3" />
                <span>{record.date}</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground gap-1 mb-2">
                <Clock className="h-3 w-3" />
                <span>{record.time}</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground gap-1 mb-2">
                <MapPin className="h-3 w-3" />
                <span>{record.location}</span>
              </div>
            </CardContent>
            <CardFooter className="px-6 pb-6 pt-0 flex justify-between">
              <Button variant="outline" size="sm">
                查看详情
              </Button>
              {record.hasDocument && (
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  查看记录文档
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  )
}
