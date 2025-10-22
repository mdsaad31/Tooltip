import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Download, Copy, QrCode as QrCodeIcon, Wifi, User, Link2 } from 'lucide-react';
import QRCode from 'qrcode';
import { GlassCard, GlassButton, GlassInput } from '../ui/GlassComponents';

interface QRCodeGeneratorProps {
  className?: string;
}

type QRType = 'text' | 'url' | 'wifi' | 'contact' | 'sms' | 'email';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

interface QRConfig {
  errorCorrectionLevel: ErrorCorrectionLevel;
  type: 'image/png' | 'image/jpeg';
  quality: number;
  margin: number;
  color: {
    dark: string;
    light: string;
  };
  width: number;
}

interface WiFiData {
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

interface ContactData {
  name: string;
  phone: string;
  email: string;
  organization: string;
  url: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ className = '' }) => {
  const [qrType, setQrType] = useState<QRType>('text');
  const [textInput, setTextInput] = useState('');
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Advanced settings
  const [config, setConfig] = useState<QRConfig>({
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.92,
    margin: 4,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    width: 256
  });

  // Specific data for different types
  const [wifiData, setWifiData] = useState<WiFiData>({
    ssid: '',
    password: '',
    security: 'WPA',
    hidden: false
  });

  const [contactData, setContactData] = useState<ContactData>({
    name: '',
    phone: '',
    email: '',
    organization: '',
    url: ''
  });

  const [smsData, setSmsData] = useState({ phone: '', message: '' });
  const [emailData, setEmailData] = useState({ email: '', subject: '', body: '' });

  const generateQRData = useCallback((): string => {
    switch (qrType) {
      case 'text':
      case 'url':
        return textInput;
      
      case 'wifi':
        return `WIFI:T:${wifiData.security};S:${wifiData.ssid};P:${wifiData.password};H:${wifiData.hidden ? 'true' : 'false'};;`;
      
      case 'contact':
        // vCard format
        return `BEGIN:VCARD
VERSION:3.0
FN:${contactData.name}
TEL:${contactData.phone}
EMAIL:${contactData.email}
ORG:${contactData.organization}
URL:${contactData.url}
END:VCARD`;
      
      case 'sms':
        return `SMSTO:${smsData.phone}:${smsData.message}`;
      
      case 'email':
        return `mailto:${emailData.email}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
      
      default:
        return textInput;
    }
  }, [qrType, textInput, wifiData, contactData, smsData, emailData]);

  const generateQRCode = useCallback(async () => {
    const data = generateQRData();
    if (!data.trim()) return;

    setIsGenerating(true);
    
    try {
      const options = {
        errorCorrectionLevel: config.errorCorrectionLevel,
        type: config.type,
        quality: config.quality,
        margin: config.margin,
        color: {
          dark: config.color.dark,
          light: config.color.light,
        },
        width: config.width,
      };

      const qrCodeURL = await QRCode.toDataURL(data, options);
      setQrCodeDataURL(qrCodeURL);

      // Also draw to canvas for download functionality
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, data, options);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [generateQRData, config]);

  // Auto-generate QR code when data changes
  useEffect(() => {
    const data = generateQRData();
    if (data.trim()) {
      generateQRCode();
    }
  }, [generateQRCode]);

  const downloadQRCode = useCallback(() => {
    if (!qrCodeDataURL) return;

    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.${config.type.split('/')[1]}`;
    link.href = qrCodeDataURL;
    link.click();
  }, [qrCodeDataURL, config.type]);

  const copyQRCode = useCallback(async () => {
    if (!qrCodeDataURL) return;

    try {
      const response = await fetch(qrCodeDataURL);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      // Could show a toast notification here
    } catch (error) {
      console.error('Error copying QR code:', error);
      // Fallback: copy the data URL
      await navigator.clipboard.writeText(qrCodeDataURL);
    }
  }, [qrCodeDataURL]);

  const renderInputFields = () => {
    switch (qrType) {
      case 'text':
        return (
          <GlassInput
            label="Text Content"
            placeholder="Enter any text to generate QR code..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
        );
      
      case 'url':
        return (
          <GlassInput
            label="Website URL"
            placeholder="https://example.com"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            type="url"
          />
        );
      
      case 'wifi':
        return (
          <div className="space-y-3">
            <GlassInput
              label="Network Name (SSID)"
              placeholder="My WiFi Network"
              value={wifiData.ssid}
              onChange={(e) => setWifiData(prev => ({ ...prev, ssid: e.target.value }))}
            />
            <GlassInput
              label="Password"
              placeholder="WiFi password"
              type="password"
              value={wifiData.password}
              onChange={(e) => setWifiData(prev => ({ ...prev, password: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Security</label>
                <select 
                  className="w-full backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  value={wifiData.security}
                  onChange={(e) => setWifiData(prev => ({ ...prev, security: e.target.value as 'WPA' | 'WEP' | 'nopass' }))}
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Open Network</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center space-x-2 text-white/80">
                  <input
                    type="checkbox"
                    checked={wifiData.hidden}
                    onChange={(e) => setWifiData(prev => ({ ...prev, hidden: e.target.checked }))}
                    className="rounded border border-white/40"
                  />
                  <span className="text-sm">Hidden Network</span>
                </label>
              </div>
            </div>
          </div>
        );
      
      case 'contact':
        return (
          <div className="space-y-3">
            <GlassInput
              label="Full Name"
              placeholder="John Doe"
              value={contactData.name}
              onChange={(e) => setContactData(prev => ({ ...prev, name: e.target.value }))}
            />
            <GlassInput
              label="Phone Number"
              placeholder="+1234567890"
              value={contactData.phone}
              onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
            />
            <GlassInput
              label="Email"
              placeholder="john@example.com"
              type="email"
              value={contactData.email}
              onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
            />
            <GlassInput
              label="Organization"
              placeholder="Company Name"
              value={contactData.organization}
              onChange={(e) => setContactData(prev => ({ ...prev, organization: e.target.value }))}
            />
            <GlassInput
              label="Website"
              placeholder="https://example.com"
              value={contactData.url}
              onChange={(e) => setContactData(prev => ({ ...prev, url: e.target.value }))}
            />
          </div>
        );
      
      case 'sms':
        return (
          <div className="space-y-3">
            <GlassInput
              label="Phone Number"
              placeholder="+1234567890"
              value={smsData.phone}
              onChange={(e) => setSmsData(prev => ({ ...prev, phone: e.target.value }))}
            />
            <GlassInput
              label="Message"
              placeholder="Your SMS message here..."
              value={smsData.message}
              onChange={(e) => setSmsData(prev => ({ ...prev, message: e.target.value }))}
            />
          </div>
        );
      
      case 'email':
        return (
          <div className="space-y-3">
            <GlassInput
              label="Email Address"
              placeholder="recipient@example.com"
              type="email"
              value={emailData.email}
              onChange={(e) => setEmailData(prev => ({ ...prev, email: e.target.value }))}
            />
            <GlassInput
              label="Subject"
              placeholder="Email subject"
              value={emailData.subject}
              onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
            />
            <GlassInput
              label="Message"
              placeholder="Email body content..."
              value={emailData.body}
              onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  const qrTypes = [
    { id: 'text', label: 'Text', icon: QrCodeIcon },
    { id: 'url', label: 'URL', icon: Link2 },
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'contact', label: 'Contact', icon: User },
    { id: 'sms', label: 'SMS', icon: QrCodeIcon },
    { id: 'email', label: 'Email', icon: QrCodeIcon },
  ];

  return (
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <GlassCard className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">QR Code Generator</h1>
        <p className="text-white/80">Generate customizable QR codes for various data types with advanced styling options</p>
      </GlassCard>

      {/* Type Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {qrTypes.map(type => {
          const Icon = type.icon;
          return (
            <GlassButton
              key={type.id}
              variant={qrType === type.id ? 'primary' : 'secondary'}
              onClick={() => setQrType(type.id as QRType)}
              className="flex-col p-4 h-20 justify-center"
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-sm">{type.label}</span>
            </GlassButton>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <GlassCard>
            <h3 className="text-white text-xl font-semibold mb-4 flex items-center">
              <QrCodeIcon className="w-5 h-5 mr-2" />
              {qrType.charAt(0).toUpperCase() + qrType.slice(1)} Content
            </h3>
            {renderInputFields()}
          </GlassCard>

          {/* Advanced Settings */}
          <GlassCard>
            <h3 className="text-white text-lg font-semibold mb-4">Customization Options</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Error Correction Level</label>
                  <select
                    className="w-full backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    value={config.errorCorrectionLevel}
                    onChange={(e) => setConfig(prev => ({ ...prev, errorCorrectionLevel: e.target.value as ErrorCorrectionLevel }))}
                  >
                    <option value="L">Low (7%) - Faster scan</option>
                    <option value="M">Medium (15%) - Balanced</option>
                    <option value="Q">Quartile (25%) - Good reliability</option>
                    <option value="H">High (30%) - Maximum reliability</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">QR Code Size (pixels)</label>
                  <input
                    type="range"
                    min="128"
                    max="1024"
                    step="32"
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer mb-2"
                    value={config.width}
                    onChange={(e) => setConfig(prev => ({ ...prev, width: parseInt(e.target.value) || 256 }))}
                  />
                  <div className="text-white/60 text-sm text-center">{config.width}px</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Foreground Color</label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      className="w-12 h-10 rounded-lg border border-white/30 bg-transparent cursor-pointer"
                      value={config.color.dark}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        color: { ...prev.color, dark: e.target.value } 
                      }))}
                    />
                    <input
                      type="text"
                      className="flex-1 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      value={config.color.dark}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        color: { ...prev.color, dark: e.target.value } 
                      }))}
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Background Color</label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      className="w-12 h-10 rounded-lg border border-white/30 bg-transparent cursor-pointer"
                      value={config.color.light}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        color: { ...prev.color, light: e.target.value } 
                      }))}
                    />
                    <input
                      type="text"
                      className="flex-1 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      value={config.color.light}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        color: { ...prev.color, light: e.target.value } 
                      }))}
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Border Margin</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer mb-1"
                    value={config.margin}
                    onChange={(e) => setConfig(prev => ({ ...prev, margin: parseInt(e.target.value) || 4 }))}
                  />
                  <div className="text-white/60 text-sm text-center">{config.margin} units</div>
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Export Format</label>
                  <select
                    className="w-full backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    value={config.type}
                    onChange={(e) => setConfig(prev => ({ ...prev, type: e.target.value as 'image/png' | 'image/jpeg' }))}
                  >
                    <option value="image/png">PNG (Lossless)</option>
                    <option value="image/jpeg">JPEG (Smaller size)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfig({
                    errorCorrectionLevel: 'M',
                    type: 'image/png',
                    quality: 0.92,
                    margin: 4,
                    color: { dark: '#000000', light: '#FFFFFF' },
                    width: 256
                  })}
                >
                  Reset Defaults
                </GlassButton>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfig(prev => ({ 
                    ...prev, 
                    color: { 
                      dark: prev.color.light, 
                      light: prev.color.dark 
                    } 
                  }))}
                >
                  Swap Colors
                </GlassButton>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfig(prev => ({ 
                    ...prev, 
                    color: { dark: '#FFFFFF', light: '#000000' } 
                  }))}
                >
                  Dark Mode
                </GlassButton>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfig(prev => ({ 
                    ...prev, 
                    color: { 
                      dark: `#${Math.floor(Math.random()*16777215).toString(16)}`, 
                      light: `#${Math.floor(Math.random()*16777215).toString(16)}` 
                    } 
                  }))}
                >
                  Random Colors
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* QR Code Display */}
        <div className="space-y-6">
          <GlassCard className="text-center">
            <h3 className="text-white text-lg font-semibold mb-4">Generated QR Code</h3>
            {qrCodeDataURL ? (
              <div className="space-y-6">
                <div className="inline-block p-4 bg-white rounded-xl">
                  <img 
                    src={qrCodeDataURL} 
                    alt="Generated QR Code" 
                    className="mx-auto"
                    style={{ maxWidth: '320px', height: 'auto' }}
                  />
                </div>
                
                <div className="flex flex-wrap justify-center gap-3">
                  <GlassButton
                    variant="primary"
                    icon={<Download className="w-4 h-4" />}
                    onClick={downloadQRCode}
                  >
                    Download QR Code
                  </GlassButton>
                  <GlassButton
                    variant="secondary"
                    icon={<Copy className="w-4 h-4" />}
                    onClick={copyQRCode}
                  >
                    Copy to Clipboard
                  </GlassButton>
                </div>

                {/* QR Info */}
                <div className="text-left space-y-2 text-sm text-white/70 bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span>{config.width}×{config.width}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <span>{config.type.split('/')[1].toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Correction:</span>
                    <span>{config.errorCorrectionLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Length:</span>
                    <span>{generateQRData().length} characters</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-white/60">
                {isGenerating ? (
                  <div className="space-y-4">
                    <div className="animate-spin w-12 h-12 border-3 border-white/30 border-t-white rounded-full mx-auto"></div>
                    <p className="text-lg">Generating QR Code...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <QrCodeIcon className="w-20 h-20 mx-auto opacity-40" />
                    <div>
                      <p className="text-lg mb-1">Ready to Generate</p>
                      <p className="text-sm text-white/50">Enter your data above to create a QR code</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
          
        </div>
        
        {/* Hidden canvas for download functionality */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};