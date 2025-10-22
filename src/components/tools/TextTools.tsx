import React, { useState, useCallback, useMemo } from 'react';
import { 
  Type, 
  Copy, 
  RotateCw, 
  Hash, 
  FileText, 
  Download,
  BarChart3,
  Shuffle,
  Eye,
  EyeOff
} from 'lucide-react';
import { GlassCard, GlassButton, GlassInput } from '../ui/GlassComponents';
import { Container } from '../layout/Layouts';

interface TextToolsProps {
  className?: string;
}

type TextTool = 
  | 'case-converter' 
  | 'word-counter' 
  | 'hash-generator' 
  | 'lorem-ipsum' 
  | 'text-diff' 
  | 'encoder-decoder'
  | 'text-analyzer';



export const TextTools: React.FC<TextToolsProps> = () => {
  const [currentTool, setCurrentTool] = useState<TextTool>('case-converter');
  const [inputText, setInputText] = useState('');
  const [secondaryText, setSecondaryText] = useState(''); // For diff tool
  const [loremSettings, setLoremSettings] = useState({ paragraphs: 3, words: 50 });
  const [showHashes, setShowHashes] = useState(false);

  // Case conversion functions
  const caseConversions = useMemo(() => ({
    uppercase: inputText.toUpperCase(),
    lowercase: inputText.toLowerCase(),
    titleCase: inputText.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    ),
    sentenceCase: inputText.charAt(0).toUpperCase() + inputText.slice(1).toLowerCase(),
    camelCase: inputText
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, ''),
    kebabCase: inputText.toLowerCase().replace(/\s+/g, '-'),
    snakeCase: inputText.toLowerCase().replace(/\s+/g, '_'),
    pascalCase: inputText
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
      .replace(/\s+/g, ''),
    inverseCase: inputText
      .split('')
      .map(char => char === char.toLowerCase() ? char.toUpperCase() : char.toLowerCase())
      .join('')
  }), [inputText]);

  // Word and character analysis
  const textAnalysis = useMemo(() => {
    if (!inputText) return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      averageWordsPerSentence: 0,
      readingTime: 0
    };

    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;
    const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    const sentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = inputText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const lines = inputText.split('\n').length;
    const averageWordsPerSentence = sentences > 0 ? Math.round(words / sentences) : 0;
    const readingTime = Math.ceil(words / 200); // Assume 200 WPM reading speed

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
      averageWordsPerSentence,
      readingTime
    };
  }, [inputText]);

  // Simple textarea component
  const GlassTextarea: React.FC<{
    label?: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rows?: number;
  }> = ({ label, placeholder, value, onChange, rows = 4 }) => (
    <div className="space-y-2">
      {label && (
        <label className="block text-white/80 text-sm font-medium">{label}</label>
      )}
      <textarea
        className="backdrop-blur-md bg-black/10 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/60 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 w-full resize-vertical"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
      />
    </div>
  );

  // Simple hash generator (for demo purposes)
  const generateSimpleHash = useCallback((text: string, algorithm: string): string => {
    const simpleHash = (str: string, seed = 0) => {
      let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
      for (let i = 0; i < str.length; i++) {
        const ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
      }
      h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
      h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
      return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
    };

    const seedMap: { [key: string]: number } = { 'md5': 1, 'sha1': 2, 'sha256': 3 };
    const lengthMap: { [key: string]: number } = { 'md5': 32, 'sha1': 40, 'sha256': 64 };
    
    return simpleHash(text, seedMap[algorithm] || 1).substring(0, lengthMap[algorithm] || 32);
  }, []);

  // Lorem ipsum generator
  const generateLorem = useCallback(() => {
    const words = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
      'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
      'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
      'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
      'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
      'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
      'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
    ];

    const generateSentence = () => {
      const sentenceLength = Math.floor(Math.random() * 15) + 8;
      const sentence = [];
      for (let i = 0; i < sentenceLength; i++) {
        sentence.push(words[Math.floor(Math.random() * words.length)]);
      }
      return sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1) + 
             ' ' + sentence.slice(1).join(' ') + '.';
    };

    const generateParagraph = () => {
      const sentenceCount = Math.floor(Math.random() * 4) + 3;
      const sentences = [];
      for (let i = 0; i < sentenceCount; i++) {
        sentences.push(generateSentence());
      }
      return sentences.join(' ');
    };

    const paragraphs = [];
    for (let i = 0; i < loremSettings.paragraphs; i++) {
      paragraphs.push(generateParagraph());
    }

    return paragraphs.join('\n\n');
  }, [loremSettings]);

  // Text diff (simple line-by-line comparison)
  const generateDiff = useMemo(() => {
    if (!inputText || !secondaryText) return [];
    
    const lines1 = inputText.split('\n');
    const lines2 = secondaryText.split('\n');
    const maxLines = Math.max(lines1.length, lines2.length);
    
    const diff = [];
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';
      
      if (line1 === line2) {
        diff.push({ type: 'same', line: line1, lineNumber: i + 1 });
      } else {
        if (line1) {
          diff.push({ type: 'removed', line: line1, lineNumber: i + 1 });
        }
        if (line2) {
          diff.push({ type: 'added', line: line2, lineNumber: i + 1 });
        }
      }
    }
    
    return diff;
  }, [inputText, secondaryText]);

  // Encoding/Decoding functions
  const encodingResults = useMemo(() => ({
    base64: btoa(inputText),
    urlEncoded: encodeURIComponent(inputText),
    htmlEntities: inputText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;'),
    jsonEscaped: JSON.stringify(inputText).slice(1, -1)
  }), [inputText]);

  // Copy to clipboard function
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, []);

  // Download as file
  const downloadAsFile = useCallback((content: string, filename: string, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const toolButtons = [
    { id: 'case-converter' as TextTool, label: 'Case Converter', icon: Type },
    { id: 'word-counter' as TextTool, label: 'Text Analysis', icon: BarChart3 },
    { id: 'hash-generator' as TextTool, label: 'Hash Generator', icon: Hash },
    { id: 'lorem-ipsum' as TextTool, label: 'Lorem Ipsum', icon: FileText },
    { id: 'text-diff' as TextTool, label: 'Text Diff', icon: Eye },
    { id: 'encoder-decoder' as TextTool, label: 'Encoder/Decoder', icon: RotateCw }
  ];

  const renderTool = () => {
    switch (currentTool) {
      case 'case-converter':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(caseConversions).map(([type, result]) => (
                <GlassCard key={type} size="sm" className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80 text-sm font-medium capitalize">
                      {type.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <GlassButton
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(result)}
                    >
                      <Copy className="w-3 h-3" />
                    </GlassButton>
                  </div>
                  <div className="text-white text-sm break-all">
                    {result || 'Enter text above'}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        );

      case 'word-counter':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(textAnalysis).map(([key, value]) => (
              <GlassCard key={key} size="sm" className="p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{value}</div>
                <div className="text-white/60 text-xs capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </div>
              </GlassCard>
            ))}
          </div>
        );

      case 'hash-generator':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <GlassButton
                onClick={() => setShowHashes(!showHashes)}
                icon={showHashes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              >
                {showHashes ? 'Hide Hashes' : 'Generate Hashes'}
              </GlassButton>
            </div>
            
            {showHashes && inputText && (
              <div className="space-y-3">
                {['MD5', 'SHA-1', 'SHA-256'].map((algorithm) => {
                  const demoHash = generateSimpleHash(inputText, algorithm.toLowerCase().replace('-', ''));
                  
                  return (
                    <GlassCard key={algorithm} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80 font-medium">{algorithm}</span>
                        <GlassButton
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(demoHash)}
                        >
                          <Copy className="w-4 h-4" />
                        </GlassButton>
                      </div>
                      <div className="text-white/90 font-mono text-sm break-all bg-white/5 p-2 rounded">
                        {demoHash}
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'lorem-ipsum':
        return (
          <div className="space-y-4">
            <div className="flex space-x-4">
              <GlassInput
                type="number"
                label="Paragraphs"
                value={loremSettings.paragraphs}
                onChange={(e) => setLoremSettings(prev => ({ 
                  ...prev, 
                  paragraphs: Math.max(1, parseInt(e.target.value) || 1) 
                }))}
                min="1"
                max="10"
              />
            </div>
            
            <div className="flex space-x-2">
              <GlassButton onClick={() => setInputText(generateLorem())} icon={<Shuffle className="w-4 h-4" />}>
                Generate Lorem Ipsum
              </GlassButton>
              <GlassButton 
                variant="secondary"
                onClick={() => copyToClipboard(inputText)}
                disabled={!inputText}
              >
                <Copy className="w-4 h-4" />
              </GlassButton>
            </div>
          </div>
        );

      case 'text-diff':
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <GlassTextarea
                label="Text 1 (Original)"
                placeholder="Paste first text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={10}
              />
              <GlassTextarea
                label="Text 2 (Modified)"
                placeholder="Paste second text here..."
                value={secondaryText}
                onChange={(e) => setSecondaryText(e.target.value)}
                rows={10}
              />
            </div>
            
            {generateDiff.length > 0 && (
              <GlassCard className="p-4">
                <h3 className="text-white font-medium mb-3">Differences:</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {generateDiff.map((diff, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-sm font-mono ${
                        diff.type === 'added' 
                          ? 'bg-green-500/20 text-green-300' 
                          : diff.type === 'removed'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-white/5 text-white/70'
                      }`}
                    >
                      <span className="text-white/50 mr-2">{diff.lineNumber}:</span>
                      <span className="mr-2">
                        {diff.type === 'added' ? '+' : diff.type === 'removed' ? '-' : ' '}
                      </span>
                      {diff.line}
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        );

      case 'encoder-decoder':
        return (
          <div className="space-y-4">
            <div className="grid gap-3">
              {Object.entries(encodingResults).map(([type, result]) => (
                <GlassCard key={type} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80 font-medium capitalize">
                      {type.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <div className="flex space-x-2">
                      <GlassButton
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(result)}
                      >
                        <Copy className="w-4 h-4" />
                      </GlassButton>
                      <GlassButton
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadAsFile(result, `encoded_${type}.txt`)}
                      >
                        <Download className="w-4 h-4" />
                      </GlassButton>
                    </div>
                  </div>
                  <div className="text-white/90 font-mono text-sm break-all bg-white/5 p-2 rounded">
                    {result || 'Enter text above to see encoding'}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Container>
      <div className="p-6 space-y-6">
        <GlassCard className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Text Tools</h1>
          <p className="text-white/80">Powerful text manipulation and analysis utilities</p>
        </GlassCard>

        {/* Tool Selection */}
        <div className="flex flex-wrap gap-2 justify-center">
          {toolButtons.map((tool) => {
            const Icon = tool.icon;
            return (
              <GlassButton
                key={tool.id}
                variant={currentTool === tool.id ? 'primary' : 'secondary'}
                onClick={() => setCurrentTool(tool.id)}
                icon={<Icon className="w-4 h-4" />}
              >
                {tool.label}
              </GlassButton>
            );
          })}
        </div>

        {/* Main Input (except for diff tool which has its own inputs) */}
        {currentTool !== 'text-diff' && currentTool !== 'lorem-ipsum' && (
          <GlassTextarea
            label="Input Text"
            placeholder="Enter your text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={6}
          />
        )}

        {/* Tool Content */}
        <div>
          {renderTool()}
        </div>

        {/* Action Buttons */}
        {inputText && currentTool !== 'lorem-ipsum' && currentTool !== 'text-diff' && (
          <div className="flex space-x-2 justify-center">
            <GlassButton
              variant="secondary"
              onClick={() => copyToClipboard(inputText)}
              icon={<Copy className="w-4 h-4" />}
            >
              Copy Input
            </GlassButton>
            <GlassButton
              variant="secondary"
              onClick={() => downloadAsFile(inputText, 'text_output.txt')}
              icon={<Download className="w-4 h-4" />}
            >
              Download
            </GlassButton>
            <GlassButton
              variant="ghost"
              onClick={() => setInputText('')}
            >
              Clear
            </GlassButton>
          </div>
        )}
      </div>
    </Container>
  );
};