const databases = ['acme-explorer'];
const credentials = {
    user: 'admin',
    password: 'explorer123'
};

const seedCollections = [
    {
        name: 'actors',
        data: () => getActorsData()
    },
    {
        name: 'trips',
        data: (data) => getTripsData(data)
    },
    {
        name: 'sponsorships',
        data: (data) => getSponsorshipData(data)
    },
    {
        name: 'finders',
        data: (data) => getFinderData(data)
    },
    {
        name: 'configurations',
        data: () => [
            {key: 'maxResultsFinder', value: 10},
            {key: 'timeCachedFinder', value: 60 * 60},
            {key: 'sponsorshipFlatRate', value: 0.25}
        ]
    }
];

for (let i = 0; i < databases.length; ++i) {
    db = db.getSiblingDB(databases[i]);
    db.createUser(
        {
            user: credentials.user,
            pwd: credentials.password,
            roles: [
                {
                    role: 'readWrite',
                    db: databases[i]
                }
            ]
        }
    );

    let users = [], trips = [];
    seedCollections.forEach(({name, data}) => {
        db.createCollection(name);

        const $data = data({users, trips});
        const results = db[name].insertMany($data);

        if (name === "actors") {
            users = results.insertedIds.map((r, i) => ({...$data[i], _id: r}));
        } else if (name === "trips") {
            trips = results.insertedIds.map((r, i) => ({...$data[i], _id: r}));
        }

    });
}

function getActorsData() {
    // credentials: abc123
    const explorer = {
        "name": "Explorer",
        "surname": "Surname",
        "email": "explorer@test.com",
        "password": "$2a$06$3CFfe9hvxaM1v.0ypBgTde7p0aJxmobTSTj1lsr91WS1KudoBraxu",
        "phoneNumber": "34954551000",
        "address": "C. San Fernando, 4, 41004 Sevilla",
        "preferredLanguage": "es",
        "role": "explorer",
        "state": "active",
        "createdAt": new Date(),
        "updatedAt": new Date()
    }

    const manager = {
        ...explorer,
        "name": "Manager",
        "email": "manager@test.com",
        "role": "manager"
    };

    const sponsor = {
        ...explorer,
        "name": "Sponsor",
        "email": "sponsor@test.com",
        "role": "sponsor"
    };

    const admin = {
        ...explorer,
        "name": "Admin",
        "email": "admin@test.com",
        "role": "admin"
    };

    return [explorer, manager, sponsor, admin];
}

function getTripsData({users}) {
    const now = new Date();
    const ticker = now.getFullYear().toString().substr(-2)
        + (now.getMonth() + 1).toString().padStart(2, '0') + (now.getDate()).toString().padStart(2, '0');
    const templates = [
        {
            "name": "Valencia",
            "price": 200,
            "ticker": `${ticker}-PPXB`,
            "state": "ACTIVE"
        },
        {
            "name": "Punta Cana",
            "price": 300,
            "ticker": `${ticker}-AAXB`,
            "state": "ACTIVE"
        },
        {
            "name": "Madrid",
            "price": 400,
            "ticker": `${ticker}-DDXB`
        },
        {
            "name": "Barcelona",
            "price": 500,
            "ticker": `${ticker}-CCXB`
        },
    ];
    return templates.map(template => ({
        "ticker": template.ticker,
        "title": `Viaje a ${template.name}`,
        "description": `Este será el mejor viaje de todos los tiempos a ${template.name}.`,
        "price": template.price,
        "requirements": ["Sólo para mayores de 18",],
        "startDate": now,
        "endDate": new Date(now.getTime() + 86400000),
        "pictures": [],
        "state": template.state || "INACTIVE",
        "stages": [
            {
                "_id": new ObjectId(),
                "title": "Parada en el ayuntamiento",
                "description": "Aquí nos pararemos en el ayuntamiento",
                "price": template.price
            }
        ],
        "manager": users.find(u => u.role === "manager")._id
    }));
}

function getSponsorshipData({users, trips}) {
    return [{
        "sponsor": users.find(u => u.role === "sponsor")._id,
        "trip": trips.pop()._id,
        "banner": "https://www.us.es/sites/default/files/logoPNG_3.png",
        "link": "https://www.us.es/",
        "state": "active",
        "createdAt": new Date(),
        "updatedAt": new Date()
    }];
}

function getFinderData({users}) {
    return [{
        "name": "busqueda1",
        "actor": users.find(u => u.role === "explorer")._id,
        "keyword": "valencia",
        "minPrice": 0,
        "maxPrice": 300,
        "startDate": null,
        "endDate": null,
        "createdAt": new Date(),
        "updatedAt": new Date()
    }];
}
