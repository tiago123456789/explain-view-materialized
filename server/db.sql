CREATE TABLE IF NOT EXISTS countries(
 id SERIAL PRIMARY KEY,
 name varchar(150)
)

CREATE TABLE IF NOT EXISTS variants(
 id SERIAL PRIMARY KEY,
 name varchar(150)
)

CREATE TABLE IF NOT EXISTS occurrences(
    id SERIAL PRIMARY KEY,
    location_id INT NOT NULL,
    date DATE NOT NULL,
    variant_id INT NOT NULL,
    num_sequences int NOT NULL,
    perc_sequences decimal(5, 2) NOT NULL,
    num_sequences_total int NOT NULL,
    FOREIGN KEY(location_id) REFERENCES countries(id),
    FOREIGN KEY(variant_id) REFERENCES variants(id)
)

explain select 
    variants.name as variant, 
    countries.name as country, 
    occurrences.date,
    sum(occurrences.num_sequences) as total
from occurrences
inner join countries on (countries.id = occurrences.location_id)
inner join variants on (variants.id = occurrences.variant_id)
-- where  countries.name = 'Brazil'
group by countries.name, variants.name,  occurrences.date
order by countries.name

explain select * from view_materialized_total_by_variants_by_date_each_countries

    WHERE country = 'Brazil'
REFRESH MATERIALIZED VIEW view_materialized_total_by_variants_each_countries;
CREATE MATERIALIZED VIEW view_materialized_total_by_variants_by_date_each_countries
AS
(
     select 
    variants.name as variant, 
    countries.name as country, 
    occurrences.date,
    sum(occurrences.num_sequences) as total
from occurrences
inner join countries on (countries.id = occurrences.location_id)
inner join variants on (variants.id = occurrences.variant_id)
group by countries.name, variants.name,  occurrences.date
order by countries.name
)
WITH DATA;

explain select 
    countries.name, 
    sum(occurrences.num_sequences) as total
from occurrences
inner join countries on (countries.id = occurrences.location_id)
group by countries.name
order by countries.name

Seq Scan on view_materialized_total_by_country  (cost=0.00..12.30 rows=230 width=326)
explain select * from view_materialized_total_by_country

CREATE MATERIALIZED VIEW view_materialized_total_by_country
AS
(
    select 
    countries.name, 
    sum(occurrences.num_sequences) as total
from occurrences
inner join countries on (countries.id = occurrences.location_id)
group by countries.name
order by countries.name
)
WITH DATA;

alter table countries ADD COLUMN long varchar(50);


select *, 
    (select long from countries WHERE name = i.country), 
    (select lat from countries WHERE name = i.country)  from (
    select 
        variants.name as variant,
        countries.name as country, 
        sum(occurrences.num_sequences) as total
    from occurrences
    inner join countries on (countries.id = occurrences.location_id)
    inner join variants on (variants.id = occurrences.variant_id)
    
group by country, variant
) as i

CREATE MATERIALIZED VIEW view_materialized_total_by_variants_and_country
AS
(

select *, 
    (select long from countries WHERE name = i.country), 
    (select lat from countries WHERE name = i.country)  from (
    select 
        variants.name as variant,
        countries.name as country, 
        sum(occurrences.num_sequences) as total
    from occurrences
    inner join countries on (countries.id = occurrences.location_id)
    inner join variants on (variants.id = occurrences.variant_id)
    
group by country, variant
) as i

)
WITH DATA

select * from view_materialized_total_by_variants_and_country