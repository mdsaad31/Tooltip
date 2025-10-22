import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Palette, Eye, Shuffle, Save } from 'lucide-react';
import { GlassCard, GlassButton, GlassPanel, GlassInput } from '../ui/GlassComponents';

interface ColorPickerProps {
  className?: string;
}

interface ColorFormat {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
}

interface SavedColor {
  id: string;
  color: string;
  name: string;
  timestamp: Date;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ className = '' }) => {
  const [currentColor, setCurrentColor] = useState<ColorFormat>({
    hex: '#3B82F6',
    rgb: { r: 59, g: 130, b: 246 },
    hsl: { h: 217, s: 91, l: 60 },
    hsv: { h: 217, s: 76, v: 96 }
  });

  const [inputValue, setInputValue] = useState('#3B82F6');
  const [savedColors, setSavedColors] = useState<SavedColor[]>([]);
  const [isEyeDropperSupported, setIsEyeDropperSupported] = useState(false);

  // Check if EyeDropper API is supported
  useEffect(() => {
    setIsEyeDropperSupported('EyeDropper' in window);
  }, []);

  // Load saved colors from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tooltip-saved-colors');
    if (saved) {
      try {
        setSavedColors(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved colors:', error);
      }
    }
  }, []);

  // Color conversion functions
  const hexToRgb = useCallback((hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }, []);



  const rgbToHsl = useCallback((r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }, []);

  const rgbToHsv = useCallback((r: number, g: number, b: number): { h: number; s: number; v: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    const s = max === 0 ? 0 : diff / max;
    const v = max;

    if (diff !== 0) {
      switch (max) {
        case r: h = (g - b) / diff + (g < b ? 6 : 0); break;
        case g: h = (b - r) / diff + 2; break;
        case b: h = (r - g) / diff + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    };
  }, []);

  const updateColor = useCallback((hex: string) => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

    setCurrentColor({ hex, rgb, hsl, hsv });
    setInputValue(hex);
  }, [hexToRgb, rgbToHsl, rgbToHsv]);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    
    // Validate hex color
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      updateColor(value);
    }
  }, [updateColor]);

  const generateRandomColor = useCallback(() => {
    const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    updateColor(randomHex);
  }, [updateColor]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  const saveColor = useCallback(() => {
    const newColor: SavedColor = {
      id: Date.now().toString(),
      color: currentColor.hex,
      name: `Color ${savedColors.length + 1}`,
      timestamp: new Date()
    };

    const updatedColors = [newColor, ...savedColors.slice(0, 19)]; // Keep last 20
    setSavedColors(updatedColors);
    localStorage.setItem('tooltip-saved-colors', JSON.stringify(updatedColors));
  }, [currentColor.hex, savedColors]);

  const useEyeDropper = useCallback(async () => {
    if (!isEyeDropperSupported) return;

    try {
      // @ts-ignore - EyeDropper is not in TypeScript types yet
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      updateColor(result.sRGBHex);
    } catch (error) {
      console.error('EyeDropper failed:', error);
    }
  }, [isEyeDropperSupported, updateColor]);

  // Generate color harmonies
  const generateHarmonies = useCallback(() => {
    const baseHue = currentColor.hsl.h;

    const harmonies = {
      complementary: [(baseHue + 180) % 360],
      triadic: [(baseHue + 120) % 360, (baseHue + 240) % 360],
      tetradic: [(baseHue + 90) % 360, (baseHue + 180) % 360, (baseHue + 270) % 360],
      analogous: [(baseHue + 30) % 360, (baseHue - 30 + 360) % 360],
      splitComplementary: [(baseHue + 150) % 360, (baseHue + 210) % 360],
    };

    return harmonies;
  }, [currentColor.hsl]);

  const hslToHex = useCallback((h: number, s: number, l: number): string => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }, []);

  // Check color contrast
  const getContrastRatio = useCallback((color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }) => {
    const getLuminance = (rgb: { r: number; g: number; b: number }) => {
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }, []);

  const harmonies = generateHarmonies();
  const whiteContrast = getContrastRatio(currentColor.rgb, { r: 255, g: 255, b: 255 });
  const blackContrast = getContrastRatio(currentColor.rgb, { r: 0, g: 0, b: 0 });

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <GlassPanel
        title="Color Picker & Tools"
        subtitle="Pick, generate, and analyze colors"
        icon={<Palette className="w-5 h-5" />}
        actions={
          <div className="flex space-x-2">
            <GlassButton
              variant="ghost"
              size="sm"
              icon={<Shuffle className="w-4 h-4" />}
              onClick={generateRandomColor}
            >
              Random
            </GlassButton>
            {isEyeDropperSupported && (
              <GlassButton
                variant="ghost"
                size="sm"
                icon={<Eye className="w-4 h-4" />}
                onClick={useEyeDropper}
              >
                Pick
              </GlassButton>
            )}
            <GlassButton
              variant="ghost"
              size="sm"
              icon={<Save className="w-4 h-4" />}
              onClick={saveColor}
            >
              Save
            </GlassButton>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Color Display & Input */}
          <div className="space-y-4">
            <GlassCard size="md">
              <div className="space-y-4">
                {/* Color Preview */}
                <div
                  className="w-full h-32 rounded-lg border-2 border-white/20"
                  style={{ backgroundColor: currentColor.hex }}
                />
                
                {/* Color Input */}
                <GlassInput
                  label="Hex Color"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="#3B82F6"
                />
                
                {/* Native Color Picker */}
                <input
                  type="color"
                  value={currentColor.hex}
                  onChange={(e) => updateColor(e.target.value)}
                  className="w-full h-12 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                />
              </div>
            </GlassCard>

            {/* Contrast Analysis */}
            <GlassCard size="sm">
              <div className="text-white/80 text-sm font-medium mb-3">Accessibility</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">vs White:</span>
                  <span className={`text-sm font-medium ${whiteContrast >= 4.5 ? 'text-green-400' : 'text-red-400'}`}>
                    {whiteContrast.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">vs Black:</span>
                  <span className={`text-sm font-medium ${blackContrast >= 4.5 ? 'text-green-400' : 'text-red-400'}`}>
                    {blackContrast.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-white/60 mt-2">
                  WCAG AA requires 4.5:1 for normal text
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Color Values */}
          <div className="space-y-4">
            <GlassCard size="md">
              <div className="text-white/80 text-sm font-medium mb-3">Color Values</div>
              <div className="space-y-3">
                {/* HEX */}
                <div className="flex justify-between items-center p-2 rounded bg-white/5">
                  <div>
                    <div className="text-white/70 text-xs">HEX</div>
                    <div className="text-white font-mono text-sm">{currentColor.hex}</div>
                  </div>
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    icon={<Copy className="w-3 h-3" />}
                    onClick={() => copyToClipboard(currentColor.hex)}
                  >
                    Copy
                  </GlassButton>
                </div>

                {/* RGB */}
                <div className="flex justify-between items-center p-2 rounded bg-white/5">
                  <div>
                    <div className="text-white/70 text-xs">RGB</div>
                    <div className="text-white font-mono text-sm">
                      rgb({currentColor.rgb.r}, {currentColor.rgb.g}, {currentColor.rgb.b})
                    </div>
                  </div>
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    icon={<Copy className="w-3 h-3" />}
                    onClick={() => copyToClipboard(`rgb(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b})`)}
                  >
                    Copy
                  </GlassButton>
                </div>

                {/* HSL */}
                <div className="flex justify-between items-center p-2 rounded bg-white/5">
                  <div>
                    <div className="text-white/70 text-xs">HSL</div>
                    <div className="text-white font-mono text-sm">
                      hsl({currentColor.hsl.h}°, {currentColor.hsl.s}%, {currentColor.hsl.l}%)
                    </div>
                  </div>
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    icon={<Copy className="w-3 h-3" />}
                    onClick={() => copyToClipboard(`hsl(${currentColor.hsl.h}, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%)`)}
                  >
                    Copy
                  </GlassButton>
                </div>

                {/* HSV */}
                <div className="flex justify-between items-center p-2 rounded bg-white/5">
                  <div>
                    <div className="text-white/70 text-xs">HSV</div>
                    <div className="text-white font-mono text-sm">
                      hsv({currentColor.hsv.h}°, {currentColor.hsv.s}%, {currentColor.hsv.v}%)
                    </div>
                  </div>
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    icon={<Copy className="w-3 h-3" />}
                    onClick={() => copyToClipboard(`hsv(${currentColor.hsv.h}, ${currentColor.hsv.s}%, ${currentColor.hsv.v}%)`)}
                  >
                    Copy
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Color Harmonies */}
          <div className="space-y-4">
            <GlassCard size="md">
              <div className="text-white/80 text-sm font-medium mb-3">Color Harmonies</div>
              <div className="space-y-3">
                {Object.entries(harmonies).map(([name, hues]) => (
                  <div key={name}>
                    <div className="text-white/70 text-xs mb-1 capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div className="flex space-x-1">
                      <div
                        className="w-8 h-8 rounded border border-white/20"
                        style={{ backgroundColor: currentColor.hex }}
                      />
                      {hues.map((hue, index) => {
                        const harmonyColor = hslToHex(hue, currentColor.hsl.s, currentColor.hsl.l);
                        return (
                          <div
                            key={index}
                            className="w-8 h-8 rounded border border-white/20 cursor-pointer hover:scale-110 transition-transform"
                            style={{ backgroundColor: harmonyColor }}
                            onClick={() => updateColor(harmonyColor)}
                            title={harmonyColor}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Saved Colors */}
            {savedColors.length > 0 && (
              <GlassCard size="md">
                <div className="text-white/80 text-sm font-medium mb-3">Saved Colors</div>
                <div className="grid grid-cols-5 gap-2">
                  {savedColors.slice(0, 15).map((savedColor) => (
                    <div
                      key={savedColor.id}
                      className="w-8 h-8 rounded border border-white/20 cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: savedColor.color }}
                      onClick={() => updateColor(savedColor.color)}
                      title={savedColor.color}
                    />
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};