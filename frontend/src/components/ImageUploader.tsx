import React, { useState, useRef } from 'react';
import { apiFetch, getApiUrl } from '../api';

interface AnalysisResult {
    malignancy_score: number;
    findings: string[];
}

const ImageUploader: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const dropRef = useRef<HTMLDivElement>(null);

    const handleFile = (selectedFile: File | null) => {
        setFile(selectedFile);
        setFileType(selectedFile ? selectedFile.type : null);
        if (selectedFile) {
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => setPreviewUrl(reader.result as string);
                reader.readAsDataURL(selectedFile);
            } else if (selectedFile.type === 'application/pdf') {
                setPreviewUrl(URL.createObjectURL(selectedFile));
            } else if (selectedFile.name.endsWith('.dcm')) {
                setPreviewUrl(null); // Aperçu DICOM géré ailleurs (DicomViewer)
            } else {
                setPreviewUrl(null);
            }
        } else {
            setPreviewUrl(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFile(e.target.files?.[0] || null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setIsLoading(true);
        setMessage(null);
        const formData = new FormData();
        formData.append('image', file);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl('/detection/analyze/'), {
                method: 'POST',
                body: formData,
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
            });
            if (!response.ok) throw new Error(await response.text());
            const data = await response.json();
            setResult(data.result as AnalysisResult);
            setMessage('Analyse réussie !');
        } catch (error) {
            setMessage('Erreur lors de l’analyse.');
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border-2 border-dashed transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
            style={{ minHeight: 220 }}
        >
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                        Uploader une mammographie ou biopsie (DICOM, PNG, JPEG, PDF) :
                    </label>
                    <input
                        type="file"
                        accept="image/*,.dcm,application/pdf"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border rounded"
                        title="Sélectionnez une image, un DICOM ou un PDF"
                        placeholder="Choisissez un fichier image, DICOM ou PDF"
                    />
                </div>
                {file && (
                    <div className="mb-4 flex flex-col items-center">
                        <div className="mb-2 text-sm text-gray-600">Fichier : {file.name} ({file.type || 'DICOM'})</div>
                        {previewUrl && fileType?.startsWith('image/') && (
                            <img src={previewUrl} alt="Aperçu" className="max-h-64 rounded shadow" />
                        )}
                        {previewUrl && fileType === 'application/pdf' && (
                            <iframe src={previewUrl} title="Aperçu PDF" className="w-full h-64 border rounded" />
                        )}
                        {!previewUrl && file && file.name.endsWith('.dcm') && (
                            <div className="text-blue-700">Aperçu DICOM disponible après upload</div>
                        )}
                    </div>
                )}
                <button
                    type="submit"
                    className="custom-btn w-full"
                    disabled={isLoading || !file}
                >
                    {isLoading ? <span className="loader mr-2"></span> : null}
                    {isLoading ? 'Analyse en cours...' : 'Analyser'}
                </button>
            </form>
            {message && (
                <div className={`mt-4 p-2 rounded text-center ${message.includes('réussie') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>
            )}
            {result && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <div className="font-bold mb-2">Résultat IA :</div>
                    <div>Score de malignité : {result.malignancy_score}</div>
                    <div>Findings : {result.findings.join(', ')}</div>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;