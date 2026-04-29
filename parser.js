// @todo: напишите здесь код парсера

function getTitle() {
    // 2. Заголовок страницы без названия сайта
    const fullTitle = document.querySelector('title').textContent.trim();

    // const fullTitle = document.title;

    // Берем только заголовок (первую часть), отрезаем всё после тире и чистим пробелы
    return fullTitle.split('—')[0].trim();
}


function getKeywords() {
    // 3. Ключевые слова из мета-тега в виде массива слов, разделяем по «,»

    // Ищем тег на странице <meta name="keywords" content="...">
    const keywordsTag = document.querySelector('meta[name="keywords"]');

    // Создаем переменную, где будет лежать текст ключевых слов
    let keywordsText = '';

    // Проверяем через if если тег успешно нашелся
    if (keywordsTag !== null) {
        // То забираем его содержимое из атрибута content
        keywordsText = keywordsTag.content;
    } else {
        // Если тега нет а странице, оставляем строку пустой
        keywordsText = '';
    }

    // Режем строку по запятой. Получаем массив
    const keywordsArray = keywordsText.split(',');

    // Создаем новый массив куда будем складывать чистые слова без пробелов
    const keywords = [];

    // Пробегаем по массиву 
    for (const word of keywordsArray) {
        // Убираем пробелы по бокам слова
        const cleanWord = word.trim();

        // Кладем чистое слово в итоговый массив
        keywords.push(cleanWord);
    }

    // Важно: Возвращаем готовый массив наружу!
    return keywords;
}


function getOpenGraph() {
    // 5. Получаем opengraph-описание (собираем в объект)
    const og = {};

    // Ищем вообще все мета-теги, у которых property начинается на og:
    const ogTags = document.querySelectorAll('meta[property^="og:"]');

    // Получаем и перебираем каждый тег
    for (const tag of ogTags) {
        const propertyName = tag.getAttribute('property');

        if (propertyName) {
            // Отрезаем приставку "og:" (это первые 3 символа)
            const key = propertyName.slice(3);

            // Для всех остальных тегов берем текст из разметки
            og[key] = tag.getAttribute('content').trim();

        }

    }

    // console.log(og);

    // og.title = document.querySelector('title').textContent.trim();


    // const ogTitleTag = document.querySelector('meta[property="og:title"]');
    // if (ogTitleTag) {
    //     og.title = ogTitleTag.getAttribute('content').trim();
    // }



    // Возвращаем готовый чистый объект
    return og;
}


function getMetaInfo() {

    // 4. Описание из мета-тега
    const descriptionTag = document.querySelector('meta[name="description"]');

    // Создаем переменную, где будет лежать описание
    let description = '';

    if (descriptionTag !== null) {
        description = descriptionTag.content;
    }

    // ВАЖНО: Возвращаем все собранные данные в виде объекта
    // Вызываем вынесенные функции
    return {
        language: document.documentElement.lang,
        description: description,
        title: getTitle(),
        opengraph: {
            ...getOpenGraph(),
            title: getTitle()
        },
        keywords: getKeywords()
    };

}

// Функция для сбора тегов (бирок)
function getProductTags() {
    // 4. Сбор разноцветных бирок (тегов)
    const tags = {
        category: [],
        discount: [],
        label: []
    };

    const tagNodes = document.querySelectorAll('.tags span');

    tagNodes.forEach(node => {
        const text = node.textContent.trim();

        if (node.classList.contains('green')) {
            tags.category.push(text);
        } else if (node.classList.contains('red')) {
            tags.discount.push(text);
        } else if (node.classList.contains('blue')) {
            tags.label.push(text);
        }
    });
    return tags;

    // for (const node of tagNodes) {
    //     const text = node.textContent.trim()
    //     if (node.classList.contains('green')) {
    //         tags.category.push(text);
    //     } else if (node.classList.contains('red')) {
    //         tags.discount.push(text);
    //     } else if (node.classList.contains('blue')) {
    //         tags.label.push(text);
    //     }
    // };
}

// Вспомогательная функция для валюты
// Вызываем в function getProductPrices()
// const currency = getCurrencyCode(priceContainer.textContent);
function getCurrencyCode(text) {
    if (text.includes('$')) return 'USD';
    if (text.includes('€')) return 'EUR';
    if (text.includes('₽')) return 'RUB';
    return 'RUB';
}

