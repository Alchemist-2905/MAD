import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, ArrowRight, ArrowLeft, X } from 'lucide-react';

const TOUR_STEPS = [
  {
    title: "Welcome to HabitAI!",
    description: "Welcome to your intelligent behavior design station! This guide will walk you through HabitAI's capabilities in under a minute.",
    targetId: "tour-header-logo",
    tab: "tracker"
  },
  {
    title: "Dashboard Panels",
    description: "This navigation bar lets you toggle between the tracker, interactive graphs, cognitive advice, and telemetry data.",
    targetId: "tour-tab-container",
    tab: "tracker"
  },
  {
    title: "Habit Setup Builder",
    description: "Click this button to define new daily or weekly habits with titles, descriptions, and custom category tags.",
    targetId: "tour-btn-build",
    tab: "tracker"
  },
  {
    title: "Recent Habit Tracker",
    description: "This grid shows your compliance for the past 7 days. Click bubbles to complete habits and increment streaks!",
    targetId: "tour-tracker-bubbles",
    tab: "tracker"
  },
  {
    title: "Consistency Charts",
    description: "Switch to this tab to view custom SVG charts, radial goal rings, and focus milestone badges.",
    targetId: "tour-tab-consistency",
    tab: "consistency"
  },
  {
    title: "Cognitive AI Advisor",
    description: "Ask the AI model to analyze your habits and click velocity patterns to output personalized advice.",
    targetId: "tour-tab-ai",
    tab: "ai-advisor"
  },
  {
    title: "Behavior Telemetry (IoB)",
    description: "Explore raw telemetry tracking your session duration, click rates, and focus compliance indexes.",
    targetId: "tour-tab-iob",
    tab: "iob-analytics"
  }
];

export default function TutorialTour({ activeTab, setActiveTab, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState(null);
  const resizeTimeoutRef = useRef(null);

  const updateCoords = () => {
    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    const targetEl = document.getElementById(step.targetId);
    const cardEl = document.querySelector('.tour-fixed-card');

    if (targetEl && cardEl) {
      // Check if target is in viewport, if not scroll to it
      const rect = targetEl.getBoundingClientRect();
      const isInViewport = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );

      if (!isInViewport) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Re-query bounding rects after potential scroll
      const targetRect = targetEl.getBoundingClientRect();
      const cardRect = cardEl.getBoundingClientRect();

      const isTopHalf = targetRect.top < window.innerHeight / 2;
      
      // Target points: center-top or center-bottom of the element bounding box
      const targetX = targetRect.left + targetRect.width / 2;
      const targetY = isTopHalf ? targetRect.bottom + 8 : targetRect.top - 8;

      // Start arrow at the top-left area of the fixed card
      const startX = cardRect.left;
      const startY = cardRect.top + 25;

      setCoords({
        startX,
        startY,
        targetX,
        targetY,
        width: targetRect.width,
        height: targetRect.height,
        top: targetRect.top,
        left: targetRect.left
      });
    } else {
      setCoords(null);
    }
  };

  // Sync tab state and calculate coordinates on step changes
  useEffect(() => {
    const step = TOUR_STEPS[currentStep];
    if (step.tab && activeTab !== step.tab) {
      setActiveTab(step.tab);
    }

    // Coordinates calculation with incremental schedules to handle lazy rendering
    updateCoords();
    const t1 = setTimeout(updateCoords, 50);
    const t2 = setTimeout(updateCoords, 180);
    const t3 = setTimeout(updateCoords, 350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [currentStep, activeTab]);

  // Window listeners for resizing/scrolling
  useEffect(() => {
    const handleResizeOrScroll = () => {
      if (resizeTimeoutRef.current) {
        cancelAnimationFrame(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = requestAnimationFrame(updateCoords);
    };

    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll);

    return () => {
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll);
      if (resizeTimeoutRef.current) {
        cancelAnimationFrame(resizeTimeoutRef.current);
      }
    };
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Reset tab back to tracker and close tour
      setActiveTab('tracker');
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setActiveTab('tracker');
    onClose();
  };

  const step = TOUR_STEPS[currentStep];

  // Draw quadratic Bezier pointer line
  const getPointerPath = () => {
    if (!coords) return '';
    const { startX, startY, targetX, targetY } = coords;
    
    // Draw bezier curving to the left and arching towards target
    const dx = targetX - startX;
    const dy = targetY - startY;
    
    const cpX = startX + dx * 0.3 - 100;
    const cpY = startY + dy * 0.7 - 20;

    return `M ${startX} ${startY} Q ${cpX} ${cpY} ${targetX} ${targetY}`;
  };

  return (
    <>
      {/* Background dimmer overlay */}
      <div className="tour-backdrop" />

      {/* Target Element Spotlight Ring */}
      {coords && (
        <div 
          className="tour-spotlight-beacon"
          style={{
            width: `${coords.width + 12}px`,
            height: `${coords.height + 12}px`,
            top: `${coords.top - 6}px`,
            left: `${coords.left - 6}px`
          }}
        />
      )}

      {/* SVG Connecting Pointer Layer */}
      {coords && (
        <svg className="tour-svg-layer">
          <defs>
            <marker 
              id="tour-arrowhead" 
              markerWidth="8" 
              markerHeight="8" 
              refX="5" 
              refY="3" 
              orient="auto" 
              markerUnits="strokeWidth"
            >
              <path d="M0,1 L0,5 L5,3 Z" fill="#818cf8" />
            </marker>
          </defs>
          <path 
            className="tour-arrow-path" 
            d={getPointerPath()} 
            markerEnd="url(#tour-arrowhead)"
          />
        </svg>
      )}

      {/* Fixed Description Dialog Block (cursor preserves location) */}
      <div className="tour-fixed-card">
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="tour-step-badge">
              Guide: {currentStep + 1} / {TOUR_STEPS.length}
            </span>
            <button 
              onClick={handleSkip} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
          <h4 className="tour-title">{step.title}</h4>
          <p className="tour-description">{step.description}</p>
        </div>

        <div className="tour-controls">
          <button onClick={handleSkip} className="tour-btn-skip">
            Skip Tour
          </button>
          <div className="tour-buttons">
            {currentStep > 0 && (
              <button onClick={handlePrev} className="tour-btn tour-btn-back" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <ArrowLeft size={12} />
                <span>Back</span>
              </button>
            )}
            <button onClick={handleNext} className="tour-btn tour-btn-next" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>{currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
