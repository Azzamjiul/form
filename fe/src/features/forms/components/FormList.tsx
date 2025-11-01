import type { FormSummary, PaginationResponse } from '../types';
import { FormCard } from './FormCard';

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
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">No forms yet</div>
        <div className="text-gray-500 text-sm">
          Create your first form to get started
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map((form) => (
          <FormCard
            key={form.form_id}
            form={form}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onPublish={onPublish}
            onClick={onClick}
          />
        ))}
      </div>

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
