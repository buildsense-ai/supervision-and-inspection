"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar, Edit, FileText } from "lucide-react"

interface DailyLogDetailModalProps {
  isOpen: boolean
  onClose: () => void
  record: any
  onEdit: (recordId: string) => void
  onGenerateDailyLog: (recordId: string) => void
}

/**
 * 监理日志详情模态框组件数据操作
 *
 * 数据操作:
 * 1. 数据展示 (Read)
 *    - 来源: 父组件传入的 record 对象
 *    - 元素: 监理日志详情，包含基本信息、监理人员、施工活动、监理活动、问题记录、其他事项、已生成文档等
 *
 * 2. 数据操作触发 (Update/Create)
 *    - 来源: 用户界面交互
 *    - 操作: 触发编辑监理日志、生成监理日志文档等操作
 *    - 元素: 当前查看的监理日志
 */
export function DailyLogDetailModal({ isOpen, onClose, record, onEdit, onGenerateDailyLog }: DailyLogDetailModalProps) {
  if (!record) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>监理日志详情</DialogTitle>
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

  // 合并所有问题记录
  const allProblems = record.problems
    ? [
        ...(record.problems.quality || []).map((p: any) => ({ ...p, category: "质量" })),
        ...(record.problems.safety || []).map((p: any) => ({ ...p, category: "安全" })),
        ...(record.problems.progress || []).map((p: any) => ({ ...p, category: "进度" })),
        ...(record.problems.cost || []).map((p: any) => ({ ...p, category: "造价" })),
      ]
    : []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <DialogTitle>监理日志详情</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">{/* 移除了状态标签 */}</div>
            <div className="flex items-center text-sm text-muted-foreground gap-1">
              <Calendar className="h-3 w-3" />
              <span>{record.date}</span>
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold border-b pb-1 mb-2">基本信息</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">项目名称：</span>
                <span>{record.basicInfo?.projectName || record.title}</span>
              </div>
              <div>
                <span className="font-medium">天气：</span>
                <span>{record.basicInfo?.weather || record.weather}</span>
              </div>
              <div>
                <span className="font-medium">温度：</span>
                <span>{record.basicInfo?.temperature || ""}</span>
              </div>
              <div>
                <span className="font-medium">监理人员：</span>
                <span>
                  {record.supervisionPersonnel
                    ?.filter((p: any) => p.checked)
                    .map((person: any, index: number) => (
                      <div key={person.id || index} className="flex items-center gap-2 text-sm">
                        {person.label}
                      </div>
                    ))
                    .join("、") || "无"}
                </span>
              </div>
            </div>
          </div>

          {record.constructionActivities && record.constructionActivities.length > 0 ? (
            <div>
              <h3 className="text-md font-semibold border-b pb-1 mb-2">施工活动</h3>
              <div className="space-y-2">
                {record.constructionActivities.map((activity: any, index: number) => (
                  <div key={activity.id || index} className="text-sm">
                    <p className="font-medium">
                      {index + 1}. {activity.content}（{activity.location}）
                    </p>
                    <p className="text-muted-foreground mt-1">{activity.details}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm">今日无主要施工活动</p>
          )}

          {record.supervisionActivities && record.supervisionActivities.length > 0 ? (
            <div>
              <h3 className="text-md font-semibold border-b pb-1 mb-2">监理活动</h3>
              <div className="space-y-2">
                {record.supervisionActivities.map((activity: any, index: number) => (
                  <div key={activity.id || index} className="text-sm">
                    <p className="font-medium">
                      {index + 1}. {activity.type}：{activity.relatedActivity}
                    </p>
                    <p className="text-muted-foreground mt-1">{activity.details}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm">今日无主要监理活动</p>
          )}

          {allProblems.length > 0 ? (
            <div>
              <h3 className="text-md font-semibold border-b pb-1 mb-2">问题记录</h3>
              <div className="space-y-2">
                {allProblems.map((problem: any, index: number) => (
                  <div key={problem.id || index} className="text-sm">
                    <p className="font-medium">
                      {index + 1}. [{problem.category}] {problem.description}
                    </p>
                    <p className="text-muted-foreground mt-1">处理措施：{problem.measures}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm">今日未发现问题</p>
          )}

          {record.otherMatters && record.otherMatters.length > 0 ? (
            <div>
              <h3 className="text-md font-semibold border-b pb-1 mb-2">其他事项</h3>
              <div className="space-y-2">
                {record.otherMatters.map((matter: any, index: number) => (
                  <div key={matter.id || index} className="text-sm">
                    <p className="font-medium">
                      {index + 1}. {matter.title}
                    </p>
                    <p className="text-muted-foreground mt-1">{matter.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm">无其他事项</p>
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
          <Button onClick={() => onGenerateDailyLog(record.id)} className="gap-2">
            <FileText className="h-4 w-4" />
            生成监理日志
          </Button>
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
