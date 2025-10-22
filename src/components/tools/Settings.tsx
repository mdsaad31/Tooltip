import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Monitor, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Layout, 
  Grid3X3,
  Sliders,
  Sparkles,
  Eye,
  Move,
  RotateCcw,
  Save,
  Download,
  Upload
} from 'lucide-react';
import { GlassButton, GlassPanel } from '../ui/GlassComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { DashboardSandbox } from './DashboardSandbox';



interface DashboardWidget {
  id: string;
  enabled: boolean;
  position: { x: number; y: number };
  size: { w: number; h: number };
}

interface DashboardSettings {
  compactMode: boolean;
  widgetLayout: string;
  autoRefresh: boolean;
  refreshInterval: number;
  showWidgetTitles: boolean;
  widgetSpacing: string;
  dashboardWidgets: DashboardWidget[];
  enableAnimations: boolean;
  customLayout: any;
}



const BACKGROUND_STYLES = [
  { id: 'gradient', name: 'Animated Gradient', preview: 'bg-gradient-to-br from-purple-600 via-blue-600 to-green-600' },
  { id: 'particles', name: 'Floating Particles', preview: 'bg-gradient-to-br from-blue-900 to-purple-900' },
  { id: 'waves', name: 'Flowing Waves', preview: 'bg-gradient-to-br from-teal-600 to-blue-600' },
  { id: 'minimal', name: 'Minimal Blur', preview: 'bg-gradient-to-br from-gray-800 to-gray-900' }
];

