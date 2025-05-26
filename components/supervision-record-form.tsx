"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, Loader2, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createSupervisionRecord, updateSupervisionRecord, type SupervisionRecord } from "@/lib/api-service"

interface SupervisionRecordFormProps {
  record?: SupervisionRecord | null
  onSuccess: () => void
  onCancel: () => void
}

export function SupervisionRecordForm({ record, onSuccess, onCancel }: SupervisionRecordFormProps) {
  const [formData, setFormData] = useState<Omit<SupervisionRecord, "id" | "created_at" | "updated_at">>({
    project_name: "",
    construction_unit: "",
    pangzhan_unit: "",
    supervision_company: "",
    start_datetime: null,
    end_datetime: null,
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

  const [loading, setLoading] = useState(false)
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)

  const isEditing = !!record

  // 初始化表单数据
  useEffect(() => {
    if (record) {
      setFormData({
        project_name: record.project_name || "",
        construction_unit: record.construction_unit || "",
        pangzhan_unit: record.pangzhan_unit || "",
        supervision_company: record.supervision_company || "",
        start_datetime: record.start_datetime,
        end_datetime: record.end_datetime,
        work_overview: record.work_overview || "",
        pre_work_check_content: record.pre_work_check_content || "",
        supervising_personnel: record.supervising_personnel || "",
        issues_and_opinions: record.issues_and_opinions || "",
        rectification_status: record.rectification_status || "",
        remarks: record.remarks || "",
        construction_enterprise: record.construction_enterprise || "",
        supervising_enterprise: record.supervising_enterprise || "",
        supervising_organization: record.supervising_organization || "",
        on_site_supervising_personnel: record.on_site_supervising_personnel || "",
        document_urls: record.document_urls || "",
      })
    }
  }, [record])

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 准备提交的数据，将空字符串转换为 null
      const submitData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, value === "" ? null : value]),
      ) as Omit<SupervisionRecord, "id" | "created_at" | "updated_at">

      if (isEditing && record?.id) {
        await updateSupervisionRecord(record.id, submitData)
      } else {
        await createSupervisionRecord(submitData)
      }

      onSuccess()
    } catch (error) {
      console.error("提交表单失败:", error)
    } finally {
      setLoading(false)
    }
  }

  // 处理输入变化
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // 处理日期变化
  const handleDateChange = (field: "start_datetime" | "end_datetime", date: Date | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date ? date.toISOString() : null,
    }))
  }

  // 格式化日期显示
  const formatDateDisplay = (dateString: string | null) => {
    if (!dateString) return "选择日期"
    try {
      return format(new Date(dateString), "yyyy-MM-dd HH:mm")
    } catch {
      return "选择日期"
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isEditing ? "编辑旁站记录" : "新建旁站记录"}
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project_name">项目名称 *</Label>
                  <Input
                    id="project_name"
                    value={formData.project_name || ""}
                    onChange={(e) => handleInputChange("project_name", e.target.value)}
                    placeholder="请输入项目名称"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="construction_unit">施工单位</Label>
                  <Input
                    id="construction_unit"
                    value={formData.construction_unit || ""}
                    onChange={(e) => handleInputChange("construction_unit", e.target.value)}
                    placeholder="请输入施工单位"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pangzhan_unit">旁站单位</Label>
                  <Input
                    id="pangzhan_unit"
                    value={formData.pangzhan_unit || ""}
                    onChange={(e) => handleInputChange("pangzhan_unit", e.target.value)}
                    placeholder="请输入旁站单位"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supervision_company">监理公司</Label>
                  <Input
                    id="supervision_company"
                    value={formData.supervision_company || ""}
                    onChange={(e) => handleInputChange("supervision_company", e.target.value)}
                    placeholder="请输入监理公司"
                  />
                </div>
              </div>

              {/* 时间选择 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>开始时间</Label>
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.start_datetime && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formatDateDisplay(formData.start_datetime)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.start_datetime ? new Date(formData.start_datetime) : undefined}
                        onSelect={(date) => {
                          handleDateChange("start_datetime", date)
                          setStartDateOpen(false)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>结束时间</Label>
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.end_datetime && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formatDateDisplay(formData.end_datetime)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.end_datetime ? new Date(formData.end_datetime) : undefined}
                        onSelect={(date) => {
                          handleDateChange("end_datetime", date)
                          setEndDateOpen(false)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 工作内容 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">工作内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="work_overview">工作概况</Label>
                <Textarea
                  id="work_overview"
                  value={formData.work_overview || ""}
                  onChange={(e) => handleInputChange("work_overview", e.target.value)}
                  placeholder="请输入工作概况"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pre_work_check_content">工前检查内容</Label>
                <Textarea
                  id="pre_work_check_content"
                  value={formData.pre_work_check_content || ""}
                  onChange={(e) => handleInputChange("pre_work_check_content", e.target.value)}
                  placeholder="请输入工前检查内容"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* 人员信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">人员信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supervising_personnel">监理人员</Label>
                  <Input
                    id="supervising_personnel"
                    value={formData.supervising_personnel || ""}
                    onChange={(e) => handleInputChange("supervising_personnel", e.target.value)}
                    placeholder="请输入监理人员"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="on_site_supervising_personnel">现场监理人员</Label>
                  <Input
                    id="on_site_supervising_personnel"
                    value={formData.on_site_supervising_personnel || ""}
                    onChange={(e) => handleInputChange("on_site_supervising_personnel", e.target.value)}
                    placeholder="请输入现场监理人员"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 问题与整改 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">问题与整改</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="issues_and_opinions">发现问题及处理意见</Label>
                <Textarea
                  id="issues_and_opinions"
                  value={formData.issues_and_opinions || ""}
                  onChange={(e) => handleInputChange("issues_and_opinions", e.target.value)}
                  placeholder="请输入发现的问题及处理意见"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rectification_status">整改情况</Label>
                <Textarea
                  id="rectification_status"
                  value={formData.rectification_status || ""}
                  onChange={(e) => handleInputChange("rectification_status", e.target.value)}
                  placeholder="请输入整改情况"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* 其他信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">其他信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="construction_enterprise">施工企业</Label>
                  <Input
                    id="construction_enterprise"
                    value={formData.construction_enterprise || ""}
                    onChange={(e) => handleInputChange("construction_enterprise", e.target.value)}
                    placeholder="请输入施工企业"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supervising_enterprise">监理企业</Label>
                  <Input
                    id="supervising_enterprise"
                    value={formData.supervising_enterprise || ""}
                    onChange={(e) => handleInputChange("supervising_enterprise", e.target.value)}
                    placeholder="请输入监理企业"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supervising_organization">监理机构</Label>
                  <Input
                    id="supervising_organization"
                    value={formData.supervising_organization || ""}
                    onChange={(e) => handleInputChange("supervising_organization", e.target.value)}
                    placeholder="请输入监理机构"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document_urls">文档链接</Label>
                  <Input
                    id="document_urls"
                    value={formData.document_urls || ""}
                    onChange={(e) => handleInputChange("document_urls", e.target.value)}
                    placeholder="请输入文档链接"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">备注</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks || ""}
                  onChange={(e) => handleInputChange("remarks", e.target.value)}
                  placeholder="请输入备注信息"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* 提交按钮 */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "更新记录" : "创建记录"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
