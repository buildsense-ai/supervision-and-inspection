import { toast } from "@/hooks/use-toast"

// 更新 API 基础 URL
const API_BASE_URL = "https://www.buildsense.asia/docx_utils"
const UPLOAD_BASE_URL = "https://www.buildsense.asia"

export interface SupervisionRecord {
  id?: number
  project_name: string | null
  construction_unit: string | null
  pangzhan_unit: string | null
  supervision_company: string | null
  start_datetime: string | null
  end_datetime: string | null
  work_overview: string | null
  pre_work_check_content: string | null
  supervising_personnel: string | null
  issues_and_opinions: string | null
  rectification_status: string | null
  remarks: string | null
  construction_enterprise: string | null
  supervising_enterprise: string | null
  supervising_organization: string | null
  on_site_supervising_personnel: string | null
  document_urls: string | null
  created_at?: string
  updated_at?: string
}

export interface UploadResponse {
  status: string
  project_id: number
  doc_url: string
  message: string
}

// 获取旁站记录列表
export async function getSupervisionRecords(skip = 0, limit = 20): Promise<SupervisionRecord[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/pangzhan/?skip=${skip}&limit=${limit}`, {
      method: "GET",
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
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("获取旁站记录出错:", error)
    throw error
  }
}

// 获取单个旁站记录
export async function getSupervisionRecord(id: number | string): Promise<SupervisionRecord> {
  try {
    const response = await fetch(`${API_BASE_URL}/pangzhan/${id}`, {
      method: "GET",
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
      throw new Error(`获取旁站记录失败: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("获取旁站记录出错:", error)
    throw error
  }
}

// 创建旁站记录
export async function createSupervisionRecord(
  record: Omit<SupervisionRecord, "id" | "created_at" | "updated_at">,
): Promise<SupervisionRecord> {
  try {
    const response = await fetch(`${API_BASE_URL}/pangzhan/`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(record),
    })

    if (!response.ok) {
      if (response.status === 502) {
        throw new Error("服务器暂时不可用，请稍后再试")
      }
      throw new Error(`创建旁站记录失败: ${response.status}`)
    }

    const data = await response.json()

    toast({
      title: "创建成功",
      description: "旁站记录已成功创建",
    })

    return data
  } catch (error) {
    console.error("创建旁站记录出错:", error)
    toast({
      title: "创建失败",
      description: error instanceof Error ? error.message : "创建旁站记录时发生错误",
      variant: "destructive",
    })
    throw error
  }
}

