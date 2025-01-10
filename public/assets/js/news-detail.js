document.addEventListener('DOMContentLoaded', () => {   
  fetch('/public/config.json')
  .then(response => response.json())
  .then(async (config) => {
      const apiBaseUrl = config.API_BASE_URL;
      const newsDetailElement = document.getElementById('news-detail');
      const newsTitleElement = document.getElementById('news-title');
    
      const params = new URLSearchParams(window.location.search);
      const newsId = params.get('id');
      const token = localStorage.getItem('token');
    
      if (!newsId) {
        newsTitleElement.textContent = 'Berita tidak ditemukan';
        return;
      }

      // Fungsi untuk menampilkan status loading
      function displayLoading() {
        newsDetailElement.innerHTML = `
          <div class="loading">
            <p>Loading...</p>
          </div>`;
      }
      
      // Fungsi untuk menghilangkan status loading
      function hideLoading() {
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) loadingElement.remove();
      }
    
      // Fungsi untuk fetch detail berita
      async function fetchNewsDetail() {
        displayLoading(); // Tampilkan loading saat fetch dimulai
        try {
          const response = await fetch(`${apiBaseUrl}/news/${newsId}`, {
              method: "GET",
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `${token}`,
                },
          });
          const { status, result } = await response.json();
          hideLoading(); // Hilangkan loading saat fetch selesai
    
          if (status !== 200) {
            throw new Error('Berita tidak ditemukan.');
          }
    
          displayNewsDetail(result); // Tampilkan detail berita
        } catch (error) {
          console.error('Error fetching news detail:', error);
          newsTitleElement.textContent = 'Gagal memuat berita.';
          hideLoading();
        }
      }

      // Format tanggal
      function formatDate(isoDate) {
          const date = new Date(isoDate);
          const options = { day: 'numeric', month: 'long', year: 'numeric' };
          return date.toLocaleDateString('id-ID', options);
      }
    
      // Fungsi untuk menampilkan detail berita
      function displayNewsDetail(news) {
          const formattedDate = formatDate(news.release);

          newsDetailElement.innerHTML = `
            <img src="http://localhost:5001${news.img_news || '/public/assets/imgs/placeholder.png'}" alt="${news.title}" style="width: 100%; height: auto; margin-bottom: 20px; border-radius: 20px;">
            <h2>${news.title}</h2>
            <h3>${news.sub_title}</h3>
            <p><strong>Release Date:</strong> ${formattedDate}</p>
            <div>
              ${news.NewsContents.map(content => `<p>${content.paragraph}</p>`).join('')}
            </div>
          `;
      }
    
      // Mulai fetch detail berita
      fetchNewsDetail();
  });
});
