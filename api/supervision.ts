// 重新导出 lib/api-service.ts 中的函数，保持向后兼容
export {
  getSupervisionRecords,
  getSupervisionRecord,
  createSupervisionRecord,
  updateSupervisionRecord,
  deleteSupervisionRecord,
  uploadSupervisionDocument,
  generateSupervisionDocument,
  deleteSupervisionDocument,
  type SupervisionRecord,
  type UploadResponse,
} from "@/lib/api-service"
