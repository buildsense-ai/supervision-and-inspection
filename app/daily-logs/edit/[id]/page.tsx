"use client"

import { DailyLogEdit } from "@/components/daily-log-edit"
import DashboardLayout from "@/app/dashboard-layout"
import { useParams, useRouter } from "next/navigation"

/**
 * 监理日志编辑页面(特定ID)数据操作
 *
 * 数据操作:
 * 1. 数据检索 (Read)
 *    - 来源: 路由参数(ID)
 *    - 操作: 获取特定ID的监理日志数据
 *    - 注意: 当前使用模拟数据，实际应从API获取
 *
 * 2. 数据更新 (Update)
 *    - 来源: 用户界面输入
 *    - 操作: 更新监理日志数据
 *    - 元素: 日志基本信息、监理人员、施工活动、监理活动、问题记录、其他事项等
 *    - 注意: 当前仅打印到控制台，未实际执行数据操作
 */
export default function DailyLogEditPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params

  const handleSave = (data: any) => {
    console.log("保存日志数据:", data)
    // 在实际应用中，这里会调用API保存数据
    // 然后重定向到日志列表页面
    router.push("/daily-logs")
    // 显示成功消息
    window.alert("日志保存成功！")
  }

  return (
    <DashboardLayout>
      <DailyLogEdit id={id as string} onSave={handleSave} />
    </DashboardLayout>
  )
}
