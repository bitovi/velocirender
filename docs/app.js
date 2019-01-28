
const { hljs } = self;
hljs.initHighlighting();

// Initialize the tabs
tabs();
setTimeout(enableFrames, 500);
document.querySelector('#refresh').addEventListener('click', refresh);

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

      let selectedArea = document.querySelector('.selected-example');
      let example = document.querySelector(ev.target.dataset.for);

      clear(selectedArea);
	  selectedArea.appendChild(document.importNode(example.content, true));
	  for(let frame of selectedArea.querySelectorAll('iframe')) {
		  frame.onload = () => {
			  frame.onload = Function.prototype;
			  frame.src = frame.dataset.src;
		  };
	  }
    }
  });
}

function clear(el) {
  while(el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

function refresh() {
  for(let frame of document.querySelectorAll('iframe')) {
	let src = frame.src;
	frame.src = './loading.html';
	frame.onload = () => {
		frame.onload = Function.prototype;
		frame.src = src;
	};
  }
}

function enableFrames() {
	for(let frame of document.querySelectorAll('iframe')) {
		frame.src = frame.dataset.src;
	}
}