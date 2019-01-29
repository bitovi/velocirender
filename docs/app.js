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

      let selectedArea = document.querySelector('.example-demos');
      let example = document.querySelector(ev.target.dataset.for);

	  document.querySelector('#refresh').removeEventListener('click', refresh);

      clear(selectedArea);
	  selectedArea.appendChild(document.importNode(example.content, true));
	  document.querySelector('#refresh').addEventListener('click', refresh);
	  refresh();
    }
  });
}

function clear(el) {
  while(el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

function refresh() {
  let loads = [];
  for(let frame of document.querySelectorAll('iframe')) {
	let src = frame.dataset.src;
	frame.src = './loading.html';
	let resolve;
	loads.push(new Promise(r => { resolve = r; }));
	frame.onload = () => {
		frame.onload = Function.prototype;
		resolve(function(){
			frame.src = src;
		});
	};
  }

  Promise.all(loads).then(fns => {
	for(let fn of fns) {
		fn();
	}
  });
}

function enableFrames() {
	for(let frame of document.querySelectorAll('iframe')) {
		frame.src = frame.dataset.src;
	}
}