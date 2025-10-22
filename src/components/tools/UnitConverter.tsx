import React, { useState, useCallback } from 'react';
import { ArrowRightLeft, Search } from 'lucide-react';
import { GlassCard, GlassButton, GlassPanel, GlassInput } from '../ui/GlassComponents';

interface UnitConverterProps {
  className?: string;
}

interface Unit {
  name: string;
  symbol: string;
  toBase: number; // Factor to convert to base unit
  fromBase: number; // Factor to convert from base unit
}

interface UnitCategory {
  name: string;
  baseUnit: string;
  units: Unit[];
}

export const UnitConverter: React.FC<UnitConverterProps> = ({ className = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [fromValue, setFromValue] = useState('1');
  const [toValue, setToValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Unit conversion data
  const categories: Record<string, UnitCategory> = {
    length: {
      name: 'Length',
      baseUnit: 'meter',
      units: [
        { name: 'Millimeter', symbol: 'mm', toBase: 0.001, fromBase: 1000 },
        { name: 'Centimeter', symbol: 'cm', toBase: 0.01, fromBase: 100 },
        { name: 'Meter', symbol: 'm', toBase: 1, fromBase: 1 },
        { name: 'Kilometer', symbol: 'km', toBase: 1000, fromBase: 0.001 },
        { name: 'Inch', symbol: 'in', toBase: 0.0254, fromBase: 39.3701 },
        { name: 'Foot', symbol: 'ft', toBase: 0.3048, fromBase: 3.28084 },
        { name: 'Yard', symbol: 'yd', toBase: 0.9144, fromBase: 1.09361 },
        { name: 'Mile', symbol: 'mi', toBase: 1609.34, fromBase: 0.000621371 },
        { name: 'Nautical Mile', symbol: 'nmi', toBase: 1852, fromBase: 0.000539957 },
      ]
    },
    weight: {
      name: 'Weight',
      baseUnit: 'kilogram',
      units: [
        { name: 'Milligram', symbol: 'mg', toBase: 0.000001, fromBase: 1000000 },
        { name: 'Gram', symbol: 'g', toBase: 0.001, fromBase: 1000 },
        { name: 'Kilogram', symbol: 'kg', toBase: 1, fromBase: 1 },
        { name: 'Ton', symbol: 't', toBase: 1000, fromBase: 0.001 },
        { name: 'Ounce', symbol: 'oz', toBase: 0.0283495, fromBase: 35.274 },
        { name: 'Pound', symbol: 'lb', toBase: 0.453592, fromBase: 2.20462 },
        { name: 'Stone', symbol: 'st', toBase: 6.35029, fromBase: 0.157473 },
      ]
    },
    temperature: {
      name: 'Temperature',
      baseUnit: 'celsius',
      units: [
        { name: 'Celsius', symbol: '°C', toBase: 1, fromBase: 1 },
        { name: 'Fahrenheit', symbol: '°F', toBase: 1, fromBase: 1 }, // Special handling
        { name: 'Kelvin', symbol: 'K', toBase: 1, fromBase: 1 }, // Special handling
        { name: 'Rankine', symbol: '°R', toBase: 1, fromBase: 1 }, // Special handling
      ]
    },
    volume: {
      name: 'Volume',
      baseUnit: 'liter',
      units: [
        { name: 'Milliliter', symbol: 'ml', toBase: 0.001, fromBase: 1000 },
        { name: 'Liter', symbol: 'l', toBase: 1, fromBase: 1 },
        { name: 'Cubic Meter', symbol: 'm³', toBase: 1000, fromBase: 0.001 },
        { name: 'Fluid Ounce (US)', symbol: 'fl oz', toBase: 0.0295735, fromBase: 33.814 },
        { name: 'Cup (US)', symbol: 'cup', toBase: 0.236588, fromBase: 4.22675 },
        { name: 'Pint (US)', symbol: 'pt', toBase: 0.473176, fromBase: 2.11338 },
        { name: 'Quart (US)', symbol: 'qt', toBase: 0.946353, fromBase: 1.05669 },
        { name: 'Gallon (US)', symbol: 'gal', toBase: 3.78541, fromBase: 0.264172 },
        { name: 'Gallon (UK)', symbol: 'gal (UK)', toBase: 4.54609, fromBase: 0.219969 },
      ]
    },
    area: {
      name: 'Area',
      baseUnit: 'square meter',
      units: [
        { name: 'Square Millimeter', symbol: 'mm²', toBase: 0.000001, fromBase: 1000000 },
        { name: 'Square Centimeter', symbol: 'cm²', toBase: 0.0001, fromBase: 10000 },
        { name: 'Square Meter', symbol: 'm²', toBase: 1, fromBase: 1 },
        { name: 'Square Kilometer', symbol: 'km²', toBase: 1000000, fromBase: 0.000001 },
        { name: 'Square Inch', symbol: 'in²', toBase: 0.00064516, fromBase: 1550 },
        { name: 'Square Foot', symbol: 'ft²', toBase: 0.092903, fromBase: 10.7639 },
        { name: 'Square Yard', symbol: 'yd²', toBase: 0.836127, fromBase: 1.19599 },
        { name: 'Acre', symbol: 'ac', toBase: 4046.86, fromBase: 0.000247105 },
        { name: 'Hectare', symbol: 'ha', toBase: 10000, fromBase: 0.0001 },
      ]
    },
    speed: {
      name: 'Speed',
      baseUnit: 'meters per second',
      units: [
        { name: 'Meters per Second', symbol: 'm/s', toBase: 1, fromBase: 1 },
        { name: 'Kilometers per Hour', symbol: 'km/h', toBase: 0.277778, fromBase: 3.6 },
        { name: 'Miles per Hour', symbol: 'mph', toBase: 0.44704, fromBase: 2.23694 },
        { name: 'Feet per Second', symbol: 'ft/s', toBase: 0.3048, fromBase: 3.28084 },
        { name: 'Knots', symbol: 'kn', toBase: 0.514444, fromBase: 1.94384 },
        { name: 'Mach', symbol: 'M', toBase: 343, fromBase: 0.00291545 },
      ]
    },
    time: {
      name: 'Time',
      baseUnit: 'second',
      units: [
        { name: 'Nanosecond', symbol: 'ns', toBase: 0.000000001, fromBase: 1000000000 },
        { name: 'Microsecond', symbol: 'μs', toBase: 0.000001, fromBase: 1000000 },
        { name: 'Millisecond', symbol: 'ms', toBase: 0.001, fromBase: 1000 },
        { name: 'Second', symbol: 's', toBase: 1, fromBase: 1 },
        { name: 'Minute', symbol: 'min', toBase: 60, fromBase: 0.0166667 },
        { name: 'Hour', symbol: 'h', toBase: 3600, fromBase: 0.000277778 },
        { name: 'Day', symbol: 'd', toBase: 86400, fromBase: 0.0000115741 },
        { name: 'Week', symbol: 'wk', toBase: 604800, fromBase: 0.00000165344 },
        { name: 'Month', symbol: 'mo', toBase: 2629746, fromBase: 3.80265e-7 },
        { name: 'Year', symbol: 'yr', toBase: 31556952, fromBase: 3.16888e-8 },
      ]
    },
    digital: {
      name: 'Digital Storage',
      baseUnit: 'byte',
      units: [
        { name: 'Bit', symbol: 'bit', toBase: 0.125, fromBase: 8 },
        { name: 'Byte', symbol: 'B', toBase: 1, fromBase: 1 },
        { name: 'Kilobyte', symbol: 'KB', toBase: 1000, fromBase: 0.001 },
        { name: 'Megabyte', symbol: 'MB', toBase: 1000000, fromBase: 0.000001 },
        { name: 'Gigabyte', symbol: 'GB', toBase: 1000000000, fromBase: 1e-9 },
        { name: 'Terabyte', symbol: 'TB', toBase: 1000000000000, fromBase: 1e-12 },
        { name: 'Kibibyte', symbol: 'KiB', toBase: 1024, fromBase: 0.0009765625 },
        { name: 'Mebibyte', symbol: 'MiB', toBase: 1048576, fromBase: 9.53674e-7 },
        { name: 'Gibibyte', symbol: 'GiB', toBase: 1073741824, fromBase: 9.31323e-10 },
        { name: 'Tebibyte', symbol: 'TiB', toBase: 1099511627776, fromBase: 9.09495e-13 },
      ]
    }
  };

  // Special conversion for temperature
  const convertTemperature = useCallback((value: number, from: string, to: string): number => {
    let celsius = value;
    
    // Convert to Celsius first
    switch (from) {
      case 'Fahrenheit':
        celsius = (value - 32) * 5/9;
        break;
      case 'Kelvin':
        celsius = value - 273.15;
        break;
      case 'Rankine':
        celsius = (value - 491.67) * 5/9;
        break;
    }
    
    // Convert from Celsius to target
    switch (to) {
      case 'Celsius':
        return celsius;
      case 'Fahrenheit':
        return celsius * 9/5 + 32;
      case 'Kelvin':
        return celsius + 273.15;
      case 'Rankine':
        return celsius * 9/5 + 491.67;
      default:
        return celsius;
    }
  }, []);

  const performConversion = useCallback(() => {
    const numValue = parseFloat(fromValue);
    if (isNaN(numValue) || !fromUnit || !toUnit) {
      setToValue('');
      return;
    }

    const category = categories[selectedCategory];
    const fromUnitData = category.units.find(u => u.name === fromUnit);
    const toUnitData = category.units.find(u => u.name === toUnit);

    if (!fromUnitData || !toUnitData) {
      setToValue('');
      return;
    }

    let result: number;

    if (selectedCategory === 'temperature') {
      result = convertTemperature(numValue, fromUnit, toUnit);
    } else {
      // Convert to base unit, then to target unit
      const baseValue = numValue * fromUnitData.toBase;
      result = baseValue * toUnitData.fromBase;
    }

    // Format result with appropriate precision
    const formatted = result.toPrecision(10).replace(/\.?0+$/, '');
    setToValue(formatted);
  }, [fromValue, fromUnit, toUnit, selectedCategory, categories, convertTemperature]);

  // Auto-convert when values change
  React.useEffect(() => {
    performConversion();
  }, [performConversion]);

  // Initialize default units when category changes
  React.useEffect(() => {
    const category = categories[selectedCategory];
    if (category.units.length >= 2) {
      setFromUnit(category.units[0].name);
      setToUnit(category.units[1].name);
    }
    setSearchQuery('');
  }, [selectedCategory, categories]);

  const swapUnits = useCallback(() => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromValue(toValue);
  }, [fromUnit, toUnit, toValue]);

  // Filter units based on search
  const filteredUnits = categories[selectedCategory].units.filter(unit =>
    unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <GlassPanel
        title="Unit Converter"
        subtitle="Convert between different units of measurement"
        icon={<ArrowRightLeft className="w-5 h-5" />}
        actions={
          <div className="flex flex-wrap gap-2">
            {Object.entries(categories).map(([key, category]) => (
              <GlassButton
                key={key}
                variant={selectedCategory === key ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(key)}
              >
                {category.name}
              </GlassButton>
            ))}
          </div>
        }
      >
        <div className="space-y-6">
          {/* Conversion Input */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            {/* From Value */}
            <div className="md:col-span-2">
              <GlassInput
                label="From"
                placeholder="Enter value"
                value={fromValue}
                onChange={(e) => setFromValue(e.target.value)}
                type="number"
              />
              <div className="mt-2">
                <select
                  className="w-full backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                >
                  {categories[selectedCategory].units.map(unit => (
                    <option key={unit.name} value={unit.name}>
                      {unit.name} ({unit.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <GlassButton
                variant="ghost"
                icon={<ArrowRightLeft className="w-4 h-4" />}
                onClick={swapUnits}
              >
                Swap
              </GlassButton>
            </div>

            {/* To Value */}
            <div className="md:col-span-2">
              <GlassInput
                label="To"
                placeholder="Result"
                value={toValue}
                readOnly
                className="bg-white/5"
              />
              <div className="mt-2">
                <select
                  className="w-full backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                >
                  {categories[selectedCategory].units.map(unit => (
                    <option key={unit.name} value={unit.name}>
                      {unit.name} ({unit.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Unit Search */}
          <div className="flex justify-center">
            <div className="relative max-w-md w-full">
              <GlassInput
                placeholder="Search units..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
            </div>
          </div>

          {/* Quick Conversion Table */}
          <GlassCard>
            <div className="text-white/80 text-lg font-medium mb-4">
              Quick Conversions - {categories[selectedCategory].name}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUnits.slice(0, 12).map(unit => {
                const value = parseFloat(fromValue) || 1;
                const fromUnitData = categories[selectedCategory].units.find(u => u.name === fromUnit);
                
                if (!fromUnitData) return null;

                let convertedValue: number;
                if (selectedCategory === 'temperature') {
                  convertedValue = convertTemperature(value, fromUnit, unit.name);
                } else {
                  const baseValue = value * fromUnitData.toBase;
                  convertedValue = baseValue * unit.fromBase;
                }

                const formatted = convertedValue.toPrecision(6).replace(/\.?0+$/, '');

                return (
                  <div
                    key={unit.name}
                    className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => setToUnit(unit.name)}
                  >
                    <div>
                      <div className="text-white/90 text-sm font-medium">{unit.name}</div>
                      <div className="text-white/60 text-xs">{unit.symbol}</div>
                    </div>
                    <div className="text-white font-mono text-sm">
                      {formatted}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Common Conversions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <GlassCard size="sm">
              <div className="text-white/80 text-sm font-medium mb-2">Common Length</div>
              <div className="space-y-1 text-xs text-white/70">
                <div>1 inch = 2.54 cm</div>
                <div>1 foot = 0.3048 m</div>
                <div>1 mile = 1.609 km</div>
              </div>
            </GlassCard>

            <GlassCard size="sm">
              <div className="text-white/80 text-sm font-medium mb-2">Common Weight</div>
              <div className="space-y-1 text-xs text-white/70">
                <div>1 ounce = 28.35 g</div>
                <div>1 pound = 0.453 kg</div>
                <div>1 stone = 6.35 kg</div>
              </div>
            </GlassCard>

            <GlassCard size="sm">
              <div className="text-white/80 text-sm font-medium mb-2">Common Temperature</div>
              <div className="space-y-1 text-xs text-white/70">
                <div>0°C = 32°F = 273.15K</div>
                <div>100°C = 212°F = 373.15K</div>
                <div>Room temp ≈ 20°C = 68°F</div>
              </div>
            </GlassCard>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};