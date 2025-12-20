import { useState, useRef, useEffect } from 'react';
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
  }
}

export default function DesmosCalculator({ isOpen, onClose }: DesmosCalculatorProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);
  const calculatorInstanceRef = useRef<any>(null);

  // Load Desmos API script
  useEffect(() => {
    if (!isOpen) return;
    
    // Check if script already loaded
    if (window.Desmos) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.desmos.com/api/v1.11/calculator.js?apiKey=0b62c38043de4a1d9d5670cebb383236';
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Don't remove script as it may be used later
    };
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

  if (!isOpen) return null;

  const calculatorSize = isMaximized 
    ? { width: '80vw', height: '80vh' }
    : { width: '520px', height: '480px' };

  return (
    <Draggable 
      handle=".calculator-header" 
      nodeRef={nodeRef}
      bounds="parent"
      defaultPosition={{ x: 100, y: 50 }}
      disabled={isMaximized}
    >
      <div
        ref={nodeRef}
        className={`fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden ${isMaximized ? 'inset-[10%]' : ''}`}
        style={isMaximized ? {} : { width: calculatorSize.width, height: isMinimized ? 'auto' : calculatorSize.height }}
      >
        {/* Header */}
        <div className="calculator-header flex items-center justify-between px-3 py-2 bg-[#2d3e50] text-white cursor-move select-none">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            <span className="text-sm font-medium">Graphing Calculator</span>
          </div>
          <div className="flex items-center gap-1">
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
            className="w-full bg-white"
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
      </div>
    </Draggable>
  );
}
