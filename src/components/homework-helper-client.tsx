'use client';
import { useState, useCallback, useRef, Fragment, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader, Send, Save, BrainCircuit, Mic, Square, FileText, CheckCircle, Paperclip, X, RefreshCw } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { homeworkHelper } from '@/ai/flows/homework-helper';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import type { ChatMessage, Member, Subject, TutoringSession } from '@/lib/types';
import { addTutoringSession, updateTutoringSession } from '@/services/tutoringSessions';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { useParams } from 'next/navigation';
import { VirtualWhiteboard } from './virtual-whiteboard';
import { generateSessionTitle } from '@/ai/flows/generate-session-title';

type Status = 'idle' | 'processing' | 'in_conversation' | 'error';
type RecordingStatus = 'idle' | 'recording' | 'processing';

const subjectPlaceholders: Record<string, string> = {
  matematicas: "¿Cómo se suman las fracciones?",
  lenguaje: "¿Cuál es la diferencia entre sujeto y predicado?",
  ciencias: "¿Puedes explicarme la fotosíntesis?",
  historia: "¿Qué fue la Revolución Francesa?",
  ingles: "¿Cómo se usa el 'present perfect'?",
  habilidades: "¿Cómo puedo mejorar mi concentración?",
  default: "Escribe tu duda aquí...",
};

interface HomeworkHelperClientProps {
  subject?: Subject;
  initialPrompt?: string | null;
  initialChatHistory?: ChatMessage[];
  resumedSession?: TutoringSession | null;
  onSessionSaved?: (savedSession?: TutoringSession) => Promise<void>;
  lessonTitle?: string;
}

// --- FUNCIÓN DE COMPRESIÓN AÑADIDA ---
const compressAndConvertToBase64 = (file: File, MAX_WIDTH = 800, MAX_HEIGHT = 800, QUALITY = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = reject;
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('No se pudo obtener el contexto del canvas.'));
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL(file.type, QUALITY);
        resolve(dataUrl);
      };
      img.onerror = reject;
    };
  });
};

