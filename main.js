let AT = globalThis.AliTechnology ??= {}

const { assign, entries, defineProperties, getOwnPropertyDescriptors } = Object
const config = {
    
}
assign(AT, { config })

if (!navigator.clipboard) {
    navigator.clipboard = {
        writeText(str) {
            return new Promise(function(resolve, reject) {
                let node = document.createElement("textarea");
                node.value = str;

                node.style.top = "0";
                node.style.left = "0";
                node.style.position = "fixed";
              
                document.documentElement.appendChild(node);
                node.focus();
                node.select();
              
                try {
                  var successful = document.execCommand('copy');
                  resolve(successful)
                } catch (err) {
                  reject(err)
                }
              
                document.documentElement.removeChild(node);
            });
        }
    }
}


// DOM.JS
{
    const { assign, entries, defineProperties, getOwnPropertyDescriptors } = Object
    const states = new WeakMap()
    const { append } = HTMLElement.prototype
    const { append : appendfragment } = DocumentFragment.prototype

    const element = {
        get state() {
            return states.get(this) ?? states.set(this, {}).get(this)
        },
        set state(state) {
            if (typeof state !== 'object') state = null
            states.set(this, state ?? {})
        },

        get text() {
            return this.textContent
        },
        set text(value) {
            this.textContent = value
        },

        get class() {
            return this.classList.toString()
        },
        set class(value) {
            [...this.classList].forEach(this.classList.remove, this.classList)
            this.classList.add(...value.trim().split(/\s+/))
        },

        get name() {
            return this.getAttribute('name') || ''
        },
        set name(value) {
            this.setAttribute('name', value)
        },

        get tag() {
            return this.localName
        },

        clear(root = this) {
            root && [...root.childNodes].forEach(root.removeChild, root)
            return this ?? root
        },
        append(...nodes) {
            append.apply(this, nodes.filter(Boolean))
            return this
        },
        bytag(tag = '*') {
            return this.getElementsByTagName(tag)
        },
        byclass(name) {
            return this.getElementsByClassName(name)

        },
        byid(id) {
            return this.querySelector('#' + id)
        },
        make(tag, state = {}) {
            let el = document.createElement(tag)
            if (state.dataset) {
                assign(el.dataset, state.dataset)
                delete state.dataset
            }
            return assign(el, state)
        },
        select(selector) {
            return this.querySelector(selector)
        },
        all(selector) {
            return this.querySelectorAll(selector)
        }
    }

    const fragment = {
        get text() {
            return this.textContent
        },
        set text(value) {
            this.textContent = value
        },

        clear(root = this) {
            root && [...root.childNodes].forEach(root.removeChild, root)
            return this ?? root
        },
        append(...nodes) {
            appendfragment.apply(this, nodes.filter(Boolean))
            return this
        },

        bytag(tag = '*') {
            return this.querySelectorAll(tag)
        },
        byclass(name) {
            return this.querySelectorAll('.' + name)
        },
        byid(id) {
            return this.getElementById(id)
        },
        make(tag, state = {}) {
            return assign(document.createElement(tag), state)
        },
        select(selector) {
            return this.querySelector(selector)
        },
        all(selector) {
            return this.querySelectorAll(selector)
        }
    }

    const eventtaget = {
        on(...setup) {
            this.addEventListener(...setup)
            return this
        },
        off(...setup) {
            this.removeEventListener(...setup)
            return this
        },
        once(...setup) {
            let [t, h, o, ...x] = setup
            assign(o ??= {}, { once: true })
            this.addEventListener(t, h, o, ...x)
            return this
        },
    }

    const dispatchevent = (target, event, resolve) => resolve(target.dispatchEvent(event))
    const events = {
        send(target = globalThis) {
            return target.dispatchEvent(this)
        },
        post(target = globalThis, delay = 0) {
            let resolver = resolve => setTimeout(dispatchevent, delay | 0, target, this, resolve)
            return new Promise(resolver)
        },
    }

    defineProperties(HTMLElement.prototype, getOwnPropertyDescriptors(element))
    defineProperties(DocumentFragment.prototype, getOwnPropertyDescriptors(fragment))
    defineProperties(EventTarget.prototype, getOwnPropertyDescriptors(eventtaget))
    defineProperties(Event.prototype, getOwnPropertyDescriptors(events))

}


