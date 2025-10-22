'use client';

import { Fragment } from 'react';
import { Fraction } from './fraction';

interface VirtualWhiteboardProps {
  response: string;
}

const parseContent = (text: string) => {
  const parts = text.split(/(\[HIGHLIGHT\].*?\[\/HIGHLIGHT\]|\[FRAC\].*?\[\/FRAC\]|\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (!part) return null;

    const highlightMatch = part.match(/\[HIGHLIGHT\](.*?)\[\/HIGHLIGHT\]/);
    if (highlightMatch) {
      return (
        <span key={index} className="text-accent font-bold">
          {parseContent(highlightMatch[1])}
        </span>
      );
    }
    
    const boldMatch = part.match(/\*\*(.*?)\*\*/);
    if (boldMatch) {
      return <strong key={index}>{parseContent(boldMatch[1])}</strong>;
    }

    const fracMatch = part.match(/\[FRAC\](.*?)\[\/FRAC\]/);
    if (fracMatch) {
      return <Fraction key={index} value={fracMatch[1]} />;
    }

    return part.split('\n').map((line, i) => (
      <Fragment key={`${index}-${i}`}>
        {line}
        {i < part.split('\n').length - 1 && <br />}
      </Fragment>
    ));
  });
};

export function VirtualWhiteboard({ response }: VirtualWhiteboardProps) {
  const wbMatch = response.match(/\[WB\]([\s\S]*?)\[\/WB\]/);

  if (wbMatch) {
    const content = wbMatch[1];
    const stepMatches = Array.from(content.matchAll(/\[STEP\]([\s\S]*?)\[\/STEP\]/g));
    const calcMatches = Array.from(content.matchAll(/\[CALC\]([\s\S]*?)\[\/CALC\]/g));
    
    // Simple interleaving based on order of appearance
    const elements = [];
    let lastIndex = 0;

    while (stepMatches.length > 0 || calcMatches.length > 0) {
        const nextStep = stepMatches.length > 0 ? stepMatches[0] : null;
        const nextCalc = calcMatches.length > 0 ? calcMatches[0] : null;

        if (nextStep && (!nextCalc || (nextStep.index ?? 0) < (nextCalc.index ?? 0))) {
            elements.push({ type: 'step', content: nextStep[1], index: nextStep.index ?? 0 });
            stepMatches.shift();
        } else if (nextCalc) {
            elements.push({ type: 'calc', content: nextCalc[1], index: nextCalc.index ?? 0 });
            calcMatches.shift();
        }
    }

    return (
      <div className="space-y-4">
        {elements.map((el, index) => {
            if (el.type === 'step') {
                 return (
                    <p key={`step-${index}`} className="prose prose-sm max-w-none">
                        {parseContent(el.content)}
                    </p>
                );
            }
            if (el.type === 'calc') {
                return (
                    <div key={`calc-${index}`} className="bg-background/50 p-4 rounded-md font-mono text-sm whitespace-pre-wrap border">
                        {parseContent(el.content)}
                    </div>
                );
            }
            return null;
        })}
      </div>
    );
  }

  // Fallback for non-whiteboard content
  return <div className="prose prose-sm max-w-none whitespace-pre-wrap">{parseContent(response)}</div>;
}
