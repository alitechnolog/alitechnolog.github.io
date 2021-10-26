console.log('script load')

function initCatalog() {
    let els = document.querySelectorAll('[data-storepart-link]')

    if (!els.length) return setTimeout(initCatalog)

    for (let e of els) {
        let a = document.createElement('a')
        let name = e.textContent == 'Все' ? 'Все товары' : e.textContent
        a.textContent = name
        a.sourceLink = e
        a.addEventListener('click', catalogLink)
        atCat.append(a)
    }
    console.log('catalog category init', els.length)
}

function catalogLink(event) {
    event.preventDefault()
    event.target.sourceLink.click()
    at('/catalog')
}

setTimeout(initCatalog)