import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, RotateCcw, AlertTriangle, Film, FileText, FolderOpen, Globe, Calendar, Tag, Clapperboard, UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { format } from "date-fns";

type TrashItemType = "movies" | "posts" | "genres" | "countries" | "years" | "tags" | "directors" | "actors";

const TrashManagement = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TrashItemType>("movies");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch deleted items
  const { data: deletedItems, isLoading } = useQuery({
    queryKey: ["trash", activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(activeTab)
        .select("*")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from(activeTab)
        .update({ deleted_at: null })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trash", activeTab] });
      queryClient.invalidateQueries({ queryKey: [`admin-${activeTab}`] });
      toast.success(`Đã khôi phục ${selectedIds.length} mục`);
      setSelectedIds([]);
      setShowRestoreDialog(false);
    },
    onError: () => {
      toast.error("Không thể khôi phục");
    },
  });

  // Permanent delete mutation
  const permanentDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from(activeTab)
        .delete()
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trash", activeTab] });
      toast.success(`Đã xóa vĩnh viễn ${selectedIds.length} mục`);
      setSelectedIds([]);
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast.error("Không thể xóa");
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(deletedItems?.map((item: any) => item.id) || []);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as TrashItemType);
    setSelectedIds([]);
  };

  const getItemName = (item: any): string => {
    return item.name || item.title || item.year?.toString() || "Không tên";
  };

  const getTabIcon = (type: TrashItemType) => {
    const icons = {
      movies: Film,
      posts: FileText,
      genres: FolderOpen,
      countries: Globe,
      years: Calendar,
      tags: Tag,
      directors: Clapperboard,
      actors: UserCircle,
    };
    return icons[type];
  };

  const tabItems: { value: TrashItemType; label: string }[] = [
    { value: "movies", label: "Phim" },
    { value: "posts", label: "Bài viết" },
    { value: "genres", label: "Thể loại" },
    { value: "countries", label: "Quốc gia" },
    { value: "years", label: "Năm" },
    { value: "tags", label: "Tags" },
    { value: "directors", label: "Đạo diễn" },
    { value: "actors", label: "Diễn viên" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Thùng rác</h1>
                  <p className="text-sm text-muted-foreground">Khôi phục hoặc xóa vĩnh viễn nội dung đã xóa</p>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-4">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="flex-wrap h-auto gap-1 p-1">
                {tabItems.map((tab) => {
                  const Icon = getTabIcon(tab.value);
                  return (
                    <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {tabItems.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="space-y-4">
                  {selectedIds.length > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50">
                      <span className="text-sm font-medium">
                        Đã chọn {selectedIds.length} mục
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowRestoreDialog(true)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Khôi phục
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa vĩnh viễn
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedIds([])}
                      >
                        Bỏ chọn
                      </Button>
                    </div>
                  )}

                  <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableHead className="w-[50px]">
                            <Checkbox
                              checked={deletedItems?.length > 0 && selectedIds.length === deletedItems?.length}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Tên</TableHead>
                          <TableHead>Ngày xóa</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i} className="border-border/50">
                              <TableCell><div className="h-4 w-4 bg-muted animate-pulse rounded" /></TableCell>
                              <TableCell><div className="h-4 w-48 bg-muted animate-pulse rounded" /></TableCell>
                              <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                              <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                            </TableRow>
                          ))
                        ) : deletedItems?.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              Thùng rác trống
                            </TableCell>
                          </TableRow>
                        ) : (
                          deletedItems?.map((item: any) => (
                            <TableRow key={item.id} className="border-border/50">
                              <TableCell>
                                <Checkbox
                                  checked={selectedIds.includes(item.id)}
                                  onCheckedChange={(checked) => handleSelectOne(item.id, !!checked)}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {(() => {
                                    const Icon = getTabIcon(activeTab);
                                    return (
                                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    );
                                  })()}
                                  <span className="font-medium">{getItemName(item)}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {item.deleted_at && format(new Date(item.deleted_at), "dd/MM/yyyy HH:mm")}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedIds([item.id]);
                                      setShowRestoreDialog(true);
                                    }}
                                  >
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Khôi phục
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => {
                                      setSelectedIds([item.id]);
                                      setShowDeleteDialog(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Xóa
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>
      </div>

      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận khôi phục</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn khôi phục {selectedIds.length} mục đã chọn?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => restoreMutation.mutate(selectedIds)}>
              Khôi phục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Xóa vĩnh viễn
            </AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. {selectedIds.length} mục đã chọn sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => permanentDeleteMutation.mutate(selectedIds)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa vĩnh viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default TrashManagement;
