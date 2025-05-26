"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { X, Maximize2, Minimize2 } from "lucide-react"
import { SupervisionView } from "./supervision-view"

type DrawerHeight = "partial" | "full"
type ViewType = "overview" | "supervision" | "documents"

interface DashboardDrawerProps {
  isOpen: boolean
  onClose: () => void
  initialView?: ViewType
  highlightedRecordId?: string
}

export function DashboardDrawer({
  isOpen,
  onClose,
  initialView = "overview",
  highlightedRecordId,
}: DashboardDrawerProps) {
  const [drawerHeight, setDrawerHeight] = useState<DrawerHeight>("partial")
  const [currentView, setCurrentView] = useState<ViewType>(initialView)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const drawerRef = useRef<HTMLDivElement>(null)

  // 初始化视图
  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView)
    }
  }, [initialView])

  // 处理拖动开始
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)

    if ("touches" in e) {
      setStartY(e.touches[0].clientY)
    } else {
      setStartY(e.clientY)
    }

    // 添加移动和结束事件监听
    if ("touches" in e) {
      document.addEventListener("touchmove", handleDragMove)
      document.addEventListener("touchend", handleDragEnd)
    } else {
      document.addEventListener("mousemove", handleDragMove)
      document.addEventListener("mouseup", handleDragEnd)
    }
  }

  // 处理拖动移动
  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return

    const currentY = "touches" in e ? e.touches[0].clientY : e.clientY
    const deltaY = currentY - startY

    // 向上拖动超过50px，展开抽屉
    if (deltaY < -50 && drawerHeight === "partial") {
      setDrawerHeight("full")
      handleDragEnd()
    }

    // 向下拖动超过50px，收起抽屉
    if (deltaY > 50) {
      if (drawerHeight === "full") {
        setDrawerHeight("partial")
      } else {
        onClose()
      }
      handleDragEnd()
    }
  }

  // 处理拖动结束
  const handleDragEnd = () => {
    setIsDragging(false)
    document.removeEventListener("mousemove", handleDragMove)
    document.removeEventListener("mouseup", handleDragEnd)
    document.removeEventListener("touchmove", handleDragMove)
    document.removeEventListener("touchend", handleDragEnd)
  }

  // 切换抽屉高度
  const toggleDrawerHeight = () => {
    setDrawerHeight(drawerHeight === "partial" ? "full" : "partial")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-background rounded-t-lg shadow-lg transition-all duration-300 ease-in-out",
          drawerHeight === "partial" ? "h-[70vh]" : "h-[92vh]",
        )}
        ref={drawerRef}
      >
        {/* 拖动条 */}
        <div
          className="h-6 w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
        </div>

        {/* 顶部操作栏 */}
        <div className="absolute top-0 right-0 p-1.5 flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={toggleDrawerHeight}>
            {drawerHeight === "partial" ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 导航标签 */}
        <div className="px-4 pb-2">
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewType)} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">
                概览
              </TabsTrigger>
              <TabsTrigger value="supervision" className="flex-1">
                旁站记录
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex-1">
                文档
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 内容区域 */}
        <div className="px-4 pb-4 overflow-y-auto h-[calc(100%-4rem)]">
          {currentView === "overview" && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">项目概览</h2>
              <p>这里显示项目的概览信息...</p>
            </div>
          )}

          {currentView === "supervision" && <SupervisionView />}

          {currentView === "documents" && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">文档列表</h2>
              <p>这里显示项目相关文档...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
