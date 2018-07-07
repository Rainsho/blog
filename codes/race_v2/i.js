// gather info

const request = require('superagent');
const { header, urls } = require('./c');

function fav() {
  return request
    .get(urls.fav())
    .set(header)
    .then((res) => {
      console.log(res.body);
    });
}

process.argv[2] === 't' && fav();

function info(id = urls.dump) {
  return request
    .get(urls.info(id))
    .set(header)
    .then((res) => {
      const { unit_price, roomFullNameNoProjName, favorited_count, room_price } = res.body.data;
      console.log(`${id}-${roomFullNameNoProjName}-${unit_price}-${room_price}-${favorited_count}`);
    });
}

process.argv[2] === 'i' && info();
