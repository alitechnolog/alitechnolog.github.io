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

if (window.atTopMenu) {
    window.onscroll = atScroll
    window.onresize = atScroll
    atScroll()
}

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

function fallbackCopyTextToClipboard(text, okCallback, errorCallback) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
        var successful = document.execCommand('copy');
        if (successful) {
            console.log('success copy [fallback]:', text)
            if (typeof okCallback === 'function') okCallback(text)
        } else {
            console.log('error copy [fallback]:', text)
            if (typeof errorCallback === 'function') errorCallback(text)
        }
    } catch (err) {
        console.log('error copy [fallback]:', text, err)
        if (typeof errorCallback === 'function') errorCallback(text)
    }
  
    document.body.removeChild(textArea);
  }
  function copyTextToClipboard(text, okCallback = () => {}, errorCallback = () => {}) {
    if (typeof text !== 'string') throw new TypeError('text to copy must be string, but exists ' + typeof text)
    if (!navigator.clipboard) return fallbackCopyTextToClipboard(text);
    
    navigator.clipboard.writeText(text).then(function() {
        console.log('success copy:', text)
        if (typeof okCallback === 'function') okCallback(text)
    }, function(err) {
        console.log('error copy:', text, err)
        if (typeof errorCallback === 'function') errorCallback(text)
    });
  }

  document.body.addEventListener('click', e => {
    let link = e.composedPath().find(i => i.hash === '#code')
    if (!link) return
    e.preventDefault()
    let text = link.textContent.trim()
    
    text && copyTextToClipboard(text, () => {
        document.body.dataset.code = text
        setTimeout(i => { delete document.body.dataset.code }, 1000)
    }, () => {
        alert('Не удалось скопировать промокод')
        delete document.body.dataset.code
    })
    
    return false
})