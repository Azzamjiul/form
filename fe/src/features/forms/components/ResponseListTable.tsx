import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Input,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/index';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  MoreHorizontal,
  Eye,
  Flag,
  Trash2,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import type {
  FormResponseListItem,
  PaginationResponse,
  ResponseListParams,
} from '../types';
import { format } from 'date-fns';

interface ResponseListTableProps {
  responses: FormResponseListItem[];
  pagination: PaginationResponse;
  isLoading: boolean;
  onViewDetails: (responseId: string) => void;
  onDeleteResponse: (responseId: string) => void;
  onFlagResponse: (responseId: string, isFlagged: boolean) => void;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: ResponseListParams) => void;
  formType: 'survey' | 'quiz';
}

export const ResponseListTable: React.FC<ResponseListTableProps> = ({
  responses,
  pagination,
  isLoading,
  onViewDetails,
  onDeleteResponse,
  onFlagResponse,
  onPageChange,
  onFiltersChange,
  formType,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ResponseListParams>({
    sort_by: 'submitted_at',
    order: 'desc',
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onFiltersChange({ ...filters, search: value });
  };

  const handleSort = (sortBy: string) => {
    const newOrder = filters.sort_by === sortBy && filters.order === 'desc' ? 'asc' : 'desc';
    const newFilters = { ...filters, sort_by: sortBy as any, order: newOrder as any };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleFilterChange = (key: keyof ResponseListParams, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      sort_by: 'submitted_at' as const,
      order: 'desc' as const,
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const formatTimeSpent = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const totalPages = pagination.total_pages;
  const currentPage = pagination.current_page;

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2 space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Sort By</label>
                  <select
                    value={filters.sort_by}
                    onChange={(e) => handleSort(e.target.value)}
                    className="w-full text-sm border rounded p-2"
                  >
                    <option value="submitted_at">Submission Date</option>
                    <option value="score">Score</option>
                    <option value="time_spent">Time Spent</option>
                  </select>
                </div>

                {formType === 'quiz' && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Pass Status</label>
                      <select
                        value={filters.is_passed !== undefined ? filters.is_passed.toString() : ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? undefined : e.target.value === 'true';
                          handleFilterChange('is_passed', value);
                        }}
                        className="w-full text-sm border rounded p-2"
                      >
                        <option value="">All</option>
                        <option value="true">Passed</option>
                        <option value="false">Failed</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm font-medium mb-1 block">Flagged</label>
                  <select
                    value={filters.is_flagged !== undefined ? filters.is_flagged.toString() : ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : e.target.value === 'true';
                      handleFilterChange('is_flagged', value);
                    }}
                    className="w-full text-sm border rounded p-2"
                  >
                    <option value="">All</option>
                    <option value="true">Flagged</option>
                    <option value="false">Not Flagged</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">From Date</label>
                    <input
                      type="date"
                      value={filters.date_from || ''}
                      onChange={(e) => handleFilterChange('date_from', e.target.value)}
                      className="w-full text-sm border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">To Date</label>
                    <input
                      type="date"
                      value={filters.date_to || ''}
                      onChange={(e) => handleFilterChange('date_to', e.target.value)}
                      className="w-full text-sm border rounded p-2"
                    />
                  </div>
                </div>

                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Respondent</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('submitted_at')}
                  className="font-semibold"
                >
                  Submitted
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              {formType === 'quiz' && (
                <>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('score')}
                      className="font-semibold"
                    >
                      Score
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                </>
              )}
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('time_spent')}
                  className="font-semibold"
                >
                  Time Spent
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  {formType === 'quiz' && (
                    <>
                      <TableCell>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                    </>
                  )}
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : responses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={formType === 'quiz' ? 6 : 5} className="text-center py-8">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium">No responses found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              responses.map((response) => (
                <TableRow key={response.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {response.name || 'Anonymous'}
                      </div>
                      {response.email && (
                        <div className="text-sm text-gray-500">{response.email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">
                        {format(new Date(response.submitted_at), 'MMM d, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(response.submitted_at), 'h:mm a')}
                      </div>
                    </div>
                  </TableCell>
                  {formType === 'quiz' && (
                    <>
                      <TableCell>
                        <div className="font-medium">
                          {response.score !== undefined ? `${response.score}%` : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {response.is_passed !== undefined && (
                          <Badge variant={response.is_passed ? 'default' : 'destructive'}>
                            {response.is_passed ? 'Passed' : 'Failed'}
                          </Badge>
                        )}
                      </TableCell>
                    </>
                  )}
                  <TableCell>
                    <div className="text-sm">
                      {formatTimeSpent(response.time_spent_seconds)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {response.is_flagged && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          <Flag className="h-3 w-3 mr-1" />
                          Flagged
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(response.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onFlagResponse(response.id, !response.is_flagged)}
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          {response.is_flagged ? 'Unflag' : 'Flag'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteResponse(response.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * pagination.per_page) + 1} to{' '}
            {Math.min(currentPage * pagination.per_page, pagination.total_items)} of{' '}
            {pagination.total_items} responses
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};