document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');
    const form = document.getElementById('news-form');
    const addParagraphBtn = document.getElementById('add-paragraph');
    const paragraphsContainer = document.getElementById('paragraphs');

    // Elements for author
    const authorSearchInput = document.getElementById('author-search');
    const authorResults = document.getElementById('author-results');
    const authorNameInput = document.getElementById('author-name');
    const authorPositionInput = document.getElementById('author-position');
    const authorIdInput = document.getElementById('author-id');
    const authorSection = document.getElementById('author-section');

    fetch('/public/config.json')
        .then((response) => response.json())
        .then((config) => {
            const apiBaseUrl = config.API_BASE_URL;
            const apiImageUrl = config.API_IMAGE_URL;

            // Load news details
            fetch(`${apiBaseUrl}/news/${newsId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `${token}`,
                },
            })
                .then((response) => response.json())
                .then(({ result }) => {
                    document.getElementById('title').value = result.title;
                    document.getElementById('sub_title').value = result.sub_title;
                    document.getElementById('category').value = result.category;
                    const releaseDate = new Date(result.release).toISOString().split('T')[0];
                    document.getElementById('release').value = releaseDate;

                    // Display author details if exists
                    if (result.author) {
                        authorNameInput.value = result.author.name;
                        authorPositionInput.value = result.author.position;
                        authorIdInput.value = result.author.id;
                        authorSearchInput.style.display = 'none'; // Hide author search input
                        authorResults.style.display = 'none';
                    } else {
                        authorSection.style.display = 'block'; // Show author search if no author found
                    }

                    if (result.img_news) {
                        document.getElementById('current-image').src = `${apiImageUrl}${result.img_news}`;
                    }

                    // Fetch paragraphs
                    fetch(`${apiBaseUrl}/news_content/${newsId}/content`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `${token}`,
                        },
                    })
                        .then((response) => response.json())
                        .then(({ result: paragraphs }) => {
                            paragraphs.forEach((paragraph) => {
                                const paragraphContainer = document.createElement('div');
                                paragraphContainer.classList.add('paragraph-container');
                                paragraphContainer.innerHTML = `
                                    <textarea name="paragraph" data-id="${paragraph.id}" rows="4">${paragraph.paragraph}</textarea>
                                    <button type="button" class="btn btn-danger remove-paragraph" data-id="${paragraph.id}">Remove Paragraph</button>
                                `;
                                paragraphsContainer.appendChild(paragraphContainer);

                                paragraphContainer.querySelector('.remove-paragraph').addEventListener('click', async (e) => {
                                    const paragraphId = e.target.getAttribute('data-id');
                                    if (paragraphId) {
                                        try {
                                            const response = await fetch(`${apiBaseUrl}/news_content/content/${paragraphId}`, {
                                                method: 'DELETE',
                                                headers: {
                                                    'Authorization': `${token}`,
                                                },
                                            });
                                            if (response.ok) {
                                                paragraphContainer.remove();
                                            } else {
                                                const result = await response.json();
                                                console.error('Failed to delete paragraph:', result);
                                                alert(result.msg || 'Failed to delete paragraph.');
                                            }
                                        } catch (error) {
                                            console.error('Error deleting paragraph:', error);
                                            alert('An error occurred while deleting the paragraph.');
                                        }
                                    } else {
                                        paragraphContainer.remove();
                                    }
                                });
                            });
                        })
                        .catch((err) => {
                            console.error('Error fetching paragraphs:', err);
                            alert('Failed to load paragraphs.');
                        });
                })
                .catch((err) => {
                    console.error('Error fetching news details:', err);
                    alert('Failed to load news details.');
                });

            // Author search logic
            authorSearchInput.addEventListener('input', async () => {
                const query = authorSearchInput.value.trim();

                if (query.length < 2) {
                    authorResults.style.display = 'none';
                    return;
                }

                try {
                    const response = await fetch(`${apiBaseUrl}/author/search?search=${query}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `${token}`,
                        },
                    });

                    const authors = await response.json();

                    if (response.ok && authors.result.length > 0) {
                        authorResults.innerHTML = '';

                        authors.result.forEach((author) => {
                            const li = document.createElement('li');
                            li.textContent = `${author.name} - ${author.position}`;
                            li.dataset.id = author.id;
                            li.dataset.name = author.name;
                            li.dataset.position = author.position;
                            authorResults.appendChild(li);

                            li.addEventListener('click', () => {
                                authorNameInput.value = li.dataset.name;
                                authorPositionInput.value = li.dataset.position;
                                authorIdInput.value = li.dataset.id;
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

            // Form submit logic
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const title = document.getElementById('title').value;
                const subTitle = document.getElementById('sub_title').value;
                const category = document.getElementById('category').value;
                const release = document.getElementById('release').value;
                const imgInput = document.getElementById('image');
                const imgNews = imgInput && imgInput.files[0];
                const authorId = authorIdInput.value;

                if (!authorId) {
                    alert('Please select an author!');
                    return;
                }

                const paragraphs = Array.from(document.querySelectorAll('textarea[name="paragraph"]')).map((textarea, index) => ({
                    id: textarea.getAttribute('data-id') || null,
                    paragraph: textarea.value.trim(),
                    position: index + 1,
                }));

                if (!title || !subTitle || !category || !release) {
                    alert('All fields must be filled.');
                    return;
                }

                const formData = new FormData();
                formData.append('title', title);
                formData.append('sub_title', subTitle);
                formData.append('category', category);
                formData.append('release', release);
                formData.append('author_id', authorId);
                if (imgNews) formData.append('image', imgNews);

                try {
                    const newsResponse = await fetch(`${apiBaseUrl}/news/${newsId}`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': token,
                        },
                        body: formData,
                    });

                    if (!newsResponse.ok) {
                        const errorData = await newsResponse.json();
                        throw new Error(errorData.msg || 'Failed to update news.');
                    }

                    await Promise.all(
                        paragraphs.map((paragraph) => {
                            const endpoint = paragraph.id
                                ? `${apiBaseUrl}/news_content/content/${paragraph.id}`
                                : `${apiBaseUrl}/news_content/${newsId}/content`;

                            return fetch(endpoint, {
                                method: paragraph.id ? 'PATCH' : 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': token,
                                },
                                body: JSON.stringify({
                                    paragraph: paragraph.paragraph,
                                    position: paragraph.position,
                                }),
                            });
                        })
                    );

                    alert('News updated successfully.');
                    window.location.href = '/public/admin/news/';
                } catch (error) {
                    console.error('Error updating news:', error);
                    alert(error.message || 'Failed to update news.');
                }
            });
        });
});
