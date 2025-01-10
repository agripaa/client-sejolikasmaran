document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  fetch('/public/config.json')
  .then(response => response.json())
  .then(async (config) => {
      const apiBaseUrl = config.API_BASE_URL;
      const apiImageUrl = config.API_IMAGE_URL;

      const newsListElement = document.getElementById('news-list');
      
      async function fetchNews() {
        try {
          const response = await fetch(`${apiBaseUrl}/news`, {
              method: "GET",
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `${token}`,
              },
          });
          const { status, result } = await response.json();
    
          if (status !== 200) {
            throw new Error('Gagal memuat berita.');
          }
    
          displayNews(result);
        } catch (error) {
          console.error('Error fetching news:', error);
          newsListElement.innerHTML = `<p>Gagal memuat berita.</p>`;
        }
      }
    
      function displayNews(newsList) {
          newsListElement.innerHTML = newsList
            .map((news) => {
              const urlImageNews = apiImageUrl + news.img_news;
              return `
              <div class="news-item">
                <a href="news-detail.html?id=${news.id}" class="news-item-link">
                    <img src="${urlImageNews}" alt="${news.title}">
                    <div class="news-item-content">
                      <h3 class="news-item-title">${news.title}</h3>
                      <p class="news-item-subtitle">${news.sub_title}</p>
                      
                      </div>
                      </a>
                    <div class="news-item-actions">
                        <button class="btn btn-danger" data-id="${news.id}">Delete</button>
                        <button class="btn btn-edit" data-id="${news.id}">Edit</button>
                    </div>
                 </div>

              `;
            })
            .join('');
        
          addActionListeners();
        }
        
        function addActionListeners() {
          document.querySelectorAll('.btn-danger').forEach((button) => {
            button.addEventListener('click', async (e) => {
              const newsId = e.target.dataset.id;

              Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
              }).then(async (result) => {
                if (result.isConfirmed) {
                  try {
                    const response = await fetch(`${apiBaseUrl}/news/${newsId}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `${token}`,
                      },
                    });
        
                    if (!response.ok) {
                      throw new Error('Failed to delete news.');
                    }
        
                    Swal.fire(
                      'Deleted!',
                      'The news has been deleted.',
                      'success'
                    );
                    fetchNews();
                  } catch (error) {
                    console.error('Error deleting news:', error);
                    Swal.fire(
                      'Failed!',
                      'Failed to delete the news. Please try again.',
                      'error'
                    );
                  }
                }
              });
            });
          });
        
          document.querySelectorAll('.btn-edit').forEach((button) => {
            button.addEventListener('click', (e) => {
              const newsId = e.target.dataset.id;
              window.location.href = `/public/admin/news/edit-news.html?id=${newsId}`;
            });
          });
        }
        
    
      fetchNews();
  });
});
