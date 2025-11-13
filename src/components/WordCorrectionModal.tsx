import React, { useState, useEffect } from 'react';
import { X, Save, Check } from 'lucide-react';

interface WordCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: string;
  onReplace: (newWord: string, replaceAll: boolean, saveToDict: boolean) => void;
}

export function WordCorrectionModal({ isOpen, onClose, word, onReplace }: WordCorrectionModalProps) {
  const [correctedWord, setCorrectedWord] = useState(word);
  const [saveToDict, setSaveToDict] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCorrectedWord(word);
      setSaveToDict(false);
    }
  }, [isOpen, word]);

  if (!isOpen) return null;

  const handleReplaceHere = () => {
    if (correctedWord.trim() && correctedWord !== word) {
      onReplace(correctedWord.trim(), false, saveToDict);
      onClose();
    }
  };

  const handleReplaceAll = () => {
    if (correctedWord.trim() && correctedWord !== word) {
      onReplace(correctedWord.trim(), true, saveToDict);
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReplaceAll();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Corriger le mot</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot original
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-medium">
              {word}
            </div>
          </div>

          <div>
            <label htmlFor="corrected-word" className="block text-sm font-medium text-gray-700 mb-2">
              Correction
            </label>
            <input
              id="corrected-word"
              type="text"
              value={correctedWord}
              onChange={(e) => setCorrectedWord(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Entrez la correction"
              autoFocus
            />
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <input
              type="checkbox"
              id="save-to-dict"
              checked={saveToDict}
              onChange={(e) => setSaveToDict(e.target.checked)}
              className="mt-1 w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
            />
            <label htmlFor="save-to-dict" className="text-sm text-gray-700 cursor-pointer flex-1">
              <span className="font-medium">Enregistrer dans le dictionnaire personnalisé</span>
              <p className="text-xs text-gray-600 mt-1">
                Cette correction sera automatiquement appliquée dans les futurs documents
              </p>
            </label>
          </div>
        </div>

        <div className="flex gap-3 p-6 bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleReplaceHere}
            disabled={!correctedWord.trim() || correctedWord === word}
            className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Modifier uniquement ici
          </button>
          <button
            onClick={handleReplaceAll}
            disabled={!correctedWord.trim() || correctedWord === word}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Remplacer tout
          </button>
        </div>
      </div>
    </div>
  );
}
