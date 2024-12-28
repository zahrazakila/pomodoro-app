const NEWS_API_URL = `https://api-berita-indonesia.vercel.app/merdeka/teknologi`;

async function fetchTechNews() {
  try {
    const response = await fetch(NEWS_API_URL);
    const data = await response.json();
    // Akses data yang benar di 'data.data.posts'
    return data.data.posts.slice(0, 4);  // Ambil 4 berita teratas
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

function createNewsItem(article) {
  const newsItem = document.createElement('div');
  newsItem.className = 'p-4 bg-white rounded-lg border hover:border-blue-500 transition-colors';
  
  // Gunakan 'pubDate' untuk tanggal
  const date = new Date(article.pubDate).toLocaleDateString();
  
  newsItem.innerHTML = `
    <span class="text-sm text-gray-500">${date}</span>
    <h4 class="font-semibold text-lg mb-2">${article.title}</h4>
    <p class="text-gray-600">${article.description}</p>
    <a href="${article.link}" target="_blank" class="text-blue-600 hover:underline mt-2 inline-block">Read more</a>
  `;
  
  return newsItem;
}

async function displayTechNews() {
  const newsContainer = document.getElementById('news-container');
  const articles = await fetchTechNews();
  
  newsContainer.innerHTML = ''; // Clear existing content
  
  if (articles.length === 0) {
    newsContainer.innerHTML = '<p class="text-gray-600">Unable to fetch news at the moment.</p>';
    return;
  }
  
  articles.forEach(article => {
    const newsItem = createNewsItem(article);
    newsContainer.appendChild(newsItem);
  });
}

// Panggil fungsi ini saat halaman dimuat
window.addEventListener('load', displayTechNews);
