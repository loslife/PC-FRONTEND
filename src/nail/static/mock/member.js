//辅助生成随机会员数据数据
define(function (require, exports, module) {
    var mockTargets = require("./mockTargets").controlTargets;
    var database = require("mframework/static/package").database;
    var dbInstance = database.getDBInstance();
    var enterpriseId = YILOS.ENTERPRISEID;
    var firstNameList = ["王", "李", "张", "刘", "陈", "杨", "黄", "吴", "赵", "周", "孙", "马", "朱", "胡", "林", "郭", "何", "高", "罗", "梁", "谢", "宋", "唐", "许", "邓", "冯", "韩", "曹", "彭", "萧", "蔡", "潘", "田", "董", "袁", "于", "余", "蒋", "杜", "苏", "魏", "程", "吕", "丁", "沈", "任", "卢", "傅", "钟", "姜", "崔", "谭", "廖", "范", "汪", "金", "石", "戴", "贾", "韦", "夏", "邱", "侯", "熊", "孟", "秦", "白", "江", "阎", "薛", "尹", "段", "黎", "史", "龙", "陶", "贺", "顾", "毛", "郝", "龚", "万", "钱", "严", "赖", "覃", "洪", "武", "莫", "祁"];
    var memberNameList = ["婷", "果", "妮", "倩", "思", "夕", "惜", "汐", "兮", "羽", "雨", "语", "瑜", "樱", "雪", "菲", "斐", "霏", "依", "艺", "伊", "纯", "粉", "埖", "落", "沐", "文", "书", "雪", "墨", "沫", "陌", "云", "韵", "芸", "情", "琴", "沁", "倾", "若", "含", "寒", "涵", "诗", "吟", "茵", "音", "凡", "佳", "嘉", "琼", "桂", "娣", "叶", "璧", "璐", "娅", "琦", "晶", "妍", "茜", "秋", "珊", "莎", "锦", "黛", "青", "倩", "婷", "姣", "婉", "娴", "瑾", "颖", "露", "瑶", "怡", "婵", "雁", "蓓", "纨", "仪", "荷", "丹", "蓉", "眉", "君", "琴", "蕊", "薇", "菁", "梦", "岚", " 苑", "婕", "馨", "瑗", "琰", "韵", "融", "园", "艺", "咏", "卿", "聪", "澜", "纯", "毓", "悦", "昭", "冰", "爽", "琬", "茗", "羽", "希", "宁", "欣", "飘", "育", "滢", "馥", "筠", "柔", "竹", "霭", "凝", "晓", "欢", "霄", "枫", "芸", "菲", "寒", "伊", "亚", "宜", "可", "姬", "舒", "影", "荔", "枝", "思", "丽", "秀", "娟", "英", "华", "慧", "巧", "美", "娜", "静", "淑", "惠", "珠", "翠", "雅", "芝", "玉", "萍", "红", "娥", "玲", "芬", "芳", "燕", "彩", "春", "菊", "勤", "珍", "贞", "莉", "兰", "凤", "洁", "梅", "琳", "素", "云", "莲", "真", "环", "雪", "荣", "爱", "妹", "霞", "香", "月", "莺", "媛", "艳", "瑞", "冰巧", "之槐", "香柳", "问春", "夏寒", "半香", "诗筠", "新梅", "白曼", "安波", "阳", "含桃", "曼卉", "笑萍", "碧巧", "晓露", "寻菡", "沛白", "平灵", "水彤", "彤", "涵易", "乐巧", "依风", "紫南", "亦丝", "易蓉", "紫萍", "惜萱", "诗蕾", "绿", "诗双", "寻云", "孤丹", "谷蓝", "惜香", "谷枫", "山灵", "幻丝", "友梅", "云", "雁丝", "盼旋", "幼旋", "尔蓝", "沛山", "代丝", "痴梅", "觅松", "冰香", "玉", "冰之", "妙梦", "以冬", "碧春", "曼青", "冷菱", "雪曼", "安白", "香桃", "千亦", "凌蝶", "又夏", "沛凝", "翠梅", "书文", "雪卉", "", "傲丝", "安青", "初蝶", "寄灵", "惜寒", "雨竹", "冬莲", "绮南", "翠柏", "亦玉", "孤兰", "秋珊", "新筠", "半芹", "夏瑶", "念文", "晓丝", "涵蕾", "雁凡", "谷兰", "灵凡", "凝云", "曼云", "丹彤", "南霜", "夜梦", "从筠", "雁芙", "语蝶", "依波"];
    var phoneHead = ["133", "138", "137", "187", "151", "139", "134", "152", "186"];
    var createStart = mockTargets.startDate;
    var createEnd = mockTargets.endDate;
    var birthdayStart = new Date("1980/1/1 12:00").getTime();
    var birthdayEnd = new Date("1990/1/1 12:00").getTime();
    var memberCount = mockTargets.memberCount;

    var employeeList = [];
    var cateList = [];

    function initEmployee(callback) {
        var empSelect = "select a.id,a.name,b.bonus_newCard,b.bonus_recharge"
            + " from tb_employee a,tb_job b"
            + " where a.baseInfo_jobId = b.id;";
        dbInstance.execQuery(empSelect, [], function (result) {
            for (var i = 0, len = result.rows.length; i < len; i++) {
                employeeList.push(result.rows.item(i));
            }
            callback(null);
        }, function (error) {
            callback(error);
        });
    }

    function initMemberCate(callback) {
        var cateSelect = "select id,name,cardValid,baseInfo_minMoney,cardNoGenRule_cardNoLen,cardNoGenRule_cardNoPrefix from tb_memberCardCategory;";
        dbInstance.execQuery(cateSelect, [], function (result) {
            for (var i = 0, len = result.rows.length; i < len; i++) {
                cateList.push(result.rows.item(i));
            }
            callback(null);
        }, function (error) {
            callback(error);
        });
    }

    //生成会员以及相关记录
    function productMemberAndMore(callback) {
        async.times(memberCount, function (times, callback) {
            console.log("第" + times + "个会员!");
            async.waterfall([saveMember , saveCard, saveRegBill, saveEmpBonus], function (error) {
                callback(error);
            });
        }, function (error) {
            callback(error);
        });


        function saveMember(callback) {
            var member = {};
            database.getUniqueId(enterpriseId, function (error, trans, id) {
                member.id = id;
                member.name = firstNameList[parseInt(Math.random() * firstNameList.length)] + memberNameList[parseInt(Math.random() * memberNameList.length)];
                member.phoneMobile = phoneHead[parseInt(Math.random() * phoneHead.length)];
                for (var i = 0; i < 8; i++) {
                    member.phoneMobile += parseInt(Math.random() * 10).toString();
                }
                member.sex = Math.random() * 10 < 9 ? 0 : 1;
                member.birthday = birthdayStart + parseInt(Math.random() * (birthdayEnd - birthdayStart));
                member.create_date = createStart + parseInt(Math.random() * (createEnd - createStart));
                member.enterprise_id = enterpriseId;
                var insertMember = database.getInsertSqlOfObj("", "tb_member", member);
                trans.executeSql(insertMember, [], function (trans, result) {
                    callback(null, member);
                }, function (trans, error) {
                    callback(error);
                });
            });
        }

        function saveCard(member, callback) {
            var memberCard = {};
            memberCard.memberId = member.id;
            memberCard.create_date = member.create_date;
            memberCard.lastConsumption_date = member.create_date;
            memberCard.totalConsumption = 0;
            database.getUniqueId(enterpriseId, function (error, trans, id) {
                var cateTemp = cateList[parseInt(Math.random() * cateList.length)];
                var empTemp = employeeList[parseInt(Math.random() * employeeList.length)];
                memberCard.id = id;
                memberCard.currentMoney = cateTemp.baseInfo_minMoney + parseInt(Math.random() * 10) * 100;
                memberCard.recharge_money = memberCard.currentMoney;
                memberCard.periodOfValidity = cateTemp.cardValid;
                memberCard.memberCardCategoryName = cateTemp.name;
                memberCard.memberCardCategoryId = cateTemp.id;
                memberCard.employee_id = empTemp.id;
                memberCard.employee_name = empTemp.name;
                memberCard.enterprise_Id = enterpriseId;
                database.getUniqueCode("tb_memberCard", cateTemp.cardNoGenRule_cardNoLen, function (error, trans, code) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    var randomNo = Math.floor(Math.random() * 900 + 100); //0-999
                    memberCard.cardNo = cateTemp.cardNoGenRule_cardNoPrefix + randomNo + code;
                    var insertCard = database.getInsertSqlOfObj("", "tb_memberCard", memberCard);
                    trans.executeSql(insertCard, [], function (trans, result) {
                        callback(null, member, memberCard);
                    }, function (trans, error) {
                        callback(error);
                    });
                });
            });
        }

        function saveRegBill(member, memberCard, callback) {
            var rechargeBill = {};
            database.getUniqueCode("tb_rechargeMemberBill", 8, function (error, trans, code) {
                if (error) {
                    callback(error);
                    return;
                }
                rechargeBill.billNo = code;
                database.getUniqueId(enterpriseId, function (error, trans, id) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    rechargeBill.id = id;
                    rechargeBill.type = 2;//开卡
                    rechargeBill.amount = memberCard.currentMoney;
                    rechargeBill.dateTime = member.create_date;
                    var dateTemp = new Date(member.create_date);
                    rechargeBill.day = dateTemp.getDate();
                    rechargeBill.weekDay = dateTemp.getDay();
                    rechargeBill.month = dateTemp.getMonth() + 1;
                    rechargeBill.memberCard_id = memberCard.id;
                    rechargeBill.memberCardCate_id = memberCard.memberCardCategoryId;
                    rechargeBill.memberCard_name = memberCard.memberCardCategoryName;
                    rechargeBill.member_name = member.name;
                    rechargeBill.member_id = member.id;
                    rechargeBill.member_currentBalance = memberCard.currentMoney;
                    rechargeBill.employee_id = memberCard.employee_id;
                    rechargeBill.employee_name = memberCard.employee_name;
                    rechargeBill.pay_cash = memberCard.currentMoney;
                    rechargeBill.create_date = member.create_date;
                    rechargeBill.enterprise_id = enterpriseId;
                    var insertReBill = database.getInsertSqlOfObj("", "tb_rechargeMemberBill", rechargeBill);
                    trans.executeSql(insertReBill, [], function (trans, result) {
                        callback(null, member, memberCard, rechargeBill);
                    }, function (trans, error) {
                        callback(error);
                    });
                });
            });
        }

        function saveEmpBonus(member, memberCard, rechargeBill, callback) {
            var empBonus = {};
            database.getUniqueId(enterpriseId, function (error, trans, id) {
                if (error) {
                    callback(error);
                    return;
                }
                empBonus.id = id;
                empBonus.project_id = memberCard.id;
                empBonus.serviceBill_id = rechargeBill.id;
                empBonus.dateTime = member.create_date;
                empBonus.type = 8;//代表开卡
                empBonus.employee_id = memberCard.employee_id;
                empBonus.totalMoney = memberCard.currentMoney;
                empBonus.member_name = member.name;
                empBonus.cardNo = memberCard.cardNo;
                empBonus.cardCate = memberCard.memberCardCategoryName;
                empBonus.befDisMoney = memberCard.currentMoney;
                empBonus.billDetail = "开卡";
                empBonus.discount = 10;
                empBonus.bonusMoney = (empBonus.totalMoney * 0.1).toFixed(2);//此处已写死
                empBonus.create_date = member.create_date;
                empBonus.enterprise_id = enterpriseId;
                var insertBonus = database.getInsertSqlOfObj("", "tb_empBonus", empBonus);
                trans.executeSql(insertBonus, [], function (trans, result) {
                    callback(null);
                }, function (trans, error) {
                    callback(error);
                });
            });
        }
    }

    function init(callback) {
        async.waterfall([initEmployee, initMemberCate, productMemberAndMore], function (error) {
            callback(error);
        });
    }

    exports.init = init;
});