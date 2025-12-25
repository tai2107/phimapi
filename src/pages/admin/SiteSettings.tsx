import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Upload, Image, Code, FileText, Settings } from "lucide-react";
import MediaPicker from "@/components/admin/MediaPicker";

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
  created_at: string;
  updated_at: string;
}

export default function SiteSettings() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Record<string, string>>({
    site_url: "",
    site_name: "",
    logo_url: "",
    favicon_url: "",
    google_analytics_id: "",
    google_tag_manager_id: "",
    head_html: "",
    footer_html: "",
  });
  const [showMediaPicker, setShowMediaPicker] = useState<string | null>(null);

  // Fetch settings
  const { data: siteSettings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");
      if (error) throw error;
      return data as SiteSetting[];
    },
  });

  // Update settings when data is loaded
  useEffect(() => {
    if (siteSettings && Array.isArray(siteSettings)) {
      const settingsMap: Record<string, string> = {};
      siteSettings.forEach(s => {
        settingsMap[s.setting_key] = s.setting_value || "";
      });
      setSettings(prev => ({ ...prev, ...settingsMap }));
    }
  }, [siteSettings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value || null,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("site_settings")
          .update({ setting_value: update.setting_value })
          .eq("setting_key", update.setting_key);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Lưu cài đặt thành công");
    },
    onError: (error) => {
      toast.error("Lỗi khi lưu: " + error.message);
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  const handleMediaSelect = (url: string) => {
    if (showMediaPicker) {
      setSettings(prev => ({ ...prev, [showMediaPicker]: url }));
      setShowMediaPicker(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cài đặt Website</h1>
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {saveMutation.isPending ? "Đang lưu..." : "Lưu cài đặt"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" />
            Cài đặt chung
          </TabsTrigger>
          <TabsTrigger value="head">
            <Code className="mr-2 h-4 w-4" />
            Head HTML
          </TabsTrigger>
          <TabsTrigger value="footer">
            <FileText className="mr-2 h-4 w-4" />
            Footer HTML
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>URL Website</CardTitle>
              <CardDescription>
                URL chính của website, được sử dụng cho sitemap, canonical URL và SEO.
                Ví dụ: https://example.com (không có dấu / ở cuối)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={settings.site_url}
                onChange={(e) => setSettings({ ...settings, site_url: e.target.value })}
                placeholder="https://example.com"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tên Website</CardTitle>
              <CardDescription>
                Tên website hiển thị trong title và meta tags
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                placeholder="Tên website của bạn"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>
                Logo hiển thị trên header của website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {settings.logo_url && (
                  <div className="h-16 w-40 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                    <img
                      src={settings.logo_url}
                      alt="Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    value={settings.logo_url}
                    onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                    placeholder="URL logo hoặc chọn từ thư viện"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMediaPicker("logo_url")}
                >
                  <Image className="mr-2 h-4 w-4" />
                  Chọn ảnh
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Favicon</CardTitle>
              <CardDescription>
                Icon hiển thị trên tab trình duyệt (khuyến nghị 32x32 hoặc 16x16 px)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {settings.favicon_url && (
                  <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                    <img
                      src={settings.favicon_url}
                      alt="Favicon"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    value={settings.favicon_url}
                    onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })}
                    placeholder="URL favicon hoặc chọn từ thư viện"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMediaPicker("favicon_url")}
                >
                  <Image className="mr-2 h-4 w-4" />
                  Chọn ảnh
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="head" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Google Analytics (GA4)</CardTitle>
              <CardDescription>
                Nhập Measurement ID từ Google Analytics 4. Ví dụ: G-XXXXXXXXXX
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                value={settings.google_analytics_id}
                onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })}
                placeholder="G-XXXXXXXXXX"
              />
              <p className="text-xs text-muted-foreground">
                Lấy ID tại: Google Analytics → Admin → Data Streams → Measurement ID
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Google Tag Manager</CardTitle>
              <CardDescription>
                Nhập Container ID từ Google Tag Manager. Ví dụ: GTM-XXXXXXX
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                value={settings.google_tag_manager_id}
                onChange={(e) => setSettings({ ...settings, google_tag_manager_id: e.target.value })}
                placeholder="GTM-XXXXXXX"
              />
              <p className="text-xs text-muted-foreground">
                Lấy ID tại: Google Tag Manager → Container → Container ID (góc trên bên phải)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>HTML tùy chỉnh (Head)</CardTitle>
              <CardDescription>
                Thêm mã HTML/CSS/JS khác vào phần &lt;head&gt; của trang. Ví dụ: Facebook Pixel, 
                custom fonts, meta tags...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={settings.head_html}
                onChange={(e) => setSettings({ ...settings, head_html: e.target.value })}
                placeholder={`<!-- Ví dụ: Facebook Pixel -->
<script>
  !function(f,b,e,v,n,t,s)...
</script>

<!-- Custom fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- Custom meta tags -->
<meta name="theme-color" content="#000000">`}
                className="min-h-[200px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>HTML Footer tùy chỉnh</CardTitle>
              <CardDescription>
                Thêm mã HTML cho phần chân trang. Có thể sử dụng để thêm liên kết, 
                thông tin liên hệ, copyright...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={settings.footer_html}
                onChange={(e) => setSettings({ ...settings, footer_html: e.target.value })}
                placeholder={`<!-- Ví dụ: -->
<div class="footer-links">
  <a href="/about">Giới thiệu</a>
  <a href="/contact">Liên hệ</a>
  <a href="/privacy">Chính sách bảo mật</a>
</div>
<p class="copyright">© 2024 Your Website. All rights reserved.</p>`}
                className="min-h-[300px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Media Picker Dialog */}
      {showMediaPicker && (
        <MediaPicker
          open={!!showMediaPicker}
          onOpenChange={(open) => !open && setShowMediaPicker(null)}
          onSelect={handleMediaSelect}
        />
      )}
    </div>
  );
}
