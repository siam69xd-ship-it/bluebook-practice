import { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { BookOpen, Minus, X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MathReferenceSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MathReferenceSheet({ isOpen, onClose }: MathReferenceSheetProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const sheetSize = isMaximized 
    ? { width: '80vw', height: '80vh' }
    : { width: '480px', height: '600px' };

  return (
    <Draggable 
      handle=".reference-header" 
      nodeRef={nodeRef}
      bounds="parent"
      defaultPosition={{ x: 150, y: 80 }}
      disabled={isMaximized}
    >
      <div
        ref={nodeRef}
        className={`fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden ${isMaximized ? 'inset-[10%]' : ''}`}
        style={isMaximized ? {} : { width: sheetSize.width, height: isMinimized ? 'auto' : sheetSize.height }}
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
          <div className="w-full h-[calc(100%-36px)] overflow-y-auto p-4 bg-white">
            <div className="space-y-6 text-sm">
              {/* Geometry Formulas */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 border-b pb-1">Geometry</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-700">Circle</p>
                    <p className="text-gray-600">Area: A = πr²</p>
                    <p className="text-gray-600">Circumference: C = 2πr</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Rectangle</p>
                    <p className="text-gray-600">Area: A = lw</p>
                    <p className="text-gray-600">Perimeter: P = 2l + 2w</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Triangle</p>
                    <p className="text-gray-600">Area: A = ½bh</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Right Triangle</p>
                    <p className="text-gray-600">Pythagorean: a² + b² = c²</p>
                  </div>
                </div>
              </section>

              {/* Special Right Triangles */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 border-b pb-1">Special Right Triangles</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-700">45-45-90</p>
                    <p className="text-gray-600">Sides: x : x : x√2</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">30-60-90</p>
                    <p className="text-gray-600">Sides: x : x√3 : 2x</p>
                  </div>
                </div>
              </section>

              {/* Volume Formulas */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 border-b pb-1">Volume</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-700">Rectangular Prism</p>
                    <p className="text-gray-600">V = lwh</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Cylinder</p>
                    <p className="text-gray-600">V = πr²h</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Sphere</p>
                    <p className="text-gray-600">V = (4/3)πr³</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Cone</p>
                    <p className="text-gray-600">V = (1/3)πr²h</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Pyramid</p>
                    <p className="text-gray-600">V = (1/3)Bh</p>
                  </div>
                </div>
              </section>

              {/* Algebra */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 border-b pb-1">Algebra</h3>
                <div className="space-y-2">
                  <div>
                    <p className="font-medium text-gray-700">Slope-Intercept Form</p>
                    <p className="text-gray-600">y = mx + b</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Point-Slope Form</p>
                    <p className="text-gray-600">y - y₁ = m(x - x₁)</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Slope Formula</p>
                    <p className="text-gray-600">m = (y₂ - y₁) / (x₂ - x₁)</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Quadratic Formula</p>
                    <p className="text-gray-600">x = (-b ± √(b² - 4ac)) / 2a</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Standard Form of Circle</p>
                    <p className="text-gray-600">(x - h)² + (y - k)² = r²</p>
                  </div>
                </div>
              </section>

              {/* Trigonometry */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 border-b pb-1">Trigonometry</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">sin θ = opposite / hypotenuse</p>
                  <p className="text-gray-600">cos θ = adjacent / hypotenuse</p>
                  <p className="text-gray-600">tan θ = opposite / adjacent</p>
                </div>
              </section>

              {/* Statistics */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 border-b pb-1">Statistics</h3>
                <div className="space-y-2">
                  <div>
                    <p className="font-medium text-gray-700">Mean</p>
                    <p className="text-gray-600">Sum of values / Number of values</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Probability</p>
                    <p className="text-gray-600">P(E) = Number of favorable outcomes / Total outcomes</p>
                  </div>
                </div>
              </section>

              {/* Constants */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 border-b pb-1">Constants</h3>
                <div className="space-y-1">
                  <p className="text-gray-600">π ≈ 3.14159</p>
                  <p className="text-gray-600">Number of degrees in a circle: 360°</p>
                  <p className="text-gray-600">Number of radians in a circle: 2π</p>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </Draggable>
  );
}
