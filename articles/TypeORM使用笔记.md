# TypeORM 使用笔记

目前的个人定位是前端开发，写后端代码的机会比较少，因而数据库相关的知识也有点生疏。这次写一个后台的数据统计系统，刚好借此机会复习下数据库及 ORM 的一般使用。这里使用的环境是 Node.js (v10.5.0) 环境，使用 MySQL 数据库，ORM 使用 [TypeORM](https://github.com/typeorm/typeorm) 。

## 建库建表

TypeORM 实际上是支持自动建表的，定义好 Model 后 TypeORM 实际上是可以自动为我们建表的。但考虑到更多的时候，我们建表都是从 EER 模型开始设计，这里就使用 MySQL Workbench 设计表结构。

这里我们模拟一个 `用户-订单` 的业务场景。用户 (`user`) 表和订单 (`order`) 表为一对多关系，订单 (`order`) 表和商品 (`good`) 表为多对多的关系，通过中间表 (`good_quant`) 进行关联，同时该中间表也负责记录每笔订单下每件商品购买数量的情况。大致关系如下：

![test_db_eer](./pic/test_db_eer.png)

画完关系图，直接导出 SQL 脚本执行即可。

## 建立实体

TypeORM 同时支持 Data Mapper 和 Active Record 两种模式，前者可简单的理解为数据映射，借助 `Repository` 去操作实体和数据库，后者类似领域模型由实体自身去操作数据库。两种模式的伪业务代码大致如下：

```js
const user = new User();
user.name = 'Thor';

// Data Mapper
await repository.save(user);

// Active Record
await user.save();
```

要使用 Active Record 模式，只需在建立模型时继承 TypeORM 提供的 `BaseEntity` 即可，这种模式下可以在实体内部根据需要实现部分业务功能，诸如 `findByName` 等。此处主要使用 Data Mapper 模式去操作实体和数据库。

建立实体很简单，使用 `Entity` 修饰器即可：

```js
@Entity()
export default class User {
  @PrimaryGeneratedColumn() uid: number;

  @Column({ name: 'uname' })
  name: string;

  @Column() uinfo: string;
}
```

上面使用 `Entity` 修饰模型及声明 `User` 为实体，使用 `PrimaryGeneratedColumn` 创建自增主键列，使用 `Column` 创建了数据库列。TypeORM 默认会将实体的属性映射至数据库，如果实体的属性和数据库的列名不一致，可以对 `Column` 传入 `name` 属性，针对表名不一致的情况 vice versa。

## 建立关系

1.  一对多/多对一

在我们的示例中 `User` 实体和 `Order` 实体是一对多/多对一的关系，在 `User` 内部存在 `Order` 的集合，在 `Order` 内部存在 `User` 的对象。这种关系的实现如下：

```js
@Entity()
export default class User {
  // ...

  @OneToMany(type => Order, order => order.user)
  orders: Order[];
}

@Entity()
export default class Order {
  // ...

  @ManyToOne(type => User, user => user.orders, { cascade: true })
  @JoinColumn({ name: 'uid' })
  user: User;
}
```

- 在 `User` 侧通过 `OneToMany` 指定其与 `Order` 的关系是一对多，使用 `type => User` 指定了要建立关系的实体类型，使用 `order => order.user` 指定反向关系的字段名(在一对多关系中，一侧总是反向的；在一对一关系中，如果不指定反向关系，则在另一侧无法查询到本侧对象)。
- 在 `Order` 侧通过 `ManyToOne` 指定其与 `User` 的关系是多对一，使用 `{ cascade: true }` 设置级联(即对 `Order` 进行增删改查时也会同样操作其关联的 `User` 对象，如果有)，使用 `JoinColumn` 指定其为关系拥有者(即拥有外键列)。

2.  多对多关系

多对多关系的建立有两种方式，一种是将数据库中的中间表转换为中间实体，就我们的示例来讲，就是在 `Order` 和 `Good` 实体之外新建 `GoodQuant` (订单与商品数量对应)实体。这样一来，原本 `Order` 和 `Good` 的多对多关系，实际转成了 `Order` + `Good` 和 `GoodQuant` 的两组一对多关系。这样做虽然增加了实体数量，但好处是中间实体可以自定义的扩展和存储一些额外数据，就示例来看 `quant` 数据即是如此。

```js
@Entity()
export default class Order {
  // ...

  @OneToMany(type => GoodQuant, goodQuant => goodQuant.order)
  goodQuants: GoodQuant[];
}

@Entity()
export default class Good {
  // ...

  @OneToMany(type => GoodQuant, goodQuant => goodQuant.good)
  goodQuants: GoodQuant[];
}

@Entity()
export default class GoodQuant {
  // ...

  @Column() quant: number;

  @ManyToOne(type => Order, order => order.goodQuants, { cascade: true })
  @JoinColumn({ name: 'oid' })
  order: Order;

  @ManyToOne(type => Good, good => good.goodQuants, { cascade: true })
  @JoinColumn({ name: 'gid' })
  good: Good;
}
```

如果中间表没有其他额外数据，仅储存关联关系，亦可省略该该实体，使用 `ManyToMany` 建立 `Order` 和 `Good` 的多对多关系。这样做的好处是在 `Order` 内部可以直接拿到对应的 `Good` 集合，而不需要之前的两层集合嵌套。

```js
@Entity()
export default class Order {
  // ...

  @ManyToMany(type => Good, good => good.orders, { cascade: true })
  @JoinTable({
    name: 'good_quant',
    joinColumn: { name: 'oid' },
    inverseJoinColumn: { name: 'gid' },
  })
  goods: Good[];
}

@Entity()
export default class Good {
  // ...

  @ManyToMany(type => Order, order => order.goods)
  @JoinTable({
    name: 'good_quant',
    joinColumn: { name: 'gid' },
    inverseJoinColumn: { name: 'oid' },
  })
  orders: Order[];
}
```

上面使用 `ManyToMany` 指定 `Order` 和 `Good` 是一组多对多的关系(注意多对多关系中 `cascade` 只能写在一边)，同时使用 `JoinTable` 创建中间表(使用三处 `name` 指定表名和列名)。

## 操作数据库

1.  连接数据库

使用 `createConnection()` 创建数据库连接，其返回 `Promise<Connection>` 供链式调用，当然也可以使用 `async/await` 语法以同步的写法进行异步查询。建立数据库所需要的参数，可以以参数的形式传入 `createConnection` 也可以以配置文件的形式放在项目根目录下(`ormconfig.json`)，字段语义比较明显，注意 `entities` 属性为实体的集合，可以是实体对象也可以是目录地址。

```json
{
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "username": "www-data",
  "password": "www-data",
  "database": "test",
  "logging": false,
  "entities": ["src/orm/models/**/*.ts"]
}
```

`createConnection` 后 TypeORM 会创建一个连接池负责管理数据库连接，只要连接没有关闭均可使用 `getConnection` 拿到数据库连接。因此以下的 CRUD 练习代码均可类似这样的嵌套执行。

```js
(async function run() {
  await createConnection();
  const conn = await getConnection();

  try {
    await t0(conn);
    await t1(conn);
    await t2(conn);
  } finally {
    conn.close();
  }
})();
```

2.  模拟业务的 CRUD

- 新建用户

```js
const u = new User();
u.name = 'Tony';
u.uinfo = 'Iron Man';

await conn.getRepository(User).save(u);
```

- 修改用户信息后下两单

```js
const u = await conn.getRepository(User).findOne({ name: 'Tony' });
u.uinfo = 'World No.1...';

const o1 = new Order();
o1.user = u;

const o2 = new Order();
o2.user = u;

await conn.getRepository(Order).save([o1, o2]);
```

上面的示例中，针对简单的查询，`Repository` 提供了 `find` | `findOne` 等方法，可以直接进行查询(而不必编写 SQL)并将查询结果自动映射为所对应的实体类型。针对稍微复杂的查询条件，亦有 `Between` | `Like` 等方法进行扩展，例如 `find({ name: In('Tony', 'tony') })`。由于 `cascade` 的关系，不用单独保存 `u`，修改后的 `u` 将会在 `o1` 和 `o2` `INSERT` 时自动 `UPDATE`。

- 为订单关联产品

```js
// 首选新建产品(因为数据库是空的)
const g1 = new Good();
const g2 = new Good();
g1.gname = 'Cock';
g1.price = 1.23;
g2.gname = 'Soda';
g2.price = 3.45;

// 买 5 份 g1 和 15 份 g2
const gq1 = new GoodQuant();
const gq2 = new GoodQuant();
gq1.good = g1;
gq1.quant = 5;
gq2.good = g2;
gq2.quant = 15;

// 下单(关联订单)
const o = await conn.getRepository(Order).findOne();
gq1.order = o;
gq2.order = o;

// 确认入库
await conn.getRepository(GoodQuant).save([gq1, gq2]);
```

- 复杂查询

  1.  使用 `find` | `findOne` 关联查询

  直接使用 `find` | `findOne` 是不会带出关联的对象的，需要带出关联对象的话需要添加 `relations` 属性：

  ```js
  conn.getRepository(User).find({
    relations: ['orders', 'orders.goodQuants', 'orders.goodQuants.good'],
    where: { name: 'Tony' },
    skip: 10,
    take: 5,
  });
  ```

  2.  使用 `QueryBuilder`

  使用上面的方式会带出关联对象的所有属性，有时候很多是并不需要的，或者有时有更复杂的查询条件(比如聚合)，这时候还是需要手动去实现一些 SQL 的逻辑的。上面的查询条件使用 `QueryBuilder` 大概是下面这个样子的：

  ```js
  conn
    .getRepository(User)
    .createQueryBuilder('u')
    .where('u.name = Tony')
    .leftJoinAndSelect('u.orders', 'o')
    .leftJoinAndSelect('o.goods', 'g')
    .leftJoinAndSelect('o.goodQuants', 'gq')
    .leftJoinAndSelect('gq.good', 'gg')
    .skip(10)
    .take(5)
    .getMany();
  ```

  `leftJoinAndSelect` 的第一参数是要连接的对象或属性，第二参数是 alias，以便在下文使用来构建更复杂的查询语句。`QueryBuilder` 的 `getMany` | `getOne` 方法与上面的 `find` | `findOne` 类似，会进行实体的映射，如果只要查询结果的原始数据，可以使用 `getRawMany` | `getRawOne`。如果只想查询部分字段可以使用 `leftJoin` 配合 `addSelect` 的组合(任意位置使用 `select` 会覆盖掉之前所有的 `select` 或 `addSelect` 指定的字段)。

  `QueryBuilder` 可以轻松构建使用聚合函数的查询语句，例如下面按天统计不同客户的订单数量：

  ```js
  conn
    .getRepository(User)
    .createQueryBuilder('u')
    .select('u.name')
    .leftJoin('u.orders', 'o')
    .addSelect(`DATE_FORMAT(o.time, '%Y%m%d')`, 'd')
    .addSelect('COUNT(o.oid)', 'o_c')
    .groupBy('u.uname')
    .addGroupBy('d')
    .getRawMany();
  ```

  由于关联关系在实体内均已指定，因此在使用 `QueryBuilder` 时也很简单且语义化良好。
