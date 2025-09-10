import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Camera, RefreshCw, Download, Share2, User } from "lucide-react";
import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

type FrameType = 'round' | 'rectangle' | 'aviator' | 'cat-eye';

// Using SVG placeholders for frames
const frameOptions = [
  { 
    id: 'frame1', 
    name: 'Classic Black', 
    type: 'rectangle' as FrameType, 
    image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMTAwIDMwMCAxMDAiIHdpZHRoPSIzMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTQwLDMwIEw0MCw3MCBMMjYwLDcwIEwyNjAsMzAgQzI2MCwzMCAyNDAsNDAgMjAwLDQwIEMxNjAsNDAgMTQwLDMwIDE0MCwzMCBDMTQwLDMwIDEyMCw0MCA4MCw0MCBDNDAsNDAgNDAsMzAgNDAsMzBaIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIvPjwvc3ZnPg==',
  },
  { 
    id: 'frame2', 
    name: 'Round Gold', 
    type: 'round' as FrameType, 
    image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMTAwIDMwMCAxMDAiIHdpZHRoPSIzMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJub25lIi8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iNTAiIHI9IjMwIiBmaWxsPSJub25lIiBzdHJva2U9IiNGRUIzMDgiIHN0cm9rZS13aWR0aD0iNCIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjUwIiByPSIzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkVCMzA4IiBzdHJva2Utd2lkdGg9IjQiLz48L3N2Zz4=',
  },
  { 
    id: 'frame3', 
    name: 'Aviator', 
    type: 'aviator' as FrameType, 
    image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMTAwIDMwMCAxMDAiIHdpZHRoPSIzMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJub25lIi8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iNTAiIHI9IjMwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjUwIiByPSIzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNNzAsNTAgQzEzMCw1MCAxNzAsNTAgMjMwLDUwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==',
  },
  { 
    id: 'frame4', 
    name: 'Cat Eye', 
    type: 'cat-eye' as FrameType, 
    image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMTAwIDMwMCAxMDAiIHdpZHRoPSIzMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTcwLDMwIEM3MCwzMCAxMDAsMTAgMTMwLDMwIEMxNjAsNTAgMTcwLDQwIDIwMCw0MCBDMjMwLDQwIDI0MCw1MCAyNzAsMzAgQzI5MCw1MCAyODAsNzAgMjcwLDcwIEMyNTAsNzAgMjMwLDYwIDIwMCw2MCBDMTcwLDYwIDE1MCw3MCAxMzAsNzBDMTEwLDcwIDkwLDUwIDcwLDMwIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0Ii8+PC9zdmc+',
  },
];

// Placeholder face image
const placeholderFace = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=60';

