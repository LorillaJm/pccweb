'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  priority?: boolean;
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = '/placeholder.png',
  priority = false
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  useEffect(() => {
    if (isInView && src !== imageSrc) {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
      };
      img.onerror = () => {
        setIsLoading(false);
      };
    }
  }, [isInView, src, imageSrc]);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {width && height ? (
        <Image
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
          priority={priority}
        />
      ) : (
        <img
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
