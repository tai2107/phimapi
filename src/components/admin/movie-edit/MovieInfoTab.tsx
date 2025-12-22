import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import RichTextEditor from "./RichTextEditor";
import ImageSelector from "./ImageSelector";
import SEOPreview, { CharacterCounter } from "./SEOPreview";
import { Save, X, Code } from "lucide-react";

interface MovieInfoTabProps {
  formData: any;
  setFormData: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

const MovieInfoTab = ({ formData, setFormData, onSave, onCancel, isSaving }: MovieInfoTabProps) => {
  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const generateJsonLd = () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Movie",
      "name": formData.name || "",
      "alternateName": formData.origin_name || "",
      "description": formData.seo_description || formData.content?.replace(/<[^>]*>/g, "").slice(0, 160) || "",
      "image": formData.poster_url || formData.thumb_url || "",
      "datePublished": formData.year ? `${formData.year}-01-01` : "",
      "duration": formData.time || "",
      "inLanguage": formData.lang || "vi",
    };
    
    updateField("schema_json", JSON.stringify(schema, null, 2));
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
          <CardDescription>Nhập thông tin chính của phim</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên phim <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Avatar: Lửa và Tro Tàn"
              />
              <p className="text-xs text-muted-foreground">
                Tên phim bằng tiếng Việt (bắt buộc)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="origin_name">Tên phim gốc</Label>
              <Input
                id="origin_name"
                value={formData.origin_name || ""}
                onChange={(e) => updateField("origin_name", e.target.value)}
                placeholder="Avatar: Fire and Ash"
              />
              <p className="text-xs text-muted-foreground">
                Tên phim gốc bằng ngôn ngữ gốc
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Đường dẫn tĩnh (Slug)</Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                value={formData.slug || ""}
                onChange={(e) => updateField("slug", e.target.value)}
                placeholder="avatar-lua-va-tro-tan"
              />
              <Button 
                type="button" 
                variant="outline"
                onClick={() => updateField("slug", generateSlug(formData.name || ""))}
              >
                Tạo tự động
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              URL: /phim/{formData.slug || "ten-phim"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Hình ảnh</CardTitle>
          <CardDescription>Ảnh poster và thumbnail của phim</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageSelector
              label="Ảnh Thumb"
              value={formData.thumb_url || ""}
              onChange={(url) => updateField("thumb_url", url)}
            />
            <ImageSelector
              label="Ảnh Poster"
              value={formData.poster_url || ""}
              onChange={(url) => updateField("poster_url", url)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Nội dung phim</CardTitle>
          <CardDescription>Mô tả chi tiết về phim</CardDescription>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            content={formData.content || ""}
            onChange={(content) => updateField("content", content)}
          />
        </CardContent>
      </Card>

      {/* Movie Details */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết phim</CardTitle>
          <CardDescription>Thông tin bổ sung về phim</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="showtimes">Lịch chiếu phim</Label>
            <Input
              id="showtimes"
              value={formData.showtimes || ""}
              onChange={(e) => updateField("showtimes", e.target.value)}
              placeholder="Từ 20/12/2024"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trailer_url">Trailer Youtube URL</Label>
            <Input
              id="trailer_url"
              value={formData.trailer_url || ""}
              onChange={(e) => updateField("trailer_url", e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Thời lượng</Label>
              <Input
                id="time"
                value={formData.time || ""}
                onChange={(e) => updateField("time", e.target.value)}
                placeholder="120 phút"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="episode_current">Tập hiện tại</Label>
              <Input
                id="episode_current"
                value={formData.episode_current || ""}
                onChange={(e) => updateField("episode_current", e.target.value)}
                placeholder="Tập 10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="episode_total">Tổng số tập</Label>
              <Input
                id="episode_total"
                value={formData.episode_total || ""}
                onChange={(e) => updateField("episode_total", e.target.value)}
                placeholder="24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Năm xuất bản</Label>
              <Input
                id="year"
                type="number"
                value={formData.year || ""}
                onChange={(e) => updateField("year", parseInt(e.target.value) || null)}
                placeholder="2024"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lang">Ngôn ngữ</Label>
              <Input
                id="lang"
                value={formData.lang || ""}
                onChange={(e) => updateField("lang", e.target.value)}
                placeholder="Vietsub"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quality">Chất lượng</Label>
              <Input
                id="quality"
                value={formData.quality || ""}
                onChange={(e) => updateField("quality", e.target.value)}
                placeholder="HD"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Section */}
      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
          <CardDescription>Tối ưu hóa cho công cụ tìm kiếm</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="seo_title">Tiêu đề SEO</Label>
            <Input
              id="seo_title"
              value={formData.seo_title || ""}
              onChange={(e) => updateField("seo_title", e.target.value)}
              placeholder="Avatar: Lửa và Tro Tàn (2024) - Xem phim HD Vietsub"
            />
            <CharacterCounter 
              current={formData.seo_title?.length || 0} 
              max={60} 
              label="Độ dài tiêu đề SEO"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="seo_description">Thẻ mô tả SEO</Label>
            <Textarea
              id="seo_description"
              value={formData.seo_description || ""}
              onChange={(e) => updateField("seo_description", e.target.value)}
              placeholder="Xem phim Avatar: Lửa và Tro Tàn (2024) Full HD Vietsub. Phim hành động khoa học viễn tưởng..."
              rows={3}
            />
            <CharacterCounter 
              current={formData.seo_description?.length || 0} 
              max={160} 
              label="Độ dài mô tả SEO"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="seo_keyword">SEO Keyword</Label>
            <Input
              id="seo_keyword"
              value={formData.seo_keyword || ""}
              onChange={(e) => updateField("seo_keyword", e.target.value)}
              placeholder="phim avatar, phim hành động, phim khoa học viễn tưởng, xem phim hd"
            />
            <p className="text-xs text-muted-foreground">
              Nhập các từ khóa SEO, phân cách bằng dấu phẩy
            </p>
          </div>

          <Separator />

          <SEOPreview
            title={formData.seo_title || formData.name || ""}
            description={formData.seo_description || ""}
            url={`https://yoursite.com/phim/${formData.slug || "ten-phim"}`}
          />

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="schema_json">Schema JSON-LD</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={generateJsonLd}
              >
                <Code className="h-4 w-4 mr-2" />
                Tạo Schema
              </Button>
            </div>
            <Textarea
              id="schema_json"
              value={formData.schema_json || ""}
              onChange={(e) => updateField("schema_json", e.target.value)}
              placeholder='{"@context": "https://schema.org", "@type": "Movie", ...}'
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Nhập mã JSON-LD schema hoặc nhấn "Tạo Schema" để tự động tạo
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 sticky bottom-4 bg-background/95 backdrop-blur p-4 rounded-lg border border-border">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          <X className="h-4 w-4 mr-2" />
          Hủy
        </Button>
        <Button onClick={onSave} disabled={isSaving || !formData.name?.trim()}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </div>
  );
};

export default MovieInfoTab;
