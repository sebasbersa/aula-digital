
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ChefHat, Sparkles, Loader, Clock, Flame, Info, Save, CheckCircle, X, Trash2, Send, Wand2 } from 'lucide-react';
import type { Recipe, Role, Member, ChatMessage } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { generateRecipeIdeas, generateFullRecipe, type GenerateRecipeIdeasOutput } from '@/ai/flows/generate-recipe';
import { askRecipeQuestion } from '@/ai/flows/ask-recipe-question';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { addRecipeWithSubject, getRecipes, deleteRecipe } from '@/services/recipes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';


function RecipeDetailView({ recipe }: { recipe: Recipe }) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-center">
                <div className="p-2 border rounded-md bg-background"><p className="font-semibold">{recipe.time}</p><p className="text-xs text-muted-foreground">Tiempo</p></div>
                <div className="p-2 border rounded-md bg-background"><p className="font-semibold">{recipe.servings}</p><p className="text-xs text-muted-foreground">Porciones</p></div>
                <div className="p-2 border rounded-md bg-background"><p className="font-semibold">{recipe.calories}</p><p className="text-xs text-muted-foreground">Calorías (aprox.)</p></div>
                <div className="p-2 border rounded-md bg-background"><p className="font-semibold">{recipe.difficulty}</p><p className="text-xs text-muted-foreground">Dificultad</p></div>
            </div>

            <div>
                <h3 className="font-semibold mb-2">Ingredientes</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                    {recipe.ingredients.map((ing: string, i: number) => <li key={i}>{ing}</li>)}
                </ul>
            </div>

            <Separator />

            <div>
                <h3 className="font-semibold mb-2">Preparación</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground pl-4">
                    {recipe.steps.map((step: string, i: number) => <li key={i}>{step}</li>)}
                </ol>
            </div>
            {recipe.tip && (
                 <div className="p-3 rounded-md bg-background border border-accent/50 text-sm">
                    <p className="font-semibold flex items-center gap-2"><Info className="w-4 h-4 text-accent" /> Consejo del Chef IA</p>
                    <p className="text-muted-foreground mt-1">{recipe.tip}</p>
                </div>
            )}
        </div>
    );
}


function RecipeCard({ recipe, onCardClick, onDeleteClick }: { recipe: Recipe, onCardClick: () => void, onDeleteClick: () => void }) {
  return (
    <Card className="flex flex-col group">
      <div onClick={onCardClick} className="flex-grow cursor-pointer hover:border-primary transition-colors">
        <CardHeader>
          <CardTitle>{recipe.title}</CardTitle>
          <div className="text-xs text-muted-foreground flex items-center gap-4 pt-1">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.time}</span>
              <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {recipe.calories}</span>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="font-semibold text-sm mb-2">Ingredientes:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {recipe.ingredients.slice(0, 3).map((ing, i) => <li key={i}>{ing}</li>)}
              {recipe.ingredients.length > 3 && <li>...</li>}
          </ul>
        </CardContent>
      </div>
      <div className="p-4 pt-0">
        <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick();
            }}
        >
            <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Eliminar
        </Button>
      </div>
    </Card>
  );
}

