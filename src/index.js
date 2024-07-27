import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from "notiflix";

const API_KEY = '45139895-fe266f5b2338a2660ce73a4a5';
const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

let searchQuery = '';
let page = 1;
let totalHits = 0;

form.addEventListener('submit', handleFormSubmit);
loadMoreButton.addEventListener('click', handleLoadMore);

async function handleFormSubmit(event) {
  event.preventDefault();
  searchQuery = event.target.searchQuery.value.trim();
  if (!searchQuery) {
    Notiflix.Notify.failure('Please enter a search query.');
    return;
  }
  page = 1;
  gallery.innerHTML = '';
  loadMoreButton.style.display = 'none';
  await fetchAndRenderImages();
}

async function handleLoadMore() {
  await fetchAndRenderImages();
}

async function fetchAndRenderImages() {
  try {
    const data = await fetchImages();
    if (data.hits.length === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    }
    renderGallery(data.hits);
    handlePagination(data.totalHits);
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure('Something went wrong. Please try again later.');
  }
}

async function fetchImages() {
  const url = `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(searchQuery)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data;
}

function renderGallery(images) {
  const markup = images.map(image => `
    <div class="photo-card">
      <a href="${image.largeImageURL}">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item"><b>Likes</b>: ${image.likes}</p>
        <p class="info-item"><b>Views</b>: ${image.views}</p>
        <p class="info-item"><b>Comments</b>: ${image.comments}</p>
        <p class="info-item"><b>Downloads</b>: ${image.downloads}</p>
      </div>
    </div>
  `).join('');
  gallery.insertAdjacentHTML('beforeend', markup);

  const lightbox = new SimpleLightbox('.gallery a');
  lightbox.refresh();
}

function handlePagination(totalHits) {
  if (page === 1) {
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  }
  page += 1;
  if (page * 40 >= totalHits) {
    loadMoreButton.style.display = 'none';
    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
  } else {
    loadMoreButton.style.display = 'block';
  }
}

// Infinite scrolling
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && loadMoreButton.style.display !== 'none') {
    handleLoadMore();
  }
});