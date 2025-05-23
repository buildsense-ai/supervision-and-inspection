"use client"

import { DailyLogEdit } from "@/components/daily-log-edit"
import DashboardLayout from "@/app/dashboard-layout"

/**
 * 监理日志编辑页面数据操作
 *
 * 数据操作:
 * 1. 数据创建 (Create)
 *    - 来源: 用户界面输入
 *    - 操作: 创建新的监理日志
 *    - 元素: 日志基本信息、监理人员、施工活动、监理活动、问题记录、其他事项等
 *    - 注意: 当前仅打印到控制台，未实际执行数据操作
 */
export default function DailyLogEditPage() {
  const handleSave = (data: any) => {
    console.log("保存日志数据:", data)
    // 在实际应用中，这里会调用API保存数据
    // 然后可能会重定向到日志列表页面
    window.alert("日志保存成功！")
  }

  return (
    <DashboardLayout>
      <DailyLogEdit onSave={handleSave} />
    </DashboardLayout>
  )
}
