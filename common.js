var options = {
    rootMargin: '-200px',
    threshold: 0
    
}
var callback = function(entries, observer) {
    console.log(entries)
    for(let i of entries) {
        if (i.isIntersecting) {
            i.target.scrollIntoView()
        }
    }
};
var observer = new IntersectionObserver(callback, options);

observer.observe(document.getElementById('rec370731053'))


observer.observe(document.getElementById('rec370769981'))