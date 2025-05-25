import { useState } from 'react';

function UploadForm() {
  const [prediction, setPrediction] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fileInput = e.target.elements.image;
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setPrediction(data.prediction);
    } catch (err) {
      setPrediction('Error getting prediction.');
      console.error(err);
    }
  };

  return (
    <div className="upload-form">
      <h2>Upload a Rice Plant Image</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" name="image" accept="image/*" required />
        <button type="submit">Upload</button>
      </form>
      {prediction && <p>Prediction: {prediction}</p>}
    </div>
  );
}

export default UploadForm;
