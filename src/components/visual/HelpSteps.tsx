/**
 * HelpSteps Component for the Web Help Component Library
 * @module @privify-pw/web-help/components/visual/HelpSteps
 * 
 * Headless component for step-by-step guides.
 */

import { forwardRef } from 'react';
import type { BaseComponentProps } from '../../core/types/components';

/**
 * Step item.
 */
export interface StepItem {
  /** Step title */
  title: React.ReactNode;
  /** Step content/description */
  content: React.ReactNode;
  /** Optional step number (auto-generated if not provided) */
  number?: number | string;
  /** Step status */
  status?: 'pending' | 'active' | 'completed';
  /** Icon for the step (overrides number) */
  icon?: React.ReactNode;
}

/**
 * Props for HelpSteps component.
 */
export interface HelpStepsProps extends BaseComponentProps {
  /** Step items */
  items: StepItem[];
  /** Current active step index */
  currentStep?: number;
  /** Orientation */
  orientation?: 'vertical' | 'horizontal';
  /** Show step numbers */
  showNumbers?: boolean;
  /** Show connecting lines */
  showConnectors?: boolean;
  /** Called when a step is clicked */
  onStepClick?: (index: number) => void;
  /** Render custom step */
  renderStep?: (item: StepItem, index: number) => React.ReactNode;
}

/**
 * Get step status based on current step.
 */
function getStepStatus(index: number, currentStep?: number): StepItem['status'] {
  if (currentStep === undefined) return undefined;
  if (index < currentStep) return 'completed';
  if (index === currentStep) return 'active';
  return 'pending';
}

/**
 * HelpSteps is a headless component for step-by-step guides.
 */
export const HelpSteps = forwardRef<HTMLDivElement, HelpStepsProps>(function HelpSteps(
  {
    items,
    currentStep,
    orientation = 'vertical',
    showNumbers = true,
    showConnectors = true,
    onStepClick,
    renderStep,
    className = '',
    ...props
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={`help-steps ${className}`.trim()}
      data-component="steps"
      data-orientation={orientation}
      data-connectors={showConnectors}
      role="list"
      aria-label="Steps"
      {...props}
    >
      {items.map((item, index) => {
        const status = item.status ?? getStepStatus(index, currentStep);
        const stepNumber = item.number ?? index + 1;
        const isClickable = !!onStepClick;

        if (renderStep) {
          return (
            <div
              key={index}
              className="help-step"
              data-step={index + 1}
              data-status={status}
              role="listitem"
            >
              {renderStep(item, index)}
            </div>
          );
        }

        const stepContent = (
          <>
            <div className="help-step-indicator">
              {item.icon ? (
                <span className="help-step-icon">{item.icon}</span>
              ) : showNumbers ? (
                <span className="help-step-number">{stepNumber}</span>
              ) : (
                <span className="help-step-dot" />
              )}
            </div>
            {showConnectors && index < items.length - 1 && (
              <div className="help-step-connector" aria-hidden="true" />
            )}
            <div className="help-step-content">
              <div className="help-step-title">{item.title}</div>
              <div className="help-step-description">{item.content}</div>
            </div>
          </>
        );

        return (
          <div
            key={index}
            className="help-step"
            data-step={index + 1}
            data-status={status}
            data-clickable={isClickable}
            role="listitem"
          >
            {isClickable ? (
              <button
                type="button"
                className="help-step-button"
                onClick={() => onStepClick?.(index)}
                aria-label={`Step ${stepNumber}: ${typeof item.title === 'string' ? item.title : ''}`}
              >
                {stepContent}
              </button>
            ) : (
              stepContent
            )}
          </div>
        );
      })}
    </div>
  );
});

HelpSteps.displayName = 'HelpSteps';
