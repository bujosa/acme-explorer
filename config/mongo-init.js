const databases = ['acme-explorer'];
const credentials = {
	user     : 'admin',
	password : 'explorer123'
};
const seedCollections = [{
	name : 'trips',
	data : []
}, {
    name: 'configurations',
    data: [
        {key: 'maxResultsFinder', value: 10},
        {key: 'timeCachedFinder', value: 60 * 60},
        {key: 'sponsorshipFlatRate', value: 0.25}
    ]
}];

for (let i = 0; i < databases.length; ++i) {
	db = db.getSiblingDB(databases[i]);
	db.createUser(
		{
			user  : credentials.user,
			pwd   : credentials.password,
			roles : [
				{
					role : 'readWrite',
					db   : databases[i]
				}
			]
		}
	);

	seedCollections.forEach(({ name, data }) => {
		db.createCollection(name);
		db[name].insertMany(data);
	});
}