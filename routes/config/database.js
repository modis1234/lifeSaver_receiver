var _mysql = {
  develop: {
    host: '192.168.0.39',
    port: '3306',
    user: 'root',
    password: 'work1801!',
    database: 'life_saver_gas',
    multipleStatements: true //다중 퀄리 사용가능
  },
  operation: {
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: 'work1801',
    database: 'life_saver_gas',
    multipleStatements: true //다중 퀄리 사용가능
  },
  operation_1: {
    host: '119.207.78.144',
    port: '13336',
    user: 'open_m',
    password: '*man(2019)',
    database: 'life_saver_gas',
    multipleStatements: true //다중 퀄리 사용가능
  },
  prototype: {
    connectionLimit: 1000,
    acquireTimeout: 30000, //30 secs
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '1234',
    database: 'life_saver',
    multipleStatements: true //다중 퀄리 사용가능
  }

}

module.exports = _mysql