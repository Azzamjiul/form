import type { FormSummary } from '../types';

// Helper function to extract plain text from HTML
const getPlainText = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  return div.textContent || div.innerText || '';
};

interface FormCardProps {
  form: FormSummary;
  onDelete?: (formId: string) => void;
  onDuplicate?: (formId: string) => void;
  onPublish?: (formId: string) => void;
  onClick?: (formId: string) => void;
}

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
      className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer bg-white"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3
            className="text-lg font-semibold text-gray-900 line-clamp-2"
            dangerouslySetInnerHTML={{
              __html: form.title || '<span class="text-gray-400">Untitled Form</span>'
            }}
          />
          {form.description && (
            <p
              className="text-sm text-gray-600 mt-1 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: form.description }}
            />
          )}
        </div>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            form.is_published
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {form.is_published ? 'Published' : 'Draft'}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <span className="flex items-center gap-1">
          <span className="font-medium">{form.form_type}</span>
        </span>
        <span>•</span>
        <span>{form.total_questions} questions</span>
        <span>•</span>
        <span>{form.response_count} responses</span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-xs text-gray-500">
          Updated {new Date(form.updated_at).toLocaleDateString()}
        </div>

        <div className="flex gap-2">
          {!form.is_published && onPublish && (
            <button
              onClick={handlePublish}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              Publish
            </button>
          )}
          {onDuplicate && (
            <button
              onClick={handleDuplicate}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
            >
              Duplicate
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
