import { UriQueryBuilder, IUriQueryModel } from './index';
import { is } from './instanceOf';
import { UriBuilder } from './uriBuilder';

function hr() {
  console.log('====================');
}
function deepEq(a, b) {
  if (is(a, Object) || typeof a === 'object') {
    let result = true;
    for (const key in a) {
      if (key[0] === '_' || is(a[key], Function)) continue;
      result = result && deepEq(a[key], b[key]);
      if (!result) return result;
    }
    return result;
  } else if (is(a, Array)) {
    let result = true;
    for (let i = 0; i < a.length; i++) {
      result = result && deepEq(a[i], b[i]);
      if (!result) return result;
    }
    return result;
  } else {
    return a === b;
  }
}

hr();

console.info('URI Query Parse Test');
var queryDataSet = [
  ['search=helloworld&class=commom', { search: 'helloworld', class: 'commom' }],
  [
    'search=helloworld&class=commom&class=typescript',
    { search: 'helloworld', class: ['commom', 'typescript'] }
  ],
  [
    'search=helloworld&class=commom&class=typescript&class=111',
    { search: 'helloworld', class: ['commom', 'typescript', 111] }
  ]
];
for (let data of queryDataSet) {
  console.log(data[0]);
  const queryModel = UriQueryBuilder.parse(<string>data[0]);
  console.assert(deepEq(queryModel.model, data[1]));
  console.assert(deepEq(queryModel.toString(), data[0]));
}

hr();

console.info('URI Query Update Test');
var queryUpdateDataSet = [
  [
    'https://www.youtube.com/watch?v=TlzfSfc_ymI',
    { v: 'test' },
    'https://www.youtube.com/watch?v=test'
  ],
  [
    'https://www.youtube.com/watch?v=TlzfymI',
    { v: 'test', a: [1, 2, 3, 4] },
    'https://www.youtube.com/watch?v=test&a=1&a=2&a=3&a=4'
  ]
];
for (let data of queryUpdateDataSet) {
  console.log(data[0]);
  const queryUpdated = UriBuilder.updateQuery(
    data[0] as string,
    data[1] as IUriQueryModel
  );
  console.assert(deepEq(queryUpdated, data[2]));
}

hr();

console.info('URI Set Path Test');
var setPathDataSet = [
  [
    'https://www.youtube.com/watch?v=TlzfSfc_ymI',
    'test/a/b/c/',
    'https://www.youtube.com/test/a/b/c/?v=TlzfSfc_ymI'
  ],
  [
    'https://www.youtube.com/watch?v=TlzfymI',
    '/test',
    'https://www.youtube.com/test?v=TlzfymI'
  ]
];
for (let data of setPathDataSet) {
  console.log(data[0]);
  const builder = UriBuilder.parse(data[0]);
  builder.setPath(data[1]);
  console.assert(deepEq(builder.toString(), data[2]));
}

hr();

console.info('URI Parse Test');
var uriDataSet = [
  [
    'https://www.youtube.com/watch',
    {
      schema: 'https',
      host: 'www.youtube.com',
      port: 80,
      pathSegments: ['watch']
    }
  ],
  [
    './a/b/c/watch',
    {
      schema: UriBuilder.relative,
      host: '.',
      port: undefined,
      pathSegments: ['a', 'b', 'c', 'watch']
    }
  ],
  [
    'https://www.youtube.com/watch?v=TlzfSfc_ymI&%E4%B8%AD%E6%96%87=%E4%B8%AD%E6%96%87',
    {
      schema: 'https',
      host: 'www.youtube.com',
      port: 80,
      pathSegments: ['watch'],
      query: { v: 'TlzfSfc_ymI', 中文: '中文' }
    }
  ],
  [
    'https://example.com:8080/a/b/c/d?key=2',
    {
      schema: 'https',
      host: 'example.com',
      port: 8080,
      pathSegments: ['a', 'b', 'c', 'd'],
      query: { key: 2 }
    }
  ],
  [
    'https://example.com:8080/a/b/c/d?key=2#hash',
    {
      schema: 'https',
      host: 'example.com',
      port: 8080,
      pathSegments: ['a', 'b', 'c', 'd'],
      query: { key: 2 },
      fragment: 'hash'
    }
  ],
  [
    'https://example.com/a/#b/c/d?key=2',
    {
      schema: 'https',
      host: 'example.com',
      port: 80,
      pathSegments: ['a', ''],
      fragment: 'b/c/d?key=2'
    }
  ],
  [
    'https://test@example.com/a/#b/c/d?key=2',
    {
      schema: 'https',
      authority: { user: 'test' },
      host: 'example.com',
      port: 80,
      pathSegments: ['a', ''],
      fragment: 'b/c/d?key=2'
    }
  ],
  [
    'https://test:1234@example.com/',
    {
      schema: 'https',
      authority: { user: 'test', password: '1234' },
      host: 'example.com',
      port: 80,
      pathSegments: ['']
    }
  ]
];
for (let data of uriDataSet) {
  const uriModel = UriBuilder.parse(<string>data[0]);
  console.log(uriModel);
  console.assert(deepEq(uriModel, data[1]));
  console.assert(deepEq(uriModel.toString(), data[0]));
}

hr();

console.info('Empty URI Builder Test');
const emptyBuilder = new UriBuilder();
emptyBuilder.schema = 'http';
emptyBuilder.host = 'example';
emptyBuilder.setPath('/home/index');
emptyBuilder.fragment = 'top';
emptyBuilder.setAuthority('guest');
emptyBuilder.query.action = 'back';

console.assert(
  emptyBuilder.toString() === 'http://guest@example/home/index?action=back#top'
);
emptyBuilder.toString();

hr();
console.info('Delete Query Param Test');

delete emptyBuilder.query.action;
console.assert(
  emptyBuilder.toString() === 'http://guest@example/home/index#top'
);
console.log(emptyBuilder.toString());

hr();
console.info('Relative Test');
const relativeBuilder = UriBuilder.parse('./home/exam?id=0');
relativeBuilder.query.id = 1;
console.assert(relativeBuilder.toString() === './home/exam?id=1');
console.log(relativeBuilder.toString());
