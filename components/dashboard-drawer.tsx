"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, ChevronUp, BarChart3, ClipboardList, FileText, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { EventsView } from "@/components/events-view"
import { OverviewView } from "@/components/overview-view"
import { DocumentsView } from "@/components/documents-view"
import { Input } from "@/components/ui/input"

interface DashboardDrawerProps {
  isOpen: boolean
  onClose: () => void
  initialView?: "overview" | "events" | "documents"
  initialEventType?: "issue" | "supervision" | "daily-log" | "meeting"
  highlightedRecordId?: string
  searchQuery?: string
}

/**
 * 看板抽屉组件数据操作
 *
 * 数据操作:
 * 1. 数据展示 (Read)
 *    - 来源: 父组件传入的参数(initialView, initialEventType, highlightedRecordId, searchQuery)
 *    - 操作: 根据参数展示不同的视图和内容
 *    - 元素: 概览、事件记录、已生成文档等
 *
 * 2. 数据搜索 (Read)
 *    - 来源: 用户界面交互
 *    - 操作: 搜索事件记录或文档
 *    - 元素: 搜索关键词
 */
export function DashboardDrawer({
  isOpen,
  onClose,
  initialView = "events",
  initialEventType,
  highlightedRecordId,
  searchQuery = "",
}: DashboardDrawerProps) {
  const [activeView, setActiveView] = useState<"overview" | "events" | "documents">(initialView)
  const [drawerHeight, setDrawerHeight] = useState<"partial" | "full">("partial")
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const drawerRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef<number | null>(null)
  const startHeightRef = useRef<"partial" | "full">("partial")

  // Reset to initial view when drawer opens or props change
  useEffect(() => {
    if (isOpen) {
      setActiveView(initialView)
      setLocalSearchQuery(searchQuery)
    }
  }, [isOpen, initialView, searchQuery])

  // Handle touch interactions for the drawer
  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY
    startHeightRef.current = drawerHeight
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startYRef.current === null) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startYRef.current

    // Swipe down to close
    if (diff > 50 && startHeightRef.current === "partial") {
      onClose()
      startYRef.current = null
      return
    }

    // Swipe down to minimize
    if (diff > 50 && startHeightRef.current === "full") {
      setDrawerHeight("partial")
      startYRef.current = null
      return
    }

    // Swipe up to maximize
    if (diff < -50 && startHeightRef.current === "partial") {
      setDrawerHeight("full")
      startYRef.current = null
      return
    }
  }

  const handleTouchEnd = () => {
    startYRef.current = null
  }

  const toggleDrawerHeight = () => {
    setDrawerHeight(drawerHeight === "partial" ? "full" : "partial")
  }

  // Animation classes based on drawer state
  const drawerAnimationClass = isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-xl bg-background shadow-lg transition-all duration-300 ease-in-out",
          drawerHeight === "partial" ? "h-[70vh]" : "h-[92vh]",
          drawerAnimationClass,
        )}
      >
        {/* Drawer handle and close button */}
        <div
          className="flex items-center justify-between border-b px-4 py-2"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="mx-auto h-1.5 w-12 rounded-full bg-muted" />
          <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">关闭</span>
          </Button>
        </div>

        {/* Segmented control for top-level navigation */}
        <div className="flex border-b px-4 py-2">
          <div className="mx-auto flex rounded-lg border bg-muted/50 p-1">
            <Button
              variant={activeView === "overview" ? "secondary" : "ghost"}
              size="sm"
              className="flex items-center gap-1.5"
              onClick={() => setActiveView("overview")}
            >
              <BarChart3 className="h-4 w-4" />
              <span>概况</span>
            </Button>
            <Button
              variant={activeView === "events" ? "secondary" : "ghost"}
              size="sm"
              className="flex items-center gap-1.5"
              onClick={() => setActiveView("events")}
            >
              <ClipboardList className="h-4 w-4" />
              <span>事件记录</span>
            </Button>
            <Button
              variant={activeView === "documents" ? "secondary" : "ghost"}
              size="sm"
              className="flex items-center gap-1.5"
              onClick={() => setActiveView("documents")}
            >
              <FileText className="h-4 w-4" />
              <span>已生成文档</span>
            </Button>
          </div>
        </div>

        {/* Expand/collapse button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-14 h-6 w-6 rounded-full"
          onClick={toggleDrawerHeight}
        >
          <ChevronUp className={cn("h-4 w-4 transition-transform", drawerHeight === "full" ? "rotate-180" : "")} />
          <span className="sr-only">{drawerHeight === "partial" ? "展开" : "收起"}</span>
        </Button>

        {/* Global search bar */}
        <div className="relative px-4 py-2 border-b">
          <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="全局搜索..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-4">
          {activeView === "overview" && <OverviewView searchQuery={localSearchQuery} />}
          {activeView === "events" && (
            <EventsView
              initialEventType={initialEventType}
              highlightedRecordId={highlightedRecordId}
              searchQuery={localSearchQuery}
            />
          )}
          {activeView === "documents" && <DocumentsView searchQuery={localSearchQuery} />}
        </div>
      </div>
    </>
  )
}
