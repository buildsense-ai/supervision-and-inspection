"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Calendar, CheckCircle, AlertCircle, FileText } from "lucide-react"

interface SupervisionRecordEditModalProps {
  isOpen: boolean
  onClose: () => void
  record: any
  onSave: (record: any) => void
}

export function SupervisionRecordEditModal({ isOpen, onClose, record, onSave }: SupervisionRecordEditModalProps) {
  const [editedRecord, setEditedRecord] = useState<any>(null)
  const [activeSection, setActiveSection] = useState<string>("basic")

  // Refs for each section to enable scroll navigation
  const basicInfoRef = useRef<HTMLDivElement>(null)
  const preCheckRef = useRef<HTMLDivElement>(null)
  const inspectionRef = useRef<HTMLDivElement>(null)
  const problemsRef = useRef<HTMLDivElement>(null)
  const remarksRef = useRef<HTMLDivElement>(null)

  // Initialize or update editedRecord when record changes
  useEffect(() => {
    if (record) {
      setEditedRecord({ ...record })
    }
  }, [record])

  // Scroll to section when navigation item is clicked
  const scrollToSection = (sectionRef: React.RefObject<HTMLDivElement>, sectionId: string) => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth" })
      setActiveSection(sectionId)
    }
  }

  // Update active section based on scroll position
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollPosition = e.currentTarget.scrollTop
    const sections = [
      { ref: basicInfoRef, id: "basic" },
      { ref: preCheckRef, id: "preCheck" },
      { ref: inspectionRef, id: "inspection" },
      { ref: problemsRef, id: "problems" },
      { ref: remarksRef, id: "remarks" },
    ]

    // Find the current section based on scroll position
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i]
      if (section.ref.current && section.ref.current.offsetTop - 100 <= scrollPosition) {
        setActiveSection(section.id)
        break
      }
    }
  }

  // If no record or editedRecord, don't render the form content
  if (!editedRecord) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>编辑旁站记录</DialogTitle>
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

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setEditedRecord((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }))
  }

  const handlePreCheckItemChange = (index: number, field: string, value: string) => {
    setEditedRecord((prev: any) => {
      const newPreCheckItems = [...prev.preCheckItems]
      newPreCheckItems[index] = { ...newPreCheckItems[index], [field]: value }
      return { ...prev, preCheckItems: newPreCheckItems }
    })
  }

  const handleInspectionItemChange = (index: number, field: string, value: string) => {
    setEditedRecord((prev: any) => {
      const newInspectionItems = [...prev.inspectionItems]
      newInspectionItems[index] = { ...newInspectionItems[index], [field]: value }
      return { ...prev, inspectionItems: newInspectionItems }
    })
  }

  const handleProblemChange = (index: number, field: string, value: string) => {
    setEditedRecord((prev: any) => {
      const newProblems = [...prev.problems]
      newProblems[index] = { ...newProblems[index], [field]: value }
      return { ...prev, problems: newProblems }
    })
  }

  const handleSave = () => {
    onSave(editedRecord)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-500" />
            <DialogTitle>编辑旁站记录</DialogTitle>
          </div>
        </DialogHeader>

        {/* Navigation Bar */}
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-2 flex space-x-4 overflow-x-auto">
          <Button
            variant={activeSection === "basic" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection(basicInfoRef, "basic")}
            className="flex items-center gap-1"
          >
            <Calendar className="h-4 w-4" />
            <span>基本信息</span>
          </Button>
          <Button
            variant={activeSection === "preCheck" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection(preCheckRef, "preCheck")}
            className="flex items-center gap-1"
          >
            <CheckCircle className="h-4 w-4" />
            <span>前期检查</span>
          </Button>
          <Button
            variant={activeSection === "inspection" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection(inspectionRef, "inspection")}
            className="flex items-center gap-1"
          >
            <ClipboardList className="h-4 w-4" />
            <span>检查项目</span>
          </Button>
          <Button
            variant={activeSection === "problems" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection(problemsRef, "problems")}
            className="flex items-center gap-1"
          >
            <AlertCircle className="h-4 w-4" />
            <span>问题记录</span>
          </Button>
          <Button
            variant={activeSection === "remarks" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection(remarksRef, "remarks")}
            className="flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            <span>备注</span>
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 pt-4 space-y-8" onScroll={handleScroll}>
          {/* Basic Info Section */}
          <div ref={basicInfoRef} className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              基本信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">工程名称</Label>
                <Input
                  id="projectName"
                  value={editedRecord.basicInfo?.projectName || ""}
                  onChange={(e) => handleNestedChange("basicInfo", "projectName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supervisionType">旁站类型</Label>
                <Input
                  id="supervisionType"
                  value={editedRecord.basicInfo?.supervisionType || ""}
                  onChange={(e) => handleNestedChange("basicInfo", "supervisionType", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">日期</Label>
                <Input
                  id="date"
                  type="date"
                  value={editedRecord.basicInfo?.date || ""}
                  onChange={(e) => handleNestedChange("basicInfo", "date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">时间</Label>
                <Input
                  id="time"
                  value={editedRecord.basicInfo?.time || ""}
                  onChange={(e) => handleNestedChange("basicInfo", "time", e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="location">旁站部位</Label>
                <Input
                  id="location"
                  value={editedRecord.basicInfo?.location || ""}
                  onChange={(e) => handleNestedChange("basicInfo", "location", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Pre-Check Items Section */}
          <div ref={preCheckRef} className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              前期检查项目
            </h3>
            {editedRecord.preCheckItems?.map((item: any, index: number) => (
              <div key={index} className="space-y-4 border p-4 rounded-md">
                <Badge className="mb-2">检查项 {index + 1}</Badge>
                <div className="space-y-2">
                  <Label htmlFor={`precheck-item-${index}`}>检查项目</Label>
                  <Input
                    id={`precheck-item-${index}`}
                    value={item.item}
                    onChange={(e) => handlePreCheckItemChange(index, "item", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`precheck-result-${index}`}>检查结果</Label>
                    <Select
                      value={item.result}
                      onValueChange={(value) => handlePreCheckItemChange(index, "result", value)}
                    >
                      <SelectTrigger id={`precheck-result-${index}`}>
                        <SelectValue placeholder="选择结果" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="合格">合格</SelectItem>
                        <SelectItem value="不合格">不合格</SelectItem>
                        <SelectItem value="待整改">待整改</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`precheck-remark-${index}`}>备注</Label>
                    <Input
                      id={`precheck-remark-${index}`}
                      value={item.remark}
                      onChange={(e) => handlePreCheckItemChange(index, "remark", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full">
              添加检查项目
            </Button>
          </div>

          {/* Inspection Items Section */}
          <div ref={inspectionRef} className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-500" />
              旁站检查项目
            </h3>
            {editedRecord.inspectionItems?.map((item: any, index: number) => (
              <div key={index} className="space-y-4 border p-4 rounded-md">
                <Badge className="mb-2">检查项 {index + 1}</Badge>
                <div className="space-y-2">
                  <Label htmlFor={`inspection-item-${index}`}>检查项目</Label>
                  <Input
                    id={`inspection-item-${index}`}
                    value={item.item}
                    onChange={(e) => handleInspectionItemChange(index, "item", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`inspection-standard-${index}`}>检查标准</Label>
                    <Input
                      id={`inspection-standard-${index}`}
                      value={item.standard}
                      onChange={(e) => handleInspectionItemChange(index, "standard", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`inspection-result-${index}`}>检查结果</Label>
                    <Select
                      value={item.result}
                      onValueChange={(value) => handleInspectionItemChange(index, "result", value)}
                    >
                      <SelectTrigger id={`inspection-result-${index}`}>
                        <SelectValue placeholder="选择结果" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="合格">合格</SelectItem>
                        <SelectItem value="不合格">不合格</SelectItem>
                        <SelectItem value="待整改">待整改</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full">
              添加检查项目
            </Button>
          </div>

          {/* Problems Section */}
          <div ref={problemsRef} className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              发现问题
            </h3>
            {editedRecord.problems?.length ? (
              editedRecord.problems.map((problem: any, index: number) => (
                <div key={index} className="space-y-4 border p-4 rounded-md">
                  <Badge variant="destructive" className="mb-2">
                    问题 {index + 1}
                  </Badge>
                  <div className="space-y-2">
                    <Label htmlFor={`problem-desc-${index}`}>问题描述</Label>
                    <Textarea
                      id={`problem-desc-${index}`}
                      value={problem.description}
                      onChange={(e) => handleProblemChange(index, "description", e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`problem-solution-${index}`}>解决方案</Label>
                    <Textarea
                      id={`problem-solution-${index}`}
                      value={problem.solution}
                      onChange={(e) => handleProblemChange(index, "solution", e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">暂无发现问题</p>
            )}
            <Button variant="outline" size="sm" className="w-full">
              添加问题
            </Button>
          </div>

          {/* Remarks Section */}
          <div ref={remarksRef} className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              备注
            </h3>
            <div className="space-y-2">
              <Label htmlFor="remarks">备注说明</Label>
              <Textarea
                id="remarks"
                value={editedRecord.remarks || ""}
                onChange={(e) => handleChange("remarks", e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conclusion">旁站结论</Label>
              <Select
                value={editedRecord.conclusion || ""}
                onValueChange={(value) => handleChange("conclusion", value)}
              >
                <SelectTrigger id="conclusion">
                  <SelectValue placeholder="选择结论" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="合格">合格</SelectItem>
                  <SelectItem value="不合格">不合格</SelectItem>
                  <SelectItem value="待整改">待整改</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-2">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
