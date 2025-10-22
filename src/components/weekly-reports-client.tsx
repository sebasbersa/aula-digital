'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { generateWeeklyReport } from '@/ai/flows/weekly-progress-reports';
import { Loader, Wand2, Lightbulb } from 'lucide-react';
import { reports as mockReports } from '@/lib/data';
import type { Report } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function WeeklyReportsClient() {
    const [reports, setReports] = useState<Report[]>(mockReports);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleGenerateReport = async () => {
        setIsLoading(true);
        try {
            const newReportData = await generateWeeklyReport({
                userId: 'new-user-id',
                startDate: '2024-01-01',
                endDate: '2024-01-07',
            });
            const newReport: Report = {
                id: `report-${reports.length + 1}`,
                userName: 'Nuevo Estudiante',
                avatarUrl: 'https://placehold.co/100x100.png',
                summary: newReportData.summary,
                recommendations: newReportData.recommendations,
            };
            setReports(prev => [newReport, ...prev]);
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error al generar reporte',
                description: 'No se pudo crear el nuevo reporte. Por favor, inténtalo de nuevo.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-end mb-6">
                <Button onClick={handleGenerateReport} disabled={isLoading}>
                    {isLoading ? (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Generar Nuevo Reporte (Simulación)
                </Button>
            </div>
            <div className="space-y-6">
                {reports.map((report) => (
                    <Card key={report.id}>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={report.avatarUrl} alt={report.userName} />
                                <AvatarFallback>{report.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-xl font-headline">Reporte Semanal de {report.userName}</CardTitle>
                                <CardDescription>Resumen del 1 al 7 de Enero, 2024</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Resumen de hábitos de estudio</h3>
                                <p className="text-muted-foreground bg-secondary p-3 rounded-md">{report.summary}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                                    Recomendaciones
                                </h3>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    {report.recommendations.map((rec, index) => (
                                        <li key={index}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
