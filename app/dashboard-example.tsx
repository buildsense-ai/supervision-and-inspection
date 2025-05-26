"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DashboardDrawer } from "@/components/dashboard-drawer"

export default function DashboardExample() {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false)
  const [initialView, setInitialView] = useState<"overview" | "supervision" | "documents">("overview")

  const openDashboard = (view: "overview" | "supervision" | "documents") => {
    setInitialView(view)
    setIsDashboardOpen(true)
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">巡检记录助手</h1>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-muted/20">
          <h2 className="text-lg font-medium mb-2">对话示例</h2>
          <p className="mb-4">这是一个模拟的对话界面，您可以点击下面的按钮打开不同的 Dashboard 视图。</p>

          <div className="space-y-2">
            <div className="bg-primary-50 p-3 rounded-lg">
              <p>用户: 我想查看所有的旁站记录</p>
            </div>

            <div className="bg-muted/30 p-3 rounded-lg">
              <p>助手: 好的，我可以帮您查看所有的旁站记录。</p>
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={() => openDashboard("supervision")}>
                  查看旁站记录
                </Button>
              </div>
            </div>

            <div className="bg-primary-50 p-3 rounded-lg">
              <p>用户: 我想看一下项目概览</p>
            </div>

            <div className="bg-muted/30 p-3 rounded-lg">
              <p>助手: 好的，这是您的项目概览信息。</p>
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={() => openDashboard("overview")}>
                  查看项目概览
                </Button>
              </div>
            </div>

            <div className="bg-primary-50 p-3 rounded-lg">
              <p>用户: 我需要查看相关文档</p>
            </div>

            <div className="bg-muted/30 p-3 rounded-lg">
              <p>助手: 好的，这是您的项目相关文档。</p>
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={() => openDashboard("documents")}>
                  查看项目文档
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={() => openDashboard("overview")}>打开概览</Button>
          <Button onClick={() => openDashboard("supervision")}>打开旁站记录</Button>
          <Button onClick={() => openDashboard("documents")}>打开文档</Button>
        </div>
      </div>

      {/* Dashboard 抽屉 */}
      <DashboardDrawer isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} initialView={initialView} />
    </div>
  )
}