// API.JS
{
    const uri = {
        getproductslist: '//store.tildacdn.com/api/getproductslist/?getparts=true&',
        getproduct: '//store.tildacdn.com/api/getproduct/?',
        getproducttabs: '//store.tildacdn.com/api/getproducttabs/?'
    }
    
    async function getproductslist({ partid, count, slice, min, max, sort, order } = {}) {
        let params = new URLSearchParams({
            storepartuid: partid || "332915160141",
            size: count | 0,
            slice: slice | 0,
        });
    
        if (sort) params.append('sort[' + sort + ']', order || 'desc')
    
        let response = await fetch(uri.getproductslist + params)
        return await response.json()
    }
    
    async function getproduct({ id, partid }) {
        let params = new URLSearchParams({
            storepartuid: partid || "332915160141",
            productuid: id
        });
    
        let response = await fetch(uri.getproduct + params)
        return await response.json()
    }
    async function getproducttabs({ id, partid }) {
        let params = new URLSearchParams({
            storepartuid: partid || "332915160141",
            productuid: id
        });
    
        let response = await fetch(uri.getproducttabs + params)
        return await response.json()
    }
    
    AT.api = { getproductslist, getproduct, getproducttabs }
}

// ROUTER.JS
{
    const { assign } = Object

    const states = new WeakMap();

    function getpath(path = location.pathname) {
        return decodeURIComponent(path).split('/').filter(Boolean)
    }

    addEventListener('click', e => {
        e.composedPath().find(node => node.href) && !e.ctrlKey && e.preventDefault()
    })

    addEventListener('popstate', e => {
        e.stopImmediatePropagation()
        // console.log('route', location.href)
        route()
    }, true)

    addEventListener('click', async e => {
        if (e.ctrlKey || e.stop) return
        let t = e.composedPath().find(node => node.href)
        if (!t) return
        // console.log('route', t.href)
        resolveuri(t.href)
        if (a.hash == '#copy' || a.hash == '#code') {
            await navigator.clipboard.writeText(t.textContent)
            return new Event('copied', { bubbles: true }).send(e.target)
        }
        if (location.host !== a.host) 
            return assign(a, { rel: 'noopener', target: '_blank' }).click()
        if (location.href === a.href) {
            history.replaceState(null, '')
            return route(), scrollTo(0,0)
        }
        route(true, a.href)
    })

    // addEventListener('route', e => {
    //     console.log('route', history.state, location.pathname)
    // })

    const stateid = () => performance.now() | 0 

    function setstate(target, state) {
        let map = states.get(target) ?? new Map()
        let sid = history.state

        if (typeof sid !== 'number') {
            sid = history.state = stateid()
        }
        if (state != null) {
            map.set(sid, state)
            states.set(target, map)
        }
        route()
    }

    function getstate(target) {
        return states.get(target)?.get?.(history.state)
    }

    function route(newpath = false, url = location.href) {
        url = canonuri(url)
        if (newpath) {
            history.pushState(stateid(), '', url)
        } else {
            let sid = typeof history.state === 'number' ? history.state : stateid()
            history.replaceState(sid, '', url)
        }
        dispatchEvent(new Event('route'))
    }

    function canonuri(uri = location.href) {
        uri = resolveuri(uri)
        uri = new URL(uri)
        uri.pathname = uri.pathname.replace(/\/+/g, '/')
        return uri + ''
    }

    const a = document.createElement('a')
    function resolveuri(uri = location.href) {
        a.href = uri
        return a.href
    }

    history.replaceState(null, '')
    route()

    assign(AT, {
        getpath, canonuri, route, setstate, getstate, states, resolveuri
    })
}

