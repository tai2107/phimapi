import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Film, 
  Users, 
  TrendingUp, 
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreVertical,
  Play,
  Calendar,
  Globe,
  Tag
} from "lucide-react";
import { fetchNewMovies, fetchMoviesByType, getPosterUrl } from "@/lib/api";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Admin = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: newMovies, isLoading: loadingNew } = useQuery({
    queryKey: ["admin-new-movies"],
    queryFn: () => fetchNewMovies(1),
  });

  const { data: seriesData, isLoading: loadingSeries } = useQuery({
    queryKey: ["admin-series"],
    queryFn: () => fetchMoviesByType("series", 1),
  });

  const { data: singleData, isLoading: loadingSingle } = useQuery({
    queryKey: ["admin-single"],
    queryFn: () => fetchMoviesByType("single", 1),
  });

  const stats = [
    {
      title: "Tổng phim",
      value: newMovies?.pagination?.totalItems?.toLocaleString() || "0",
      icon: Film,
      change: "+12%",
      color: "from-primary to-primary/60",
    },
    {
      title: "Phim bộ",
      value: seriesData?.pagination?.totalItems?.toLocaleString() || "0",
      icon: Play,
      change: "+8%",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Phim lẻ",
      value: singleData?.pagination?.totalItems?.toLocaleString() || "0",
      icon: TrendingUp,
      change: "+15%",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Lượt xem hôm nay",
      value: "12,847",
      icon: Eye,
      change: "+23%",
      color: "from-purple-500 to-purple-600",
    },
  ];

  const allMovies = newMovies?.items || [];
  const filteredMovies = allMovies.filter(movie => 
    movie.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.origin_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex-1">
                <h1 className="text-xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Quản lý phim và nội dung</p>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Đồng bộ API
              </Button>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-green-500 mt-1">{stat.change} so với tuần trước</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
                </div>
              ))}
            </div>

            {/* Movies Table */}
            <div className="rounded-xl border border-border/50 bg-card">
              <Tabs defaultValue="all" className="w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-border/50">
                  <TabsList className="bg-muted/50">
                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                    <TabsTrigger value="series">Phim bộ</TabsTrigger>
                    <TabsTrigger value="single">Phim lẻ</TabsTrigger>
                    <TabsTrigger value="anime">Hoạt hình</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm phim..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-muted/50 border-border/50"
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <TabsContent value="all" className="m-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableHead className="w-[400px]">Phim</TableHead>
                          <TableHead>Năm</TableHead>
                          <TableHead>Quốc gia</TableHead>
                          <TableHead>Thể loại</TableHead>
                          <TableHead>Chất lượng</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingNew ? (
                          Array.from({ length: 5 }).map((_, i) => (
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
                              <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
                              <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                              <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                              <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
                              <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                              <TableCell><div className="h-4 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                            </TableRow>
                          ))
                        ) : filteredMovies.length > 0 ? (
                          filteredMovies.map((movie) => (
                            <TableRow key={movie.slug} className="border-border/50">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <img
                                    src={getPosterUrl(movie.poster_url)}
                                    alt={movie.name}
                                    className="w-12 h-16 rounded object-cover"
                                  />
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
                                  {movie.year}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Globe className="h-3 w-3" />
                                  {movie.country?.[0]?.name || "N/A"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Tag className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">
                                    {movie.category?.slice(0, 2).map(c => c.name).join(", ") || "N/A"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="bg-primary/20 text-primary">
                                  {movie.quality}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    movie.episode_current?.includes("Hoàn Tất") 
                                      ? "border-green-500/50 text-green-500" 
                                      : "border-yellow-500/50 text-yellow-500"
                                  }
                                >
                                  {movie.episode_current}
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
                                    <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                                    <DropdownMenuItem>Cập nhật</DropdownMenuItem>
                                    <DropdownMenuItem>Đồng bộ tập mới</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Xóa</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              Không tìm thấy phim nào
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between p-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                      Hiển thị {filteredMovies.length} / {newMovies?.pagination?.totalItems || 0} phim
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled>
                        Trước
                      </Button>
                      <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                        1
                      </Button>
                      <Button variant="outline" size="sm">
                        2
                      </Button>
                      <Button variant="outline" size="sm">
                        3
                      </Button>
                      <Button variant="outline" size="sm">
                        Sau
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="series" className="m-0 p-8 text-center text-muted-foreground">
                  Danh sách phim bộ sẽ hiển thị ở đây
                </TabsContent>
                <TabsContent value="single" className="m-0 p-8 text-center text-muted-foreground">
                  Danh sách phim lẻ sẽ hiển thị ở đây
                </TabsContent>
                <TabsContent value="anime" className="m-0 p-8 text-center text-muted-foreground">
                  Danh sách hoạt hình sẽ hiển thị ở đây
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
