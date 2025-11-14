import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Proverb {
  id: string;
  text: string;
  word: string;
  timestamp: number;
}

const proverbTemplates = [
  'Не говори гоп, пока не {word}',
  'Семь раз отмерь, один раз {word}',
  'Волков бояться — в {word} не ходить',
  'Что посеешь, то и {word}',
  'Тише едешь — дальше {word}',
  'Без труда не вытащишь и {word} из пруда',
  'Утро вечера {word}',
  'Куй железо, пока {word}',
  'Не всё то золото, что {word}',
  'Один в поле не {word}',
  'Под лежачий камень {word} не течёт',
  'Готовь сани летом, а {word} зимой',
  'Яблоко от яблони недалеко {word}',
  'За двумя зайцами погонишься — ни одного {word} не поймаешь',
  'Дареному коню в {word} не смотрят',
  'Слово — не воробей, вылетит — не {word}',
  'В гостях хорошо, а {word} лучше',
  'Делу время — {word} час',
  'Любишь кататься — люби и {word} возить',
  'На вкус и {word} товарища нет'
];

const Index = () => {
  const [word, setWord] = useState('');
  const [currentProverb, setCurrentProverb] = useState('');
  const [history, setHistory] = useState<Proverb[]>([]);
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const generateProverb = () => {
    if (!word.trim()) {
      toast.error('Введите слово для генерации');
      return;
    }

    const randomTemplate = proverbTemplates[Math.floor(Math.random() * proverbTemplates.length)];
    const generatedProverb = randomTemplate.replace('{word}', word.trim());
    
    const newProverb: Proverb = {
      id: Date.now().toString(),
      text: generatedProverb,
      word: word.trim(),
      timestamp: Date.now()
    };

    setCurrentProverb(generatedProverb);
    setHistory(prev => [newProverb, ...prev].slice(0, 10));
    toast.success('Пословица сгенерирована!');
  };

  const handleShare = (proverbText: string) => {
    const shareUrl = `${window.location.origin}?p=${encodeURIComponent(proverbText)}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Ссылка скопирована в буфер обмена');
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Ссылка скопирована в буфер обмена');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      generateProverb();
    }
  };

  const handleGenerateImage = async (proverbText: string) => {
    setIsGeneratingImage(true);
    setGeneratedImageUrl('');

    try {
      const response = await fetch('https://functions.poehali.dev/d8b33728-48cc-4b65-a127-a6fd517372c0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: proverbText }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImageUrl(data.imageUrl);
      toast.success('Изображение создано!');
    } catch (error) {
      toast.error('Ошибка при создании изображения');
      console.error('Image generation error:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-4">
            Генератор пословиц
          </h1>
          <p className="text-lg text-muted-foreground">
            Добавь своё слово в народную мудрость
          </p>
        </div>

        <Card className="p-8 md:p-12 mb-12 shadow-lg animate-scale-in">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              type="text"
              placeholder="Введите слово..."
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-lg h-14 flex-1"
            />
            <Button 
              onClick={generateProverb}
              size="lg"
              className="h-14 px-8 text-lg font-medium"
            >
              <Icon name="Sparkles" className="mr-2" size={20} />
              Генерировать
            </Button>
          </div>

          {currentProverb && (
            <div className="mt-8 animate-fade-in">
              <div className="bg-secondary rounded-lg p-6 relative">
                <p className="text-2xl md:text-3xl font-heading font-semibold text-center text-foreground leading-relaxed">
                  «{currentProverb}»
                </p>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleGenerateImage(currentProverb)}
                    disabled={isGeneratingImage}
                  >
                    <Icon name={isGeneratingImage ? "Loader2" : "Image"} size={18} className={isGeneratingImage ? "animate-spin" : ""} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(currentProverb)}
                  >
                    <Icon name="Share2" size={18} />
                  </Button>
                </div>
              </div>
              
              {generatedImageUrl && (
                <div className="mt-6 animate-scale-in">
                  <img 
                    src={generatedImageUrl} 
                    alt={currentProverb}
                    className="w-full rounded-lg shadow-lg"
                  />
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = generatedImageUrl;
                        link.download = 'proverb.png';
                        link.click();
                      }}
                    >
                      <Icon name="Download" className="mr-2" size={18} />
                      Скачать изображение
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {history.length > 0 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-heading font-semibold mb-6 text-foreground">
              История генераций
            </h2>
            <div className="space-y-3">
              {history.map((item) => (
                <Card 
                  key={item.id} 
                  className="p-5 hover:shadow-md transition-shadow duration-200 animate-scale-in"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-lg text-foreground flex-1">
                      {item.text}
                    </p>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGenerateImage(item.text)}
                        disabled={isGeneratingImage}
                      >
                        <Icon name="Image" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(item.text)}
                      >
                        <Icon name="Share2" size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;