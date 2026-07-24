import { useState, useEffect } from 'react';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface GraphicsProfile {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  particleCount: number;
  enableShadows: boolean;
  shadowMapSize: number;
  antialias: boolean;
  pixelRatio: number;
  fov: number;
  animationSubsampling: number;
}

export function useDeviceAdapter(): GraphicsProfile {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  if (isMobile) {
    return {
      deviceType: 'mobile',
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isTouch,
      particleCount: 450,
      enableShadows: false,
      shadowMapSize: 0,
      antialias: false,
      pixelRatio: 1.0,
      fov: 65,
      animationSubsampling: 2
    };
  }

  if (isTablet) {
    return {
      deviceType: 'tablet',
      isMobile: false,
      isTablet: true,
      isDesktop: false,
      isTouch,
      particleCount: 900,
      enableShadows: true,
      shadowMapSize: 1024,
      antialias: true,
      pixelRatio: 1.5,
      fov: 60,
      animationSubsampling: 1
    };
  }

  return {
    deviceType: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch,
    particleCount: 2200,
    enableShadows: true,
    shadowMapSize: 2048,
    antialias: true,
    pixelRatio: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 2, 2),
    fov: 55,
    animationSubsampling: 1
  };
}
