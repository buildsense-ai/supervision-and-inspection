"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { uploadSupervisionDocument, type UploadResponse } from "@/lib/api-service"

interface DocumentUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  panzhanId: number
  projectName: string
  onSuccess?: (response: UploadResponse) => void
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  panzhanId,
  projectName,
  onSuccess,
}: DocumentUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 重置状态
  const resetState = () => {
    setSelectedFile(null)
    setUploading(false)
    setUploadProgress(0)
    setUploadResult(null)
    setError(null)
  }

  // 处理对话框关闭
  const handleClose = () => {
    if (!uploading) {
      resetState()
      onOpenChange(false)
    }
  }

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 检查文件类型
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/msword", // .doc
        "application/pdf", // .pdf
      ]

      if (!allowedTypes.includes(file.type)) {
        setError("请选择 Word 文档 (.doc, .docx) 或 PDF 文件")
        return
      }

      // 检查文件大小 (限制为 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("文件大小不能超过 10MB")
        return
      }

      setSelectedFile(file)
      setError(null)
      setUploadResult(null)
    }
  }

  // 处理文件上传
  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const response = await uploadSupervisionDocument(panzhanId, selectedFile, (progress) => {
        setUploadProgress(progress)
      })

      setUploadResult(response)
      onSuccess?.(response)
    } catch (error) {
      setError(error instanceof Error ? error.message : "上传失败")
    } finally {
      setUploading(false)
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // 获取文件图标
  const getFileIcon = (file: File) => {
    if (file.type.includes("pdf")) {
      return <File className="h-8 w-8 text-red-500" />
    } else if (file.type.includes("word") || file.type.includes("document")) {
      return <File className="h-8 w-8 text-blue-500" />
    }
    return <File className="h-8 w-8 text-gray-500" />
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            上传文档
          </DialogTitle>
          <p className="text-sm text-muted-foreground">为 "{projectName}" 上传相关文档</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* 文件选择区域 */}
          {!selectedFile && !uploadResult && (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                "hover:border-primary hover:bg-primary/5",
                error && "border-red-300 bg-red-50",
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-2">点击选择文件或拖拽文件到此处</p>
              <p className="text-xs text-muted-foreground">支持 .doc, .docx, .pdf 格式，最大 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".doc,.docx,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* 选中的文件信息 */}
          {selectedFile && !uploadResult && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedFile)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  {!uploading && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedFile(null)
                        setError(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* 上传进度 */}
                {uploading && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>上传中...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 上传成功结果 */}
          {uploadResult && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-700">上传成功</p>
                    <p className="text-xs text-muted-foreground">{uploadResult.message}</p>
                    {uploadResult.doc_url && (
                      <a
                        href={uploadResult.doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        查看文档
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            {uploadResult ? "关闭" : "取消"}
          </Button>
          {selectedFile && !uploadResult && (
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  上传文档
                </>
              )}
            </Button>
          )}
          {uploadResult && (
            <Button
              onClick={() => {
                resetState()
                fileInputRef.current?.click()
              }}
            >
              继续上传
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
