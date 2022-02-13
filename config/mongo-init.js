const databases = ['acme-explorer'];
const credentials = {
	user     : 'admin',
	password : 'explorer123'
};
const seedCollections = [{
	name : 'trips',
	data : []
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