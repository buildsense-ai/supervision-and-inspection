"use client"

import { useState } from "react"
import DashboardLayout from "../dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar, ImageIcon, MapPin, MergeIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * 问题记录页面数据操作
 *
 * 数据操作:
 * 1. 数据检索 (Read)
 *    - 来源: 硬编码的 mockIssues 数组
 *    - 元素: 问题记录列表，包含ID、描述、状态、日期、位置、图片标志、责任单位等
 *
 * 2. 数据过滤 (Read)
 *    - 来源: mockIssues 数组
 *    - 操作: 基于状态(全部/待处理/已闭环)过滤问题记录
 *
 * 3. 数据选择 (Update)
 *    - 来源: 用户界面交互
 *    - 操作: 通过复选框选择问题记录
 *    - 元素: selectedIssues 状态数组
 *
 * 4. 合并问题 (Create/Update)
 *    - 来源: 用户界面交互
 *    - 操作: 合并选中的问题记录
 *    - 元素: 选中的问题记录ID列表
 *    - 注意: 当前仅打印到控制台，未实际执行数据操作
 */
// Mock data for issues
const mockIssues = [
  {
    id: "1",
    description: "基坑支护结构变形超出设计允许值",
    status: "pending",
    date: "2025-05-10",
    location: "A区基坑",
    hasImage: true,
    responsibleUnit: "某建设单位",
  },
  {
    id: "2",
    description: "混凝土浇筑过程中出现蜂窝麻面",
    status: "pending",
    date: "2025-05-12",
    location: "B区3层柱",
    hasImage: true,
    responsibleUnit: "某施工单位",
  },
  {
    id: "3",
    description: "钢筋保护层厚度不足",
    status: "pending",
    date: "2025-05-13",
    location: "C区梁",
    hasImage: false,
    responsibleUnit: "某施工单位",
  },
  {
    id: "4",
    description: "模板支撑系统不稳固",
    status: "closed",
    date: "2025-05-08",
    location: "D区板",
    hasImage: true,
    responsibleUnit: "某施工单位",
  },
  {
    id: "5",
    description: "安全通道被阻塞",
    status: "closed",
    date: "2025-05-07",
    location: "工地入口",
    hasImage: true,
    responsibleUnit: "某施工单位",
  },
]

export default function IssuesPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedIssues, setSelectedIssues] = useState<string[]>([])
  const [showMergeDialog, setShowMergeDialog] = useState(false)

  const filteredIssues =
    selectedStatus === "all" ? mockIssues : mockIssues.filter((issue) => issue.status === selectedStatus)

  const handleCheckboxChange = (issueId: string) => {
    setSelectedIssues((prev) => (prev.includes(issueId) ? prev.filter((id) => id !== issueId) : [...prev, issueId]))
  }

  const handleMergeIssues = () => {
    // In a real app, this would call an API to merge the issues
    console.log("Merging issues:", selectedIssues)
    setShowMergeDialog(false)
    setSelectedIssues([])
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">问题记录列表</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="筛选状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="pending">待处理</SelectItem>
              <SelectItem value="closed">已闭环</SelectItem>
            </SelectContent>
          </Select>

          {selectedIssues.length > 0 && (
            <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <MergeIcon className="h-4 w-4" />
                  合并问题 ({selectedIssues.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>合并问题</DialogTitle>
                  <DialogDescription>
                    您正在合并 {selectedIssues.length} 个问题。请为合并后的问题提供一个新的描述。
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="merged-description">合并后的问题描述</Label>
                    <Input id="merged-description" placeholder="请输入合并后的问题描述" className="col-span-3" />
                  </div>
                  <div className="grid gap-2">
                    <Label>选中的问题</Label>
                    <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                      {selectedIssues.map((id) => {
                        const issue = mockIssues.find((i) => i.id === id)
                        return (
                          <div key={id} className="py-2 border-b last:border-0">
                            {issue?.description}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
                    取消
                  </Button>
                  <Button onClick={handleMergeIssues}>确认合并</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Button>生成巡检记录</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredIssues.map((issue) => (
          <Card key={issue.id} className="overflow-hidden">
            <div className="p-1">
              <Checkbox
                id={`select-${issue.id}`}
                checked={selectedIssues.includes(issue.id)}
                onCheckedChange={() => handleCheckboxChange(issue.id)}
                className="ml-2 mt-2"
              />
            </div>
            <CardContent className="p-4 pt-0">
              <div className="flex justify-between items-start mb-2">
                <Badge variant={issue.status === "pending" ? "destructive" : "outline"}>
                  {issue.status === "pending" ? "待处理" : "已闭环"}
                </Badge>
                {issue.hasImage && <ImageIcon className="h-4 w-4 text-muted-foreground" />}
              </div>
              <h3 className="font-medium line-clamp-2 mb-2">{issue.description}</h3>
              <div className="flex items-center text-xs text-muted-foreground gap-1 mb-1">
                <MapPin className="h-3 w-3" />
                <span>{issue.location}</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground gap-1 mb-1">
                <Calendar className="h-3 w-3" />
                <span>{issue.date}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">责任单位: {issue.responsibleUnit}</div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-end">
              <Button variant="outline" size="sm">
                查看详情
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  )
}