// STORE.JS
{
    const { api } = AT
    const { assign } = Object

    const random = () => (Math.random() * 10 | 0) < 5

    const cache = {
        partslist: null,
        parts: new Map(),
        products: new Map(),
        slices: new Map()
    }

    // STORE PARTS

    const partsmap = ({ parts = [], partlinks = {} } = {}) => {
        return cache.partslist = parts.map(part => {
            if (partlinks[part.uid]) {
                part.descr = partlinks[part.uid].infotext ?? ''
                part.img = partlinks[part.uid].infourl ?? ''
            }
            return makepart(part)
        }).filter(Boolean)
    }

    const makepart = ({ uid: id, title, descr, img, link } = {}) => {
        if ( !id || !title ) return
        descr ||= ''
        img ||= ''
        link = '/store/' + id
        return cache.parts.set(id, { id, title, descr, img, link, products: new Set() }).get(id)
    }

    async function parts() {
        return cache.partslist ??= api.getproductslist({ count: 1 }).then(partsmap)
            .catch(e => { cache.partslist = null; throw e })
    }

    // STORE SLICES

    const slicemap = ({ products = [], total = 0, nextslice: next, slice: current } = {}) => {
        return assign(products.map(makeproduct).filter(Boolean), { total, next, current })
    }

    const makeproduct = ({ 
        uid: id, sku, title, descr, mark: promo, text, gallery, price, priceold, partuids: parts 
    } = {}) => {
        if ( !id || !title ) return
        descr = descr ? descr.trim() : ''
        // descr ||= id
        promo = promo ? promo.trim() : ''
        // promo = random() ? promo : 'ASD34'
        title = (title.startsWith(descr) ? title.slice(descr.length) : title).trim()
        gallery = gallery ? JSON.parse(gallery) : []
        parts = parts ? JSON.parse(parts) : []
        price = (price || '').replaceAll(' ', '') | 0, 
        priceold = (priceold || '').replaceAll(' ', '') | 0

        for (const partid of parts) {
            cache.parts.get(partid)?.products?.add?.(id)
        }
        // sku = random() ? '' : sku
        const link = '/product/' + id
        const button = sku ? 'https://aliclick.shop/r/c/' + sku : link + '#order'
        const buttonlabel = sku ? 'Купить' : 'Заказать'
        const buttontype = sku ? 'buy' : 'order'

        return cache.products.set(id, { 
            id, title, descr, gallery, parts, 
            text, price, priceold, promo, sku, 
            link, button, buttonlabel, buttontype  
        }).get(id)
    }

    async function slice({ partid, count, slice, min, max, sort = 'created', order = 'desc' }, id) {
        count |= 0, slice |= 0, min |= 0, (max |= 0) || (min = 0)

        if ( max < min || min > max ) throw RangeError('store.slice price filter invalid')

        return cache.slices.get(id = [partid, count, slice, min, max, sort, order].join(':')) ??
            cache.slices.set(id, api.getproductslist({ partid, count, slice, min, max, sort, order })
                    .then(slicemap).then(slice => assign(slice, { id }))
                    .then(slice => (cache.slices.set(id, slice), slice))
                    .catch(e => { cache.slices.delete(id); throw e })
            ).get(id)
    }


    // STORE PRODUCT 

    async function product(id) {
        let item = cache.products.get(id)
        if (item) return item

        item = await api.getproduct({ id })
        item = item.product ? makeproduct(item.product) : null
        return item

    }

    async function tab(id) {
        let product = cache.products.get(id)
        if (!product) return
        if ('tab' in product)  return product.tab 
        let tab = await api.getproducttabs({ id })
        tab = product.tab = tab?.tabs?.length ? tab.tabs[0].data : ''
        return tab
    }

    // EXPORT 

    AT.store = { parts, slice, product, cache, tab }
}

// CUSTOM-ELEMENT.JS
{
        const { assign, entries, defineProperty } = Object

        class CustomElement extends HTMLElement {
            constructor() {
                super().render = getrender(this)
                this.events = this.globalevents = this.hookevents = ''
            }
            attributeChangedCallback(name, old, value) {
                if (value === old) return
                name = tocamelcase(name)
                if (name in this) this[name] = value
                this.render()
            }
            connectedCallback() {
                eventhandlers(this)
                this.render()
            }
            disconnectedCallback() {
                eventhandlers(this)
                this.render()
            }
            get eventhandler() {
                let value = e => this['on' + e.type]?.(e)
                defineProperty(this, 'eventhandler', { value })
                return value
            }
        }
        const tocamelcase = (value) => { // todo
            return value.toLowerCase().replace(/[^a-z]+./g, x => x.slice(-1).toUpperCase()).trim()
        }
        
        const getrender = (target, frame, render = target.render) => {
            return (data) => {
                if (!target.isConnected) {
                    return frame = void cancelAnimationFrame(frame)
                }
        
                frame ??= requestAnimationFrame(ts => {
                    frame = void null
        
                    if (!target.isConnected) return
        
                    if (target.prerender) {
                        target.clear().append(target.prerender)
                    }
        
                    if (render) {
                        render.call(target, target, data)
                    }
        
                    // ts = performance.now() - ts | 0
                    // console.log(target.tagName, ts > 1000 ? (ts / 1000 | 0) + 's' : ts + 'ms')
                })
            }
        }
        
        const eventhandlers = el => {
            const state = { 
                handler: el.eventhandler, ctx: el,
                listener: el.isConnected ? 'addEventListener' : 'removeEventListener'
            }
        
            const t = state.listener == 'addEventListener' ? 'listen' : 'unlisten'
        
            if (el.events) {
                state.set = new Set()
                el.events.split(/\s+/).reduce(movehandler, state)
                // console.log(el.tag, t, 'events:', ...state.set)
            }
            if (el.globalevents) {
                state.set = new Set()
                state.ctx = globalThis
                el.globalevents.split(/\s+/).reduce(movehandler, state)
                // console.log(el.tag, t, 'global events:', ...state.set)
            }
            if (el.hookevents) {
                state.set = new Set()
                state.options = true
                el.hookevents.split(/\s+/).reduce(movehandler, state)
                // console.log(el.tag, t, 'capture events:', ...state.set)
            }
        }
        
        function movehandler(state, type) {
            if (state.set.has(type)) return state
            state.ctx[state.listener](type, state.handler, state.options)
            state.set.add(type)
            return state
        }
        
        assign(AT, { CustomElement })
}

