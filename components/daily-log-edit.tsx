"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, Plus, Save, X } from "lucide-react"
import Link from "next/link"

/**
 * 监理日志编辑组件数据操作
 *
 * 数据操作:
 * 1. 数据加载 (Read)
 *    - 来源: 父组件传入的 id 或 initialData
 *    - 操作: 加载特定ID的监理日志数据或使用初始数据
 *    - 元素: 监理日志，包含基本信息、监理人员、施工活动、监理活动、问题记录、其他事项等
 *
 * 2. 数据编辑 (Update)
 *    - 来源: 用户界面交互
 *    - 操作: 编辑监理日志各部分内容
 *    - 元素: 监理日志各字段
 *
 * 3. 数据添加 (Create)
 *    - 来源: 用户界面交互
 *    - 操作: 添加施工活动、监理活动、问题记录、其他事项等
 *    - 元素: 新的活动、问题、事项等
 *
 * 4. 数据删除 (Delete)
 *    - 来源: 用户界面交互
 *    - 操作: 删除施工活动、监理活动、问题记录、其他事项等
 *    - 元素: 现有的活动、问题、事项等
 *
 * 5. 数据保存 (Create/Update)
 *    - 来源: 用户界面交互
 *    - 操作: 保存编辑后的监理日志
 *    - 元素: 完整的监理日志数据
 */
interface DailyLogEditProps {
  id?: string
  initialData?: any
  onSave?: (data: any) => void
}

