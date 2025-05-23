"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Edit, Printer } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/app/dashboard-layout"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

/**
 * 监理日志预览页面数据操作
 *
 * 数据操作:
 * 1. 数据检索 (Read)
 *    - 来源: 路由参数(ID)
 *    - 操作: 获取特定ID的监理日志数据
 *    - 元素: 日志基本信息、监理人员、施工活动、监理活动、问题记录、其他事项等
 *    - 注意: 当前使用模拟数据，实际应从API获取
 */
export default function DailyLogPreviewPage() {
  const params = useParams()
  const { id } = params
  const [logData, setLogData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 在实际应用中，这里会从API获取日志数据
    // 现在我们模拟加载数据
    setLoading(true)
    setTimeout(() => {
      // 模拟数据
      setLogData({
        id,
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
          {
            id: "ca2",
            location: "材料堆场",
            content: "钢筋验收",
            details: "钢筋验收完成，共计200吨左右。",
          },
        ],
        supervisionActivities: [
          {
            id: "sa1",
            type: "旁站",
            relatedActivity: "浇筑混凝土（A区3层）",
            details: "对A区3层混凝土浇筑进行了旁站监理，检查了模板支撑、钢筋绑扎情况，确保浇筑质量符合施工要求。",
          },
          {
            id: "sa2",
            type: "材料验收",
            relatedActivity: "钢筋验收（材料堆场）",
            details: "对进场钢筋验收进行了见证取样，检查了规格、数量和质量证明文件，符合设计和规范要求。",
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
          {
            id: "om2",
            type: "inspection",
            title: "建设单位、上级主管部门或相关单位人员到场检查情况",
            content: "建设单位项目经理到场检查工作。",
          },
        ],
        status: "draft",
      })
      setLoading(false)
    }, 500)
  }, [id])

  if (loading || !logData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // 合并所有问题记录
  const allProblems = [
    ...logData.problems.quality.map((p: any) => ({ ...p, category: "质量" })),
    ...logData.problems.safety.map((p: any) => ({ ...p, category: "安全" })),
    ...logData.problems.progress.map((p: any) => ({ ...p, category: "进度" })),
    ...logData.problems.cost.map((p: any) => ({ ...p, category: "造价" })),
  ]

  return (
    <DashboardLayout>
      <div className="container mx-auto py-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link href="/daily-logs">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">监理日志预览</h1>
          </div>
          <div className="flex items-center gap-2">
            {logData.status === "draft" && (
              <Button variant="outline" asChild>
                <Link href={`/daily-logs/edit/${id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </Link>
              </Button>
            )}
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              打印
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              下载
            </Button>
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-white mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">{logData.basicInfo.projectName}监理日志</h2>
            <p className="text-sm text-muted-foreground mt-2">
              日期：{logData.basicInfo.date} | 天气：{logData.basicInfo.weather} | 温度：{logData.basicInfo.temperature}
            </p>
          </div>

          <div className="grid gap-6">
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3">一、监理人员出勤情况</h3>
              <div className="pl-4">
                {logData.supervisionPersonnel
                  .filter((p: any) => p.checked)
                  .map((person: any) => (
                    <p key={person.id} className="mb-1">
                      {person.label}
                    </p>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3">二、施工活动</h3>
              {logData.constructionActivities.length > 0 ? (
                logData.constructionActivities.map((activity: any, index: number) => (
                  <div key={activity.id} className="mb-4 pl-4">
                    <p className="font-medium">
                      {index + 1}. {activity.content}（{activity.location}）
                    </p>
                    <p className="text-sm mt-1">{activity.details}</p>
                  </div>
                ))
              ) : (
                <p className="pl-4">今日无主要施工活动</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3">三、监理活动</h3>
              {logData.supervisionActivities.length > 0 ? (
                logData.supervisionActivities.map((activity: any, index: number) => (
                  <div key={activity.id} className="mb-4 pl-4">
                    <p className="font-medium">
                      {index + 1}. {activity.type}：{activity.relatedActivity}
                    </p>
                    <p className="text-sm mt-1">{activity.details}</p>
                  </div>
                ))
              ) : (
                <p className="pl-4">今日无主要监理活动</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3">四、问题记录及处理措施</h3>
              {allProblems.length > 0 ? (
                allProblems.map((problem: any, index: number) => (
                  <div key={problem.id} className="mb-4 pl-4">
                    <p className="font-medium">
                      {index + 1}. [{problem.category}] {problem.description}
                    </p>
                    <p className="text-sm mt-1">处理措施：{problem.measures}</p>
                  </div>
                ))
              ) : (
                <p className="pl-4">今日未发现问题</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3">五、其他事项</h3>
              {logData.otherMatters.length > 0 ? (
                logData.otherMatters.map((matter: any, index: number) => (
                  <div key={matter.id} className="mb-4 pl-4">
                    <p className="font-medium">
                      {index + 1}. {matter.title}
                    </p>
                    <p className="text-sm mt-1">{matter.content}</p>
                  </div>
                ))
              ) : (
                <p className="pl-4">无其他事项</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div>
                <p className="font-medium">监理员：</p>
                <div className="h-16 border-b border-dashed mt-8"></div>
              </div>
              <div>
                <p className="font-medium">总监理工程师：</p>
                <div className="h-16 border-b border-dashed mt-8"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
