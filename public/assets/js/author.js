document.addEventListener('DOMContentLoaded', async () => {
  const responseConfig = await fetch('/public/config.json');
  const config = await responseConfig.json();

  const API_URL = `${config.API_BASE_URL}/author`;
  const API_IMG = config.API_IMAGE_URL;
  const authorListContainer = document.getElementById('author-list');
  const addButton = document.getElementById('add-author');
  const modal = document.getElementById('modal');
  const closeModalButton = document.getElementById('close-modal');
  const modalForm = document.getElementById('modal-form');
  const token = localStorage.getItem('token');

  if (!token) {
    console.error('No token found! Redirecting to login.');
    alert('Please log in first!');
    window.location.href = '/public/user/login.html';
    return;
  }

  // Open Modal
  function openModal(mode, authorId = null) {
    const modalTitle = document.getElementById('modal-title');
    const authorIdInput = document.getElementById('author-id');
    const authorNameInput = document.getElementById('author-name');
    const authorPositionInput = document.getElementById('author-position');
    const authorDescInput = document.getElementById('author-desc');
    const authorImgInput = document.getElementById('author-img');
    const modalOverlay = document.getElementById('modal-overlay');
  
    modal.style.display = 'block';
    modalOverlay.style.display = 'block'; // Show the overlay
  
    if (mode === 'create') {
      modalTitle.textContent = 'Add Author';
      authorIdInput.value = '';
      authorNameInput.value = '';
      authorPositionInput.value = '';
      authorDescInput.value = '';
      authorImgInput.value = '';
    } else if (mode === 'update') {
      modalTitle.textContent = 'Edit Author';
      fetch(`${API_URL}/${authorId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.result) {
            const { id, name, position, desc } = data.result;
            authorIdInput.value = id;
            authorNameInput.value = name;
            authorPositionInput.value = position;
            authorDescInput.value = desc;
          }
        })
        .catch(error => console.error('Error fetching author details:', error));
    }
  }
  
  closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'none'; // Hide the overlay
  });
  

  // Fetch Authors
  async function fetchAuthors() {
    try {
      const response = await fetch(API_URL, { headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      }});
      const data = await response.json();

      if (response.ok) {
        renderAuthors(data.result);
      } else {
        authorListContainer.innerHTML = `<p>${data.msg}</p>`;
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
      authorListContainer.innerHTML = '<p>Error loading authors. Please try again.</p>';
    }
  }

  function renderAuthors(authors) {
    const tableBody = authorListContainer.querySelector('tbody');
    tableBody.innerHTML = ''; // Clear previous rows
  
    authors.forEach((author) => {
      const imgAuthor = `${API_IMG}/${author.img_author}`
      const row = document.createElement('tr');
	console.log({imgAuthor});
      row.innerHTML = `
        <td>${author.name}</td>
        <td>${author.position}</td>
        <td>${author.desc || 'N/A'}</td>
        <td>
          <img src="${imgAuthor}" alt="${author.name}" />
        </td>
        <td>
          <button class="edit-author" data-id="${author.id}">Edit</button>
          <button class="delete-author" data-id="${author.id}">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  
    // Attach event listeners for Edit and Delete buttons
    document.querySelectorAll('.edit-author').forEach((button) => {
      button.addEventListener('click', () => openModal('update', button.dataset.id));
    });
    document.querySelectorAll('.delete-author').forEach((button) => {
      button.addEventListener('click', () => deleteAuthor(button.dataset.id));
    });
  }
  

  // Delete Author
  async function deleteAuthor(authorId) {
    if (!confirm('Are you sure you want to delete this author?')) return;

    try {
      const response = await fetch(`${API_URL}/${authorId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.msg);
        fetchAuthors();
      } else {
        alert(data.msg || 'Error deleting author.');
      }
    } catch (error) {
      console.error('Error deleting author:', error);
    }
  }

  modalForm.addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const authorId = document.getElementById('author-id').value;
    const name = document.getElementById('author-name').value.trim();
    const position = document.getElementById('author-position').value.trim();
    const desc = document.getElementById('author-desc').value.trim();
    const imgFile = document.getElementById('author-img').files[0];
  
    const formData = new FormData();
    formData.append('name', name);
    formData.append('position', position);
    formData.append('desc', desc);
  
    // Only append the image if a file is selected
    if (imgFile) formData.append('image', imgFile);
  
    const url = authorId ? `${API_URL}/${authorId}` : API_URL;
    const method = authorId ? 'PATCH' : 'POST';
  
    try {
      const response = await fetch(url, {
        method,
        headers: { Authorization: `${token}` },
        body: formData,
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert(data.msg);
        modal.style.display = 'none';
        fetchAuthors();
      } else {
        alert(data.msg || 'Error saving author.');
      }
    } catch (error) {
      console.error('Error saving author:', error);
    }
  });
  

  // Initialize
  fetchAuthors();
  addButton.addEventListener('click', () => openModal('create'));
});
