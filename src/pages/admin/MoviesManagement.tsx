import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Film, Search, Plus, Pencil, Trash2, Eye, MoreVertical, Calendar, Globe, Tag, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const ITEMS_PER_PAGE = 20;

const MoviesManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: moviesData, isLoading } = useQuery({
    queryKey: ["admin-movies", currentPage, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("movies")
        .select(`
          *,
          movie_genres(genre_id, genres(name)),
          movie_countries(country_id, countries(name)),
          episodes(id)
        `, { count: "exact" });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,origin_name.ilike.%${searchQuery}%`);
      }

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      return { movies: data || [], total: count || 0 };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("movies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-movies"] });
      toast.success("Đã xóa phim thành công");
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Không thể xóa phim");
    },
  });

  const totalPages = Math.ceil((moviesData?.total || 0) / ITEMS_PER_PAGE);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex-1">
                <h1 className="text-xl font-bold">Danh sách phim</h1>
                <p className="text-sm text-muted-foreground">Quản lý tất cả phim trong hệ thống</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Thêm phim
              </Button>
            </div>
          </header>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm phim..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9"
                />
              </div>
              <Badge variant="secondary">{moviesData?.total || 0} phim</Badge>
            </div>

            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="w-[400px]">Phim</TableHead>
                    <TableHead>Năm</TableHead>
                    <TableHead>Quốc gia</TableHead>
                    <TableHead>Thể loại</TableHead>
                    <TableHead>Số tập</TableHead>
                    <TableHead>Chất lượng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <TableRow key={i} className="border-border/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-16 rounded bg-muted animate-pulse" />
                            <div className="space-y-2">
                              <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                            </div>
                          </div>
                        </TableCell>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <TableCell key={j}><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : moviesData?.movies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Không có phim nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    moviesData?.movies.map((movie) => (
                      <TableRow key={movie.id} className="border-border/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {movie.poster_url ? (
                              <img
                                src={movie.poster_url}
                                alt={movie.name}
                                className="w-12 h-16 rounded object-cover"
                              />
                            ) : (
                              <div className="w-12 h-16 rounded bg-muted flex items-center justify-center">
                                <Film className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium line-clamp-1">{movie.name}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {movie.origin_name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {movie.year || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            {movie.movie_countries?.[0]?.countries?.name || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {movie.movie_genres?.slice(0, 2).map((mg: any) => mg.genres?.name).filter(Boolean).join(", ") || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{movie.episodes?.length || 0} tập</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-primary/20 text-primary">
                            {movie.quality || "HD"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              movie.status === "completed" 
                                ? "border-green-500/50 text-green-500" 
                                : "border-yellow-500/50 text-yellow-500"
                            }
                          >
                            {movie.episode_current || movie.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Pencil className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => setDeleteId(movie.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
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
                <p className="text-sm text-muted-foreground">
                  Trang {currentPage} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phim này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default MoviesManagement;
