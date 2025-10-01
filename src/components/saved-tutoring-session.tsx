
'use client';

import { useRef, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from './ui/button';
import { Printer, Trash2, Edit, Play, Save, X, FileText, Calendar, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import type { TutoringSession } from '@/services/tutoringSessions';
import { Input } from './ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VirtualWhiteboard } from './virtual-whiteboard';

interface SavedTutoringSessionProps {
  session: TutoringSession;
  onDelete: (sessionId: string) => void;
  onResume: (session: TutoringSession) => void;
  onCreatePracticeGuide: (session: TutoringSession) => void;
  levelAndUnitDisplay: string;
}

export function SavedTutoringSession({ session, onDelete, onResume, onCreatePracticeGuide, levelAndUnitDisplay }: SavedTutoringSessionProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [userProfile, setUserProfile] = useState<{name: string, avatarUrl: string} | null>(null);

  useEffect(() => {
      const profileString = sessionStorage.getItem('selectedProfile');
      if (profileString) {
          setUserProfile(JSON.parse(profileString));
      }
  }, []);
  
  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (printContent) {
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write(`<html><head><title>${session.title}</title>`);
        printWindow.document.write(`
          <style>
            body { font-family: sans-serif; line-height: 1.5; }
            .message { margin-bottom: 1rem; }
            .model .message-content { background-color: #f1f5f9; padding: 0.75rem; border-radius: 0.5rem; }
            .user { text-align: right; }
            .user .message-content { background-color: #3b82f6; color: white; display: inline-block; padding: 0.75rem; border-radius: 0.5rem; text-align: left; }
            h1, h2 { border-bottom: 1px solid #ccc; padding-bottom: 0.5rem; }
            .fraction { display: inline-flex; flex-direction: column; text-align: center; vertical-align: middle; margin: 0 0.25rem; }
            .fraction-numerator { border-bottom: 1px solid currentColor; padding: 0 0.25rem; }
            .fraction-denominator { padding: 0 0.25rem; }
          </style>
        `);
        printWindow.document.write('</head><body>');
        printWindow.document.write(`<h1>${session.title}</h1>`);
        
        const printableChat = session.sessionData.map(msg => `
            <div class="message ${msg.role}">
                <strong>${msg.role === 'model' ? 'LIA' : userProfile?.name || 'Tú'}:</strong>
                <div class="message-content">
                ${msg.content.replace(/\[FRAC\](.*?)\[\/FRAC\]/g, (match, p1) => {
                    const [num, den] = p1.split('/');
                    return `<span class="fraction"><span class="fraction-numerator">${num}</span><span class="fraction-denominator">${den}</span></span>`;
                }).replace(/\n/g, '<br />')}
                </div>
            </div>`
        ).join('');
        
        printWindow.document.write(printableChat);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={session.id} className="border rounded-md px-4">
        <div className="flex items-center justify-between w-full py-2">
            <AccordionTrigger className="flex-1 text-left hover:no-underline py-0">
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{session.title}</span>
                <p className="text-xs text-primary font-medium">{levelAndUnitDisplay}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3"/>
                        <span>Última vez: {format(session.updatedAt, "d 'de' MMMM, yyyy", { locale: es })}</span>
                    </div>
                </div>
              </div>
            </AccordionTrigger>
             <div className="flex items-center gap-2 pl-2">
                <Button size="sm" onClick={() => onResume(session)}>
                  <Play className="mr-2 h-4 w-4" />
                  Retomar
                </Button>
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => onCreatePracticeGuide(session)}>
                    <FileText className="mr-2 h-4 w-4"/>
                    Crear Ensayo
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                     <DropdownMenuItem onClick={handlePrint}>
                      <Printer className="mr-2 h-4 w-4" />
                      Imprimir
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente la lección guardada.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(session.id)}>
                            Sí, eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
        <AccordionContent>
          <div className="space-y-4 max-h-96 overflow-y-auto p-4 border rounded-md" ref={printRef}>
             {session.sessionData.map((msg, index) => (
                <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' && 'justify-end')}>
                    {msg.role === 'model' && (
                         <Avatar className="w-8 h-8 border-2 border-primary">
                            <AvatarFallback>L</AvatarFallback>
                        </Avatar>
                    )}
                    <div className={cn("p-3 rounded-lg max-w-sm md:max-w-md lg:max-w-lg", 
                        msg.role === 'model' ? 'bg-muted' : 'bg-primary text-primary-foreground'
                    )}>
                        <VirtualWhiteboard response={msg.content} />
                    </div>
                    {msg.role === 'user' && userProfile && (
                         <Avatar className="w-8 h-8">
                            <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
                            <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
