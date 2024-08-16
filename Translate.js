import React from 'react';

const translateText = async (text, targetLanguage, sourceLanguage = 'auto') => {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        const data = await response.json();
        const translated = data[0][0][0];
        return translated;
    } catch (error) {
        console.error('Error translating text:', error);
        return text; // Return original text if there's an error
    }
};

export default translateText;
