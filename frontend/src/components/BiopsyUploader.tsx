import React, { useRef, useState } from 'react';

const API_URL = '/detection/biopsies/upload/';

const BiopsyUploader: React.FC = () => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const file = fileInput.current?.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Veuillez sélectionner un fichier PDF.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      setError('Erreur lors de l’upload.');
    } else {
      setError('Upload réussi !');
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <label htmlFor="biopsy-pdf-upload">Sélectionnez un fichier PDF de biopsie :</label>
      <input
        id="biopsy-pdf-upload"
        type="file"
        accept="application/pdf"
        ref={fileInput}
        title="Sélectionnez un fichier PDF"
      />
      <button type="submit">Uploader un PDF de biopsie</button>
      {error && <div>{error}</div>}
    </form>
  );
};

export default BiopsyUploader;