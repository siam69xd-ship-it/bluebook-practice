import { useState, useRef, useEffect, useCallback } from 'react';
import Draggable from 'react-draggable';
import { Calculator, Minus, X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DesmosCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

// Declare Desmos type
declare global {
  interface Window {
    Desmos?: {
      GraphingCalculator: (element: HTMLElement, options?: object) => any;
    };
    __desmosLoaded?: boolean;
    __desmosLoading?: boolean;
  }
}

// Preload Desmos script on module load
const preloadDesmos = () => {
  if (typeof window === 'undefined') return;
  if (window.Desmos || window.__desmosLoading) return;
  
  window.__desmosLoading = true;
  const script = document.createElement('script');
  script.src = 'https://www.desmos.com/api/v1.11/calculator.js?apiKey=0b62c38043de4a1d9d5670cebb383236';
  script.async = true;
  script.onload = () => {
    window.__desmosLoaded = true;
    window.__desmosLoading = false;
  };
  document.head.appendChild(script);
};

// Start preloading immediately
preloadDesmos();

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

export default function DesmosCalculator({ isOpen, onClose }: DesmosCalculatorProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isLoaded, setIsLoaded] = useState(!!window.Desmos);
  const [size, setSize] = useState({ width: 520, height: 480 });
  const [resizing, setResizing] = useState<ResizeDirection>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);
  const calculatorInstanceRef = useRef<any>(null);
  const startPosRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const MIN_WIDTH = 320;
  const MIN_HEIGHT = 280;
  const MAX_WIDTH = window.innerWidth - 100;
  const MAX_HEIGHT = window.innerHeight - 100;

  // Check if Desmos is already loaded
  useEffect(() => {
    if (!isOpen) return;
    
    if (window.Desmos) {
      setIsLoaded(true);
      return;
    }

    // If not loaded, preload it
    preloadDesmos();
    
    const checkLoaded = setInterval(() => {
      if (window.Desmos) {
        setIsLoaded(true);
        clearInterval(checkLoaded);
      }
    }, 50);

    return () => clearInterval(checkLoaded);
  }, [isOpen]);

  // Initialize calculator when loaded
  useEffect(() => {
    if (!isOpen || !isLoaded || !calculatorRef.current || isMinimized) return;
    
    // Clean up previous instance
    if (calculatorInstanceRef.current) {
      calculatorInstanceRef.current.destroy();
    }

    // Create new calculator instance
    if (window.Desmos && calculatorRef.current) {
      calculatorInstanceRef.current = window.Desmos.GraphingCalculator(calculatorRef.current, {
        keypad: true,
        expressions: true,
        settingsMenu: true,
        zoomButtons: true,
        expressionsTopbar: true,
        pointsOfInterest: true,
        trace: true,
        border: false,
        lockViewport: false,
        expressionsCollapsed: false,
        administerSecretFolders: false,
      });
    }

    return () => {
      if (calculatorInstanceRef.current) {
        calculatorInstanceRef.current.destroy();
        calculatorInstanceRef.current = null;
      }
    };
  }, [isOpen, isLoaded, isMinimized]);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: ResizeDirection) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(direction);
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    };
  }, [size]);

  // Handle resize move
  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;
      
      let newWidth = startPosRef.current.width;
      let newHeight = startPosRef.current.height;

      if (resizing.includes('e')) {
        newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startPosRef.current.width + deltaX));
      }
      if (resizing.includes('w')) {
        newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startPosRef.current.width - deltaX));
      }
      if (resizing.includes('s')) {
        newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startPosRef.current.height + deltaY));
      }
      if (resizing.includes('n')) {
        newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startPosRef.current.height - deltaY));
      }

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  // Preset sizes
  const setPresetSize = (preset: 'small' | 'medium' | 'large') => {
    const sizes = {
      small: { width: 400, height: 350 },
      medium: { width: 520, height: 480 },
      large: { width: 700, height: 600 }
    };
    setSize(sizes[preset]);
    setIsMaximized(false);
  };

  if (!isOpen) return null;

  const currentSize = isMaximized 
    ? { width: window.innerWidth * 0.8, height: window.innerHeight * 0.8 }
    : size;

  return (
    <Draggable 
      handle=".calculator-header" 
      nodeRef={nodeRef}
      bounds="parent"
      defaultPosition={{ x: 100, y: 50 }}
      disabled={isMaximized || !!resizing}
    >
      <div
        ref={nodeRef}
        className={`fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden ${isMaximized ? 'inset-[10%]' : ''}`}
        style={isMaximized ? {} : { 
          width: currentSize.width, 
          height: isMinimized ? 'auto' : currentSize.height 
        }}
      >
        {/* Header */}
        <div className="calculator-header flex items-center justify-between px-3 py-2 bg-[#2d3e50] text-white cursor-move select-none">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            <span className="text-sm font-medium">Graphing Calculator</span>
          </div>
          <div className="flex items-center gap-1">
            {/* Preset Size Buttons */}
            <div className="flex items-center gap-0.5 mr-2 border-r border-white/30 pr-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-[10px] text-white hover:bg-white/20"
                onClick={() => setPresetSize('small')}
                title="Small"
              >
                S
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-[10px] text-white hover:bg-white/20"
                onClick={() => setPresetSize('medium')}
                title="Medium"
              >
                M
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-[10px] text-white hover:bg-white/20"
                onClick={() => setPresetSize('large')}
                title="Large"
              >
                L
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-white/20"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-white/20"
              onClick={() => setIsMaximized(!isMaximized)}
            >
              {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-white/20 hover:bg-red-500"
              onClick={onClose}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Calculator Body */}
        {!isMinimized && (
          <div 
            ref={calculatorRef}
            className="w-full bg-white relative"
            style={{ height: 'calc(100% - 36px)' }}
          >
            {!isLoaded && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading calculator...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resize Handles */}
        {!isMinimized && !isMaximized && (
          <>
            {/* Edge handles */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1.5 cursor-n-resize hover:bg-blue-400/50 transition-colors"
              onMouseDown={(e) => handleResizeStart(e, 'n')}
            />
            <div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1.5 cursor-s-resize hover:bg-blue-400/50 transition-colors"
              onMouseDown={(e) => handleResizeStart(e, 's')}
            />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-20 cursor-w-resize hover:bg-blue-400/50 transition-colors"
              onMouseDown={(e) => handleResizeStart(e, 'w')}
            />
            <div 
              className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-20 cursor-e-resize hover:bg-blue-400/50 transition-colors"
              onMouseDown={(e) => handleResizeStart(e, 'e')}
            />
            {/* Corner handles */}
            <div 
              className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize hover:bg-blue-400/50 transition-colors"
              onMouseDown={(e) => handleResizeStart(e, 'nw')}
            />
            <div 
              className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize hover:bg-blue-400/50 transition-colors"
              onMouseDown={(e) => handleResizeStart(e, 'ne')}
            />
            <div 
              className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize hover:bg-blue-400/50 transition-colors"
              onMouseDown={(e) => handleResizeStart(e, 'sw')}
            />
            <div 
              className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize hover:bg-blue-400/50 transition-colors"
              onMouseDown={(e) => handleResizeStart(e, 'se')}
            />
          </>
        )}
      </div>
    </Draggable>
  );
}
