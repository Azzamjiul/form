import { useState, useEffect } from "react";
import { whitelistApi } from "../api/whitelist";
import type {
  WhitelistEntryListItem,
  CreateWhitelistRequest,
  BatchCreateWhitelistRequest,
  UpdateWhitelistRequest,
  WhitelistEntryDetail,
} from "../types";
import { CreateWhitelistDialog } from "./CreateWhitelistDialog";
import { BatchCreateWhitelistDialog } from "./BatchCreateWhitelistDialog";
import { EditWhitelistDialog } from "./EditWhitelistDialog";
import { useToast } from "../../../components/Toast";

interface WhitelistManagementProps {
  formId: string;
}

export const WhitelistManagement = ({ formId }: WhitelistManagementProps) => {
  const { addToast } = useToast();
  const [entries, setEntries] = useState<WhitelistEntryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WhitelistEntryDetail | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, [formId, currentPage]);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const response = await whitelistApi.listWhitelistEntries(formId, {
        page: currentPage,
        per_page: 20,
        sort_by: "created",
      });
      setEntries(response.entries);
      setTotalPages(response.pagination.total_pages);
    } catch (error) {
      console.error("Failed to load whitelist entries:", error);
      addToast("Failed to load whitelist entries", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEntry = async (data: CreateWhitelistRequest) => {
    setIsLoading(true);
    try {
      await whitelistApi.createWhitelistEntry(formId, data);
      setIsDialogOpen(false);
      loadEntries();
      addToast("Whitelist entry created successfully!", "success");
    } catch (error) {
      console.error("Failed to create whitelist entry:", error);
      addToast("Failed to create whitelist entry", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchCreate = async (data: BatchCreateWhitelistRequest) => {
    setIsLoading(true);
    try {
      const result = await whitelistApi.batchCreateWhitelist(formId, data);
      setIsBatchDialogOpen(false);
      loadEntries();
      addToast(
        `Successfully created ${result.created_count} entries. Failed: ${result.failed_count}`,
        result.failed_count > 0 ? "warning" : "success"
      );
    } catch (error) {
      console.error("Failed to batch create whitelist entries:", error);
      addToast("Failed to batch create whitelist entries", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEntry = async (whitelistId: string) => {
    setIsLoading(true);
    try {
      const entry = await whitelistApi.getWhitelistEntry(formId, whitelistId);
      setEditingEntry(entry);
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error("Failed to load whitelist entry:", error);
      addToast("Failed to load whitelist entry", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEntry = async (data: UpdateWhitelistRequest) => {
    if (!editingEntry) return;

    setIsLoading(true);
    try {
      await whitelistApi.updateWhitelistEntry(
        formId,
        editingEntry.whitelist_id,
        data,
      );
      setIsEditDialogOpen(false);
      setEditingEntry(null);
      loadEntries();
      addToast("Whitelist entry updated successfully!", "success");
    } catch (error) {
      console.error("Failed to update whitelist entry:", error);
      addToast("Failed to update whitelist entry", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeEntry = async (whitelistId: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to revoke access for ${name}? They will no longer be able to take the quiz.`,
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await whitelistApi.revokeWhitelistEntry(formId, whitelistId);
      loadEntries();
      addToast("Access revoked successfully", "success");
    } catch (error) {
      console.error("Failed to revoke whitelist entry:", error);
      addToast("Failed to revoke whitelist entry", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, whitelistId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToken(whitelistId);
      addToast("Link copied to clipboard!", "success");
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      addToast("Failed to copy link", "error");
    }
  };

  const getStatusBadge = (entry: WhitelistEntryListItem) => {
    if (entry.is_expired) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          Expired
        </span>
      );
    }
    if (entry.attempts_used >= entry.max_attempts) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-orange-700 bg-orange-100 rounded-full">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
          Exhausted
        </span>
      );
    }
    if (entry.can_attempt) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">
        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
        Inactive
      </span>
    );
  };

  return (
    <div className="space-y-6 mt-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Access Control</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage who can access this form
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsBatchDialogOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Batch Import
          </button>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Respondent
          </button>
        </div>
      </div>

      {isLoading && entries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-4">Loading...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-dashed border-gray-300 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-gray-700 font-medium mt-4">No whitelist entries yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Add respondents to give them access to this form
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      External ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Attempts
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {entries.map((entry, index) => (
                    <tr
                      key={entry.whitelist_id}
                      className={`
                        transition-colors duration-150
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                        hover:bg-blue-50/50
                      `}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{entry.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{entry.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 font-mono">{entry.external_user_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-900">{entry.attempts_used}</span>
                          {" / "}
                          <span className="text-gray-500">{entry.max_attempts}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(entry.expires_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(entry)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              copyToClipboard(
                                entry.quiz_url,
                                entry.whitelist_id,
                              )
                            }
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                            title="Copy quiz link"
                          >
                            {copiedToken === entry.whitelist_id ? (
                              <>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Copied!
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleEditEntry(entry.whitelist_id)}
                            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                            title="Edit entry"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleRevokeEntry(entry.whitelist_id, entry.name)}
                            className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                            title="Revoke access"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <CreateWhitelistDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleCreateEntry}
        isLoading={isLoading}
      />

      <BatchCreateWhitelistDialog
        isOpen={isBatchDialogOpen}
        onClose={() => setIsBatchDialogOpen(false)}
        onSubmit={handleBatchCreate}
        isLoading={isLoading}
      />

      <EditWhitelistDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingEntry(null);
        }}
        onSubmit={handleUpdateEntry}
        entry={editingEntry}
        isLoading={isLoading}
      />
    </div>
  );
};
