"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileCheck, Calendar, MessageSquare, Building, Ruler, Coins } from "lucide-react"

interface MeetingMinuteEditModalProps {
  isOpen: boolean
  onClose: () => void
  record: any
  onSave: (record: any) => void
}

export function MeetingMinuteEditModal({ isOpen, onClose, record, onSave }: MeetingMinuteEditModalProps) {
  const [editedRecord, setEditedRecord] = useState<any>(null)
  const [activeSection, setActiveSection] = useState<string>("basic")

  // Refs for each section to enable scroll navigation
  const basicInfoRef = useRef<HTMLDivElement>(null)
  const constructionRef = useRef<HTMLDivElement>(null)
  const supervisionRef = useRef<HTMLDivElement>(null)
  const unitsRef = useRef<HTMLDivElement>(null)
  const followUpRef = useRef<HTMLDivElement>(null)

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
      { ref: constructionRef, id: "construction" },
      { ref: supervisionRef, id: "supervision" },
      { ref: unitsRef, id: "units" },
      { ref: followUpRef, id: "followUp" },
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
            <DialogTitle>编辑会议纪要</DialogTitle>
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

  const handleNestedObjectChange = (parent: string, nestedParent: string, field: string, value: any) => {
    setEditedRecord((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [nestedParent]: {
          ...prev[parent]?.[nestedParent],
          [field]: value,
        },
      },
    }))
  }

  const handleSave = () => {
    onSave(editedRecord)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-amber-500" />
            <DialogTitle>编辑会议纪要</DialogTitle>
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
            variant={activeSection === "construction" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection(constructionRef, "construction")}
            className="flex items-center gap-1"
          >
            <Building className="h-4 w-4" />
            <span>施工单位</span>
          </Button>
          <Button
            variant={activeSection === "supervision" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection(supervisionRef, "supervision")}
            className="flex items-center gap-1"
          >
            <Ruler className="h-4 w-4" />
            <span>监理单位</span>
          </Button>
          <Button
            variant={activeSection === "units" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection(unitsRef, "units")}
            className="flex items-center gap-1"
          >
            <Coins className="h-4 w-4" />
            <span>其他单位</span>
          </Button>
          <Button
            variant={activeSection === "followUp" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection(followUpRef, "followUp")}
            className="flex items-center gap-1"
          >
            <MessageSquare className="h-4 w-4" />
            <span>后续事项</span>
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] p-6 pt-4 space-y-8" onScroll={handleScroll}>
          {/* Basic Info Section */}
          <div ref={basicInfoRef} className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-500" />
              基本信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meetingName">会议名称</Label>
                <Input
                  id="meetingName"
                  value={editedRecord.basicInfo?.meetingName || ""}
                  onChange={(e) => handleNestedChange("basicInfo", "meetingName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTime">日期时间</Label>
                <Input
                  id="dateTime"
                  value={editedRecord.basicInfo?.dateTime || ""}
                  onChange={(e) => handleNestedChange("basicInfo", "dateTime", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">会议地点</Label>
                <Input
                  id="location"
                  value={editedRecord.basicInfo?.location || ""}
                  onChange={(e) => handleNestedChange("basicInfo", "location", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="host">主持人</Label>
                <Input
                  id="host"
                  value={editedRecord.basicInfo?.host || ""}
                  onChange={(e) => handleNestedChange("basicInfo", "host", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recorder">记录人</Label>
                <Input
                  id="recorder"
                  value={editedRecord.basicInfo?.recorder || ""}
                  onChange={(e) => handleNestedChange("basicInfo", "recorder", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendees">参会人员</Label>
                <Input
                  id="attendees"
                  value={editedRecord.basicInfo?.attendees || ""}
                  onChange={(e) => handleNestedChange("basicInfo", "attendees", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Construction Issues Section */}
          <div ref={constructionRef} className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              施工单位反映问题
            </h3>
            <div className="space-y-2">
              <Label htmlFor="constructionIssues">施工单位反映问题</Label>
              <Textarea
                id="constructionIssues"
                value={editedRecord.constructionIssues || ""}
                onChange={(e) => handleChange("constructionIssues", e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Supervision Analysis Section */}
          <div ref={supervisionRef} className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Ruler className="h-5 w-5 text-green-500" />
              监理单位分析
            </h3>
            <div className="space-y-2">
              <Label htmlFor="safety">安全文明施工</Label>
              <Textarea
                id="safety"
                value={editedRecord.supervisionAnalysis?.safety || ""}
                onChange={(e) => handleNestedChange("supervisionAnalysis", "safety", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualityAndProgress">质量与进度</Label>
              <Textarea
                id="qualityAndProgress"
                value={editedRecord.supervisionAnalysis?.qualityAndProgress || ""}
                onChange={(e) => handleNestedChange("supervisionAnalysis", "qualityAndProgress", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentation">资料管理</Label>
              <Textarea
                id="documentation"
                value={editedRecord.supervisionAnalysis?.documentation || ""}
                onChange={(e) => handleNestedChange("supervisionAnalysis", "documentation", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextWeekRequirements">下周工作要求</Label>
              <Textarea
                id="nextWeekRequirements"
                value={editedRecord.supervisionAnalysis?.nextWeekRequirements || ""}
                onChange={(e) => handleNestedChange("supervisionAnalysis", "nextWeekRequirements", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Other Units Section */}
          <div ref={unitsRef} className="space-y-6">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Coins className="h-5 w-5 text-purple-500" />
              其他单位
            </h3>

            {/* Cost Unit */}
            <div className="space-y-2">
              <Label htmlFor="costUnit">造价单位</Label>
              <Textarea
                id="costUnit"
                value={editedRecord.costUnit || ""}
                onChange={(e) => handleChange("costUnit", e.target.value)}
                rows={3}
              />
            </div>

            {/* Design Unit */}
            <div className="space-y-2">
              <Label htmlFor="designUnit">设计单位</Label>
              <Textarea
                id="designUnit"
                value={editedRecord.designUnit || ""}
                onChange={(e) => handleChange("designUnit", e.target.value)}
                rows={3}
              />
            </div>

            {/* Survey Unit */}
            <div className="space-y-2">
              <Label htmlFor="surveyUnit">测量单位</Label>
              <Textarea
                id="surveyUnit"
                value={editedRecord.surveyUnit || ""}
                onChange={(e) => handleChange("surveyUnit", e.target.value)}
                rows={3}
              />
            </div>

            {/* Building Unit */}
            <div className="space-y-4">
              <h4 className="font-medium">建设单位</h4>
              <div className="space-y-2">
                <Label htmlFor="buildingUnitSafety">安全文明施工</Label>
                <Textarea
                  id="buildingUnitSafety"
                  value={editedRecord.buildingUnit?.safety || ""}
                  onChange={(e) => handleNestedChange("buildingUnit", "safety", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buildingUnitQualityAndProgress">质量与进度</Label>
                <Textarea
                  id="buildingUnitQualityAndProgress"
                  value={editedRecord.buildingUnit?.qualityAndProgress || ""}
                  onChange={(e) => handleNestedChange("buildingUnit", "qualityAndProgress", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buildingUnitDocumentation">资料管理</Label>
                <Textarea
                  id="buildingUnitDocumentation"
                  value={editedRecord.buildingUnit?.documentation || ""}
                  onChange={(e) => handleNestedChange("buildingUnit", "documentation", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buildingUnitNextWeekRequirements">下周工作要求</Label>
                <Textarea
                  id="buildingUnitNextWeekRequirements"
                  value={editedRecord.buildingUnit?.nextWeekRequirements || ""}
                  onChange={(e) => handleNestedChange("buildingUnit", "nextWeekRequirements", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Follow-up Items Section */}
          <div ref={followUpRef} className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-amber-500" />
              后续事项
            </h3>
            <div className="space-y-2">
              <Label htmlFor="designChanges">设计变更</Label>
              <Textarea
                id="designChanges"
                value={editedRecord.followUpItems?.designChanges || ""}
                onChange={(e) => handleNestedChange("followUpItems", "designChanges", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workContactApproval">工作联系单审批</Label>
              <Textarea
                id="workContactApproval"
                value={editedRecord.followUpItems?.workContactApproval || ""}
                onChange={(e) => handleNestedChange("followUpItems", "workContactApproval", e.target.value)}
                rows={3}
              />
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
