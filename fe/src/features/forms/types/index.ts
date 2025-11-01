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
  section_id?: string;
  is_required: boolean;
  points: number;
  options?: Array<{ id: string; label: string }>;
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

// Section Request types
export interface CreateSectionRequest {
  title: string;
  description?: string;
  order_global: number;
  visibility_type: 'always' | 'after_section';
  prerequisite_section_id?: string;
}

export interface UpdateSectionRequest {
  title?: string;
  description?: string;
  order_global?: number;
  visibility_type?: 'always' | 'after_section';
  prerequisite_section_id?: string;
}

// Section Response types
export interface SectionDetail {
  section_id: string;
  form_id: string;
  title: string;
  description?: string;
  order_global: number;
  visibility_type: string;
  prerequisite_section_id?: string;
  created_at: string;
  updated_at: string;
  fields?: FormField[];
}

export interface SectionSummary {
  section_id: string;
  title: string;
  description?: string;
  order_global: number;
  visibility_type: string;
  prerequisite_section_id?: string;
  fields_count: number;
}

export interface SectionListData {
  sections: SectionSummary[];
}

// Field Request types
export interface CreateFieldRequest {
  content_type: 'input_field' | 'section' | 'display_text';
  field_type?: string;
  label: string;
  description?: string;
  order_global: number;
  order_in_section?: number;
  section_id?: string;
  is_required?: boolean;
  points?: number;
  answer_key?: any;
}

export interface UpdateFieldRequest {
  label?: string;
  description?: string;
  is_required?: boolean;
  points?: number;
  answer_key?: any;
  order_global?: number;
  order_in_section?: number;
  section_id?: string;
}

export interface ReorderFieldItem {
  field_id: string;
  order_global: number;
  section_id?: string;
  order_in_section?: number;
}

export interface ReorderFieldsRequest {
  items: ReorderFieldItem[];
}

// Field Response types
export interface FieldDetail {
  field_id: string;
  form_id: string;
  content_type: string;
  field_type?: string;
  label: string;
  description?: string;
  order_global: number;
  order_in_section?: number;
  section_id?: string;
  is_required: boolean;
  points: number;
  answer_key?: any;
  created_at: string;
  updated_at: string;
}

export interface FieldListData {
  fields: FormField[];
}

export interface ReorderFieldsData {
  items: ReorderFieldItem[];
  message: string;
}

// Whitelist types
export interface WhitelistEntry {
  whitelist_id: string;
  form_id: string;
  access_token: string;
  external_user_id: string;
  email: string;
  name: string;
  max_attempts: number;
  attempts_used: number;
  expires_at: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  quiz_url: string;
}

