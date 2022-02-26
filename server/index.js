const { Client } = require('pg')
const client = new Client({
    user: "postgres",
    database: "crud",
    password: "postgres",
    port: "5433",
    host: "localhost"
});

const express = require("express")
const cors = require("cors")
const app = express();

app.use(cors())

app.get("/reports/total-by-country", async (request, response) => {
    const result = await client.query(
        "select * from view_materialied_total_by_country"
    );

    // let sql = " select countries.name, sum(occurrences.num_sequences) as total "
    // sql += " from occurrences inner join countries on (countries.id = occurrences.location_id) "
    // sql += " group by countries.name order by countries.name "
    // const result = await client.query(sql);
    return response.json({ data: result.rows })  
})


app.get("/reports/total-by-variant-country", async (request, response) => {
    const result = await client.query(
        "select * from view_materialized_total_by_variants_and_country"
    );

    const resultGroupByCountry = { }

    for(let index = 0; index < result.rows.length; index++) {
        const item = result.rows[index]
        if (!resultGroupByCountry[item.country]) {
            resultGroupByCountry[item.country] = {
                lat: item.lat,
                long: item.long,
                variants: {}
            }
        } 

        resultGroupByCountry[item.country]["variants"][item.variant] = item.total
    }

    // let sql = " select variants.name as variant, countries.name as country, "
    // sql += " sum(occurrences.num_sequences) as total from occurrences "
    // sql += " inner join countries on (countries.id = occurrences.location_id) "
    // sql += " inner join variants on (variants.id = occurrences.variant_id) "
    // sql += " group by countries.name, variants.name order by countries.name "
    // const result = await client.query(sql);
    return response.json({ data: resultGroupByCountry })
})

app.get("/reports/total-by-variant-by-date-country", async (request, response) => {
    const result = await client.query(
        "select * from view_materialized_total_by_variants_by_date_each_countries where country = 'Brazil'"
    );

    // let sql = " select variants.name as variant, occurrences.date, countries.name as country, "
    // sql += " sum(occurrences.num_sequences) as total from occurrences "
    // sql += " inner join countries on (countries.id = occurrences.location_id) "
    // sql += " inner join variants on (variants.id = occurrences.variant_id) "
    // sql += " where countries.name = 'Brazil' "
    // sql += " group by countries.name, variants.name, occurrences.date order by countries.name "
    // const result = await client.query(sql);
    return response.json({ data: result.rows })
})

app.listen(4000, async () => {
    await client.connect()
    console.log(`Server is running`)
})