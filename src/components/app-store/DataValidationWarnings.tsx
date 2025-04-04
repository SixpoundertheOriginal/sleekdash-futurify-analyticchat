
import React from 'react';
import { AlertTriangle, CheckCircle, Info, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DataValidationWarningsProps {
  validation: {
    isValid: boolean;
    confidence: number;
    warnings: string[];
    crossValidation?: {
      consistent: boolean;
      issues: string[];
    };
    confidenceScores?: {
      overall?: number;
      [key: string]: number | undefined;
    };
  };
  showDetails?: boolean;
}

export function DataValidationWarnings({ validation, showDetails = false }: DataValidationWarningsProps) {
  // No validation data available
  if (!validation) return null;
  
  const hasWarnings = validation.warnings && validation.warnings.length > 0;
  const hasCrossValidationIssues = validation.crossValidation?.issues && validation.crossValidation.issues.length > 0;
  
  // Determine confidence level category
  const getConfidenceLevel = () => {
    if (validation.confidence >= 80) return { label: "High", color: "text-green-500" };
    if (validation.confidence >= 60) return { label: "Medium", color: "text-yellow-500" };
    return { label: "Low", color: "text-red-500" };
  };
  
  const confidenceLevel = getConfidenceLevel();
  
  return (
    <div className="mb-4 text-sm">
      <div className="flex items-center gap-2 mb-1">
        {validation.isValid ? 
          <CheckCircle size={16} className="text-green-500" /> : 
          <AlertTriangle size={16} className="text-yellow-500" />
        }
        <div className="font-medium">
          Data Validation: {validation.isValid ? 'Passed' : 'Issues Found'}
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle size={14} className="text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Confidence score: {validation.confidence}% ({confidenceLevel.label})</p>
              {validation.confidenceScores && (
                <div className="mt-1 text-xs">
                  {Object.entries(validation.confidenceScores)
                    .filter(([key]) => key !== 'overall')
                    .map(([key, value]) => (
                      <div key={key}>{key}: {value}%</div>
                    ))
                  }
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {showDetails && (hasWarnings || hasCrossValidationIssues) && (
        <div className="ml-6 mt-2 space-y-1">
          {hasWarnings && (
            <div>
              <h4 className="text-xs font-medium text-gray-400 mb-1">Validation Warnings:</h4>
              <ul className="list-disc ml-4 text-yellow-500 text-xs space-y-1">
                {validation.warnings.map((warning, idx) => (
                  <li key={idx} className="text-gray-300">{warning}</li>
                ))}
              </ul>
            </div>
          )}
          
          {hasCrossValidationIssues && (
            <div className="mt-2">
              <h4 className="text-xs font-medium text-gray-400 mb-1">Cross-Validation Issues:</h4>
              <ul className="list-disc ml-4 text-amber-500 text-xs space-y-1">
                {validation.crossValidation.issues.map((issue, idx) => (
                  <li key={idx} className="text-gray-300">{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {!validation.isValid && (
        <div className="mt-3 p-2 bg-gray-800 rounded-md border border-gray-700 text-xs">
          <div className="flex items-center gap-1 mb-1 text-blue-400">
            <Info size={12} />
            <span className="font-medium">Tips for Better Extraction</span>
          </div>
          <ul className="pl-4 list-disc text-gray-300 space-y-1">
            <li>Include complete sections for all metric categories</li>
            <li>Use clear labels for each value (e.g., "Downloads: 10,000")</li>
            <li>Include percentage changes when available</li>
            <li>Make sure all important metrics are in your input data</li>
          </ul>
        </div>
      )}
    </div>
  );
}
