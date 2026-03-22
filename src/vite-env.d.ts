/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  /** JWT gắn sẵn khi dev (không commit giá trị thật) */
  readonly VITE_AUTH_TOKEN?: string
  /** Giá trị field `createdBy` khi tạo hợp đồng */
  readonly VITE_CREATED_BY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
