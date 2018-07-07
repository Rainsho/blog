// submit + strategy

const request = require('superagent');
const { header, urls } = require('./c');

const ids = [urls.dump];
const strategy = [[0, 5], [5, 10], [0, 10]];

let done = false;

function rnd(id = urls.dump) {
  return request
    .get(urls.rnd(id))
    .set(header)
    .then((res) => {
      // console.log('----randomCode----', id);
      // console.log(res.body);
      const { randomCode } = res.body.data;
      if (!randomCode && !done) return rnd(id);
      return { id, randomCode };
    });
}

function sub({ id, randomCode }) {
  if (done) return Promise.resolve();
  return request
    .post(urls.sub())
    .set(header)
    .send(urls.data(id, randomCode))
    .then((res) => {
      // console.log('----order----', id, randomCode);
      // console.log(res.body);
      const { status } = res.body.data;
      if (status === 1 || status === 4) {
        done = true;
        console.log('job done!');
        return Promise.resolve({ id });
      }
      console.log('fail', id, status);
      return Promise.reject();
    });
}

function comb(id) {
  return rnd(id).then(sub);
}

function race([s, t]) {
  return Promise.race(ids.slice(s, t).map(comb))
    .then(({ id }) => console.log('got', id))
    .catch(() => {});
}

const i = process.argv[2];

if (i === 'a') {
  race([0, ids.length]);
} else {
  i && strategy[i] && race(strategy[i]);
}
