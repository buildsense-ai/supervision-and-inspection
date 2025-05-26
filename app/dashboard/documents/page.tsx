"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Trash2, RefreshCw, FileText, File, Calendar, Building, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { DocumentUploadDialog } from "@/components/document-upload-dialog"
import { ErrorState } from "@/components/error-state"
import { getSupervisionRecords, deleteSupervisionDocument } from "@/lib/api-service"

interface DocumentInfo {
  id: string
  url: string
  name: string
  type: string
  size?: string
  projectName: string
  panzhanId: number
  uploadDate: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [selectedType, setSelectedType] = useState<string>("all")
  const [refreshing, setRefreshing] = useState(false)

  // 删除确认相关状态
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    documentId: "",
    documentName: "",
    panzhanId: 0,
    documentUrl: "",
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

  // 解析文档URL字符串
  const parseDocumentUrls = (urls: string | null): { url: string; name: string; type: string }[] => {
    if (!urls) return []

    try {
      // 尝试解析为JSON数组
      const parsed = JSON.parse(urls)
      if (Array.isArray(parsed)) {
        return parsed.map((url) => ({
          url,
          name: getFileNameFromUrl(url),
          type: getFileTypeFromUrl(url),
        }))
      }
    } catch {
      // 如果不是JSON，按逗号分割
      const urlArray = urls
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean)
      return urlArray.map((url) => ({
        url,
        name: getFileNameFromUrl(url),
        type: getFileTypeFromUrl(url),
      }))
    }

