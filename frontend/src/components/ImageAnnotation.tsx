import React, { useState } from 'react';

export {};

interface ImageAnnotationProps {
  imageUrl: string;
}

const ImageAnnotation: React.FC<ImageAnnotationProps> = ({ imageUrl }) => {
  const [annotations, setAnnotations] = useState<string[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<string>('');

  const handleAddAnnotation = () => {
    if (currentAnnotation) {
      setAnnotations([...annotations, currentAnnotation]);
      setCurrentAnnotation('');
    }
  };

  return (
    <div>
      <img src={imageUrl} alt="Annotatable" style={{ maxWidth: '100%' }} />
      <div>
        <input
          type="text"
          value={currentAnnotation}
          onChange={(e) => setCurrentAnnotation(e.target.value)}
          placeholder="Enter your annotation"
        />
        <button onClick={handleAddAnnotation}>Add Annotation</button>
      </div>
      <div>
        {annotations.length > 0 && (
          <ul>
            {annotations.map((annotation, index) => (
              <li key={index}>{annotation}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ImageAnnotation;