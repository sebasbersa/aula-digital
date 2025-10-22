
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, UserPlus, Copy, Check, Loader, Search, Info, RefreshCw, MoreHorizontal } from 'lucide-react';
import { TrophyIcon, WhatsAppIcon, InstagramIcon, TikTokIcon } from '@/components/icons';
import type { Member } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getOrCreateFriendCode, findMemberByFriendCode, addFriend, getMembersByIds, recalculateMemberScore, getMemberById, removeFriend } from '@/services/members';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function RankingPage() {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [ranking, setRanking] = useState<Partial<Member>[]>([]);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [isLoadingRanking, setIsLoadingRanking] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const loadRankingData = async () => {
      setIsLoadingRanking(true);
      const profileString = sessionStorage.getItem('selectedProfile');
      if (profileString) {
        const profile = JSON.parse(profileString) as Member;
        const fullProfile = await getMemberById(profile.id); // Fetch latest data
        if (fullProfile) {
            setCurrentUser(fullProfile);

            let friendList: Member[] = [];
            if (fullProfile.friends && fullProfile.friends.length > 0) {
              friendList = await getMembersByIds(fullProfile.friends);
            }
            
            const fullRanking = [fullProfile, ...friendList].sort((a, b) => (b.score || 0) - (a.score || 0));
            setRanking(fullRanking);
        }
      }
      setIsLoadingRanking(false);
    };

  useEffect(() => {
    loadRankingData();

    // Listen for score updates from other tabs
    const handleScoreUpdate = (event: any) => {
        const { newScore } = event.detail;
        if (currentUser && newScore !== undefined) {
            const updatedUser = { ...currentUser, score: newScore };
            setCurrentUser(updatedUser);
            sessionStorage.setItem('selectedProfile', JSON.stringify(updatedUser));
            
            // Also update the ranking list
            setRanking(prevRanking => {
                const newRanking = prevRanking.map(member => 
                    member.id === updatedUser.id ? updatedUser : member
                );
                return newRanking.sort((a, b) => (b.score || 0) - (a.score || 0));
            });
        }
    };
    window.addEventListener('scoreUpdated', handleScoreUpdate as EventListener);

    return () => {
      window.removeEventListener('scoreUpdated', handleScoreUpdate as EventListener);
    };
  }, []);
  
  const handleRefreshRanking = async () => {
    if (!currentUser) return;
    setIsRefreshing(true);
    try {
        const newScore = await recalculateMemberScore(currentUser.id);
        
        // Fetch the entire updated profile to get the new score and any other changes.
        const updatedProfile = await getMemberById(currentUser.id);

        if (updatedProfile) {
            setCurrentUser(updatedProfile);
            sessionStorage.setItem('selectedProfile', JSON.stringify(updatedProfile));
            
            let friendList: Member[] = [];
            if (updatedProfile.friends && updatedProfile.friends.length > 0) {
              friendList = await getMembersByIds(updatedProfile.friends);
            }
            const fullRanking = [updatedProfile, ...friendList].sort((a, b) => (b.score || 0) - (a.score || 0));
            setRanking(fullRanking);
        }

        toast({
            title: 'Ranking Actualizado',
            description: `Tu nuevo puntaje es ${newScore}.`,
        });
    } catch (error) {
        console.error('Error refreshing ranking:', error);
        toast({
            title: 'Error',
            description: 'No se pudo actualizar el ranking.',
            variant: 'destructive',
        });
    } finally {
        setIsRefreshing(false);
    }
  };
  
  const handleRemoveFriend = async (friendId: string) => {
    if (!currentUser) return;
    try {
        await removeFriend(currentUser.id, friendId);
        
        // Optimistically update UI
        const updatedUser = { ...currentUser, friends: currentUser.friends?.filter(id => id !== friendId) };
        setCurrentUser(updatedUser);
        sessionStorage.setItem('selectedProfile', JSON.stringify(updatedUser));
        setRanking(prev => prev.filter(player => player.id !== friendId));

        toast({
            title: 'Amigo Eliminado',
            description: 'Has dejado de competir con este amigo.',
        });
    } catch (error: any) {
        console.error("Error removing friend:", error);
        toast({
            title: 'Error',
            description: error.message || 'No se pudo eliminar al amigo.',
            variant: 'destructive',
        });
    }
  };


  const shareText = `¡Este es mi código de amigo en Aula Familiar para que compitamos en el ranking! Cópialo y agrégame: ${currentUser?.friendCode}`;

  const handleCopyToClipboard = () => {
    if (!currentUser?.friendCode) return;
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      toast({
        title: '¡Copiado!',
        description: 'El mensaje ha sido copiado al portapapeles.',
      });
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        title: 'Error',
        description: 'No se pudo copiar el mensaje.',
        variant: 'destructive',
      });
    });
  };
  
   const handleWhatsAppShare = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleOpenInviteDialog = async () => {
    if (!currentUser) return;
    
    if (currentUser.friendCode) {
        setIsInviteDialogOpen(true);
        return;
    }

    setIsCodeLoading(true);
    setIsInviteDialogOpen(true);
    try {
        const code = await getOrCreateFriendCode(currentUser.id, currentUser.name);
        const updatedUser = { ...currentUser, friendCode: code };
        setCurrentUser(updatedUser);
        sessionStorage.setItem('selectedProfile', JSON.stringify(updatedUser));
    } catch (error) {
        console.error("Error getting friend code:", error);
        toast({
            title: 'Error',
            description: 'No se pudo generar tu código de amigo.',
            variant: 'destructive',
        });
        setIsInviteDialogOpen(false);
    } finally {
        setIsCodeLoading(false);
    }
  }
  
  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !friendCodeInput.trim()) return;

    setIsAddingFriend(true);
    try {
        const friend = await findMemberByFriendCode(friendCodeInput, currentUser.id);
        if (!friend) {
            toast({ title: 'Amigo no encontrado', description: 'El código de amigo no es válido o no existe.', variant: 'destructive' });
            return;
        }

        if (currentUser.friends?.includes(friend.id)) {
             toast({ title: 'Ya son amigos', description: `Ya eres amigo de ${friend.name}.`, variant: 'default' });
             return;
        }

        await addFriend(currentUser.id, friend.id);
        
        // Optimistically update UI
        const updatedUser = { ...currentUser, friends: [...(currentUser.friends || []), friend.id] };
        setCurrentUser(updatedUser);
        sessionStorage.setItem('selectedProfile', JSON.stringify(updatedUser));
        setRanking(prev => [...prev, friend].sort((a, b) => (b.score || 0) - (a.score || 0)));

        toast({ title: '¡Amigo añadido!', description: `Ahora estás compitiendo con ${friend.name}.` });
        setFriendCodeInput('');
    } catch (error: any) {
        console.error("Error adding friend:", error);
        toast({
            title: 'Error',
            description: error.message || 'No se pudo añadir al amigo.',
            variant: 'destructive',
        });
    } finally {
        setIsAddingFriend(false);
    }
  };


  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <TrophyIcon className="w-16 h-16 text-yellow-400 mx-auto" />
        <h1 className="text-4xl font-bold font-headline mt-2">Ranking de Amigos</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Compite con tus amigos completando Ensayos de Práctica. ¡El que sabe más, gana más puntos!
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Tabla de Clasificación</CardTitle>
                <CardDescription>
                    Este es el ranking actual. ¡Invita a tus amigos para competir!
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button className="bg-accent text-accent-foreground hover:bg-accent/90" size="icon">
                            <Info className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                         <DialogHeader>
                            <DialogTitle>¿Cómo se ganan los puntos?</DialogTitle>
                         </DialogHeader>
                        <AlertDescription>
                          Los puntos se calculan según la nota más alta que obtengas en cada ensayo único que realices. ¡Repetir un ensayo para mejorar tu nota puede aumentar tu puntaje total!
                          <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                            <li>**Nota inferior a 4.0:** 0 puntos</li>
                            <li>**Nota entre 4.0 y 4.9:** 10 puntos</li>
                            <li>**Nota entre 5.0 y 5.9:** 20 puntos</li>
                            <li>**Nota entre 6.0 y 6.9:** 30 puntos</li>
                            <li>**Nota 7.0:** 50 puntos</li>
                          </ul>
                        </AlertDescription>
                    </DialogContent>
                </Dialog>
                <Button onClick={handleRefreshRanking} variant="outline" size="icon" disabled={isRefreshing}>
                    {isRefreshing ? <Loader className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
                 <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleOpenInviteDialog}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invitar Amigos
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invita y Añade Amigos</DialogTitle>
                            <DialogDescription>
                              Añade a un amigo con su código o comparte el tuyo para que te agreguen.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddFriend} className="pt-2 space-y-2">
                            <label htmlFor="addFriendCode" className="text-sm font-medium text-muted-foreground">
                                Añadir por Código de Amigo
                            </label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="addFriendCode"
                                    placeholder="Ej: Camila#1234"
                                    value={friendCodeInput}
                                    onChange={(e) => setFriendCodeInput(e.target.value)}
                                    disabled={isAddingFriend}
                                />
                                <Button type="submit" size="icon" disabled={isAddingFriend || !friendCodeInput}>
                                    {isAddingFriend ? <Loader className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                </Button>
                            </div>
                        </form>
                        <Separator className="my-4" />
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="friendCode" className="text-sm font-medium text-muted-foreground">
                                    Tu Código de Amigo (para compartir)
                                </label>
                                <div className="flex items-center gap-2 mt-1">
                                    {isCodeLoading ? (
                                        <div className="flex items-center gap-2 w-full">
                                            <Input value="Generando..." readOnly disabled />
                                            <Button variant="outline" size="icon" disabled>
                                                <Loader className="h-4 w-4 animate-spin" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <Input id="friendCode" value={currentUser?.friendCode || ''} readOnly />
                                            <Button variant="outline" size="icon" onClick={handleCopyToClipboard} disabled={!currentUser?.friendCode}>
                                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                            </Button>
                                        </>
                                    )}
                                </div>
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
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Posición</TableHead>
                <TableHead>Estudiante</TableHead>
                <TableHead className="text-right">Puntaje</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingRanking ? (
                 <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                    <Loader className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : ranking.length > 0 ? (
                ranking.map((player, index) => (
                  <TableRow key={player.id} className={player.id === currentUser?.id ? 'bg-secondary' : ''}>
                    <TableCell className="text-center">
                      {index === 0 && <Crown className="w-6 h-6 text-yellow-400" />}
                      {index > 0 && <span className="text-xl font-bold text-muted-foreground">{index + 1}</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={player.avatarUrl} alt={player.name} />
                          <AvatarFallback>{player.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{player.name}</span>
                         {player.id === currentUser?.id && <Badge variant="outline">Tú</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg text-primary">
                      {player.score?.toLocaleString('es-CL') || 0}
                    </TableCell>
                    <TableCell className="text-right">
                       {player.id !== currentUser?.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleRemoveFriend(player.id!)}
                                >
                                  Eliminar Amigo
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                       )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                    Aún no hay nadie en tu ranking. ¡Invita a un amigo para empezar!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
