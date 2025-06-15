import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function ReviewUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const csvContent = `customerName,customerLocation,rating,title,content,tripDate,isVerified,isActive
"John Smith","New York USA",5,"Amazing Egypt Experience","Had the most incredible time exploring Cairo and Luxor with Afford Egypt. The guides were knowledgeable and the transportation was comfortable.","2024-03-15","TRUE","TRUE"
"Sarah Johnson","London UK",5,"Unforgettable Journey","Best travel experience ever! Professional service and authentic Egyptian culture.","2024-02-20","TRUE","TRUE"
"Ahmed Hassan","Cairo Egypt",4,"Great Local Experience","Excellent service from local team. Very professional and accommodating.","2024-01-10","FALSE","TRUE"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reviews_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file. Download the template if needed.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadResults(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error("File must contain at least a header row and one data row");
      }

      // Parse CSV with proper quote handling
      const parseCSVLine = (line: string): string[] => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      const headers = parseCSVLine(lines[0]);
      const reviews = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        
        if (values.length < 4) continue; // Skip incomplete rows
        
        const review: any = {};
        headers.forEach((header, index) => {
          if (values[index] !== undefined) {
            switch (header) {
              case 'rating':
                review[header] = parseInt(values[index]) || 5;
                break;
              case 'tripDate':
                if (values[index] && values[index] !== '') {
                  const dateValue = new Date(values[index]);
                  if (!isNaN(dateValue.getTime())) {
                    review[header] = dateValue.toISOString();
                  }
                }
                break;
              case 'isVerified':
              case 'isActive':
                review[header] = values[index].toLowerCase() === 'true';
                break;
              default:
                review[header] = values[index];
            }
          }
        });

        // Ensure required fields
        if (review.customerName && review.title && review.content && review.rating) {
          reviews.push(review);
        }
      }

      if (reviews.length === 0) {
        throw new Error("No valid reviews found in the file");
      }

      // Upload reviews one by one with detailed error tracking
      const results = [];
      const errors = [];
      
      for (const review of reviews) {
        try {
          await apiRequest("POST", "/api/reviews", review);
          results.push({ status: 'success', review });
        } catch (error: any) {
          console.error('Review upload error:', error, 'Review data:', review);
          results.push({ status: 'error', review, error: error.message });
          errors.push(`Row ${results.length}: ${error.message}`);
        }
      }

      const successful = results.filter(r => r.status === 'success').length;
      const failed = results.filter(r => r.status === 'error').length;

      setUploadResults({ successful, failed, total: reviews.length, errors });

      if (successful > 0) {
        toast({
          title: "Upload Complete",
          description: `Successfully uploaded ${successful} of ${reviews.length} reviews.${failed > 0 ? ` ${failed} failed.` : ''}`,
          variant: "default",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: `All ${failed} reviews failed to upload. Check console for details.`,
          variant: "destructive",
        });
      }

    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to process the file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Bulk Review Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Upload Instructions</h4>
              <p className="text-sm text-blue-700 mt-1">
                Upload a CSV file with customer reviews. Download the template below for the correct format.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={downloadTemplate}
            variant="outline"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV Template
          </Button>

          <div className="relative">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
          </div>

          {isUploading && (
            <div className="text-center py-4">
              <div className="animate-spin w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm text-gray-600">Processing reviews...</p>
            </div>
          )}

          {uploadResults && (
            <div className={`p-4 rounded-lg ${uploadResults.successful > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <h4 className={`font-semibold ${uploadResults.successful > 0 ? 'text-green-900' : 'text-red-900'}`}>
                Upload Results
              </h4>
              <p className={`text-sm mt-1 ${uploadResults.successful > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {uploadResults.successful} of {uploadResults.total} reviews uploaded successfully
                {uploadResults.failed > 0 && ` (${uploadResults.failed} failed)`}
              </p>
              {uploadResults.errors && uploadResults.errors.length > 0 && (
                <div className="mt-3">
                  <h5 className="font-medium text-red-900 text-sm">Error Details:</h5>
                  <ul className="text-xs text-red-700 mt-1 space-y-1">
                    {uploadResults.errors.slice(0, 5).map((error: string, index: number) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {uploadResults.errors.length > 5 && (
                      <li className="italic">... and {uploadResults.errors.length - 5} more errors</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600">
          <h4 className="font-semibold mb-2">Required CSV Columns:</h4>
          <ul className="space-y-1">
            <li><strong>customerName</strong> - Customer's full name</li>
            <li><strong>rating</strong> - Star rating (1-5)</li>
            <li><strong>title</strong> - Review headline</li>
            <li><strong>content</strong> - Full review text</li>
          </ul>
          <h4 className="font-semibold mt-3 mb-2">Optional Columns:</h4>
          <ul className="space-y-1">
            <li><strong>customerLocation</strong> - e.g., "London, UK"</li>
            <li><strong>tripDate</strong> - YYYY-MM-DD format</li>
            <li><strong>isVerified</strong> - TRUE/FALSE</li>
            <li><strong>isActive</strong> - TRUE/FALSE</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}