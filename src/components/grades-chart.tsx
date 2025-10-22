
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Award } from 'lucide-react';
import type { Grade, Subject } from '@/lib/types';


export function GradesChart({ grades, subjects }: { grades: Grade[], subjects: Subject[] }) {
    const chartData = useMemo(() => {
        const gradesBySubject = grades.reduce((acc, grade) => {
            if (!acc[grade.subjectId]) {
                acc[grade.subjectId] = [];
            }
            acc[grade.subjectId].push(grade.grade);
            return acc;
        }, {} as Record<string, number[]>);
        
        const colorMap: Record<string, string> = {
            'matematicas': 'hsl(var(--chart-3))',
            'lenguaje': 'hsl(var(--chart-1))',
        };
        let otherColorIndex = 2;

        return subjects.map((subject) => {
            const subjectGrades = gradesBySubject[subject.id] || [];
            const average = subjectGrades.length > 0
                ? parseFloat((subjectGrades.reduce((a, b) => a + b, 0) / subjectGrades.length).toFixed(1))
                : 0;

            let color = colorMap[subject.id];
            if (!color) {
                 if (otherColorIndex === 1 || otherColorIndex === 3) otherColorIndex++;
                 const chartIndex = (otherColorIndex % 5) + 1;
                 color = `hsl(var(--chart-${chartIndex}))`;
                 colorMap[subject.id] = color;
                 otherColorIndex++;
            }

            return {
                name: subject.title,
                promedio: average,
                fill: color,
            };
        });
    }, [grades, subjects]);
    
    const hasGrades = useMemo(() => grades.length > 0, [grades]);

    if (!hasGrades) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Mi Progreso de Notas</CardTitle>
                    <CardDescription>¡Registra tus notas para ver tu progreso aquí!</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground pt-10">
                    <p className="mb-4">Aún no has añadido ninguna calificación.</p>
                    <Button asChild>
                        <Link href="/student/grades">
                           <Award className="mr-2 h-4 w-4" /> Registrar mi primera nota
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const CustomTick = (props: any) => {
        const { x, y, payload, data } = props;
        const item = data.find((d: any) => d.name === payload.value);
        
        return (
            <g transform={`translate(${x},${y})`}>
              <text x={0} y={0} dy={16} textAnchor="middle" fill={item?.fill || '#000'} className="text-xs font-semibold">
                {payload.value}
              </text>
            </g>
          );
    };

    return (
         <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Mi Progreso por Asignatura</CardTitle>
                <CardDescription>
                    Aquí puedes ver tu rendimiento en cada materia. ¡Sigue esforzándote!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="h-64 w-full">
                    <ResponsiveContainer>
                        <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                tickLine={false}
                                axisLine={true} 
                                stroke="hsl(var(--muted-foreground))"
                                tickMargin={10}
                                height={50}
                                interval={0}
                                tick={<CustomTick data={chartData} />}
                             />
                            <YAxis 
                                domain={[1, 7]} 
                                tickLine={false} 
                                axisLine={true} 
                                stroke="hsl(var(--muted-foreground))"
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            />
                            <Tooltip 
                                cursor={{ fill: 'hsl(var(--muted))' }}
                                content={<ChartTooltipContent 
                                    formatter={(value) => `${value}`}
                                    labelFormatter={(label) => `Promedio en ${label}`}
                                />} 
                            />
                            <Bar dataKey="promedio" radius={4}>
                                <LabelList dataKey="promedio" position="top" offset={8} className="fill-foreground text-xs" formatter={(value: number) => value > 0 ? value.toFixed(1) : ''}/>
                            </Bar>
                            <ReferenceLine y={6.5} label={{ value: 'Meta: 6.5', position: 'insideTopRight', fill: 'hsl(var(--foreground))' }} stroke="hsl(var(--accent))" strokeDasharray="3 3" />
                            <ReferenceLine y={4.0} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

    