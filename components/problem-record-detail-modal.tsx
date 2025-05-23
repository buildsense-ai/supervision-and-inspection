"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Calendar, MapPin, User, FileText, LinkIcon } from "lucide-react"
import Image from "next/image"

/**
 * 问题记录详情模态框组件数据操作
 *
 * 数据操作:
 * 1. 数据展示 (Read)
 *    - 来源: 父组件传入的 record 对象
 *    - 元素: 问题记录详情，包含状态、描述、相关规范/图纸、施工部位、责任单位/人、记录时间、相关图片、相关文档等
 *
 * 2. 数据操作触发 (Update/Create)
 *    - 来源: 用户界面交互
 *    - 操作: 触发编辑问题记录、生成通知单等操作
 *    - 元素: 当前查看的问题记录
 */
interface ProblemRecordDetailModalProps {
  isOpen: boolean
  onClose: () => void
  record: any
  onGenerateNotification: (recordId: string) => void
  onEdit: (recordId: string) => void
}

export function ProblemRecordDetailModal({
  isOpen,
  onClose,
  record,
  onGenerateNotification,
  onEdit,
}: ProblemRecordDetailModalProps) {
  if (!record) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>问题记录详情</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground">加载中...</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="destructive">待处理</Badge>
      case "resolved":
        return <Badge variant="outline">已闭环</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <DialogTitle>问题记录详情</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">状态:</span>
              {getStatusBadge(record.status)}
            </div>
            <div className="text-sm text-muted-foreground">ID: {record.id}</div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-1">问题描述:</h3>
            <p className="text-sm border rounded-md p-3 bg-muted/30">{record.title}</p>
          </div>

          {record.standards && record.standards.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-1">相关规范/图纸:</h3>
              <div className="space-y-2">
                {record.standards.map((standard: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <LinkIcon className="h-3 w-3 text-blue-500" />
                    <a href="#" className="text-blue-600 hover:underline">
                      {standard.code} {standard.name}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium mb-1">施工部位:</h3>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span>{record.location}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-1">责任单位/人:</h3>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-3 w-3 text-muted-foreground" />
              <span>{record.responsibleUnit}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-1">记录时间:</h3>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span>{record.date}</span>
            </div>
          </div>

          {record.images && record.images.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-1">相关图片:</h3>
              <div className="grid grid-cols-2 gap-2">
                {record.images.map((image: string, index: number) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                    <Image
                      src={`/abstract-geometric-shapes.png?height=200&width=200&query=${encodeURIComponent(record.title)}`}
                      alt={`问题图片 ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {record.documents && record.documents.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-1">相关文档:</h3>
              <div className="space-y-2">
                {record.documents.map((doc: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <a href="#" className="text-blue-600 hover:underline">
                      {doc.title}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {record.status !== "resolved" && (
            <Button variant="outline" onClick={() => onEdit(record.id)}>
              编辑
            </Button>
          )}
          <Button className="gap-2" onClick={() => onGenerateNotification(record.id)}>
            <FileText className="h-4 w-4" />
            生成通知单
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
