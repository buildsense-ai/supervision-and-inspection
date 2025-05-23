import Link from "next/link"
import { AlertCircle, ArrowRight, FileText, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * 看板概览页面数据操作
 *
 * 数据操作:
 * 1. 数据展示 (Read)
 *    - 来源: 硬编码的 dashboardItems 数组
 *    - 元素: 看板项目，包含标题、值、图标、链接等
 */
export default function DashboardPage() {
  const dashboardItems = [
    {
      title: "待处理问题",
      value: "12",
      icon: AlertCircle,
      link: "/dashboard/events?type=issue&status=pending",
      linkText: "查看详情",
    },
    {
      title: "已生成文档",
      value: "24",
      icon: FileText,
      link: "/dashboard/documents",
      linkText: "查看文档",
    },
    {
      title: "已闭环问题",
      value: "8",
      icon: AlertCircle,
      link: "/dashboard/events?type=issue&status=resolved",
      linkText: "查看详情",
    },
    {
      title: "所有事件记录",
      value: "20",
      icon: CalendarDays,
      link: "/dashboard/events",
      linkText: "查看记录",
    },
  ]

  return (
    <div className="grid gap-4">
      {dashboardItems.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <div className="mt-4">
              <Link href={item.link}>
                <Button variant="outline" size="sm" className="gap-1">
                  {item.linkText} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
