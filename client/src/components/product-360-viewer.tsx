import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCcw, ZoomIn, ZoomOut, Maximize } from "lucide-react";

interface Product360ViewerProps {
  images: string[];
  images360?: string[];
  productName: string;
}

export default function Product360Viewer({ images, images360, productName }: Product360ViewerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotationIndex, setRotationIndex] = useState(0);
  const viewerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Use 360 images if available, otherwise use regular images
  const viewerImages = images360 && images360.length > 0 ? images360 : images;
  const currentImage = viewerImages[isRotating ? rotationIndex : currentImageIndex] || viewerImages[0];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (images360 && images360.length > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && images360 && images360.length > 1) {
      const deltaX = e.clientX - dragStart.x;
      const sensitivity = 3;
      const imageCount = images360.length;
      
      if (Math.abs(deltaX) > sensitivity) {
        const direction = deltaX > 0 ? 1 : -1;
        setRotationIndex((prev) => {
          const newIndex = prev + direction;
          if (newIndex >= imageCount) return 0;
          if (newIndex < 0) return imageCount - 1;
          return newIndex;
        });
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (images360 && images360.length > 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && images360 && images360.length > 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStart.x;
      const sensitivity = 5;
      const imageCount = images360.length;
      
      if (Math.abs(deltaX) > sensitivity) {
        const direction = deltaX > 0 ? 1 : -1;
        setRotationIndex((prev) => {
          const newIndex = prev + direction;
          if (newIndex >= imageCount) return 0;
          if (newIndex < 0) return imageCount - 1;
          return newIndex;
        });
        setDragStart({ x: touch.clientX, y: touch.clientY });
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const startAutoRotation = () => {
    if (images360 && images360.length > 1) {
      setIsRotating(true);
      const interval = setInterval(() => {
        setRotationIndex((prev) => {
          if (prev >= images360.length - 1) {
            setIsRotating(false);
            clearInterval(interval);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 1));
  };

  const handleFullscreen = () => {
    if (viewerRef.current && viewerRef.current.requestFullscreen) {
      viewerRef.current.requestFullscreen();
    }
  };

  useEffect(() => {
    const handleMouseLeave = () => {
      setIsDragging(false);
    };

    const viewer = viewerRef.current;
    if (viewer) {
      viewer.addEventListener('mouseleave', handleMouseLeave);
      return () => viewer.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Main Viewer */}
      <div 
        ref={viewerRef}
        className="relative bg-muted rounded-2xl overflow-hidden cursor-pointer select-none"
        data-testid="product-360-viewer"
      >
        <div 
          className="aspect-square flex items-center justify-center bg-background relative overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            ref={imageRef}
            src={currentImage}
            alt={`${productName} - 360° View`}
            className="w-full h-full object-cover transition-transform duration-200"
            style={{
              transform: `scale(${zoom})`,
              cursor: isDragging ? 'grabbing' : images360?.length ? 'grab' : 'default'
            }}
            draggable={false}
            data-testid="product-image"
          />
          
          {isDragging && (
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          )}
        </div>
        
        {/* 360 Controls */}
        <div className="absolute bottom-4 left-4 right-4">
          <Card className="bg-background/90 backdrop-blur-sm border-border/50">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={startAutoRotation}
                  disabled={!images360?.length || images360.length <= 1 || isRotating}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="button-auto-rotate"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  {isRotating ? 'Rotating...' : '360°'}
                </Button>
                <span className="text-sm font-medium" data-testid="text-360-label">
                  {images360?.length ? `360° View (${images360.length} frames)` : 'Product View'}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 1}
                  data-testid="button-zoom-out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  data-testid="button-zoom-in"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFullscreen}
                  data-testid="button-fullscreen"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Loading indicator for rotation */}
        {isRotating && (
          <div className="absolute top-4 left-4">
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              <RotateCcw className="h-3 w-3 inline mr-1 animate-spin" />
              360° Rotating...
            </div>
          </div>
        )}
      </div>
      
      {/* Thumbnail Gallery */}
      {viewerImages.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {viewerImages.slice(0, 6).map((image, index) => (
            <button
              key={index}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
                currentImageIndex === index && !isRotating
                  ? 'border-primary'
                  : 'border-border hover:border-primary'
              }`}
              onClick={() => {
                setCurrentImageIndex(index);
                setRotationIndex(index);
                setIsRotating(false);
              }}
              data-testid={`thumbnail-${index}`}
            >
              <img
                src={image}
                alt={`${productName} view ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          {viewerImages.length > 6 && (
            <div className="flex-shrink-0 w-20 h-20 rounded-lg border-2 border-border bg-muted flex items-center justify-center text-muted-foreground text-sm">
              +{viewerImages.length - 6}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {images360?.length && (
        <div className="text-center text-sm text-muted-foreground">
          <p>Drag to rotate • Click 360° for auto rotation • Scroll to zoom</p>
        </div>
      )}
    </div>
  );
}