// ROUTED-ELEMENT.JS
{
    const { CustomElement, getpath, getstate, setstate } = AT
    const { assign } = Object

    class RoutedElement extends CustomElement {
        constructor(){
            super().globalevents = 'route'
            this.events = 'load'
        }
        get routed() {
            let [route = 'index'] = getpath()
            let routes = (this.dataset.routes ?? '').trim()
            return routes.length ? routes.includes(route) : true
        }
    }

    assign(AT, { RoutedElement })
}

// STORE-PARTS.JS
{
    const { 
        CustomElement, store, setstate
    } = AT
    const { assign } = Object
    const { make } = document.documentElement
    
    class StoreParts extends CustomElement {
    
        constructor(linkclass = '', linklabel = '') {
            super()
            assign(this, {
                class: 'store-parts',
                state: { linkclass, linklabel, links: this.bytag('a') }
            })
        }
    
        async render({ state }) {
            let parts = await store.parts()
            setstate(this, true)
            this.clear().append(
                ...parts.map(makepartlink)
            )
            if (state.linkclass) for (let item of state.links) {
                item.class += ' ' + state.linkclass
                if (state.linklabel) item.dataset.link = state.linklabel
            }
        }
    
    }
    
    const makepartlink = ({ title, descr, img, link: href }) => make('a', { 
        text: title, href, class: 'store-part',
        title: descr ? title + ' ' + descr : title,
        dataset: { descr },
        style: '--store-part:url(' + img + ')'
    })
    
    
    customElements.define('store-parts', StoreParts)
    assign( AT, { StoreParts })
    
}

// PRODUCT-TITLE.JS
{
    const { CustomElement } = AT
    const { assign } = Object
    const { make } = document.documentElement
    
    class ProductTitle extends CustomElement {
    
        constructor({ title, descr }) {
            super()
            assign(this, {
                class: 'product-header',
                state: { title, descr },
            })
        }
    
        render({ state }) {
            this.append(
                make('span', { class: 'product-descr', text: state.descr }),
                make('span', { class: 'product-title', text: state.title })
            )
        }
    }
    
    
    
    customElements.define('product-title', ProductTitle)
    assign( AT, { ProductTitle })
    
}

// PRODUCT-GALLERY.JS
{
    const { CustomElement } = AT
    const { assign } = Object
    const { make } = document.documentElement
    
    class ProductGallery extends CustomElement {
    
        constructor({ gallery = []}) {
            super()
            assign(this, {
                class: 'product-gallery',
                state: { gallery },
            })
        }
    
        render({ state }) {
            this.append(
                ...state.gallery.map(i => assign(new Image, { src: i.img }))
            )
        }
    }
    
    customElements.define('product-gallery', ProductGallery)
    assign( AT, { ProductGallery })
}


