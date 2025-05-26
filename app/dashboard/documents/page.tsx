"use client"

import { useState, useEffect } from "react"
import { getSupervisionRecords } from "@/api/supervision"
import type { SupervisionRecord } from "@/types/supervision"
import type { DocumentInfo } from "@/types/document"
import { getFileNameFromUrl, getFileExtension, getFileTypeFromExtension } from "@/utils/file"
import { Button } from "@/components/ui/button"
import { RefreshIcon } from "@radix-ui/react-icons"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<DocumentInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [])

  // 加载文档数据
  const loadDocuments = async () => {
    try {
      setLoading(true)
      setError(null)

      // 获取所有旁站记录
      const supervisionRecords = await getSupervisionRecords(0, 1000) // 获取更多记录

      console.log("获取到的旁站记录:", supervisionRecords) // 调试日志

      // 解析文档信息
      const allDocuments: DocumentInfo[] = []

      supervisionRecords.forEach((record) => {
        if (record.document_urls) {
          console.log("记录文档URLs:", record.document_urls) // 调试日志

          const documents = parseDocumentUrls(record.document_urls, record)
          allDocuments.push(...documents)
        }
      })

      console.log("解析后的文档列表:", allDocuments) // 调试日志
      setDocuments(allDocuments)
    } catch (err) {
      console.error("加载文档失败:", err)
      setError(err instanceof Error ? err.message : "加载文档失败")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // 解析文档URL字符串
  const parseDocumentUrls = (urls: string | null, record: SupervisionRecord): DocumentInfo[] => {
    if (!urls || urls.trim() === "") return []

    console.log("解析文档URLs:", urls) // 调试日志

    let urlArray: string[] = []

    try {
      // 尝试解析为JSON数组
      const parsed = JSON.parse(urls)
      if (Array.isArray(parsed)) {
        urlArray = parsed
      } else {
        // 如果是字符串，按逗号分割
        urlArray = urls
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean)
      }
    } catch {
      // 如果不是JSON，按逗号分割
      urlArray = urls
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean)
    }

    console.log("解析后的URL数组:", urlArray) // 调试日志

    return urlArray.map((url) => {
      const fileName = getFileNameFromUrl(url)
      const extension = getFileExtension(url)
      const type = getFileTypeFromExtension(extension)

      return {
        id: `${record.id}_${url}`, // 使用记录ID和URL生成唯一ID
        name: fileName,
        type,
        size: "未知大小",
        uploadTime: record.updated_at || record.created_at || new Date().toISOString(),
        url,
        projectName: record.project_name || "未命名项目",
        panzhanId: record.id!,
      }
    })
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadDocuments()
  }

  return (
    <div>
      <h1>文档列表</h1>

      <Button variant="outline" disabled={refreshing} onClick={handleRefresh}>
        {refreshing ? (
          <>
            <RefreshIcon className="mr-2 h-4 w-4 animate-spin" />
            刷新中...
          </>
        ) : (
          <>
            <RefreshIcon className="mr-2 h-4 w-4" />
            刷新
          </>
        )}
      </Button>

      {error && <p className="text-red-500">Error: {error}</p>}

      {loading ? (
        <p>Loading documents...</p>
      ) : (
        <Table>
          <TableCaption>A list of your recent documents.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">名称</TableHead>
              <TableHead>项目名称</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>上传时间</TableHead>
              <TableHead className="text-right">大小</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.id}>
                <TableCell className="font-medium">{document.name}</TableCell>
                <TableCell>{document.projectName}</TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      document.type === "image"
                        ? "bg-blue-100 text-blue-800"
                        : document.type === "pdf"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800",
                    )}
                  >
                    {document.type}
                  </Badge>
                </TableCell>
                <TableCell>{document.uploadTime}</TableCell>
                <TableCell className="text-right">{document.size}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default DocumentsPage
