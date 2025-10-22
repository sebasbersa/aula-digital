
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from './icons';
import { Check, Copy, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareStreakDialogProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
  userName: string;
  onShared: () => void;
}

export function ShareStreakDialog({ isOpen, onClose, streakCount, userName, onShared }: ShareStreakDialogProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareText = `¡${userName} lleva una racha de ${streakCount} ${streakCount === 1 ? 'semana' : 'semanas'} de estudio en Aula Familiar! 🔥 ¡Únete y potencia tu aprendizaje! #AulaFamiliar #RachaDeEstudio`;

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
    onShared();
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      toast({
        title: '¡Copiado!',
        description: 'El mensaje está listo para que lo pegues en tu red social favorita.',
      });
      setTimeout(() => setCopied(false), 2000);
      onShared();
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        title: 'Error',
        description: 'No se pudo copiar el texto.',
        variant: 'destructive',
      });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¡Comparte tu increíble racha!</DialogTitle>
          <DialogDescription>
            ¡Inspira a otros con tu dedicación y constancia!
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 p-6 rounded-lg bg-secondary flex flex-col items-center justify-center text-center">
            <Flame className="w-24 h-24 text-orange-500 mb-4" />
          <p className="text-xl font-semibold">Llevas una racha de</p>
          <p className="text-5xl font-bold font-headline text-primary my-2">{streakCount} {streakCount === 1 ? 'semana' : 'semanas'}</p>
          <p className="text-muted-foreground">¡Sigue así, {userName}!</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button onClick={handleWhatsAppShare} className="bg-green-500 hover:bg-green-600">
                <WhatsAppIcon className="mr-2 h-5 w-5" />
                WhatsApp
            </Button>
            <Button onClick={handleCopyToClipboard} className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white hover:opacity-90">
                <InstagramIcon className="mr-2 h-5 w-5" />
                Instagram
            </Button>
            <Button onClick={handleCopyToClipboard} className="bg-black text-white hover:bg-gray-800">
                <TikTokIcon className="mr-2 h-5 w-5" />
                TikTok
            </Button>
        </div>
         <div className="mt-2 text-center">
             <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? 'Mensaje Copiado' : 'Copiar Mensaje'}
            </Button>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
