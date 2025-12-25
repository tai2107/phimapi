import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Film, Tag, ListVideo, Settings } from "lucide-react";
import { toast } from "sonner";
import MovieInfoTab from "@/components/admin/movie-edit/MovieInfoTab";
import ClassificationTab from "@/components/admin/movie-edit/ClassificationTab";
import EpisodesTab from "@/components/admin/movie-edit/EpisodesTab";
import OtherTab from "@/components/admin/movie-edit/OtherTab";

const MovieEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === "new";
  
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState("info");

  // Fetch movie data
  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie-detail", id],
    queryFn: async () => {
      if (isNew) return null;
      
      const { data, error } = await supabase
        .from("movies")
        .select(`
          *,
          movie_genres(genre_id),
          movie_countries(country_id),
          movie_actors(actor_id, actors(name)),
          movie_directors(director_id, directors(name)),
          movie_tags(tag_id, tags(name))
        `)
        .eq("id", id!)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !isNew && !!id,
  });

  // Initialize form data from movie
  useEffect(() => {
    if (movie) {
      setFormData({
        ...movie,
        selectedGenres: movie.movie_genres?.map((mg: any) => mg.genre_id) || [],
        selectedCountries: movie.movie_countries?.map((mc: any) => mc.country_id) || [],
        directors: movie.movie_directors?.map((md: any) => md.directors?.name).filter(Boolean).join(", ") || "",
        actors: movie.movie_actors?.map((ma: any) => ma.actors?.name).filter(Boolean).join(", ") || "",
        tags: movie.movie_tags?.map((mt: any) => mt.tags?.name).filter(Boolean).join(", ") || "",
      });
    } else if (isNew) {
      setFormData({
        type: "single",
        status: "ongoing",
        selectedGenres: [],
        selectedCountries: [],
      });
    }
  }, [movie, isNew]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const movieData = {
        name: formData.name,
        origin_name: formData.origin_name,
        slug: formData.slug,
        content: formData.content,
        thumb_url: formData.thumb_url,
        poster_url: formData.poster_url,
        trailer_url: formData.trailer_url,
        time: formData.time,
        episode_current: formData.episode_current,
        episode_total: formData.episode_total,
        year: formData.year,
        lang: formData.lang,
        quality: formData.quality,
        type: formData.type,
        status: formData.status,
        chieurap: formData.chieurap || false,
        sub_docquyen: formData.sub_docquyen || false,
        is_copyright: formData.is_copyright || false,
      };

      let movieId = id;

      if (isNew) {
        const { data, error } = await supabase
          .from("movies")
          .insert(movieData)
          .select("id")
          .single();
        
        if (error) throw error;
        movieId = data.id;
      } else {
        const { error } = await supabase
          .from("movies")
          .update(movieData)
          .eq("id", id!);
        
        if (error) throw error;
      }

      // Update genres
      if (formData.selectedGenres?.length >= 0) {
        await supabase.from("movie_genres").delete().eq("movie_id", movieId!);
        if (formData.selectedGenres.length > 0) {
          const genreInserts = formData.selectedGenres.map((genreId: string) => ({
            movie_id: movieId,
            genre_id: genreId,
          }));
          await supabase.from("movie_genres").insert(genreInserts);
        }
      }

      // Update countries
      if (formData.selectedCountries?.length >= 0) {
        await supabase.from("movie_countries").delete().eq("movie_id", movieId!);
        if (formData.selectedCountries.length > 0) {
          const countryInserts = formData.selectedCountries.map((countryId: string) => ({
            movie_id: movieId,
            country_id: countryId,
          }));
          await supabase.from("movie_countries").insert(countryInserts);
        }
      }

      return movieId;
    },
    onSuccess: (movieId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-movies"] });
      queryClient.invalidateQueries({ queryKey: ["movie-detail", id] });
      toast.success(isNew ? "Đã tạo phim mới" : "Đã lưu thay đổi");
      
      if (isNew && movieId) {
        navigate(`/admin/movies/${movieId}`);
      }
    },
    onError: (error) => {
      console.error("Save error:", error);
      toast.error("Không thể lưu phim");
    },
  });

  const handleSave = () => {
    if (!formData.name?.trim()) {
      toast.error("Vui lòng nhập tên phim");
      return;
    }
    saveMutation.mutate();
  };

  const handleCancel = () => {
    navigate("/admin/movies");
  };

  if (isLoading && !isNew) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <main className="flex-1 p-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-[600px] w-full" />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="lg:hidden" />
              <Button variant="ghost" size="icon" onClick={() => navigate("/admin/movies")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-xl font-bold">
                  {isNew ? "Thêm phim mới" : `Chỉnh sửa: ${formData.name || "..."}`}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isNew ? "Tạo phim mới trong hệ thống" : "Chỉnh sửa thông tin phim"}
                </p>
              </div>
            </div>
          </header>

          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                <TabsTrigger value="info" className="gap-2">
                  <Film className="h-4 w-4" />
                  <span className="hidden sm:inline">Thông tin phim</span>
                  <span className="sm:hidden">Info</span>
                </TabsTrigger>
                <TabsTrigger value="classification" className="gap-2">
                  <Tag className="h-4 w-4" />
                  <span className="hidden sm:inline">Phân loại</span>
                  <span className="sm:hidden">Loại</span>
                </TabsTrigger>
                <TabsTrigger value="episodes" className="gap-2" disabled={isNew}>
                  <ListVideo className="h-4 w-4" />
                  <span className="hidden sm:inline">Danh sách tập</span>
                  <span className="sm:hidden">Tập</span>
                </TabsTrigger>
                <TabsTrigger value="other" className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Khác</span>
                  <span className="sm:hidden">Khác</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="info" className="m-0">
                  <MovieInfoTab
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isSaving={saveMutation.isPending}
                  />
                </TabsContent>

                <TabsContent value="classification" className="m-0">
                  <ClassificationTab
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isSaving={saveMutation.isPending}
                  />
                </TabsContent>

                <TabsContent value="episodes" className="m-0">
                  {!isNew && id && (
                    <EpisodesTab
                      movieId={id}
                      onSave={handleSave}
                      onCancel={handleCancel}
                      isSaving={saveMutation.isPending}
                    />
                  )}
                </TabsContent>

                <TabsContent value="other" className="m-0">
                  <OtherTab
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isSaving={saveMutation.isPending}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MovieEdit;
