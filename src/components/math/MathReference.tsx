import { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { BookOpen, Minus, X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MathReferenceProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MathReference({ isOpen, onClose }: MathReferenceProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  return (
    <Draggable 
      handle=".reference-header" 
      nodeRef={nodeRef}
      bounds="parent"
      defaultPosition={{ x: 200, y: 80 }}
      disabled={isMaximized}
    >
      <div
        ref={nodeRef}
        className={`fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden ${isMaximized ? 'inset-[10%]' : ''}`}
        style={isMaximized ? {} : { width: '400px', height: isMinimized ? 'auto' : '500px' }}
      >
        {/* Header */}
        <div className="reference-header flex items-center justify-between px-3 py-2 bg-[#2d3e50] text-white cursor-move select-none">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">Reference Sheet</span>
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

        {/* Reference Content */}
        {!isMinimized && (
          <ScrollArea className="w-full h-[calc(100%-36px)] p-4">
            <div className="space-y-6 font-serif text-sm">
              {/* Circle */}
              <div className="border-b pb-4">
                <h3 className="font-bold text-base mb-2">Circle</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Area</p>
                    <p className="text-lg">A = πr²</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Circumference</p>
                    <p className="text-lg">C = 2πr</p>
                  </div>
                </div>
              </div>

              {/* Rectangle */}
              <div className="border-b pb-4">
                <h3 className="font-bold text-base mb-2">Rectangle</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Area</p>
                    <p className="text-lg">A = lw</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Perimeter</p>
                    <p className="text-lg">P = 2l + 2w</p>
                  </div>
                </div>
              </div>

              {/* Triangle */}
              <div className="border-b pb-4">
                <h3 className="font-bold text-base mb-2">Triangle</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Area</p>
                    <p className="text-lg">A = ½bh</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Pythagorean</p>
                    <p className="text-lg">a² + b² = c²</p>
                  </div>
                </div>
              </div>

              {/* Special Right Triangles */}
              <div className="border-b pb-4">
                <h3 className="font-bold text-base mb-2">Special Right Triangles</h3>
                <div className="space-y-2">
                  <p><strong>45-45-90:</strong> x : x : x√2</p>
                  <p><strong>30-60-90:</strong> x : x√3 : 2x</p>
                </div>
              </div>

              {/* Volume Formulas */}
              <div className="border-b pb-4">
                <h3 className="font-bold text-base mb-2">Volume</h3>
                <div className="space-y-2">
                  <p><strong>Rectangular Prism:</strong> V = lwh</p>
                  <p><strong>Cylinder:</strong> V = πr²h</p>
                  <p><strong>Sphere:</strong> V = (4/3)πr³</p>
                  <p><strong>Cone:</strong> V = (1/3)πr²h</p>
                  <p><strong>Pyramid:</strong> V = (1/3)Bh</p>
                </div>
              </div>

              {/* Quadratic */}
              <div className="border-b pb-4">
                <h3 className="font-bold text-base mb-2">Quadratic Formula</h3>
                <p className="text-lg">x = (-b ± √(b²-4ac)) / 2a</p>
              </div>

              {/* Lines */}
              <div className="border-b pb-4">
                <h3 className="font-bold text-base mb-2">Lines</h3>
                <div className="space-y-2">
                  <p><strong>Slope:</strong> m = (y₂-y₁)/(x₂-x₁)</p>
                  <p><strong>Slope-Intercept:</strong> y = mx + b</p>
                  <p><strong>Point-Slope:</strong> y - y₁ = m(x - x₁)</p>
                </div>
              </div>

              {/* Radians */}
              <div>
                <h3 className="font-bold text-base mb-2">Radians & Degrees</h3>
                <div className="space-y-2">
                  <p>180° = π radians</p>
                  <p>Arc length: s = rθ</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </div>
    </Draggable>
  );
}
