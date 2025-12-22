import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Save, X, Globe } from "lucide-react";

interface ClassificationTabProps {
  formData: any;
  setFormData: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

const ClassificationTab = ({ formData, setFormData, onSave, onCancel, isSaving }: ClassificationTabProps) => {
  const { data: genres } = useQuery({
    queryKey: ["genres"],
    queryFn: async () => {
      const { data } = await supabase.from("genres").select("*").order("name");
      return data || [];
    },
  });

  const { data: countries } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const { data } = await supabase.from("countries").select("*").order("name");
      return data || [];
    },
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleGenre = (genreId: string) => {
    const currentGenres = formData.selectedGenres || [];
    if (currentGenres.includes(genreId)) {
      updateField("selectedGenres", currentGenres.filter((id: string) => id !== genreId));
    } else {
      updateField("selectedGenres", [...currentGenres, genreId]);
    }
  };

  const toggleCountry = (countryId: string) => {
    const currentCountries = formData.selectedCountries || [];
    if (currentCountries.includes(countryId)) {
      updateField("selectedCountries", currentCountries.filter((id: string) => id !== countryId));
    } else {
      updateField("selectedCountries", [...currentCountries, countryId]);
    }
  };

  const movieTypes = [
    { value: "series", label: "Phim bộ" },
    { value: "single", label: "Phim lẻ" },
    { value: "hoathinh", label: "Phim hoạt hình" },
    { value: "tvshows", label: "TV Shows" },
  ];

  return (
    <div className="space-y-6">
      {/* Movie Type */}
      <Card>
        <CardHeader>
          <CardTitle>Định dạng phim</CardTitle>
          <CardDescription>Chọn loại phim (bắt buộc)</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.type || "single"}
            onValueChange={(value) => updateField("type", value)}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {movieTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <RadioGroupItem value={type.value} id={type.value} />
                <Label htmlFor={type.value} className="cursor-pointer">{type.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Genres */}
      <Card>
        <CardHeader>
          <CardTitle>Thể loại</CardTitle>
          <CardDescription>Chọn các thể loại phù hợp với phim</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {genres?.map((genre) => (
              <div key={genre.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`genre-${genre.id}`}
                  checked={(formData.selectedGenres || []).includes(genre.id)}
                  onCheckedChange={() => toggleGenre(genre.id)}
                />
                <Label htmlFor={`genre-${genre.id}`} className="cursor-pointer text-sm">
                  {genre.name}
                </Label>
              </div>
            ))}
          </div>
          {(formData.selectedGenres || []).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Đã chọn:</span>
              {(formData.selectedGenres || []).map((genreId: string) => {
                const genre = genres?.find(g => g.id === genreId);
                return genre ? (
                  <Badge key={genreId} variant="secondary">
                    {genre.name}
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Countries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Quốc gia
          </CardTitle>
          <CardDescription>Chọn quốc gia sản xuất phim</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {countries?.map((country) => (
              <div key={country.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`country-${country.id}`}
                  checked={(formData.selectedCountries || []).includes(country.id)}
                  onCheckedChange={() => toggleCountry(country.id)}
                />
                <Label htmlFor={`country-${country.id}`} className="cursor-pointer text-sm">
                  {country.name}
                </Label>
              </div>
            ))}
          </div>
          {(formData.selectedCountries || []).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Đã chọn:</span>
              {(formData.selectedCountries || []).map((countryId: string) => {
                const country = countries?.find(c => c.id === countryId);
                return country ? (
                  <Badge key={countryId} variant="secondary">
                    {country.name}
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Directors */}
      <Card>
        <CardHeader>
          <CardTitle>Đạo diễn</CardTitle>
          <CardDescription>Nhập tên đạo diễn, phân cách bằng dấu phẩy</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={formData.directors || ""}
            onChange={(e) => updateField("directors", e.target.value)}
            placeholder="James Cameron, Steven Spielberg"
          />
          {formData.directors && (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.directors.split(",").map((director: string, idx: number) => (
                director.trim() && (
                  <Badge key={idx} variant="outline">
                    {director.trim()}
                  </Badge>
                )
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actors */}
      <Card>
        <CardHeader>
          <CardTitle>Diễn viên</CardTitle>
          <CardDescription>Nhập tên diễn viên, phân cách bằng dấu phẩy</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={formData.actors || ""}
            onChange={(e) => updateField("actors", e.target.value)}
            placeholder="Sam Worthington, Zoe Saldaña, Sigourney Weaver, Stephen Lang"
          />
          {formData.actors && (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.actors.split(",").map((actor: string, idx: number) => (
                actor.trim() && (
                  <Badge key={idx} variant="outline">
                    {actor.trim()}
                  </Badge>
                )
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
          <CardDescription>Nhập tags, phân cách bằng dấu phẩy</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={formData.tags || ""}
            onChange={(e) => updateField("tags", e.target.value)}
            placeholder="avatar, sci-fi, action, 3d"
          />
          {formData.tags && (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.tags.split(",").map((tag: string, idx: number) => (
                tag.trim() && (
                  <Badge key={idx} variant="secondary">
                    {tag.trim()}
                  </Badge>
                )
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Studios */}
      <Card>
        <CardHeader>
          <CardTitle>Studios</CardTitle>
          <CardDescription>Nhập tên studios sản xuất, phân cách bằng dấu phẩy</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={formData.studios || ""}
            onChange={(e) => updateField("studios", e.target.value)}
            placeholder="20th Century Studios, Lightstorm Entertainment"
          />
          {formData.studios && (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.studios.split(",").map((studio: string, idx: number) => (
                studio.trim() && (
                  <Badge key={idx} variant="outline">
                    {studio.trim()}
                  </Badge>
                )
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 sticky bottom-4 bg-background/95 backdrop-blur p-4 rounded-lg border border-border">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          <X className="h-4 w-4 mr-2" />
          Hủy
        </Button>
        <Button onClick={onSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </div>
  );
};

export default ClassificationTab;
