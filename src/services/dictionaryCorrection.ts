import { supabase } from '../lib/supabase';

export async function applyDictionaryCorrections(text: string, userId: string): Promise<string> {
  const { data: dictionary } = await supabase
    .from('custom_dictionary')
    .select('incorrect_word, correct_word')
    .eq('user_id', userId);

  if (!dictionary || dictionary.length === 0) {
    return text;
  }

  let correctedText = text;

  dictionary.forEach(({ incorrect_word, correct_word }) => {
    const regex = new RegExp(`\\b${incorrect_word}\\b`, 'gi');
    correctedText = correctedText.replace(regex, correct_word);
  });

  return correctedText;
}
