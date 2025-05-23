"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardList, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { useState } from "react"

/**
 * 旁站记录详情模态框组件数据操作
 *
 * 数据操作:
 * 1. 数据展示 (Read)
 *    - 来源: 父组件传入的 record 对象
 *    - 元素: 旁站记录详情，包含基础识别信息、旁站过程核心记录、已生成文档等
 *
 * 2. 数据操作触发 (Update/Create)
 *    - 来源: 用户界面交互
 *    - 操作: 触发编辑旁站记录、生成旁站记录文档等操作
 *    - 元素: 当前查看的旁站记录
 */
interface SupervisionRecordDetailModalProps {
  isOpen: boolean
  onClose: () => void
  record: any
  onEdit: () => void
  onGenerate: () => void
}

export function SupervisionRecordDetailModal({
  isOpen,
  onClose,
  record,
  onEdit,
  onGenerate,
}: SupervisionRecordDetailModalProps) {
  const [activeTab, setActiveTab] = useState("details")

  if (!record) {
    return null
  }

  // 格式化时间显示
  const formatTimeRange = () => {
    if (record.basicInfo?.startTime && record.basicInfo?.endTime) {
      return `${record.basicInfo.startTime} 至 ${record.basicInfo.endTime}`
    }
    return record.time || "未指定"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-500" />
            <DialogTitle>旁站记录详情</DialogTitle>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="details">记录详情</TabsTrigger>
            <TabsTrigger value="documents">已生成的文档</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {/* 基础识别信息 */}
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-3">基础识别信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div>
                  <span className="font-medium">工程项目：</span>
                  <span>{record.basicInfo?.projectName || record.title || "未指定"}</span>
                </div>
                <div>
                  <span className="font-medium">旁站对象：</span>
                  <span>{record.basicInfo?.subject || "未指定"}</span>
                </div>
                <div>
                  <span className="font-medium">日期：</span>
                  <span>{record.basicInfo?.date || record.date || "未指定"}</span>
                </div>
                <div>
                  <span className="font-medium">时间段：</span>
                  <span>{formatTimeRange()}</span>
                </div>
                <div>
                  <span className="font-medium">旁站监理：</span>
                  <span>{record.basicInfo?.supervisor || "未指定"}</span>
                </div>
                <div>
                  <span className="font-medium">施工方代表：</span>
                  <span>{record.basicInfo?.contractorRep || "未指定"}</span>
                </div>
              </div>
            </div>

            {/* 旁站过程核心记录 */}
            <div className="space-y-4">
              {/* A. 作业条件核查要点与符合性 */}
              <div className="border rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">作业条件核查要点与符合性</h3>
                </div>
                <p className="text-sm whitespace-pre-wrap">{record.witnessLog?.preWorkChecks || "未记录"}</p>
              </div>

              {/* B. 作业过程关键控制点与符合性 */}
              <div className="border rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">作业过程关键控制点与符合性</h3>
                </div>
                <p className="text-sm whitespace-pre-wrap">{record.witnessLog?.processControls || "未记录"}</p>
              </div>

              {/* C. 重要发现/问题点 */}
              <div className="border rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <h3 className="font-medium">重要发现/问题点</h3>
                </div>
                {!record.witnessLog?.hasIssues ? (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>无明显异常</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">发现如下:</div>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {record.witnessLog?.issues?.map((issue: string, index: number) => (
                        <li key={index} className="whitespace-pre-wrap">
                          {issue || "未记录"}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              {/* D. 即时指令与初步处理 */}
              <div className="border rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium">即时指令与初步处理</h3>
                </div>
                <p className="text-sm whitespace-pre-wrap">{record.witnessLog?.instructions || "未记录"}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-3">已生成的文档</h3>
              {record.generatedDocuments && record.generatedDocuments.length > 0 ? (
                <div className="space-y-3">
                  {record.generatedDocuments.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span>{doc.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {doc.date}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        查看
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">暂无生成的文档</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
          <Button variant="outline" onClick={onEdit}>
            编辑
          </Button>
          <Button onClick={onGenerate}>生成旁站记录</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
