// Base types
export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error: ErrorData | null;
  timestamp: string;
}

export interface ErrorData {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Form types
export interface Form {
  form_id: string;
  title: string;
  description?: string;
  form_type: 'survey' | 'quiz';
  creator_id: string;
  time_limit_minutes: number;
  passing_score?: number;
  show_correct_answers: boolean;
  shuffle_questions: boolean;
  is_published: boolean;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface FormSummary {
  form_id: string;
  title: string;
  description?: string;
  form_type: 'survey' | 'quiz';
  is_published: boolean;
  response_count: number;
  total_questions: number;
  created_at: string;
  updated_at: string;
}

export interface FormSection {
  section_id: string;
  title: string;
  description?: string;
  order_global: number;
  visibility_type: string;
  prerequisite_section_id?: string;
  fields: FormField[];
}

export interface FormField {
  field_id: string;
  content_type: string;
  field_type?: string;
  label: string;
  description?: string;
  order_global: number;
  order_in_section?: number;
  is_required: boolean;
  points: number;
}

export interface FormWithSections extends Form {
  sections: FormSection[];
}

export interface PaginationResponse {
  current_page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
}

export interface FormListData {
  forms: FormSummary[];
  pagination: PaginationResponse;
}

export interface PublishFormData {
  form_id: string;
  title: string;
  is_published: boolean;
  published_at: string;
  message: string;
}

// Request types
export interface CreateFormRequest {
  title: string;
  description?: string;
  form_type: 'survey' | 'quiz';
  time_limit_minutes?: number;
  passing_score?: number;
  show_correct_answers?: boolean;
  shuffle_questions?: boolean;
}

export interface UpdateFormRequest {
  title?: string;
  description?: string;
  time_limit_minutes?: number;
  passing_score?: number;
  show_correct_answers?: boolean;
  shuffle_questions?: boolean;
}

export interface DuplicateFormRequest {
  new_title: string;
}

export interface FormListParams {
  page?: number;
  per_page?: number;
  sort_by?: 'created' | 'modified';
  order?: 'asc' | 'desc';
}

// Response types
export type FormResponse = APIResponse<Form>;
export type FormWithSectionsResponse = APIResponse<FormWithSections>;
export type FormListResponse = APIResponse<FormListData>;
export type PublishFormResponse = APIResponse<PublishFormData>;
