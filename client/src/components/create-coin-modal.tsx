import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import URLInputForm from "@/components/url-input-form";
import ContentPreviewCard from "@/components/content-preview-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, Link, Image, Film, Music, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateCoinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCoinModal({
  open,
  onOpenChange,
}: CreateCoinModalProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string>("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadAuthor, setUploadAuthor] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleScrapedData = (data: any) => {
    setScrapedData(data);
    setShowPreview(true);
  };

  const handleCoinCreated = () => {
    setShowPreview(false);
    setScrapedData(null);
    resetUploadForm();
    onOpenChange(false);
  };

  const resetUploadForm = () => {
    setUploadedFile(null);
    setUploadPreviewUrl("");
    setUploadTitle("");
    setUploadDescription("");
    setUploadAuthor("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setShowPreview(false);
      setScrapedData(null);
      resetUploadForm();
    }
    onOpenChange(newOpen);
  };

  const compressImage = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/')) return file;
    
    // Skip compression for small images
    if (file.size < 500 * 1024) return file;

    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        // Calculate dimensions (max 1920px width)
        let { width, height } = img;
        const maxWidth = 1920;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressed = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressed.size < file.size ? compressed : file);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.85
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image, video, or audio file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 100MB",
        variant: "destructive",
      });
      return;
    }

    // Compress image if needed
    const processedFile = file.type.startsWith('image/') 
      ? await compressImage(file)
      : file;

    setUploadedFile(processedFile);
    const previewUrl = URL.createObjectURL(processedFile);
    setUploadPreviewUrl(previewUrl);

    // Auto-fill title from filename
    if (!uploadTitle) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setUploadTitle(nameWithoutExt);
    }
  };

  const handleUploadPreview = async () => {
    if (!uploadedFile || !uploadTitle) {
      toast({
        title: "Missing information",
        description: "Please upload a file and provide a title",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to Pinata with metadata
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('title', uploadTitle);
      formData.append('description', uploadDescription);
      formData.append('author', uploadAuthor);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload file');
      }

      const uploadResult = await uploadRes.json();
      console.log('Upload result:', uploadResult);

      if (uploadResult.uploadData) {
        setScrapedData(uploadResult.uploadData);
        setShowPreview(true);

        toast({
          title: "Upload successful",
          description: "Review your content and create your coin",
        });
      } else {
        throw new Error('Invalid upload response');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!uploadedFile) return <FileText className="w-6 h-6" />;
    const type = uploadedFile.type.split('/')[0];
    switch (type) {
      case 'image': return <Image className="w-6 h-6" />;
      case 'video': return <Film className="w-6 h-6" />;
      case 'audio': return <Music className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-4 rounded-full">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold text-foreground">
            Create a coin
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Transform your content into a tradeable digital asset
          </p>
        </DialogHeader>

        <Tabs defaultValue="import" className="mt-3">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Import
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="mt-4">
            <URLInputForm onScraped={handleScrapedData} />
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="modal-file-upload"
                  className="hidden"
                  accept="image/*,video/*,audio/*"
                  onChange={handleFileUpload}
                />
                <label htmlFor="modal-file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    {uploadedFile ? (
                      <>
                        {getFileIcon()}
                        <p className="text-sm font-medium text-foreground">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        {uploadPreviewUrl && uploadedFile.type.startsWith('image/') && (
                          <img 
                            src={uploadPreviewUrl} 
                            alt="Preview" 
                            className="mt-2 max-h-40 rounded-lg"
                          />
                        )}
                        {uploadPreviewUrl && uploadedFile.type.startsWith('video/') && (
                          <video 
                            src={uploadPreviewUrl} 
                            controls
                            className="mt-2 max-h-40 rounded-lg"
                          />
                        )}
                      </>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Upload your content
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Images, Videos, or Audio (Max 100MB)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {uploadedFile && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="modal-upload-title" className="text-xs">Title *</Label>
                    <Input
                      id="modal-upload-title"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="Enter content title"
                      className="mt-1.5 h-9 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="modal-upload-description" className="text-xs">Description</Label>
                    <Textarea
                      id="modal-upload-description"
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      placeholder="Describe your content (optional)"
                      className="mt-1.5 text-sm"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="modal-upload-author" className="text-xs">Creator Name</Label>
                    <Input
                      id="modal-upload-author"
                      value={uploadAuthor}
                      onChange={(e) => setUploadAuthor(e.target.value)}
                      placeholder="Your name (optional)"
                      className="mt-1.5 h-9 text-sm"
                    />
                  </div>

                  <Button 
                    onClick={handleUploadPreview}
                    disabled={isUploading || !uploadTitle}
                    className="w-full h-9"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading to IPFS...
                      </>
                    ) : (
                      <>
                        Preview & Create
                      </>
                    )}
                  </Button>
                  {isUploading && uploadedFile && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Uploading {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB...
                    </p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {showPreview && scrapedData && (
          <div className="mt-4">
            <ContentPreviewCard
              scrapedData={scrapedData}
              onCoinCreated={handleCoinCreated}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}