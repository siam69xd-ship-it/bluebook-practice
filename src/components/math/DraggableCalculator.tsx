import { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { Calculator, Minus, X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DraggableCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DraggableCalculator({ isOpen, onClose }: DraggableCalculatorProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

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
          <div className="w-full h-[calc(100%-36px)] bg-white">
            <iframe
              src="https://www.desmos.com/calculator"
              className="w-full h-full border-0"
              title="Desmos Graphing Calculator"
              allow="clipboard-write"
            />
          </div>
        )}
      </div>
    </Draggable>
  );
}