function GeneratedRecipeDisplay({ recipe, onSave, isSaved, currentProfile }: { recipe: Recipe, onSave: () => void, isSaved: boolean, currentProfile: Member | null }) {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userMessage, setUserMessage] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const { toast } = useToast();

    const handleSendMessage = async () => {
        if (!userMessage.trim()) return;

        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: userMessage }];
        setChatHistory(newHistory);
        const currentMessage = userMessage;
        setUserMessage('');
        setIsChatLoading(true);

        try {
            const { answer } = await askRecipeQuestion({ recipe, chatHistory: newHistory });
            setChatHistory(prev => [...prev, { role: 'model', content: answer }]);
        } catch (error) {
            console.error("Error asking recipe question:", error);
            toast({ title: 'Error', description: 'No se pudo obtener una respuesta. Inténtalo de nuevo.', variant: 'destructive' });
            // Restore the message and remove it from history on failure
            setChatHistory(prev => prev.filter(msg => !(msg.role === 'user' && msg.content === currentMessage)));
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
         <Card className="bg-secondary">
            <CardHeader>
                 <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent" /> {recipe.title}</CardTitle>
                         <CardDescription>
                            Aquí tienes una receta saludable y creativa con los ingredientes que tienes a mano.
                        </CardDescription>
                    </div>
                     <Button onClick={onSave} disabled={isSaved} size="sm" variant={isSaved ? "secondary" : "default"}>
                        {isSaved ? <CheckCircle className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                        {isSaved ? 'Guardada' : 'Guardar Receta'}
                    </Button>
                 </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <RecipeDetailView recipe={recipe} />
                <Separator />
                <div className="space-y-2">
                    <h3 className="font-semibold text-center">¿Tienes dudas? ¡Pregúntale a LIA!</h3>
                    <Card className="bg-background">
                        <CardContent className="p-4 space-y-4">
                            <ScrollArea className="h-48 pr-4">
                                <div className="space-y-4">
                                    {chatHistory.map((msg, index) => (
                                        <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' && 'justify-end')}>
                                            {msg.role === 'model' && <Avatar className="w-8 h-8 border-2 border-primary"><AvatarFallback>L</AvatarFallback></Avatar>}
                                            <div className={cn("p-3 rounded-lg max-w-sm", msg.role === 'model' ? 'bg-muted' : 'bg-primary text-primary-foreground')}>{msg.content}</div>
                                            {msg.role === 'user' && currentProfile && <Avatar className="w-8 h-8"><AvatarImage src={currentProfile.avatarUrl} /><AvatarFallback>{currentProfile.name.charAt(0)}</AvatarFallback></Avatar>}
                                        </div>
                                    ))}
                                    {isChatLoading && (
                                        <div className="flex items-start gap-3">
                                            <Avatar className="w-8 h-8 border-2 border-primary"><AvatarFallback>L</AvatarFallback></Avatar>
                                            <div className="p-3 rounded-lg bg-muted flex items-center space-x-2"><Loader className="w-5 h-5 animate-spin" /><span>...</span></div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                            <div className="flex items-center gap-2 pt-2">
                                <Textarea
                                    value={userMessage}
                                    onChange={(e) => setUserMessage(e.target.value)}
                                    placeholder="Ej: ¿Puedo sustituir el pollo por pescado?"
                                    rows={1}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                    disabled={isChatLoading}
                                />
                                <Button onClick={handleSendMessage} disabled={isChatLoading || !userMessage.trim()}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    )
}

const CATEGORIES = {
    'Desayunos': 'Desayuno',
    'Almuerzos': 'Almuerzo',
    'Cenas': 'Cena',
    'Snacks': 'Snack',
};

type CategoryKey = keyof typeof CATEGORIES;

export default function RecipesPage() {
  const params = useParams();
  const role = params.role as Role;
  const { toast } = useToast();

  const [currentProfile, setCurrentProfile] = useState<Member | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipeIdeas, setRecipeIdeas] = useState<GenerateRecipeIdeasOutput['ideas'] | null>(null);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [isRecipeSaved, setIsRecipeSaved] = useState(false);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [dataLoading, setDataLoading] = useState(true);
  
  const weeklyChallenge = "Esta semana, intenta preparar 3 cenas sin usar aceite para freír. ¡Usa el horno, la plancha o cocina al vapor!";
  
  const loadRecipes = useCallback(async (profileId: string) => {
    setDataLoading(true);
    try {
        const recipesFromDb = await getRecipes(profileId);
        setSavedRecipes(recipesFromDb);
    } catch (error) {
        console.error("Could not load saved recipes from Firestore", error);
        toast({ title: 'Error', description: 'No se pudieron cargar tus recetas guardadas.', variant: 'destructive' });
    } finally {
        setDataLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    const profileString = sessionStorage.getItem('selectedProfile');
    if (profileString) {
        const profile = JSON.parse(profileString);
        setCurrentProfile(profile);
        loadRecipes(profile.id);
    } else {
        setDataLoading(false);
    }
  }, [loadRecipes]);

  useEffect(() => {
    if (generatedRecipe) {
        const isAlreadySaved = savedRecipes.some(r => r.title === generatedRecipe.title);
        setIsRecipeSaved(isAlreadySaved);
    }
  }, [generatedRecipe, savedRecipes]);


  const handleGenerateIdeas = async () => {
    if (!userInput.trim()) {
        toast({ title: 'Ingredientes faltantes', description: 'Por favor, dime qué ingredientes tienes y qué te gustaría cocinar.', variant: 'destructive' });
        return;
    }
    setIsLoading(true);
    setRecipeIdeas(null);
    setGeneratedRecipe(null);
    try {
        const result = await generateRecipeIdeas({ ingredients: userInput });
        setRecipeIdeas(result.ideas);
    } catch (error) {
        console.error("Error generating recipe ideas:", error);
        toast({ title: 'Error', description: 'La IA no pudo generar ideas. Inténtalo de nuevo.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleSelectIdea = (title: string) => {
    setSelectedTitle(title);
    setIsCategoryDialogOpen(true);
  };
  
  const handleGenerateFullRecipe = async (category: string) => {
    setIsCategoryDialogOpen(false);
    setIsLoading(true);
    setRecipeIdeas(null);
    try {
        const result = await generateFullRecipe({
            category: category,
            ingredients: userInput,
            selectedTitle: selectedTitle,
        });
        setGeneratedRecipe({ ...result.recipe, category: category as any });
    } catch (error) {
        console.error("Error generating full recipe:", error);
        toast({ title: 'Error', description: 'La IA no pudo generar la receta completa. Inténtalo de nuevo.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe || !currentProfile) return;
  
    try {
      const newRecipe = await addRecipeWithSubject(
        currentProfile.ownerId,
        currentProfile.id,
        generatedRecipe,
        'cocina' // ✅ ID correcto del subject
      );
      setSavedRecipes(prev => [...prev, newRecipe]);
      toast({
        title: '¡Receta Guardada!',
        description: `"${generatedRecipe.title}" se ha añadido a Mis Recetas.`,
      });
    } catch (error) {
      console.error("Could not save recipe to Firestore", error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la receta en la base de datos.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRecipe = async (recipeToDelete: Recipe) => {
    if (!recipeToDelete.id) return;
    try {
        await deleteRecipe(recipeToDelete.id);
        setSavedRecipes(prev => prev.filter(r => r.id !== recipeToDelete.id));
        toast({
            title: 'Receta Eliminada',
            description: `"${recipeToDelete.title}" ha sido eliminada.`,
        });
    } catch (error) {
        console.error("Could not delete recipe from Firestore", error);
        toast({ title: 'Error', description: 'No se pudo eliminar la receta.', variant: 'destructive' });
    }
  };

  const recipesByCategory = (category: CategoryKey) => {
    return savedRecipes.filter(r => r.category === CATEGORIES[category]);
  }
  
  const handleBack = () => {
    setRecipeIdeas(null);
    setGeneratedRecipe(null);
  };

  return (
    <>
    <Dialog open={!!viewingRecipe} onOpenChange={(isOpen) => !isOpen && setViewingRecipe(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {viewingRecipe && (
                <>
                    <DialogHeader>
                        <DialogTitle>{viewingRecipe.title}</DialogTitle>
                        <DialogDescription>{viewingRecipe.description}</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="pr-4 max-h-[70vh]">
                        <RecipeDetailView recipe={viewingRecipe} />
                    </ScrollArea>
                </>
            )}
            <DialogClose asChild>
                <Button variant="outline" className="mt-4">Cerrar</Button>
            </DialogClose>
        </DialogContent>
    </Dialog>
    
     <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>¿Para qué momento del día es tu receta?</DialogTitle>
                <DialogDescription>
                    Selecciona una categoría para que LIA cree la receta perfecta para ti.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
                {Object.values(CATEGORIES).map((cat) => (
                    <Button
                        key={cat}
                        variant="outline"
                        size="lg"
                        onClick={() => handleGenerateFullRecipe(cat)}
                    >
                        {cat}
                    </Button>
                ))}
            </div>
        </DialogContent>
    </Dialog>

    <div className="container mx-auto py-8 space-y-8">
      <div>
        <Button asChild variant="outline" className="mb-4">
            <Link href={`/${role}/subjects`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Materias
            </Link>
        </Button>
        <div className="text-center">
             <ChefHat className="w-12 h-12 mx-auto text-primary" />
             <h1 className="text-4xl font-bold font-headline mt-2">Cocina Rápida y Saludable</h1>
             <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Usa la IA para crear platos increíbles con lo que tienes en tu despensa y guárdalos en tus recetas.
            </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent" /> LIA tu chef personal</CardTitle>
            <CardDescription>Dime qué ingredientes tienes, qué te gustaría cocinar, y te daré algunas ideas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {(recipeIdeas || generatedRecipe) && (
              <Button variant="outline" size="sm" onClick={handleBack}><ArrowLeft className="mr-2 h-4 w-4"/> Volver</Button>
            )}
            {!recipeIdeas && !generatedRecipe && (
                <>
                    <div>
                        <label htmlFor="ingredients-input" className="text-sm font-medium">1. Ingredientes que tienes a mano y qué te apetece</label>
                        <Textarea
                            id="ingredients-input"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Ej: Tengo huevos, espinaca y un poco de queso. Me gustaría hacer un omelette."
                            className="mt-1"
                            rows={3}
                        />
                    </div>
                    <Button onClick={handleGenerateIdeas} disabled={isLoading}>
                        {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Buscando ideas...' : 'Buscar Ideas'}
                    </Button>
                </>
            )}

            {isLoading && (
                 <div className="space-y-4 pt-4">
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                 </div>
            )}
            
            {recipeIdeas && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Aquí tienes algunas ideas. ¿Cuál te apetece más?</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        {recipeIdeas.map((idea, index) => (
                            <Card key={index} className="hover:border-primary hover:shadow-md transition cursor-pointer" onClick={() => handleSelectIdea(idea.title)}>
                                <CardHeader>
                                    <CardTitle className="text-base">{idea.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{idea.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {generatedRecipe && <GeneratedRecipeDisplay recipe={generatedRecipe} onSave={handleSaveRecipe} isSaved={isRecipeSaved} currentProfile={currentProfile} />}
        </CardContent>
      </Card>
      
      <div className="space-y-4">
         <div className="p-4 rounded-lg bg-secondary border">
            <h3 className="font-semibold text-lg flex items-center gap-2">🔥 Reto de la Semana</h3>
            <p className="text-muted-foreground mt-1">{weeklyChallenge}</p>
        </div>
        <div>
            <h2 className="text-2xl font-bold font-headline mb-4">Mis Recetas Guardadas</h2>
             <Tabs defaultValue="Desayunos" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                 {Object.keys(CATEGORIES).map(cat => (
                    <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
                ))}
              </TabsList>
                {Object.entries(CATEGORIES).map(([label, key]) => (
                     <TabsContent key={label} value={label} className="pt-4">
                        {dataLoading ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Skeleton className="h-64 w-full" />
                                <Skeleton className="h-64 w-full" />
                                <Skeleton className="h-64 w-full" />
                            </div>
                        ) : recipesByCategory(label as CategoryKey).length > 0 ? (
                             <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {recipesByCategory(label as CategoryKey).map(r => (
                                    <RecipeCard
                                        key={r.id}
                                        recipe={r}
                                        onCardClick={() => setViewingRecipe(r)}
                                        onDeleteClick={() => handleDeleteRecipe(r)}
                                    />
                                ))}
                             </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                Aún no has guardado ninguna receta de {label.toLowerCase()}.
                            </p>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
      </div>
    </div>
    </>
  );
}
