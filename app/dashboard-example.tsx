"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DashboardDrawer } from "@/components/dashboard-drawer"
import { Card, CardContent } from "@/components/ui/card"

export default function DashboardExample() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [initialView, setInitialView] = useState<"overview" | "events" | "documents">("events")
  const [initialEventType, setInitialEventType] = useState<
    "issue" | "supervision" | "daily-log" | "meeting" | undefined
  >("issue")
  const [highlightedRecordId, setHighlightedRecordId] = useState<string | undefined>("issue-1")
  const [searchQuery, setSearchQuery] = useState("")

  // Simulate opening the dashboard from a chat message
  const openDashboardFromChat = (
    view: "overview" | "events" | "documents",
    eventType?: "issue" | "supervision" | "daily-log" | "meeting",
    recordId?: string,
    query?: string,
  ) => {
    setInitialView(view)
    setInitialEventType(eventType)
    setHighlightedRecordId(recordId)
    setSearchQuery(query || "")
    setIsDrawerOpen(true)
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard 示例</h1>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <h2 className="font-medium mb-2">模拟对话场景</h2>
            <p className="text-sm text-muted-foreground mb-4">点击下面的按钮模拟从对话中打开不同的 dashboard 视图</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => openDashboardFromChat("overview")}>
                查看概况
              </Button>

              <Button variant="outline" onClick={() => openDashboardFromChat("events", "issue", "issue-1")}>
                查看问题记录
              </Button>

              <Button variant="outline" onClick={() => openDashboardFromChat("events", "supervision", "supervision-1")}>
                查看旁站记录
              </Button>

              <Button variant="outline" onClick={() => openDashboardFromChat("events", "daily-log", "log-1")}>
                查看监理日志
              </Button>

              <Button variant="outline" onClick={() => openDashboardFromChat("events", "meeting", "meeting-1")}>
                查看会议纪要
              </Button>

              <Button variant="outline" onClick={() => openDashboardFromChat("documents")}>
                查看已生成文档
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="font-medium mb-2">上下文感知示例</h2>
            <p className="text-sm text-muted-foreground mb-4">模拟从对话中提及特定内容时打开相关记录</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => openDashboardFromChat("events", "issue", "issue-2", "结构")}>
                "我发现一个结构问题，请查看"
              </Button>

              <Button
                variant="outline"
                onClick={() => openDashboardFromChat("events", "supervision", "supervision-3", "混凝土")}
              >
                "昨天的混凝土浇筑情况如何？"
              </Button>

              <Button variant="outline" onClick={() => openDashboardFromChat("events", "daily-log", "log-2", "天气")}>
                "查看昨天的天气记录"
              </Button>

              <Button variant="outline" onClick={() => openDashboardFromChat("events", "meeting", "meeting-2", "协调")}>
                "上次协调会的决议是什么？"
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Drawer */}
      <DashboardDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        initialView={initialView}
        initialEventType={initialEventType}
        highlightedRecordId={highlightedRecordId}
        searchQuery={searchQuery}
      />
    </div>
  )
}
