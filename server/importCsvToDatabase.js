const fs = require("fs")
const readline = require('readline');

const { Client } = require('pg')
const client = new Client({
    user: "postgres",
    database: "crud",
    password: "postgres",
    port: "5433",
    host: "localhost"
});

const readStream = fs.createReadStream('./covid-variants.csv');
const rl = readline.createInterface({
    input: readStream
});

const keys = [
    "location", "date", "variant", "num_sequences",
    "perc_sequences", "num_sequences_total"
]
const data = []

rl.on('line', function (line) {
    const itens = line.split(",")
    data.push({
        [keys[0]]: itens[0],
        [keys[1]]: itens[1],
        [keys[2]]: itens[2],
        [keys[3]]: itens[3],
        [keys[4]]: itens[4],
        [keys[5]]: itens[5],
    })
});

const readStream = fs.createReadStream("./covid-variants.csv");
const data = []

readStream.on("line", (chunk) => {
    const lines = (chunk.toString().split("\n"))
    for (let index = 0; index < lines.length; index++) {
        const itens = lines[index].split(",")
        data.push({
            [keys[0]]: itens[0],
            [keys[1]]: itens[1],
            [keys[2]]: itens[2],
            [keys[3]]: itens[3],
            [keys[4]]: itens[4],
            [keys[5]]: itens[5],
        })
    }
})

readStream.on("end", () => {
    readStream.close()
    console.log("Parse csv to json finished.")
    // groupByCountry(data)
    // getVarientsAndCountries(data)
})

const groupCountry = [];

function groupByCountry(data) {
    for (let index = 1; index < data.length; index++) {
        const item = (data[index])
        groupCountry.push(item);
    }

    client.connect()
        .then(async () => {
            let result = (await client.query('SELECT * FROM variants'))
            const mapVariants = {}
            result.rows.map(item => {
                mapVariants[item.name] = item.id;
            })
            result = (await client.query('SELECT * FROM countries'))
            const mapCountries = {}
            result.rows.map(item => {
                mapCountries[item.name] = item.id;
            })

            for (let index = 0; index < groupCountry.length; index++) {
                const item = (groupCountry[index])
                item.location_id = mapCountries[item.location] || 1;
                delete item.location;
                item.variant_id = mapVariants[item.variant] || 1;
                delete item.variant;
                let sql = " INSERT INTO occurrences(location_id, variant_id, \"date\", num_sequences, ";
                sql += " perc_sequences, num_sequences_total) VALUES($1, $2, $3, $4, $5, $6)"
                await client.query(sql, [
                    item.location_id, item.variant_id,
                    item.date, item.num_sequences, item.perc_sequences,
                    item.num_sequences_total
                ])
            }
            await client.end()
            console.log("INSERTED OCCURRENCES")
        })
}

const varients = {};
const countries = {}

function getVarientsAndCountries(data) {
    for (let index = 1; index < data.length; index++) {
        const item = (data[index])
        if (!varients[item.variant]) {
            varients[item.variant] = 1;
        }

        if (!countries[item.location]) {
            countries[item.location] = 1;
        }
    }
    client.connect()
        .then(async () => {
            await Promise.all(
                Object.keys(varients).map(name => {
                    return client.query('INSERT INTO variants(name) VALUES($1)', [name])
                })
            )
            await client.end()
            console.log("INSERTED VARIANTS")
        })
    client.connect()
        .then(async () => {
            await Promise.all(
                Object.keys(countries).map(name => {
                    return client.query('INSERT INTO countries(name) VALUES($1)', [name])
                })
            )
            await client.end()
            console.log("INSERTED COUNTRIES")
        })
}
