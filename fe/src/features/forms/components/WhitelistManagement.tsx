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

interface WhitelistManagementProps {
  formId: string;
}

export const WhitelistManagement = ({ formId }: WhitelistManagementProps) => {
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
      alert("Failed to load whitelist entries");
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
      alert("Whitelist entry created successfully!");
    } catch (error) {
      console.error("Failed to create whitelist entry:", error);
      alert("Failed to create whitelist entry");
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
      alert(
        `Successfully created ${result.created_count} entries. Failed: ${result.failed_count}`,
      );
    } catch (error) {
      console.error("Failed to batch create whitelist entries:", error);
      alert("Failed to batch create whitelist entries");
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
      alert("Failed to load whitelist entry");
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
      alert("Whitelist entry updated successfully!");
    } catch (error) {
      console.error("Failed to update whitelist entry:", error);
      alert("Failed to update whitelist entry");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeEntry = async (whitelistId: string) => {
    if (
      !confirm(
        "Are you sure you want to revoke this access? The user will no longer be able to take the quiz.",
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await whitelistApi.revokeWhitelistEntry(formId, whitelistId);
      loadEntries();
      alert("Access revoked successfully");
    } catch (error) {
      console.error("Failed to revoke whitelist entry:", error);
      alert("Failed to revoke whitelist entry");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, whitelistId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToken(whitelistId);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getStatusBadge = (entry: WhitelistEntryListItem) => {
    if (entry.is_expired) {
      return (
        <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
          Expired
        </span>
      );
    }
    if (entry.attempts_used >= entry.max_attempts) {
      return (
        <span className="px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
          Exhausted
        </span>
      );
    }
    if (entry.can_attempt) {
      return (
        <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
          Active
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
        Inactive
      </span>
    );
  };

  return (
    <div className="space-y-4 mt-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Access Control</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage who can access this form
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsBatchDialogOpen(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Batch Import
          </button>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Add Respondent
          </button>
        </div>
      </div>

      {isLoading && entries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No whitelist entries yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Add respondents to give them access to this form
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    External ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attempts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry.whitelist_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.external_user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.attempts_used} / {entry.max_attempts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(entry.expires_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(entry)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `http://localhost:3000/quiz/${entry.whitelist_id}`,
                            entry.whitelist_id,
                          )
                        }
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {copiedToken === entry.whitelist_id
                          ? "Copied!"
                          : "Copy Link"}
                      </button>
                      <button
                        onClick={() => handleEditEntry(entry.whitelist_id)}
                        className="text-indigo-600 hover:text-indigo-900"
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRevokeEntry(entry.whitelist_id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={isLoading}
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50"
              >
                Next
              </button>
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
