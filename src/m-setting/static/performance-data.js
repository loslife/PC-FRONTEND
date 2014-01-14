define(function (require, exports, module) {
    var self = this,
        utils = require("mframework/static/package").utils, 			        //全局公共函数
        database = require("mframework/static/package").database,		//数据操作服务
        db = database.getDBInstance(),		//数据操作服务
        cache = utils.getCache();

    exports.buildMonthReportData = buildMonthReportData;
    exports.buildWeekReportData = buildWeekReportData;
    exports.comparePrevDay = comparePrevDay;
    exports.comparePrevMonth = comparePrevMonth;
    exports.comparePrevWeek = comparePrevWeek;

    reset_report_data();

    function reset_report_data(){
        return  {
            historyServiceBill:[],
            historyCardBill:[],
            year:"",
            month:"",
            week:"",
            report_service : {
                id:"",
                begin_day:"",
                end_day:"",
                type:"service",
                period_statistics:{
                    total:{
                        all:0
                    },
                    total_detail:{
                        cash_consume:0,
                        card_consume:0,
                        card_new:0,
                        card_recharge:0
                    },
                    cate_static:{

                    },
                    compare_prev:{
                        total:{}
                    }
                },
                day_statistics:[]
            },
            report_operate : {
                id:"",
                begin_day:"",
                end_day:"",
                type:"operate",
                period_statistics:{
                    total:{
                        all:0
                    },
                    total_detail:{
                        cash_consume:0,
                        card_consume:0,
                        card_new:0,
                        card_recharge:0
                    },
                    compare_prev:{
                        total:{},
                        cash_consume:{},
                        card_consume:{},
                        card_new:{},
                        card_recharge:{}
                    }
                },
                day_statistics:[]
            },
            report_consumer : {
                id:"",
                begin_day:"",
                end_day:"",
                type:"consumer",
                period_statistics:{
                    total:{
                        all:0
                    },
                    consumer:{
                        memberNo:0,
                        tempNo:0,
                        xaxis_points:[
                        ]
                    },
                    compare_prev:{
                        total:{}
                    }
                },
                day_statistics:[]
            },
            report_employee : {
                id:"",
                begin_day:"",
                end_day:"",
                type:"employee",
                period_statistics:{
                    total:{
                        all:0
                    },
                    employee:{},
                    compare_prev:{
                        total:{}
                    }
                },
                day_statistics:[]
            }
        }
    }

    function buildMonthReportData(year, month,callback){
        var data = cache.getObject("report.data.month."+year+"_"+month);
        if(data){
            callback(null,data);
        }else{
            _buildMonthReportData(year, month,function(error,data){
                if(error){
                    callback(error);
                    return;
                }else{
                    if(data){
                        compare(data,function(){
                            //缓存报表数据
                            cache.set("report.data.month."+year+"_"+month,data,true);
                            callback(null,data);
                        });
                    }else{
                        callback({error:"查找月数据失败"});
                    }
                }
            });
        }
        function compare(reportData,callback){
            var chartDatas = [reportData.report_operate,reportData.report_service,reportData.report_consumer,reportData.report_employee];
            async.each(chartDatas,
                function(chartData,callback){
                    comparePrevMonth(year,month,chartData,function(error,compare_result){
                        if(error){
                            callback(error);
                            return;
                        }else{
                            reportData["report_"+chartData.type].period_statistics.compare_prev = compare_result;
                            callback(null);
                        }
                    });
                },
                function(error){
                    if(error){
                        callback(error);
                        return;
                    }
                    callback(null);
                });
        }
    }

    function _buildMonthReportData(year, month,callback){

        var  report_data = reset_report_data();
        var startDay,endDay,type,intervalDay;
        //为了获取一个月的天数，单月数据统计为前一月:最后一天:23:59:59 到当月:最后一天:23:59:59
        startDay= new Date(new Date(year, month, 1)-1);
        endDay = new Date(new Date(year, month + 1, 0).getTime()+24*3600*1000-1);
        intervalDay = endDay.getDate();
        type = "month";
        report_data.year = year;
        report_data.month = month;

        initStaticData(intervalDay,report_data.report_operate);
        initStaticData(intervalDay,report_data.report_service);
        initStaticData(intervalDay,report_data.report_employee);
        initStaticData(intervalDay,report_data.report_consumer);

        for(var i=0;i<intervalDay;i++){
            report_data.report_consumer.period_statistics.consumer.xaxis_points.push({timeBegin:8,timeEnd:8,title:(i+1),memberNo:0,tempNo:0});
        }

        var tasks = [];
        tasks.push(function(callback){
            buildServiceReportData(year, month,startDay,endDay,type,intervalDay,report_data,callback);
        });
        tasks.push(function(callback){
            buildCardReportData(year, month,startDay,endDay,type,intervalDay,report_data,callback);
        });
        async.series(tasks,function(error){
            if(error){
                callback(error);
                return;
            }
            callback(null,report_data);
        })


    }


    function buildWeekReportData(year, week,callback){
        var data = cache.getObject("report.data.week."+year+"_"+week.getWeekOfYear());
        if(data){
            callback(null,data);
        }else{
            _buildWeekReportData(year, week,function(error,data){
                if(error){
                    callback(error);
                    return;
                }else{
                    if(data){
                        compare(data,function(){

                            //缓存报表数据
                            cache.set("report.data.week."+year+"_"+week.getWeekOfYear(),data,true);
                            callback(null,data);
                        });
                    }else{
                        callback({error:"查找周数据失败"});
                    }
                }
            });
        }
        function compare(reportData,callback){
            var chartDatas = [reportData.report_operate,reportData.report_service,reportData.report_consumer,reportData.report_employee];
            async.each(chartDatas,
                function(chartData,callback){
                    comparePrevWeek(year,week,chartData,function(error,compare_result){
                        if(error){
                            callback(error);
                            return;
                        }else{
                            reportData["report_"+chartData.type].period_statistics.compare_prev = compare_result;
                            callback(null);
                        }
                    });
                },
                function(error){
                    if(error){
                        callback(error);
                        return;
                    }
                    callback(null);
                });
        }
    }

    function _buildWeekReportData(year, week,callback){
        var  report_data = reset_report_data();
        var weekdays = _getWeekDays(week);
        report_data.week = week.getWeekOfYear();
        var startDay,endDay,type,intervalDay;
        startDay= weekdays[0];
        //星期6凌晨+24小时毫秒数
        endDay =  new Date(weekdays[6].getTime()+24*3600*1000);
        intervalDay = 7;
        type = "week";

        initStaticData(intervalDay,report_data.report_operate);
        initStaticData(intervalDay,report_data.report_service);
        initStaticData(intervalDay,report_data.report_employee);
        initStaticData(intervalDay,report_data.report_consumer);

        report_data.report_consumer.period_statistics.consumer.xaxis_points = [
            {timeBegin:8,timeEnd:8,title:"星期日",memberNo:0,tempNo:0},
            {timeBegin:10,timeEnd:12,title:"星期一",memberNo:0,tempNo:0},
            {timeBegin:12,timeEnd:14,title:"星期二",memberNo:0,tempNo:0},
            {timeBegin:14,timeEnd:16,title:"星期三",memberNo:0,tempNo:0},
            {timeBegin:16,timeEnd:18,title:"星期四",memberNo:0,tempNo:0},
            {timeBegin:18,timeEnd:20,title:"星期五",memberNo:0,tempNo:0},
            {timeBegin:20,timeEnd:22,title:"星期六",memberNo:0,tempNo:0}
        ];

        var tasks = [];
        tasks.push(function(callback){
            buildServiceReportData(week.getFullYear(),week.getMonth(),startDay,endDay,type,intervalDay,report_data,callback);
        });
        tasks.push(function(callback){
            buildCardReportData(week.getFullYear(),week.getMonth(),startDay,endDay,type,intervalDay,report_data,callback);
        });

        async.series(tasks,function(error){
            if(error){
                callback(error);
            }
            callback(null,report_data);
        })

    }


    function _getWeekDays(curr){
        var nowDayOfWeek = curr.getDay(); //今天本周的第几天
        var nowDay = curr.getDate(); //当前日
        var nowMonth = curr.getMonth(); //当前月
        var nowYear = curr.getYear(); //当前年
        nowYear += (nowYear < 2000) ? 1900 : 0; //
        var day1 = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek);
        var day2 = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek+1);
        var day3 = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek+2);
        var day4 = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek+3);
        var day5 = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek+4);
        var day6 = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek+5);
        var day7 = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek+6);
        return [day1,day2,day3,day4,day5,day6,day7];
    }




    //统计服务数据
    function buildServiceReportData(year,month,startDay,endDay,type,intervalDay,report_data,callback){
        var sql = "select  a.serviceBill_id,a.dateTime,a.day,a.weekDay,a.project_id,a.serviceBill_id,a.project_name,a.project_cateId,a.project_cateName,a.sumMoney,a.dateTime,a.saleNum,a.discounts,b.member_id,b.member_name,b.employee_id,b.employee_name,b.pay_prePaidCard,b.pay_cash"+
            " from  tb_billProject a, tb_serviceBill b where a.serviceBill_id = b.id and a.dateTime>? and a.dateTime < ?";
        db.transaction(function(tx) {
            tx.executeSql(sql,[startDay.getTime(),endDay.getTime()],function(tx,result){
                var len = result.rows.length;
                //获取当月每天的统计数据
                if(len>0){
                    for(var i=0;i<len;i++) {
                        var tmp =   result.rows.item(i);
                        setStaticData(report_data.report_operate,tmp);
                        setStaticData(report_data.report_service,tmp);
                        setStaticData(report_data.report_employee,tmp);
                        setStaticData(report_data.report_consumer,tmp);
                        //历史流水
                        report_data.historyServiceBill.push(tmp);
                    }
                }
                callback(null);

            },function(tx,error){
                console.log("error");
                console.log(error);
                callback(error);
            })
        });

        function setStaticData(typeData,tmp){
            var tmp_sumMoney = parseInt(tmp["sumMoney"]);
            var day_statistics_index = 0;

            if(type == "week"){
                day_statistics_index = tmp["weekDay"];
            }else{
                day_statistics_index = tmp["day"]-1;
            }
            if(day_statistics_index > typeData.day_statistics.length){
                return;
            }

            //总业绩统计
            if(typeData.type == "operate" || typeData.type == "service" || typeData.type == "employee"){
                typeData.period_statistics.total.all += tmp_sumMoney;
                typeData.day_statistics[day_statistics_index].total.all += tmp_sumMoney;
            }

            if(typeData.type == "operate"){
                //服务业绩统计：现金业绩、划卡业绩统计
                if(tmp["pay_prePaidCard"]>0){
                    typeData.period_statistics.total_detail.card_consume += tmp_sumMoney;
                    typeData.day_statistics[day_statistics_index].total_detail.card_consume += tmp_sumMoney;
                }else if(tmp["pay_cash"]>0){
                    typeData.period_statistics.total_detail.cash_consume += tmp_sumMoney;
                    typeData.day_statistics[day_statistics_index].total_detail.cash_consume += tmp_sumMoney;
                }
            }

            if(typeData.type == "service"){
                if(!typeData.period_statistics.cate_static[tmp["project_cateId"]]){
                    typeData.period_statistics.cate_static[tmp["project_cateId"]] = {sumMoney:0};
                }

                if(!typeData.day_statistics[day_statistics_index].cate_static[tmp["project_cateId"]]){
                    typeData.day_statistics[day_statistics_index].cate_static[tmp["project_cateId"]] = {sumMoney:0};
                }

                //服务业绩统计：按服务类型统计
                typeData.period_statistics.cate_static[tmp["project_cateId"]].project_cateName =tmp["project_cateName"];
                typeData.period_statistics.cate_static[tmp["project_cateId"]].sumMoney += tmp_sumMoney;

                //日统计
                    typeData.day_statistics[day_statistics_index].cate_static[tmp["project_cateId"]].project_cateName =tmp["project_cateName"];
                typeData.day_statistics[day_statistics_index].cate_static[tmp["project_cateId"]].sumMoney += tmp_sumMoney;
            }

            if(typeData.type == "consumer"){
                //会员非会员统计，通过消费单统计消费人次
                if(tmp["member_id"]){
                    if(!typeData.day_statistics[day_statistics_index].billMap[tmp["serviceBill_id"]]){
                        typeData.day_statistics[day_statistics_index].billMap[tmp["serviceBill_id"]] = {};
                        typeData.day_statistics[day_statistics_index].consumer.memberNo++;
                        typeData.period_statistics.consumer.memberNo++;

                        typeData.period_statistics.consumer.xaxis_points[day_statistics_index].memberNo++;
                        var bill_time_hour = (new Date(tmp["dateTime"])).getHours();
                        if(bill_time_hour > 7 && bill_time_hour < 24){
                            var no = parseInt((bill_time_hour-8)/2);
                            typeData.day_statistics[day_statistics_index].consumer.xaxis_points[no].memberNo++;
                        }

                        typeData.period_statistics.total.all++;
                        typeData.day_statistics[day_statistics_index].total.all++;

                    }
                }else{
                    if(!typeData.day_statistics[day_statistics_index].billMap[tmp["serviceBill_id"]]){
                        typeData.day_statistics[day_statistics_index].billMap[tmp["serviceBill_id"]] = {};
                        typeData.day_statistics[day_statistics_index].consumer.tempNo++;
                        typeData.period_statistics.consumer.tempNo++;

                        typeData.period_statistics.consumer.xaxis_points[day_statistics_index].tempNo++;
                        var bill_time_hour = (new Date(tmp["dateTime"])).getHours();
                        if(bill_time_hour > 7 && bill_time_hour < 24){
                            var no = parseInt((bill_time_hour-8)/2);
                            typeData.day_statistics[day_statistics_index].consumer.xaxis_points[no].tempNo++;
                        }

                        typeData.period_statistics.total.all++;
                        typeData.day_statistics[day_statistics_index].total.all++;
                    }
                }
            }

            if(typeData.type == "employee"){
                //员工业绩统计
                if(tmp["employee_id"]){
                    if(!typeData.period_statistics.employee[tmp["employee_id"]]){
                        typeData.period_statistics.employee[tmp["employee_id"]] = {value:0,id:tmp["employee_id"],name:tmp["employee_name"]};
                    }
                    if(!typeData.day_statistics[day_statistics_index].employee[tmp["employee_id"]]){
                        typeData.day_statistics[day_statistics_index].employee[tmp["employee_id"]] = {value:0,id:tmp["employee_id"],name:tmp["employee_name"]};
                    }
                    typeData.period_statistics.employee[tmp["employee_id"]].value += tmp_sumMoney;
                    typeData.day_statistics[day_statistics_index].employee[tmp["employee_id"]].value += tmp_sumMoney;
                }
            }
        }

    }
    //统计卡消费信息
    function buildCardReportData(year,month,startDay,endDay,type,intervalDay,report_data,callback){
        var sql = "select a.day,a.weekDay,a.type,a.dateTime,a.amount,a.member_name,a.memberCardCate_id,a.memberCard_id,a.memberCard_name,a.employee_name,a.employee_id"+
            " from  tb_rechargeMemberBill a  where  a.dateTime>? and a.dateTime<?";

        db.transaction(function(tx) {
            tx.executeSql(sql,[startDay.getTime(),endDay.getTime()],function(tx,result){
                var len = result.rows.length;

                if(len>0){
                    for(var i=0;i<len;i++) {
                        var tmp =   result.rows.item(i);
                        setStaticData(report_data.report_operate,tmp);
                        setStaticData(report_data.report_employee,tmp);
                        report_data.historyCardBill.push(tmp);
                    }
                }
                callback(null);

            },function(tx,error){
                console.log(error);
                callback(error);
            })
        });


        function setStaticData(typeData,tmp){
            var tmp_sumMoney = parseInt(tmp["amount"]);
            var day_statistics_index = 0;
            if(type == "week"){
                day_statistics_index = tmp["weekDay"];
            }else{
                day_statistics_index = tmp["day"]-1;
            }
            if(day_statistics_index > typeData.day_statistics.length){
              return;
            }
            //总业绩统计
            if(typeData.type == "operate" || typeData.type == "employee"){
                typeData.period_statistics.total.all += tmp_sumMoney;
                typeData.day_statistics[day_statistics_index].total.all += tmp_sumMoney;
            }

            if(typeData.type == "operate"){
                //经营业绩
                if(tmp["type"] == 1){
                    typeData.period_statistics.total_detail.card_recharge += tmp_sumMoney;
                    typeData.day_statistics[day_statistics_index].total_detail.card_recharge += tmp_sumMoney;
                }else if(tmp["type"] == 2){
                    typeData.period_statistics.total_detail.card_new += tmp_sumMoney;
                    typeData.day_statistics[day_statistics_index].total_detail.card_new += tmp_sumMoney;
                }
            }
            if(typeData.type == "employee"){
                if(tmp["employee_id"]){
                    //收集员工业绩
                    if(!typeData.period_statistics.employee[tmp["employee_id"]]){
                        typeData.period_statistics.employee[tmp["employee_id"]] = {value:0,id:tmp["employee_id"],name:tmp["employee_name"]};
                    }
                    if(!typeData.day_statistics[day_statistics_index].employee[tmp["employee_id"]]){
                        typeData.day_statistics[day_statistics_index].employee[tmp["employee_id"]] = {value:0,id:tmp["employee_id"],name:tmp["employee_name"]};
                    }
                    typeData.period_statistics.employee[tmp["employee_id"]].value += tmp_sumMoney;
                    typeData.day_statistics[day_statistics_index].employee[tmp["employee_id"]].value += tmp_sumMoney;
                }
            }
        }
    }


    function initStaticData(intervalDay,typeData){
        for(var i=0;i<intervalDay;i++){
            typeData.day_statistics[i] = {
                total:{
                    all:0
                },
                total_detail:{
                    cash_consume:0,
                    card_consume:0,
                    card_new:0,
                    card_recharge:0
                },
                cate_static:{

                },
                compare_prev:{
                    total:0,
                    cash_consume:0,
                    card_consume:0,
                    card_new:0,
                    card_recharge:0
                },
                billMap:{},
                consumer:{
                    memberNo:0,
                    tempNo:0,
                    xaxis_points:[
                        {timeBegin:8,timeEnd:8,title:"8:00-10:00",memberNo:0,tempNo:0},
                        {timeBegin:10,timeEnd:12,title:"10:00-12:00",memberNo:0,tempNo:0},
                        {timeBegin:12,timeEnd:14,title:"12:00-14:00",memberNo:0,tempNo:0},
                        {timeBegin:14,timeEnd:16,title:"14:00-16:00",memberNo:0,tempNo:0},
                        {timeBegin:16,timeEnd:18,title:"16:00-18:00",memberNo:0,tempNo:0},
                        {timeBegin:18,timeEnd:20,title:"18:00-20:00",memberNo:0,tempNo:0},
                        {timeBegin:20,timeEnd:22,title:"20:00-22:00",memberNo:0,tempNo:0},
                        {timeBegin:22,timeEnd:24,title:"22:00-24:00",memberNo:0,tempNo:0}
                    ]
                },
                employee:{}
            };
        }
    }

    function comparePrevDay(year,month,date,typeData,callback){
        var total,cash_consume,card_consume,card_new,card_recharge,
            prev_total,prev_cash_consume,prev_card_consume,prev_card_new,prev_card_recharge;
        var compare_prev = {

        }

        if(date>1){
            total = typeData.day_statistics[date-1].total.all;
            prev_total = typeData.day_statistics[date-2].total.all;
            if(prev_total==0){
                compare_prev.total =  {
                  value: total-prev_total,
                  rate:100
                }
            }else{
                compare_prev.total ={
                    value:total-prev_total,
                    rate:(parseFloat((total-prev_total)/prev_total)*100).toFixed(2)
                }
            }

            if(typeData.type == "operate"){
                cash_consume = typeData.day_statistics[date-1].total_detail.cash_consume;
                card_consume = typeData.day_statistics[date-1].total_detail.card_consume;
                card_new = typeData.day_statistics[date-1].total_detail.card_new;
                card_recharge = typeData.day_statistics[date-1].total_detail.card_recharge;

                prev_cash_consume = typeData.day_statistics[date-2].total_detail.cash_consume;
                prev_card_consume = typeData.day_statistics[date-2].total_detail.card_consume;
                prev_card_new = typeData.day_statistics[date-2].total_detail.card_new;
                prev_card_recharge = typeData.day_statistics[date-2].total_detail.card_recharge;

                operateCompare("cash_consume",cash_consume,prev_cash_consume);
                operateCompare("card_consume",card_consume,prev_card_consume);
                operateCompare("card_new",card_new,prev_card_new);
                operateCompare("card_recharge",card_recharge,prev_card_recharge);
            }
            callback(null,compare_prev);
        }else if(date==1){
            //获取前一个月数据
            total = typeData.day_statistics[date-1].total.all;

            var prev_month =  new Date(year,month).prevMonth().getMonth();
            var prev_year =  new Date(year,month).prevMonth().getFullYear();


            _buildMonthReportData(prev_year,prev_month,function(error,prev_month_data){
                if(error){
                    callback(error);
                    return;
                }

                var prev_date_length = 0;
                if(typeData.type == "operate"){
                    prev_date_length = prev_month_data.report_operate.day_statistics.length;

                    prev_total = prev_month_data.report_operate.day_statistics[prev_date_length-1].total.all;
                    operateCompare("total",total,prev_total);


                    cash_consume = typeData.day_statistics[date-1].total_detail.cash_consume;
                    card_consume = typeData.day_statistics[date-1].total_detail.card_consume;
                    card_new = typeData.day_statistics[date-1].total_detail.card_new;
                    card_recharge = typeData.day_statistics[date-1].total_detail.card_recharge;

                    prev_cash_consume = prev_month_data.report_operate.day_statistics[prev_date_length-1].total_detail.cash_consume;
                    prev_card_consume = prev_month_data.report_operate.day_statistics[prev_date_length-1].total_detail.card_consume;
                    prev_card_new = prev_month_data.report_operate.day_statistics[prev_date_length-1].total_detail.card_new;
                    prev_card_recharge = prev_month_data.report_operate.day_statistics[prev_date_length-1].total_detail.card_recharge;

                    operateCompare("cash_consume",cash_consume,prev_cash_consume);
                    operateCompare("card_consume",card_consume,prev_card_consume);
                    operateCompare("card_new",card_new,prev_card_new);
                    operateCompare("card_recharge",card_recharge,prev_card_recharge);

                }
                if(typeData.type == "service"){
                    prev_date_length = prev_month_data.report_service.day_statistics.length;
                    prev_total = prev_month_data.report_service.day_statistics[prev_date_length-1].total.all;
                    operateCompare("total",total,prev_total);
                }
                if(typeData.type == "consumer"){
                    prev_date_length = prev_month_data.report_consumer.day_statistics.length;

                    prev_total = prev_month_data.report_consumer.day_statistics[prev_date_length-1].total.all;
                    operateCompare("total",total,prev_total);
                }
                if(typeData.type == "employee"){
                    prev_date_length = prev_month_data.report_employee.day_statistics.length;

                    prev_total = prev_month_data.report_employee.day_statistics[prev_date_length-1].total.all;
                    operateCompare("total",total,prev_total);
                }
                callback(null,compare_prev);
            });
        }

        function operateCompare(field,current,prev){
            if(prev >0){
                compare_prev[field] = {
                    value:current-prev,
                    rate:parseFloat((current-prev)/prev*100).toFixed(2)
                }
            }else{
                compare_prev[field] = {
                    value:current-prev,
                    rate:100
                }
            }
        }

    }
    function comparePrevWeek(year,week,typeData,callback){
        var total,cash_consume,card_consume,card_new,card_recharge,
            prev_total,prev_cash_consume,prev_card_consume,prev_card_new,prev_card_recharge;
        var compare_prev = {

        }

        var prev_week = utils.getLastWeekStartDate(week);

        _buildWeekReportData(year,prev_week,function(error,prev_month_data){
            if(error){
                callback(error);
                return;
            }

            total = typeData.period_statistics.total.all;

            if(typeData.type == "operate"){
                prev_total = prev_month_data.report_operate.period_statistics.total.all;
                operateCompare("total",total,prev_total);

                cash_consume = typeData.period_statistics.total_detail.cash_consume;
                card_consume = typeData.period_statistics.total_detail.card_consume;
                card_new = typeData.period_statistics.total_detail.card_new;
                card_recharge = typeData.period_statistics.total_detail.card_recharge;

                prev_cash_consume = prev_month_data.report_operate.period_statistics.total_detail.cash_consume;
                prev_card_consume = prev_month_data.report_operate.period_statistics.total_detail.card_consume;
                prev_card_new = prev_month_data.report_operate.period_statistics.total_detail.card_new;
                prev_card_recharge = prev_month_data.report_operate.period_statistics.total_detail.card_recharge;

                operateCompare("cash_consume",cash_consume,prev_cash_consume);
                operateCompare("card_consume",card_consume,prev_card_consume);
                operateCompare("card_new",card_new,prev_card_new);
                operateCompare("card_recharge",card_recharge,prev_card_recharge);
            }
            if(typeData.type == "service"){

                prev_total = prev_month_data.report_service.period_statistics.total.all;
                operateCompare("total",total,prev_total);
            }
            if(typeData.type == "consumer"){

                prev_total = prev_month_data.report_consumer.period_statistics.total.all;
                operateCompare("total",total,prev_total);
            }
            if(typeData.type == "employee"){

                prev_total = prev_month_data.report_employee.period_statistics.total.all;
                operateCompare("total",total,prev_total);
            }
            callback(null,compare_prev);

        });

        function operateCompare(field,current,prev){
            if(prev >0){
                compare_prev[field] = {
                    value:current-prev,
                    rate:parseFloat((current-prev)/prev*100).toFixed(2)
                }
            }else{
                compare_prev[field] = {
                    value:current-prev,
                    rate:100
                }
            }
        }
    }
    function comparePrevMonth(year,month,typeData,callback){
        var total,cash_consume,card_consume,card_new,card_recharge,
            prev_total,prev_cash_consume,prev_card_consume,prev_card_new,prev_card_recharge;
        var compare_prev = {

        }
        var prev_month =  new Date(year,month).prevMonth().getMonth();
        var prev_year =  new Date(year,month).prevMonth().getFullYear();


        _buildMonthReportData(prev_year,prev_month,function(error,prev_month_data){
            if(error){
                callback(error);
                return;
            }

            total = typeData.period_statistics.total.all;

            if(typeData.type == "operate"){
                prev_total = prev_month_data.report_operate.period_statistics.total.all;
                operateCompare("total",total,prev_total);

                cash_consume = typeData.period_statistics.total_detail.cash_consume;
                card_consume = typeData.period_statistics.total_detail.card_consume;
                card_new = typeData.period_statistics.total_detail.card_new;
                card_recharge = typeData.period_statistics.total_detail.card_recharge;

                prev_cash_consume = prev_month_data.report_operate.period_statistics.total_detail.cash_consume;
                prev_card_consume = prev_month_data.report_operate.period_statistics.total_detail.card_consume;
                prev_card_new = prev_month_data.report_operate.period_statistics.total_detail.card_new;
                prev_card_recharge = prev_month_data.report_operate.period_statistics.total_detail.card_recharge;

                operateCompare("cash_consume",cash_consume,prev_cash_consume);
                operateCompare("card_consume",card_consume,prev_card_consume);
                operateCompare("card_new",card_new,prev_card_new);
                operateCompare("card_recharge",card_recharge,prev_card_recharge);
            }
            if(typeData.type == "service"){
                prev_total = prev_month_data.report_service.period_statistics.total.all;
                operateCompare("total",total,prev_total);
            }
            if(typeData.type == "consumer"){
                prev_total = prev_month_data.report_consumer.period_statistics.total.all;
                operateCompare("total",total,prev_total);
            }
            if(typeData.type == "employee"){

                prev_total = prev_month_data.report_employee.period_statistics.total.all;
                operateCompare("total",total,prev_total);
            }

            callback(null,compare_prev);

        });

        function operateCompare(field,current,prev){
            if(prev >0){
                compare_prev[field] = {
                    value:current-prev,
                    rate:parseFloat((current-prev)/prev*100).toFixed(2)
                }
            }else{
                compare_prev[field] = {
                    value:current-prev,
                    rate:100
                }
            }
        }
    }



})