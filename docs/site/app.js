
const { hljs } = self;
hljs.initHighlighting();

// Initialize the tabs
tabs();

function tabs() {
  let tabs = document.querySelector('.tabs');
  tabs.addEventListener('click', ev => {
    if(ev.target.localName === 'button') {
      let parentLi = ev.target.parentNode;

      for(let li of tabs.children) {
        if(li === parentLi) {
          li.classList.add('selected');
        } else {
          li.classList.remove('selected');
        }
      }
    }
  })
}