export interface WhitelistEntryDetail {
  whitelist_id: string;
  form_id: string;
  access_token: string;
  external_user_id: string;
  email: string;
  name: string;
  max_attempts: number;
  attempts_used: number;
  expires_at: string;
  is_expired: boolean;
  can_attempt: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface WhitelistEntryListItem {
  whitelist_id: string;
  external_user_id: string;
  email: string;
  name: string;
  max_attempts: number;
  attempts_used: number;
  expires_at: string;
  is_expired: boolean;
  can_attempt: boolean;
  created_at: string;
}

export interface WhitelistListData {
  entries: WhitelistEntryListItem[];
  pagination: PaginationResponse;
}

export interface WhitelistBatchData {
  created_count: number;
  failed_count: number;
  entries: WhitelistEntry[];
}

export interface FormValidationInfo {
  form_id: string;
  title: string;
  form_type: string;
  time_limit_minutes: number;
}

export interface ValidateTokenData {
  is_valid: boolean;
  whitelist_id?: string;
  form_id?: string;
  external_user_id?: string;
  email?: string;
  name?: string;
  can_attempt?: boolean;
  attempts_remaining?: number;
  expires_at?: string;
  form?: FormValidationInfo;
}

// Whitelist Request types
export interface CreateWhitelistRequest {
  external_user_id: string;
  email: string;
  name: string;
  max_attempts: number;
  expires_at: string; // RFC3339 format
  metadata?: any;
}

export interface BatchCreateWhitelistRequest {
  entries: CreateWhitelistRequest[];
}

export interface UpdateWhitelistRequest {
  max_attempts?: number;
  expires_at?: string; // RFC3339 format
  metadata?: any;
}

export interface WhitelistListParams {
  page?: number;
  per_page?: number;
  sort_by?: 'created' | 'name';
}

// Quiz types
export interface QuizFormInfo {
  title: string;
  description?: string;
  form_type: string;
  shuffle_questions: boolean;
  total_questions: number;
}

export interface QuizFormBasicInfo {
  form_id: string;
  title: string;
  form_type: string;
}

export interface QuizSectionContent {
  section_id: string;
  title: string;
  order_global: number;
  visibility_type: string;
  fields: QuizFieldContent[];
}

export interface QuizFieldContent {
  field_id: string;
  content_type: string;
  field_type?: string;
  label: string;
  is_required: boolean;
  order_in_section: number;
}

export interface StartQuizData {
  session_id: string;
  session_token: string;
  form_id: string;
  whitelist_id: string;
  started_at: string;
  expires_at: string;
  time_limit_minutes: number;
  form: QuizFormInfo;
}

export interface QuizContentData {
  session_id: string;
  form: QuizFormBasicInfo;
  sections: QuizSectionContent[];
}

export interface AutoSaveData {
  field_id: string;
  last_saved_at: string;
  message: string;
}

export interface SessionStatusData {
  session_id: string;
  is_active: boolean;
  started_at: string;
  expires_at: string;
  time_remaining_seconds: number;
  answers_saved: number;
  total_fields: number;
}

export interface QuizResultFormInfo {
  form_id: string;
  title: string;
  form_type: string;
  passing_score?: number;
  total_points: number;
  show_correct_answers: boolean;
}

export interface QuizAnswerDetail {
  field_id: string;
  label: string;
  user_answer: any;
  is_correct?: boolean;
  points_earned?: number;
  max_points?: number;
}

export interface QuizResultDetail {
  score?: number;
  is_passed?: boolean;
  time_spent_seconds: number;
  submitted_at: string;
  answers: QuizAnswerDetail[];
}

export interface QuizResultData {
  response_id: string;
  form: QuizResultFormInfo;
  result: QuizResultDetail;
}

export interface SubmitQuizData {
  response_id: string;
  form_id: string;
  session_id: string;
  submitted_at: string;
  time_spent_seconds: number;
  was_auto_submitted: boolean;
  score?: number;
  is_passed?: boolean;
  message: string;
}

export interface ResumeQuizData {
  session_id: string;
  is_resumed: boolean;
  time_remaining_seconds: number;
  saved_answers: Record<string, any>;
  message: string;
}

// Quiz Request types
export interface StartQuizRequest {
  access_token: string;
}

export interface AutoSaveAnswerRequest {
  field_id: string;
  answer_value: any;
}

export interface SubmitAnswerItem {
  field_id: string;
  answer_value: any;
}

export interface SubmitQuizRequest {
  answers: SubmitAnswerItem[];
}

export interface ResumeQuizRequest {
  session_token: string;
}

// Response types
export type FormResponse = APIResponse<Form>;
export type FormWithSectionsResponse = APIResponse<FormWithSections>;
export type FormListResponse = APIResponse<FormListData>;
export type PublishFormResponse = APIResponse<PublishFormData>;
export type SectionDetailResponse = APIResponse<SectionDetail>;
export type SectionListResponse = APIResponse<SectionListData>;
export type FieldDetailResponse = APIResponse<FieldDetail>;
export type FieldListResponse = APIResponse<FieldListData>;
export type ReorderFieldsResponse = APIResponse<ReorderFieldsData>;
export type WhitelistEntryResponse = WhitelistEntry;
export type WhitelistEntryDetailResponse = WhitelistEntryDetail;
export type WhitelistListResponse = WhitelistListData;
export type WhitelistBatchResponse = WhitelistBatchData;
export type ValidateTokenResponse = ValidateTokenData;
export type StartQuizResponse = StartQuizData;
export type QuizContentResponse = QuizContentData;
export type AutoSaveResponse = AutoSaveData;
export type SessionStatusResponse = SessionStatusData;
export type SubmitQuizResponse = SubmitQuizData;
export type QuizResultResponse = QuizResultData;
export type ResumeQuizResponse = ResumeQuizData;

// Canvas Builder types
export interface CanvasItem {
  id: string;
  type: 'header' | 'title-description' | 'question' | 'page-break';
  title: string;
  description: string;
  questionType?: string;
  required?: boolean;
  options?: Array<{ id: string; label: string }>;
  sectionNumber?: number;
  totalSections?: number;
  order: number;
  isEditing?: boolean;
  isSelected?: boolean;
  isDragging?: boolean;
}
