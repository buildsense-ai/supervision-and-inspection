"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  MapPin,
  MergeIcon,
  Clock,
  Users,
  Edit,
  AlertCircle,
  ClipboardList,
  FileCheck,
  FileText,
  ClipboardCheck,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProblemRecordDetailModal } from "@/components/problem-record-detail-modal"
import { ProblemRecordEditModal } from "@/components/problem-record-edit-modal"
import { GenerateNotificationModal } from "@/components/generate-notification-modal"
import { DailyLogEditModal } from "@/components/daily-log-edit-modal"
import { DailyLogDetailModal } from "@/components/daily-log-detail-modal"
import { SupervisionRecordEditModal } from "@/components/supervision-record-edit-modal"
import { SupervisionRecordDetailModal } from "@/components/supervision-record-detail-modal"
import { MeetingMinuteEditModal } from "@/components/meeting-minute-edit-modal"
import { MeetingMinuteDetailModal } from "@/components/meeting-minute-detail-modal"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getSupervisionRecords, type SupervisionRecord } from "@/lib/api-service"

// Enhanced mock data for problem records
const mockIssues = [
  {
    id: "issue-1",
    type: "issue",
    title: "基坑支护结构变形超出设计允许值",
    status: "pending",
    date: "2025-05-10",
    location: "A区基坑",
    hasImage: true,
    responsibleUnit: "某建设单位",
    icon: AlertCircle,
    images: ["image1", "image2"],
    standards: [
      { code: "GB 50202-2018", name: "建筑地基基础工程施工质量验收标准" },
      { code: "JGJ 120-2012", name: "建筑基坑支护技术规程" },
    ],
    documents: [{ id: "doc1", title: "监理工程师通知单-001" }],
  },
  {
    id: "issue-2",
    type: "issue",
    title: "混凝土浇筑过程中出现蜂窝麻面",
    status: "pending",
    date: "2025-05-12",
    location: "B区3层柱",
    hasImage: true,
    responsibleUnit: "某施工单位",
    icon: AlertCircle,
    images: ["image3"],
    standards: [{ code: "GB 50204-2015", name: "混凝土结构工程施工质量验收规范" }],
    documents: [],
  },
  {
    id: "issue-3",
    type: "issue",
    title: "钢筋保护层厚度不足",
    status: "resolved",
    date: "2025-05-13",
    location: "C区梁",
    hasImage: false,
    responsibleUnit: "某施工单位",
    icon: AlertCircle,
    standards: [{ code: "GB 50204-2015", name: "混凝土结构工程施工质量验收规范" }],
    documents: [{ id: "doc2", title: "监理工程师通知单-002" }],
  },
]

// 监理日志数据
const mockDailyLogs = [
  {
    id: "log-1",
    type: "daily-log",
    title: "监理日志 - 2025-05-10",
    date: "2025-05-10",
    weather: "晴",
    icon: Calendar,
    basicInfo: {
      projectName: "某某建设工程",
      date: "2025-05-10",
      weather: "晴",
      temperature: "20-28℃",
    },
    supervisionPersonnel: [
      { id: "chief", label: "总工（总监）", checked: true },
      { id: "specialist", label: "专工（专业监理）", checked: true },
    ],
    constructionActivities: [
      {
        id: "ca1",
        location: "A区3层",
        content: "浇筑混凝土",
        details: "今日对A区3层进行了混凝土浇筑，共计约120立方米。",
      },
    ],
    supervisionActivities: [
      {
        id: "sa1",
        type: "旁站",
        relatedActivity: "浇筑混凝土（A区3层）",
        details: "对A区3层混凝土浇筑进行了旁站监理，检查了模板支撑、钢筋绑扎情况，确保浇筑质量符合施工要求。",
      },
    ],
    problems: {
      quality: [
        {
          id: "q1",
          description: "发现A区3层混凝土浇筑过程中有少量蜂窝麻面",
          measures: "已要求施工单位及时处理并加强模板支设和振捣工作",
        },
      ],
      safety: [],
      progress: [],
      cost: [],
    },
    otherMatters: [
      {
        id: "om1",
        type: "correspondence",
        title: "重要来往文件、电话记录",
        content: "今日收到建设单位关于工程变更的通知函1份。",
      },
    ],
    generatedDocuments: [{ id: "doc-1", title: "监理日志-2025-05-10", date: "2025-05-10", type: "pdf" }],
  },
  {
    id: "log-2",
    type: "daily-log",
    title: "监理日志 - 2025-05-11",
    date: "2025-05-11",
    weather: "多云",
    icon: Calendar,
    basicInfo: {
      projectName: "某某建设工程",
      date: "2025-05-11",
      weather: "多云",
      temperature: "18-25℃",
    },
    supervisionPersonnel: [
      { id: "chief", label: "总工（总监）", checked: true },
      { id: "specialist", label: "专工（专业监理）", checked: true },
    ],
    constructionActivities: [],
    supervisionActivities: [],
    problems: {
      quality: [],
      safety: [],
      progress: [],
      cost: [],
    },
    otherMatters: [],
    generatedDocuments: [],
  },
]

