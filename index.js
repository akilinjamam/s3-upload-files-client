const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const progressBar = document.getElementById('progress-bar');
const urlDisplay = document.getElementById('url-display');

dropArea.addEventListener('click', () => fileInput.click());

dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dragover');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover');
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        uploadFile(files[0]);
    }
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        uploadFile(fileInput.files[0]);
    }
});

function uploadFile(file) {
    console.log(file)
    //   if (!file.type.startsWith('image/')) {
    //     alert('Please upload a valid image file.');
    //     return;
    //   }

    const formData = new FormData();
    formData.append('files', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://server.cgmpublications.com/api/v1/aws-media-file/create-media-file');

    xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
            const percent = (e.loaded / e.total) * 100;
            progressBar.style.width = percent + '%';
        }
    };

    xhr.onload = () => {
        if (xhr.status === 200) {
            const res = JSON.parse(xhr.responseText);
            console.log(res);

            const urls = Array.isArray(res.data?.url) ? res.data.url : [res.data?.url];
            const fileTypes = res.data?.fileType || [];

            if (urls.length > 0 && fileTypes.length > 0) {
                const currentType = fileTypes[0];
                const currentUrl = urls[0];

                if (currentType.startsWith('image/')) {
                    urlDisplay.innerHTML = `
          <p>Image uploaded:</p>
          <img width="100px" height="auto" src="${currentUrl}" />
        `;
                } else if (currentType.startsWith('audio/')) {
                    urlDisplay.innerHTML = `
          <p>Audio uploaded:</p>
          <audio controls>
            <source src="${currentUrl}" type="${currentType}">
            Your browser does not support the audio element.
          </audio>
        `;
                } else if (currentType.startsWith('video/')) {
                    urlDisplay.innerHTML = `
          <p>Video uploaded:</p>
          <video width="320" height="240" controls>
            <source src="${currentUrl}" type="${currentType}">
            Your browser does not support the video tag.
          </video>
        `} else {
                    urlDisplay.innerHTML = `
          <p>File uploaded:</p>
          <a href="${currentUrl}" target="_blank">${currentUrl}</a>
        `;
                }
            } else {
                urlDisplay.innerHTML = `<p style="color:red;">Upload succeeded but no URL returned.</p>`;
            }
        } else {
            console.log(JSON.parse(xhr.response));
            urlDisplay.innerHTML = `<p style="color:red;">Upload failed: ${xhr.statusText}</p>`;
        }

        progressBar.style.width = '0%';
    };
    xhr.onerror = () => {
        urlDisplay.innerHTML = `<p style="color:red;">An error occurred during the upload.</p>`;
        progressBar.style.width = '0%';
    };

    xhr.send(formData);
}