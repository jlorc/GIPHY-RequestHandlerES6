import {GLOBAL_KEYS} from '../constants/constants';

export const request = {
    url: 'http://api.giphy.com/v1/gifs/search?q=funny+cat&api_key=',
    app: null,
    init: function () {
        this.app = document.querySelector('.app');
        const button = this.app.querySelector('button');

        button.addEventListener('click', _ => {
            this.requestHandler(this.buildUrl()).then(this.successCallback.bind(this));
        })
    },
    buildUrl: function () {
        const URL = this.url + GLOBAL_KEYS.API_KEY;
        return URL;
    },
    requestHandler: function (url) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.onload = function () {
                if (this.status === 200) {
                    resolve(JSON.parse(request.response));
                } else {
                    reject (new Error(this.statusText));
                }
            };
            request.onerror = _ => reject(new Error(this.statusText));
            request.send(null);
        });
    },
    successCallback: function (response) {
        const gifsArr = response.data;
        const randomElem = gifsArr[Math.floor(Math.random() * gifsArr.length)];
        const randomElemUrl = randomElem.images.original.url;
        const imageWrapper = this.app.querySelector('#imgWrapper');
        const loadedImage = this.app.querySelector('img');
        this.deletePreviousElement(loadedImage, imageWrapper);
        this.createNewElement(randomElemUrl, imageWrapper);
    },
    createNewElement: function (url, imageWrapper) {
        const image = document.createElement('img');
        image.src = url;
        image.classList.add('app__image');
        imageWrapper.appendChild(image);
    },
    deletePreviousElement: function (loadedImage, imageWrapper) {
        if (!loadedImage) return;
        imageWrapper.removeChild(loadedImage);
    }
};