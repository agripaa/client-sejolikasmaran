document.addEventListener('DOMContentLoaded', () => {
    const authorSearchInput = document.getElementById('author-search');
    const authorResults = document.getElementById('author-results');
    const authorNameInput = document.getElementById('author-name');
    const authorPositionInput = document.getElementById('author-position');
    const authorIdInput = document.getElementById('author-id'); // Hidden input for author_id
    const token = localStorage.getItem('token');

    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('image-preview');

    let apiBaseUrl = '';
  
    fetch('/public/config.json')
        .then(response => response.json())
        .then(config => {
            apiBaseUrl = config.API_BASE_URL;
  
            authorSearchInput.addEventListener('input', async () => {
                const query = authorSearchInput.value.trim();
  
                if (query.length < 2) {
                    authorResults.style.display = 'none';
                    return;
                }

                    // Preview image on file input change
                    imageInput.addEventListener('change', (event) => {
                      const file = event.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          imagePreview.src = e.target.result;
                          imagePreview.style.display = 'block';
                        };
                        reader.readAsDataURL(file);
                      } else {
                        imagePreview.style.display = 'none';
                      }
                    });
  
                try {
                    const response = await fetch(`${apiBaseUrl}/author/search?search=${query}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `${token}`
                        }
                    });
                    const authors = await response.json();
  
                    if (response.ok && authors.result.length > 0) {
                        authorResults.innerHTML = '';
  
                        authors.result.forEach(author => {
                            const li = document.createElement('li');
                            li.textContent = `${author.name} - ${author.position}`;
                             
                            li.dataset.id = author.id; 
                            li.dataset.name = author.name;
                            li.dataset.position = author.position;
                            authorResults.appendChild(li);
  
                            li.addEventListener('click', () => {
                                authorNameInput.value = li.dataset.name;
                                authorPositionInput.value = li.dataset.position;
                                authorIdInput.value = li.dataset.id; // Set author_id to hidden input
                                authorResults.style.display = 'none';
                                authorSearchInput.value = ''; // Clear search input
                            });
                        });
  
                        authorResults.style.display = 'block';
                    } else {
                        authorResults.innerHTML = '<li>No authors found</li>';
                        authorResults.style.display = 'block';
                    }
                } catch (error) {
                    console.error('Error fetching authors:', error);
                    authorResults.innerHTML = '<li>Error fetching authors</li>';
                    authorResults.style.display = 'block';
                }
            });
        })
        .catch(err => console.error('Error loading config:', err));
});

  
document.addEventListener('DOMContentLoaded', () => {
    fetch('/public/config.json')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load config.json');
        return response.json();
      })
      .then((config) => {
        const apiBaseUrl = config.API_BASE_URL;
        const form = document.getElementById('news-form');
        const addParagraphBtn = document.getElementById('add-paragraph');
        const paragraphsContainer = document.getElementById('paragraphs');
  
        addParagraphBtn.addEventListener('click', () => {
          const paragraphContainer = document.createElement('div');
          paragraphContainer.classList.add('paragraph-container');
          paragraphContainer.innerHTML = `
          <textarea name="paragraph" rows="4" placeholder="Write a paragraph..."></textarea>
          <div class='action-parahraph'>
            <button type="button" class="btn btn-danger remove-paragraph">Hapus Paragraf</button>
          </div>
          `;
          paragraphsContainer.appendChild(paragraphContainer);
  
          paragraphContainer.querySelector('.remove-paragraph').addEventListener('click', () => {
            paragraphContainer.remove();
          });
        });
  
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
  
          const title = document.getElementById('title').value;
          const subTitle = document.getElementById('sub_title').value;
          const category = document.getElementById('category').value;
          const release = document.getElementById('release').value;
          const imgInput = document.getElementById('image');
          const imgNews = imgInput && imgInput.files[0];
          const authorId = document.getElementById('author-id').value; // Get author_id
          const token = localStorage.getItem('token');
  
          if (!authorId) {
            alert('Please select an author!');
            return;
          }

          const paragraphs = Array.from(document.querySelectorAll('textarea[name="paragraph"]')).map(
            (textarea, index) => ({
              paragraph: textarea.value.trim(),
              position: index + 1,
            })
          );
  
          if (paragraphs.some((p) => !p.paragraph)) {
            alert('Semua paragraf harus diisi!');
            return;
          }
  
          const formData = new FormData();
          formData.append('title', title);
          formData.append('sub_title', subTitle);
          formData.append('category', category);
          formData.append('release', release);
          formData.append('author_id', authorId);
          if (imgNews) {
            formData.append('image', imgNews);
          }
  
          try {
            const newsResponse = await fetch(`${apiBaseUrl}/news`, {
              method: 'POST',
              headers: {
                'Authorization': `${token}`,
              },
              body: formData,
            });
  
            const newsResult = await newsResponse.json();
  
            if (!newsResponse.ok) {
              alert(newsResult.msg || 'Failed to add news.');
              return;
            }
            const newsId = newsResult.result.id;
  
            const paragraphPromises = paragraphs.map((paragraph) =>
                fetch(`${apiBaseUrl}/news_content/${newsId}/content`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${token}`,
                    },
                    body: JSON.stringify(paragraph),
                }).then((response) => response.json().then((result) => ({ response, result })))
            );
            
            const results = await Promise.allSettled(paragraphPromises);
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value.response.ok) {
                    console.log(`Paragraph at position ${paragraphs[index].position} added successfully.`);
                } else {
                    console.error(`Failed to add paragraph at position ${paragraphs[index].position}:`, result.reason || result.value.result);
                }
            });
            
            alert('Artikel sudah di tambahkan!');
            window.location.href = '/public/admin/news/preview-news.html';
          } catch (error) {
            console.error('Error adding news and paragraphs:', error);
            alert('Something went wrong. Please try again later.');
          }
        });
      })
      .catch((err) => {
        console.error('Error loading config.json:', err);
        alert('Failed to load configuration. Please contact the administrator.');
      });
  });