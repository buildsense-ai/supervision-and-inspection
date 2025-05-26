"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, ClipboardList, AlertCircle, FileText, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DailyLogEditModalProps {
  isOpen: boolean
  onClose: () => void
  record: any
  onSave: (record: any) => void
}

export function DailyLogEditModal({ isOpen, onClose, record, onSave }: DailyLogEditModalProps) {
  const [editedRecord, setEditedRecord] = useState<any>(null)
  const [activeSection, setActiveSection] = useState<string>("basic")

  // Refs for each section to enable scroll navigation
  const basicInfoRef = useRef<HTMLDivElement>(null)
  const personnelRef = useRef<HTMLDivElement>(null)
  const constructionRef = useRef<HTMLDivElement>(null)
  const supervisionRef = useRef<HTMLDivElement>(null)
  const problemsRef = useRef<HTMLDivElement>(null)
  const otherMattersRef = useRef<HTMLDivElement>(null)

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
      { ref: personnelRef, id: "personnel" },
      { ref: constructionRef, id: "construction" },
      { ref: supervisionRef, id: "supervision" },
      { ref: problemsRef, id: "problems" },
      { ref: otherMattersRef, id: "other" },
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
            <DialogTitle>编辑监理日志</DialogTitle>
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

  const handlePersonnelChange = (id: string, checked: boolean) => {
    setEditedRecord((prev: any) => ({
      ...prev,
      supervisionPersonnel: prev.supervisionPersonnel.map((item: any) =>
        item.id === id ? { ...item, checked } : item,
      ),
    }))
  }

  const handleConstructionActivityChange = (id: string, field: string, value: string) => {
    setEditedRecord((prev: any) => ({
      ...prev,
      constructionActivities: prev.constructionActivities.map((item: any) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }))
  }

  const handleSupervisionActivityChange = (id: string, field: string, value: string) => {
    setEditedRecord((prev: any) => ({
      ...prev,
      supervisionActivities: prev.supervisionActivities.map((item: any) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }))
  }

  const handleProblemChange = (category: string, id: string, field: string, value: string) => {
    setEditedRecord((prev: any) => ({
      ...prev,
      problems: {
        ...prev.problems,
        [category]: prev.problems[category].map((item: any) => (item.id === id ? { ...item, [field]: value } : item)),
      },
    }))
  }

  const handleOtherMatterChange = (id: string, field: string, value: string) => {
    setEditedRecord((prev: any) => ({
      ...prev,
      otherMatters: prev.otherMatters.map((item: any) => (item.id === id ? { ...item, [field]: value } : item)),
    }))
  }

  const handleSave = () => {
    onSave(editedRecord)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-500" />
            <DialogTitle>编辑监理日志</DialogTitle>
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
            variant={activeSection === "personnel" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection(personnelRef, "personnel")}
            className="flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            <span>监理人员</span>
          </Button>
          <Button
            variant={activeSection === "construction" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection(constructionRef, "construction")}
            className="flex items-center gap-1"
          >
            <ClipboardList className="h-4 w-4" />
            <span>施工活动</span>
          </Button>
          <Button
            variant={activeSection === "supervision" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection(supervisionRef, "supervision")}
            className="flex items-center gap-1"
          >
            <ClipboardList className="h-4 w-4" />
            <span>监理活动</span>
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
            variant={activeSection === "other" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection(otherMattersRef, "other")}
            className="flex items-center gap-1"
          >
            <MessageSquare className="h-4 w-4" />
            <span>其他事项</span>
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 pt-4 space-y-8" onScroll={handleScroll}>
          {/* Basic Info Section */}
          <div ref={basicInfoRef} className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
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
                <Label htmlFor="date">日期</Label>
                <Input
                  id="date"
                  type="date"
                  value={editedRecord.basicInfo?.date || ""}
                  onChange={(e) => handleNestedChange("basicInfo", "date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weather">天气</Label>
                <Input
                  id="weather"
                  value={editedRecord.basicInfo?.weather || ""}
                  onChange={(e) => handleNestedChange("basicInfo", "weather", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">温度</Label>
                <Input
                  id="temperature"
                  value={editedRecord.basicInfo?.temperature || ""}
                  onChange={(e) => handleNestedChange("basicInfo", "temperature", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Personnel Section */}
          <div ref={personnelRef} className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              监理人员
            </h3>
            <div className="space-y-2">
              {editedRecord.supervisionPersonnel?.map((person: any) => (
                <div key={person.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`person-${person.id}`}
                    checked={person.checked}
                    onCheckedChange={(checked) => handlePersonnelChange(person.id, checked as boolean)}
                  />
                  <Label htmlFor={`person-${person.id}`}>{person.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Construction Activities Section */}
          <div ref={constructionRef} className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-green-500" />
              施工活动
            </h3>
            {editedRecord.constructionActivities?.map((activity: any, index: number) => (
              <div key={activity.id} className="space-y-4 border p-4 rounded-md">
                <Badge className="mb-2">活动 {index + 1}</Badge>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`activity-location-${activity.id}`}>施工部位</Label>
                    <Input
                      id={`activity-location-${activity.id}`}
                      value={activity.location}
                      onChange={(e) => handleConstructionActivityChange(activity.id, "location", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`activity-content-${activity.id}`}>施工内容</Label>
                    <Input
                      id={`activity-content-${activity.id}`}
                      value={activity.content}
                      onChange={(e) => handleConstructionActivityChange(activity.id, "content", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`activity-details-${activity.id}`}>详细说明</Label>
                  <Textarea
                    id={`activity-details-${activity.id}`}
                    value={activity.details}
                    onChange={(e) => handleConstructionActivityChange(activity.id, "details", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full">
              添加施工活动
            </Button>
          </div>

          {/* Supervision Activities Section */}
          <div ref={supervisionRef} className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-500" />
              监理活动
            </h3>
            {editedRecord.supervisionActivities?.map((activity: any, index: number) => (
              <div key={activity.id} className="space-y-4 border p-4 rounded-md">
                <Badge className="mb-2">活动 {index + 1}</Badge>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`supervision-type-${activity.id}`}>监理类型</Label>
                    <Input
                      id={`supervision-type-${activity.id}`}
                      value={activity.type}
                      onChange={(e) => handleSupervisionActivityChange(activity.id, "type", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`supervision-related-${activity.id}`}>相关施工活动</Label>
                    <Input
                      id={`supervision-related-${activity.id}`}
                      value={activity.relatedActivity}
                      onChange={(e) => handleSupervisionActivityChange(activity.id, "relatedActivity", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`supervision-details-${activity.id}`}>详细说明</Label>
                  <Textarea
                    id={`supervision-details-${activity.id}`}
                    value={activity.details}
                    onChange={(e) => handleSupervisionActivityChange(activity.id, "details", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full">
              添加监理活动
            </Button>
          </div>

          {/* Problems Section */}
          <div ref={problemsRef} className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              问题记录
            </h3>

            <div className="space-y-6">
              {/* Quality Problems */}
              <div className="space-y-4">
                <h4 className="font-medium">质量问题</h4>
                {editedRecord.problems?.quality?.map((problem: any, index: number) => (
                  <div key={problem.id} className="space-y-4 border p-4 rounded-md">
                    <Badge variant="destructive" className="mb-2">
                      问题 {index + 1}
                    </Badge>
                    <div className="space-y-2">
                      <Label htmlFor={`quality-desc-${problem.id}`}>问题描述</Label>
                      <Textarea
                        id={`quality-desc-${problem.id}`}
                        value={problem.description}
                        onChange={(e) => handleProblemChange("quality", problem.id, "description", e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`quality-measures-${problem.id}`}>处理措施</Label>
                      <Textarea
                        id={`quality-measures-${problem.id}`}
                        value={problem.measures}
                        onChange={(e) => handleProblemChange("quality", problem.id, "measures", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  添加质量问题
                </Button>
              </div>

              {/* Safety Problems */}
              <div className="space-y-4">
                <h4 className="font-medium">安全问题</h4>
                {editedRecord.problems?.safety?.length ? (
                  editedRecord.problems.safety.map((problem: any, index: number) => (
                    <div key={problem.id} className="space-y-4 border p-4 rounded-md">
                      <Badge variant="destructive" className="mb-2">
                        问题 {index + 1}
                      </Badge>
                      <div className="space-y-2">
                        <Label htmlFor={`safety-desc-${problem.id}`}>问题描述</Label>
                        <Textarea
                          id={`safety-desc-${problem.id}`}
                          value={problem.description}
                          onChange={(e) => handleProblemChange("safety", problem.id, "description", e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`safety-measures-${problem.id}`}>处理措施</Label>
                        <Textarea
                          id={`safety-measures-${problem.id}`}
                          value={problem.measures}
                          onChange={(e) => handleProblemChange("safety", problem.id, "measures", e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">暂无安全问题</p>
                )}
                <Button variant="outline" size="sm" className="w-full">
                  添加安全问题
                </Button>
              </div>

              {/* Progress Problems */}
              <div className="space-y-4">
                <h4 className="font-medium">进度问题</h4>
                {editedRecord.problems?.progress?.length ? (
                  editedRecord.problems.progress.map((problem: any, index: number) => (
                    <div key={problem.id} className="space-y-4 border p-4 rounded-md">
                      <Badge variant="destructive" className="mb-2">
                        问题 {index + 1}
                      </Badge>
                      <div className="space-y-2">
                        <Label htmlFor={`progress-desc-${problem.id}`}>问题描述</Label>
                        <Textarea
                          id={`progress-desc-${problem.id}`}
                          value={problem.description}
                          onChange={(e) => handleProblemChange("progress", problem.id, "description", e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`progress-measures-${problem.id}`}>处理措施</Label>
                        <Textarea
                          id={`progress-measures-${problem.id}`}
                          value={problem.measures}
                          onChange={(e) => handleProblemChange("progress", problem.id, "measures", e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">暂无进度问题</p>
                )}
                <Button variant="outline" size="sm" className="w-full">
                  添加进度问题
                </Button>
              </div>
            </div>
          </div>

          {/* Other Matters Section */}
          <div ref={otherMattersRef} className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-amber-500" />
              其他事项
            </h3>
            {editedRecord.otherMatters?.map((matter: any, index: number) => (
              <div key={matter.id} className="space-y-4 border p-4 rounded-md">
                <Badge className="mb-2">事项 {index + 1}</Badge>
                <div className="space-y-2">
                  <Label htmlFor={`matter-type-${matter.id}`}>类型</Label>
                  <Input
                    id={`matter-type-${matter.id}`}
                    value={matter.type}
                    onChange={(e) => handleOtherMatterChange(matter.id, "type", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`matter-title-${matter.id}`}>标题</Label>
                  <Input
                    id={`matter-title-${matter.id}`}
                    value={matter.title}
                    onChange={(e) => handleOtherMatterChange(matter.id, "title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`matter-content-${matter.id}`}>内容</Label>
                  <Textarea
                    id={`matter-content-${matter.id}`}
                    value={matter.content}
                    onChange={(e) => handleOtherMatterChange(matter.id, "content", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full">
              添加其他事项
            </Button>
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
