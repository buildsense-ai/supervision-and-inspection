"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { File, Download, Trash2, ExternalLink, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { deleteSupervisionDocument } from "@/lib/api-service"

interface DocumentInfo {
  url: string
  name: string
  type: string
  extension: string
}

interface DocumentSummaryProps {
  documentUrls: string | null
  panzhanId?: number
  onDocumentDeleted?: () => void
  showActions?: boolean
  maxDisplay?: number
}

export function DocumentSummary({
  documentUrls,
  panzhanId,
  onDocumentDeleted,
  showActions = false,
  maxDisplay = 3,
}: DocumentSummaryProps) {
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    documentUrl: "",
    documentName: "",
    loading: false,
  })

  // 解析文档URL字符串
  const parseDocumentUrls = (urls: string | null): DocumentInfo[] => {
    if (!urls) return []

    try {
      // 尝试解析为JSON数组
      const parsed = JSON.parse(urls)
      if (Array.isArray(parsed)) {
        return parsed.map((url) => createDocumentInfo(url))
      }
    } catch {
      // 如果不是JSON，按逗号分割
      const urlArray = urls
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean)
      return urlArray.map((url) => createDocumentInfo(url))
    }

    return []
  }

  // 创建文档信息对象
  const createDocumentInfo = (url: string): DocumentInfo => {
    const fileName = getFileNameFromUrl(url)
    const extension = getFileExtension(url)
    const type = getFileTypeFromExtension(extension)

    return {
      url,
      name: fileName,
      type,
      extension,
    }
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

  // 获取文件扩展名
  const getFileExtension = (url: string): string => {
    return url.split(".").pop()?.toLowerCase() || ""
  }

  // 根据扩展名获取文件类型
  const getFileTypeFromExtension = (extension: string): string => {
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
      case "txt":
        return "文本"
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "图片"
      default:
        return "文档"
    }
  }

  // 获取文件图标
  const getFileIcon = (type: string, extension: string) => {
    const iconClass = "h-4 w-4"

    switch (type) {
      case "PDF":
        return <File className={cn(iconClass, "text-red-500")} />
      case "Word":
        return <FileText className={cn(iconClass, "text-blue-500")} />
      case "Excel":
        return <File className={cn(iconClass, "text-green-500")} />
      case "PowerPoint":
        return <File className={cn(iconClass, "text-orange-500")} />
      case "图片":
        return <File className={cn(iconClass, "text-purple-500")} />
      case "文本":
        return <FileText className={cn(iconClass, "text-gray-500")} />
      default:
        return <File className={cn(iconClass, "text-gray-500")} />
    }
  }

  // 获取文件类型颜色
  const getTypeColor = (type: string) => {
    switch (type) {
      case "PDF":
        return "bg-red-100 text-red-700 border-red-200"
      case "Word":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Excel":
        return "bg-green-100 text-green-700 border-green-200"
      case "PowerPoint":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "图片":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "文本":
        return "bg-gray-100 text-gray-700 border-gray-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  // 下载文档
  const handleDownload = (url: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const link = document.createElement("a")
    link.href = url
    link.download = name
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 在新窗口打开文档
  const handleOpen = (url: string, e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(url, "_blank")
  }

  // 打开删除确认对话框
  const openDeleteDialog = (document: DocumentInfo, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteDialog({
      open: true,
      documentUrl: document.url,
      documentName: document.name,
      loading: false,
    })
  }

  // 确认删除文档
  const confirmDelete = async () => {
    if (!deleteDialog.documentUrl || !panzhanId) return

    setDeleteDialog((prev) => ({ ...prev, loading: true }))

    try {
      const success = await deleteSupervisionDocument(panzhanId, deleteDialog.documentUrl)
      if (success) {
        setDeleteDialog({ open: false, documentUrl: "", documentName: "", loading: false })
        onDocumentDeleted?.()
      }
    } catch (error) {
      console.error("删除文档失败:", error)
    } finally {
      setDeleteDialog((prev) => ({ ...prev, loading: false }))
    }
  }

  const documents = parseDocumentUrls(documentUrls)
  const displayDocuments = documents.slice(0, maxDisplay)
  const remainingCount = documents.length - maxDisplay

  if (documents.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {displayDocuments.map((document, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
          >
            {getFileIcon(document.type, document.extension)}

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-medium truncate max-w-32" title={document.name}>
                {document.name}
              </span>
              <Badge className={cn("text-xs px-1 py-0", getTypeColor(document.type))}>{document.type}</Badge>
            </div>

            {showActions && panzhanId && (
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => handleOpen(document.url, e)}
                      >
                        <ExternalLink className="h-3 w-3" />
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
                        className="h-6 w-6"
                        onClick={(e) => handleDownload(document.url, document.name, e)}
                      >
                        <Download className="h-3 w-3" />
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
                        className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => openDeleteDialog(document, e)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>删除文档</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        ))}

        {remainingCount > 0 && (
          <Badge variant="outline" className="text-xs">
            +{remainingCount} 个文档
          </Badge>
        )}
      </div>

      {/* 删除确认对话框 */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        onConfirm={confirmDelete}
        title="确认删除文档"
        description={`您确定要删除文档 "${deleteDialog.documentName}" 吗？此操作无法撤销。`}
        loading={deleteDialog.loading}
      />
    </div>
  )
}
