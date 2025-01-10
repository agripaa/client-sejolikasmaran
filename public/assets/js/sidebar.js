document.addEventListener('DOMContentLoaded', () => {
  
  const token = localStorage.getItem("token");

  if (!token) {
      window.location.href = "/public/user/login.html";
      return;
  }
  
  fetch('/public/config.json')
      .then(response => response.json())
      .then(config => {
          const apiBaseUrl = config.API_BASE_URL;
          
          fetch('/public/admin/sidebar/sidebar.html')
              .then((response) => response.text())
              .then((html) => {
                  document.getElementById('sidebar-container').innerHTML = html;

                  
                  const sidebar = document.getElementById('sidebar');
                  sidebar.addEventListener('click', (e) => {
                      
                      if (e.target && e.target.matches('.menu-item > a')) {
                          e.preventDefault(); 

                          
                          const allSubmenus = sidebar.querySelectorAll('.submenu');
                          allSubmenus.forEach((submenu) => {
                              if (submenu !== e.target.nextElementSibling) {
                                  submenu.style.display = 'none';
                              }
                          });

                          
                          const submenu = e.target.nextElementSibling;
                          if (submenu) {
                              const isHidden = submenu.style.display === 'none' || submenu.style.display === '';
                              submenu.style.display = isHidden ? 'block' : 'none';
                          }
                      }

                      
                      if (e.target && e.target.matches('.submenu a')) {
                          return; 
                      }
                  });

                  
                  const toggleButton = document.getElementById('toggle-sidebar');
                  toggleButton.addEventListener('click', () => {
                      sidebar.classList.toggle('hidden');
                      const content = document.querySelector('.content');
                      content.classList.toggle('shifted');
                  });

                  
                  const logout = document.getElementById('logout');
                  logout.addEventListener('click', () => {
                      localStorage.removeItem('token');
                      alert('Logout berhasil!');
                      window.location.href = "/public/";
                  });

                  
                  fetch(`${apiBaseUrl}/auth/profile`, {
                      headers: {
                          Authorization: token,
                      },
                  })
                      .then((response) => {
                          if (!response.ok) {
                              window.location.href = "/public/user/login.html";
                              return;
                          }
                          return response.json();
                      })
                      .then(({ result: user }) => {
                          if (user.Role.role_name !== "ADMIN") {
                              window.location.href = "/public/index.html";
                          }
                      })
                      .catch((error) => console.error('Gagal memuat profil pengguna:', error));
              })
              .catch((error) => console.error('Gagal memuat sidebar:', error));
      })
      .catch((error) => console.error('Gagal memuat konfigurasi:', error));
});
