function load() {
  import('./bar').then(bar => {
    console.log("i'm in foo~");
    console.log(`got ${bar.default} fron bar`);
  });
}

const btn = document.createElement('button');

btn.innerText = 'import()';
btn.onclick = load;

document.body.appendChild(btn);
