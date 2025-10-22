import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  Download, 
  Image, 
  File, 
  Archive, 
  RotateCw,
  FileImage,
  FileType,
  FileText,
  Volume2,
  Video,
  Info,
  X
} from 'lucide-react';
import { GlassCard, GlassButton, GlassInput } from '../ui/GlassComponents';
import { Container } from '../layout/Layouts';

interface FileToolsProps {
  className?: string;
}

type FileTool = 
  | 'image-compressor' 
  | 'image-resizer' 
  | 'format-converter' 
  | 'file-analyzer'
  | 'image-optimizer';

interface ProcessedFile {
  id: string;
  name: string;
  originalSize: number;
  processedSize?: number;
  type: string;
  url: string;
  processedUrl?: string;
  dimensions?: { width: number; height: number };
  metadata?: Record<string, any>;
}

export const FileTools: React.FC<FileToolsProps> = () => {
  const [currentTool, setCurrentTool] = useState<FileTool>('image-compressor');
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compression settings
  const [compressionQuality, setCompressionQuality] = useState(0.8);
  const [targetWidth, setTargetWidth] = useState(800);
  const [targetHeight, setTargetHeight] = useState(600);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  // File upload handler
  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles: ProcessedFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const id = Date.now().toString() + i;
      const url = URL.createObjectURL(file);
      
      // Get image dimensions if it's an image
      let dimensions;
      if (file.type.startsWith('image/')) {
        try {
          dimensions = await getImageDimensions(file);
        } catch (error) {
          console.error('Error getting image dimensions:', error);
        }
      }

      newFiles.push({
        id,
        name: file.name,
        originalSize: file.size,
        type: file.type,
        url,
        dimensions,
        metadata: {
          lastModified: file.lastModified,
          webkitRelativePath: (file as any).webkitRelativePath || ''
        }
      });
    }
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  // Get image dimensions
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // Compress image
  const compressImage = useCallback(async (file: ProcessedFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Set canvas dimensions
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Draw and compress
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          compressionQuality
        );
      };
      img.onerror = reject;
      img.src = file.url;
    });
  }, [compressionQuality]);

  // Resize image
  const resizeImage = useCallback(async (file: ProcessedFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        let { width, height } = calculateNewDimensions(
          img.naturalWidth,
          img.naturalHeight,
          targetWidth,
          targetHeight,
          maintainAspectRatio
        );

        canvas.width = width;
        canvas.height = height;

        // Use better image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          'image/png',
          0.9
        );
      };
      img.onerror = reject;
      img.src = file.url;
    });
  }, [targetWidth, targetHeight, maintainAspectRatio]);

  // Calculate new dimensions maintaining aspect ratio
  const calculateNewDimensions = (
    originalWidth: number,
    originalHeight: number,
    targetWidth: number,
    targetHeight: number,
    maintainRatio: boolean
  ) => {
    if (!maintainRatio) {
      return { width: targetWidth, height: targetHeight };
    }

    const aspectRatio = originalWidth / originalHeight;
    
    if (targetWidth / targetHeight > aspectRatio) {
      return {
        width: Math.round(targetHeight * aspectRatio),
        height: targetHeight
      };
    } else {
      return {
        width: targetWidth,
        height: Math.round(targetWidth / aspectRatio)
      };
    }
  };

  // Process file based on current tool
  const processFile = useCallback(async (file: ProcessedFile) => {
    setIsProcessing(true);
    try {
      let processedUrl: string;
      
      switch (currentTool) {
        case 'image-compressor':
          processedUrl = await compressImage(file);
          break;
        case 'image-resizer':
          processedUrl = await resizeImage(file);
          break;
        case 'image-optimizer':
          // Combine compression and resizing
          const resized = await resizeImage(file);
          const tempFile = { ...file, url: resized };
          processedUrl = await compressImage(tempFile);
          break;
        default:
          processedUrl = file.url;
      }

      // Update file with processed version
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, processedUrl, processedSize: 0 } // Size would be calculated from blob
          : f
      ));
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [currentTool, compressImage, resizeImage]);

  // Download processed file
  const downloadFile = useCallback((file: ProcessedFile, processed = false) => {
    const url = processed && file.processedUrl ? file.processedUrl : file.url;
    const fileName = processed ? `processed_${file.name}` : file.name;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      // Clean up object URLs
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
        if (fileToRemove.processedUrl) {
          URL.revokeObjectURL(fileToRemove.processedUrl);
        }
      }
      return updated;
    });
  }, []);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return FileImage;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Volume2;
    if (type.includes('pdf')) return FileType;
    if (type.includes('text')) return FileText;
    return File;
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  // File input handler
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
  };

  const toolButtons = [
    { id: 'image-compressor' as FileTool, label: 'Image Compressor', icon: Archive },
    { id: 'image-resizer' as FileTool, label: 'Image Resizer', icon: RotateCw },
    { id: 'image-optimizer' as FileTool, label: 'Image Optimizer', icon: Image },
    { id: 'file-analyzer' as FileTool, label: 'File Analyzer', icon: Info }
  ];

  const renderToolSettings = () => {
    switch (currentTool) {
      case 'image-compressor':
        return (
          <GlassCard className="p-4">
            <h3 className="text-white font-medium mb-3">Compression Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Quality: {Math.round(compressionQuality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={compressionQuality}
                  onChange={(e) => setCompressionQuality(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </GlassCard>
        );

      case 'image-resizer':
        return (
          <GlassCard className="p-4">
            <h3 className="text-white font-medium mb-3">Resize Settings</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <GlassInput
                  type="number"
                  label="Width (px)"
                  value={targetWidth}
                  onChange={(e) => setTargetWidth(parseInt(e.target.value) || 800)}
                />
                <GlassInput
                  type="number"
                  label="Height (px)"
                  value={targetHeight}
                  onChange={(e) => setTargetHeight(parseInt(e.target.value) || 600)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="aspect-ratio"
                  checked={maintainAspectRatio}
                  onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="aspect-ratio" className="text-white/80 text-sm">
                  Maintain aspect ratio
                </label>
              </div>
            </div>
          </GlassCard>
        );

      case 'image-optimizer':
        return (
          <GlassCard className="p-4">
            <h3 className="text-white font-medium mb-3">Optimization Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Quality: {Math.round(compressionQuality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={compressionQuality}
                  onChange={(e) => setCompressionQuality(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <GlassInput
                  type="number"
                  label="Max Width (px)"
                  value={targetWidth}
                  onChange={(e) => setTargetWidth(parseInt(e.target.value) || 800)}
                />
                <GlassInput
                  type="number"
                  label="Max Height (px)"
                  value={targetHeight}
                  onChange={(e) => setTargetHeight(parseInt(e.target.value) || 600)}
                />
              </div>
            </div>
          </GlassCard>
        );

      default:
        return null;
    }
  };

  return (
    <Container>
      <div className="p-6 space-y-6">
        <GlassCard className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">File Tools</h1>
          <p className="text-white/80">Process and analyze your files locally</p>
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

        {/* Tool Settings */}
        {renderToolSettings()}

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            dragActive 
              ? 'border-white/50 bg-white/10' 
              : 'border-white/20 bg-white/5 hover:border-white/30'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-white/60 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">
            {dragActive ? 'Drop files here' : 'Upload files'}
          </h3>
          <p className="text-white/60 mb-4">
            Drag and drop files here, or click to select
          </p>
          <GlassButton
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload className="w-4 h-4" />}
          >
            Choose Files
          </GlassButton>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={currentTool.startsWith('image') ? 'image/*' : '*/*'}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-white font-medium">Uploaded Files ({files.length})</h3>
            <div className="grid gap-4">
              {files.map((file) => {
                const Icon = getFileIcon(file.type);
                return (
                  <GlassCard key={file.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-8 h-8 text-white/60" />
                        <div>
                          <p className="text-white font-medium">{file.name}</p>
                          <p className="text-white/60 text-sm">
                            {formatFileSize(file.originalSize)}
                            {file.dimensions && (
                              <span> • {file.dimensions.width}×{file.dimensions.height}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {file.type.startsWith('image/') && (
                          <GlassButton
                            size="sm"
                            onClick={() => processFile(file)}
                            disabled={isProcessing}
                            icon={<RotateCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />}
                          >
                            {isProcessing ? 'Processing...' : 'Process'}
                          </GlassButton>
                        )}
                        
                        <GlassButton
                          size="sm"
                          variant="secondary"
                          onClick={() => downloadFile(file)}
                          icon={<Download className="w-4 h-4" />}
                        >
                          Download
                        </GlassButton>
                        
                        {file.processedUrl && (
                          <GlassButton
                            size="sm"
                            variant="secondary"
                            onClick={() => downloadFile(file, true)}
                            icon={<Download className="w-4 h-4" />}
                          >
                            Download Processed
                          </GlassButton>
                        )}
                        
                        <GlassButton
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(file.id)}
                          icon={<X className="w-4 h-4" />}
                        >
                          Remove
                        </GlassButton>
                      </div>
                    </div>

                    {/* Image Preview */}
                    {file.type.startsWith('image/') && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-white/80 text-sm mb-2">Original</p>
                          <img
                            src={file.url}
                            alt="Original"
                            className="w-full h-32 object-cover rounded-lg bg-white/10"
                          />
                        </div>
                        
                        {file.processedUrl && (
                          <div>
                            <p className="text-white/80 text-sm mb-2">Processed</p>
                            <img
                              src={file.processedUrl}
                              alt="Processed"
                              className="w-full h-32 object-cover rounded-lg bg-white/10"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}

        {/* Clear All Button */}
        {files.length > 0 && (
          <div className="text-center">
            <GlassButton
              variant="ghost"
              onClick={() => {
                files.forEach(file => {
                  URL.revokeObjectURL(file.url);
                  if (file.processedUrl) URL.revokeObjectURL(file.processedUrl);
                });
                setFiles([]);
              }}
            >
              Clear All Files
            </GlassButton>
          </div>
        )}
      </div>
    </Container>
  );
};