"use client"

import { useState } from "react"
import { Search, FileText, Download, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock documents data
const mockDocuments = [
  {
    id: "doc-1",
    title: "监理日志-2025-05-10",
    date: "2025-05-10",
    type: "daily-log",
    fileType: "pdf",
  },
  {
    id: "doc-2",
    title: "监理工程师通知单-001",
    date: "2025-05-10",
    type: "notification",
    fileType: "pdf",
  },
  {
    id: "doc-3",
    title: "混凝土浇筑旁站记录-2025-05-10",
    date: "2025-05-10",
    type: "supervision",
    fileType: "pdf",
  },
  {
    id: "doc-4",
    title: "项目例会纪要-2025-05-10",
    date: "2025-05-10",
    type: "meeting",
    fileType: "pdf",
  },
]

export function DocumentsView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<string>("all")

  // Filter documents based on active tab and search query
  const getFilteredDocuments = () => {
    let documents = [...mockDocuments]

    if (activeTab !== "all") {
      documents = documents.filter((doc) => doc.type === activeTab)
    }

    if (searchQuery) {
      documents = documents.filter((doc) => doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    return documents
  }

  const filteredDocuments = getFilteredDocuments()

  // Get document icon based on type
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "daily-log":
        return <Calendar className="h-4 w-4 text-green-500" />
      case "notification":
        return <FileText className="h-4 w-4 text-red-500" />
      case "supervision":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "meeting":
        return <FileText className="h-4 w-4 text-amber-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Get document type label
  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "daily-log":
        return "监理日志"
      case "notification":
        return "通知单"
      case "supervision":
        return "旁站记录"
      case "meeting":
        return "会议纪要"
      default:
        return "文档"
    }
  }

  // Get badge color based on document type
  const getBadgeColor = (type: string) => {
    switch (type) {
      case "daily-log":
        return "bg-green-100 text-green-800"
      case "notification":
        return "bg-red-100 text-red-800"
      case "supervision":
        return "bg-blue-100 text-blue-800"
      case "meeting":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-primary/10 text-primary"
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Document type tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 h-8">
          <TabsTrigger value="all" className="text-xs">
            全部
          </TabsTrigger>
          <TabsTrigger value="daily-log" className="text-xs">
            监理日志
          </TabsTrigger>
          <TabsTrigger value="notification" className="text-xs">
            通知单
          </TabsTrigger>
          <TabsTrigger value="supervision" className="text-xs">
            旁站记录
          </TabsTrigger>
          <TabsTrigger value="meeting" className="text-xs">
            会议纪要
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search bar */}
      <div className="relative my-3">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索文档..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-9"
        />
      </div>

      {/* Documents list */}
      <div className="flex-1 overflow-auto -mx-4 px-4">
        <div className="grid gap-3">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((document) => (
              <Card key={document.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getDocumentIcon(document.type)}
                      <div>
                        <h3 className="font-medium text-sm line-clamp-1">{document.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={`px-1.5 py-0 h-5 text-xs ${getBadgeColor(document.type)}`}
                          >
                            {getDocumentTypeLabel(document.type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{document.date}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                      <span className="sr-only">下载</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>没有找到符合条件的文档</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