export function HomeworkHelperClient({ subject, initialPrompt, initialChatHistory, resumedSession, onSessionSaved, lessonTitle }: HomeworkHelperClientProps) {
  const [file, setFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [currentProfile, setCurrentProfile] = useState<Member | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [currentSession, setCurrentSession] = useState<TutoringSession | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const params = useParams();
  const subjectId = (subject?.id || params.subjectId) as string;
  const placeholderText = subject ? (subjectPlaceholders[subject.id] || subjectPlaceholders.default) : subjectPlaceholders.default;
  const initialPromptRef = useRef(initialPrompt);

  // --- FUNCIÓN PARA RESETEAR EL INPUT DE ARCHIVO AÑADIDA ---
  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (resumedSession) {
        setChatHistory(resumedSession.sessionData);
        setCurrentSession(resumedSession);
        setStatus('in_conversation');
    } else if (initialChatHistory) {
        setChatHistory(initialChatHistory);
        setStatus('in_conversation');
    }
  }, [resumedSession, initialChatHistory, toast]);


  const startConversation = useCallback(async (
    input: { photoDataUri?: string | null; chatHistory: ChatMessage[], firstMessage?: string }
  ) => {
    setStatus('processing');
    
    const initialHistory: ChatMessage[] = input.firstMessage 
        ? [...input.chatHistory, { role: 'user', content: input.firstMessage }]
        : input.chatHistory;
    
    setChatHistory(initialHistory);

    try {
      const response = await homeworkHelper({
        photoDataUri: input.photoDataUri,
        chatHistory: initialHistory,
        userName: currentProfile?.name,
        subjectName: subject?.title,
      });
      setChatHistory(prev => [...prev, { role: 'model', content: response.response }]);
      setStatus('in_conversation');
    } catch (error) {
      console.error(error);
      setStatus('error');
      toast({
        title: 'Error de Análisis',
        description: 'LIA no pudo procesar tu solicitud. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  }, [currentProfile, subject, toast]);

  useEffect(() => {
    const profileString = sessionStorage.getItem('selectedProfile');
    if (profileString) {
      const profile = JSON.parse(profileString);
      setCurrentProfile(profile);
    }
  }, []);

  useEffect(() => {
    if (initialPromptRef.current && currentProfile && status === 'idle' && chatHistory.length === 0) {
      startConversation({ chatHistory: [], firstMessage: initialPromptRef.current });
      initialPromptRef.current = null;
    }
  }, [currentProfile, status, chatHistory.length, startConversation]);

  // --- handleFileChange MODIFICADO PARA USAR COMPRESIÓN ---
  const handleFileChange = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
       if (status === 'idle' || status === 'error') {
         resetChat();
      }
      
      try {
        const base64 = await compressAndConvertToBase64(selectedFile);
        setImageBase64(base64);
      } catch (error) {
        toast({
          title: "Error de compresión",
          description: "No se pudo procesar la imagen seleccionada.",
          variant: "destructive",
        });
        setFile(null);
        setImageBase64(null);
        resetFileInput();
      }
    }
  };
  
  // --- resetChat MODIFICADO PARA RESETEAR EL INPUT ---
  const resetChat = () => {
    setFile(null);
    setImageBase64(null);
    setChatHistory([]);
    setUserMessage('');
    setStatus('idle');
    setCurrentSession(null);
    resetFileInput();
    onSessionSaved?.();
  };

  // --- handleSendMessage MODIFICADO ---
  const handleSendMessage = async () => {
    const messageContent = userMessage.trim() || (imageBase64 ? "Analiza la imagen que adjunté, por favor." : "");
    if (!messageContent) return;

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: messageContent }];
    
    setUserMessage('');
    setChatHistory(newHistory);
    setStatus('processing');

    const inputPayload = {
        photoDataUri: imageBase64,
        chatHistory: newHistory,
        userName: currentProfile?.name,
        subjectName: subject?.title,
        lessonTopic: lessonTitle || currentSession?.title,
    };
    
    setFile(null);
    setImageBase64(null);
    resetFileInput();

    try {
      const response = await homeworkHelper(inputPayload);
      setChatHistory(prev => [...prev, { role: 'model', content: response.response }]);
      setStatus('in_conversation');
    } catch (error: any) {
        console.error(error);
        toast({ title: "Error de IA", description: "No se pudo obtener una respuesta.", variant: "destructive" });
        setChatHistory(prev => prev.slice(0, -1));
        if (messageContent !== "Analiza la imagen que adjunté, por favor.") {
          setUserMessage(messageContent);
        }
        setStatus('in_conversation');
    }
  };
  
  // EL RESTO DEL CÓDIGO PERMANECE INTACTO
  const handleSaveSession = async () => {
    if (!currentProfile || chatHistory.length < 2) { 
        toast({
            title: "No se puede guardar",
            description: "La lección es muy corta para ser guardada.",
            variant: "destructive"
        });
        return;
    }

    let savedSession: TutoringSession;

    try {
        if (currentSession) {
            const { updatedAt, studyDaysCount } = await updateTutoringSession(currentSession.id, chatHistory, currentSession);
            savedSession = { ...currentSession, sessionData: chatHistory, updatedAt, studyDaysCount };
            setCurrentSession(savedSession);
            toast({
                title: "¡Progreso Guardado!",
                description: "Tu lección ha sido actualizada."
            });
        } else {
            const titleToSave = lessonTitle || (await generateSessionTitle({ chatHistory })).title;
            const newSession = await addTutoringSession(currentProfile.ownerId, currentProfile.id, subjectId, chatHistory, titleToSave);
            savedSession = newSession;
            setCurrentSession(newSession);
            toast({
                title: "¡Lección Guardada!",
                description: "Puedes retomar esta lección más tarde."
            });
        }
        
        await onSessionSaved?.(savedSession);
        resetChat();

    } catch (error) {
        console.error("Failed to save session:", error);
        toast({
            title: "Error al guardar",
            description: "No se pudo guardar la sesión en la base de datos.",
            variant: "destructive"
        });
    }
  }
  
  const handleStartRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        audioChunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        
        mediaRecorderRef.current.onstop = async () => {
            setRecordingStatus('processing');
            
            try {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                if (audioBlob.size < 100) {
                    console.warn("Audio blob is too small, skipping transcription.");
                    setRecordingStatus('idle');
                    return;
                }
                
                const reader = new FileReader();
                const base64Audio = await new Promise<string>((resolve, reject) => {
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(audioBlob);
                });

                if (!base64Audio || base64Audio.length < 100) {
                    console.warn("Base64 audio data is too short, skipping transcription.");
                    setRecordingStatus('idle');
                    return;
                }

                const result = await transcribeAudio({ audioDataUri: base64Audio });
                
                if (result && result.text && result.text.trim()) {
                    setUserMessage(prev => (prev ? prev + ' ' : '') + result.text);
                    toast({
                        title: 'Transcripción completa',
                        description: 'Tu pregunta ha sido convertida a texto. Presiona Enviar para hablar con LIA.',
                    });
                }
            } catch (error) {
                console.error("Transcription error inside onstop:", error);
            } finally {
                setRecordingStatus('idle');
            }
        };
        
        mediaRecorderRef.current.start();
        setRecordingStatus('recording');
      } catch (err) {
        console.error('Error accessing microphone:', err);
        toast({
          title: 'Error de micrófono',
          description: 'No se pudo acceder al micrófono. Asegúrate de dar permiso.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recordingStatus === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFileChange(Array.from(files));
    }
  };
  
  const hasStarted = status !== 'idle' || chatHistory.length > 0;

  return (
    <div className="space-y-8">
      <Card className="h-screen flex flex-col">
          <CardHeader className="flex-row items-center justify-between">
              <div>
                  <CardTitle>Conversando con LIA sobre {subject?.title || 'Tareas'}</CardTitle>
                  <CardDescription>
                    {currentSession ? `Retomando la lección: "${currentSession.title}"` : 'Resuelve el problema paso a paso.'}
                  </CardDescription>
              </div>
               {hasStarted && (
                 <div className="flex items-center gap-2">
                    <Button onClick={resetChat} variant="outline" size="icon">
                        <RefreshCw className="h-4 w-4" />
                        <span className="sr-only">Empezar de nuevo</span>
                    </Button>
                    <Button onClick={handleSaveSession} variant="outline">
                        <Save className="mr-2 h-4 w-4" />
                        Finalizar y Guardar Lección
                    </Button>
                 </div>
               )}
          </CardHeader>
          <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
              <ScrollArea className="flex-grow pr-4" ref={chatContainerRef}>
                   <div className="space-y-4">
                      {chatHistory.length === 0 && status === 'idle' && (
                          <div className="text-center text-muted-foreground pt-16">
                              <BrainCircuit className="mx-auto h-12 w-12 mb-4" />
                              <p className="font-semibold">¡Hola! Soy LIA.</p>
                              <p>Cuéntame, ¿qué te gustaría aprender hoy?</p>
                          </div>
                      )}
                      {chatHistory.map((msg, index) => (
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
                              {msg.role === 'user' && currentProfile && (
                                   <Avatar className="w-8 h-8">
                                      <AvatarImage src={currentProfile.avatarUrl} alt={currentProfile.name} />
                                      <AvatarFallback>{currentProfile.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                              )}
                          </div>
                      ))}
                       {status === 'processing' && (
                          <div className="flex items-start gap-3">
                              <Avatar className="w-8 h-8 border-2 border-primary">
                                  <AvatarFallback>L</AvatarFallback>
                              </Avatar>
                              <div className="p-3 rounded-lg bg-muted flex items-center space-x-2">
                                 <Loader className="w-5 h-5 animate-spin" />
                                 <span>Pensando...</span>
                              </div>
                          </div>
                      )}
                  </div>
              </ScrollArea>
              <div className="space-y-2">
                  {file && imageBase64 && (
                      <div className="relative w-24 h-24 border rounded-md p-1">
                          <Image src={imageBase64} alt={file.name} layout="fill" objectFit="cover" className="rounded-sm" />
                          <Button
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                              onClick={() => { setFile(null); setImageBase64(null); resetFileInput(); }} // --- MODIFICADO ---
                          >
                              <X className="h-4 w-4" />
                          </Button>
                      </div>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                      <Textarea
                          value={userMessage}
                          onChange={(e) => setUserMessage(e.target.value)}
                          placeholder={placeholderText}
                          className="flex-grow"
                          rows={1}
                          onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                              }
                          }}
                          disabled={status === 'processing'}
                      />
                       <input
                          type="file"
                          ref={fileInputRef}
                          onChange={onFileInputChange}
                          accept="image/*"
                          className="hidden"
                      />
                       <Button 
                            variant="outline"
                            size="icon"
                            onClick={recordingStatus === 'recording' ? handleStopRecording : handleStartRecording}
                            disabled={status === 'processing' || recordingStatus === 'processing'}
                        >
                            {recordingStatus === 'recording' ? (
                                <Square className="w-5 h-5 text-red-500" />
                            ) : (
                                <Mic className="w-5 h-5" />
                            )}
                        </Button>
                      <Button variant="outline" size="icon" onClick={handleAttachmentClick} disabled={status === 'processing'}>
                          <Paperclip className="w-5 h-5" />
                      </Button>
                      <Button onClick={() => handleSendMessage()} disabled={status === 'processing' || (!userMessage.trim() && !file)}>
                          <Send className="w-4 h-4" />
                      </Button>
                  </div>
                   {(recordingStatus === 'recording' || recordingStatus === 'processing') && (
                    <p className="text-sm text-primary animate-pulse flex items-center gap-2 whitespace-nowrap justify-center">
                        {recordingStatus === 'processing' ? (
                            <><Loader className="mr-2 h-4 w-4 animate-spin" /> Procesando audio...</>
                        ) : (
                           <>
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary/80"></span>
                            </span>
                            Grabando...
                           </>
                        )}
                    </p>
                )}
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
