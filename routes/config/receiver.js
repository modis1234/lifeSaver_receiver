var queryconfig = require('../query/receive_query');

var pool = require('./connection');
var request = require('request');
var mysql = require("mysql");

var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

var receiver = {
    gasList: {},
    errorObj: {},
    receiveGas: {},
    findBygas() {
        var _this = this;
        var _query = queryconfig.findBygas();
        //풀에서 컨넥션 획득
        pool.getConnection((err, connection) => {
            if (err) {
                console.log(err)
                throw err;
            } else {
                //커넥션 사용
                connection.query(_query, (err, results) => {
                    if (err) {
                        throw err;
                    } else {
                        for (i in results) {
                            var sensorIdx = results[i]['sensor_index'];
                            var code = results[i]['code'];
                            var hasIdx = _this.gasList.hasOwnProperty(sensorIdx);
                            if (!hasIdx) {
                                _this.gasList[sensorIdx] = {};
                                _this.gasList[sensorIdx][code] = {
                                    id: results[i]["id"],
                                    sensor_index: results[i]['sensor_index'],
                                    unit: results[i]['unit'],
                                    range_min: results[i]['range_min'],
                                    range_max: results[i]['range_max'],
                                    normal_low: results[i]['normal_low'],
                                    normal_high: results[i]['normal_high'],
                                    warning1_low: results[i]['warning1_low'],
                                    warning1_high: results[i]['warning1_high'],
                                    warning2_low: results[i]['warning2_low'],
                                    warning2_high: results[i]['warning2_high'],
                                    danger1_low: results[i]['danger1_low'],
                                    danger1_high: results[i]['danger1_high'],
                                    danger2_low: results[i]['danger2_low'],
                                    danger2_high: results[i]['danger2_high'],
                                    normal_range: `${results[i]['normal_low']}-${results[i]['normal_high']}${results[i]['unit']}`
                                };
                               
                            } else {
                                _this.gasList[sensorIdx][code] = {
                                    id: results[i]["id"],
                                    sensor_index: results[i]['sensor_index'],
                                    unit: results[i]['unit'],
                                    range_min: results[i]['range_min'],
                                    range_max: results[i]['range_max'],
                                    normal_low: results[i]['normal_low'],
                                    normal_high: results[i]['normal_high'],
                                    warning1_low: results[i]['warning1_low'],
                                    warning1_high: results[i]['warning1_high'],
                                    warning2_low: results[i]['warning2_low'],
                                    warning2_high: results[i]['warning2_high'],
                                    danger1_low: results[i]['danger1_low'],
                                    danger1_high: results[i]['danger1_high'],
                                    danger2_low: results[i]['danger2_low'],
                                    danger2_high: results[i]['danger2_high'],
                                    normal_range: `${results[i]['normal_low']}-${results[i]['normal_high']}${results[i]['unit']}`

                                };
                            }
                        }
                    }
                });
                //커넥션 반환( 커넥션 종료 메소드가 커넥션과 다르다 )
                connection.release();
            }
        });
    },
    receive(data) {
        var _this = this;
        var sensorIndex = data['sensor_index'];
        var gasList = _this.gasList[sensorIndex];
        var gasObj = data['value'];
        for (gasType in gasObj) {
            var gasInfo = gasList[gasType];
            var normalLow = gasInfo['normal_low'] || null;
            var normalHigh = gasInfo['normal_high'] || null;
            var warning1_Low = gasInfo['warning1_low'] || null;
            var warning1_High = gasInfo['warning1_high'] || null;
            var warning2_Low = gasInfo['warning2_low'] || null;
            var warning2_High = gasInfo['warning2_high'] || null;
            var danger1_Low = gasInfo['danger1_low'] || null;
            var danger1_High = gasInfo['danger1_high'] || null;
            var danger2_Low = gasInfo['danger2_low'] || null;
            var danger2_High = gasInfo['danger2_high'] || null;
            var value = gasObj[gasType];

            var _gasErrorObj = {};
            if (gasType === 'O2') {
                let o2_stateCode;
                // value=15;
                if (value >= normalLow && value <= normalHigh) {
                    o2_stateCode = 0;
                } 
                else if (((value > danger1_Low && value <= danger1_High) || (value >= danger2_Low && value <= danger2_High)) && value!==0) {
                    o2_stateCode = 2;
                }
                data['value']['o2_state_code'] = o2_stateCode;
                //alarmInsert
               // console.log(gasType, '=', value, '-->>', o2_stateCode)

                if (o2_stateCode === 2) {
                    _gasErrorObj['gasType'] = gasType;
                    _gasErrorObj['record_time'] = data['record_time'];
                    _gasErrorObj['sensor_index'] = data['sensor_index'];
                    _gasErrorObj['device_index'] = data['device_index'];
                    _gasErrorObj['state_code'] = o2_stateCode;
                    _gasErrorObj['value'] = value;
                    _this.alarmInsert(_gasErrorObj);
                }
                else if (o2_stateCode === 0) {
                    let hasSensorProperty = _this.errorObj.hasOwnProperty(sensorIndex);
                    if(hasSensorProperty){
                        let hasProperty = _this.errorObj[sensorIndex].hasOwnProperty(gasType);
                        if (hasProperty) {
                            // console.log(_this.errorObj[gasType]);
                            _this.errorObj[sensorIndex][gasType]['restore_time'] = data['record_time'];
                            _this.alarmUpdate(_this.errorObj[sensorIndex][gasType]);
                        }
                    }
                }
            }
            else if (gasType === 'H2S') {
                let h2s_stateCode;
                if (value >= normalLow && value <= normalHigh) {
                    h2s_stateCode = 0;
                }
                else if (value >= warning1_Low && value <= warning1_High) {
                    h2s_stateCode = 1;
                }
                else if (value >= danger1_Low && value <= danger1_High) {
                    h2s_stateCode = 2;
                }

                data['value']['h2s_state_code'] = h2s_stateCode;
                //alarmInsert

                if (h2s_stateCode === 2) {
                    _gasErrorObj['gasType'] = gasType;
                    _gasErrorObj['record_time'] = data['record_time'];
                    _gasErrorObj['sensor_index'] = data['sensor_index'];
                    _gasErrorObj['device_index'] = data['device_index'];
                    _gasErrorObj['state_code'] = h2s_stateCode;
                    _gasErrorObj['value'] = value;
                    _this.alarmInsert(_gasErrorObj);
                }
                else if (h2s_stateCode === 0) {
                    let hasSensorProperty = _this.errorObj.hasOwnProperty(sensorIndex);
                    if(hasSensorProperty){
                        let hasProperty = _this.errorObj[sensorIndex].hasOwnProperty(gasType);
                        if (hasProperty) {
                            // console.log(_this.errorObj[gasType]);
                            _this.errorObj[sensorIndex][gasType]['restore_time'] = data['record_time'];
                            _this.alarmUpdate(_this.errorObj[sensorIndex][gasType]);
                        }
                    }
                }
            }
            else if (gasType === 'CO') {
                let co_stateCode;

                if (value >= normalLow && value <= normalHigh) {
                    co_stateCode = 0;
                }
                else if (value >= warning1_Low && value <= warning1_High) {
                    co_stateCode = 1;
                }
                else if (value >= danger1_Low && value <= danger1_High) {
                    co_stateCode = 2;
                }

                data['value']['co_state_code'] = co_stateCode;

                //alarmInsert

                if (co_stateCode === 2) {
                    _gasErrorObj['gasType'] = gasType;
                    _gasErrorObj['record_time'] = data['record_time'];
                    _gasErrorObj['sensor_index'] = data['sensor_index'];
                    _gasErrorObj['device_index'] = data['device_index'];
                    _gasErrorObj['state_code'] = co_stateCode;
                    _gasErrorObj['value'] = value;
                    _this.alarmInsert(_gasErrorObj);
                }
                else if (co_stateCode === 0) {
                    let hasSensorProperty = _this.errorObj.hasOwnProperty(sensorIndex);
                    if(hasSensorProperty){
                        let hasProperty = _this.errorObj[sensorIndex].hasOwnProperty(gasType);
                        if (hasProperty) {
                            // console.log(_this.errorObj[gasType]);
                            _this.errorObj[sensorIndex][gasType]['restore_time'] = data['record_time'];
                            _this.alarmUpdate(_this.errorObj[sensorIndex][gasType]);
                        }
                    }
                }
            }
            else if (gasType === 'VOC') {
                let voc_stateCode;
                if (value >= normalLow && value <= normalHigh) {
                    voc_stateCode = 0;
                }
                else if (value >= warning1_Low && value <= warning1_High) {
                    voc_stateCode = 1;
                }
                else if (value >= danger1_Low && value <= danger1_High) {
                    voc_stateCode = 2;
                }

                data['value']['voc_state_code'] = voc_stateCode;

                //alarmInsert

                if (voc_stateCode === 2) {
                    _gasErrorObj['gasType'] = gasType;
                    _gasErrorObj['record_time'] = data['record_time'];
                    _gasErrorObj['sensor_index'] = data['sensor_index'];
                    _gasErrorObj['device_index'] = data['device_index'];
                    _gasErrorObj['state_code'] = voc_stateCode;
                    _gasErrorObj['value'] = value;
                    _this.alarmInsert(_gasErrorObj);
                }
                else if (voc_stateCode === 0) {
                    let hasSensorProperty = _this.errorObj.hasOwnProperty(sensorIndex);
                    if(hasSensorProperty){
                        let hasProperty = _this.errorObj[sensorIndex].hasOwnProperty(gasType);
                        if (hasProperty) {
                            // console.log(_this.errorObj[gasType]);
                            _this.errorObj[sensorIndex][gasType]['restore_time'] = data['record_time'];
                            _this.alarmUpdate(_this.errorObj[sensorIndex][gasType]);
                        }
                    }
                }
            }
            else if (gasType === 'COMB') {
                let comb_stateCode;
                if (value >= normalLow && value <= normalHigh) {
                    comb_stateCode = 0;
                }
                else if (value >= warning1_Low && value <= warning1_High) {
                    comb_stateCode = 1;
                }
                else if (value >= danger1_Low && value <= danger1_High) {
                    comb_stateCode = 2;
                }

                data['value']['comb_state_code'] = comb_stateCode;

                //alarmInsert

                if (comb_stateCode === 2) {
                    _gasErrorObj['gasType'] = gasType;
                    _gasErrorObj['record_time'] = data['record_time'];
                    _gasErrorObj['sensor_index'] = data['sensor_index'];
                    _gasErrorObj['device_index'] = data['device_index'];
                    _gasErrorObj['state_code'] = comb_stateCode;
                    _gasErrorObj['value'] = value;
                    _this.alarmInsert(_gasErrorObj);
                }
                else if (comb_stateCode === 0) {
                    let hasSensorProperty = _this.errorObj.hasOwnProperty(sensorIndex);
                    if(hasSensorProperty){
                        let hasProperty = _this.errorObj[sensorIndex].hasOwnProperty(gasType);
                        if (hasProperty) {
                            // console.log(_this.errorObj[gasType]);
                            _this.errorObj[sensorIndex][gasType]['restore_time'] = data['record_time'];
                            _this.alarmUpdate(_this.errorObj[sensorIndex][gasType]);
                        }
                    }
                }
            }
            // console.log(data);
        }

        //로그 입력 및 상태 업데이트
        _this.logInsert(data);
   
        let hasProperty = _this.receiveGas.hasOwnProperty(sensorIndex);
        if (!hasProperty) {
            console.log('has--->FASLE')
            data['timeoutId'] = setTimeout(() => {
                console.log("POWER OFF!!!");
                _this.receiveGas[sensorIndex]['end_time'] = data['record_time'];
                let _startTime =  _this.receiveGas[sensorIndex]['start_time'] || null
                if(_startTime){
                    _this.sensorOff(_this.receiveGas[sensorIndex]);
                } else {
                    _this.sensorOffupdate(sensorIndex);
                }
                delete _this.receiveGas[sensorIndex]
            }, 30000);
            data['isUsedTime'] = false;
            data['warmingup_time'] = data['record_time']
            _this.receiveGas[sensorIndex] = data;
            var o2Data = data['value']['O2'];
            if (o2Data > 0 || o2Data !== 0) {
                console.log('>>>>>>>>>sensorON!!!!!!!!!!!!')
                _this.sensorOn(data);
                _this.receiveGas[sensorIndex]['isUsedTime'] = true
            } 
            console.log('0.receiveGas->',_this.receiveGas)
        } else {
            clearTimeout(_this.receiveGas[sensorIndex]['timeoutId']);
            _this.receiveGas[sensorIndex]['timeoutId'] = setTimeout(() => {
                console.log("POWER OFF!!!");
                _this.receiveGas[sensorIndex]['end_time'] = data['record_time'];
                let _startTime =  _this.receiveGas[sensorIndex]['start_time'] || null
                if(_startTime){
                    _this.sensorOff(_this.receiveGas[sensorIndex]);
                } else {
                    _this.sensorOffupdate(sensorIndex);
                }
                delete _this.receiveGas[sensorIndex]
            }, 30000);

            _this.receiveGas[sensorIndex]['value'] = data['value'];
            _this.receiveGas[sensorIndex]['record_time'] = data['record_time'];

            var o2Data = data['value']['O2'];
            var _isUsedTime =  _this.receiveGas[sensorIndex]['isUsedTime'];
            var _warmingUp =_this.receiveGas[sensorIndex]['warmingup_time'];
            if ((o2Data > 0 || o2Data !== 0) && _isUsedTime===false && _warmingUp != undefined) {
                console.log('>>>>>>>>>sensorON!!!!!!!!!!!!')
                //data['start_time'] = data['record_time'];
                _this.sensorOn(_this.receiveGas[sensorIndex]);
                _this.receiveGas[sensorIndex]['isUsedTime'] = true

            } 
            // if(_isUsedTime){
            //     _this.receiveGas[sensorIndex]['warmingup_time'] = undefined; 
            // }
            // console.log('1.receiveGas->',_this.receiveGas)

        }
        //console.log(_this.receiveGas);

    },
    logInsert(data) {
        //수신 로그 입력
        var _this = this;
        let _query = queryconfig.logInsert(data)
            + queryconfig.recordUpdate(data);

        //풀에서 컨넥션 획득
        pool.getConnection((err, connection) => {
            if (err) {
                console.log(err)
                throw err;
            } else {
                //커넥션 사용
                connection.query(_query, (err, results) => {
                    if (err) {
                        throw err;
                    } else {
                    }
                });
                //커넥션 반환( 커넥션 종료 메소드가 커넥션과 다르다 )
                connection.release();
            }
        });
    },
    sensorOn(data) {
        /*
             @action insert
             @paramType json
             @comment 장비 사용 시작
         */
        var _this = this;
        let date = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        data['start_time'] = date
        let sensorIndex = data['sensor_index']
        _this.receiveGas[sensorIndex]['start_time'] = date;
        console.log('sensorOn__>>',data)
        let _query = queryconfig.usedHisInsert(data);
        console.log(_query);
        //풀에서 컨넥션 획득
        pool.getConnection((err, connection) => {
            if (err) {
                console.log(err)
                throw err;
            } else {
                //커넥션 사용
                connection.query(_query, (err, results) => {
                    if (err) {
                        throw err;
                    } else {
                        _this.receiveGas[sensorIndex]['warmingup_time'] = undefined; 
                    }
                });
                //커넥션 반환( 커넥션 종료 메소드가 커넥션과 다르다 )
                connection.release();
            }
        });
    },
    sensorOff(data) {
        var _this = this;
        console.log('sensorOff->',data)
        var sensorIdx = data['sensor_index']
        var _errObj = _this.errorObj;
        console.log('errObj->',_errObj)
        let hasSensorProperty = _errObj.hasOwnProperty(sensorIdx);
        if(hasSensorProperty){
            var gasErrorObj = _errObj[sensorIdx];
            var errorKeys = Object.keys(gasErrorObj)
            var errorObjLength = errorKeys.length;
            if (errorObjLength > 0) {
                for (let keys in gasErrorObj) {
                    gasErrorObj[keys]['restore_time'] = data['record_time'];
    
                    _this.alarmUpdate(gasErrorObj[keys]);
                }
            }            
        }

        let _query = queryconfig.usedHisUpdate(data);
        pool.getConnection((err, connection) => {
            if (err) {
                console.log(err)
                throw err;
            } else {
                //커넥션 사용
                connection.query(_query, (err, results) => {
                    if (err) {
                        throw err;
                    } else {
                    }
                });
                //커넥션 반환( 커넥션 종료 메소드가 커넥션과 다르다 )
                connection.release();
            }
        });
    },
    sensorOffupdate(data) {
        // info_sensor 테이블의 상태 action이 로딩중(2)일 경우, OFF상태(1)로 업데이트 해준다. 
        // @parameter data = sensor_index
        var _this = this;

        let _query = queryconfig.sensorOffupdate(data);
        console.log(_query)
        pool.getConnection((err, connection) => {
            if (err) {
                console.log(err)
                throw err;
            } else {
                //커넥션 사용
                connection.query(_query, (err, results) => {
                    if (err) {
                        throw err;
                    } else {
                    }
                });
                //커넥션 반환( 커넥션 종료 메소드가 커넥션과 다르다 )
                connection.release();
            }
        });
    },
    alarmInsert(data) {
        var _this = this;
        console.log('data--->>>>>>>>>>>',data);
        let _sensorIndex = data['sensor_index'];
        let _gasType = data['gasType'];
        let hasProperty = _this.errorObj.hasOwnProperty(_sensorIndex);
        if(!hasProperty){
            _this.errorObj[_sensorIndex] = {}
            _this.errorObj[_sensorIndex][_gasType]={
                gas_type: _gasType,
                record_time: data['record_time'],
                sensor_index: data['sensor_index'],
                device_index: data['device_index'],
                gas_type: _gasType,
                state_code: data['state_code'],
                init_value: data['value'],
                max_value: data['value'],
                max_record_time: data['record_time'],
                restore_time: undefined
            }
            let _query = queryconfig.alarmHisInsert(_this.errorObj[_sensorIndex][_gasType]);              
             _this.receiverList(_this.errorObj[_sensorIndex][_gasType]);
           // _this.receiverList(_this.errorObj[_sensorIndex][_gasType]);

            console.log("alarmInsert=>", _query);
            pool.getConnection((err, connection) => {
                if (err) {
                    console.log(err)
                    throw err;
                } else {
                    //커넥션 사용
                    connection.query(_query, (err, results) => {
                        if (err) {
                            throw err;
                        } else {
                        }
                    });
                    //커넥션 반환( 커넥션 종료 메소드가 커넥션과 다르다 )
                    connection.release();
                }
            });
           
        } else {
            let hasGasProperty = _this.errorObj[_sensorIndex].hasOwnProperty(_gasType);
            if (!hasGasProperty) {
                _this.errorObj[_sensorIndex][_gasType] = {
                    gas_type: _gasType,
                    record_time: data['record_time'],
                    sensor_index: data['sensor_index'],
                    device_index: data['device_index'],
                    gas_type: _gasType,
                    state_code: data['state_code'],
                    init_value: data['value'],
                    max_value: data['value'],
                    max_record_time: data['record_time'],
                    restore_time: undefined
                };
               _this.receiverList(_this.errorObj[_sensorIndex][_gasType]);
                let _query = queryconfig.alarmHisInsert(_this.errorObj[_sensorIndex][_gasType]);
                console.log("alarmInsert=>", _query);
                pool.getConnection((err, connection) => {
                    if (err) {
                        console.log(err)
                        throw err;
                    } else {
                        //커넥션 사용
                        connection.query(_query, (err, results) => {
                            if (err) {
                                throw err;
                            } else {
                            }
                        });
                        //커넥션 반환( 커넥션 종료 메소드가 커넥션과 다르다 )
                        connection.release();
                    }
                });
            }
            else {
                let maxValue = _this.errorObj[_sensorIndex][_gasType]['max_value'];
                let value = data['value'];
                if (value > maxValue) {
                    _this.errorObj[_sensorIndex][_gasType]['max_value'] = value;
                    _this.errorObj[_sensorIndex][_gasType]['max_record_time'] = data['record_time'];
                }
            }

        }
        
    },
    alarmUpdate(data) {
        var _this = this;
        let _sensorIndex = data['sensor_index'];
        let _gasType = data['gas_type'];
        console.log('alarmUpdate->', data);
        let _query = queryconfig.alarmHisUpdate(data);
        pool.getConnection((err, connection) => {
            if (err) {
                console.log(err)
                throw err;
            } else {
                //커넥션 사용
                connection.query(_query, (err, results) => {
                    if (err) {
                        throw err;
                    } else {
                        delete _this.errorObj[_sensorIndex][_gasType];
                    }
                });
                //커넥션 반환( 커넥션 종료 메소드가 커넥션과 다르다 )
                connection.release();
            }
        });
    },
    backupOfDay() {
        var _query = queryconfig.fileBackup() + queryconfig.gasLogDelete();
        console.log(_query);
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err)
                throw err;
            } else {
                //커넥션 사용
                connection.query(_query, function (err, results) {
                    if (err) {
                        throw err;
                    }
                });
                //커넥션 반환( 커넥션 종료 메소드가 커넥션과 다르다 )
                connection.release();
            }
        });
    },
    receiverList(data) {
        var _this = this;
        var sensorIndex = data['sensor_index'];
        var gasType = data['gas_type'].toUpperCase();
        var recordTime = data['record_time'];
        var stateCode = data['state_code'];
        var initValue = data['init_value'];

        var _gasObj = _this.gasList[sensorIndex][gasType];
        console.log('0.ygasType-=---->>>>>>',gasType)

        console.log('_gasObj-=---->>>>>>',_gasObj)
        var _query = queryconfig.receiverList(sensorIndex);
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err)
                throw err;
            } else {
                //커넥션 사용
                connection.query(_query, function (err, results) {
                    if (err) {
                        throw err;
                    } else {
                        console.log(results);
                        for( i in results){
                            var sendObj = {};
                            sendObj['name'] = results[i]['name'];
                            sendObj['tel'] = results[i]['tel'];
                            sendObj['record_time'] = recordTime.split('.')[0];
                            sendObj['gas_type'] = gasType;
                            sendObj['state_code'] = stateCode;
                            sendObj['init_value'] = initValue;
                            sendObj['normal_range'] =_gasObj['normal_range'];
                            sendObj['unit'] =_gasObj['unit'];
                            sendObj['sensor_name'] = results[i]['sensor_name'];
                            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>sendObj',sendObj);
                            _this.smsSend(sendObj);
                        }
                    }
                });
                //커넥션 반환( 커넥션 종료 메소드가 커넥션과 다르다 )
                connection.release();
            }
        });
    },
    smsSend(obj) {
        var _postURL = 'http://119.207.78.144:8099/alarm/lssaver/danger';

        request.post({
            url: _postURL,
            body: obj,
            json:true}, function(error, res, body){
            
        });
    }
}

module.exports = receiver;