export default function VirtualTryOn() {
  const [, setLocation] = useLocation();
  const [isActive, setIsActive] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startExperience = () => {
    setIsActive(true);
    setSelectedFrame('frame1');
  };

  const captureImage = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Set canvas size
        canvas.width = 600;
        canvas.height = 800;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw face image
        const faceImg = new Image();
        faceImg.crossOrigin = 'anonymous';
        faceImg.src = placeholderFace;
        
        faceImg.onload = () => {
          // Draw face
          ctx.drawImage(faceImg, 0, 0, canvas.width, canvas.height);
          
          // Draw frame if selected
          if (selectedFrame) {
            const frame = frameOptions.find(f => f.id === selectedFrame);
            if (frame) {
              const frameImg = new Image();
              frameImg.crossOrigin = 'anonymous';
              frameImg.src = frame.image;
              
              frameImg.onload = () => {
                // Draw frame on top of face
                ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
                
                // Apply filters
                ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
                
                // Convert canvas to image and update state
                setCapturedImage(canvas.toDataURL('image/png'));
              };
            }
          } else {
            // If no frame selected, just use the face with filters
            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
            setCapturedImage(canvas.toDataURL('image/png'));
          }
        };
      }
    }
  };

  const resetExperience = () => {
    setCapturedImage(null);
  };

  const downloadImage = () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.download = 'frame-try-on.png';
      link.href = capturedImage;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">Virtual Try-On</h1>
          <p className="text-muted-foreground text-lg">
            See how our frames look on you with our virtual try-on experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preview Section */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0 relative">
                <div className="relative bg-black/5 dark:bg-white/5 aspect-[3/4] flex items-center justify-center overflow-hidden">
                  {!isActive ? (
                    <div className="text-center p-8">
                      <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <User className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-medium text-foreground mb-2">Ready to Try On?</h3>
                      <p className="text-muted-foreground mb-6">
                        Click the button below to start your virtual try-on experience
                      </p>
                      <Button 
                        size="lg" 
                        className="bg-primary hover:bg-primary/90"
                        onClick={startExperience}
                      >
                        Start Virtual Try-On
                      </Button>
                    </div>
                  ) : capturedImage ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={capturedImage} 
                        alt="Your try-on result" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                        <Button variant="outline" onClick={resetExperience}>
                          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                        </Button>
                        <Button onClick={downloadImage}>
                          <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
                        <Button variant="secondary">
                          <Share2 className="mr-2 h-4 w-4" /> Share
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <img 
                        src={placeholderFace} 
                        alt="Face preview" 
                        className="w-full h-full object-cover"
                        style={{
                          filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                        }}
                      />
                      {selectedFrame && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img 
                            src={frameOptions.find(f => f.id === selectedFrame)?.image} 
                            alt="Selected frame" 
                            className="h-1/3 w-auto opacity-90"
                            style={{
                              filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                              position: 'absolute',
                              top: '40%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              pointerEvents: 'none'
                            }}
                          />
                        </div>
                      )}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                        <Button 
                          size="lg" 
                          className="rounded-full w-16 h-16 p-0 bg-red-500 hover:bg-red-600"
                          onClick={captureImage}
                        >
                          <span className="sr-only">Capture</span>
                          <div className="w-6 h-6 rounded-full bg-white"></div>
                        </Button>
                      </div>
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </CardContent>
              
              {isActive && !capturedImage && (
                <CardFooter className="p-4 border-t">
                  <div className="w-full space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>Brightness</span>
                        <span>{brightness}%</span>
                      </div>
                      <Slider
                        value={[brightness]}
                        onValueChange={(value) => setBrightness(value[0])}
                        max={200}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>Contrast</span>
                        <span>{contrast}%</span>
                      </div>
                      <Slider
                        value={[contrast]}
                        onValueChange={(value) => setContrast(value[0])}
                        max={200}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>

          {/* Frames Selection */}
          <div className="space-y-6">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="rectangle">Rectangle</TabsTrigger>
                <TabsTrigger value="round">Round</TabsTrigger>
                <TabsTrigger value="cat-eye">Cat Eye</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {frameOptions.map((frame) => (
                    <div 
                      key={frame.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        selectedFrame === frame.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedFrame(frame.id)}
                    >
                      <div className="aspect-square bg-white/50 rounded-md flex items-center justify-center mb-2 p-2">
                        <div className="relative w-full h-full flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <User className="h-8 w-8 text-muted-foreground/20" />
                          </div>
                          <img 
                            src={frame.image} 
                            alt={frame.name} 
                            className="h-16 w-auto object-contain opacity-90"
                            style={{
                              filter: frame.id === 'frame2' ? 'none' : 'none'
                            }}
                          />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-center">{frame.name}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              {['rectangle', 'round', 'cat-eye'].map((type) => (
                <TabsContent key={type} value={type} className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {frameOptions
                      .filter(frame => frame.type === type)
                      .map((frame) => (
                        <div 
                          key={frame.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            selectedFrame === frame.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedFrame(frame.id)}
                        >
                          <div className="aspect-square bg-muted/30 rounded-md flex items-center justify-center mb-2">
                            <img 
                              src={frame.image} 
                              alt={frame.name} 
                              className="h-20 w-auto object-contain"
                            />
                          </div>
                          <p className="text-sm font-medium text-center">{frame.name}</p>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Tips for Best Results</h3>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Face the camera directly with good lighting</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Keep your head straight and shoulders level</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Adjust brightness and contrast for best visibility</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Try different frame styles to find your perfect look</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
