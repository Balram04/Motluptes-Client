import React, { useContext, useState } from 'react';
import { axios } from '../Utils/Axios';
import { MDBIcon } from 'mdb-react-ui-kit';
import { PetContext } from '../Context/Context';
import { useNavigate } from 'react-router-dom';
import { Input, Radio, TextArea } from '../Components/Input';
import Button from '../Components/Button';
import toast from 'react-hot-toast';

export default function AddProductAdmin() {
  const navigate = useNavigate();
  const { fetchProductDetails } = useContext(PetContext);
  const [item, setItem] = useState({ title: '', description: '', price: '', category: '', weight: '1kg', image: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
  React.useEffect(() => {
    return cleanup;
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItem((prevItem) => ({ ...prevItem, [name]: value }));
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

      // Set file data
      setItem({ ...item, image: file });
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
      
      // Complete the progress and show success
      const timeout1 = setTimeout(() => {
        clearInterval(progressInterval);
        intervalsRef.current.delete(progressInterval);
        setUploadProgress(100);
        const timeout2 = setTimeout(() => {
          setIsUploading(false);
          setShowUploadModal(false);
          toast.success('Image selected successfully! Ready to upload.');
          timeoutsRef.current.delete(timeout2);
        }, 500);
        timeoutsRef.current.add(timeout2);
        timeoutsRef.current.delete(timeout1);
      }, 2000);
      timeoutsRef.current.add(timeout1);
    }
  };

  // Function to add new product to ProductDetails Array
  const handleForm = async (e) => {
    e.preventDefault();
    
    if (!item.title || !item.description || !item.price || !item.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!selectedFile && !item.image) {
      toast.error('Please select an image or provide an image URL');
      return;
    }

    // Show upload modal for form submission
    setShowUploadModal(true);
    setIsUploading(true);
    setUploadProgress(0);
    toast.loading('Uploading product...', { id: 'upload-toast' });

    try {
      const formData = new FormData();
      formData.append('title', item.title);
      formData.append('description', item.description);
      formData.append('price', item.price);
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
      
      // If file is selected, append it; otherwise use URL
      if (selectedFile) {
        formData.append('image', selectedFile);
      } else if (item.image) {
        formData.append('image', item.image);
      }

      const response = await axios.post('/api/admin/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Complete progress
      clearInterval(progressInterval);
      intervalsRef.current.delete(progressInterval);
      setUploadProgress(100);
      
      if (response.status === 201) {
        const timeout = setTimeout(() => {
          setIsUploading(false);
          setShowUploadModal(false);
          toast.dismiss('upload-toast');
          toast.success('🎉 Product uploaded successfully!', {
            duration: 4000,
            style: {
              background: '#10B981',
              color: 'white',
            },
          });
          
          // Refresh products list in context
          fetchProductDetails();
          
          // Reset form
          setItem({ title: '', description: '', price: '', category: '', weight: '1kg', image: '' });
          setSelectedFile(null);
          setImageUrl(null);
          
          navigate('/dashboard/products');
          timeoutsRef.current.delete(timeout);
        }, 1000);
        timeoutsRef.current.add(timeout);
      }
    } catch (error) {
      setIsUploading(false);
      setShowUploadModal(false);
      toast.dismiss('upload-toast');
      toast.error('❌ ' + (error.response?.data?.message || 'Failed to upload product'), {
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
        className="dashboard-table px-5"
        style={{ width: '80%' }}
        onSubmit={handleForm}
        encType="multipart/form-data"
      >
        <h2 className="text-center">Add Product</h2>
        <div className="d-flex justify-content-evenly">
          <div className="pt-5" style={{ width: '300px' }}>
            {/* Upload Method Selection */}
            <div className="mb-3 text-center">
              <div className="btn-group" role="group">
                <input 
                  type="radio" 
                  className="btn-check" 
                  name="uploadMethod" 
                  id="fileUpload" 
                  value="file"
                  checked={uploadMethod === 'file'}
                  onChange={(e) => setUploadMethod(e.target.value)}
                />
                <label className="btn btn-outline-primary btn-sm" htmlFor="fileUpload">File Upload</label>

                <input 
                  type="radio" 
                  className="btn-check" 
                  name="uploadMethod" 
                  id="urlUpload" 
                  value="url"
                  checked={uploadMethod === 'url'}
                  onChange={(e) => setUploadMethod(e.target.value)}
                />
                <label className="btn btn-outline-primary btn-sm" htmlFor="urlUpload">Image URL</label>
              </div>
            </div>

            {uploadMethod === 'file' ? (
              // File Upload Section
              !selectedFile ? (
                <>
                  <h4 className="text-center">Upload your file</h4>
                  <div
                    style={{ border: '1px dashed black', borderRadius: '10px' }}
                    className="d-flex flex-column justify-content-center align-items-center"
                  >
                    <MDBIcon fas icon="file-upload" className="fs-1 pt-5" />
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      style={{
                        width: '300px',
                        height: '200px',
                        position: 'absolute',
                        cursor: 'pointer',
                        opacity: '0',
                        zIndex: '1',
                      }}
                    />
                    <p className="pb-5 pt-2 px-3 text-muted">
                      Drop your file here <br /> or Click to browse
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="pt-1" style={{ cursor: 'pointer', width: '300px' }}>
                    <div
                      style={{ border: '1px solid gray', borderRadius: '10px', position: 'relative' }}
                      className="d-flex flex-column justify-content-center align-items-center"
                    >
                      <img src={imageUrl} alt="Selected" className="w-50 py-4" />
                      <MDBIcon
                        fas
                        icon="times"
                        className="fs-4"
                        style={{ position: 'absolute', top: '0', right: '0', padding: '10px' }}
                        onClick={() => {
                          setSelectedFile(null);
                          setImageUrl(null);
                          setItem({ ...item, image: '' });
                        }}
                      />
                    </div>
                    <hr className="mx-5" />
                    <Input type="text" label="Image File" value={selectedFile.name} readOnly />
                  </div>
                </>
              )
            ) : (
              // URL Input Section
              <div>
                <h4 className="text-center mb-3">Image URL</h4>
                <Input 
                  type="url" 
                  label="Image URL" 
                  name="image"
                  value={item.image} 
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
                {item.image && (
                  <div className="mt-3 text-center">
                    <img 
                      src={item.image} 
                      alt="Preview" 
                      style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                      onLoad={(e) => {
                        e.target.style.display = 'block';
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="w-50 pt-4 ms-5">
            <div className="mt-3 mb-3 text-center">
              <label className="me-3 text-black">Category: </label>
              {['Cat', 'Dog'].map((category) => (
                <Radio key={category} label={category} value={category} onChange={handleInputChange} />
              ))}
            </div>
            <Input type="text" label="Title" name="title" value={item.title} onChange={handleInputChange} />
            <TextArea label="Description" name="description" value={item.description} onChange={handleInputChange} />
            <Input type="number" label="Price" name="price" value={item.price} min={1} onChange={handleInputChange} />
            
            {/* Weight Selection */}
            <div className="mb-3">
              <label className="form-label text-black">Weight:</label>
              <select 
                className="form-select" 
                name="weight" 
                value={item.weight} 
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
            
            <div className="text-center">
              <Button type="submit" className="mb-4 w-50" color="black">
                Submit
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
                  {isUploading ? 'Uploading to Cloudinary...' : 'Upload Complete!'}
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
                    `Uploading... ${uploadProgress}%` : 
                    'Your image has been successfully processed!'
                  }
                </p>
                
                {selectedFile && (
                  <div className="mt-3">
                    <small className="text-muted">
                      <MDBIcon fas icon="file-image" className="me-2" />
                      {selectedFile.name}
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
