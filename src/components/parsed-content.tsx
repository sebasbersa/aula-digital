
'use client';

import { Fragment } from 'react';
import { Fraction } from './fraction';

interface ParsedContentProps {
  content: string;
}

export function ParsedContent({ content }: ParsedContentProps) {
  // Regex to match both simple [FRAC] and mixed [MFRAC] tags
  const parts = content.split(/(\[M?FRAC\].*?\[\/M?FRAC\])/g);
  
  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;

        const mfracMatch = part.match(/\[MFRAC\](\d+)\s+(.*?)\s*\[\/MFRAC\]/);
        if (mfracMatch) {
          const [, whole, fraction] = mfracMatch;
          return (
            <span key={index} className="inline-flex items-center align-middle">
              <span className="text-xl mr-1">{whole}</span>
              <Fraction value={fraction} />
            </span>
          );
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
      })}
    </>
  );
}
