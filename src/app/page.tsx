'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2, ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('dall-e-2');
  const [size, setSize] = useState('1024x1024');
  const [quality, setQuality] = useState('standard');
  const [style, setStyle] = useState('vivid');
  const [numImages, setNumImages] = useState(1);
  const [generatedImage, setGeneratedImage] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [responseFormat, setResponseFormat] = useState('url');
  const [user, setUser] = useState('');

  const generateImageMutation = useMutation({
    mutationFn: async (formData: any) => {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        setGeneratedImage(data.url);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateImageMutation.mutate({ 
      prompt, 
      model, 
      size, 
      quality, 
      style, 
      n: numImages,
      responseFormat,
      user
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">AI Image Generator</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="prompt">Prompt</Label>
              <Input
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your image description"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Model</Label>
                <RadioGroup value={model} onValueChange={setModel} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dall-e-2" id="dall-e-2" />
                    <Label htmlFor="dall-e-2">DALL-E 2</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dall-e-3" id="dall-e-3" />
                    <Label htmlFor="dall-e-3">DALL-E 3</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="size">Size</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="256x256">256x256</SelectItem>
                    <SelectItem value="512x512">512x512</SelectItem>
                    <SelectItem value="1024x1024">1024x1024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quality">Quality</Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="hd">HD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="style">Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vivid">Vivid</SelectItem>
                    <SelectItem value="natural">Natural</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              {showAdvanced ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Hide Advanced Settings
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Show Advanced Settings
                </>
              )}
            </Button>

            {showAdvanced && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="responseFormat">Response Format</Label>
                  <Select value={responseFormat} onValueChange={setResponseFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select response format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="url">URL</SelectItem>
                      <SelectItem value="b64_json">Base64 JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="user">User Identifier</Label>
                  <Input
                    id="user"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    placeholder="Enter a unique identifier for the user"
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Number of Images: {numImages}</Label>
              <Slider
                value={[numImages]}
                onValueChange={(value) => setNumImages(value[0])}
                max={10}
                step={1}
                className="mt-2"
              />
            </div>
            <Button type="submit" disabled={generateImageMutation.isPending} className="w-full">
              {generateImageMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Generate Image
                </>
              )}
            </Button>
          </form>
        </div>
        <div className="w-full md:w-1/2">
          {generatedImage ? (
            <Image
              src={generatedImage}
              alt="Generated"
              width={500}
              height={500}
              className="w-full rounded-lg shadow-lg"
            />
          ) : (
            <Image
              src="https://via.placeholder.com/500x500?text=Your+image+will+appear+here"
              alt="Placeholder"
              width={500}
              height={500}
              className="w-full rounded-lg shadow-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
}