"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar, Edit, FileText, Users } from "lucide-react"

interface MeetingMinuteDetailModalProps {
  isOpen: boolean
  onClose: () => void
  record: any
  onEdit: (recordId: string) => void
  onGenerateMinute: (recordId: string) => void
}

/**
 * 会议纪要详情模态框组件数据操作
 *
 * 数据操作:
 * 1. 数据展示 (Read)
 *    - 来源: 父组件传入的 record 对象
 *    - 元素: 会议纪要详情，包含基本信息、参会人员、会议议程、讨论内容、决议事项、已生成文档等
 *
 * 2. 数据操作触发 (Update/Create)
 *    - 来源: 用户界面交互
 *    - 操作: 触发编辑会议纪要、生成会议纪要文档等操作
 *    - 元素: 当前查看的会议纪要
 */
export function MeetingMinuteDetailModal({
  isOpen,
  onClose,
  record,
  onEdit,
  onGenerateMinute,
}: MeetingMinuteDetailModalProps) {
  if (!record) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>会议纪要详情</DialogTitle>
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <DialogTitle>会议纪要详情</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{record.title}</h2>
            <div className="flex items-center text-sm text-muted-foreground gap-1">
              <Calendar className="h-3 w-3" />
              <span>{record.date}</span>
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold border-b pb-1 mb-2">基本信息</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">会议类型：</span>
                <span>{record.meetingType || "未指定"}</span>
              </div>
              <div>
                <span className="font-medium">地点：</span>
                <span>{record.location || "未指定"}</span>
              </div>
              <div>
                <span className="font-medium">开始时间：</span>
                <span>{record.startTime || "未指定"}</span>
              </div>
              <div>
                <span className="font-medium">结束时间：</span>
                <span>{record.endTime || "未指定"}</span>
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span className="font-medium">参会人数：</span>
                  <span>{record.attendees || 0} 人</span>
                </div>
              </div>
            </div>
          </div>

          {record.participants && record.participants.length > 0 && (
            <div>
              <h3 className="text-md font-semibold border-b pb-1 mb-2">参会人员</h3>
              <div className="text-sm">
                {record.participants.map((participant: any, index: number) => (
                  <div key={index} className="mb-1">
                    <span className="font-medium">{participant.role}：</span>
                    <span>{participant.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {record.agenda && record.agenda.length > 0 && (
            <div>
              <h3 className="text-md font-semibold border-b pb-1 mb-2">会议议程</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                {record.agenda.map((item: any, index: number) => (
                  <li key={index}>
                    <span className="font-medium">{item.title}</span>
                    {item.description && <p className="text-muted-foreground ml-5 mt-1">{item.description}</p>}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {record.discussions && record.discussions.length > 0 && (
            <div>
              <h3 className="text-md font-semibold border-b pb-1 mb-2">讨论内容</h3>
              <div className="space-y-3 text-sm">
                {record.discussions.map((discussion: any, index: number) => (
                  <div key={index}>
                    <p className="font-medium">
                      {index + 1}. {discussion.topic}
                    </p>
                    <p className="text-muted-foreground ml-5 mt-1">{discussion.content}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {record.decisions && record.decisions.length > 0 && (
            <div>
              <h3 className="text-md font-semibold border-b pb-1 mb-2">决议事项</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                {record.decisions.map((decision: any, index: number) => (
                  <li key={index}>
                    <span>{decision.content}</span>
                    {decision.responsible && (
                      <p className="text-muted-foreground ml-5 mt-1">
                        负责人：{decision.responsible}，截止日期：{decision.deadline || "未指定"}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {record.generatedDocuments && record.generatedDocuments.length > 0 && (
            <div>
              <h3 className="text-md font-semibold border-b pb-1 mb-2">已生成的文档</h3>
              <div className="space-y-2">
                {record.generatedDocuments.map((doc: any, index: number) => (
                  <div key={doc.id || index} className="flex items-center gap-2 text-sm">
                    <FileText className="h-3 w-3 text-blue-500" />
                    <a href="#" className="text-blue-600 hover:underline">
                      {doc.title} ({doc.date})
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onEdit(record.id)} className="gap-2">
            <Edit className="h-4 w-4" />
            编辑
          </Button>
          <Button onClick={() => onGenerateMinute(record.id)} className="gap-2">
            <FileText className="h-4 w-4" />
            生成会议纪要
          </Button>
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
