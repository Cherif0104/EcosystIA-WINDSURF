import React, { useState, useRef } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { generateImage, editImage } from '../services/geminiService';

const GenAILab: React.FC = () => {
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState<'generate' | 'edit'>('generate');

    // State for Image Generation
    const [prompt, setPrompt] = useState('');
    const [loadingGen, setLoadingGen] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    // State for Image Editing
    const [originalImage, setOriginalImage] = useState<{ data: string, mime: string, name: string } | null>(null);
    const [editPrompt, setEditPrompt] = useState('');
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || loadingGen) return;
        setLoadingGen(true);
        setGeneratedImage(null);
        const result = await generateImage(prompt);
        if (result) {
            setGeneratedImage(`data:image/png;base64,${result}`);
        }
        setLoadingGen(false);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!originalImage || !editPrompt.trim() || loadingEdit) return;
        setLoadingEdit(true);
        setEditedImage(null);
        const result = await editImage(originalImage.data, originalImage.mime, editPrompt);
        if (result.image) {
            setEditedImage(`data:${originalImage.mime};base64,${result.image}`);
        }
        setLoadingEdit(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const base64String = (loadEvent.target?.result as string).split(',')[1];
                setOriginalImage({
                    data: base64String,
                    mime: file.type,
                    name: file.name
                });
                setEditedImage(null); // Clear previous edit result
            };
            reader.readAsDataURL(file);
        }
    };
    
    const TabButton: React.FC<{tabKey: 'generate' | 'edit', label: string}> = ({ tabKey, label }) => (
        <button
            onClick={() => setActiveTab(tabKey)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === tabKey
                ? 'bg-emerald-600 text-white'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div>
            <div className="text-center">
                <i className="fas fa-flask text-5xl text-emerald-500 mb-4"></i>
                <h1 className="text-3xl font-bold text-gray-800">{t('gen_ai_lab_title')}</h1>
                <p className="mt-2 text-gray-600 max-w-2xl mx-auto">{t('gen_ai_lab_subtitle')}</p>
            </div>

            <div className="mt-8 max-w-4xl mx-auto">
                <div className="flex justify-center space-x-2 p-2 bg-gray-100 rounded-lg mb-6">
                    <TabButton tabKey="generate" label={t('image_generator')} />
                    <TabButton tabKey="edit" label={t('image_editing')} />
                </div>
                
                {activeTab === 'generate' && (
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">{t('image_generator')}</h2>
                        <p className="text-sm text-gray-500 mb-6">{t('image_generator_subtitle')}</p>
                        <form onSubmit={handleGenerateSubmit}>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={t('image_prompt_placeholder')}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                                rows={3}
                                disabled={loadingGen}
                            />
                            <button type="submit" disabled={loadingGen} className="mt-4 w-full bg-emerald-600 text-white py-3 rounded-md font-semibold hover:bg-emerald-700 disabled:bg-emerald-300 flex items-center justify-center">
                                {loadingGen ? <><i className="fas fa-spinner fa-spin mr-2"></i>{t('generating')}</> : <><i className="fas fa-image mr-2"></i>{t('generate_image')}</>}
                            </button>
                        </form>
                        {(loadingGen || generatedImage) && (
                            <div className="mt-8">
                                <h3 className="text-lg font-bold text-gray-700 mb-4">{t('ai_coach_response_title')}</h3>
                                <div className="bg-gray-100 p-4 rounded-lg aspect-square flex justify-center items-center">
                                    {loadingGen && <div className="flex flex-col items-center text-emerald-500"><i className="fas fa-spinner fa-spin text-4xl"></i><p className="mt-4">{t('generating')}</p></div>}
                                    {generatedImage && <img src={generatedImage} alt="Generated by AI" className="rounded-lg object-contain max-w-full max-h-full" />}
                                </div>
                                {generatedImage && !loadingGen && (
                                    <div className="mt-4 text-center">
                                        <a
                                            href={generatedImage}
                                            download="ecosystia-generated-image.png"
                                            className="inline-flex items-center bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                                        >
                                            <i className="fas fa-download mr-2"></i>
                                            {t('download_image')}
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'edit' && (
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                         <h2 className="text-xl font-bold text-gray-800 mb-2">{t('image_editing')}</h2>
                         <p className="text-sm text-gray-500 mb-6">Powered by Gemini ('Nano Banana')</p>
                        
                        {!originalImage ? (
                            <div className="text-center border-2 border-dashed border-gray-300 p-12 rounded-lg">
                                <i className="fas fa-upload text-4xl text-gray-400"></i>
                                <p className="mt-4 text-gray-600">{t('upload_image_to_edit')}</p>
                                <button onClick={() => fileInputRef.current?.click()} className="mt-4 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-md font-semibold hover:bg-emerald-200">
                                    {t('upload_evidence')}
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
                            </div>
                        ) : (
                            <form onSubmit={handleEditSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('original_image')}</label>
                                    <div className="relative">
                                        <img src={`data:${originalImage.mime};base64,${originalImage.data}`} alt="Original" className="rounded-lg w-full"/>
                                        <button onClick={() => setOriginalImage(null)} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75" title={t('remove_image')}>
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                                 <textarea
                                    value={editPrompt}
                                    onChange={(e) => setEditPrompt(e.target.value)}
                                    placeholder={t('editing_prompt_placeholder')}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                                    rows={3}
                                    disabled={loadingEdit}
                                />
                                <button type="submit" disabled={loadingEdit} className="mt-4 w-full bg-emerald-600 text-white py-3 rounded-md font-semibold hover:bg-emerald-700 disabled:bg-emerald-300 flex items-center justify-center">
                                    {loadingEdit ? <><i className="fas fa-spinner fa-spin mr-2"></i>{t('generating')}</> : <><i className="fas fa-magic mr-2"></i>{t('generate_edit')}</>}
                                </button>
                            </form>
                        )}
                        {(loadingEdit || editedImage) && (
                            <div className="mt-8">
                                <h3 className="text-lg font-bold text-gray-700 mb-4">{t('edited_image')}</h3>
                                <div className="bg-gray-100 p-4 rounded-lg aspect-square flex justify-center items-center">
                                    {loadingEdit && <div className="flex flex-col items-center text-emerald-500"><i className="fas fa-spinner fa-spin text-4xl"></i><p className="mt-4">{t('generating')}</p></div>}
                                    {editedImage && <img src={editedImage} alt="Edited by AI" className="rounded-lg object-contain max-w-full max-h-full" />}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenAILab;