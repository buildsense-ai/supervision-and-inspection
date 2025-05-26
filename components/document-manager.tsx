"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { File, Download, Trash2, ExternalLink, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { deleteSupervisionDocument } from "@/lib/api-service"

interface DocumentInfo {
  url: string
  name: string
  type: string
  size?: string
}

interface DocumentManagerProps {
  panzhanId: number
  projectName: string
  documentUrls: string | null
  onDocumentDeleted?: () => void
  trigger?: React.ReactNode
}

export function DocumentManager({
  panzhanId,
  projectName,
  documentUrls,
  onDocumentDeleted,
  trigger,
}: DocumentManagerProps) {
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
        return parsed.map((url, index) => ({
          url,
          name: getFileNameFromUrl(url) || `文档${index + 1}`,
          type: getFileTypeFromUrl(url),
        }))
      }
    } catch {
      // 如果不是JSON，按逗号分割
      const urlArray = urls
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean)
      return urlArray.map((url, index) => ({
        url,
        name: getFileNameFromUrl(url) || `文档${index + 1}`,
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
        return <File className="h-5 w-5 text-red-500" />
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

  // 打开删除确认对话框
  const openDeleteDialog = (document: DocumentInfo) => {
    setDeleteDialog({
      open: true,
      documentUrl: document.url,
      documentName: document.name,
      loading: false,
    })
  }

  // 确认删除文档
  const confirmDelete = async () => {
    if (!deleteDialog.documentUrl) return

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

  const documents = parseDocumentUrls(documentUrls)

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">项目文档</h3>
        <Badge variant="secondary">{documents.length} 个文档</Badge>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <File className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>暂无关联文档</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((document, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {getFileIcon(document.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{document.name}</p>
                      <Badge className={cn("text-xs", getTypeColor(document.type))}>{document.type}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{document.url}</p>
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
          ))}
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
    </div>
  )

  if (trigger) {
    return (
      <Dialog>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              {projectName} - 文档管理
            </DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return content
}
