import React, { useEffect, useRef } from 'react';
import { AudioEngine } from '../services/audioEngine';

interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  barColor?: string;
  className?: string;
}

/**
 * CAVA-inspired audio spectrum visualizer using HTML5 Canvas & Web Audio API.
 * STRICTLY NO GRADIENTS: uses solid static accent color bars with smooth decay.
 */
export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  barCount = 20,
  barColor = '#BB9AF7',
  className = 'w-28 h-6',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const smoothedValuesRef = useRef<number[]>([]);

  useEffect(() => {
    // Initialize or resize smoothed buffer
    smoothedValuesRef.current = new Array(barCount).fill(0);
  }, [barCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const engine = AudioEngine.getInstance();

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const freqData = engine.getFrequencyData();
      const smoothed = smoothedValuesRef.current;

      const spacing = 2;
      const totalSpacing = spacing * (barCount - 1);
      const barWidth = Math.max(2, (width - totalSpacing) / barCount);

      // Solid color fill only - strictly no gradients
      ctx.fillStyle = barColor;

      for (let i = 0; i < barCount; i++) {
        let targetValue = 0;

        if (freqData && isPlaying) {
          // Sample logarithmically/linearly across the lower-to-mid spectrum
          // where musical energy resides
          const dataIndex = Math.min(
            freqData.length - 1,
            Math.floor(Math.pow(i / barCount, 1.25) * (freqData.length * 0.85))
          );
          targetValue = (freqData[dataIndex] || 0) / 255;
        }

        // Smooth decay / rise
        const prev = smoothed[i] || 0;
        if (targetValue > prev) {
          smoothed[i] = prev * 0.4 + targetValue * 0.6; // fast rise
        } else {
          smoothed[i] = prev * 0.88; // gentle decay
        }

        // Minimum idle height of 2px for clean visual presence
        const barHeight = Math.max(2, smoothed[i] * (height - 2));
        const x = i * (barWidth + spacing);
        const y = height - barHeight;

        // Draw solid rounded rectangle bar
        const radius = Math.min(barWidth / 2, 2);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, height);
        ctx.lineTo(x, height);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, barCount, barColor]);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={28}
      className={`${className} block`}
      aria-label="Audio spectrum visualizer"
    />
  );
};
