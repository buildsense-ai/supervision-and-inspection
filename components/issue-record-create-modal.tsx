"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle } from "lucide-react"
import { createIssueRecord } from "@/lib/api-service"

interface IssueRecordCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function IssueRecordCreateModal({ isOpen, onClose, onSuccess }: IssueRecordCreateModalProps) {
  const [formData, setFormData] = useState({
    问题发生地点: "",
    问题描述: "",
    相关图片: "",
    状态: "待处理",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!formData.问题发生地点 || !formData.问题描述) {
      alert("请填写必要信息")
      return
    }

    try {
      setIsSubmitting(true)
      await createIssueRecord(formData)

      // 重置表单
      setFormData({
        问题发生地点: "",
        问题描述: "",
        相关图片: "",
        状态: "待处理",
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error("创建问题记录失败:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <DialogTitle>新建问题记录</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="location">问题发生地点 *</Label>
            <Input
              id="location"
              value={formData.问题发生地点}
              onChange={(e) => handleChange("问题发生地点", e.target.value)}
              placeholder="请输入问题发生地点"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">问题描述 *</Label>
            <Textarea
              id="description"
              value={formData.问题描述}
              onChange={(e) => handleChange("问题描述", e.target.value)}
              placeholder="请详细描述发现的问题"
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="images">相关图片</Label>
            <Input
              id="images"
              value={formData.相关图片}
              onChange={(e) => handleChange("相关图片", e.target.value)}
              placeholder="图片URL或描述"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "创建中..." : "确认创建"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
