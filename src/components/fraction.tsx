
'use client';

interface FractionProps {
  value: string;
}

export function Fraction({ value }: FractionProps) {
  const parts = value.split('/');
  
  if (parts.length < 2) {
    return <span>{parts[0]}</span>;
  }
  
  const [numerator, denominator] = parts;

  return (
    <span className="inline-flex flex-col items-center justify-center text-center mx-1 align-middle">
      <span className="border-b border-current px-1">{numerator}</span>
      <span className="px-1">{denominator}</span>
    </span>
  );
}
