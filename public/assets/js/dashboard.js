document.addEventListener('DOMContentLoaded', () => {
  const yearSelect = document.getElementById('yearSelect');
  const downloadButton = document.getElementById('downloadUserData');
  const totalPengguna = document.getElementById('total-pengguna');
  const totalArtikel = document.getElementById('total-artikel');
  const totalContent = document.getElementById('total-konten');
  let userChart;

  // Fetch config dan API
  fetch('/public/config.json')
    .then(response => response.json())
    .then(config => {
      const token = localStorage.getItem('token');
      const apiBaseUrl = config.API_BASE_URL;

      const apiUser = `${apiBaseUrl}/user`;
      const apiArtikel = `${apiBaseUrl}/news`;
      const apiContent = `${apiBaseUrl}/detail_class`;

      // Fetch total pengguna
      fetch(apiUser, {
        headers: { Authorization: `${token}` },
      })
        .then(res => res.json())
        .then(data => totalPengguna.innerText = data.result.length);

      // Fetch total artikel
      fetch(apiArtikel, { headers: { Authorization: `${token}` } })
        .then(res => res.json())
        .then(data => totalArtikel.innerText = data.result.length);

      // Fetch total konten
      fetch(apiContent, { headers: { Authorization: `${token}` } })
        .then(res => res.json())
        .then(data => totalContent.innerText = data.result.length);

      // Fetch data chart
      const fetchChartData = (year) => {
        fetch(`${apiBaseUrl}/user/monthly-users?year=${year}`, {
          headers: { Authorization: `${token}` },
        })
          .then(res => res.json())
          .then(data => {
            const roundedData = data.data.map(num => Math.round(num));
            renderChart(roundedData, year);
          });
      };

      // Render Chart
      const renderChart = (monthlyData, year) => {
        const ctx = document.getElementById('userChart').getContext('2d');
        if (userChart) userChart.destroy();

        userChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                     'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
            datasets: [{
              label: `Jumlah Pengguna Tahun ${year}`,
              data: monthlyData,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }
        });
      };

      // Event untuk dropdown tahun
      yearSelect.addEventListener('change', () => {
        fetchChartData(yearSelect.value);
      });

      // Fungsi download user data
      const downloadUserData = () => {
        fetch(apiUser, { headers: { Authorization: `${token}` } })
          .then(res => res.json())
          .then(data => {
            const filteredData = data.result.map(user => ({
              Username: user.username || '',
              Husband: user.husband_name || '',
              Wife: user.wife_name || '',
              Address: user.address || '',
              Phone: user.phone
            }));
            generateXLSX(filteredData, `user_data_${yearSelect.value}.xlsx`);
          });
      };

      // Generate XLSX dari data JSON
      const generateXLSX = (data, fileName) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Users');
        XLSX.writeFile(wb, fileName);
      };

      // Event untuk tombol download
      downloadButton.addEventListener('click', downloadUserData);

      // Fetch awal data chart
      fetchChartData(yearSelect.value);
    });
});
