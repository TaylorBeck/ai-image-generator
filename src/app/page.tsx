'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Loader2, ImageIcon, Download } from 'lucide-react';
import Image from 'next/image';

interface GenerateImageFormData {
  prompt: string;
  model: string;
  size: string;
  quality: string;
  style: string;
  n: number;
  image_size: string;
  num_inference_steps: number;
  seed?: number;
  enable_safety_checker: boolean;
}

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('dall-e-2');
  const [size, setSize] = useState('1024x1024');
  const [quality, setQuality] = useState('standard');
  const [style, setStyle] = useState('vivid');
  const [numImages, setNumImages] = useState(1);
  const [generatedImage, setGeneratedImage] = useState('');
  const [imageSize, setImageSize] = useState('landscape_4_3');
  const [numInferenceSteps, setNumInferenceSteps] = useState(4);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [enableSafetyChecker, setEnableSafetyChecker] = useState(true);

  const generateImageMutation = useMutation({
    mutationFn: async (formData: GenerateImageFormData) => {
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
      } else if (data.images && data.images.length > 0) {
        setGeneratedImage(data.images[0].url);
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
      image_size: imageSize,
      num_inference_steps: numInferenceSteps,
      seed,
      enable_safety_checker: enableSafetyChecker,
    });
  };

  const handleDownload = async () => {
    if (generatedImage) {
      try {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'generated-image.png';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading image:', error);
      }
    }
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
                name="prompt"
                value={prompt}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
                placeholder="Enter your image description"
                required
              />
            </div>
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
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flux-schnell" id="flux-schnell" />
                  <Label htmlFor="flux-schnell">FLUX Schnell</Label>
                </div>
              </RadioGroup>
            </div>
            {model === 'flux-schnell' ? (
              <>
                <div>
                  <Label htmlFor="imageSize">Image Size</Label>
                  <Select value={imageSize} onValueChange={setImageSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select image size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="square_hd">Square HD</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="portrait_4_3">Portrait 4:3</SelectItem>
                      <SelectItem value="portrait_16_9">Portrait 16:9</SelectItem>
                      <SelectItem value="landscape_4_3">Landscape 4:3</SelectItem>
                      <SelectItem value="landscape_16_9">Landscape 16:9</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="numInferenceSteps">Number of Inference Steps: {numInferenceSteps}</Label>
                  <Slider
                    value={[numInferenceSteps]}
                    onValueChange={(value) => setNumInferenceSteps(value[0])}
                    min={1}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="seed">Seed (optional)</Label>
                  <Input
                    id="seed"
                    type="number"
                    value={seed || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Enter a seed number (optional)"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableSafetyChecker"
                    checked={enableSafetyChecker}
                    onCheckedChange={setEnableSafetyChecker}
                  />
                  <Label htmlFor="enableSafetyChecker">Enable Safety Checker</Label>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
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
              </>
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
        <div className="w-full md:w-1/2 relative">
          {generatedImage ? (
            <>
              <Image
                src={generatedImage}
                alt="Generated"
                width={500}
                height={500}
                className="w-full rounded-lg shadow-lg"
              />
              <Button
                onClick={handleDownload}
                className="absolute top-2 right-2 p-2"
                variant="secondary"
                size="icon"
              >
                <Download className="h-4 w-4" />
              </Button>
            </>
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