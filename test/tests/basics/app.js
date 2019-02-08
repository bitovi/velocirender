const main = document.querySelector('main');

// Just for fun.
new MutationObserver(() => {})
.observe(main, { childList: true });

const div = document.createElement('div');
div.setAttribute('id', 'app');
div.textContent = 'Hello world!';
main.appendChild(div);