// 会议纪要数据
const mockMeetingMinutes = [
  {
    id: "meeting-1",
    type: "meeting",
    title: "项目例会",
    date: "2025-05-10",
    attendees: 12,
    icon: FileCheck,
    basicInfo: {
      meetingName: "某某工程第1次监理例会",
      dateTime: "2025年5月10日 14:00-16:00",
      location: "项目部会议室",
      host: "张三（总监）",
      recorder: "李四（监理员）",
      attendees: "建设单位：王五、赵六；施工单位：钱七、孙八；监理单位：张三、李四",
    },
    constructionIssues: "施工单位反映基坑支护结构变形超出设计允许值，需要设计单位提供处理方案。",
    supervisionAnalysis: {
      safety: "本周安全文明施工情况良好，未发现重大安全隐患。",
      qualityAndProgress: "本周完成A区基坑开挖，质量符合要求，进度略有滞后。",
      documentation: "施工日志记录不够详细，需要加强。",
      nextWeekRequirements: "加强基坑支护监测，确保施工安全。",
    },
    costUnit: "本周已完成A区基坑开挖工程量的计量，正在审核。",
    designUnit: "已收到基坑支护变形问题，正在研究处理方案。",
    surveyUnit: "无",
    buildingUnit: {
      safety: "要求施工单位加强现场安全管理，特别是高处作业安全防护。",
      qualityAndProgress: "要求加快施工进度，确保下周完成B区基坑开挖。",
      documentation: "要求完善施工资料，及时归档。",
      nextWeekRequirements: "重点关注基坑支护问题，确保施工安全。",
    },
    followUpItems: {
      designChanges: "基坑支护设计变更待定。",
      workContactApproval: "已审批工作联系单3份，待审批2份。",
    },
    generatedDocuments: [{ id: "doc-m1", title: "项目例会纪要-2025-05-10", date: "2025-05-10", type: "pdf" }],
  },
  {
    id: "meeting-2",
    type: "meeting",
    title: "质量专题会",
    date: "2025-05-12",
    attendees: 8,
    icon: FileCheck,
    basicInfo: {
      meetingName: "混凝土质量专题会",
      dateTime: "2025年5月12日 10:00-11:30",
      location: "项目部会议室",
      host: "张三（总监）",
      recorder: "李四（监理员）",
      attendees: "建设单位：王五；施工单位：钱七、孙八、周九；监理单位：张三、李四",
    },
    constructionIssues: "施工单位反映混凝土供应商送料不及时，影响施工进度。",
    supervisionAnalysis: {
      safety: "无特殊安全问题。",
      qualityAndProgress: "混凝土浇筑过程中出现蜂窝麻面现象，需要加强振捣工作。",
      documentation: "无",
      nextWeekRequirements: "加强混凝土浇筑过程控制，确保质量。",
    },
    costUnit: "无",
    designUnit: "无",
    surveyUnit: "无",
    buildingUnit: {
      safety: "无",
      qualityAndProgress: "要求施工单位加强混凝土浇筑工艺控制，确保质量。",
      documentation: "无",
      nextWeekRequirements: "协调解决混凝土供应问题，确保施工进度。",
    },
    followUpItems: {
      designChanges: "无",
      workContactApproval: "已审批工作联系单1份。",
    },
    generatedDocuments: [],
  },
]

