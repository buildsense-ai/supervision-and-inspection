"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Search,
  Plus,
  Download,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Calendar,
  Building,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Upload,
  File,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SupervisionRecordForm } from "./supervision-record-form"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { ErrorState } from "./error-state"
import { DocumentUploadDialog } from "./document-upload-dialog"
import { DocumentManager } from "./document-manager"
import { DocumentSummary } from "./document-summary"
import {
  getSupervisionRecords,
  deleteSupervisionRecord,
  generateSupervisionDocument,
  type SupervisionRecord,
} from "@/lib/api-service"

interface SupervisionViewProps {
  highlightedRecordId?: string | number
}

export function SupervisionView({ highlightedRecordId }: SupervisionViewProps) {
  const [records, setRecords] = useState<SupervisionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecords, setSelectedRecords] = useState<Set<number>>(new Set())
  const [expandedRecords, setExpandedRecords] = useState<Set<number>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<SupervisionRecord | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // 删除确认相关状态
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    recordId: null as number | null,
    recordName: "",
    loading: false,
  })

  // 批量删除确认相关状态
  const [batchDeleteDialog, setBatchDeleteDialog] = useState({
    open: false,
    loading: false,
  })

  // 文档上传相关状态
  const [uploadDialog, setUploadDialog] = useState({
    open: false,
    recordId: null as number | null,
    projectName: "",
  })

  // 加载数据
  const loadRecords = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setError(null)
      }

      const skip = reset ? 0 : records.length
      const limit = 20

      const newRecords = await getSupervisionRecords(skip, limit)

      if (reset) {
        setRecords(newRecords)
      } else {
        setRecords((prev) => [...prev, ...newRecords])
      }

      setHasMore(newRecords.length === limit)

      // 如果有高亮记录，自动展开
      if (highlightedRecordId && newRecords.some((r) => r.id?.toString() === highlightedRecordId.toString())) {
        setExpandedRecords((prev) => new Set([...prev, Number(highlightedRecordId)]))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载数据失败")
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
    }
  }

  // 加载更多数据
  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    await loadRecords(false)
  }

  // 刷新数据
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadRecords(true)
  }

  // 初始加载
  useEffect(() => {
    loadRecords(true)
  }, [])

  // 打开删除确认对话框
  const openDeleteDialog = (record: SupervisionRecord) => {
    setDeleteDialog({
      open: true,
      recordId: record.id || null,
      recordName: record.project_name || "未命名项目",
      loading: false,
    })
  }

  // 确认删除单个记录
  const confirmDelete = async () => {
    if (!deleteDialog.recordId) return

    setDeleteDialog((prev) => ({ ...prev, loading: true }))

    try {
      const success = await deleteSupervisionRecord(deleteDialog.recordId)
      if (success) {
        setRecords((prev) => prev.filter((record) => record.id !== deleteDialog.recordId))
        setSelectedRecords((prev) => {
          const newSet = new Set(prev)
          newSet.delete(deleteDialog.recordId!)
          return newSet
        })
        setDeleteDialog({ open: false, recordId: null, recordName: "", loading: false })
      }
    } catch (error) {
      console.error("删除记录失败:", error)
    } finally {
      setDeleteDialog((prev) => ({ ...prev, loading: false }))
    }
  }

  // 打开批量删除确认对话框
  const openBatchDeleteDialog = () => {
    setBatchDeleteDialog({
      open: true,
      loading: false,
    })
  }

  // 确认批量删除
  const confirmBatchDelete = async () => {
    setBatchDeleteDialog((prev) => ({ ...prev, loading: true }))

    try {
      const deletePromises = Array.from(selectedRecords).map((id) => deleteSupervisionRecord(id))
      const results = await Promise.allSettled(deletePromises)

      // 统计成功删除的记录
      const successCount = results.filter((result) => result.status === "fulfilled").length

      if (successCount > 0) {
        // 移除成功删除的记录
        const successfulIds = Array.from(selectedRecords).filter((_, index) => results[index].status === "fulfilled")
        setRecords((prev) => prev.filter((record) => !successfulIds.includes(record.id!)))
        setSelectedRecords(new Set())
      }

      setBatchDeleteDialog({ open: false, loading: false })
    } catch (error) {
      console.error("批量删除失败:", error)
      setBatchDeleteDialog((prev) => ({ ...prev, loading: false }))
    }
  }

  // 生成文档
  const handleGenerateDocument = async (id: number) => {
    try {
      const documentUrl = await generateSupervisionDocument(id)
      if (documentUrl) {
        // 打开文档链接
        window.open(documentUrl, "_blank")
      }
    } catch (error) {
      console.error("生成文档失败:", error)
    }
  }

  // 批量生成文档
  const handleBatchGenerateDocument = async () => {
    try {
      const generatePromises = Array.from(selectedRecords).map((id) => generateSupervisionDocument(id))
      await Promise.allSettled(generatePromises)
    } catch (error) {
      console.error("批量生成文档失败:", error)
    }
  }

  // 筛选记录
  const filteredRecords = records.filter(
    (record) =>
      record.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.construction_unit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.supervision_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.supervising_personnel?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 获取状态
  const getStatus = (record: SupervisionRecord) => {
    if (!record.rectification_status) return "pending"
    const status = record.rectification_status.toLowerCase()
    if (status.includes("已完成") || status.includes("完成")) return "completed"
    if (status.includes("进行中") || status.includes("处理中")) return "in-progress"
    return "pending"
  }

  // 格式化日期
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "未设置"
    return new Date(dateString).toLocaleString("zh-CN")
  }

  // 切换记录选择
  const toggleRecordSelection = (id: number) => {
    setSelectedRecords((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // 切换记录展开
  const toggleRecordExpansion = (id: number) => {
    setExpandedRecords((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // 编辑记录
  const handleEdit = (record: SupervisionRecord) => {
    setEditingRecord(record)
    setShowForm(true)
  }

  // 表单提交成功后的回调
  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingRecord(null)
    handleRefresh()
  }

  if (loading && records.length === 0) {
    return (
      <div className="space-y-4">
        {/* 骨架屏 */}
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error && records.length === 0) {
    return <ErrorState message={error} onRetry={() => loadRecords(true)} />
  }

  return (
    <div className="space-y-4">
      {/* 操作栏 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="搜索项目名称、施工单位、监理公司..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>刷新数据</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>新建旁站记录</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* 批量操作栏 */}
      {selectedRecords.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-700">已选择 {selectedRecords.size} 条记录</span>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={handleBatchGenerateDocument}>
              <Download className="h-4 w-4 mr-1" />
              批量生成文档
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openBatchDeleteDialog}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              批量删除
            </Button>
          </div>
        </div>
      )}

      {/* 记录列表 */}
      <div className="space-y-3">
        {filteredRecords.map((record) => {
          const isSelected = selectedRecords.has(record.id!)
          const isExpanded = expandedRecords.has(record.id!)
          const isHighlighted = highlightedRecordId && record.id?.toString() === highlightedRecordId.toString()
          const status = getStatus(record)

          return (
            <Card
              key={record.id}
              className={cn(
                "transition-all duration-200 cursor-pointer",
                isHighlighted && "ring-2 ring-blue-500 shadow-lg",
                isExpanded && "shadow-md",
              )}
              onClick={() => toggleRecordExpansion(record.id!)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleRecordSelection(record.id!)}
                    onClick={(e) => e.stopPropagation()}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium truncate">
                        {record.project_name || "未命名项目"}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            status === "completed" ? "default" : status === "in-progress" ? "secondary" : "outline"
                          }
                          className="text-xs"
                        >
                          {status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {status === "in-progress" && <Clock className="h-3 w-3 mr-1" />}
                          {status === "pending" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {status === "completed" ? "已完成" : status === "in-progress" ? "进行中" : "待处理"}
                        </Badge>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span className="truncate">{record.construction_unit || "未设置施工单位"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="truncate">{record.supervising_personnel || "未设置监理人员"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">
                      {formatDate(record.start_datetime)} - {formatDate(record.end_datetime)}
                    </span>
                  </div>

                  {/* 添加文档摘要 */}
                  {record.document_urls && <DocumentSummary documentUrls={record.document_urls} />}
                </div>

                {/* 展开的详细信息 */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    {record.work_overview && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">工作概况</h4>
                        <p className="text-sm text-gray-600">{record.work_overview}</p>
                      </div>
                    )}

                    {record.pre_work_check_content && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">工前检查内容</h4>
                        <p className="text-sm text-gray-600">{record.pre_work_check_content}</p>
                      </div>
                    )}

                    {record.issues_and_opinions && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">问题及意见</h4>
                        <p className="text-sm text-gray-600">{record.issues_and_opinions}</p>
                      </div>
                    )}

                    {record.rectification_status && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">整改情况</h4>
                        <p className="text-sm text-gray-600">{record.rectification_status}</p>
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(record)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleGenerateDocument(record.id!)
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        生成文档
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setUploadDialog({
                            open: true,
                            recordId: record.id!,
                            projectName: record.project_name || "未命名项目",
                          })
                        }}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        上传文档
                      </Button>

                      {/* 添加文档管理按钮 */}
                      <DocumentManager
                        panzhanId={record.id!}
                        projectName={record.project_name || "未命名项目"}
                        documentUrls={record.document_urls}
                        onDocumentDeleted={handleRefresh}
                        trigger={
                          <Button variant="outline" size="sm">
                            <File className="h-4 w-4 mr-1" />
                            管理文档
                          </Button>
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteDialog(record)
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        删除
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 加载更多 */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                加载中...
              </>
            ) : (
              "加载更多"
            )}
          </Button>
        </div>
      )}

      {/* 无数据提示 */}
      {filteredRecords.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">{searchTerm ? "没有找到匹配的记录" : "暂无旁站记录"}</div>
      )}

      {/* 表单弹窗 */}
      {showForm && (
        <SupervisionRecordForm
          record={editingRecord}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false)
            setEditingRecord(null)
          }}
        />
      )}

      {/* 删除确认对话框 */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        onConfirm={confirmDelete}
        itemName={deleteDialog.recordName}
        loading={deleteDialog.loading}
      />

      {/* 批量删除确认对话框 */}
      <DeleteConfirmationDialog
        open={batchDeleteDialog.open}
        onOpenChange={(open) => setBatchDeleteDialog((prev) => ({ ...prev, open }))}
        onConfirm={confirmBatchDelete}
        title="确认批量删除"
        description={`您确定要删除选中的 ${selectedRecords.size} 条旁站记录吗？此操作无法撤销。`}
        loading={batchDeleteDialog.loading}
      />

      {/* 文档上传对话框 */}
      <DocumentUploadDialog
        open={uploadDialog.open}
        onOpenChange={(open) => setUploadDialog((prev) => ({ ...prev, open }))}
        panzhanId={uploadDialog.recordId!}
        projectName={uploadDialog.projectName}
        onSuccess={(response) => {
          console.log("文档上传成功:", response)
          // 可以在这里刷新记录列表或更新记录的文档链接
          handleRefresh()
        }}
      />
    </div>
  )
}
