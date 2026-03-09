import { useState, useRef, useEffect, useCallback } from 'react';
import Draggable from 'react-draggable';
import { Calculator, Minus, X, Maximize2, Minimize2, GripHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DesmosCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    Desmos?: {
      GraphingCalculator: (element: HTMLElement, options?: object) => any;
    };
    __desmosLoaded?: boolean;
    __desmosLoading?: boolean;
  }
}

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

preloadDesmos();

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

export default function DesmosCalculator({ isOpen, onClose }: DesmosCalculatorProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isLoaded, setIsLoaded] = useState(!!window.Desmos);
  const [size, setSize] = useState({ width: 580, height: 520 });
  const [resizing, setResizing] = useState<ResizeDirection>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);
  const calculatorInstanceRef = useRef<any>(null);
  const startPosRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const MIN_WIDTH = 360;
  const MIN_HEIGHT = 320;
  const MAX_WIDTH = window.innerWidth - 80;
  const MAX_HEIGHT = window.innerHeight - 80;

  useEffect(() => {
    if (!isOpen) return;
    if (window.Desmos) { setIsLoaded(true); return; }
    preloadDesmos();
    const checkLoaded = setInterval(() => {
      if (window.Desmos) { setIsLoaded(true); clearInterval(checkLoaded); }
    }, 50);
    return () => clearInterval(checkLoaded);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isLoaded || !calculatorRef.current || isMinimized) return;
    if (calculatorInstanceRef.current) calculatorInstanceRef.current.destroy();
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

  const handleResizeStart = useCallback((e: React.MouseEvent, direction: ResizeDirection) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(direction);
    startPosRef.current = { x: e.clientX, y: e.clientY, width: size.width, height: size.height };
  }, [size]);

  useEffect(() => {
    if (!resizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;
      let newWidth = startPosRef.current.width;
      let newHeight = startPosRef.current.height;
      if (resizing.includes('e')) newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startPosRef.current.width + deltaX));
      if (resizing.includes('w')) newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startPosRef.current.width - deltaX));
      if (resizing.includes('s')) newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startPosRef.current.height + deltaY));
      if (resizing.includes('n')) newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startPosRef.current.height - deltaY));
      setSize({ width: newWidth, height: newHeight });
    };
    const handleMouseUp = () => setResizing(null);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  const handleMaximizeToggle = () => {
    if (isMinimized) setIsMinimized(false);
    setIsMaximized(!isMaximized);
  };

  if (!isOpen) return null;

  const currentSize = isMaximized
    ? { width: window.innerWidth * 0.85, height: window.innerHeight * 0.85 }
    : size;

  return (
    <AnimatePresence>
      <Draggable
        handle=".calculator-drag-handle"
        nodeRef={nodeRef}
        bounds="parent"
        defaultPosition={{ x: 80, y: 40 }}
        disabled={isMaximized || !!resizing}
      >
        <div ref={nodeRef} className="fixed z-50" style={{ pointerEvents: 'auto' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              width: isMaximized ? currentSize.width : undefined,
              height: isMinimized ? 'auto' : (isMaximized ? currentSize.height : undefined),
            }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`
              bg-background rounded-xl overflow-hidden
              border border-border
              ${isMaximized ? '' : ''}
            `}
            style={{
              width: isMaximized ? currentSize.width : currentSize.width,
              height: isMinimized ? 'auto' : currentSize.height,
              boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Bluebook-style Header */}
            <div className="calculator-drag-handle flex items-center justify-between h-10 px-3 bg-foreground select-none cursor-move">
              <div className="flex items-center gap-2.5">
                <GripHorizontal className="w-3.5 h-3.5 text-background/40" />
                <div className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-background/80" />
                  <span className="text-xs font-medium text-background/90 tracking-wide uppercase">
                    Graphing Calculator
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                {/* Window Controls */}
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="flex items-center justify-center w-7 h-7 rounded-md text-background/60 hover:text-background hover:bg-background/10 transition-colors duration-150"
                  title={isMinimized ? 'Restore' : 'Minimize'}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleMaximizeToggle}
                  className="flex items-center justify-center w-7 h-7 rounded-md text-background/60 hover:text-background hover:bg-background/10 transition-colors duration-150"
                  title={isMaximized ? 'Restore' : 'Maximize'}
                >
                  {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-7 h-7 rounded-md text-background/60 hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.15)] transition-colors duration-150"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Calculator Body */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'calc(100% - 40px)', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div
                    ref={calculatorRef}
                    className="w-full h-full bg-background relative"
                  >
                    {!isLoaded && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto mb-3" />
                          <p className="text-xs text-muted-foreground font-medium">Loading calculator…</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Resize Handles - invisible but functional */}
            {!isMinimized && !isMaximized && (
              <>
                <div className="absolute top-0 left-4 right-4 h-1 cursor-n-resize" onMouseDown={(e) => handleResizeStart(e, 'n')} />
                <div className="absolute bottom-0 left-4 right-4 h-1 cursor-s-resize" onMouseDown={(e) => handleResizeStart(e, 's')} />
                <div className="absolute left-0 top-4 bottom-4 w-1 cursor-w-resize" onMouseDown={(e) => handleResizeStart(e, 'w')} />
                <div className="absolute right-0 top-4 bottom-4 w-1 cursor-e-resize" onMouseDown={(e) => handleResizeStart(e, 'e')} />
                <div className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
                <div className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
                <div className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
                <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize" onMouseDown={(e) => handleResizeStart(e, 'se')} />
              </>
            )}
          </motion.div>
        </div>
      </Draggable>
    </AnimatePresence>
  );
}
