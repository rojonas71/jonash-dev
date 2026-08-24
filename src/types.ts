export type ProjectSummary = { id:string; title:string; slug:string; short_description?:string|null; category:string; status:string; cover_url?:string|null; demo_url?:string|null }
export type ProjectDetails = ProjectSummary & { description?:string|null; goal?:string|null; problem?:string|null; solution?:string|null; github_url?:string|null; featured:boolean; published:boolean; display_order:number; created_at:string; updated_at:string }
export type ProjectFeature = { id:string; project_id:string; title:string; description?:string|null; display_order:number }
export type ProjectImage = { id:string; project_id:string; image_url:string; caption?:string|null; alt_text?:string|null; display_order:number }
export type Technology = { id:string; name:string; category:string; level:string; icon?:string|null; description?:string|null; display_order?:number }
