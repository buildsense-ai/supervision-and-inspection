"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Search,
  Plus,
  FileDown,
  Trash2,
  Edit,
  Eye,
  Calendar,
  Building,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
  type SupervisionRecord,
  getSupervisionRecords,
  deleteSupervisionRecord,
  generateSupervisionDocument,
} from "@/lib/api-service"
import { SupervisionRecordForm } from "./supervision-record-form"
import { ErrorState } from "./error-state"

export function SupervisionView() {
  const [pagination, setPagination] = useState({ skip: 0, limit: 20 })
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [records, setRecords] = useState<SupervisionRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<SupervisionRecord[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<SupervisionRecord | null>(null)
  const [processingIds, setProcessingIds] = useState<string[]>([])

  // 下拉刷新相关状态
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const maxPullDistance = 80

  // 加载数据
  const loadRecords = async (reset = false) => {
    if (reset) {
      setIsLoading(true)
      setError(null)
      setPagination({ skip: 0, limit: 20 })
    } else {
      setIsLoadingMore(true)
    }

    try {
      const currentPagination = reset ? { skip: 0, limit: 20 } : pagination
      const data = await getSupervisionRecords(currentPagination)

      if (reset) {
        setRecords(data)
        setFilteredRecords(data)
      } else {
        setRecords((prev) => [...prev, ...data])
        setFilteredRecords((prev) => [...prev, ...data])
      }

      // 如果返回的数据少于请求的数量，说明没有更多数据了
      setHasMore(data.length === currentPagination.limit)
      setError(null)
    } catch (error) {
      console.error("加载旁站记录失败:", error)
      setError(error instanceof Error ? error.message : "加载数据失败，请稍后再试")
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
      setIsRefreshing(false)
      setPullDistance(0)
      setIsPulling(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadRecords(true)
  }, [])

  // 搜索过滤
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRecords(records)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = records.filter(
      (record) =>
        record.project_name?.toLowerCase().includes(query) ||
        record.construction_unit?.toLowerCase().includes(query) ||
        record.pangzhan_unit?.toLowerCase().includes(query) ||
        record.supervision_company?.toLowerCase().includes(query) ||
        record.work_overview?.toLowerCase().includes(query) ||
        record.issues_and_opinions?.toLowerCase().includes(query) ||
        record.rectification_status?.toLowerCase().includes(query),
    )

    setFilteredRecords(filtered)
  }, [searchQuery, records])

  // 处理选择记录
  const handleSelectRecord = (id: string) => {
    setSelectedRecords((prev) => {
      if (prev.includes(id)) {
        return prev.filter((recordId) => recordId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // 处理全选
  const handleSelectAll = () => {
    if (selectedRecords.length === filteredRecords.length) {
      setSelectedRecords([])
    } else {
      setSelectedRecords(filteredRecords.map((record) => record.id?.toString() || ""))
    }
  }

  // 处理删除记录
  const handleDeleteRecord = async (id: string) => {
    setProcessingIds((prev) => [...prev, id])

    try {
      const success = await deleteSupervisionRecord(id)
      if (success) {
        // 更新本地数据
        setRecords((prev) => prev.filter((record) => record.id?.toString() !== id))
        setSelectedRecords((prev) => prev.filter((recordId) => recordId !== id))
      }
    } catch (error) {
      console.error("删除记录失败:", error)
    } finally {
      setProcessingIds((prev) => prev.filter((itemId) => itemId !== id))
    }
  }

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (!selectedRecords.length) return

    if (confirm(`确定要删除选中的 ${selectedRecords.length} 条记录吗？`)) {
      // 逐个删除选中的记录
      for (const id of selectedRecords) {
        await handleDeleteRecord(id)
      }
    }
  }

  // 处理生成文档
  const handleGenerateDocument = async (id: string) => {
    setProcessingIds((prev) => [...prev, id])

    try {
      const documentUrl = await generateSupervisionDocument(id)
      if (documentUrl) {
        // 打开文档链接
        window.open(documentUrl, "_blank")
      }
    } catch (error) {
      console.error("生成文档失败:", error)
    } finally {
      setProcessingIds((prev) => prev.filter((itemId) => itemId !== id))
    }
  }

  // 处理编辑记录
  const handleEditRecord = (record: SupervisionRecord) => {
    setCurrentRecord(record)
    setIsFormOpen(true)
  }

  // 处理新建记录
  const handleAddRecord = () => {
    setCurrentRecord(null)
    setIsFormOpen(true)
  }

  // 处理表单提交成功
  const handleFormSuccess = () => {
    loadRecords(true)
  }

  // 加载更多
  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      setPagination((prev) => ({ ...prev, skip: prev.skip + prev.limit }))
      loadRecords(false)
    }
  }

  // 下拉刷新处理
  const handleTouchStart = (e: React.TouchEvent) => {
    // 只有在顶部才能下拉刷新
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current

    // 只有向下拉才有效
    if (diff > 0) {
      // 添加阻尼效果，越拉越难拉
      const dampedDiff = Math.min(diff * 0.5, maxPullDistance)
      setPullDistance(dampedDiff)

      // 阻止默认滚动
      e.preventDefault()
    }
  }

  const handleTouchEnd = () => {
    if (isPulling) {
      if (pullDistance >= maxPullDistance * 0.6) {
        // 达到刷新阈值
        setIsRefreshing(true)
        loadRecords(true)
      } else {
        // 未达到阈值，回弹
        setPullDistance(0)
        setIsPulling(false)
      }
    }
  }

  // 手动刷新
  const handleRefresh = () => {
    setIsRefreshing(true)
    loadRecords(true)
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "未设置"
    try {
      return format(new Date(dateString), "yyyy-MM-dd HH:mm")
    } catch (error) {
      return dateString
    }
  }

  const getStatusBadge = (record: SupervisionRecord) => {
    // 根据整改情况判断状态
    if (record.rectification_status?.includes("已完成") || record.rectification_status?.includes("完工")) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          已整改
        </Badge>
      )
    } else if (record.issues_and_opinions && record.rectification_status?.includes("进行中")) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          整改中
        </Badge>
      )
    } else if (record.issues_and_opinions && !record.rectification_status) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          未整改
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          正常
        </Badge>
      )
    }
  }

  return (
    <div
      className="space-y-4 h-full overflow-auto"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 下拉刷新指示器 */}
      {isPulling && (
        <div
          className="flex justify-center items-center transition-all duration-200 overflow-hidden"
          style={{ height: `${pullDistance}px` }}
        >
          <div
            className={cn(
              "transition-transform duration-200",
              pullDistance >= maxPullDistance * 0.6 ? "text-primary" : "text-muted-foreground",
            )}
            style={{
              transform: `rotate(${(pullDistance / maxPullDistance) * 360}deg)`,
            }}
          >
            <RefreshCw className="h-6 w-6" />
          </div>
        </div>
      )}

      {/* 刷新中指示器 */}
      {isRefreshing && !isPulling && (
        <div className="flex justify-center items-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {/* 顶部操作栏 */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索旁站记录..."
            className="pl-8 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-1", isRefreshing && "animate-spin")} />
            刷新
          </Button>
          {selectedRecords.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleBatchDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              删除 ({selectedRecords.length})
            </Button>
          )}
          <Button size="sm" onClick={handleAddRecord}>
            <Plus className="h-4 w-4 mr-1" />
            新建记录
          </Button>
        </div>
      </div>

      {/* 快速筛选标签 */}
      <div className="flex flex-wrap gap-2">
        <Button variant={searchQuery === "" ? "default" : "outline"} size="sm" onClick={() => setSearchQuery("")}>
          全部
        </Button>
        <Button
          variant={searchQuery === "未整改" ? "default" : "outline"}
          size="sm"
          onClick={() => setSearchQuery("未整改")}
        >
          未整改
        </Button>
        <Button
          variant={searchQuery === "整改中" ? "default" : "outline"}
          size="sm"
          onClick={() => setSearchQuery("整改中")}
        >
          整改中
        </Button>
        <Button
          variant={searchQuery === "已整改" ? "default" : "outline"}
          size="sm"
          onClick={() => setSearchQuery("已整改")}
        >
          已整改
        </Button>
      </div>

      {/* 错误状态 */}
      {error && !isLoading && (
        <ErrorState
          message={error}
          onRetry={() => {
            setError(null)
            loadRecords(true)
          }}
        />
      )}

      {/* 记录列表 */}
      <div className="space-y-3">
        {isLoading ? (
          // 加载骨架屏
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredRecords.length === 0 && !error ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? "没有找到匹配的记录" : "暂无旁站记录"}
          </div>
        ) : (
          !error &&
          filteredRecords.map((record) => (
            <Card
              key={record.id}
              className={cn(
                "overflow-hidden transition-all duration-200",
                expandedCardId === record.id?.toString() ? "ring-2 ring-primary" : "",
                selectedRecords.includes(record.id?.toString() || "") ? "bg-primary-50" : "",
              )}
            >
              <CardContent className="p-0">
                <div className="p-4 space-y-3">
                  {/* 标题行 */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={selectedRecords.includes(record.id?.toString() || "")}
                        onCheckedChange={() => handleSelectRecord(record.id?.toString() || "")}
                        className="mt-1"
                      />
                      <div>
                        <h3
                          className="font-medium line-clamp-1 hover:underline cursor-pointer"
                          onClick={() =>
                            setExpandedCardId(expandedCardId === record.id?.toString() ? null : record.id?.toString())
                          }
                        >
                          {record.project_name}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            {formatDateTime(record.start_datetime)}
                          </span>
                          <span className="flex items-center">
                            <Building className="h-3.5 w-3.5 mr-1" />
                            {record.construction_unit}
                          </span>
                          <span className="flex items-center">
                            <User className="h-3.5 w-3.5 mr-1" />
                            {record.supervising_personnel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>{getStatusBadge(record)}</div>
                  </div>

                  {/* 内容预览 */}
                  <p className="text-sm text-muted-foreground line-clamp-2">{record.work_overview}</p>

                  {/* 展开内容 */}
                  {expandedCardId === record.id?.toString() && (
                    <div className="pt-2 border-t mt-3 space-y-3">
                      {record.issues_and_opinions && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">发现问题及处理意见</h4>
                          <p className="text-sm">{record.issues_and_opinions}</p>
                        </div>
                      )}

                      {record.rectification_status && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">整改情况</h4>
                          <p className="text-sm">{record.rectification_status}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <h4 className="text-sm font-medium mb-1">旁站单位</h4>
                          <p className="text-sm">{record.pangzhan_unit || "未指定"}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-1">监理单位</h4>
                          <p className="text-sm">{record.supervision_company}</p>
                        </div>
                      </div>

                      {record.remarks && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">备注</h4>
                          <p className="text-sm">{record.remarks}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="px-4 py-2 border-t flex justify-end gap-2 bg-muted/10">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          setExpandedCardId(expandedCardId === record.id?.toString() ? null : record.id?.toString())
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>查看详情</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditRecord(record)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>编辑记录</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleGenerateDocument(record.id?.toString() || "")}
                        disabled={processingIds.includes(record.id?.toString() || "")}
                      >
                        {processingIds.includes(record.id?.toString() || "") ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>生成文档</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteRecord(record.id?.toString() || "")}
                        disabled={processingIds.includes(record.id?.toString() || "")}
                      >
                        {processingIds.includes(record.id?.toString() || "") ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>删除记录</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardFooter>
            </Card>
          ))
        )}
        {/* 加载更多按钮 */}
        {hasMore && !isLoading && !error && (
          <div className="text-center py-4">
            <Button variant="outline" onClick={loadMore} disabled={isLoadingMore}>
              {isLoadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  加载中...
                </>
              ) : (
                "加载更多"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* 表单弹窗 */}
      <SupervisionRecordForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        record={currentRecord}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