export default function EventsPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [showMergeDialog, setShowMergeDialog] = useState(false)
  const [showInspectionDialog, setShowInspectionDialog] = useState(false)

  // 旁站记录状态
  const [supervisionRecords, setSupervisionRecords] = useState<SupervisionRecord[]>([])
  const [loadingSupervision, setLoadingSupervision] = useState(true)

  // State for problem record detail modal
  const [problemDetailModalOpen, setProblemDetailModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)

  // State for problem record edit modal
  const [problemEditModalOpen, setProblemEditModalOpen] = useState(false)

  // State for notification generation modal
  const [notificationModalOpen, setNotificationModalOpen] = useState(false)

  // State for daily log detail modal
  const [dailyLogDetailModalOpen, setDailyLogDetailModalOpen] = useState(false)

  // State for daily log edit modal
  const [dailyLogEditModalOpen, setDailyLogEditModalOpen] = useState(false)

  // State for supervision record detail modal
  const [supervisionDetailModalOpen, setSupervisionDetailModalOpen] = useState(false)

  // State for supervision record edit modal
  const [supervisionEditModalOpen, setSupervisionEditModalOpen] = useState(false)

  // State for meeting minute detail modal
  const [meetingDetailModalOpen, setMeetingDetailModalOpen] = useState(false)

  // State for meeting minute edit modal
  const [meetingEditModalOpen, setMeetingEditModalOpen] = useState(false)

  // 加载旁站记录数据
  const loadSupervisionRecords = async () => {
    try {
      setLoadingSupervision(true)
      const records = await getSupervisionRecords(0, 50) // 加载前50条记录
      setSupervisionRecords(records)
    } catch (error) {
      console.error("加载旁站记录失败:", error)
    } finally {
      setLoadingSupervision(false)
    }
  }

  // 在组件内部合并所有事件
  const mockEvents = [...mockIssues, ...mockDailyLogs, ...supervisionRecords, ...mockMeetingMinutes]

  // Reset selected events when type changes
  useEffect(() => {
    setSelectedEvents([])
  }, [selectedType])

  // Reset status filter when type changes to non-issue type
  useEffect(() => {
    if (selectedType !== "all" && selectedType !== "issue") {
      setSelectedStatus("all")
    }
  }, [selectedType])

  // 加载旁站记录
  useEffect(() => {
    loadSupervisionRecords()
  }, [])

  // Filter events based on selected type and status
  const filteredEvents = mockEvents.filter((event) => {
    const typeMatch = selectedType === "all" || event.type === selectedType

    // Only apply status filter for issue type events
    if (event.type === "issue") {
      const statusMatch = selectedStatus === "all" || event.status === selectedStatus
      return typeMatch && statusMatch
    }

    return typeMatch
  })

  const handleCheckboxChange = (eventId: string) => {
    setSelectedEvents((prev) => (prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]))
  }

  const handleMergeEvents = () => {
    console.log("Merging events:", selectedEvents)
    setShowMergeDialog(false)
    setSelectedEvents([])
  }

  const handleGenerateInspectionRecord = () => {
    console.log("Generating inspection record for events:", selectedEvents)
    setShowInspectionDialog(false)
    // In a real app, this would generate the inspection record and redirect
    router.push("/dashboard/documents")
  }

  // Check if the current view allows selection (only for issues)
  const allowsSelection = selectedType === "all" || selectedType === "issue"

  // Get only issue events that are selected
  const selectedIssueEvents = selectedEvents.filter((id) =>
    mockEvents.find((event) => event.id === id && event.type === "issue"),
  )

  // Get border color based on event type
  const getBorderColor = (type: string) => {
    switch (type) {
      case "issue":
        return "border-l-red-500"
      case "supervision":
        return "border-l-blue-500"
      case "daily-log":
        return "border-l-green-500"
      case "meeting":
        return "border-l-amber-500"
      default:
        return "border-l-primary"
    }
  }

  // Get icon color based on event type
  const getIconColor = (type: string) => {
    switch (type) {
      case "issue":
        return "text-red-500"
      case "supervision":
        return "text-blue-500"
      case "daily-log":
        return "text-green-500"
      case "meeting":
        return "text-amber-500"
      default:
        return "text-primary"
    }
  }

  // Get badge color based on event type
  const getBadgeColor = (type: string) => {
    switch (type) {
      case "issue":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "supervision":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "daily-log":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "meeting":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      default:
        return "bg-primary/10 text-primary hover:bg-primary/20"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="destructive">待处理</Badge>
      case "resolved":
        return <Badge variant="outline">已闭环</Badge>
      case "completed":
        return <Badge variant="outline">已完成</Badge>
      case "draft":
        return <Badge variant="secondary">草稿</Badge>
      case "final":
        return <Badge variant="outline">最终版</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "issue":
        return "问题记录"
      case "supervision":
        return "旁站记录"
      case "daily-log":
        return "监理日志"
      case "meeting":
        return "会议纪要"
      default:
        return type
    }
  }

  // Check if an event can be edited
  const canEditEvent = (event: any) => {
    if (event.type === "issue") {
      return event.status !== "resolved"
    } else {
      return true // 所有其他类型的记录都可以编辑
    }
  }

  // Handle view details
  const handleViewDetails = (event: any) => {
    setSelectedRecord(event)

    // 根据事件类型打开不同的详情弹窗
    if (event.type === "daily-log") {
      setDailyLogDetailModalOpen(true)
    } else if (event.type === "supervision") {
      setSupervisionDetailModalOpen(true)
    } else if (event.type === "meeting") {
      setMeetingDetailModalOpen(true)
    } else {
      setProblemDetailModalOpen(true)
    }
  }

  // Handle edit
  const handleEdit = (recordId: string) => {
    const record = mockEvents.find((event) => event.id === recordId)
    if (record) {
      setSelectedRecord(record)

      // 根据记录类型打开不同的编辑弹窗
      if (record.type === "daily-log") {
        setDailyLogDetailModalOpen(false)
        setDailyLogEditModalOpen(true)
      } else if (record.type === "supervision") {
        setSupervisionDetailModalOpen(false)
        setSupervisionEditModalOpen(true)
      } else if (record.type === "meeting") {
        setMeetingDetailModalOpen(false)
        setMeetingEditModalOpen(true)
      } else {
        setProblemDetailModalOpen(false)
        setProblemEditModalOpen(true)
      }
    }
  }

  // Handle save edited record
  const handleSaveEdit = (updatedRecord: any) => {
    console.log("Saving updated record:", updatedRecord)
    // In a real app, this would update the record in the database

    // 根据记录类型关闭相应的编辑弹窗
    if (updatedRecord.type === "daily-log") {
      setDailyLogEditModalOpen(false)
    } else if (updatedRecord.type === "supervision") {
      setSupervisionEditModalOpen(false)
    } else if (updatedRecord.type === "meeting") {
      setMeetingEditModalOpen(false)
    } else {
      setProblemEditModalOpen(false)
    }

    // Show success message or refresh data
  }

  // Handle generate notification
  const handleGenerateNotification = (recordId: string) => {
    const record = mockEvents.find((event) => event.id === recordId)
    if (record) {
      setSelectedRecord(record)
      setProblemDetailModalOpen(false)
      setNotificationModalOpen(true)
    }
  }

  // Handle confirm notification generation
  const handleConfirmNotification = (recordId: string) => {
    console.log("Generating notification for record:", recordId)
    setNotificationModalOpen(false)
    // In a real app, this would generate the notification and redirect
    router.push("/dashboard/documents")
  }

  // Handle generate daily log
  const handleGenerateDailyLog = (recordId: string) => {
    const record = mockEvents.find((event) => event.id === recordId)
    if (record) {
      console.log("Generating daily log for record:", record)
      // 在实际应用中，这里会调用API生成日志并提供下载
      window.alert("监理日志已生成，正在下载...")
      // 模拟添加到已生成文档列表
      if (record.type === "daily-log") {
        const newDocument = {
          id: `doc-${Date.now()}`,
          title: `监理日志-${record.date}`,
          date: new Date().toISOString().split("T")[0],
          type: "pdf",
        }
        record.generatedDocuments = [...(record.generatedDocuments || []), newDocument]
      }
    }
  }

  // Handle generate supervision record
  const handleGenerateSupervisionRecord = (recordId: string) => {
    const record = mockEvents.find((event) => event.id === recordId)
    if (record) {
      console.log("Generating supervision record for record:", record)
      // 在实际应用中，这里会调用API生成旁站记录并提供下载
      window.alert("旁站记录已生成，正在下载...")
      // 模拟添加到已生成文档列表
      if (record.type === "supervision") {
        const newDocument = {
          id: `doc-s${Date.now()}`,
          title: `${record.title}记录-${record.date}`,
          date: new Date().toISOString().split("T")[0],
          type: "pdf",
        }
        record.generatedDocuments = [...(record.generatedDocuments || []), newDocument]
      }
    }
  }

  // Handle generate meeting minute
  const handleGenerateMeetingMinute = (recordId: string) => {
    const record = mockEvents.find((event) => event.id === recordId)
    if (record) {
      console.log("Generating meeting minute for record:", record)
      // 在实际应用中，这里会调用API生成会议纪要并提供下载
      window.alert("会议纪要已生成，正在下载...")
      // 模拟添加到已生成文档列表
      if (record.type === "meeting") {
        const newDocument = {
          id: `doc-m${Date.now()}`,
          title: `${record.title}纪要-${record.date}`,
          date: new Date().toISOString().split("T")[0],
          type: "pdf",
        }
        record.generatedDocuments = [...(record.generatedDocuments || []), newDocument]
      }
    }
  }

  // Close all modals when navigating away
  useEffect(() => {
    return () => {
      setProblemDetailModalOpen(false)
      setProblemEditModalOpen(false)
      setNotificationModalOpen(false)
      setDailyLogDetailModalOpen(false)
      setDailyLogEditModalOpen(false)
      setSupervisionDetailModalOpen(false)
      setSupervisionEditModalOpen(false)
      setMeetingDetailModalOpen(false)
      setMeetingEditModalOpen(false)
      setShowMergeDialog(false)
      setShowInspectionDialog(false)
    }
  }, [])

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">事件记录</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="事件类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="issue">问题记录</SelectItem>
              <SelectItem value="supervision">旁站记录</SelectItem>
              <SelectItem value="daily-log">监理日志</SelectItem>
              <SelectItem value="meeting">会议纪要</SelectItem>
            </SelectContent>
          </Select>

          {/* Only show status filter for issues */}
          {(selectedType === "all" || selectedType === "issue") && (
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="resolved">已闭环</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Multi-select action buttons */}
          {selectedIssueEvents.length > 0 && (
            <div className="flex gap-2 ml-auto">
              {/* Generate Inspection Record button */}
              <Dialog open={showInspectionDialog} onOpenChange={setShowInspectionDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ClipboardCheck className="h-4 w-4" />
                    生成巡检记录 ({selectedIssueEvents.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>生成巡检记录</DialogTitle>
                    <DialogDescription>
                      您正在基于 {selectedIssueEvents.length} 个问题记录生成巡检记录。生成的巡检记录将包含以下问题。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="inspection-title">巡检记录标题</Label>
                      <Input
                        id="inspection-title"
                        placeholder="请输入巡检记录标题"
                        className="col-span-3"
                        defaultValue={`巡检记录-${new Date().toISOString().split("T")[0]}`}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>包含的问题</Label>
                      <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                        {selectedIssueEvents.map((id) => {
                          const event = mockEvents.find((i) => i.id === id)
                          return (
                            <div key={id} className="py-2 border-b last:border-0">
                              {event?.title}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowInspectionDialog(false)}>
                      取消
                    </Button>
                    <Button onClick={handleGenerateInspectionRecord}>确认生成</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Merge button */}
              <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <MergeIcon className="h-4 w-4" />
                    合并 ({selectedIssueEvents.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>合并问题记录</DialogTitle>
                    <DialogDescription>
                      您正在合并 {selectedIssueEvents.length} 个问题记录。请为合并后的问题提供一个新的描述。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="merged-description">合并后的问题描述</Label>
                      <Input id="merged-description" placeholder="请输入合并后的问题描述" className="col-span-3" />
                    </div>
                    <div className="grid gap-2">
                      <Label>选中的问题</Label>
                      <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                        {selectedIssueEvents.map((id) => {
                          const event = mockEvents.find((i) => i.id === id)
                          return (
                            <div key={id} className="py-2 border-b last:border-0">
                              {event?.title}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
                      取消
                    </Button>
                    <Button onClick={handleMergeEvents}>确认合并</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredEvents.map((event) => {
          // 为旁站记录添加显示字段映射
          const displayEvent =
            event.type === "supervision"
              ? {
                  ...event,
                  title: event.project_name || "旁站记录",
                  date: event.start_datetime
                    ? new Date(event.start_datetime).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
                  time:
                    event.start_datetime && event.end_datetime
                      ? `${new Date(event.start_datetime).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })} - ${new Date(event.end_datetime).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`
                      : undefined,
                  location: event.pangzhan_unit || "未设置位置",
                  conclusion: event.rectification_status || "待处理",
                  hasDocument: !!event.document_urls,
                  icon: ClipboardList,
                }
              : event

          return (
            <Card
              key={event.id}
              className={`overflow-hidden border-l-4 ${getBorderColor(event.type || "supervision")}`}
            >
              {/* Only show checkbox for issue type events */}
              {event.type === "issue" && allowsSelection && (
                <div className="p-1">
                  <Checkbox
                    id={`select-${event.id}`}
                    checked={selectedEvents.includes(event.id)}
                    onCheckedChange={() => handleCheckboxChange(event.id)}
                    className="ml-2 mt-2"
                  />
                </div>
              )}
              <CardContent className={`p-4 ${event.type === "issue" && allowsSelection ? "pt-0" : ""}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2 items-center">
                    {/* Only show status badge for issue type */}
                    {event.type === "issue" && getStatusBadge(event.status)}

                    {/* Show type badge for all event types */}
                    <Badge variant="secondary" className={getBadgeColor(event.type)}>
                      {getEventTypeLabel(event.type)}
                    </Badge>
                  </div>
                  <displayEvent.icon className={`h-4 w-4 ${getIconColor(event.type)}`} />
                </div>
                <h3 className="font-medium line-clamp-2 mb-2">{displayEvent.title}</h3>

                <div className="flex items-center text-xs text-muted-foreground gap-1 mb-1">
                  <Calendar className="h-3 w-3" />
                  <span>{displayEvent.date}</span>
                </div>

                {displayEvent.location && (
                  <div className="flex items-center text-xs text-muted-foreground gap-1 mb-1">
                    <MapPin className="h-3 w-3" />
                    <span>{displayEvent.location}</span>
                  </div>
                )}

                {displayEvent.time && (
                  <div className="flex items-center text-xs text-muted-foreground gap-1 mb-1">
                    <Clock className="h-3 w-3" />
                    <span>{displayEvent.time}</span>
                  </div>
                )}

                {displayEvent.attendees && (
                  <div className="flex items-center text-xs text-muted-foreground gap-1 mb-1">
                    <Users className="h-3 w-3" />
                    <span>参会人数: {displayEvent.attendees}</span>
                  </div>
                )}

                {displayEvent.weather && (
                  <div className="text-xs text-muted-foreground mb-1">天气: {displayEvent.weather}</div>
                )}

                {displayEvent.responsibleUnit && (
                  <div className="text-xs text-muted-foreground mt-2">责任单位: {displayEvent.responsibleUnit}</div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-end gap-2 flex-wrap">
                {/* Show Generate Notification button for issue type events */}
                {event.type === "issue" && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleGenerateNotification(event.id)}
                        >
                          <FileText className="h-3 w-3" />
                          生成通知单
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>基于此问题生成监理工程师通知单</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Show generate daily log button for daily-log type events */}
                {event.type === "daily-log" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleGenerateDailyLog(event.id)}
                  >
                    <FileText className="h-3 w-3" />
                    生成监理日志
                  </Button>
                )}

                {/* Show generate supervision record button for supervision type events */}
                {event.type === "supervision" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleGenerateSupervisionRecord(event.id)}
                  >
                    <FileText className="h-3 w-3" />
                    生成旁站记录
                  </Button>
                )}

                {/* Show generate meeting minute button for meeting type events */}
                {event.type === "meeting" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleGenerateMeetingMinute(event.id)}
                  >
                    <FileText className="h-3 w-3" />
                    生成会议纪要
                  </Button>
                )}

                {/* Show edit button for all events except resolved ones */}
                {canEditEvent(event) && (
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => handleEdit(event.id)}>
                    <Edit className="h-3 w-3" />
                    编辑
                  </Button>
                )}

                <Button variant="outline" size="sm" onClick={() => handleViewDetails(event)}>
                  查看详情
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Problem Record Detail Modal */}
      <ProblemRecordDetailModal
        isOpen={problemDetailModalOpen}
        onClose={() => setProblemDetailModalOpen(false)}
        record={selectedRecord}
        onGenerateNotification={handleGenerateNotification}
        onEdit={handleEdit}
      />

      {/* Problem Record Edit Modal */}
      <ProblemRecordEditModal
        isOpen={problemEditModalOpen}
        onClose={() => setProblemEditModalOpen(false)}
        record={selectedRecord}
        onSave={handleSaveEdit}
      />

      {/* Generate Notification Modal */}
      <GenerateNotificationModal
        isOpen={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        record={selectedRecord}
        onGenerate={handleConfirmNotification}
      />

      {/* Daily Log Detail Modal */}
      <DailyLogDetailModal
        isOpen={dailyLogDetailModalOpen}
        onClose={() => setDailyLogDetailModalOpen(false)}
        record={selectedRecord}
        onEdit={handleEdit}
        onGenerateDailyLog={handleGenerateDailyLog}
      />

      {/* Daily Log Edit Modal */}
      <DailyLogEditModal
        isOpen={dailyLogEditModalOpen}
        onClose={() => setDailyLogEditModalOpen(false)}
        record={selectedRecord}
        onSave={handleSaveEdit}
      />

      {/* Supervision Record Detail Modal */}
      <SupervisionRecordDetailModal
        isOpen={supervisionDetailModalOpen}
        onClose={() => setSupervisionDetailModalOpen(false)}
        record={selectedRecord}
        onEdit={handleEdit}
        onGenerateRecord={handleGenerateSupervisionRecord}
      />

      {/* Supervision Record Edit Modal */}
      <SupervisionRecordEditModal
        isOpen={supervisionEditModalOpen}
        onClose={() => setSupervisionEditModalOpen(false)}
        record={selectedRecord}
        onSave={handleSaveEdit}
      />

      {/* Meeting Minute Detail Modal */}
      <MeetingMinuteDetailModal
        isOpen={meetingDetailModalOpen}
        onClose={() => setMeetingDetailModalOpen(false)}
        record={selectedRecord}
        onEdit={handleEdit}
        onGenerateMinute={handleGenerateMeetingMinute}
      />

      {/* Meeting Minute Edit Modal */}
      <MeetingMinuteEditModal
        isOpen={meetingEditModalOpen}
        onClose={() => setMeetingEditModalOpen(false)}
        record={selectedRecord}
        onSave={handleSaveEdit}
      />
    </div>
  )
}
