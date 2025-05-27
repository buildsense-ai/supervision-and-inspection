// 路由工具函数
const BASE_PATH = process.env.NODE_ENV === "production" ? "/web" : ""

export const routes = {
  home: `${BASE_PATH}/`,
  dashboard: `${BASE_PATH}/dashboard`,
  dailyLogs: `${BASE_PATH}/daily-logs`,
  dailyLogEdit: (id: string | "new") => `${BASE_PATH}/daily-logs/edit/${id}`,
  dailyLogPreview: (id: string) => `${BASE_PATH}/daily-logs/preview/${id}`,
  supervision: `${BASE_PATH}/supervision`,
  meetingMinutes: `${BASE_PATH}/meeting-minutes`,
  documents: `${BASE_PATH}/dashboard/documents`,
  events: `${BASE_PATH}/dashboard/events`,
  issues: `${BASE_PATH}/issues`,
  knowledgeBase: `${BASE_PATH}/knowledge-base`,
} as const

// 导航函数
export const navigate = {
  toDailyLogs: () => routes.dailyLogs,
  toEditDailyLog: (id: string) => routes.dailyLogEdit(id),
  toNewDailyLog: () => routes.dailyLogEdit("new"),
  toPreviewDailyLog: (id: string) => routes.dailyLogPreview(id),
  toDashboard: () => routes.dashboard,
  toDocuments: () => routes.documents,
  toEvents: () => routes.events,
}
