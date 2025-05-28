const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const loading = document.getElementById('loading');
const successMessage = document.getElementById('successMessage');
const photoTitle = document.getElementById('photoTitle');
const photoDescription = document.getElementById('photoDescription');

let selectedFile = null;

// Click to upload
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// Drag and drop functionality
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// File input change
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }

    selectedFile = file;
    
    // Display preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);

    // Display file info
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);

    // Enable submit button
    submitBtn.disabled = false;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Clear functionality
clearBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    previewContainer.style.display = 'none';
    submitBtn.disabled = true;
    photoTitle.value = '';
    photoDescription.value = '';
    successMessage.style.display = 'none';
});

// Submit functionality
submitBtn.addEventListener('click', () => {
    if (!selectedFile) {
        alert('Please select a photo first');
        return;
    }

    // Show loading state
    loading.style.display = 'block';
    submitBtn.disabled = true;

    // Simulate upload process
    setTimeout(() => {
        // Hide loading
        loading.style.display = 'none';
        
        // Show success message
        successMessage.style.display = 'block';
        
        // Log the form data (in a real app, this would be sent to a server)
        console.log('Photo Upload Data:', {
            file: selectedFile,
            title: photoTitle.value,
            description: photoDescription.value,
            uploadTime: new Date().toISOString()
        });

        // Reset form after a delay
        setTimeout(() => {
            selectedFile = null;
            fileInput.value = '';
            previewContainer.style.display = 'none';
            submitBtn.disabled = true;
            photoTitle.value = '';
            photoDescription.value = '';
            successMessage.style.display = 'none';
        }, 3000);
        
    }, 2000);
});

// Prevent default drag behaviors on the document
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());