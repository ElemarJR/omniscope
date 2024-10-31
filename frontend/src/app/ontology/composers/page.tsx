'use client';

import { useState, useEffect, useRef } from 'react';
import specs from './specs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/catalyst/textarea';
import { Wand2, SpellCheck, Waves } from 'lucide-react';

export default function OntologyComposers() {
  const [selectedSpec, setSelectedSpec] = useState('');

  const selectedSpecData = specs.find(spec => spec.name === selectedSpec);

  const calculateTextAreaHeight = (text: string) => {
    const div = document.createElement('div');
    div.style.width = '100%';
    div.style.padding = '0.5rem 0.75rem';
    div.style.border = '1px solid transparent';
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordBreak = 'break-word';
    div.style.font = window.getComputedStyle(document.body).font;
    div.innerText = text;
    
    document.body.appendChild(div);
    const height = Math.max(200, div.offsetHeight);
    document.body.removeChild(div);
    
    return height;
  };

  return (
    <>
      <div className="grid grid-cols-6 gap-4 mb-4">
        <div className="col-span-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Ontology Composers</h1>
          <p className="mt-2 text-lg text-gray-600 mb-8">
            Manage and view ontology compositions.
          </p>

          <Select onValueChange={setSelectedSpec} value={selectedSpec}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a specification type" />
            </SelectTrigger>
            <SelectContent>
              {specs.map(spec => (
                <SelectItem key={spec.name} value={spec.name}>
                  {spec.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedSpecData && (
            <div className="mt-8 space-y-8">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter document title..."
                  className="w-full text-4xl font-bold tracking-tight text-gray-900 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-blue-500 pb-2"
                />
              </div>

              {selectedSpecData.sections.map((section, index) => {
                const placeholderText = `${section.content}\n\nFormat: ${section.format}`;
                const initialHeight = calculateTextAreaHeight(placeholderText);
                
                return (
                  <div key={index} className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                    <div className="space-y-2">
                      <textarea 
                        className="w-full resize-none overflow-hidden p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={placeholderText}
                        style={{ 
                          minHeight: '300px',
                          height: `${initialHeight}px`
                        }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          const contentHeight = calculateTextAreaHeight(target.value || placeholderText);
                          target.style.height = `${contentHeight}px`;
                        }}
                      />
                      <div className="flex gap-2">
                        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <Wand2 className="w-4 h-4" />
                          Generate Content
                        </button>
                        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <SpellCheck className="w-4 h-4" />
                          Check Spelling
                        </button>
                        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <Waves className="w-4 h-4" />
                          Improve Flow
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Publish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
