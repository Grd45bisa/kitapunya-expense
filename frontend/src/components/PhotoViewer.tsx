// components/PhotoViewer.tsx - Base64 Image Display Component (Fixed)
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './styles/PhotoViewer.module.css';

interface PhotoViewerProps {
  base64Data?: string | null;
  filename?: string;
  storeName?: string;
  onClose?: () => void;
  isModal?: boolean;
  className?: string;
  enableZoom?: boolean;
  showControls?: boolean;
  onFullscreen?: () => void;
}

const PhotoViewer: React.FC<PhotoViewerProps> = ({
  base64Data,
  filename,
  storeName,
  onClose,
  isModal = false,
  className,
  enableZoom = false,
  showControls = false,
  onFullscreen
}) => {
  const { language } = useLanguage();
  const imageRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showZoomHint, setShowZoomHint] = useState(false);

  // Auto-hide zoom hint after 3 seconds
  useEffect(() => {
    if (showZoomHint && enableZoom) {
      const timer = setTimeout(() => setShowZoomHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showZoomHint, enableZoom]);

  // Show zoom hint when image is first loaded
  useEffect(() => {
    if (base64Data && imageLoaded && !showZoomHint && enableZoom) {
      setShowZoomHint(true);
    }
  }, [base64Data, imageLoaded, enableZoom]);

  // Reset states when base64Data changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setIsZoomed(false);
    setZoomPosition({ x: 50, y: 50 });
  }, [base64Data]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (enableZoom && base64Data && !isDragging) {
      setIsZoomed(!isZoomed);
      if (!isZoomed) {
        setShowZoomHint(false);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (enableZoom && isZoomed) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableZoom || !isZoomed) return;

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
    if (enableZoom && base64Data && e.ctrlKey) {
      e.preventDefault();
      setIsZoomed(e.deltaY < 0);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isZoomed) {
        setIsZoomed(false);
      } else if (onClose) {
        onClose();
      }
    }
  };

  useEffect(() => {
    if (isModal) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isModal, isZoomed, onClose]);

  if (!base64Data) {
    return (
      <div className={`${styles.photoViewer} ${className || ''}`}>
        <div className={styles.noPhoto}>
          <i className="fas fa-image"></i>
          <span>{language === 'id' ? 'Tidak ada foto' : 'No photo available'}</span>
        </div>
      </div>
    );
  }

  if (isModal) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <div className={styles.modalTitle}>
              <i className="fas fa-receipt"></i>
              <div>
                <h3>{storeName || (language === 'id' ? 'Foto Struk' : 'Receipt Photo')}</h3>
                {filename && <p>{filename}</p>}
              </div>
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className={`${styles.modalImageContainer} ${isZoomed ? styles.zoomed : ''}`}>
            {!imageLoaded && !imageError && (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <span>{language === 'id' ? 'Memuat foto...' : 'Loading photo...'}</span>
              </div>
            )}
            
            {imageError && (
              <div className={styles.error}>
                <i className="fas fa-exclamation-triangle"></i>
                <span>{language === 'id' ? 'Gagal memuat foto' : 'Failed to load photo'}</span>
              </div>
            )}
            
            <img
              src={base64Data}
              alt={`Receipt from ${storeName || 'Store'}`}
              className={`${styles.modalImage} ${isZoomed ? styles.zoomedImage : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              onClick={handleImageClick}
              style={{ display: imageError ? 'none' : 'block' }}
            />
            
            {imageLoaded && (
              <div className={styles.imageControls}>
                <button
                  className={styles.zoomButton}
                  onClick={() => setIsZoomed(!isZoomed)}
                  title={isZoomed ? 
                    (language === 'id' ? 'Zoom Out' : 'Zoom Out') : 
                    (language === 'id' ? 'Zoom In' : 'Zoom In')
                  }
                >
                  <i className={`fas ${isZoomed ? 'fa-search-minus' : 'fa-search-plus'}`}></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.photoViewer} ${className || ''}`}>
      {!imageLoaded && !imageError && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      )}
      
      {imageError && (
        <div className={styles.error}>
          <i className="fas fa-exclamation-triangle"></i>
          <span>{language === 'id' ? 'Foto tidak dapat dimuat' : 'Photo could not be loaded'}</span>
        </div>
      )}
      
      {base64Data && !imageError && (
        <div
          ref={imageRef}
          className={`${styles.imageWrapper} ${isZoomed ? styles.imageZoomed : ''}`}
          onClick={handleImageClick}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
        >
          {/* Zoom hint tooltip */}
          {showZoomHint && !isZoomed && enableZoom && (
            <div className={styles.zoomHintTooltip}>
              <i className="fas fa-info-circle"></i>
              {language === 'id' ? 'Klik gambar untuk zoom' : 'Click image to zoom'}
            </div>
          )}

          <div 
            className={styles.imageContainer}
            style={{
              transform: isZoomed ? 'scale(1.8)' : 'scale(1)',
              transformOrigin: enableZoom ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center',
              cursor: enableZoom ? (isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in') : 'default'
            }}
          >
            <img
              src={base64Data}
              alt={`Receipt from ${storeName || 'Store'}`}
              className={styles.image}
              onLoad={handleImageLoad}
              onError={handleImageError}
              draggable={false}
            />
          </div>
          
          {/* Zoom controls */}
          {isZoomed && enableZoom && (
            <>
              <div className={styles.zoomControls}>
                <div className={styles.zoomInfo}>
                  <i className="fas fa-search-plus"></i>
                  <span>1.8x Zoom</span>
                </div>
                <div className={styles.zoomActions}>
                  <span className={styles.zoomHint}>
                    <i className="fas fa-hand-paper"></i> 
                    {language === 'id' ? 'Seret untuk memindahkan' : 'Drag to move'}
                  </span>
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
          {showControls && enableZoom && (
            <div className={styles.imageActions}>
              {!isZoomed && (
                <button 
                  className={styles.zoomButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed(true);
                    setShowZoomHint(false);
                  }}
                  title={language === 'id' ? 'Perbesar' : 'Zoom In'}
                >
                  <i className="fas fa-search-plus"></i>
                </button>
              )}
              
              <button 
                className={styles.fullscreenButton}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onFullscreen) onFullscreen();
                }}
                title={language === 'id' ? 'Layar penuh' : 'Fullscreen'}
              >
                <i className="fas fa-expand"></i>
              </button>
            </div>
          )}
        </div>
      )}
      
      {filename && imageLoaded && (
        <div className={styles.filename}>
          <i className="fas fa-file-image"></i>
          <span>{filename}</span>
        </div>
      )}
    </div>
  );
};

export default PhotoViewer;