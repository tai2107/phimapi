import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  linkEmbed?: string;
  linkM3u8?: string;
  linkMp4?: string;
  onError?: () => void;
}

const VideoPlayer = ({ linkEmbed, linkM3u8, linkMp4, onError }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = useCallback(() => {
    if (onError) {
      onError();
    }
  }, [onError]);

  useEffect(() => {
    const video = videoRef.current;
    let hls: Hls | null = null;

    const initPlayer = () => {
      if (!video) return;

      setError(null);
      setIsLoading(true);

      // Priority: m3u8 > mp4 > embed
      if (linkM3u8) {
        if (Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            xhrSetup: (xhr) => {
              xhr.withCredentials = false;
            },
          });
          
          hls.loadSource(linkM3u8);
          hls.attachMedia(video);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            video.play().catch(() => {});
          });
          
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  setError("Lỗi mạng - không thể tải video. Đang chuyển nguồn...");
                  hls?.startLoad();
                  handleError();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  setError("Lỗi media - định dạng không được hỗ trợ.");
                  hls?.recoverMediaError();
                  handleError();
                  break;
                default:
                  setError("Không thể phát video. Đang chuyển nguồn khác...");
                  handleError();
                  break;
              }
              setIsLoading(false);
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Safari native HLS support
          video.src = linkM3u8;
          video.addEventListener("loadedmetadata", () => {
            setIsLoading(false);
            video.play().catch(() => {});
          });
          video.addEventListener("error", () => {
            setError("Không thể phát video HLS.");
            setIsLoading(false);
            handleError();
          });
        }
      } else if (linkMp4) {
        video.src = linkMp4;
        video.addEventListener("loadedmetadata", () => {
          setIsLoading(false);
          video.play().catch(() => {});
        });
        video.addEventListener("error", () => {
          setError("Không thể phát video MP4. Đang chuyển nguồn khác...");
          setIsLoading(false);
          handleError();
        });
      }
    };

    initPlayer();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [linkM3u8, linkMp4, handleError]);

  // If only embed link is available, use iframe
  if (!linkM3u8 && !linkMp4 && linkEmbed) {
    return (
      <iframe
        src={linkEmbed}
        className="h-full w-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    );
  }

  // If we have m3u8 or mp4, use video player
  if (linkM3u8 || linkMp4) {
    return (
      <div className="relative h-full w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Đang tải video...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-4 px-4 text-center">
              <svg className="h-12 w-12 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-muted-foreground">{error}</p>
              <p className="text-xs text-muted-foreground/70">
                Thử dùng link embed nếu có hoặc kiểm tra lại nguồn video.
              </p>
            </div>
          </div>
        )}
        
        <video
          ref={videoRef}
          className="h-full w-full"
          controls
          playsInline
          crossOrigin="anonymous"
        />
      </div>
    );
  }

  // No valid link
  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <p className="text-muted-foreground">Không có link video</p>
    </div>
  );
};

export default VideoPlayer;
