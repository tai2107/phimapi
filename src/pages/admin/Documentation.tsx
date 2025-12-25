import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Globe, 
  Zap, 
  Settings, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  FileText,
  Search,
  Film,
  Shield
} from "lucide-react";

export default function Documentation() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Hướng dẫn sử dụng</h1>
            </div>
          </header>
          
          <main className="flex-1 p-6 space-y-6 max-w-4xl">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Chào mừng đến với Hệ thống Quản lý Phim
                </CardTitle>
                <CardDescription>
                  Tài liệu hướng dẫn cấu hình và sử dụng hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Hướng dẫn này sẽ giúp bạn cấu hình website, thiết lập SEO và tích hợp với các công cụ tìm kiếm 
                  để website của bạn được index nhanh chóng trên Google, Bing và các search engine khác.
                </p>
              </CardContent>
            </Card>

            {/* Quick Start */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5" />
                  Bắt đầu nhanh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Badge className="mt-0.5">1</Badge>
                    <div>
                      <p className="font-medium">Cấu hình Domain</p>
                      <p className="text-sm text-muted-foreground">
                        Vào <strong>Cài đặt Site</strong> → nhập domain thực của website
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Badge className="mt-0.5">2</Badge>
                    <div>
                      <p className="font-medium">Thiết lập IndexNow</p>
                      <p className="text-sm text-muted-foreground">
                        Vào <strong>Quản lý Sitemap</strong> → tab <strong>IndexNow</strong> → tạo key
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Badge className="mt-0.5">3</Badge>
                    <div>
                      <p className="font-medium">Kiểm tra xác thực</p>
                      <p className="text-sm text-muted-foreground">
                        Nhấn <strong>Kiểm tra xác thực</strong> để verify với Bing/Google
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Guides */}
            <Accordion type="single" collapsible className="space-y-4">
              {/* Domain Configuration */}
              <AccordionItem value="domain" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Cấu hình Domain (Site URL)</p>
                      <p className="text-sm text-muted-foreground font-normal">Thiết lập domain chính cho website</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Tại sao cần cấu hình Site URL?</h4>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Sitemap sử dụng domain này để tạo đường dẫn chính xác</li>
                      <li>IndexNow ping đến search engines với domain thực</li>
                      <li>Canonical URL và SEO tags sử dụng domain này</li>
                      <li>Tránh lỗi duplicate content do sai domain</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Cách cấu hình:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Vào menu <strong>Cài đặt Site</strong></li>
                      <li>Tìm trường <strong>Site URL</strong></li>
                      <li>Nhập domain đầy đủ, ví dụ: <code className="bg-muted px-1 rounded">https://phim.example.com</code></li>
                      <li>Nhấn <strong>Lưu cài đặt</strong></li>
                    </ol>
                  </div>

                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-500">Lưu ý quan trọng:</p>
                        <ul className="list-disc list-inside mt-1 text-muted-foreground">
                          <li>Bao gồm <code>https://</code> ở đầu</li>
                          <li>Không có dấu <code>/</code> ở cuối</li>
                          <li>Sử dụng domain chính thức (không dùng subdomain staging)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* IndexNow Setup */}
              <AccordionItem value="indexnow" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Thiết lập IndexNow</p>
                      <p className="text-sm text-muted-foreground font-normal">Tự động thông báo search engines khi có nội dung mới</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">IndexNow là gì?</h4>
                    <p className="text-muted-foreground">
                      IndexNow là giao thức cho phép website thông báo ngay lập tức cho search engines 
                      (Bing, Yandex, Naver...) khi có nội dung mới hoặc cập nhật. Giúp nội dung được 
                      index nhanh hơn so với việc chờ crawler tự phát hiện.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Các bước thiết lập:</h4>
                    <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                      <li>
                        <strong>Tạo IndexNow Key:</strong>
                        <ul className="list-disc list-inside ml-4 mt-1">
                          <li>Vào <strong>Quản lý Sitemap</strong> → tab <strong>IndexNow</strong></li>
                          <li>Nhấn <strong>Tạo key ngẫu nhiên</strong> hoặc nhập key tùy chỉnh</li>
                          <li>Key phải là chuỗi chữ thường và số, độ dài 8-128 ký tự</li>
                          <li>Nhấn <strong>Lưu Key</strong></li>
                        </ul>
                      </li>
                      <li>
                        <strong>Xác thực Key:</strong>
                        <ul className="list-disc list-inside ml-4 mt-1">
                          <li>Hệ thống tự động tạo file xác thực tại <code>[key].txt</code></li>
                          <li>File này được serve qua Edge Function</li>
                          <li>Nhấn <strong>Kiểm tra xác thực</strong> để verify</li>
                        </ul>
                      </li>
                      <li>
                        <strong>Tự động Index:</strong>
                        <ul className="list-disc list-inside ml-4 mt-1">
                          <li>Khi thêm/sửa phim → tự động ping IndexNow</li>
                          <li>Khi đăng bài viết mới → tự động ping IndexNow</li>
                          <li>Có thể ping thủ công nhiều URL cùng lúc</li>
                        </ul>
                      </li>
                    </ol>
                  </div>

                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-green-500">Search Engines hỗ trợ:</p>
                        <ul className="list-disc list-inside mt-1 text-muted-foreground">
                          <li><strong>Bing</strong> - Hỗ trợ IndexNow trực tiếp</li>
                          <li><strong>Yandex</strong> - Hỗ trợ IndexNow</li>
                          <li><strong>Google</strong> - Ping sitemap (không dùng IndexNow)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Sitemap */}
              <AccordionItem value="sitemap" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Quản lý Sitemap</p>
                      <p className="text-sm text-muted-foreground font-normal">Hiểu về cấu trúc sitemap và cách kiểm tra</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Cấu trúc Sitemap:</h4>
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                        <Badge variant="outline">sitemap.xml</Badge>
                        <span className="text-sm text-muted-foreground">Sitemap index - liên kết tất cả sitemap con</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                        <Badge variant="outline">sitemap-pages.xml</Badge>
                        <span className="text-sm text-muted-foreground">Trang chủ, trang danh mục</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                        <Badge variant="outline">sitemap-movies.xml</Badge>
                        <span className="text-sm text-muted-foreground">Tất cả trang phim</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                        <Badge variant="outline">sitemap-episodes.xml</Badge>
                        <span className="text-sm text-muted-foreground">Tất cả trang tập phim</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                        <Badge variant="outline">sitemap-taxonomy.xml</Badge>
                        <span className="text-sm text-muted-foreground">Thể loại, quốc gia, năm, diễn viên</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                        <Badge variant="outline">sitemap-posts.xml</Badge>
                        <span className="text-sm text-muted-foreground">Bài viết blog</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Cách kiểm tra Sitemap:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Vào <strong>Quản lý Sitemap</strong></li>
                      <li>Nhấn <strong>Kiểm tra tất cả</strong> để test tất cả sitemap</li>
                      <li>Xem số lượng URL trong mỗi sitemap</li>
                      <li>Nhấn <strong>Mở</strong> để xem nội dung XML</li>
                    </ol>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Submit Sitemap lên Google/Bing:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Đăng nhập <strong>Google Search Console</strong></li>
                      <li>Vào <strong>Sitemaps</strong></li>
                      <li>Submit URL: <code className="bg-muted px-1 rounded">https://domain.com/sitemap.xml</code></li>
                      <li>Tương tự với <strong>Bing Webmaster Tools</strong></li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* SEO Settings */}
              <AccordionItem value="seo" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Search className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Cài đặt SEO</p>
                      <p className="text-sm text-muted-foreground font-normal">Tối ưu thẻ meta và schema cho search engines</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Cài đặt SEO chung:</h4>
                    <p className="text-muted-foreground">
                      Vào <strong>Cài đặt SEO</strong> để cấu hình:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li><strong>Title Template</strong> - Mẫu tiêu đề trang (vd: {`{title}`} | Tên Website)</li>
                      <li><strong>Meta Description</strong> - Mô tả mặc định cho website</li>
                      <li><strong>Keywords</strong> - Từ khóa chính</li>
                      <li><strong>OG Image</strong> - Hình ảnh khi share lên mạng xã hội</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">SEO cho từng phim:</h4>
                    <p className="text-muted-foreground">
                      Khi thêm/sửa phim, bạn có thể tùy chỉnh:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li><strong>SEO Title</strong> - Tiêu đề hiển thị trên Google</li>
                      <li><strong>SEO Description</strong> - Mô tả cho trang phim</li>
                      <li><strong>SEO Keywords</strong> - Từ khóa cho phim</li>
                      <li><strong>Schema JSON</strong> - Dữ liệu cấu trúc (tự động tạo)</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Content Management */}
              <AccordionItem value="content" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Film className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Quản lý Nội dung</p>
                      <p className="text-sm text-muted-foreground font-normal">Thêm phim, bài viết và sử dụng AI</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Thêm phim mới:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Vào <strong>Quản lý Phim</strong> → <strong>Thêm phim</strong></li>
                      <li>Điền thông tin cơ bản: tên, slug, năm, chất lượng</li>
                      <li>Chọn thể loại, quốc gia, diễn viên, đạo diễn</li>
                      <li>Upload poster và thumbnail</li>
                      <li>Thêm tập phim với link stream</li>
                      <li>Nhấn <strong>Lưu</strong> - tự động ping IndexNow</li>
                    </ol>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Sử dụng AI tạo nội dung:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Vào <strong>AI Nội dung</strong></li>
                      <li>Cấu hình API Key OpenAI (chỉ cần 1 lần)</li>
                      <li>Chọn mẫu prompt hoặc tạo mẫu mới</li>
                      <li>Nhập thông tin phim cần viết</li>
                      <li>AI sẽ tự động tạo nội dung SEO-friendly</li>
                    </ol>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Crawl phim tự động:</h4>
                    <p className="text-muted-foreground">
                      Vào <strong>API Crawl</strong> để lấy phim từ nguồn bên ngoài. 
                      Hệ thống sẽ tự động cập nhật phim mới và ping IndexNow.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Troubleshooting */}
              <AccordionItem value="troubleshooting" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Xử lý sự cố</p>
                      <p className="text-sm text-muted-foreground font-normal">Các lỗi thường gặp và cách khắc phục</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg border">
                      <p className="font-medium text-red-500">❌ IndexNow key không xác thực được</p>
                      <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
                        <li>Kiểm tra Site URL đã đúng chưa</li>
                        <li>Đảm bảo key đã được lưu</li>
                        <li>Kiểm tra file [key].txt có thể truy cập</li>
                        <li>Chờ vài phút và thử lại</li>
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg border">
                      <p className="font-medium text-red-500">❌ Sitemap trả về lỗi</p>
                      <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
                        <li>Kiểm tra Site URL có chính xác không</li>
                        <li>Đảm bảo có ít nhất 1 phim/bài viết trong database</li>
                        <li>Kiểm tra Edge Functions đã deploy chưa</li>
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg border">
                      <p className="font-medium text-red-500">❌ Phim không được index</p>
                      <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
                        <li>Kiểm tra IndexNow key đã xác thực</li>
                        <li>Đảm bảo phim có status "published"</li>
                        <li>Submit sitemap lên Google Search Console</li>
                        <li>Chờ 24-48h để search engines crawl</li>
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg border">
                      <p className="font-medium text-red-500">❌ AI không tạo được nội dung</p>
                      <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
                        <li>Kiểm tra API Key OpenAI còn credit</li>
                        <li>Đảm bảo API Key đúng định dạng</li>
                        <li>Thử với prompt ngắn hơn</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