// PRODUCT-PRICE.JS
{
    const { CustomElement } = AT
    const { assign } = Object
    const { make } = document.documentElement
    
    class ProductPrice extends CustomElement {
        events = 'click'
        constructor({ price, priceold, promo }) {
            super()
            assign(this, {
                class: 'product-price-data',
                state: { price, priceold, promo },
            })
        }
    
        render({ state }) {
            if (!state.price) return this.clear()
            const price = make('span', { class: 'product-price', text: fprice.format(state.price) } )
            if (state.priceold) price.dataset.priceold = fpriceold.format(state.priceold)
            const promo = state.promo ? make('span', { class: 'product-promo', text: state.promo, dataset: { 
                promo: state.promo, promolabel: 'цена с промокодом'
            } }) : null
            if (promo) this.title = 'нажмите чтобы скопировать'
            this.clear().append( promo, price)
        }
    
        async onclick(e) {
            if (this.state.promo) {
                e.stop = true
                await navigator.clipboard.writeText(this.state.promo)
                new Event('copied', { bubbles: true }).send(this)
            }
        }
    }
    
    
    const fprice = new Intl.NumberFormat('ru-RU', { 
        useGrouping: true, 
        style: 'currency', currency: 'RUB', currencyDisplay: 'narrowSymbol',
        maximumFractionDigits: 0,
    })
    const fpriceold = new Intl.NumberFormat('ru-RU', { 
        useGrouping: true, 
        // style: 'currency', currency: 'RUB', currencyDisplay: 'narrowSymbol',
        maximumFractionDigits: 0,
    })
    
    
    customElements.define('product-price', ProductPrice)
    assign( AT, { ProductPrice })
    
}

// PRODUCT-BUTTON.JS
{
    const { CustomElement } = AT
    const { assign } = Object
    const { make } = document.documentElement
    
    class ProductButton extends CustomElement {
    
        constructor({ link, button, buttonlabel, buttontype }) {
            super()
            assign(this, {
                class: 'product-footer',
                state: { link, button, buttonlabel, buttontype },
            })
        }
    
        render({ state }) {
            const link = state.link ? make('a', { href: state.link, class: 'product-link', text: 'Подробнее'}) : ''
            const button = 
            this.append(
                link,
                make('a', { 
                    href: state.button, class: 'btn btn-fill product-button', text: state.buttonlabel, 
                    dataset: { type: state.buttontype }
                }),
            )
        }
    }
    
    customElements.define('product-button', ProductButton)
    assign( AT, { ProductButton })
    
}


// PRODUCT-FORM.JS
{
    const { 
        CustomElement, resolveuri
    } = AT
    const { assign } = Object
    const { make } = document.documentElement
    
    class ProductForm extends CustomElement {
        
        constructor(data) {
            super()
            this.events = 'submit'
            assign(this, {
                class: 's-product-form',
                state: { data },
            })
        }
    
        render({ state }) {
            this.append(
                makeform()
            )
        }
        onsubmit(e) {
            e.preventDefault()
            e.stopPropagation()
            let form = e.target
            let valid = validate(form)
            if (!valid) return assign(new Event('erroralert', { bubbles: true }), { 
                text: 'некорректный e-mail'
             }).send(form)
            sendform(e.target, this.state.data)
        }
    }
    
    function sendform(form, data) {
        let name = form.children.ordername?.value?.trim?.() ?? ''
        let email = form.children.orderemail?.value?.trim?.() ?? ''
        let comment = form.children.ordercomment?.value?.trim?.() ?? ''
        name ||= 'не указано'
        comment ||= 'не указан'
        if (!email) return assign(new Event('erroralert', { bubbles: true }), { 
            text: 'что-то пошло не так'
         }).send(form)
    
        let order = {
            title: data.title, id: data.id, price: data.price, link: resolveuri(data.link),
            email, name, comment
        }
    
        assign(new Event('order', { bubbles: true }), { order }).send(form)
        let btn = form.children.ordersubmit 
        if(btn) {
            btn.toggleAttribute('disabled', true)
            btn.text = 'отправка'
            form.once('complete', e => {
                form.reset()
                btn.toggleAttribute('disabled', false)
                btn.text = 'Отправить'
            })
        }
    }
    
    function validate(form) {
        let email = (form.children.orderemail?.value ?? '').trim()
        if (!email) return console.log('email empty')
        if (email.length > 100) return console.log('email length overflow')
        email = email.split('@')
        if (email.length != 2) return console.log('invalid email')
        let [name, host] = email
        if (!name || !host) return console.log('invalid email')
        return true
    }
    
    function makeform() {
        let iname = make('input', { 
            id: 'ordername', type: 'text', class: 'inp product-input',
            maxLength: 50,
        })
        let iemail = make('input', { 
            id: 'orderemail', type: 'text', class: 'inp product-input',
            maxLength: 100, 
        })
        let icomment = make('textarea', {
            id: 'ordercomment', class: 'inp inp-area product-input',
            maxLength: 600,
        })
    
        let lname = make('label', { text: 'Имя', for: 'ordername', class: 'product-form-label' })
        let lemail = make('label', { text: 'E-mail', for: 'orderemail', class: 'product-form-label' })
        let lcomment = make('label', { text: 'Комментарий', for: 'ordercomment', class: 'product-form-label' })
    
        let clearbutton = make('button', { type: 'reset', id: 'orderclear', text: 'Очистить', class: 'btn product-form-button' })
        let orderbutton = make('button', { type: 'submit', id: 'ordersubmit', text: 'Отправить', class: 'btn btn-fill product-form-button' })
    
        return make('form', { id: 'orderform', class: 'product-form' }).append(
            make('h4', { 
                id: 'order',
                text: 'Закажи прямо сейчас', 
                class: 'product-form-heading heading',
                dataset: { sub: 'Заполните форму и мы с вами свяжемся' } 
            }),
                    lname, iname,
                    lemail, iemail,
                    lcomment, icomment,
                    clearbutton, orderbutton
        )
    
    }
    
    customElements.define('product-form', ProductForm)
    assign( AT, { ProductForm })
    
}


