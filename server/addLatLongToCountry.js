const data = require("./country-lat-long.json")
const { Client } = require('pg')
const client = new Client({
    user: "postgres",
    database: "crud",
    password: "postgres",
    port: "5433",
    host: "localhost"
});

const mapLatLong = {};
data.data.map(item => {
    mapLatLong[item[0].toLowerCase()] = {
        lat: item[1],
        long: item[2]
    }
})

client.connect()
    .then(async () => {
        let result = (await client.query('SELECT * FROM countries'))
        const mapCountries = {}
        result.rows.map(item => {
            mapCountries[item.name] = item.id;
        })

        await Promise.all(
            Object.keys(mapCountries)
                .map(country => {
                    const data = mapLatLong[country.toLowerCase()]
                    const id = (mapCountries[country])
                    if (!id || !data) {
                        return;
                    }

                    const sql = "UPDATE countries SET lat = $1, long = $2 WHERE id = $3"
                    return client.query(sql, [data.lat, data.long, id])
                })
        )
        await client.end()
    })