// Функция для расчета цен
function getProductPrices() {
    // 5. Расчет цен и скидок
    const priceContainer = document.querySelector('.price');

    // Вытаскиваем старую цену (она внутри span) - это строка "₽80"
    const oldPriceSpan = priceContainer.querySelector('span');
    // Вытаскиваем текст "₽80", стираем значок рубля, оставляя строку "80" и превращаем строку "80" в настоящее число 80, с которым можно складывать и вычитать
    const oldPrice = oldPriceSpan ? parseInt(oldPriceSpan.textContent.replace('₽', '')) : 0;

    // Вытаскиваем текущую цену
    // Берем вообще весь текст из блока целиком. В переменной currentPriceText теперь лежит строка "₽50₽80"
    let currentPriceText = priceContainer ? priceContainer.textContent : '';
    // Берем нашу общую строку "₽50₽80" и говорим методу replace: «Найди в ней кусок "₽80" и сотри его!»
    if (oldPriceSpan) {
        // В переменной currentPriceText остается чистая строка: "₽50"
        currentPriceText = currentPriceText.replace(oldPriceSpan.textContent, '');
    }

    // Стираем значок рубля через .replace('₽', '') — остается строка "50"
    // Функция parseInt превращает строку в настоящее число 50
    const price = parseInt(currentPriceText.replace('₽', ''));

    // Считаем разницу (скидка в валюте)
    const discount = oldPrice - price;

    // Считаем процент скидки (строго по ТЗ с двумя знаками после запятой)
    let discountPercent = '0%';

    // Проверяем, была ли старая цена больше нуля. Если старая цена равна нулю, на неё нельзя делить (в математике это вызовет ошибку)
    if (oldPrice > 0) {
        // .toFixed(2) — это метод, который превращает обычное число в строку и оставляет ровно два знака после запятой
        discountPercent = ((discount / oldPrice) * 100).toFixed(2) + '%';
    }

    // 1. ВЫЗЫВАЕМ ПЕРЕВОДЧИК ВАЛЮТЫ
    // Передаем туда весь текст из контейнера с ценами (где лежит значок ₽, $ или €)
    const currency = getCurrencyCode(priceContainer ? priceContainer.textContent : '');

    return { price, oldPrice, discount, discountPercent, currency };
}

// Функция для сбора картинок
function getProductImages() {
    // 6. Сбор картинок
    // Cоздаём пустую коробку-массив, куда будем складывать готовые объекты картинок
    const images = [];

    // Находим все картинки img внутри навигации с миниматюрами
    const imageNodes = document.querySelectorAll('.preview nav img');

    imageNodes.forEach(img => {
        // Для каждой найденной картинки мы создаём новый объект и закидываем его в массив
        images.push({
            // Мелкая картинка - обычный src
            preview: img.getAttribute('src') || '',
            // Большая картинка - берем из data-src
            full: img.getAttribute('data-src') || '',
            // Описание картинки
            alt: img.getAttribute('alt') || ''
        });
    });

    // const images = [];

    // // Находим все картинки
    // const imageNodes = document.querySelectorAll('.preview nav img');

    // // Цикл for...of берет по очереди каждую картинку из списка
    // for (const img of imageNodes) {

    //     // Создаем объект для одной картинки
    //     const imageObject = {
    //         preview: img.getAttribute('src') || '',
    //         full: img.getAttribute('data-src') || '',
    //         alt: img.getAttribute('alt') || ''
    //     };

    //     // Кладем этот объект в наш массив
    //     images.push(imageObject);
    // }
    return images;
}

// Функция для сбора свойств
function getProductProperties() {
    // 7. Свойства товара
    // Создаем пустой объект данных
    const properties = {};
    // Находим все строки характеристик
    const propLines = document.querySelectorAll('.properties li');

    propLines.forEach(line => {
        // Находим все теги и span внутри одной строчки
        const spans = line.querySelectorAll('span');

        // Проверяем наличие обоих элементов
        if (spans.length >= 2) {
            // Забираем текст левой колонки
            const key = spans[0].textContent.trim();
            // Забираем текст правой колонки
            const value = spans[1].textContent.trim();

            // Записываем в объект: ключ = значение
            properties[key] = value;
        }
    });
    return properties;
}

// Функция для сбора описания
function getProductDescription() {
    // 8. Полное описание по карточке товара с сохранением HTML-размеки по карточке товара, 
    // скрытое под сворачиваемым блоком
    const descContainer = document.querySelector('.description');
    let description = '';

    if (descContainer) {
        // Делаем копию блока, чтобы случайно не сломать оригинал на странице
        // Метод cloneNode создаёт точную копию HTML-узла. Параметр true означает «скопировать вместе со всеми вложенными тегами
        const clone = descContainer.cloneNode(true);

        // Находим все теги внутри нашей копии (и заголовки, и параграфы)
        const allTags = clone.querySelectorAll('*');

        // Пробегаем по ним и стираем любые стрибуты
        allTags.forEach(tag => {
            // Цикл while крутится до тех пор, пока количество атрибутов у тега больше нуля
            while (tag.attributes.length > 0) {
                // Заглядываем в список всех атрибутов тега (attributes)
                // Берем самый первый из них по индексу (это class="unused")
                // Забираем его имя через .name (получаем слово "class")
                // И удаляем его через removeAttribute('class')
                tag.removeAttribute(tag.attributes[0].name);
            }
        });

        // Забираем очищенный HTML-код
        description = clone.innerHTML.trim();

        // Находим все теги
        // const allTags = clone.querySelectorAll('*');

        // // Перебираем каждый найденный тег
        // for (const tag of allTags) {

        //     // 1. Создаем массив, куда сложим имена всех атрибутов этого тега
        //     const attributeNames = [];

        //     // 2. Сначала просто собираем имена атрибутов (например: ["class", "id"])
        //     for (const attr of tag.attributes) {
        //         attributeNames.push(attr.name);
        //     }

        //     // 3. А теперь бежим по нашему списку имен и стираем их у тега
        //     for (const name of attributeNames) {
        //         tag.removeAttribute(name); // Стираем класс, стираем id
        //     }
        // }

    }
    return description;
}

