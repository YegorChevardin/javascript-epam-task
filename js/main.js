// reading json
fetch('../GiftCertificatesData.json')
    .then(response => response.json())
    .then(data => {
        localStorage.setItem('myData', JSON.stringify(data));
        console.log('JSON data saved in localStorage.');
    })
    .catch(error => {
        console.error('Error reading JSON file:', error);
    });
// elements guarantee functionality
const loader = document.getElementById("loader");
// collecting only necessary data
const data = JSON.parse(localStorage.getItem('myData'))["_embedded"]["giftCertificateList"];
data.sort(function (a, b) {
    return new Date(a.createDate) - new Date(b.createDate)
})
const cardLimit = data.length
const cardIncrease = 5
let pageCount = Math.ceil(cardLimit - 1 / cardIncrease);
let currentPage = 1;
const spinner = document.querySelector('#loadingSpinner')

//creating a card
const createCard = (given_data, index) => {
    const cardHTML = `
    <div class="main-coupon">
      <a href="item_details.html">
        <div class="coupon-content">
          <img src="../media/Square.png" alt="Item picture" />
          <div>
            <h4 class="coupon-name mt-2">Coupon Name</h4>
            <span class="material-symbols-outlined">favorite</span>
          </div>
          <div class="smaller-description">
            <h1 class="coupon-short-description">Some brief description</h1>
            <p>Expires in 3 days</p>
          </div>
          <div>
            <h1 class="coupon-price">$200</h1>
            <button class="cancel-btn cart-btn">
              <a href="checkout.html">Add to Cart</a>
            </button>
          </div>
        </div>
      </a>
    </div>
  `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cardHTML;

        // Get the actual card element (the first child)
        const card = tempDiv.firstElementChild;

        // Update the content of the card with data from JSON
        const cardNameElem = card.querySelector('.coupon-name');
        cardNameElem.textContent = given_data[index]["name"];

        const cardDescriptionElem = card.querySelector('.coupon-short-description')
        cardDescriptionElem.textContent = given_data[index]["description"]

        const cardPriceElem = card.querySelector('.coupon-price')
        cardPriceElem.textContent = given_data[index]["price"] + '$'

        // Append the card to the container in the HTML
        loader.appendChild(card);
};

let checker = 0
const addCards = (given_data, pageIndex) => {
    // adding cards and checking if it is the last page
    currentPage = pageIndex;
    const startRange = (pageIndex - 1) * cardIncrease;
    const endRange = Math.min(currentPage * cardIncrease, given_data.length)
    if (checker === 0) {
        for (let i = startRange; i <= endRange; i++) {
            createCard(given_data, i);
        }
        checker = 1
    } else if (endRange !== given_data.length) {
        for (let i = startRange + 1; i <= endRange; i++) {
            createCard(given_data, i);
        }
    } else {
        for (let i = startRange + 1; i < endRange; i++) {
            createCard(given_data, i);
        }
    }
};

// timeout creating
let throttleTimer;
let throttle = (callback, time) => {
    if (throttleTimer) return;
    throttleTimer = true;
    spinner.classList.remove('invisible');
    setTimeout(() => {
        callback();
        throttleTimer = false;
    }, time);
};

let infiniteScrollActive = true
// removing infinite scroll
const removeInfiniteScroll = () => {
    infiniteScrollActive = false;
    loader.remove();
    window.removeEventListener("scroll", handleInfiniteScroll);
};


const handleInfiniteScroll = () => {
    if (searchBar.value) {
        // If search bar has content, do not trigger infinite scroll
        return;
    }
    if (infiniteScrollActive && currentPage <= pageCount) {
        // Only add more cards if the current page is within the pageCount limit
        throttle(() => {
            const endOfPage = window.innerHeight + window.pageYOffset >= document.body.offsetHeight;
            spinner.classList.add('invisible');
            if (endOfPage) {
                addCards(data, currentPage + 1);
            }
        }, 1000);
    }
};

window.addEventListener("scroll", handleInfiniteScroll);
window.addEventListener("scroll", scrollFunction);

const topButton = document.getElementById("topBtn");
// When the user scrolls down 20px from the top of the document, show the button
function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        topButton.classList.remove("invisible")
    } else {
        topButton.classList.add("invisible")
    }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    document.body.scrollTop = 0; // for Safari
    document.documentElement.scrollTop = 0;
}

searchBar = document.querySelector('#search')
searchBar.addEventListener('keyup', elem => {
    if(searchBar.value) {
        let value = elem.target.value.toLowerCase();
        let filteredData = data.filter(function (el) {
            return el.name.toLowerCase().includes(value) || el.description.toLowerCase().includes(value);
        });
        loader.replaceChildren();
        checker = 0;
        currentPage = 1;
        pageCount = Math.ceil(filteredData.length / cardIncrease);
        addCards(filteredData, currentPage)
        for (let i = 2; i <= pageCount; i++) {
            addCards(filteredData, currentPage + 1)
        }
        scrollFunction()
    } else {
        throttleTimer = false;
        currentPage = 1;
        checker = 0;
        infiniteScrollActive = true;
        window.addEventListener('scroll', scrollFunction);
        window.addEventListener('scroll', handleInfiniteScroll)
        pageCount = Math.ceil(data.length / cardIncrease);
        loader.replaceChildren();
        addCards(data, currentPage);
        scrollFunction();
    }
})

const STORAGE_KEY = 'scroll-position-y';

function scrollPositionSave() {
    window.history.scrollRestoration = 'manual';
    bindScrollPositionSaving();
    restoreScrollPosition();
}

function bindScrollPositionSaving() {
    const handleScroll = () => {
        sessionStorage.setItem('last-page', currentPage);
        sessionStorage.setItem(STORAGE_KEY, String(window.scrollY));
    };
    window.addEventListener('scroll', handleScroll);
}

function restoreScrollPosition() {
    const page = sessionStorage.getItem('last-page');
    let y = sessionStorage.getItem(STORAGE_KEY) || 0;

    if (page > 1) {
        infiniteScrollActive = false;
        for (let i = 2; i <= page; i++) {
            addCards(data, i);
        }
        infiniteScrollActive = true;
    }
    window.scrollTo(0, Number(y));
}

window.addEventListener('load', () => {
    scrollFunction();
    scrollPositionSave();
});

addCards(data, currentPage);
scrollFunction();

















