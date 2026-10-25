"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Check, 
  X, 
  Move
} from "lucide-react";

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete
}) {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  
  // Transform states
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(0.5);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270

  // Dragging states
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastTouchDistRef = useRef(null);

  // Load image when imageSrc changes
  useEffect(() => {
    if (!imageSrc || !isOpen) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
      // Auto calculate initial zoom so the image nicely fills or fits the 600x600 canvas
      const maxDim = Math.max(img.width, img.height);
      const minDim = Math.min(img.width, img.height);
      
      // Calculate fit scale: cover square
      const coverScale = 600 / minDim;
      const containScale = 600 / maxDim;
      
      setZoom(coverScale);
      setMinZoom(Math.max(0.2, containScale * 0.7));
      setPan({ x: 0, y: 0 });
      setRotation(0);
    };
    img.src = imageSrc;
  }, [imageSrc, isOpen]);

  // Draw on canvas whenever image, zoom, pan, or rotation changes
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;   // 600
    const height = canvas.height; // 600

    // Clear and fill with clean white background (standard for product images)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    // Move to center of canvas
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    
    // Rotate
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Scale
    ctx.scale(zoom, zoom);

    // Draw image centered at origin
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    
    ctx.restore();
  }, [image, zoom, pan, rotation]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // Helper to convert screen pixels to canvas 600x600 coordinates
  const getCanvasScaleRatio = () => {
    if (!canvasRef.current) return 1;
    const rect = canvasRef.current.getBoundingClientRect();
    return 600 / (rect.width || 300);
  };

  // Mouse handlers for desktop
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const ratio = getCanvasScaleRatio();
    const dx = (e.clientX - dragStartRef.current.x) * ratio;
    const dy = (e.clientY - dragStartRef.current.y) * ratio;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    setPan(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastTouchDistRef.current = null;
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistRef.current = dist;
    }
  };

  const handleTouchMove = (e) => {
    if (e.cancelable) e.preventDefault(); // prevent background page scrolling while framing

    if (e.touches.length === 1 && isDragging) {
      const ratio = getCanvasScaleRatio();
      const dx = (e.touches[0].clientX - dragStartRef.current.x) * ratio;
      const dy = (e.touches[0].clientY - dragStartRef.current.y) * ratio;
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      setPan(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
    } else if (e.touches.length === 2 && lastTouchDistRef.current) {
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = newDist / lastTouchDistRef.current;
      lastTouchDistRef.current = newDist;
      setZoom(prev => Math.min(Math.max(prev * factor, minZoom), 5));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchDistRef.current = null;
  };

  // Rotation
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Reset / Center fit
  const handleReset = () => {
    if (!image) return;
    const maxDim = Math.max(image.width, image.height);
    const minDim = Math.min(image.width, image.height);
    const coverScale = 600 / minDim;
    setZoom(coverScale);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  // Zoom buttons
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.15, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.15, minZoom));
  };

  // Confirm crop
  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export directly to JPEG 0.85 (Produces ~40-60KB high quality 600x600 image in ~10ms)
    canvas.toBlob((blob) => {
      if (!blob) {
        onClose();
        return;
      }
      const sizeKb = Math.round(blob.size / 1024);
      const file = new File([blob], "product.jpg", { type: "image/jpeg" });
      const previewUrl = URL.createObjectURL(blob);
      onCropComplete(file, previewUrl, sizeKb);
      onClose();
    }, "image/jpeg", 0.85);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b bg-gray-50/70">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Crop & Fit Product Image</h3>
            <p className="text-xs text-gray-500">Square frame me image ko drag aur zoom karein</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-200/60 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Square Frame Viewport */}
        <div className="p-4 flex flex-col items-center bg-gray-100 select-none">
          <div 
            className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] bg-slate-900 rounded-xl overflow-hidden shadow-inner border-2 border-green-500 cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* The live rendering canvas */}
            <canvas 
              ref={canvasRef} 
              width={600} 
              height={600} 
              className="w-full h-full object-contain pointer-events-none"
            />

            {/* Grid overlay guidelines (rule of thirds) */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
              <div className="border-r border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-b border-white/20"></div>
              <div className="border-r border-white/20"></div>
              <div className="border-r border-white/20"></div>
              <div></div>
            </div>

            {/* Drag helper hint */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-center pointer-events-none">
              <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Move className="w-3 h-3" /> Drag image to position
              </span>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 mt-2 text-center">
            Photo ko square ke andar set karein taki website par perfect dikhe.
          </p>
        </div>

        {/* Controls Toolbar */}
        <div className="p-4 space-y-3 bg-white border-t">
          {/* Zoom slider & quick buttons */}
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 shrink-0 rounded-lg" 
              onClick={handleZoomOut} 
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <input 
              type="range"
              min={minZoom}
              max={Math.max(minZoom * 3, 3.5)}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-green-600 cursor-pointer h-2 bg-gray-200 rounded-lg"
            />

            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 shrink-0 rounded-lg" 
              onClick={handleZoomIn} 
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 shrink-0 rounded-lg text-gray-700" 
              onClick={handleRotate} 
              title="Rotate 90 degrees"
            >
              <RotateCw className="h-4 w-4" />
            </Button>

            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 shrink-0 rounded-lg text-gray-700" 
              onClick={handleReset} 
              title="Center & Fit"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="px-5 py-3.5 bg-gray-50 border-t flex items-center justify-between gap-3">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            Cancel
          </Button>
          
          <Button 
            type="button" 
            onClick={handleApply}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 flex items-center gap-1.5 shadow-sm"
          >
            <Check className="h-4 w-4" /> Set Image
          </Button>
        </div>
      </div>
    </div>
  );
}
