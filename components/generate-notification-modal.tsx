"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

/**
 * 生成通知单模态框组件数据操作
 *
 * 数据操作:
 * 1. 数据展示 (Read)
 *    - 来源: 父组件传入的 record 对象
 *    - 元素: 问题记录，用于生成通知单
 *
 * 2. 数据生成 (Create)
 *    - 来源: 用户界面交互
 *    - 操作: 基于问题记录生成通知单
 *    - 元素: 当前查看的问题记录
 */
interface GenerateNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  record: any
  onGenerate: (recordId: string) => void
}

export function GenerateNotificationModal({ isOpen, onClose, record, onGenerate }: GenerateNotificationModalProps) {
  if (!record) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>生成监理通知单</DialogTitle>
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <DialogTitle>生成监理通知单</DialogTitle>
          </div>
          <DialogDescription>
            确认要基于此问题记录生成监理通知单吗？生成的通知单将出现在"已生成文档"中。
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="border rounded-md p-3 bg-muted/30">
            <p className="font-medium mb-2">{record.title}</p>
            <p className="text-sm text-muted-foreground">位置: {record.location}</p>
            <p className="text-sm text-muted-foreground">责任单位: {record.responsibleUnit}</p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={() => onGenerate(record.id)}>确认生成</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
