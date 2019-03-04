create database weather;

create table if not exists stations
(
     id integer not null,
     station_name varchar(200) not null,
     lat double,
     lng double,
     alt double,
     date_installed numeric,
     
);

create table if not exists rain
(
    id integer primary key AUTOINCREMENT,
    stat_id integer not null,
    when_recorded numeric not null,
    one_hr_rain real not null,
    todays_rain real not null
);

create table if not exists wind
(
    id integer primary key autoincrement,
    stat_id integer not null,
    when_recorded numeric not null,
    bearing integer not null,
    speed real not null,
    max_speed real not null    
);

create table if not exists temperature
(
    id integer primary key autoincrement,
    stat_id integer not null,
    when_recorded numeric not null,
    humidity real not null,
    temperature real not null,
    pressure real not null    
);


create table if not exists soil
(
    id integer primary key autoincrement,
    stat_id integer not null,
    when_recorded numeric not null,
    soil_moisture real not null,
    soil_temperature real not null
);

create table if not exists light
(
    id integer primary key autoincrement,
    stat_id integer not null,
    when_recorded numeric not null,
    light_percent real not null
);

insert into stations (id, station_name, lat, lng, alt, date_installed) values (1, "Main House Station", -17.431867, 145.506004, 1022.0, '2017-04-17 18:00:00');
