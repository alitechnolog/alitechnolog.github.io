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

document.body.addEventListener('click', e => { 
    let btn = e.composedPath().find(i => i.hash === '#order')
    if (!btn) return
    
    let product = btn
    while ( product = product.parentElement ) 
        if (product.dataset.productUid) break;
    
    if ( product === btn ) return

    let sku = product.querySelector('.js-product-sku')
    if (!sku) return alert('Товара нет в наличии')
    
    sku = sku.textContent.trim()
    if (!sku) return alert('Товара нет в наличии')

    Object.assign(document.createElement('a'), { target: '_blank', href: 'https://aliclick.shop/r/c/' + sku }).click()
})

function atScroll() {
    let vh = window.innerHeight / 100
    let y = window.scrollY

    if ( y >= 90 * vh) atTopMenu.classList.add('scroll')
    else atTopMenu.classList.remove('scroll', 'full')
}


window.onscroll = atScroll
window.onresize = atScroll
atScroll()

atTopMenu.onclick = function(e) {
    if (!this.classList.contains('scroll')) return
    if (this.classList.contains('full')) {
        this.style.justifyContent = ''
        return this.classList.remove('full')
    }
    requestAnimationFrame(i => this.style.justifyContent = 'center')
    this.classList.add('full')
    return false
}