export const Settings: React.FC = () => {
  const { theme, updateTheme, resetTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'appearance' | 'dashboard' | 'advanced'>('appearance');
  const [hasChanges, setHasChanges] = useState(false);

  // Local dashboard settings (not part of theme)
  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>(() => {
    const saved = localStorage.getItem('dashboard-settings');
    return saved ? JSON.parse(saved) : {
      compactMode: false,
      widgetLayout: 'grid',
      autoRefresh: true,
      refreshInterval: 30,
      showWidgetTitles: false,
      widgetSpacing: 'normal',
      dashboardWidgets: [
        { id: 'quick-notes', enabled: true, position: { x: 0, y: 0 }, size: { w: 1, h: 1 } },
        { id: 'todays-tasks', enabled: true, position: { x: 1, y: 0 }, size: { w: 1, h: 1 } },
        { id: 'productivity-tools', enabled: true, position: { x: 2, y: 0 }, size: { w: 1, h: 1 } },
        { id: 'design-tools', enabled: true, position: { x: 0, y: 1 }, size: { w: 1, h: 1 } }
      ],
      enableAnimations: true,
      customLayout: null
    };
  });
  
  const [showSandbox, setShowSandbox] = useState(false);

  const updateSetting = (key: string, value: any) => {
    if (key in theme) {
      updateTheme({ [key]: value });
    }
    setHasChanges(true);
  };

  const resetToDefaults = () => {
    resetTheme();
    setHasChanges(false);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(theme, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tooltip-settings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        updateTheme(imported);
        setHasChanges(false);
      } catch (error) {
        console.error('Error importing settings:', error);
      }
    };
    reader.readAsText(file);
  };

  const toggleWidgetEnabled = (widgetId: string) => {
    const updatedWidgets = dashboardSettings.dashboardWidgets.map((widget: DashboardWidget) =>
      widget.id === widgetId ? { ...widget, enabled: !widget.enabled } : widget
    );
    setDashboardSettings((prev: DashboardSettings) => ({ ...prev, dashboardWidgets: updatedWidgets }));
    setHasChanges(true);
  };

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      {/* Theme Selection */}
      <GlassPanel title="Theme" icon={<Monitor className="w-5 h-5" />}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'auto', label: 'Auto', icon: Monitor }
          ].map((themeOption) => {
            const Icon = themeOption.icon;
            return (
              <button
                key={themeOption.id}
                onClick={() => updateSetting('mode', themeOption.id)}
                className={`
                  p-4 rounded-lg border-2 transition-all flex flex-col items-center space-y-2
                  ${theme.mode === themeOption.id
                    ? 'border-indigo-400 bg-indigo-500/20'
                    : 'border-white/20 hover:border-white/40 bg-white/5'
                  }
                `}
              >
                <Icon className="w-6 h-6 text-white" />
                <span className="text-white text-sm">{themeOption.label}</span>
              </button>
            );
          })}
        </div>
      </GlassPanel>

      {/* Enhanced Background Styles */}
      <GlassPanel title="Background Styles" icon={<Palette className="w-5 h-5" />}>
        <div className="grid grid-cols-2 gap-4">
          {[
            { 
              id: 'gradient', 
              name: 'Gradient Flow', 
              preview: 'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600',
              description: 'Smooth color transitions'
            },
            { 
              id: 'animated', 
              name: 'Cosmic Motion', 
              preview: 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 animate-pulse',
              description: 'Dynamic animated background'
            },
            { 
              id: 'minimal', 
              name: 'Clean Slate', 
              preview: 'bg-gradient-to-b from-gray-800 to-gray-900',
              description: 'Minimalist design'
            },
            { 
              id: 'cosmic', 
              name: 'Deep Space', 
              preview: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
              description: 'Rich cosmic colors'
            },
            { 
              id: 'aurora', 
              name: 'Aurora Borealis', 
              preview: 'bg-gradient-to-r from-green-400 via-blue-500 to-purple-600',
              description: 'Northern lights inspired'
            },
            { 
              id: 'sunset', 
              name: 'Golden Hour', 
              preview: 'bg-gradient-to-r from-orange-400 via-pink-500 to-red-500',
              description: 'Warm sunset vibes'
            },
            { 
              id: 'ocean', 
              name: 'Deep Ocean', 
              preview: 'bg-gradient-to-br from-blue-800 via-teal-700 to-cyan-600',
              description: 'Oceanic depths'
            },
            { 
              id: 'forest', 
              name: 'Emerald Forest', 
              preview: 'bg-gradient-to-br from-green-800 via-emerald-700 to-teal-600',
              description: 'Natural forest tones'
            }
          ].map((bg) => (
            <button
              key={bg.id}
              onClick={() => updateSetting('backgroundStyle', bg.id)}
              className={`
                relative p-4 rounded-lg border-2 transition-all group
                ${theme.backgroundStyle === bg.id
                  ? 'border-white/60 scale-105 bg-white/10'
                  : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                }
              `}
            >
              <div className={`w-full h-16 rounded ${bg.preview} mb-3 group-hover:scale-105 transition-transform`} />
              <h4 className="text-white font-medium text-sm mb-1">{bg.name}</h4>
              <p className="text-white/60 text-xs">{bg.description}</p>
              {theme.backgroundStyle === bg.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                </div>
              )}
            </button>
          ))}
        </div>
      </GlassPanel>

      {/* Background Style */}
      <GlassPanel title="Background Style" icon={<Sparkles className="w-5 h-5" />}>
        <div className="grid grid-cols-2 gap-3">
          {BACKGROUND_STYLES.map((bg) => (
            <button
              key={bg.id}
              onClick={() => updateSetting('backgroundStyle', bg.id)}
              className={`
                relative p-4 rounded-lg border-2 transition-all
                ${theme.backgroundStyle === bg.id
                  ? 'border-indigo-400 scale-105'
                  : 'border-white/20 hover:border-white/40'
                }
              `}
            >
              <div className={`w-full h-16 rounded ${bg.preview} mb-2`} />
              <p className="text-white text-sm">{bg.name}</p>
            </button>
          ))}
        </div>
      </GlassPanel>

      {/* Visual Settings */}
      <GlassPanel title="Visual Settings" icon={<Eye className="w-5 h-5" />}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-white font-medium">Transparency</label>
              <p className="text-white/60 text-sm">Adjust glass effect opacity</p>
            </div>
            <div className="w-32">
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={theme.transparency}
                onChange={(e) => updateSetting('transparency', parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-white font-medium">Enable Animations</label>
              <p className="text-white/60 text-sm">Smooth transitions and effects</p>
            </div>
            <button
              onClick={() => {
                setDashboardSettings((prev: DashboardSettings) => ({ ...prev, enableAnimations: !prev.enableAnimations }));
                setHasChanges(true);
              }}
              className={`
                w-12 h-6 rounded-full border-2 transition-all relative
                ${dashboardSettings.enableAnimations 
                  ? 'bg-indigo-500 border-indigo-400' 
                  : 'bg-white/20 border-white/40'
                }
              `}
            >
              <div className={`
                w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform
                ${dashboardSettings.enableAnimations ? 'transform translate-x-6' : 'translate-x-0.5'}
              `} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-white font-medium">Sound Effects</label>
              <p className="text-white/60 text-sm">Audio feedback for interactions</p>
            </div>
            <button
              onClick={() => updateSetting('soundEnabled', !theme.soundEnabled)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {theme.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-white" />
              ) : (
                <VolumeX className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </GlassPanel>
    </div>
  );

  const renderDashboardTab = () => (
    <div className="space-y-6">
      {/* Layout Options */}
      <GlassPanel title="Dashboard Layout" icon={<Layout className="w-5 h-5" />}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'grid', label: 'Grid Layout', icon: Grid3X3 },
            { id: 'masonry', label: 'Masonry', icon: Layout },
            { id: 'custom', label: 'Custom', icon: Move }
          ].map((layout) => {
            const Icon = layout.icon;
            return (
              <button
                key={layout.id}
                onClick={() => {
                  if (layout.id === 'custom') {
                    setShowSandbox(true);
                  } else {
                    setDashboardSettings((prev: DashboardSettings) => ({ ...prev, widgetLayout: layout.id }));
                    setHasChanges(true);
                  }
                }}
                className={`
                  p-4 rounded-lg border-2 transition-all flex flex-col items-center space-y-2 group
                  ${dashboardSettings.widgetLayout === layout.id
                    ? 'border-indigo-400 bg-indigo-500/20'
                    : 'border-white/20 hover:border-white/40 bg-white/5'
                  }
                `}
              >
                <Icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                <span className="text-white text-sm">{layout.label}</span>
                {layout.id === 'custom' && (
                  <span className="text-white/60 text-xs">Click to customize</span>
                )}
              </button>
            );
          })}
        </div>
      </GlassPanel>

      {/* Widget Management */}
      <GlassPanel title="Dashboard Widgets" icon={<Grid3X3 className="w-5 h-5" />}>
        <div className="space-y-3">
          {dashboardSettings.dashboardWidgets.map((widget: DashboardWidget) => (
            <div
              key={widget.id}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <div>
                <h4 className="text-white font-medium capitalize">
                  {widget.id.replace('-', ' ')}
                </h4>
                <p className="text-white/60 text-sm">
                  Position: {widget.position.x}, {widget.position.y}
                </p>
              </div>
              <button
                onClick={() => toggleWidgetEnabled(widget.id)}
                className={`
                  w-12 h-6 rounded-full border-2 transition-all relative
                  ${widget.enabled 
                    ? 'bg-indigo-500 border-indigo-400' 
                    : 'bg-white/20 border-white/40'
                  }
                `}
              >
                <div className={`
                  w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform
                  ${widget.enabled ? 'transform translate-x-6' : 'translate-x-0.5'}
                `} />
              </button>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* Display Options */}
      <GlassPanel title="Display Options" icon={<Monitor className="w-5 h-5" />}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-white font-medium">Compact Mode</label>
              <p className="text-white/60 text-sm">Reduced spacing and smaller elements</p>
            </div>
            <button
              onClick={() => {
                setDashboardSettings((prev: DashboardSettings) => ({ ...prev, compactMode: !prev.compactMode }));
                setHasChanges(true);
              }}
              className={`
                w-12 h-6 rounded-full border-2 transition-all relative
                ${dashboardSettings.compactMode 
                  ? 'bg-indigo-500 border-indigo-400' 
                  : 'bg-white/20 border-white/40'
                }
              `}
            >
              <div className={`
                w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform
                ${dashboardSettings.compactMode ? 'transform translate-x-6' : 'translate-x-0.5'}
              `} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-white font-medium">Show Widget Titles</label>
              <p className="text-white/60 text-sm">Display titles on dashboard widgets</p>
            </div>
            <button
              onClick={() => {
                setDashboardSettings((prev: DashboardSettings) => ({ ...prev, showWidgetTitles: !prev.showWidgetTitles }));
                setHasChanges(true);
              }}
              className={`
                w-12 h-6 rounded-full border-2 transition-all relative
                ${dashboardSettings.showWidgetTitles 
                  ? 'bg-indigo-500 border-indigo-400' 
                  : 'bg-white/20 border-white/40'
                }
              `}
            >
              <div className={`
                w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform
                ${dashboardSettings.showWidgetTitles ? 'transform translate-x-6' : 'translate-x-0.5'}
              `} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-white font-medium">Auto Refresh</label>
              <p className="text-white/60 text-sm">Automatically update dashboard data</p>
            </div>
            <button
              onClick={() => {
                setDashboardSettings((prev: DashboardSettings) => ({ ...prev, autoRefresh: !prev.autoRefresh }));
                setHasChanges(true);
              }}
              className={`
                w-12 h-6 rounded-full border-2 transition-all relative
                ${dashboardSettings.autoRefresh 
                  ? 'bg-indigo-500 border-indigo-400' 
                  : 'bg-white/20 border-white/40'
                }
              `}
            >
              <div className={`
                w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform
                ${dashboardSettings.autoRefresh ? 'transform translate-x-6' : 'translate-x-0.5'}
              `} />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-white font-medium">Widget Spacing</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'tight', label: 'Tight' },
                { id: 'normal', label: 'Normal' },
                { id: 'loose', label: 'Loose' }
              ].map((spacing) => (
                <button
                  key={spacing.id}
                  onClick={() => {
                    setDashboardSettings((prev: DashboardSettings) => ({ ...prev, widgetSpacing: spacing.id }));
                    setHasChanges(true);
                  }}
                  className={`
                    px-3 py-2 rounded-lg border transition-all text-sm
                    ${dashboardSettings.widgetSpacing === spacing.id
                      ? 'border-indigo-400 bg-indigo-500/20 text-white'
                      : 'border-white/20 hover:border-white/40 bg-white/5 text-white/80'
                    }
                  `}
                >
                  {spacing.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-white font-medium">Refresh Interval</label>
            <p className="text-white/60 text-xs">How often to update dashboard data (seconds)</p>
            <input
              type="range"
              min="5"
              max="300"
              step="5"
              value={dashboardSettings.refreshInterval}
              onChange={(e) => {
                setDashboardSettings((prev: DashboardSettings) => ({ ...prev, refreshInterval: parseInt(e.target.value) }));
                setHasChanges(true);
              }}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white/60">
              <span>5s</span>
              <span className="text-white/80 font-medium">{dashboardSettings.refreshInterval}s</span>
              <span>5min</span>
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      {/* Import/Export */}
      <GlassPanel title="Backup & Restore" icon={<Save className="w-5 h-5" />}>
        <div className="space-y-4">
          <div className="flex gap-3">
            <GlassButton onClick={exportSettings} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export Settings
            </GlassButton>
            <label className="flex-1">
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="hidden"
              />
              <div className="glass-button-secondary w-full cursor-pointer p-3 rounded-lg bg-white/10 border border-white/20 text-white text-center hover:bg-white/15 transition-colors flex items-center justify-center">
                <Upload className="w-4 h-4 mr-2" />
                Import Settings
              </div>
            </label>
          </div>
          <p className="text-white/60 text-sm">
            Export your settings to back them up or share with other devices.
          </p>
        </div>
      </GlassPanel>

      {/* Reset */}
      <GlassPanel title="Reset Options" icon={<RotateCcw className="w-5 h-5" />}>
        <div className="space-y-4">
          <GlassButton
            variant="secondary"
            onClick={resetToDefaults}
            className="w-full text-red-300 hover:text-red-200"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </GlassButton>
          <p className="text-white/60 text-sm">
            This will reset all settings to their default values. This action cannot be undone.
          </p>
        </div>
      </GlassPanel>

      {/* Performance */}
      <GlassPanel title="Performance" icon={<Sliders className="w-5 h-5" />}>
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="text-white font-medium mb-2">Current Settings Impact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Animations:</span>
                <span className={dashboardSettings.enableAnimations ? 'text-yellow-400' : 'text-green-400'}>
                  {dashboardSettings.enableAnimations ? 'High Impact' : 'Low Impact'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Transparency:</span>
                <span className={theme.transparency > 0.3 ? 'text-yellow-400' : 'text-green-400'}>
                  {theme.transparency > 0.3 ? 'Medium Impact' : 'Low Impact'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Background:</span>
                <span className={theme.backgroundStyle !== 'minimal' ? 'text-yellow-400' : 'text-green-400'}>
                  {theme.backgroundStyle !== 'minimal' ? 'Medium Impact' : 'Low Impact'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <SettingsIcon className="w-8 h-8 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-white/60">Customize your Tooltip experience</p>
          </div>
        </div>
        {hasChanges && (
          <GlassButton onClick={() => {
            localStorage.setItem('dashboard-settings', JSON.stringify(dashboardSettings));
            setHasChanges(false);
          }}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </GlassButton>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 mb-6">
        {[
          { id: 'appearance', label: 'Appearance', icon: Palette },
          { id: 'dashboard', label: 'Dashboard', icon: Layout },
          { id: 'advanced', label: 'Advanced', icon: Sliders }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
                ${activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'appearance' && renderAppearanceTab()}
      {activeTab === 'dashboard' && renderDashboardTab()}
      {activeTab === 'advanced' && renderAdvancedTab()}

      {/* Dashboard Sandbox */}
      <DashboardSandbox
        isOpen={showSandbox}
        onClose={() => setShowSandbox(false)}
        onSave={(widgets) => {
          const newSettings = {
            ...dashboardSettings,
            widgetLayout: 'custom',
            customLayout: widgets
          };
          setDashboardSettings(newSettings);
          setHasChanges(true);
          localStorage.setItem('dashboard-settings', JSON.stringify(newSettings));
        }}
      />
    </div>
  );
};