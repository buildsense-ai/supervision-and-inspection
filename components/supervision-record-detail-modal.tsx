"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ClipboardList,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  ExternalLink,
  Trash2,
  Upload,
} from "lucide-react"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { deleteSupervisionDocument } from "@/lib/api-service"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { DocumentUploadDialog } from "./document-upload-dialog"
import { toast } from "@/hooks/use-toast"

interface SupervisionRecordDetailModalProps {
  isOpen: boolean
  onClose: () => void
  record: any
  onEdit: () => void
  onGenerate: () => void
  onRefresh?: () => void
}

interface DocumentInfo {
  url: string
  name: string
  type: string
  extension: string
}

export function SupervisionRecordDetailModal({
  isOpen,
  onClose,
  record,
  onEdit,
  onGenerate,
  onRefresh,
}: SupervisionRecordDetailModalProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    documentUrl: "",
    documentName: "",
    loading: false,
  })
  const [uploadDialog, setUploadDialog] = useState(false)

  if (!record) {
    return null
  }

  // 解析文档URL字符串
  const parseDocumentUrls = (urls: string | null): DocumentInfo[] => {
    console.log("解析文档URLs:", urls)

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

  // 获取文件图标颜色
  const getTypeColor = (type: string) => {
    switch (type) {
      case "PDF":
        return "text-red-500"
      case "Word":
        return "text-blue-500"
      case "Excel":
        return "text-green-500"
      case "PowerPoint":
        return "text-orange-500"
      case "图片":
        return "text-purple-500"
      case "文本":
        return "text-gray-500"
      default:
        return "text-gray-500"
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

  // 在新窗口打开文档
  const handleOpen = (url: string) => {
    window.open(url, "_blank")
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
    if (!deleteDialog.documentUrl || !record.id) return

    setDeleteDialog((prev) => ({ ...prev, loading: true }))

    try {
      const success = await deleteSupervisionDocument(record.id, deleteDialog.documentUrl)
      if (success) {
        setDeleteDialog({ open: false, documentUrl: "", documentName: "", loading: false })
        // 触发父组件刷新数据
        onRefresh?.()
        toast({
          title: "删除成功",
          description: "文档已成功删除",
        })
      }
    } catch (error) {
      console.error("删除文档失败:", error)
      toast({
        title: "删除失败",
        description: "删除文档时发生错误",
        variant: "destructive",
      })
    } finally {
      setDeleteDialog((prev) => ({ ...prev, loading: false }))
    }
  }

  // 处理上传成功
  const handleUploadSuccess = () => {
    setUploadDialog(false)
    onRefresh?.()
    toast({
      title: "上传成功",
      description: "文档已成功上传",
    })
  }

  // 格式化时间显示
  const formatTimeRange = () => {
    if (record.start_datetime && record.end_datetime) {
      const startTime = new Date(record.start_datetime).toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      })
      const endTime = new Date(record.end_datetime).toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      })
      return `${startTime} 至 ${endTime}`
    }
    return record.time || "未指定"
  }

  // 解析文档列表
  const documents = parseDocumentUrls(record.document_urls)
  console.log("解析后的文档列表:", documents)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-500" />
            <DialogTitle>旁站记录详情</DialogTitle>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="details">记录详情</TabsTrigger>
            <TabsTrigger value="documents">已生成的文档</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {/* 基础识别信息 */}
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-3">基础识别信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div>
                  <span className="font-medium">工程项目：</span>
                  <span>{record.project_name || "未指定"}</span>
                </div>
                <div>
                  <span className="font-medium">旁站单位：</span>
                  <span>{record.pangzhan_unit || "未指定"}</span>
                </div>
                <div>
                  <span className="font-medium">日期：</span>
                  <span>
                    {record.start_datetime ? new Date(record.start_datetime).toLocaleDateString("zh-CN") : "未指定"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">时间段：</span>
                  <span>{formatTimeRange()}</span>
                </div>
                <div>
                  <span className="font-medium">旁站监理：</span>
                  <span>{record.supervising_personnel || "未指定"}</span>
                </div>
                <div>
                  <span className="font-medium">施工单位：</span>
                  <span>{record.construction_unit || "未指定"}</span>
                </div>
                <div>
                  <span className="font-medium">监理公司：</span>
                  <span>{record.supervision_company || "未指定"}</span>
                </div>
                <div>
                  <span className="font-medium">现场监理人员：</span>
                  <span>{record.on_site_supervising_personnel || "未指定"}</span>
                </div>
              </div>
            </div>

            {/* 旁站过程核心记录 */}
            <div className="space-y-4">
              {/* 工作概述 */}
              <div className="border rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">工作概述</h3>
                </div>
                <p className="text-sm whitespace-pre-wrap">{record.work_overview || "未记录"}</p>
              </div>

              {/* 作业前检查内容 */}
              <div className="border rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">作业前检查内容</h3>
                </div>
                <p className="text-sm whitespace-pre-wrap">{record.pre_work_check_content || "未记录"}</p>
              </div>

              {/* 问题及意见 */}
              <div className="border rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <h3 className="font-medium">问题及意见</h3>
                </div>
                <p className="text-sm whitespace-pre-wrap">{record.issues_and_opinions || "无问题"}</p>
              </div>

              {/* 整改状态 */}
              <div className="border rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium">整改状态</h3>
                </div>
                <p className="text-sm whitespace-pre-wrap">{record.rectification_status || "无需整改"}</p>
              </div>

              {/* 备注 */}
              {record.remarks && (
                <div className="border rounded-md p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <h3 className="font-medium">备注</h3>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{record.remarks}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="border rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">已生成的文档</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  上传文档
                </Button>
              </div>

              {documents && documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <FileText className={`h-5 w-5 ${getTypeColor(doc.type)}`} />
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-sm text-muted-foreground">
                            <Badge variant="outline" className="mr-2">
                              {doc.type}
                            </Badge>
                            上传时间: {record.created_at ? new Date(record.created_at).toLocaleString("zh-CN") : "未知"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => handleOpen(doc.url)}>
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>在新窗口打开</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => handleDownload(doc.url, doc.name)}>
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
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => openDeleteDialog(doc)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>删除文档</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">暂无生成的文档</p>
                  <Button variant="outline" onClick={() => setUploadDialog(true)} className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    上传第一个文档
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
          <Button variant="outline" onClick={onEdit}>
            编辑
          </Button>
          <Button onClick={onGenerate}>生成旁站记录</Button>
        </DialogFooter>

        {/* 删除确认对话框 */}
        <DeleteConfirmationDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
          onConfirm={confirmDelete}
          title="确认删除文档"
          description={`您确定要删除文档 "${deleteDialog.documentName}" 吗？此操作无法撤销。`}
          loading={deleteDialog.loading}
        />

        {/* 文档上传对话框 */}
        <DocumentUploadDialog
          open={uploadDialog}
          onOpenChange={setUploadDialog}
          panzhanId={record.id}
          projectName={record.project_name}
          onSuccess={handleUploadSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}
