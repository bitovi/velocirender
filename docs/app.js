// Initialize the tabs
tabs();
setTimeout(enableFrames, 500);
document.querySelector('#refresh').addEventListener('click', refresh);
window.addEventListener('message', onMessage);

let speedMap = new Map();

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
  speedMap.clear();
  let i = 0;
  for(let frame of document.querySelectorAll('iframe')) {
	let data = [];
	speedMap.set(i, data);
	let src = frame.dataset.src;
	frame.src = './loading.html';
	let resolve;
	loads.push(new Promise(r => { resolve = r; }));
	frame.onload = () => {
		frame.onload = Function.prototype;
		resolve(function(){
			data.push(Date.now());
			frame.src = src;
		});
	};
	i++;
  }

  Promise.all(loads).then(fns => {
	for(let fn of fns) {
		fn();
	}
  });
}

function onMessage(ev) {
	let now = Date.now();
	for(var i = 0; i < window.frames.length; i++) {
		if(window.frames[i] === ev.source) {
			break;
		}
	}
	let data = speedMap.get(i);
	data.push(now);

	function allDone() {
		let done = true;
		for(let [,a] of speedMap) {
			if(a.length < 2) done = false;
		}
		return done;
	}

	if(ev.data === "first-item") {
		if(allDone()) {
			let ir = speedMap.get(0)[1];
			let c = speedMap.get(1)[1];
			let el = document.querySelector('#times');
			if(ir < c) {
				let diff = c - ir;
				el.textContent = `Velocirender ${diff}ms faster 😃`;
			} else {
				let diff = ir - c;
				el.textContent = `Velocirender ${diff}ms slower ☹️`;
			}
			
		}
	}
}

function enableFrames() {
	let i = 0;
	for(let frame of document.querySelectorAll('iframe')) {
		let data = [Date.now()];
		speedMap.set(i, data);
		frame.src = frame.dataset.src;
		i++;
	}
}