// PRODUCT-ITEM.JS
{
    const { 
        CustomElement, 
        ProductTitle, ProductPrice, ProductButton, ProductGallery
    } = AT
    const { assign } = Object
    const { make } = document.documentElement
    
    class ProductItem extends CustomElement {
    
        constructor(data) {
            super()
            assign(this, {
                class: 'product-item',
                state: { data },
            })
        }
    
        render({ state }) {
            this.append(
                make('a', { href: state.data.link, class: 'contents' })
                    .append(
                        new ProductGallery(state.data),
                        new ProductTitle(state.data),
                        new ProductPrice(state.data)
                    ),
                new ProductButton(state.data),
            )
        }
    }
    
    customElements.define('product-item', ProductItem)
    assign( AT, { ProductItem })
    
}

// PRODUCT-LIST.JS
{
    const { 
        RoutedElement, ProductItem, store, getstate, setstate, getpath
    } = AT
    const { assign } = Object
    const { make } = document.documentElement
    const partid = ([_, id] = getpath()) => id
    const cache = new Map()
    
    class ProductList extends RoutedElement {
    
        constructor() {
            super()
            assign(this, {
                class: 's-product-list',
                state: { slice: [] },
            })
            assign(this.dataset, { routes: 'index store dev' })
            this.hidden = true
            this.events = 'click'
        }
    
        async render({ state }) {
    
            const menu = make('header', { class: 'product-menu', id: 'menu', hidden: true })
            const pager = make('footer', { class: 'product-pager', id: 'footer', hidden: true })
            const loadmore = make('a', { id: 'loadmore', text: 'загрузить ещё', class: 'btn btn-xl' })
            const items = make('div', { 
                class: 'product-list', id: 'items', dataset: { view: '' }
            })
    
            assign(state, { items, loadmore, pager, menu })
    
            pager.append(loadmore)
            this.clear().append(menu, items, pager)
            this.onroute()
        }
    
        async onroute() {
            if (this.hidden = !this.routed) return console.log('product list not routed')
            
            const s = getstate(this)
            if (!s) return initialstate(this)
    
            const current = this.state.slice
            if (s.id === (current.id ?? '') || current.then) return
            
            const e = s.elastic
            s.elastic || this.state.items.clear()
            s.elastic = null
    
            let slice = this.state.slice = listfill(s)
            try {
                slice = await slice
            } catch (e) {
                slice = []
                console.error(e)
            }
            
            cache.get(slice.id) || cache.set(slice.id, slice)
    
            this.state.slice = slice
            s.list.push(slice.id)
            s.list = [...new Set(s.list)]
            s.id = slice.id
    
            let nodes = e ? slice : s.list.map(i => cache.get(i)).flat()
            nodes = nodes.map(i => new ProductItem(i))
            this.state.items.append(...nodes)
    
            const { menu, pager, loadmore } = this.state
            menu.hidden = getpath().length < 2 
            pager.hidden = slice.next == null
            loadmore.toggleAttribute('disabled', false)
            loadmore.text = 'загрузить ещё'
        }
    
        onclick(e) {
            if (e.target.id !== 'loadmore') return
            e.stopPropagation()
            if (this.state.slice.next) {
                const s = getstate(this) 
                if (!s) return this.onroute()
                assign(s, { count: 12, slice: this.state.slice.next, id: null, elastic: true })
                e.target.toggleAttribute('disabled', true)
                e.target.text = 'загружается'
                setstate(this, s)
            }
        }
    
    }
    
    function initialstate(root) {
        const part = partid()
        const state = { count: part ? 12 : 3, partid: part, slice: 1, id: null, list: [], elastic: null }
        setstate(root, state)
    }
    
    async function listfill({ count, partid, slice }) {
        let list = await store.slice({ partid, count, slice })
        return list
    }
    
    customElements.define('product-list', ProductList)
    assign( AT, { ProductList })
    
}


