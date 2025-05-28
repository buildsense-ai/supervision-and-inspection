"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, X } from "lucide-react"

interface ProblemRecordEditModalProps {
  isOpen: boolean
  onClose: () => void
  record: any
  onSave: (record: any) => void
}

export function ProblemRecordEditModal({ isOpen, onClose, record, onSave }: ProblemRecordEditModalProps) {
  const [editedRecord, setEditedRecord] = useState<any>(null)

  // Initialize or update editedRecord when record changes
  useEffect(() => {
    if (record) {
      setEditedRecord({ ...record })
    }
  }, [record])

  // If no record or editedRecord, don't render the form content
  if (!editedRecord) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>编辑问题记录</DialogTitle>
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

  const handleChange = (field: string, value: any) => {
    setEditedRecord((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleRemoveStandard = (index: number) => {
    if (editedRecord.standards) {
      const newStandards = [...editedRecord.standards]
      newStandards.splice(index, 1)
      handleChange("standards", newStandards)
    }
  }

  const handleSave = () => {
    // 转换为后端期望的格式
    const backendFormat = {
      ...editedRecord,
      // 确保状态值正确映射
      status: editedRecord.status === "pending" ? "待处理" : "已闭环",
    }

    onSave(backendFormat)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <DialogTitle>编辑问题记录</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">状态</Label>
            <Select value={editedRecord.status} onValueChange={(value) => handleChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="resolved">已闭环</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">问题描述</Label>
            <Textarea
              id="title"
              value={editedRecord.title}
              onChange={(e) => handleChange("title", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label>相关规范/图纸</Label>
            <div className="space-y-2">
              {editedRecord.standards?.map((standard: any, index: number) => (
                <div key={index} className="flex items-center gap-2 border rounded-md p-2">
                  <div className="flex-1 text-sm">
                    {standard.code} {standard.name}
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveStandard(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {(!editedRecord.standards || editedRecord.standards.length === 0) && (
                <p className="text-sm text-muted-foreground">暂无相关规范/图纸</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">施工部位</Label>
            <Input
              id="location"
              value={editedRecord.location}
              onChange={(e) => handleChange("location", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="responsibleUnit">责任单位/人</Label>
            <Input
              id="responsibleUnit"
              value={editedRecord.responsibleUnit}
              onChange={(e) => handleChange("responsibleUnit", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave}>确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