export function DailyLogEdit({ id, initialData, onSave }: DailyLogEditProps) {
  const [formData, setFormData] = useState<any>(null)
  const [loading, setLoading] = useState(!initialData)

  // Fetch data if id is provided and no initialData
  useEffect(() => {
    if (id && !initialData) {
      // In a real app, this would be an API call
      // For now, we'll simulate loading data
      setLoading(true)
      setTimeout(() => {
        // Mock data based on the id
        const mockData = {
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
          ],
          supervisionActivities: [
            {
              id: "sa1",
              type: "旁站",
              relatedActivity: "浇筑混凝土（A区3层）",
              details: "对A区3层混凝土浇筑进行了旁站监理，检查了模板支撑、钢筋绑扎情况，确保浇筑质量符合施工要求。",
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
        }
        setFormData(mockData)
        setLoading(false)
      }, 500)
    } else if (initialData) {
      setFormData(initialData)
    } else {
      // Default empty form structure
      setFormData({
        basicInfo: {
          projectName: "",
          date: new Date().toISOString().split("T")[0],
          weather: "",
          temperature: "",
        },
        supervisionPersonnel: [
          { id: "chief", label: "总工（总监）", checked: false },
          { id: "specialist", label: "专工（专业监理）", checked: false },
        ],
        constructionActivities: [],
        supervisionActivities: [],
        problems: {
          quality: [],
          safety: [],
          progress: [],
          cost: [],
        },
        otherMatters: [],
      })
    }
  }, [id, initialData])

  if (loading || !formData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  const handleBasicInfoChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      basicInfo: {
        ...formData.basicInfo,
        [field]: value,
      },
    })
  }

  const handlePersonnelChange = (id: string, checked: boolean) => {
    setFormData({
      ...formData,
      supervisionPersonnel: formData.supervisionPersonnel.map((item: any) =>
        item.id === id ? { ...item, checked } : item,
      ),
    })
  }

  const handleConstructionActivityChange = (id: string, field: string, value: string) => {
    setFormData({
      ...formData,
      constructionActivities: formData.constructionActivities.map((item: any) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    })
  }

  const handleSupervisionActivityChange = (id: string, field: string, value: string) => {
    setFormData({
      ...formData,
      supervisionActivities: formData.supervisionActivities.map((item: any) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    })
  }

  const handleProblemChange = (category: string, id: string, field: string, value: string) => {
    setFormData({
      ...formData,
      problems: {
        ...formData.problems,
        [category]: formData.problems[category].map((item: any) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      },
    })
  }

  const handleOtherMatterChange = (id: string, field: string, value: string) => {
    setFormData({
      ...formData,
      otherMatters: formData.otherMatters.map((item: any) => (item.id === id ? { ...item, [field]: value } : item)),
    })
  }

  const addConstructionActivity = () => {
    const newId = `ca${Date.now()}`
    setFormData({
      ...formData,
      constructionActivities: [
        ...formData.constructionActivities,
        {
          id: newId,
          location: "",
          content: "",
          details: "",
        },
      ],
    })
  }

  const removeConstructionActivity = (id: string) => {
    setFormData({
      ...formData,
      constructionActivities: formData.constructionActivities.filter((item: any) => item.id !== id),
    })
  }

  const addSupervisionActivity = () => {
    const newId = `sa${Date.now()}`
    setFormData({
      ...formData,
      supervisionActivities: [
        ...formData.supervisionActivities,
        {
          id: newId,
          type: "",
          relatedActivity: "",
          details: "",
        },
      ],
    })
  }

  const removeSupervisionActivity = (id: string) => {
    setFormData({
      ...formData,
      supervisionActivities: formData.supervisionActivities.filter((item: any) => item.id !== id),
    })
  }

  const addProblem = (category: string) => {
    const newId = `${category[0]}${Date.now()}`
    setFormData({
      ...formData,
      problems: {
        ...formData.problems,
        [category]: [
          ...formData.problems[category],
          {
            id: newId,
            description: "",
            measures: "",
          },
        ],
      },
    })
  }

  const removeProblem = (category: string, id: string) => {
    setFormData({
      ...formData,
      problems: {
        ...formData.problems,
        [category]: formData.problems[category].filter((item: any) => item.id !== id),
      },
    })
  }

  const addOtherMatter = () => {
    const newId = `om${Date.now()}`
    setFormData({
      ...formData,
      otherMatters: [
        ...formData.otherMatters,
        {
          id: newId,
          type: "other",
          title: "",
          content: "",
        },
      ],
    })
  }

  const removeOtherMatter = (id: string) => {
    setFormData({
      ...formData,
      otherMatters: formData.otherMatters.filter((item: any) => item.id !== id),
    })
  }

  const handleSave = () => {
    if (onSave) {
      onSave(formData)
    }
    console.log("保存的数据:", formData)
  }

  return (
    <div className="container mx-auto py-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/daily-logs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">监理日志草稿编辑</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/daily-logs">取消</Link>
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            保存日志
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* 1. 基本信息 */}
        <div className="border rounded-lg p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">项目名称</Label>
              <Input
                id="projectName"
                value={formData.basicInfo.projectName}
                onChange={(e) => handleBasicInfoChange("projectName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">日期</Label>
              <div className="relative">
                <Input
                  id="date"
                  type="date"
                  value={formData.basicInfo.date}
                  onChange={(e) => handleBasicInfoChange("date", e.target.value)}
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weather">天气</Label>
              <Input
                id="weather"
                value={formData.basicInfo.weather}
                onChange={(e) => handleBasicInfoChange("weather", e.target.value)}
                placeholder="请输入天气情况"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">温度</Label>
              <Input
                id="temperature"
                value={formData.basicInfo.temperature}
                onChange={(e) => handleBasicInfoChange("temperature", e.target.value)}
                placeholder="例如：20-28℃"
              />
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">监理人员出勤</h3>
            <div className="space-y-2">
              {formData.supervisionPersonnel.map((person: any) => (
                <div key={person.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={person.id}
                    checked={person.checked}
                    onCheckedChange={(checked) => handlePersonnelChange(person.id, checked as boolean)}
                  />
                  <Label htmlFor={person.id}>{person.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. 施工活动 */}
        <div className="border rounded-lg p-6 bg-white">
          <h2 className="text-lg font-semibold mb-2">施工活动</h2>
          <p className="text-sm text-muted-foreground mb-4">
            记录当日施工工程中重要的施工活动，如可以填写施工部位和内容。
          </p>

          <div className="space-y-6">
            {formData.constructionActivities.map((activity: any, index: number) => (
              <div key={activity.id} className="border rounded-md p-4 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6"
                  onClick={() => removeConstructionActivity(activity.id)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor={`ca-location-${activity.id}`}>施工部位</Label>
                    <Input
                      id={`ca-location-${activity.id}`}
                      value={activity.location}
                      onChange={(e) => handleConstructionActivityChange(activity.id, "location", e.target.value)}
                      placeholder="例如：A区3层"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`ca-content-${activity.id}`}>施工内容</Label>
                    <Input
                      id={`ca-content-${activity.id}`}
                      value={activity.content}
                      onChange={(e) => handleConstructionActivityChange(activity.id, "content", e.target.value)}
                      placeholder="例如：浇筑混凝土"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`ca-details-${activity.id}`}>详细描述</Label>
                  <Textarea
                    id={`ca-details-${activity.id}`}
                    value={activity.details}
                    onChange={(e) => handleConstructionActivityChange(activity.id, "details", e.target.value)}
                    placeholder="请详细描述施工活动的情况，包括工程量等信息"
                    rows={3}
                  />
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full" onClick={addConstructionActivity}>
              <Plus className="h-4 w-4 mr-2" />
              新增施工活动
            </Button>
          </div>
        </div>

        {/* 3. 监理活动 */}
        <div className="border rounded-lg p-6 bg-white">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">监理活动</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">记录当日监理工作的主要内容，请详细描述监理活动的内容。</p>

          <div className="space-y-6">
            {formData.supervisionActivities.map((activity: any, index: number) => (
              <div key={activity.id} className="border rounded-md p-4 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6"
                  onClick={() => removeSupervisionActivity(activity.id)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor={`sa-type-${activity.id}`}>活动类型</Label>
                    <Select
                      value={activity.type}
                      onValueChange={(value) => handleSupervisionActivityChange(activity.id, "type", value)}
                    >
                      <SelectTrigger id={`sa-type-${activity.id}`}>
                        <SelectValue placeholder="选择活动类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="旁站">旁站</SelectItem>
                        <SelectItem value="巡视">巡视</SelectItem>
                        <SelectItem value="材料验收">材料验收</SelectItem>
                        <SelectItem value="工序验收">工序验收</SelectItem>
                        <SelectItem value="质量检查">质量检查</SelectItem>
                        <SelectItem value="安全检查">安全检查</SelectItem>
                        <SelectItem value="其他">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`sa-related-${activity.id}`}>关联施工活动</Label>
                    <Select
                      value={activity.relatedActivity}
                      onValueChange={(value) => handleSupervisionActivityChange(activity.id, "relatedActivity", value)}
                    >
                      <SelectTrigger id={`sa-related-${activity.id}`}>
                        <SelectValue placeholder="选择关联施工活动" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.constructionActivities.map((ca: any) => (
                          <SelectItem key={ca.id} value={`${ca.content}（${ca.location}）`}>
                            {ca.content}（{ca.location}）
                          </SelectItem>
                        ))}
                        <SelectItem value="其他">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`sa-details-${activity.id}`}>详细描述</Label>
                  <Textarea
                    id={`sa-details-${activity.id}`}
                    value={activity.details}
                    onChange={(e) => handleSupervisionActivityChange(activity.id, "details", e.target.value)}
                    placeholder="请详细描述监理活动的内容和结果"
                    rows={3}
                  />
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full" onClick={addSupervisionActivity}>
              <Plus className="h-4 w-4 mr-2" />
              新增监理活动
            </Button>
          </div>
        </div>

        {/* 4. 问题记录 */}
        <div className="border rounded-lg p-6 bg-white">
          <h2 className="text-lg font-semibold mb-2">问题记录</h2>
          <p className="text-sm text-muted-foreground mb-4">记录当日发现的质量、安全、进度、造价等方面的问题。</p>

          {/* 质量问题 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-medium">质量问题</h3>
            </div>
            <div className="space-y-4">
              {formData.problems.quality.map((problem: any, index: number) => (
                <div key={problem.id} className="border rounded-md p-4 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6"
                    onClick={() => removeProblem("quality", problem.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor={`quality-desc-${problem.id}`}>问题描述</Label>
                    <Textarea
                      id={`quality-desc-${problem.id}`}
                      value={problem.description}
                      onChange={(e) => handleProblemChange("quality", problem.id, "description", e.target.value)}
                      placeholder="请描述质量问题的具体情况"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`quality-measures-${problem.id}`}>解决方案</Label>
                    <Textarea
                      id={`quality-measures-${problem.id}`}
                      value={problem.measures}
                      onChange={(e) => handleProblemChange("quality", problem.id, "measures", e.target.value)}
                      placeholder="请描述采取的措施或解决方案"
                      rows={2}
                    />
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full" onClick={() => addProblem("quality")}>
                <Plus className="h-4 w-4 mr-2" />
                新增质量问题
              </Button>
            </div>
          </div>

          {/* 安全问题 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-medium">安全问题</h3>
            </div>
            <div className="space-y-4">
              {formData.problems.safety.map((problem: any, index: number) => (
                <div key={problem.id} className="border rounded-md p-4 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6"
                    onClick={() => removeProblem("safety", problem.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor={`safety-desc-${problem.id}`}>问题描述</Label>
                    <Textarea
                      id={`safety-desc-${problem.id}`}
                      value={problem.description}
                      onChange={(e) => handleProblemChange("safety", problem.id, "description", e.target.value)}
                      placeholder="请描述安全问题的具体情况"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`safety-measures-${problem.id}`}>解决方案</Label>
                    <Textarea
                      id={`safety-measures-${problem.id}`}
                      value={problem.measures}
                      onChange={(e) => handleProblemChange("safety", problem.id, "measures", e.target.value)}
                      placeholder="请描述采取的措施或解决方案"
                      rows={2}
                    />
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full" onClick={() => addProblem("safety")}>
                <Plus className="h-4 w-4 mr-2" />
                新增安全问题
              </Button>
            </div>
          </div>

          {/* 进度问题 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-medium">进度问题</h3>
            </div>
            <div className="space-y-4">
              {formData.problems.progress.map((problem: any, index: number) => (
                <div key={problem.id} className="border rounded-md p-4 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6"
                    onClick={() => removeProblem("progress", problem.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor={`progress-desc-${problem.id}`}>问题描述</Label>
                    <Textarea
                      id={`progress-desc-${problem.id}`}
                      value={problem.description}
                      onChange={(e) => handleProblemChange("progress", problem.id, "description", e.target.value)}
                      placeholder="请描述进度问题的具体情况"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`progress-measures-${problem.id}`}>解决方案</Label>
                    <Textarea
                      id={`progress-measures-${problem.id}`}
                      value={problem.measures}
                      onChange={(e) => handleProblemChange("progress", problem.id, "measures", e.target.value)}
                      placeholder="请描述采取的措施或解决方案"
                      rows={2}
                    />
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full" onClick={() => addProblem("progress")}>
                <Plus className="h-4 w-4 mr-2" />
                新增进度问题
              </Button>
            </div>
          </div>

          {/* 造价问题 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-medium">造价问题</h3>
            </div>
            <div className="space-y-4">
              {formData.problems.cost.map((problem: any, index: number) => (
                <div key={problem.id} className="border rounded-md p-4 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6"
                    onClick={() => removeProblem("cost", problem.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor={`cost-desc-${problem.id}`}>问题描述</Label>
                    <Textarea
                      id={`cost-desc-${problem.id}`}
                      value={problem.description}
                      onChange={(e) => handleProblemChange("cost", problem.id, "description", e.target.value)}
                      placeholder="请描述造价问题的具体情况"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`cost-measures-${problem.id}`}>解决方案</Label>
                    <Textarea
                      id={`cost-measures-${problem.id}`}
                      value={problem.measures}
                      onChange={(e) => handleProblemChange("cost", problem.id, "measures", e.target.value)}
                      placeholder="请描述采取的措施或解决方案"
                      rows={2}
                    />
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full" onClick={() => addProblem("cost")}>
                <Plus className="h-4 w-4 mr-2" />
                新增造价问题
              </Button>
            </div>
          </div>
        </div>

        {/* 5. 其他有关事项 */}
        <div className="border rounded-lg p-6 bg-white">
          <h2 className="text-lg font-semibold mb-2">其他有关事项</h2>
          <p className="text-sm text-muted-foreground mb-4">
            记录其他需要说明的事项，如重要来往文件、电话记录、建设单位到场检查情况等。
          </p>

          <div className="space-y-6">
            {formData.otherMatters.map((matter: any, index: number) => (
              <div key={matter.id} className="border rounded-md p-4 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6"
                  onClick={() => removeOtherMatter(matter.id)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="space-y-2 mb-4">
                  <Label htmlFor={`om-title-${matter.id}`}>标题</Label>
                  <Input
                    id={`om-title-${matter.id}`}
                    value={matter.title}
                    onChange={(e) => handleOtherMatterChange(matter.id, "title", e.target.value)}
                    placeholder="例如：重要来往文件、电话记录"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`om-content-${matter.id}`}>内容</Label>
                  <Textarea
                    id={`om-content-${matter.id}`}
                    value={matter.content}
                    onChange={(e) => handleOtherMatterChange(matter.id, "content", e.target.value)}
                    placeholder="请详细描述相关事项"
                    rows={3}
                  />
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full" onClick={addOtherMatter}>
              <Plus className="h-4 w-4 mr-2" />
              新增其他事项
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" asChild>
            <Link href="/daily-logs">取消</Link>
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            保存日志
          </Button>
        </div>
      </div>
    </div>
  )
}
