import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Search, 
  Trash2, 
  Download, 
  Copy, 
  Image as ImageIcon,
  FileVideo,
  FileAudio,
  FileText,
  File,
  X,
  Grid,
  List,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface MediaFile {
  id: string;
  name: string;
  created_at: string;
  metadata: Record<string, any> | null;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (mimetype: string) => {
  if (mimetype?.startsWith('image/')) return ImageIcon;
  if (mimetype?.startsWith('video/')) return FileVideo;
  if (mimetype?.startsWith('audio/')) return FileAudio;
  if (mimetype === 'application/pdf') return FileText;
  return File;
};

const MediaManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [fileToDelete, setFileToDelete] = useState<MediaFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch media files
  const { data: files = [], isLoading } = useQuery({
    queryKey: ["media-files"],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("media")
        .list("", {
          limit: 1000,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) throw error;
      return (data || []) as MediaFile[];
    },
  });

  // Get public URL for file
  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage.from("media").getPublicUrl(fileName);
    return data.publicUrl;
  };

  // Upload file
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const file of Array.from(uploadedFiles)) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("media")
        .upload(fileName, file);

      if (error) {
        console.error("Upload error:", error);
        errorCount++;
      } else {
        successCount++;
      }
    }

    setIsUploading(false);
    queryClient.invalidateQueries({ queryKey: ["media-files"] });

    if (successCount > 0) {
      toast({
        title: "Tải lên thành công",
        description: `Đã tải lên ${successCount} file`,
      });
    }
    if (errorCount > 0) {
      toast({
        title: "Lỗi",
        description: `${errorCount} file không thể tải lên`,
        variant: "destructive",
      });
    }

    // Reset input
    event.target.value = "";
  };

  // Delete file
  const deleteMutation = useMutation({
    mutationFn: async (fileName: string) => {
      const { error } = await supabase.storage.from("media").remove([fileName]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-files"] });
      toast({ title: "Đã xóa file" });
      setFileToDelete(null);
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa file: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Copy URL to clipboard
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Đã sao chép URL" });
  };

  // Download file
  const downloadFile = async (fileName: string) => {
    const { data, error } = await supabase.storage.from("media").download(fileName);
    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải file",
        variant: "destructive",
      });
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter files
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isImage = (mimetype: string) => mimetype?.startsWith('image/');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Media</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm file..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div>
          <input
            type="file"
            id="file-upload"
            multiple
            accept="image/*,video/*,audio/*,application/pdf"
            onChange={handleUpload}
            className="hidden"
          />
          <Button asChild disabled={isUploading}>
            <label htmlFor="file-upload" className="cursor-pointer">
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isUploading ? "Đang tải..." : "Tải lên"}
            </label>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "Không tìm thấy file nào" : "Chưa có file nào"}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredFiles.map((file) => {
            const FileIcon = getFileIcon(file.metadata?.mimetype);
            const publicUrl = getPublicUrl(file.name);
            
            return (
              <Card
                key={file.id}
                className="cursor-pointer hover:ring-2 hover:ring-primary transition-all overflow-hidden"
                onClick={() => setSelectedFile(file)}
              >
                <div className="aspect-square relative bg-muted flex items-center justify-center">
                  {isImage(file.metadata?.mimetype) ? (
                    <img
                      src={publicUrl}
                      alt={file.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <FileIcon className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <CardContent className="p-2">
                  <p className="text-xs truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.metadata?.size || 0)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="divide-y">
            {filteredFiles.map((file) => {
              const FileIcon = getFileIcon(file.metadata?.mimetype);
              const publicUrl = getPublicUrl(file.name);
              
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedFile(file)}
                >
                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {isImage(file.metadata?.mimetype) ? (
                      <img
                        src={publicUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <FileIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.metadata?.size || 0)} •{" "}
                      {format(new Date(file.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(publicUrl);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile(file.name);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFileToDelete(file);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* File preview dialog */}
      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="truncate pr-8">{selectedFile?.name}</DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4">
              <div className="aspect-video relative bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {isImage(selectedFile.metadata?.mimetype) ? (
                  <img
                    src={getPublicUrl(selectedFile.name)}
                    alt={selectedFile.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : selectedFile.metadata?.mimetype?.startsWith('video/') ? (
                  <video
                    src={getPublicUrl(selectedFile.name)}
                    controls
                    className="max-w-full max-h-full"
                  />
                ) : selectedFile.metadata?.mimetype?.startsWith('audio/') ? (
                  <audio
                    src={getPublicUrl(selectedFile.name)}
                    controls
                    className="w-full"
                  />
                ) : (
                  <div className="text-center">
                    <File className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Không thể xem trước file này</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Kích thước</p>
                  <p>{formatFileSize(selectedFile.metadata?.size || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Loại file</p>
                  <p>{selectedFile.metadata?.mimetype || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ngày tải lên</p>
                  <p>{format(new Date(selectedFile.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm mb-2">URL</p>
                <div className="flex gap-2">
                  <Input
                    value={getPublicUrl(selectedFile.name)}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(getPublicUrl(selectedFile.name))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => downloadFile(selectedFile.name)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Tải xuống
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setFileToDelete(selectedFile)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa file "{fileToDelete?.name}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => fileToDelete && deleteMutation.mutate(fileToDelete.name)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MediaManagement;
