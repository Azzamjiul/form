import type { FormSummary, PaginationResponse } from '../types';
import { FormRow } from './FormRow';

interface FormListProps {
  forms: FormSummary[];
  pagination: PaginationResponse;
  onDelete?: (formId: string) => void;
  onDuplicate?: (formId: string) => void;
  onPublish?: (formId: string) => void;
  onClick?: (formId: string) => void;
  onPageChange?: (page: number) => void;
}

export const FormList = ({
  forms,
  pagination,
  onDelete,
  onDuplicate,
  onPublish,
  onClick,
  onPageChange,
}: FormListProps) => {
  if (forms.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8">
          Create your first survey or quiz to start collecting responses and insights from your audience.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <div className="text-xs text-gray-400 text-center">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-medium">
              💡 Tip: Start with a template to save time
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {forms.map((form) => (
        <FormRow
          key={form.form_id}
          form={form}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onPublish={onPublish}
          onClick={onClick}
        />
      ))}

      {pagination.total_pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => onPageChange?.(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {pagination.current_page} of {pagination.total_pages}
          </span>

          <button
            onClick={() => onPageChange?.(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.total_pages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
