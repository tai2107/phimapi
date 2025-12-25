import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedAdminRoute } from "@/components/admin/ProtectedAdminRoute";
import Index from "./pages/Index";
import MovieDetail from "./pages/MovieDetail";
import MovieList from "./pages/MovieList";
import AllMovies from "./pages/AllMovies";
import Search from "./pages/Search";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ApiCrawl from "./pages/admin/ApiCrawl";
import UsersManagement from "./pages/admin/UsersManagement";
import MoviesManagement from "./pages/admin/MoviesManagement";
import GenresManagement from "./pages/admin/GenresManagement";
import CountriesManagement from "./pages/admin/CountriesManagement";
import YearsManagement from "./pages/admin/YearsManagement";
import TagsManagement from "./pages/admin/TagsManagement";
import DirectorsManagement from "./pages/admin/DirectorsManagement";
import ActorsManagement from "./pages/admin/ActorsManagement";
import MovieEdit from "./pages/admin/MovieEdit";
import PostsManagement from "./pages/admin/PostsManagement";
import PostCategoriesManagement from "./pages/admin/PostCategoriesManagement";
import PostEdit from "./pages/admin/PostEdit";
import TrashManagement from "./pages/admin/TrashManagement";
import MediaManagement from "./pages/admin/MediaManagement";
import SeoSettings from "./pages/admin/SeoSettings";
import WidgetsManagement from "./pages/admin/WidgetsManagement";
import SiteSettings from "./pages/admin/SiteSettings";
import NotFound from "./pages/NotFound";
import { Header } from "./components/Header";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <Admin />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/api"
              element={
                <ProtectedAdminRoute>
                  <ApiCrawl />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedAdminRoute>
                  <UsersManagement />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/movies"
              element={
                <ProtectedAdminRoute>
                  <MoviesManagement />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/movies/:id"
              element={
                <ProtectedAdminRoute>
                  <MovieEdit />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/genres"
              element={
                <ProtectedAdminRoute>
                  <GenresManagement />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/countries"
              element={
                <ProtectedAdminRoute>
                  <CountriesManagement />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/years"
              element={
                <ProtectedAdminRoute>
                  <YearsManagement />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/tags"
              element={
                <ProtectedAdminRoute>
                  <TagsManagement />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/directors"
              element={
                <ProtectedAdminRoute>
                  <DirectorsManagement />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/actors"
              element={
                <ProtectedAdminRoute>
                  <ActorsManagement />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/posts"
              element={
                <ProtectedAdminRoute>
                  <PostsManagement />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/posts/:id"
              element={
                <ProtectedAdminRoute>
                  <PostEdit />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/post-categories"
              element={
                <ProtectedAdminRoute>
                  <PostCategoriesManagement />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/trash"
              element={
                <ProtectedAdminRoute>
                  <TrashManagement />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/media"
              element={
                <ProtectedAdminRoute>
                  <MediaManagement />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/seo"
              element={
                <ProtectedAdminRoute>
                  <SeoSettings />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/widgets"
              element={
                <ProtectedAdminRoute>
                  <WidgetsManagement />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/site-settings"
              element={
                <ProtectedAdminRoute>
                  <SiteSettings />
                </ProtectedAdminRoute>
              }
            />
            <Route path="/*" element={
              <>
                <Header />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/phim/:slug" element={<MovieDetail />} />
                  <Route path="/danh-sach/:type" element={<MovieList />} />
                  <Route path="/danh-muc/phim" element={<AllMovies />} />
                  <Route path="/tim-kiem" element={<Search />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
