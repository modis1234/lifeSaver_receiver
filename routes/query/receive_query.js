const _query = {
    findBySensor: function(){
        var query = 'SELECT * FROM info_sensor;';
        return query;
    },
    sensorOffupdate (data) {
        let _sensorIndex = data;
        var query = `UPDATE info_sensor 
                    SET 
                        action = 0
                    WHERE sensor_index="${_sensorIndex}";`;
        return query;
    },
    findBygas: function(){
        /*
            @table sensor_log
            @action get
            @paramType json
            @comment 가스 정보 조회
        */  
        var query = 'SELECT * FROM info_gas;';

        return query;

    },
    logInsert: function(data){
        /*
            @table sensor_log
            @action insert
            @paramType json
            @comment 수신 가스 로그 입력
        */
        var _data = data;
        var recordTime = '"'+_data.record_time+'"' || null;
        var sensorIdx = '"'+_data.sensor_index+'"' || null;
        var deviceIdx = _data.device_index || null;
        var o2Value = _data.value['O2'];
        var o2StateCode = _data.value['o2_state_code'] || 0;
        var h2sValue = _data.value['H2S'];
        var h2sStateCode = _data.value['h2s_state_code'] || 0;
        var coValue = _data.value['CO'];
        var coStateCode = _data.value['co_state_code'] || 0;
        var vocValue = _data.value['VOC'];
        var vocStateCode = _data.value['voc_state_code'] || 0;
        var combValue = _data.value['COMB'];
        var combStateCode = _data.value['comb_state_code'] || 0;

        var query = 'INSERT INTO sensor_log '
                    +'(record_time, sensor_index, device_index, '
                    +'o2_value, o2_state_code, '
                    +'h2s_value, h2s_state_code, '
                    +'co_value, co_state_code, '
                    +'voc_value, voc_state_code, '
                    +'comb_value, comb_state_code) '
                    +'VALUES ('+recordTime+', '+sensorIdx+', '+deviceIdx+', '
                    +o2Value+', '+o2StateCode+', '
                    +h2sValue+', '+h2sStateCode+', '
                    +coValue+', '+coStateCode+', '
                    +vocValue+', '+vocStateCode+', '
                    +combValue+', '+combStateCode+');';
        return query;
    },
    recordUpdate: function(data){
        /*
            @table info_sensor
            @action update
            @paramType json
            @comment 수신 가스 측정값 및 상태 업데이트
        */
        var _data = data;
        var recordTime = '"'+_data.record_time+'"' || null;
        var sensorIdx = '"'+_data.sensor_index+'"' || null;
        var o2Value = _data.value['O2'];
        var action = 2;
        if(o2Value != 0){
            action = 1;
        }
        var o2StateCode = _data.value['o2_state_code'] || 0;
        var h2sValue = _data.value['H2S'];
        var h2sStateCode = _data.value['h2s_state_code'] || 0;
        var coValue = _data.value['CO'];
        var coStateCode = _data.value['co_state_code'] || 0;
        var vocValue = _data.value['VOC'];
        var vocStateCode = _data.value['voc_state_code'] || 0;
        var combValue = _data.value['COMB'];
        var combStateCode = _data.value['comb_state_code'] || 0;
        
        var query = 'UPDATE info_sensor SET '
                    +'record_time='+recordTime+', '
                    +'o2_value='+o2Value+', '
                    +'o2_state_code='+o2StateCode+', '
                    +'h2s_value='+h2sValue+', '
                    +'h2s_state_code='+h2sStateCode+', '
                    +'co_value='+coValue+', '
                    +'co_state_code='+coStateCode+', '
                    +'voc_value='+vocValue+', '
                    +'voc_state_code='+vocStateCode+', '
                    +'comb_value='+combValue+', '
                    +'comb_state_code='+combStateCode+', '
                    +'action='+action+' '
                    +'WHERE sensor_index='+sensorIdx+';';
        return query
    },
    usedHisInsert: function(data){
        /*
            @table used_his
            @action insert
            @paramType json
            @comment 장비 사용 시작
        */
       var _data = data;
       var startTime = '"'+_data.start_time+'"' || null;
       var sensorIdx = '"'+_data.sensor_index+'"' || null;
       var warmingUPTime = '"'+_data.warmingup_time+'"' || null;

       var query = 'INSERT INTO used_his '
                    +'(start_time, sensor_index, warmingup_time ) '
                    +'VALUES ('+startTime+', '+sensorIdx+', '+warmingUPTime+');';
        console.log(`usedHisInsert query-->`,query);
        return query;

    },
    usedHisUpdate: function(data){
        /*
            @table used_his
            @action update
            @paramType json
            @comment 장비 사용 종료
        */
       var _data = data;
        var startTime = '"'+_data.start_time+'"' || null;
        var endTime = '"'+_data.end_time+'"' || null;
        var sensorIdx = '"'+_data.sensor_index+'"' || null;
        var o2Value = _data.value['O2'];
        var o2StateCode = _data.value['o2_state_code'] || 0;
        var h2sValue = _data.value['H2S'];
        var h2sStateCode = _data.value['h2s_state_code'] || 0;
        var coValue = _data.value['CO'];
        var coStateCode = _data.value['co_state_code'] || 0;
        var vocValue = _data.value['VOC'];
        var vocStateCode = _data.value['voc_state_code'] || 0;
        var combValue = _data.value['COMB'];
        var combStateCode = _data.value['comb_state_code'] || 0;
        
        var query = 'UPDATE used_his SET '
                    +'end_time='+endTime+', '
                    +'o2_value='+o2Value+', '
                    +'o2_state_code='+o2StateCode+', '
                    +'h2s_value='+h2sValue+', '
                    +'h2s_state_code='+h2sStateCode+', '
                    +'co_value='+coValue+', '
                    +'co_state_code='+coStateCode+', '
                    +'voc_value='+vocValue+', '
                    +'voc_state_code='+vocStateCode+', '
                    +'comb_value='+combValue+', '
                    +'comb_state_code='+combStateCode+' '
                    +'WHERE sensor_index='+sensorIdx+' AND start_time='+startTime+';';
        console.log(`usedHisUpdate query-->`,query);

        return query
    },
    fileBackup: function(){
        var date = new Date();
        var years = date.getFullYear();
        var months = date.getMonth()+1;
        var days = date.getDate();
        months = months >=10 ? months : '0'+months;
        days = days >=10 ? days : '0'+days;

        var minutes = date.getMinutes();
        var seconds = date.getSeconds();

        var logDate = years+months+days+'_'+minutes+seconds;

        var query = `SELECT 'id', 'record_time', 'device_index', 'sensor_index', 
                            'o2_value', 'o2_state_code', 'h2s_value', 'h2s_state_code'
                            'co_value', 'co_state_code', 'voc_value', 'voc_state_code', 'comb_value', 'comb_state_code'
                    UNION ALL
                    SELECT id, record_time, device_index, sensor_index, 
                           o2_value, o2_state_code, h2s_value, h2s_state_code
                           co_value, co_state_code, voc_value, voc_state_code, comb_value, comb_state_code
                    INTO OUTFILE 'C:/gasLog/gasLog_${logDate}.csv'
                    FIELDS TERMINATED BY ','
                    ENCLOSED BY '"'
                    LINES TERMINATED BY '\n' 
                    FROM sensor_log;`;
        return query;
    },
    gasLogDelete: function(){
        var query = `DELETE FROM sensor_log;`;
        return query;
    },
    alarmHisInsert: function(data){
        var _data = data;
        console.log('--->>>',_data);
        var _record_time = `"${_data.record_time}"` || null;
        var _sensorIdx = `"${_data.sensor_index}"` || null;
        var _deviceIdx = `"${_data.device_index}"` || 0;
        var _initValue = _data.init_value || 0;
        var _stateCode = _data.state_code || 0;
        var _gasType = `"${_data.gas_type}"` || null;


        var query = `INSERT INTO alarm_his 
                    (record_time, sensor_index, init_value, device_index, state_code, gas_type) 
                    VALUES ( ${_record_time}, ${_sensorIdx}, ${_initValue}, ${_deviceIdx}, ${_stateCode}, ${_gasType});`;
        return query;

    },
    alarmHisUpdate: function(data){
        var _data = data;
        var _recordTime = `"${_data.record_time}"` || null;
        var _restoreTime = `"${_data.restore_time}"` || null;
        var _sensorIdx = `"${_data.sensor_index}"` || null;
        var _maxValue = _data.max_value ?  _data.max_value : 0;        
        var _maxRecordTime = `"${_data.max_record_time}"` || null;        
        
        var query = `UPDATE alarm_his SET 
                        restore_time=${_restoreTime}, 
                        max_value=${_maxValue}, 
                        maxRecord_time=${_maxRecordTime} 
                    WHERE sensor_index=${_sensorIdx} AND record_time=${_recordTime};`;
        
        return query

    },
    fileBackup: function(){
        var date = new Date();
        var years = date.getFullYear();
        var months = date.getMonth()+1;
        var days = date.getDate();
        months = months >=10 ? months : '0'+months;
        days = days >=10 ? days : '0'+days;

        var minutes = date.getMinutes();
        var seconds = date.getSeconds();

        var logDate = years+months+days+'_'+minutes+seconds;

        var query = `SELECT 'id', 'record_time', 'device_index', 'sensor_index', 
                            'o2_value', 'o2_state_code', 'h2s_value', 'h2s_state_code'
                            'co_value', 'co_state_code', 'voc_value', 'voc_state_code', 'comb_value', 'comb_state_code'
                    UNION ALL
                    SELECT id, record_time, device_index, sensor_index, 
                           o2_value, o2_state_code, h2s_value, h2s_state_code
                           co_value, co_state_code, voc_value, voc_state_code, comb_value, comb_state_code
                    INTO OUTFILE 'C:/gasLog/gasLog_${logDate}.csv'
                    FIELDS TERMINATED BY ','
                    ENCLOSED BY '"'
                    LINES TERMINATED BY '\n' 
                    FROM sensor_log;`;
        return query;
    },
    gasLogDelete: function(){
        var query = `TRUNCATE TABLE sensor_log;`;
        return query;
    },
    receiverList: function(data){
        var sensorIdx = data;
        var query = `SELECT id, name, tel, sms_yn, sensor_name FROM receiver WHERE sensor_index="${sensorIdx}";`
        return query;
    }
 }
 
 module.exports=_query;
