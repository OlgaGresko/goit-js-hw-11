import axios from "axios";
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const searchFormEl = document.querySelector('.search-form');
const inputEl = document.querySelector('input');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const BASE_URL = 'https://pixabay.com/api/';
const KEY = '37658409-a5873dfa744a69a400960a9aa';
let searchRequest;
let lightbox;
let PARAMS = {
    'key': KEY,
    'q': searchRequest,
    'image_type': 'photo',
    'orientation': 'horizontal',
    'safesearch': true,
    'page': 1,
    'per_page': 40,
};

function toggleLoadMoreBtn(value) {
    loadMoreBtn.classList.toggle('hidden', value);
}

function clearHTML () {
    galleryEl.innerHTML = '';
}

function showError () {
    console.log(error.message);
    Notify.failure(`We're sorry, something went wrong.`);
}

toggleLoadMoreBtn(true);

function renderMarkup(response) {
    let responseMarkup = response.data.hits.map(element => {
        return `<div class="photo-card">
        <a href="${element.largeImageURL}"><img src="${element.webformatURL}" alt="${element.tags}" title="" loading="lazy" /></a>
        <div class="info">
        <p class="info-item">
            <b>Likes</b> ${element.likes}
        </p>
        <p class="info-item">
            <b>Views</b> ${element.views}
        </p>
        <p class="info-item">
            <b>Comments</b> ${element.comments}
        </p>
        <p class="info-item">
            <b>Downloads</b> ${element.downloads}
        </p>
        </div>
        </div>`
    }).join('');
    galleryEl.insertAdjacentHTML('beforeend', responseMarkup);
  
}

async function onSubmitForm (event) {
    event.preventDefault();
    clearHTML();
    searchRequest = inputEl.value.trim();
    PARAMS.page = 1;
    PARAMS.q = searchRequest; 
    toggleLoadMoreBtn(true);
    try {
        let response = await axios.get(BASE_URL, {
            params: PARAMS,
        });
        if (response.data.total === 0) {
            Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            return; 
        } 
        renderMarkup(response);   
        lightbox = new SimpleLightbox('.gallery a', { /* options */ }); 
        Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
        toggleLoadMoreBtn(false);
    } catch (error) {
        showError();
    }
}

async function onLoadMoreBtn() {
    PARAMS.page +=1;
    try {
        let response = await axios.get(BASE_URL, {
        params: PARAMS,
        })
        if (PARAMS.page > response.data.totalHits / PARAMS.per_page) {
            Notify.failure(`We're sorry, but you've reached the end of search results.`);
            toggleLoadMoreBtn(true);
        }
        renderMarkup(response);    
        lightbox.refresh();
    } catch (error) {
        showError();
    }
}

searchFormEl.addEventListener('submit', onSubmitForm);
loadMoreBtn.addEventListener('click', onLoadMoreBtn);
