import React, { useState, useEffect, useContext } from 'react';
import { axios } from '../Utils/Axios';
import { MDBIcon } from 'mdb-react-ui-kit';
import { PetContext } from '../Context/Context';
import { useNavigate, useParams } from 'react-router-dom';
import { Input, Radio, TextArea } from '../Components/Input';
import uploadToCloudinary from '../Utils/uploadToCloudinary';
import Button from '../Components/Button';
import toast from 'react-hot-toast';

export default function EditProductAdmin() {
  const { id } = useParams();
  const { fetchProductDetails } = useContext(PetContext);
  const [item, setItem] = useState({ title: '', description: '', price: '', category: '', weight: '1kg', image: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageStatus, setImageStatus] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file'); // Default to gallery upload
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  
  // Store refs for cleanup
  const intervalsRef = React.useRef(new Set());
  const timeoutsRef = React.useRef(new Set());
  
  // Cleanup function
  const cleanup = () => {
    intervalsRef.current.forEach(id => clearInterval(id));
    timeoutsRef.current.forEach(id => clearTimeout(id));
    intervalsRef.current.clear();
    timeoutsRef.current.clear();
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/admin/products/${id}`);
        setItem(response.data.data);
        setImageUrl(response.data.data.image);
      } catch (error) {
        toast.error(error.response.data.message);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItem((prevItem) => ({ ...prevItem, [name]: value }));
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setItem((prevItem) => ({ ...prevItem, image: url }));
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show upload modal immediately
      setShowUploadModal(true);
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress with cleanup tracking
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            intervalsRef.current.delete(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      intervalsRef.current.add(progressInterval);

      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
      setItem((prevItem) => ({ ...prevItem, image: file }));
      
      // Complete the progress and show success
      const timeout1 = setTimeout(() => {
        clearInterval(progressInterval);
        intervalsRef.current.delete(progressInterval);
        setUploadProgress(100);
        const timeout2 = setTimeout(() => {
          setIsUploading(false);
          setShowUploadModal(false);
          toast.success('Image selected successfully! Ready to update.');
          timeoutsRef.current.delete(timeout2);
        }, 500);
        timeoutsRef.current.add(timeout2);
        timeoutsRef.current.delete(timeout1);
      }, 2000);
      timeoutsRef.current.add(timeout1);
    }
  };

  const validateImageUrl = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  const handleForm = async (e) => {
    e.preventDefault();
    
    // Show upload modal for form submission
    setShowUploadModal(true);
    setIsUploading(true);
    setUploadProgress(0);
    toast.loading('Updating product...', { id: 'update-toast' });
    
    try {
      const formData = new FormData();
      formData.append('id', item._id);
      formData.append('title', item.title);
      formData.append('price', item.price);
      formData.append('description', item.description);
      formData.append('category', item.category);
      formData.append('weight', item.weight || '1kg');

      // Progress simulation for upload with cleanup tracking
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            intervalsRef.current.delete(progressInterval);
            return 80;
          }
          return prev + 20;
        });
      }, 300);
      intervalsRef.current.add(progressInterval);

      // Handle image upload
      if (uploadMethod === 'file' && selectedFile) {
        // Send file directly to backend for Cloudinary upload
        formData.append('image', selectedFile);
      } else if (uploadMethod === 'url' && imageUrl) {
        // Validate URL before using
        const isValidUrl = await validateImageUrl(imageUrl);
        if (!isValidUrl) {
          setIsUploading(false);
          setShowUploadModal(false);
          toast.dismiss('update-toast');
          toast.error('Please provide a valid image URL');
          return;
        }
        formData.append('image', imageUrl);
      } else {
        // Keep existing image
        formData.append('image', item.image);
      }

      const response = await axios.put('/api/admin/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Complete progress
      clearInterval(progressInterval);
      intervalsRef.current.delete(progressInterval);
      setUploadProgress(100);

      if (response.status === 200) {
        const timeout = setTimeout(() => {
          setIsUploading(false);
          setShowUploadModal(false);
          toast.dismiss('update-toast');
          toast.success('🎉 Product updated successfully!', {
            duration: 4000,
            style: {
              background: '#10B981',
              color: 'white',
            },
          });
          
          // Refresh products list in context
          fetchProductDetails();
          navigate('/dashboard/products');
          timeoutsRef.current.delete(timeout);
        }, 1000);
        timeoutsRef.current.add(timeout);
      }
    } catch (error) {
      setIsUploading(false);
      setShowUploadModal(false);
      toast.dismiss('update-toast');
      toast.error('❌ ' + (error.response?.data?.message || 'Failed to update product'), {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: 'white',
        },
      });
    }
  };

  return (
    <div className="d-flex justify-content-center">
      <form
        onSubmit={handleForm}
        className="dashboard-table px-5"
        style={{ width: '1000px' }}
        encType="multipart/form-data"
      >
        <h2 className="text-center">Edit Product</h2>
        
        {/* Image Upload Method Selection */}
        <div className="text-center mb-4">
          <h5>Choose Image Upload Method:</h5>
          <div className="d-flex justify-content-center gap-4">
            <label className="d-flex align-items-center">
              <input
                type="radio"
                name="uploadMethod"
                value="file"
                checked={uploadMethod === 'file'}
                onChange={(e) => setUploadMethod(e.target.value)}
                className="me-2"
              />
              <MDBIcon fas icon="upload" className="me-2" />
              Upload from Gallery
            </label>
            <label className="d-flex align-items-center">
              <input
                type="radio"
                name="uploadMethod"
                value="url"
                checked={uploadMethod === 'url'}
                onChange={(e) => setUploadMethod(e.target.value)}
                className="me-2"
              />
              <MDBIcon fas icon="link" className="me-2" />
              Image URL
            </label>
          </div>
        </div>

        <div className="d-flex justify-content-evenly ">
          {/* Image Preview and Upload Section */}
          <div className="pt-4" style={{ cursor: 'pointer', width: '350px' }}>
            <h4 className="text-center">Product Image</h4>
            
            {/* Current/Preview Image */}
            {imageUrl && (
              <div
                style={{ border: '2px solid #ddd', borderRadius: '12px', position: 'relative', backgroundColor: '#f8f9fa' }}
                className="d-flex flex-column justify-content-center align-items-center mb-3"
              >
                <img 
                  src={imageUrl} 
                  alt="Product" 
                  style={{ 
                    width: '100%', 
                    maxHeight: '250px', 
                    objectFit: 'contain', 
                    padding: '10px',
                    borderRadius: '10px'
                  }} 
                />
                <MDBIcon
                  fas
                  icon="times-circle"
                  className="fs-4 text-danger"
                  style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px', 
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setImageUrl('');
                    setSelectedFile(null);
                    setItem({ ...item, image: '' });
                  }}
                />
              </div>
            )}

            {/* Upload Method: URL */}
            {uploadMethod === 'url' && (
              <div className="mb-3">
                <Input 
                  type="url" 
                  label="Image URL" 
                  name="imageUrl"
                  value={imageUrl} 
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                />
                <small className="text-muted">
                  Enter a direct link to an image (JPG, PNG, GIF, WebP supported)
                </small>
              </div>
            )}

            {/* Upload Method: File */}
            {uploadMethod === 'file' && (
              <div className="mb-3">
                {!selectedFile ? (
                  <div
                    style={{ 
                      border: '2px dashed #007bff', 
                      borderRadius: '12px',
                      backgroundColor: '#f8f9ff',
                      transition: 'all 0.3s ease'
                    }}
                    className="d-flex flex-column justify-content-center align-items-center p-4 position-relative"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = '#0056b3';
                      e.currentTarget.style.backgroundColor = '#e3f2fd';
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = '#007bff';
                      e.currentTarget.style.backgroundColor = '#f8f9ff';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const files = e.dataTransfer.files;
                      if (files[0]) {
                        handleFileInputChange({ target: { files } });
                      }
                    }}
                  >
                    <MDBIcon fas icon="cloud-upload-alt" className="fs-1 text-primary mb-2" />
                    <p className="mb-2 text-center">
                      <strong>Drop your image here</strong><br />
                      or click to browse
                    </p>
                    <small className="text-muted">Supports: JPG, PNG, GIF, WebP (Max: 10MB)</small>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer',
                        opacity: '0',
                        top: 0,
                        left: 0
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center p-3 bg-light rounded">
                    <MDBIcon fas icon="check-circle" className="text-success me-2" />
                    <span className="text-success">File selected: {selectedFile.name}</span>
                    <br />
                    <small className="text-muted">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</small>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="w-50 pt-4 ms-5">
            <div className="mt-3 mb-3 text-center">
              <label className="me-3 text-black">Category: </label>
              {['Cat', 'Dog'].map((category) => (
                <Radio
                  key={category}
                  label={category}
                  value={category}
                  onChange={handleInputChange}
                  checked={item.category === category}
                />
              ))}
            </div>
            <Input type="text" label="Title" name="title" value={item.title} onChange={handleInputChange} />
            <TextArea label="Description" name="description" value={item.description} onChange={handleInputChange} />
            <Input type="number" label="Price" name="price" value={item.price} onChange={handleInputChange} />
            
            {/* Weight Selection */}
            <div className="mb-3">
              <label className="form-label text-black">Weight:</label>
              <select 
                className="form-select" 
                name="weight" 
                value={item.weight || '1kg'} 
                onChange={handleInputChange}
                style={{ borderRadius: '5px', border: '2px solid #ddd' }}
              >
                <option value="0.5kg">0.5 kg</option>
                <option value="1kg">1 kg</option>
                <option value="1.5kg">1.5 kg</option>
                <option value="2kg">2 kg</option>
                <option value="2.5kg">2.5 kg</option>
                <option value="3kg">3 kg</option>
                <option value="4kg">4 kg</option>
                <option value="5kg">5 kg</option>
                <option value="10kg">10 kg</option>
                <option value="15kg">15 kg</option>
                <option value="20kg">20 kg</option>
              </select>
            </div>
            
            <div className="text-center mt-4">
              <Button 
                type="submit" 
                className="mb-4 w-75" 
                color="primary"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <MDBIcon fas icon="spinner" spin className="me-2" />
                    {uploadMethod === 'file' && selectedFile ? 'Uploading...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <MDBIcon fas icon="save" className="me-2" />
                    Update Product
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Upload Modal */}
      {showUploadModal && (
        <div 
          className="modal d-block" 
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ border: 'none', borderRadius: '15px' }}>
              <div className="modal-body text-center py-5">
                <div className="mb-4">
                  {isUploading ? (
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <MDBIcon fas icon="check-circle" size="3x" className="text-success" />
                  )}
                </div>
                
                <h4 className="mb-3">
                  {isUploading ? 'Updating Product...' : 'Update Complete!'}
                </h4>
                
                <div className="progress mb-3" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                    style={{ 
                      width: `${uploadProgress}%`,
                      transition: 'width 0.3s ease'
                    }}
                  ></div>
                </div>
                
                <p className="text-muted mb-0">
                  {isUploading ? 
                    `Processing... ${uploadProgress}%` : 
                    'Your product has been successfully updated!'
                  }
                </p>
                
                {selectedFile && uploadMethod === 'file' && (
                  <div className="mt-3">
                    <small className="text-muted">
                      <MDBIcon fas icon="file-image" className="me-2" />
                      {selectedFile.name} - Uploading to Cloudinary
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