    return []
  }

  // 从URL中提取文件名
  const getFileNameFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const fileName = pathname.split("/").pop() || ""
      return decodeURIComponent(fileName)
    } catch {
      return url.split("/").pop() || "未知文件"
    }
  }

  // 从URL中获取文件类型
  const getFileTypeFromUrl = (url: string): string => {
    const extension = url.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return "PDF"
      case "doc":
      case "docx":
        return "Word"
      case "xls":
      case "xlsx":
        return "Excel"
      case "ppt":
      case "pptx":
        return "PowerPoint"
      default:
        return "文档"
    }
  }

  // 获取文件图标
  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-5 w-5 text-red-500" />
      case "Word":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "Excel":
        return <File className="h-5 w-5 text-green-500" />
      case "PowerPoint":
        return <File className="h-5 w-5 text-orange-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  // 获取文件类型颜色
  const getTypeColor = (type: string) => {
    switch (type) {
      case "PDF":
        return "bg-red-100 text-red-700"
      case "Word":
        return "bg-blue-100 text-blue-700"
      case "Excel":
        return "bg-green-100 text-green-700"
      case "PowerPoint":
        return "bg-orange-100 text-orange-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  // 加载文档数据
  const loadDocuments = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setError(null)
      }

      console.log("开始加载文档数据...")

      // 获取所有旁站记录
      const records = await getSupervisionRecords(0, 100) // 获取更多记录以包含所有文档

      console.log("获取到的旁站记录:", records)

      // 提取所有文档
      const allDocuments: DocumentInfo[] = []

      records.forEach((record) => {
        console.log("处理记录:", record.id, "文档URLs:", record.document_urls)

        if (record.document_urls) {
          const documentInfos = parseDocumentUrls(record.document_urls)
          console.log("解析后的文档信息:", documentInfos)

          documentInfos.forEach((docInfo, index) => {
            allDocuments.push({
              id: `${record.id}-${index}`,
              url: docInfo.url,
              name: docInfo.name,
              type: docInfo.type,
              projectName: record.project_name || "未命名项目",
              panzhanId: record.id!,
              uploadDate: record.updated_at || record.created_at || new Date().toISOString(),
            })
          })
        }
      })

      console.log("最终文档列表:", allDocuments)
      setDocuments(allDocuments)
    } catch (err) {
      console.error("加载文档失败:", err)
      setError(err instanceof Error ? err.message : "加载文档失败")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // 刷新数据
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDocuments(true)
  }

  // 初始加载
  useEffect(() => {
    loadDocuments(true)
  }, [])

  // 打开删除确认对话框
  const openDeleteDialog = (document: DocumentInfo) => {
    setDeleteDialog({
      open: true,
      documentId: document.id,
      documentName: document.name,
      panzhanId: document.panzhanId,
      documentUrl: document.url,
      loading: false,
    })
  }

  // 确认删除单个文档
  const confirmDelete = async () => {
    if (!deleteDialog.documentUrl || !deleteDialog.panzhanId) return

    setDeleteDialog((prev) => ({ ...prev, loading: true }))

    try {
      const success = await deleteSupervisionDocument(deleteDialog.panzhanId, deleteDialog.documentUrl)
      if (success) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== deleteDialog.documentId))
        setSelectedDocuments((prev) => {
          const newSet = new Set(prev)
          newSet.delete(deleteDialog.documentId)
          return newSet
        })
        setDeleteDialog({
          open: false,
          documentId: "",
          documentName: "",
          panzhanId: 0,
          documentUrl: "",
          loading: false,
        })
      }
    } catch (error) {
      console.error("删除文档失败:", error)
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
      const selectedDocs = documents.filter((doc) => selectedDocuments.has(doc.id))
      const deletePromises = selectedDocs.map((doc) => deleteSupervisionDocument(doc.panzhanId, doc.url))
      const results = await Promise.allSettled(deletePromises)

      // 统计成功删除的文档
      const successCount = results.filter((result) => result.status === "fulfilled").length

      if (successCount > 0) {
        // 移除成功删除的文档
        const successfulIds = Array.from(selectedDocuments).filter((_, index) => results[index].status === "fulfilled")
        setDocuments((prev) => prev.filter((doc) => !successfulIds.includes(doc.id)))
        setSelectedDocuments(new Set())
      }

      setBatchDeleteDialog({ open: false, loading: false })
    } catch (error) {
      console.error("批量删除失败:", error)
      setBatchDeleteDialog((prev) => ({ ...prev, loading: false }))
    }
  }

  // 下载文档
  const handleDownload = (url: string, name: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = name
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 批量下载文档
  const handleBatchDownload = () => {
    const selectedDocs = documents.filter((doc) => selectedDocuments.has(doc.id))
    selectedDocs.forEach((doc) => {
      setTimeout(() => handleDownload(doc.url, doc.name), 100) // 稍微延迟避免浏览器阻止
    })
  }

  // 筛选文档
  const filteredDocuments = documents.filter((doc) => {
    const searchMatch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.projectName.toLowerCase().includes(searchTerm.toLowerCase())

    const typeMatch = selectedType === "all" || doc.type === selectedType

    return searchMatch && typeMatch
  })

  // 切换文档选择
  const toggleDocumentSelection = (id: string) => {
    setSelectedDocuments((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedDocuments.size === filteredDocuments.length) {
      setSelectedDocuments(new Set())
    } else {
      setSelectedDocuments(new Set(filteredDocuments.map((doc) => doc.id)))
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN")
  }

  // 文档上传成功后的回调
  const handleUploadSuccess = () => {
    setUploadDialog({ open: false, recordId: null, projectName: "" })
    handleRefresh()
  }

  if (loading && documents.length === 0) {
    return (
      <div className="space-y-4">
        {/* 骨架屏 */}
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error && documents.length === 0) {
    return <ErrorState message={error} onRetry={() => loadDocuments(true)} />
  }

  return (
    <div className="space-y-4">
      {/* 页面标题和操作栏 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">已生成文档</h2>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>刷新文档列表</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* 搜索和筛选栏 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="搜索文档名称、项目名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="文档类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="PDF">PDF</SelectItem>
            <SelectItem value="Word">Word</SelectItem>
            <SelectItem value="Excel">Excel</SelectItem>
            <SelectItem value="PowerPoint">PowerPoint</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 批量操作栏 */}
      {selectedDocuments.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-700">已选择 {selectedDocuments.size} 个文档</span>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={handleBatchDownload}>
              <Download className="h-4 w-4 mr-1" />
              批量下载
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

      {/* 文档列表头部 */}
      {filteredDocuments.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <Checkbox
            checked={selectedDocuments.size === filteredDocuments.length && filteredDocuments.length > 0}
            onCheckedChange={toggleSelectAll}
          />
          <span className="text-sm text-gray-600">全选 ({filteredDocuments.length} 个文档)</span>
        </div>
      )}

      {/* 文档列表 */}
      <div className="space-y-3">
        {filteredDocuments.map((document) => {
          const isSelected = selectedDocuments.has(document.id)

          return (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Checkbox checked={isSelected} onCheckedChange={() => toggleDocumentSelection(document.id)} />

                  {getFileIcon(document.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium truncate">{document.name}</h3>
                      <Badge className={cn("text-xs", getTypeColor(document.type))}>{document.type}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        <span className="truncate">{document.projectName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(document.uploadDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => window.open(document.url, "_blank")}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>在新窗口打开</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(document.url, document.name)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>下载文档</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(document)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>删除文档</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 无数据提示 */}
      {filteredDocuments.length === 0 && !loading && (
        <div className="text-center py-12">
          <File className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedType !== "all" ? "没有找到匹配的文档" : "暂无文档"}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedType !== "all"
              ? "尝试调整搜索条件或筛选器"
              : "上传文档到旁站记录后，文档将在这里显示"}
          </p>
        </div>
      )}

      {/* 删除确认对话框 */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        onConfirm={confirmDelete}
        title="确认删除文档"
        description={`您确定要删除文档 "${deleteDialog.documentName}" 吗？此操作无法撤销。`}
        loading={deleteDialog.loading}
      />

      {/* 批量删除确认对话框 */}
      <DeleteConfirmationDialog
        open={batchDeleteDialog.open}
        onOpenChange={(open) => setBatchDeleteDialog((prev) => ({ ...prev, open }))}
        onConfirm={confirmBatchDelete}
        title="确认批量删除"
        description={`您确定要删除选中的 ${selectedDocuments.size} 个文档吗？此操作无法撤销。`}
        loading={batchDeleteDialog.loading}
      />

      {/* 文档上传对话框 */}
      <DocumentUploadDialog
        open={uploadDialog.open}
        onOpenChange={(open) => setUploadDialog((prev) => ({ ...prev, open }))}
        panzhanId={uploadDialog.recordId!}
        projectName={uploadDialog.projectName}
        onSuccess={handleUploadSuccess}
      />
    </div>
  )
}
