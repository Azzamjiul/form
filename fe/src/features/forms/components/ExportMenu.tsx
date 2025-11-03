import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/index';
import {
  Button,
  Input,
  Label,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/index';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Code,
  Calendar,
  Settings,
} from 'lucide-react';
import type { ExportOptions } from '../types';

interface ExportMenuProps {
  onExport: (options: ExportOptions) => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  onExport,
  isLoading,
  disabled = false,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    include_analytics: false,
  });

  const handleExport = async () => {
    try {
      await onExport(exportOptions);
      setDialogOpen(false);
      // Reset to defaults
      setExportOptions({
        format: 'csv',
        include_analytics: false,
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const quickExport = async (format: 'csv' | 'excel' | 'json') => {
    const options: ExportOptions = {
      format,
      include_analytics: false,
    };
    try {
      await onExport(options);
    } catch (error) {
      console.error('Quick export failed:', error);
    }
  };

  
  return (
    <div className="flex items-center gap-2">
      {/* Quick Export Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={disabled || isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Quick Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => quickExport('csv')}>
            <FileText className="h-4 w-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => quickExport('excel')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export as Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => quickExport('json')}>
            <Code className="h-4 w-4 mr-2" />
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Advanced Export Dialog */}
      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogTrigger onClick={() => setDialogOpen(true)}>
          <Button variant="outline" size="sm" disabled={disabled || isLoading}>
            <Settings className="h-4 w-4 mr-2" />
            Advanced Export
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Form Responses</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label htmlFor="format">Export Format</Label>
              <Select
                value={exportOptions.format}
                onValueChange={(value: string) =>
                  setExportOptions({ ...exportOptions, format: value as 'csv' | 'excel' | 'json' })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      CSV (Comma Separated Values)
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel (.xlsx)
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center">
                      <Code className="h-4 w-4 mr-2" />
                      JSON
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {exportOptions.format === 'csv' && 'Best for data analysis in spreadsheet applications'}
                {exportOptions.format === 'excel' && 'Preserves formatting and includes multiple sheets'}
                {exportOptions.format === 'json' && 'Ideal for programmatic processing and APIs'}
              </p>
            </div>

            {/* Include Analytics */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-analytics"
                  checked={exportOptions.include_analytics || false}
                  onCheckedChange={(checked) =>
                    setExportOptions({ ...exportOptions, include_analytics: checked as boolean })
                  }
                />
                <Label htmlFor="include-analytics">Include analytics summary</Label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Add summary statistics, score distributions, and completion trends
              </p>
            </div>

            {/* Date Range */}
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <Label className="text-sm font-medium">Date Range (Optional)</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-sm">
                    Start Date
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={exportOptions.date_range?.start_date || ''}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        date_range: {
                          start_date: e.target.value,
                          end_date: exportOptions.date_range?.end_date,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-sm">
                    End Date
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={exportOptions.date_range?.end_date || ''}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        date_range: {
                          start_date: exportOptions.date_range?.start_date || '',
                          end_date: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Leave empty to export all responses. Use to filter responses by submission date.
              </p>
            </div>

            {/* Export Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Export Summary</h4>
              <div className="text-sm space-y-1">
                <div>Format: <span className="font-medium uppercase">{exportOptions.format}</span></div>
                <div>
                  Analytics: <span className="font-medium">{exportOptions.include_analytics ? 'Included' : 'Not included'}</span>
                </div>
                <div>
                  Date Range:{' '}
                  <span className="font-medium">
                    {exportOptions.date_range?.start_date && exportOptions.date_range?.end_date
                      ? `${exportOptions.date_range.start_date} to ${exportOptions.date_range.end_date}`
                      : 'All responses'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};