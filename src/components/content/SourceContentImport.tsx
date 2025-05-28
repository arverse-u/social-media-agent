import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Download, Upload, FileText } from 'lucide-react';
import { fetchAndProcessSourceContent, processVideoContentFromCSV } from '@/services/sourceContentService';
import { addContentItem } from '@/services/databaseService';

const SourceContentImport = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const { toast } = useToast();
  
  const handleSourceApiImport = async () => {
    if (!selectedPlatform || !sourceUrl) {
      toast({
        title: "Missing information",
        description: "Please select a platform and enter the source URL.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      let result;
      
      // Use real API services based on platform
      switch (selectedPlatform) {
        case 'hashnode':
          const { fetchHashnodeContent } = await import('@/services/realApiService');
          result = await fetchHashnodeContent();
          break;
        case 'devto':
          const { fetchDevToContent } = await import('@/services/realApiService');
          result = await fetchDevToContent();
          break;
        case 'twitter':
          const { fetchTwitterContent } = await import('@/services/realApiService');
          result = await fetchTwitterContent();
          break;
        case 'linkedin':
          const { fetchLinkedInContent } = await import('@/services/realApiService');
          result = await fetchLinkedInContent();
          break;
        default:
          throw new Error(`Unsupported platform: ${selectedPlatform}`);
      }
      
      if (result.success && result.data) {
        // Add content items to database
        result.data.forEach(item => addContentItem(item));
        
        toast({
          title: "Content imported successfully",
          description: `Imported and enhanced ${result.data.length} content items from ${selectedPlatform}.`,
        });
        
        // Reset form
        setSourceUrl('');
        setSelectedPlatform('');
      } else {
        toast({
          title: "Import failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: "An error occurred while importing content.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCsvImport = async () => {
    if (!csvFile || !selectedPlatform) {
      toast({
        title: "Missing information",
        description: "Please select a platform and upload a CSV file.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Process CSV file with real service
      const { processCSVFile } = await import('@/services/sourceApiService');
      const result = await processCSVFile(csvFile, selectedPlatform as 'instagram' | 'youtube');
      
      if (result.success) {
        toast({
          title: "CSV processed successfully",
          description: result.data,
        });
        
        setCsvFile(null);
        setSelectedPlatform('');
      } else {
        toast({
          title: "Import failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: "An error occurred while processing the CSV file.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const isVideoRequired = selectedPlatform === 'instagram' || selectedPlatform === 'youtube';
  
  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2 text-astrum-teal" />
            Source Content Import
          </CardTitle>
          <CardDescription>
            Import content from platform-specific source APIs or upload CSV files for video content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="platform-select">Target Platform</Label>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform to import content for" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twitter">Twitter/X</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="dev.to">Dev.to</SelectItem>
                <SelectItem value="hashnode">Hashnode</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {!isVideoRequired ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="source-url">Source API URL</Label>
                <Input
                  id="source-url"
                  type="url"
                  placeholder="Enter the source API endpoint URL"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  API should return: {'{title, imageurl, description}'}
                </p>
              </div>
              
              <Button
                onClick={handleSourceApiImport}
                disabled={loading || !selectedPlatform || !sourceUrl}
                className="w-full bg-astrum-purple hover:bg-astrum-purple/80"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing and enhancing content...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Import from Source API
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-upload">Upload CSV File</Label>
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground">
                  CSV format: fileName, videoType, content
                </p>
                <p className="text-xs text-muted-foreground">
                  Video types: quiz | top 3 daily updates | product/service highlights | did u know facts
                </p>
              </div>
              
              <Button
                onClick={handleCsvImport}
                disabled={loading || !selectedPlatform || !csvFile}
                className="w-full bg-astrum-purple hover:bg-astrum-purple/80"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing video content...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import from CSV
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SourceContentImport;
