import React, { useState, useCallback, useEffect } from 'react';

// --- Helper Components ---

const Spinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-500"></div>
    <p className="text-lg text-slate-600">Brewing your bionic text...</p>
  </div>
);

const GearIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
        <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
    </svg>
);


// --- Bionic Reading Transformation Logic ---

const transformWord = (word: string, percentage: number): React.ReactNode => {
    const match = word.match(/^(\w+)(.*)$/); // Separate word from trailing punctuation
    if (!match) return word;

    const [, wordPart, punctuationPart] = match;
    const len = wordPart.length;

    if (len === 0) return punctuationPart;

    // Calculate how many characters to bold based on the percentage
    let boldCount = Math.ceil(len * percentage);

    // Ensure at least 1 character is bold, and not more than the total length
    boldCount = Math.max(1, Math.min(len, boldCount));

    const boldPart = wordPart.substring(0, boldCount);
    const regularPart = wordPart.substring(boldCount);

    return (
        <>
            <span className="font-bold text-slate-900">{boldPart}</span>
            <span className="text-slate-700">{regularPart}{punctuationPart}</span>
        </>
    );
};

const transformTextToBionic = (text: string, percentage: number): React.ReactNode[] => {
    return text.split(/\n\s*\n/).map((paragraph, pIndex) => (
        <p key={`p-${pIndex}`} className="mb-4 leading-relaxed">
            {paragraph.split(' ').map((word, wIndex) => (
                <span key={`w-${wIndex}`}>
                    {transformWord(word, percentage)}{' '}
                </span>
            ))}
        </p>
    ));
};


// --- Main Application Component ---

const App: React.FC = () => {
    const [inputText, setInputText] = useState<string>('');
    const [originalText, setOriginalText] = useState<string | null>(null);
    const [bionicContent, setBionicContent] = useState<React.ReactNode | null>(null);
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
    const [boldPercentage, setBoldPercentage] = useState<number>(0.4); // Default: 40%
    
    // Re-transform text when settings change
    useEffect(() => {
        if (originalText) {
            const transformedContent = transformTextToBionic(originalText, boldPercentage);
            setBionicContent(transformedContent);
        }
    }, [originalText, boldPercentage]);


    const handleConvert = () => {
        if (!inputText.trim()) {
            setError("Please enter some text to convert.");
            return;
        }
        setError(null);
        setIsLoading(true);
        // Simulate a short delay for UX, as text conversion is very fast
        setTimeout(() => {
            setOriginalText(inputText);
            setIsLoading(false);
        }, 200);
    };
    
    const handleClear = () => {
        setInputText('');
        setBionicContent(null);
        setOriginalText(null);
        setError(null);
        setIsLoading(false);
        setIsSettingsOpen(false);
        // Do not reset boldPercentage to keep user's preference
    }

    const renderContent = () => {
        if (isLoading) {
            return <Spinner />;
        }
        if (error) {
            return <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>;
        }
        if (bionicContent) {
            return (
                <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-6 md:p-8 text-lg font-serif max-h-[60vh] overflow-y-auto" aria-live="polite">
                   {bionicContent}
                </div>
            );
        }
        return null; // Initial state, nothing to show
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans">
            <main className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8 transition-all duration-300">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-800">Bionic Text Reader</h1>
                    <p className="text-slate-500 mt-2">Paste any text to convert it into a bionic reading format for enhanced focus and speed.</p>
                </div>

                {!originalText && !bionicContent && !isLoading && (
                    <div className="space-y-6">
                        <textarea
                            value={inputText}
                            onChange={(e) => {
                                setInputText(e.target.value);
                                if (error) setError(null);
                            }}
                            className="w-full h-60 p-4 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-800 bg-slate-50"
                            placeholder="Paste your text here..."
                            aria-label="Text input for bionic conversion"
                        />
                         {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button
                            onClick={handleConvert}
                            disabled={!inputText.trim() || isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            {isLoading ? 'Processing...' : 'Convert to Bionic'}
                        </button>
                    </div>
                )}
                
                {(isLoading || bionicContent) && (
                    <div className="mt-8 flex flex-col items-center">
                        
                        {/* -- Settings Panel -- */}
                        {bionicContent && (
                             <div className="w-full flex justify-end items-center mb-4 gap-4">
                                <button 
                                    onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
                                    className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                                    aria-label="Toggle bionic reading settings"
                                    aria-expanded={isSettingsOpen}
                                >
                                    <GearIcon className="w-6 h-6" />
                                </button>
                             </div>
                        )}
                        {isSettingsOpen && bionicContent && (
                            <div className="w-full bg-slate-100 p-4 rounded-lg mb-4 border border-slate-200 transition-all duration-300 ease-in-out">
                                <label htmlFor="bold-percentage" className="block text-sm font-medium text-slate-700 mb-2">
                                    Bold Percentage: <span className="font-bold text-indigo-600">{Math.round(boldPercentage * 100)}%</span>
                                </label>
                                <input
                                    id="bold-percentage"
                                    type="range"
                                    min="0.1"
                                    max="0.7"
                                    step="0.05"
                                    value={boldPercentage}
                                    onChange={(e) => setBoldPercentage(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    aria-valuemin={10}
                                    aria-valuemax={70}
                                    aria-valuenow={Math.round(boldPercentage * 100)}
                                />
                            </div>
                        )}

                        <div className="w-full">
                           {renderContent()}
                        </div>
                        <button
                            onClick={handleClear}
                            className="mt-8 py-2 px-6 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                        >
                           Convert New Text
                        </button>
                    </div>
                )}
            </main>
            <footer className="text-center mt-8 text-slate-500 text-sm">
                <p>Powered by React and Tailwind CSS</p>
            </footer>
        </div>
    );
};

export default App;