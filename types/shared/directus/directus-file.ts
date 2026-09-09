export interface DirectusFileTypes {
  // General
  id: string
  title: string | null
  filename_download: string
  type: string | null
  width: number | null
  height: number | null
  filesize: number | null
  duration: number | null
  description: string | null
  tags: "json"
  // Audit
  created_on: "datetime"
  modified_on: "datetime"
  uploaded_on: "datetime"
}
