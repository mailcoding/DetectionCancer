import React, { useState } from 'react';


interface ImageCompareProps {
  beforeImage: string;
  afterImage: string;
}

const ImageCompare: React.FC<ImageCompareProps> = ({ beforeImage, afterImage }) => {
  const [isAfter, setIsAfter] = useState(false);

  const handleToggle = () => {
    setIsAfter(!isAfter);
  };

  return (
    <div>
      <button onClick={handleToggle}>
        {isAfter ? 'Voir avant' : 'Voir après'}
      </button>
      <div>
        {isAfter ? (
          <img src={afterImage} alt="Après" />
        ) : (
          <img src={beforeImage} alt="Avant" />
        )}
      </div>
    </div>
  );
};

export default ImageCompare;