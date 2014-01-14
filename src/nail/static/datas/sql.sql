
DROP TABLE IF EXISTS planx_graph.tb_servicebill;
CREATE TABLE planx_graph.tb_servicebill (
    name varchar(64) ,
    amount int,
    score int,
    product_id varchar(64),
    service_id varchar(64),
    pay_prePaidCard int,
    pay_cash int,
    pay_coupon int,
    pay_bankAccount_id int,
    pay_bankAccount_money int,
    pay_score int,
    member_id varchar(64),
    memberCard_id varchar(64),
    employee_id varchar(64) 
)