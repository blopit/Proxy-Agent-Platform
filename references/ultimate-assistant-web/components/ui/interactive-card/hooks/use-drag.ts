import { useState, useCallback, useRef } from 'react';
import type { InteractiveCardProps } from '../types';

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

interface UseDragReturn {
  dragStyle: React.CSSProperties;
  isDragging: boolean;
  handleDragStart: (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void;
  handleDragMove: (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void;
  handleDragEnd: () => void;
}

export function useDrag({
  maxDragDistance = 50,
}: Pick<InteractiveCardProps, 'maxDragDistance'>): UseDragReturn {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });

  const frameRef = useRef<number>();

  const getEventCoordinates = useCallback((e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    if ('touches' in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    const { x, y } = getEventCoordinates(e);
    setDragState(prev => ({
      ...prev,
      isDragging: true,
      startX: x - prev.offsetX,
      startY: y - prev.offsetY,
    }));
  }, [getEventCoordinates]);

  const handleDragMove = useCallback((e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    if (!dragState.isDragging) return;

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      const { x, y } = getEventCoordinates(e);
      const offsetX = x - dragState.startX;
      const offsetY = y - dragState.startY;

      // Limit drag distance
      const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
      if (distance > maxDragDistance) {
        const scale = maxDragDistance / distance;
        setDragState(prev => ({
          ...prev,
          offsetX: offsetX * scale,
          offsetY: offsetY * scale,
        }));
      } else {
        setDragState(prev => ({
          ...prev,
          offsetX,
          offsetY,
        }));
      }
    });
  }, [dragState.isDragging, dragState.startX, dragState.startY, maxDragDistance, getEventCoordinates]);

  const handleDragEnd = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    setDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
    });
  }, []);

  const dragStyle: React.CSSProperties = {
    transform: `translate3d(${dragState.offsetX}px, ${dragState.offsetY}px, 0)`,
    transition: dragState.isDragging ? 'none' : 'transform 0.3s ease-out',
    cursor: dragState.isDragging ? 'grabbing' : 'grab',
    willChange: 'transform',
  };

  return {
    dragStyle,
    isDragging: dragState.isDragging,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
} 