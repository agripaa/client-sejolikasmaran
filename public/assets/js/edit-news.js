document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');
    const form = document.getElementById('news-form');
    const addParagraphBtn = document.getElementById('add-paragraph');
    const paragraphsContainer = document.getElementById('paragraphs');

    fetch('/public/config.json')
        .then((response) => response.json())
        .then((config) => {
            const apiBaseUrl = config.API_BASE_URL;
            const apiImageUrl = config.API_IMAGE_URL;

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
                    if (result.img_news) {
                        document.getElementById('current-image').src = `${apiImageUrl}${result.img_news}`;
                    }                    

                    // Fetch paragraphs for the news
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

            addParagraphBtn.addEventListener('click', () => {
                const paragraphContainer = document.createElement('div');
                paragraphContainer.classList.add('paragraph-container');
                paragraphContainer.innerHTML = `
                    <textarea name="paragraph" rows="4"></textarea>
                    <button type="button" class="btn btn-danger remove-paragraph">Remove Paragraph</button>
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
            
                const paragraphs = Array.from(document.querySelectorAll('textarea[name="paragraph"]')).map((textarea, index) => ({
                    id: textarea.getAttribute('data-id'), // Ambil ID dari data-id
                    paragraph: textarea.value.trim(),
                    position: index + 1,
                }));
            
                if (paragraphs.some((p) => !p.paragraph)) {
                    alert('All paragraphs must be filled.');
                    return;
                }
            
                const formData = new FormData();
                formData.append('title', title);
                formData.append('sub_title', subTitle);
                formData.append('category', category);
                formData.append('release', release);
                if (imgNews) formData.append('image', imgNews);
            
                try {
                    // Update news
                    await fetch(`${apiBaseUrl}/news/${newsId}`, {
                        method: 'PATCH',
                        headers: { 
                            'Authorization': token
                        },
                        body: formData,
                    });
            
                    await Promise.all(
                        paragraphs.map((paragraph) =>
                            fetch(`${apiBaseUrl}/news_content/${newsId}/content`, {
                                method: paragraph.id ? 'PATCH' : 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': token,
                                },
                                body: JSON.stringify({
                                    paragraph: paragraph.paragraph,
                                    position: paragraph.position,
                                }),
                            })
                        )
                    );
            
                    alert('News updated successfully.');
                    window.location.href = '/public/admin/news/';
                } catch (error) {
                    console.error('Error updating news:', error);
                    alert('Failed to update news.');
                }
            });
            
        });
});