// 更新旁站记录
export async function updateSupervisionRecord(
  id: number | string,
  record: Omit<SupervisionRecord, "id" | "created_at" | "updated_at">,
): Promise<SupervisionRecord> {
  try {
    const response = await fetch(`${API_BASE_URL}/pangzhan/${id}`, {
      method: "PUT",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(record),
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("找不到该旁站记录")
      } else if (response.status === 502) {
        throw new Error("服务器暂时不可用，请稍后再试")
      }
      throw new Error(`更新旁站记录失败: ${response.status}`)
    }

    const data = await response.json()

    toast({
      title: "更新成功",
      description: "旁站记录已成功更新",
    })

    return data
  } catch (error) {
    console.error("更新旁站记录出错:", error)
    toast({
      title: "更新失败",
      description: error instanceof Error ? error.message : "更新旁站记录时发生错误",
      variant: "destructive",
    })
    throw error
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

// 上传旁站记录文档
export async function uploadSupervisionDocument(
  panzhanId: number | string,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<UploadResponse> {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${UPLOAD_BASE_URL}/upload_doc_standBy?panzhan_id=${panzhanId}`, {
      method: "POST",
      headers: {
        accept: "application/json",
      },
      body: formData,
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("找不到该旁站记录")
      } else if (response.status === 502) {
        throw new Error("服务器暂时不可用，请稍后再试")
      }
      throw new Error(`文档上传失败: ${response.status}`)
    }

    const data = await response.json()

    if (data.status === "success") {
      toast({
        title: "上传成功",
        description: "文档已成功上传",
      })
    } else {
      throw new Error(data.message || "上传失败")
    }

    return data
  } catch (error) {
    console.error("上传文档出错:", error)
    toast({
      title: "上传失败",
      description: error instanceof Error ? error.message : "上传文档时发生错误",
      variant: "destructive",
    })
    throw error
  }
}

// 生成旁站记录文档
export async function generateSupervisionDocument(id: number | string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/pangzhan/${id}/document`, {
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
      throw new Error(`生成文档失败: ${response.status}`)
    }

    const data = await response.json()

    toast({
      title: "生成成功",
      description: "旁站记录文档已成功生成",
    })

    return data.document_url || null
  } catch (error) {
    console.error("生成文档出错:", error)
    toast({
      title: "生成失败",
      description: error instanceof Error ? error.message : "生成文档时发生错误",
      variant: "destructive",
    })
    return null
  }
}

// 删除旁站记录关联文档
export async function deleteSupervisionDocument(panzhanId: number | string, fileUrl: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${UPLOAD_BASE_URL}/delete_doc_by_url?panzhan_id=${panzhanId}&file_url=${encodeURIComponent(fileUrl)}`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
        },
        body: "",
      },
    )

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("找不到该文档或旁站记录")
      } else if (response.status === 502) {
        throw new Error("服务器暂时不可用，请稍后再试")
      }
      throw new Error(`删除文档失败: ${response.status}`)
    }

    toast({
      title: "删除成功",
      description: "文档已成功删除",
    })

    return true
  } catch (error) {
    console.error("删除文档出错:", error)
    toast({
      title: "删除失败",
      description: error instanceof Error ? error.message : "删除文档时发生错误",
      variant: "destructive",
    })
    return false
  }
}

// 问题记录相关接口
export interface IssueRecord {
  id?: number
  location: string
  description: string
  images: string[]
  record_time: string
  update_time: string
  status?: string
}

export interface IssueCreateRequest {
  问题发生地点: string
  问题描述: string
  相关图片: string
  记录时间: string
  状态?: string
}

// 获取问题记录列表
export async function getIssueRecords(skip = 0, limit = 100, status?: string): Promise<IssueRecord[]> {
  try {
    let url = `${API_BASE_URL}/issues?skip=${skip}&limit=${limit}`
    if (status && status !== "all") {
      url += `&status=${encodeURIComponent(status)}`
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 502) {
        throw new Error("服务器暂时不可用，请稍后再试")
      }
      throw new Error(`获取问题记录失败: ${response.status}`)
    }

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("获取问题记录出错:", error)
    throw error
  }
}

// 获取单个问题记录
export async function getIssueRecord(id: number | string): Promise<IssueRecord> {
  try {
    const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("找不到该问题记录")
      } else if (response.status === 502) {
        throw new Error("服务器暂时不可用，请稍后再试")
      }
      throw new Error(`获取问题记录失败: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("获取问题记录出错:", error)
    throw error
  }
}

// 创建问题记录
export async function createIssueRecord(
  record: Omit<IssueCreateRequest, "记录时间"> & { 记录时间?: string },
): Promise<IssueRecord> {
  try {
    const requestData: IssueCreateRequest = {
      ...record,
      记录时间: record.记录时间 || new Date().toISOString(),
    }

    const response = await fetch(`${API_BASE_URL}/issues`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      if (response.status === 502) {
        throw new Error("服务器暂时不可用，请稍后再试")
      }
      throw new Error(`创建问题记录失败: ${response.status}`)
    }

    const data = await response.json()

    toast({
      title: "创建成功",
      description: "问题记录已成功创建",
    })

    return data
  } catch (error) {
    console.error("创建问题记录出错:", error)
    toast({
      title: "创建失败",
      description: error instanceof Error ? error.message : "创建问题记录时发生错误",
      variant: "destructive",
    })
    throw error
  }
}

// 更新问题记录
export async function updateIssueRecord(
  id: number | string,
  record: Omit<IssueCreateRequest, "记录时间"> & { 记录时间?: string },
): Promise<IssueRecord> {
  try {
    const requestData: IssueCreateRequest = {
      ...record,
      记录时间: record.记录时间 || new Date().toISOString(),
    }

    const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
      method: "PUT",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("找不到该问题记录")
      } else if (response.status === 502) {
        throw new Error("服务器暂时不可用，请稍后再试")
      }
      throw new Error(`更新问题记录失败: ${response.status}`)
    }

    const data = await response.json()

    toast({
      title: "更新成功",
      description: "问题记录已成功更新",
    })

    return data
  } catch (error) {
    console.error("更新问题记录出错:", error)
    toast({
      title: "更新失败",
      description: error instanceof Error ? error.message : "更新问题记录时发生错误",
      variant: "destructive",
    })
    throw error
  }
}

// 删除问题记录
export async function deleteIssueRecord(id: number | string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
      method: "DELETE",
      headers: {
        accept: "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("找不到该问题记录")
      } else if (response.status === 502) {
        throw new Error("服务器暂时不可用，请稍后再试")
      }
      throw new Error(`删除问题记录失败: ${response.status}`)
    }

    toast({
      title: "删除成功",
      description: "问题记录已成功删除",
    })

    return true
  } catch (error) {
    console.error("删除问题记录出错:", error)
    toast({
      title: "删除失败",
      description: error instanceof Error ? error.message : "删除问题记录时发生错误",
      variant: "destructive",
    })
    return false
  }
}
