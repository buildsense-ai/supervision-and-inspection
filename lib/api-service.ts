// API 服务函数
import { toast } from "@/components/ui/use-toast"

const API_BASE_URL = "https://buildsense.asia/docx_utils"

// 定义旁站记录类型
export interface SupervisionRecord {
  id?: number
  project_name: string
  construction_unit: string
  pangzhan_unit: string | null
  supervision_company: string
  start_datetime: string | null
  end_datetime: string | null
  work_overview: string
  pre_work_check_content: string
  supervising_personnel: string
  issues_and_opinions: string
  rectification_status: string
  remarks: string
  construction_enterprise: string
  supervising_enterprise: string
  supervising_organization: string | null
  on_site_supervising_personnel: string
  document_urls: string | null
  created_at?: string
  updated_at?: string
}

export interface PaginationParams {
  skip?: number
  limit?: number
}

// 获取所有旁站记录
export async function getSupervisionRecords(params: PaginationParams = {}): Promise<SupervisionRecord[]> {
  try {
    const { skip = 0, limit = 50 } = params
    const response = await fetch(`${API_BASE_URL}/pangzhan/?skip=${skip}&limit=${limit}`, {
      headers: {
        accept: "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 502) {
        throw new Error("服务器暂时不可用，请稍后再试")
      }
      throw new Error(`获取旁站记录失败: ${response.status}`)
    }

    const data = await response.json()
    // API 直接返回数组，不是分页对象
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("获取旁站记录出错:", error)
    toast({
      title: "获取数据失败",
      description: error instanceof Error ? error.message : "无法获取旁站记录，请稍后再试",
      variant: "destructive",
    })
    return []
  }
}

// 获取单个旁站记录
export async function getSupervisionRecord(id: number | string): Promise<SupervisionRecord | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/pangzhan/${id}`, {
      headers: {
        accept: "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("找不到该旁站记录")
      } else if (response.status === 502) {
        throw new Error("服务器暂时不可用，请稍后再试")
      }
      throw new Error(`获取旁站记录详情失败: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("获取旁站记录详情出错:", error)
    toast({
      title: "获取数据失败",
      description: error instanceof Error ? error.message : "无法获取旁站记录详情，请稍后再试",
      variant: "destructive",
    })
    return null
  }
}

// 创建旁站记录
export async function createSupervisionRecord(record: SupervisionRecord): Promise<SupervisionRecord | null> {
  try {
    // 准备请求体数据，移除 id、created_at、updated_at 字段
    const { id: recordId, created_at, updated_at, ...createData } = record

    const response = await fetch(`${API_BASE_URL}/pangzhan/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(createData),
    })

    if (!response.ok) {
      if (response.status === 502) {
        throw new Error("服务器暂时不可用，请稍后再试")
      }

      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.detail || `创建旁站记录失败: ${response.status}`)
    }

    toast({
      title: "创建成功",
      description: "旁站记录已成功创建",
    })

    return await response.json()
  } catch (error) {
    console.error("创建旁站记录出错:", error)
    toast({
      title: "创建失败",
      description: error instanceof Error ? error.message : "创建旁站记录时发生错误",
      variant: "destructive",
    })
    return null
  }
}

// 更新旁站记录
export async function updateSupervisionRecord(
  id: number | string,
  record: SupervisionRecord,
): Promise<SupervisionRecord | null> {
  try {
    // 准备请求体数据，移除 id、created_at、updated_at 字段
    const { id: recordId, created_at, updated_at, ...updateData } = record

    const response = await fetch(`${API_BASE_URL}/pangzhan/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("找不到该旁站记录")
      } else if (response.status === 502) {
        throw new Error("服务器暂时不可用，请稍后再试")
      }
      throw new Error(`更新旁站记录失败: ${response.status}`)
    }

    toast({
      title: "更新成功",
      description: "旁站记录已成功更新",
    })

    return await response.json()
  } catch (error) {
    console.error("更新旁站记录出错:", error)
    toast({
      title: "更新失败",
      description: error instanceof Error ? error.message : "更新旁站记录时发生错误",
      variant: "destructive",
    })
    return null
  }
}

// 删除旁站记录
export async function deleteSupervisionRecord(id: number | string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/pangzhan/${id}`, {
      method: "DELETE",
      headers: {
        accept: "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("找不到该旁站记录")
      } else if (response.status === 502) {
        throw new Error("服务器暂时不可用，请稍后再试")
      }
      throw new Error(`删除旁站记录失败: ${response.status}`)
    }

    toast({
      title: "删除成功",
      description: "旁站记录已成功删除",
    })

    return true
  } catch (error) {
    console.error("删除旁站记录出错:", error)
    toast({
      title: "删除失败",
      description: error instanceof Error ? error.message : "删除旁站记录时发生错误",
      variant: "destructive",
    })
    return false
  }
}

// 生成旁站记录文档
export async function generateSupervisionDocument(id: number | string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/pangzhan/${id}/generate_docx`, {
      method: "POST",
      headers: {
        accept: "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("找不到该旁站记录")
      } else if (response.status === 502) {
        throw new Error("服务器暂时不可用，请稍后再试")
      }
      throw new Error(`生成旁站记录文档失败: ${response.status}`)
    }

    const data = await response.json()

    toast({
      title: "生成成功",
      description: "旁站记录文档已成功生成",
    })

    return data.document_url
  } catch (error) {
    console.error("生成旁站记录文档出错:", error)
    toast({
      title: "生成失败",
      description: error instanceof Error ? error.message : "生成旁站记录文档时发生错误",
      variant: "destructive",
    })
    return null
  }
}

// 添加重试机制的通用 fetch 函数
export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = 3,
  backoff = 300,
): Promise<T> {
  try {
    const response = await fetch(url, options)

    if (response.ok) {
      return await response.json()
    }

    if (response.status === 502 && retries > 0) {
      // 如果是 502 错误且还有重试次数，则等待后重试
      await new Promise((resolve) => setTimeout(resolve, backoff))
      return fetchWithRetry<T>(url, options, retries - 1, backoff * 2)
    }

    throw new Error(`请求失败: ${response.status}`)
  } catch (error) {
    if (retries > 0 && error instanceof Error && error.message.includes("fetch")) {
      // 网络错误时重试
      await new Promise((resolve) => setTimeout(resolve, backoff))
      return fetchWithRetry<T>(url, options, retries - 1, backoff * 2)
    }
    throw error
  }
}
