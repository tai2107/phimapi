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
import Search from "./pages/Search";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ApiCrawl from "./pages/admin/ApiCrawl";
import UsersManagement from "./pages/admin/UsersManagement";
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
            <Route path="/*" element={
              <>
                <Header />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/phim/:slug" element={<MovieDetail />} />
                  <Route path="/danh-sach/:type" element={<MovieList />} />
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