function getProductData() {
    // Находим первую (главную) секцию товара на странице
    const productSection = document.querySelector('section.product');

    // 1. Идентификатор товара (data-id)
    // const id = productSection ? productSection.dataset.id : '';

    // let id = ''; // Сначала создаем пустую переменную

    // if (productSection) {
    //     id = productSection.dataset.id; // Если секция есть — берем ID
    // } else {
    //     id = ''; // Если нет — оставляем пустой (эту строчку можно даже опустить)
    // }

    // const id = productSection?.dataset?.id || '';

    // 2. Название товара (текст в h1-теге)
    const nameNode = document.querySelector('h1.title');
    // const name = nameNode ? nameNode.textContent.trim() : '';

    // 3. Статус кнопки лайка (проверяем класс active у кнопки .like)
    const likeButton = document.querySelector('.like');
    // const isLiked = likeButton ? likeButton.classList.contains('active') : false;

    const { price, oldPrice, discount, discountPercent, currency } = getProductPrices();

    // Возвращаем собранный объект
    return {
        id: productSection ? productSection.dataset.id : '',
        name: nameNode ? nameNode.textContent.trim() : '',
        isLiked: likeButton ? likeButton.classList.contains('active') : false,
        tags: getProductTags(),
        price: price,
        oldPrice: oldPrice,
        discount: discount,
        discountPercent: discountPercent,
        currency: currency,
        // ВМЕСТО 5 СТРОЧЕК С ЦЕНАМИ ПИШЕМ ВСЕГО ОДНУ:
        // ...getProductPrices(),
        images: getProductImages(),
        properties: getProductProperties(),
        description: getProductDescription()
    };

}

// Функция предложений товаров
function getSuggestedProducts() {
    const suggested = [];

    // 1. Находим все карточки товаров в блоке рекомендаций
    const articles = document.querySelectorAll('.suggested .items article');

    // Заходим в каждую карточку article
    for (const article of articles) {
        // Забираем текст с ценой и значком валюты, например, "₽34123"
        const priceText = article.querySelector('b')?.textContent.trim() || '';

        suggested.push({
            // Имя из тега h3, например, test title
            name: article.querySelector('h3')?.textContent.trim() || '',

            // Описание из тега p, например, desc about product
            description: article.querySelector('p')?.textContent.trim() || '',

            // Ссылка на картинку из атрибута src (берем именно адрес картинки)
            image: article.querySelector('img')?.getAttribute('src') || '',

            // Тест ждёт цену строкой и без значка рубля
            // Поэтому мы берем "₽34123", стираем ₽ через replace и получаем чистую строку "34123"
            price: priceText.replace('₽', '').trim(),

            // Готовый переводчик валюты (передаем туда строку с рублём)
            // Вызываем готовую «умную» функцию getCurrencyCode и отдаем ей ту же строку "₽34123"
            // Она видит там знак рубля и возвращает нам "RUB"
            currency: getCurrencyCode(priceText)
        });
    }

    return suggested;
}

// Функция отзывов
function getReviews() {
    const reviews = [];

    // Находим каждую карточку article с рейтингом
    const articles = document.querySelectorAll('.reviews .items article');

    // Заходим в каждую карточку
    for (const article of articles) {
        // 1. Считаем количество заполненных звезд
        // У закрашенных звезд есть класс .filled
        // Находим все элементы с классом .filled
        const rating = article.querySelectorAll('.rating .filled').length;

        // 2. Забираем дату и меняем слэши на точки
        const rawDate = article.querySelector('.author i')?.textContent.trim() || '';
        const date = rawDate.replaceAll('/', '.');

        // Создаем объект внутри объекта
        reviews.push({
            rating: rating,
            author: {
                // Проверяем есть ли ссылка на карточку товара в рейтинге, если есть вытаскиваем, если нет, выдаст пустаую строку (undefined)
                avatar: article.querySelector('.author img')?.getAttribute('src') || '',
                name: article.querySelector('.author span')?.textContent.trim() || ''
            },
            title: article.querySelector('h3.title')?.textContent.trim() || '',
            description: article.querySelector('p')?.textContent.trim() || '',
            date: date
        });
    }

    return reviews;
}


function parsePage() {
    return {
        meta: getMetaInfo(),                // Мета-информация страницы
        product: getProductData(),          // Данные карточки товара
        suggested: getSuggestedProducts(),  // Массив дополнительных товаров
        reviews: getReviews()               // Массив отзывов
    };
}

window.parsePage = parsePage;