// PRODUCT-CARD.JS
{
    const { 
        RoutedElement, ProductTitle, ProductGallery,
        ProductPrice, ProductButton, ProductForm,
        store, getstate, setstate, getpath, canonuri
    } = AT
    const { assign } = Object
    const { make } = document.documentElement
    
    class ProductCard extends RoutedElement {
        events = 'click'
        constructor() {
            super()
            assign(this, {
                class: 's-container s-product-card', 
                state: { },
            })
            assign(this.dataset, { routes: 'product tproduct' })
    
            this.hidden = true
        }
    
        async render({ state }) {
            if (this.hidden = !this.routed) return
            let [route = '', id = ''] = getpath()
    
            if (route === 'tproduct') {
                id = id.split('-')[1]
                history.replaceState(history.state, '', canonuri('/product/' + id))
            }
    
            console.log('card request', id + '')
    
            const product = await store.product(id)
            if (product) {
                
                this.clear().append(
                    makeheading(), makecard(product)
                )
    
                this.state.product = true
                let s = assign(getstate(document) ?? {}, {
                    title: product.title
                })
                setstate(document, s)
                this.state.product = false
                
                requestAnimationFrame(i => {
                    imgswitch(this)
                    if (product.buttontype === 'order' && location.hash === '#order') {
                        this.byid('order').scrollIntoView({ block: 'center' })
                    }
                })
            }
        }
    
        onroute() {
          this.state.product || this.render()
        }
    
        onclick(e) {
            if (e.target.tag === 'img') {
                e.stopPropagation()
                return imgswitch(e.target.parentElement, e.target)
            }
    
            if (e.target.tag === 'product-gallery') {
                return e.target.classList.toggle('fullscreen')
            }
        }
    
    }
    
    function imgswitch(root, img) {
        let imgs = root.bytag('img')
        if (!imgs.length) return
        img ||= imgs[0]
        for (let i of imgs) {
            i.toggleAttribute('selected', i === img)
        }
        img.parentElement.style.setProperty('--current-image', 'url(' + img.src + ')')
    }
    
    function makeheading() {
        return make('h2', { class: 'heading', hidden: true,  text: 'Карточка продукта' })
    }
    
    function makecontent(data) {
        return make('section', { class: 'card-content' })
            .append(
                new ProductTitle(data),
                makefooter(data), maketext(data)
            )
    }
    
    function makefooter(data) {
        return make('footer', { class: 'product-footer' })
                .append(
                    new ProductPrice(data), 
                    new ProductButton(data)
                )
    }
    
    function maketext(data) {
        return make('section', { class: 'product-text', innerHTML: data.text ?? '' })
            
    }
    
    function makecard(data) {
        return make('section', { class: 'product-card' })
                .append(
                    new ProductGallery(data), makecontent(data), maketab(data), 
                    data.buttontype === 'order' ? new ProductForm(data) : null
                )
            
    }
    
    
    function maketab(data) {
        let tab = make('section', { class: 'product-text' })
        store.tab(data.id).then(c => {
            if (c) tab.innerHTML = c
        })
        return tab
            
    }
    
    customElements.define('product-card', ProductCard)
    assign( AT, { ProductCard })
    
}


