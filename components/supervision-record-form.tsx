"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { type SupervisionRecord, createSupervisionRecord, updateSupervisionRecord } from "@/lib/api-service"

interface SupervisionRecordFormProps {
  isOpen: boolean
  onClose: () => void
  record?: SupervisionRecord | null
  onSuccess: () => void
}

export function SupervisionRecordForm({ isOpen, onClose, record, onSuccess }: SupervisionRecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  const [formData, setFormData] = useState<Partial<SupervisionRecord>>({
    project_name: "",
    construction_unit: "",
    pangzhan_unit: "",
    supervision_company: "",
    work_overview: "",
    pre_work_check_content: "",
    supervising_personnel: "",
    issues_and_opinions: "",
    rectification_status: "",
    remarks: "",
    construction_enterprise: "",
    supervising_enterprise: "",
    supervising_organization: "",
    on_site_supervising_personnel: "",
    document_urls: "",
  })

  // 初始化表单数据
  useEffect(() => {
    if (record) {
      setFormData({
        ...record,
        // 处理 null 值
        pangzhan_unit: record.pangzhan_unit || "",
        supervising_organization: record.supervising_organization || "",
        document_urls: record.document_urls || "",
      })

      if (record.start_datetime) {
        setStartDate(new Date(record.start_datetime))
      }

      if (record.end_datetime) {
        setEndDate(new Date(record.end_datetime))
      }
    } else {
      // 重置表单时也要处理 null 值
      setFormData({
        project_name: "",
        construction_unit: "",
        pangzhan_unit: "",
        supervision_company: "",
        work_overview: "",
        pre_work_check_content: "",
        supervising_personnel: "",
        issues_and_opinions: "",
        rectification_status: "",
        remarks: "",
        construction_enterprise: "",
        supervising_enterprise: "",
        supervising_organization: "",
        on_site_supervising_personnel: "",
        document_urls: "",
      })
      setStartDate(undefined)
      setEndDate(undefined)
    }
  }, [record, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 准备提交的数据
      const submitData: SupervisionRecord = {
        ...(formData as SupervisionRecord),
        start_datetime: startDate ? startDate.toISOString() : null,
        end_datetime: endDate ? endDate.toISOString() : null,
        // 确保空字符串转换为 null（如果 API 需要）
        pangzhan_unit: formData.pangzhan_unit || null,
        supervising_organization: formData.supervising_organization || null,
        document_urls: formData.document_urls || null,
      }

      let result

      if (record?.id) {
        // 更新记录
        result = await updateSupervisionRecord(record.id.toString(), submitData)
      } else {
        // 创建新记录
        result = await createSupervisionRecord(submitData)
      }

      if (result) {
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error("提交表单时出错:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{record?.id ? "编辑旁站记录" : "新建旁站记录"}</DialogTitle>
          <DialogDescription>填写旁站记录的详细信息，带 * 的字段为必填项</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto max-h-[calc(90vh-10rem)] p-1">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">基本信息</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_name">
                  工程名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="project_name"
                  name="project_name"
                  value={formData.project_name || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="construction_unit">
                  施工单位 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="construction_unit"
                  name="construction_unit"
                  value={formData.construction_unit || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pangzhan_unit">
                  旁站单位 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pangzhan_unit"
                  name="pangzhan_unit"
                  value={formData.pangzhan_unit || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supervision_company">
                  监理单位 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="supervision_company"
                  name="supervision_company"
                  value={formData.supervision_company || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_datetime">
                  开始时间 <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP HH:mm") : "选择日期和时间"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                    <div className="p-3 border-t">
                      <Input
                        type="time"
                        value={startDate ? format(startDate, "HH:mm") : ""}
                        onChange={(e) => {
                          if (startDate && e.target.value) {
                            const [hours, minutes] = e.target.value.split(":").map(Number)
                            const newDate = new Date(startDate)
                            newDate.setHours(hours, minutes)
                            setStartDate(newDate)
                          }
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_datetime">
                  结束时间 <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP HH:mm") : "选择日期和时间"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                    <div className="p-3 border-t">
                      <Input
                        type="time"
                        value={endDate ? format(endDate, "HH:mm") : ""}
                        onChange={(e) => {
                          if (endDate && e.target.value) {
                            const [hours, minutes] = e.target.value.split(":").map(Number)
                            const newDate = new Date(endDate)
                            newDate.setHours(hours, minutes)
                            setEndDate(newDate)
                          }
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">工作内容</h3>

            <div className="space-y-2">
              <Label htmlFor="work_overview">
                工作概述 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="work_overview"
                name="work_overview"
                value={formData.work_overview || ""}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pre_work_check_content">施工前检查内容</Label>
              <Textarea
                id="pre_work_check_content"
                name="pre_work_check_content"
                value={formData.pre_work_check_content || ""}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">问题与整改</h3>

            <div className="space-y-2">
              <Label htmlFor="issues_and_opinions">发现问题及处理意见</Label>
              <Textarea
                id="issues_and_opinions"
                name="issues_and_opinions"
                value={formData.issues_and_opinions || ""}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rectification_status">整改情况</Label>
              <Textarea
                id="rectification_status"
                name="rectification_status"
                value={formData.rectification_status || ""}
                onChange={handleChange}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">备注</Label>
              <Textarea id="remarks" name="remarks" value={formData.remarks || ""} onChange={handleChange} rows={2} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">人员信息</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="construction_enterprise">施工企业</Label>
                <Input
                  id="construction_enterprise"
                  name="construction_enterprise"
                  value={formData.construction_enterprise || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supervising_enterprise">监理企业</Label>
                <Input
                  id="supervising_enterprise"
                  name="supervising_enterprise"
                  value={formData.supervising_enterprise || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supervising_organization">监理机构</Label>
                <Input
                  id="supervising_organization"
                  name="supervising_organization"
                  value={formData.supervising_organization || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supervising_personnel">
                  监理人员 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="supervising_personnel"
                  name="supervising_personnel"
                  value={formData.supervising_personnel || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="on_site_supervising_personnel">现场监理人员</Label>
                <Input
                  id="on_site_supervising_personnel"
                  name="on_site_supervising_personnel"
                  value={formData.on_site_supervising_personnel || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="document_urls">相关文档链接</Label>
            <Input
              id="document_urls"
              name="document_urls"
              value={formData.document_urls || ""}
              onChange={handleChange}
              placeholder="多个链接请用逗号分隔"
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              "保存"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
