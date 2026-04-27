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

        // // Отрезаем приставку "og:" (это первые 3 символа)
        // const key = propertyName.slice(3);

        // // Для всех остальных тегов берем текст из разметки
        // og[key] = tag.getAttribute('content');

    }
    // console.log(og);

    // og.title = document.querySelector('title').textContent.trim();


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
        title: getTitle(),
        description: description,
        opengraph: getOpenGraph(),
        keywords: getKeywords()
    };

}


function parsePage() {
    return {
        meta: getMetaInfo(), // Мета-информация страницы
        product: {},         // Данные карточки товара
        suggested: [],       // Массив дополнительных товаров
        reviews: []          // Массив отзывов
    };
}

window.parsePage = parsePage;