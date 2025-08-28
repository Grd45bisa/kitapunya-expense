// components/PhotoUpload.tsx - Following Original Structure with Base64
import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './styles/PhotoUpload.module.css';

interface PhotoUploadProps {
  photo: File | null;
  photoBase64?: string | null;
  onPhotoChange: (file: File | null) => void;
  onAnalyze: () => void;
  analyzing: boolean;
  canAnalyze: boolean;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photo,
  photoBase64,
  onPhotoChange,
  onAnalyze,
  analyzing,
  canAnalyze
}) => {
  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showZoomHint, setShowZoomHint] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Auto-hide zoom hint after 3 seconds
  useEffect(() => {
    if (showZoomHint) {
      const timer = setTimeout(() => setShowZoomHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showZoomHint]);

  // Show zoom hint when image is first loaded
  useEffect(() => {
    if (photo && imageLoaded && !showZoomHint) {
      setShowZoomHint(true);
    }
  }, [photo, imageLoaded]);

  // Set photo URL from Base64 or File
  useEffect(() => {
    if (photo) {
      if (photoBase64) {
        // Use Base64 if available
        setPhotoUrl(photoBase64);
      } else {
        // Create object URL from file and clean up properly
        const objectUrl = URL.createObjectURL(photo);
        setPhotoUrl(objectUrl);
        
        // Cleanup function
        return () => {
          URL.revokeObjectURL(objectUrl);
        };
      }
    } else {
      // Clear URL when no photo
      setPhotoUrl(null);
    }
  }, [photo, photoBase64]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onPhotoChange(file);
      setImageLoaded(false);
      setIsZoomed(false);
      setZoomPosition({ x: 50, y: 50 });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onPhotoChange(file);
      setImageLoaded(false);
      setIsZoomed(false);
      setZoomPosition({ x: 50, y: 50 });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPhotoChange(null);
    setIsZoomed(false);
    setShowZoomHint(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photo && !isDragging) {
      setIsZoomed(!isZoomed);
      if (!isZoomed) {
        setShowZoomHint(false);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isZoomed) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;

    if (isDragging) {
      e.preventDefault();
      const deltaX = (dragStart.x - e.clientX) / 2;
      const deltaY = (dragStart.y - e.clientY) / 2;
      
      setZoomPosition(prev => ({
        x: Math.max(0, Math.min(100, prev.x + deltaX)),
        y: Math.max(0, Math.min(100, prev.y + deltaY))
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      // Hover preview mode
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        setZoomPosition({
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y))
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (photo && e.ctrlKey) {
      e.preventDefault();
      setIsZoomed(e.deltaY < 0);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className={styles.photoUploadSection}>
      <div 
        className={`${styles.photoUploadArea} ${!photo ? styles.uploadAreaHover : ''}`}
        onClick={() => !photo && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {!photo ? (
          <div className={styles.uploadPlaceholder}>
            <i className="fas fa-camera" style={{ display: 'block', margin: '0 auto', textAlign: 'center', fontSize: '3.5rem' }}></i>
            <p>{t.expense.uploadReceipt}</p>
            <span>{t.expense.dragDropFile}</span>
            <div className={styles.uploadFormats}>
              {t.expense.maxFileSize}
            </div>
          </div>
        ) : (
          <div 
            ref={imageRef}
            className={`${styles.uploadedImage} ${isZoomed ? styles.imageZoomed : ''}`}
            onClick={handleImageClick}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
          >
            {/* Zoom hint tooltip */}
            {showZoomHint && !isZoomed && (
              <div className={styles.zoomHintTooltip}>
                <i className="fas fa-info-circle"></i>
                {language === 'id' ? 'Klik gambar untuk zoom' : 'Click image to zoom'}
              </div>
            )}

            <div 
              className={styles.imageContainer}
              style={{
                transform: isZoomed ? 'scale(2)' : 'scale(1)',
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
              }}
            >
              {photoUrl && (
                <img 
                  src={photoUrl} 
                  alt="Preview"
                  draggable={false}
                  onLoad={handleImageLoad}
                />
              )}
            </div>
            
            {/* Zoom controls */}
            {isZoomed && (
              <>
                <div className={styles.zoomControls}>
                  <div className={styles.zoomInfo}>
                    <i className="fas fa-search-plus"></i>
                    <span>2x Zoom</span>
                  </div>
                  <div className={styles.zoomActions}>
                    <span className={styles.zoomHint}>
                      <i className="fas fa-hand-paper"></i> {t.expense.dragToMove}
                    </span>
                    <input
                      style={{ position: 'absolute', left: '-9999px', width: 0, height: 0 }}
                      tabIndex={0}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsZoomed(false);
                        }
                      }}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Mini map */}
                <div className={styles.miniMap}>
                  <div 
                    className={styles.miniMapViewport}
                    style={{
                      left: `${zoomPosition.x * 0.6}%`,
                      top: `${zoomPosition.y * 0.6}%`
                    }}
                  />
                </div>
              </>
            )}
            
            {/* Action buttons */}
            <div className={styles.imageActions}>
              <button 
                className={styles.removeImage}
                onClick={handleRemove}
                aria-label={t.expense.deleteImage}
                title={t.expense.deleteImage}
              >
                <i className="fas fa-trash"></i>
              </button>
              
              {!isZoomed && (
                <button 
                  className={styles.zoomButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed(true);
                    setShowZoomHint(false);
                  }}
                  aria-label={t.expense.zoomImage}
                  title={t.expense.zoomImage}
                >
                  <i className="fas fa-search-plus"></i>
                </button>
              )}
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          hidden
        />
      </div>
      
      <button
        className={styles.analyzeButton}
        onClick={onAnalyze}
        disabled={!photo || analyzing || !canAnalyze}
      >
        {analyzing ? (
          <>
            <div className={styles.spinner}></div>
            <span>{t.expense.analyzing}</span>
          </>
        ) : (
          <>
            <i className="fas fa-brain"></i>
            <span>{t.expense.analyzeReceipt}</span>
          </>
        )}
      </button>
      
      {!canAnalyze && photo && (
        <div className={styles.offlineNote}>
          <i className="fas fa-wifi"></i>
          <span>{t.expense.photoRequired}</span>
        </div>
      )}

      {/* Keyboard shortcut handler */}
      {isZoomed && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0 }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsZoomed(false);
            }
          }}
          tabIndex={0}
          autoFocus
        />
      )}
    </div>
  );
};

export default PhotoUpload;