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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ClipboardCheck } from "lucide-react"

interface GenerateInspectionRecordModalProps {
  isOpen: boolean
  onClose: () => void
  selectedRecords: any[]
  onGenerate: () => void
}

/**
 * 生成巡检记录模态框组件数据操作
 *
 * 数据操作:
 * 1. 数据展示 (Read)
 *    - 来源: 父组件传入的 selectedRecords 数组
 *    - 元素: 选中的问题记录，用于生成巡检记录
 *
 * 2. 数据生成 (Create)
 *    - 来源: 用户界面交互
 *    - 操作: 基于选中的问题记录生成巡检记录
 *    - 元素: 选中的问题记录
 */
export function GenerateInspectionRecordModal({
  isOpen,
  onClose,
  selectedRecords,
  onGenerate,
}: GenerateInspectionRecordModalProps) {
  if (!selectedRecords || selectedRecords.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>生成巡检记录</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground">请先选择问题记录</p>
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
            <ClipboardCheck className="h-5 w-5 text-blue-500" />
            <DialogTitle>生成巡检记录</DialogTitle>
          </div>
          <DialogDescription>
            您正在基于 {selectedRecords.length} 个问题记录生成巡检记录。生成的巡检记录将包含以下问题。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="inspection-title">巡检记录标题</Label>
            <Input
              id="inspection-title"
              placeholder="请输入巡检记录标题"
              defaultValue={`巡检记录-${new Date().toISOString().split("T")[0]}`}
            />
          </div>
          <div className="grid gap-2">
            <Label>包含的问题</Label>
            <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
              {selectedRecords.map((record) => (
                <div key={record.id} className="py-2 border-b last:border-0">
                  {record.title}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={onGenerate}>确认生成</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
