import type { FormSummary } from '../types';

interface FormCardProps {
  form: FormSummary;
  onDelete?: (formId: string) => void;
  onDuplicate?: (formId: string) => void;
  onPublish?: (formId: string) => void;
  onClick?: (formId: string) => void;
}

const getFormIcon = (formType: string) => {
  switch (formType.toLowerCase()) {
    case 'quiz':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'survey':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
  }
};

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

export const FormCard = ({ form, onDelete, onDuplicate, onPublish, onClick }: FormCardProps) => {
  const handleCardClick = () => {
    if (onClick) {
      onClick(form.form_id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm('Are you sure you want to delete this form?')) {
      onDelete(form.form_id);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicate) {
      onDuplicate(form.form_id);
    }
  };

  const handlePublish = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPublish) {
      onPublish(form.form_id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer bg-white hover:-translate-y-1"
    >
      {/* Header with Icon and Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600">
            {getFormIcon(form.form_type)}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="text-base font-semibold text-gray-900 truncate"
              dangerouslySetInnerHTML={{
                __html: form.title || '<span class="text-gray-400">Untitled Form</span>'
              }}
            />
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">{form.form_type}</span>
              {form.total_questions > 0 && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">{form.total_questions} questions</span>
                </>
              )}
            </div>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
            form.is_published
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'bg-gray-50 text-gray-600 border border-gray-200'
          }`}
        >
          {form.is_published ? 'Published' : 'Draft'}
        </span>
      </div>

      {/* Description (optional, only show if exists and card is not too crowded) */}
      {form.description && (
        <p
          className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: form.description }}
        />
      )}

      {/* Divider */}
      <div className="border-t border-gray-100 mb-4"></div>

      {/* Footer with last modified and always-visible actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{getRelativeTime(form.updated_at)}</span>
          {form.response_count > 0 && (
            <>
              <span className="mx-1 text-gray-300">•</span>
              <span>{form.response_count} responses</span>
            </>
          )}
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={handleCardClick}
            className="p-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="View form"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          {!form.is_published && onPublish && (
            <button
              onClick={handlePublish}
              className="p-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
              title="Publish form"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </button>
          )}

          {onDuplicate && (
            <button
              onClick={handleDuplicate}
              className="p-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
              title="Duplicate form"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}

          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete form"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
