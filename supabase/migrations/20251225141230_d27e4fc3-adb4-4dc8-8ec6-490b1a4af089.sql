-- Create table for AI prompt templates
CREATE TABLE public.ai_prompt_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  prompt_content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_prompt_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for admins only
CREATE POLICY "Only admins can manage prompt templates"
ON public.ai_prompt_templates
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_prompt_templates_updated_at
BEFORE UPDATE ON public.ai_prompt_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default prompt template
INSERT INTO public.ai_prompt_templates (name, prompt_content, is_default)
VALUES (
  'SEO Movie Description',
  'Dựa trên tiêu đề {post_title} và mô tả {post_content}, hãy viết một bài giới thiệu phim chuẩn SEO khoảng 300-500 từ bằng HTML, gồm thẻ H2, H3, H4, tiếng Việt, không links, không ảnh.',
  true
);