// S-HEADER.JS
{
    const { 
        RoutedElement, StoreParts, getstate
    } = AT
    const { assign } = Object
    const { make } = document.documentElement
    const titlesuffix = ' - AliTechnology'
    const titledefault = document.title
    
    class HeaderElement extends RoutedElement {
    
        constructor() {
            super()
            assign(this, {
                class: 's-header s-container',
                state: { 
                    links: this.bytag('a') 
                }
            })
        }
    
        render({ state }) {
            this.clear().append(makenav())
            this.onroute()
        }
    
        onroute() {
            menuswitch(this.state.links)
        }
    
    }
    
    function menuswitch(links = []) {
        let selected, title
        for (let link of links) {
            if (location.host !== link.host) continue
            if (location.pathname.startsWith(link.pathname)) selected = link
            link.toggleAttribute('selected', false)
        }
        if (selected) {
            selected.toggleAttribute('selected', true)
            if (innerHeight > 600 || !document.documentElement.scrollTop) 
                selected.scrollIntoView({ inline: 'center', behavior: 'smooth' })
            if (selected.title) title = selected.title
        }
        title = (getstate(document)?.title || title || '').trim()
        if (title) title += titlesuffix
        document.title = title || titledefault
    }
    
    function makenav() {
        return make('nav', { class: 'h-nav h-container' })
                .append(makelogo(), makestorenav(), makesubnav())
    }
    
    function makelogo() {
        return make('a', { 
            href: '/', 
            text: 'AliTechnology',
            class: 's-logo h-nav-link'
        })
    }
    
    const subnav = [
        { href: '/promo', text: 'Промокоды' },
        { href: '/feeds', text: 'Подборки' },
        { href: '/feedback', text: 'Контакты' },
    ]
    
    const makesubnavlink = item => make('a', {...item, class: 'h-nav-link' })
    
    function makesubnav() {
        return make('section', { class: 'h-nav' })
            .append(...subnav.map(makesubnavlink))
    }
    
    function makestorenav() {
        return assign(new StoreParts('h-nav-link'), { class: 'h-nav'})
    }
    
    customElements.define('s-header', HeaderElement)
    assign( AT, { HeaderElement })
}


// S-STORE.JS
{
    const { 
        RoutedElement, StoreParts, ProductList, getstate, setstate, getpath
    } = AT
    const { assign } = Object
    const { make } = document.documentElement
    
    class StoreElement extends RoutedElement {
    
        constructor() {
            super()
            assign(this, {
                class: 's-store s-container',
                state: { },
            })
            assign(this.dataset, { routes: 'index store dev' })
            this.hidden = true
        }
    
        render({ state }) {
            this.clear().append(
                // make('h2', { class: 'heading', id: 'storehead', text: 'Выберите интересующую категорию' }),
                makestorenav(),
                // make('h2', { class: 'heading', text: 'Новые товары' }),
                new ProductList()
            )
            this.onroute()
        }
    
        onroute() {
            if (this.hidden = !this.routed) return
            const storeroute = getpath().length > 1
            // this.children.storehead.hidden = storeroute
            this.children.storenav.hidden = storeroute
        }
    
    }
    
    function makestorenav() {
        return assign(new StoreParts('s-nav-link', 'Смотреть все'), { id: 'storenav', class: 'store-nav'})
    }
    
    customElements.define('s-store', StoreElement)
    assign( AT, { StoreElement })
    
}

// ALI-TECHNOLOGY.JS
{
    const { 
        RoutedElement, 
        HeaderElement, 
        StoreElement, 
        ProductCard,
    } = AT
    const { assign } = Object
    const { make } = document.documentElement
    
    // customElements.whenDefined('ali-technology').then(() => {
    //     new (customElements.get('ali-technology'))
    // })
    
    customElements.define('ali-technology', class extends RoutedElement {
        constructor() {
            super()
            this.events = 'copied erroralert order'
            assign(this, {
                class: 's-root'
            })
            // document.body.replaceWith(this)
            console.log('create')
    
        }
    
        render({ state }) {
            this.clear().append(
                new HeaderElement, 
                new StoreElement,
                new ProductCard,
                make('footer', { class: 's-container s-footer'})
            )
        }
    
        oncopied(e) {
            let alert = make('div', { class: 'fullscreen-alert', text: 'скопировано' })
            this.append(alert)
            setTimeout(i => alert.remove(), 1000);
        }
        
        onerroralert(e) {
            let text = e.text
            let alert = make('div', { class: 'fullscreen-alert error-alert', text })
            alert.once('click', e => alert.remove())
            this.append(alert)
        }
    
        onorder(e) {
            let order = e.order
            console.log('order', order)
            setTimeout(i => {
                new Event('complete').send(e.target)
                let alert = make('div', { class: 'fullscreen-alert', text: 'сервер не отвечает' })
                alert.once('click', e => alert.remove())
                this.append(alert)
                setTimeout(i => alert.remove(), 2000);
            }, 3000)
        }
    
    })
        
}