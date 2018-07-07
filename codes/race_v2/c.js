// constants

// prettier-ignore
const header = {
  'Cookie': 'aliyungf_tc=AQAAAFHwYngU3gAAYRRo32d8r1fKzsfX; last_env=g2; env_orgcode=whkqadmin; public_no_token=5acf790f5eec10eeb2a8f4a5bd02e7a3af80916233171760300081683be6fbb2a%3A2%3A%7Bi%3A0%3Bs%3A15%3A%22public_no_token%22%3Bi%3A1%3Bs%3A16%3A%22zcazwl1523155436%22%3B%7D; yunke_org_id=52f473580efe652ab26685a06765095625e78236ff4df27df938130eda00cf2aa%3A2%3A%7Bi%3A0%3Bs%3A12%3A%22yunke_org_id%22%3Bi%3A1%3Bs%3A36%3A%2239e5b541-d2f5-95e5-b70f-b794127e9b39%22%3B%7D; ztc_org_id=8d4c438df6b5af9f5a095aa5e72b13a129d98659f78644d3efbeb1578dcaef2ea%3A2%3A%7Bi%3A0%3Bs%3A10%3A%22ztc_org_id%22%3Bi%3A1%3Bi%3A818%3B%7D; PHPSESSID=8jrrtnq9v82b1cipnlg3pv6qh5',

  'User-Agent': 'Mozilla/5.0 (Linux; Android 8.1.0; Pixel Build/OPM1.171019.021; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/65.0.3325.109 Mobile Safari/537.36 MicroMessenger/6.6.2.1240(0x26060240) NetType/WIFI Language/en',
};

const host = 'https://ztcwx.myscrm.cn/index.php';
const token = 'zcazwl1523155436';
const activityId = '2611';

const tTag = `token=${token}`;
const aTag = `activityId=${activityId}`;
const rTag = (rd) => `randomCode=${rd}`;
const cTag = (id) => `chooseRoomId=${id}`;

const urls = {
  fav: () => `${host}?r=choose-room-activity/get-my-favorites&${tTag}&${aTag}`,
  info: (id) => `${host}?r=choose-room/room&${tTag}&${cTag(id)}`,
  rnd: (id) => `${host}?r=choose-room/get-random-code&${tTag}&${cTag(id)}`,
  sub: () => `${host}?r=choose-room/submit-order`,
  data: (id, rd) => `${tTag}&${cTag(id)}&${rTag(rd)}&question_option_id=0`,
  dump: '1261074',
};

module.exports = { header, urls };
