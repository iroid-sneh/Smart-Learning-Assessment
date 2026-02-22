import React, { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';
interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
}
export function FileUpload({
  onFileSelect,
  accept,
  label = 'Upload File'
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  const handleFile = (file: File) => {
    setSelectedFile(file);
    onFileSelect(file);
  };
  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  return <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {!selectedFile ? <div onClick={() => fileInputRef.current?.click()} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
          `}>
          <input ref={fileInputRef} type="file" className="hidden" accept={accept} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <div className="flex flex-col items-center justify-center text-gray-500">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="font-medium text-gray-900">
              Click to upload or drag and drop
            </p>
            <p className="text-sm mt-1">PDF, DOC, JPG up to 10MB</p>
          </div>
        </div> : <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <File className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button onClick={clearFile} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>}
    </div>;
}