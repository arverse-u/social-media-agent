
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Trash2, Eye, Download } from 'lucide-react';
import { mediaBufferService } from '@/services/mediaBufferService';

const MediaBuffer = () => {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [stats, setStats] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    loadMediaItems();
    loadStats();
  }, []);

  const loadMediaItems = () => {
    const items = mediaBufferService.getMediaItems();
    setMediaItems(items);
  };

  const loadStats = () => {
    const bufferStats = mediaBufferService.getBufferStats();
    setStats(bufferStats);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !selectedPlatform) {
      toast({
        title: "Missing information",
        description: "Please select a platform and choose files to upload.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const mediaItem = await mediaBufferService.uploadToDropbox(file, selectedPlatform);
        
        if (mediaItem) {
          toast({
            title: "File uploaded successfully",
            description: `${file.name} has been uploaded to Dropbox.`,
          });
        } else {
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}.`,
            variant: "destructive"
          });
        }
      }

      loadMediaItems();
      loadStats();
      
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    } catch (error) {
      toast({
        title: "Upload error",
        description: "An error occurred while uploading files.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (id: string, filename: string) => {
    try {
      const success = await mediaBufferService.deleteFromDropbox(filename);
      
      if (success) {
        mediaBufferService.deleteMedia(id);
        loadMediaItems();
        loadStats();
        
        toast({
          title: "Media deleted",
          description: "File has been removed from the buffer.",
        });
      } else {
        toast({
          title: "Delete failed",
          description: "Failed to delete file from Dropbox.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Delete error",
        description: "An error occurred while deleting the file.",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Media Buffer</h2>
        <p className="text-muted-foreground">Upload and manage media files for your content</p>
      </div>

      {/* Upload Section */}
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle>Upload Media</CardTitle>
          <CardDescription>
            Upload images and videos to your Dropbox media buffer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform-select">Target Platform</Label>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload Files</Label>
            <Input
              id="file-upload"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              disabled={uploading || !selectedPlatform}
            />
          </div>

          <Button
            disabled={uploading || !selectedPlatform}
            className="w-full bg-astrum-purple hover:bg-astrum-purple/80"
          >
            {uploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload to Buffer
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byType?.video || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byType?.image || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Media Items List */}
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle>Media Files</CardTitle>
          <CardDescription>
            Manage your uploaded media files
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mediaItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No media files uploaded yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Upload your first file to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mediaItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {item.type === 'video' ? (
                        <div className="w-12 h-12 bg-red-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">VID</span>
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-blue-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">IMG</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{item.filename}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.platform} • {new Date(item.uploadedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        Status: {item.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMedia(item.id, item.filename)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaBuffer;
