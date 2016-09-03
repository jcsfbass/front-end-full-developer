const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

class UsuarioRepository {
	constructor(mongoURI) {
		this.mongoURI = mongoURI;
		this.collectionName = 'usuarios';
	}

	connect(callback) {
		mongoClient.connect(this.mongoURI, (err, db) => {
			callback(db.collection(this.collectionName));
			db.close();
		});
	}

	findOne(id, callback) {
		this.connect(collection => {
			collection.find({'_id': new ObjectId(id)}).toArray((err, docs) => {
				callback(docs[0]);
			});
		});
	}
}

module.exports = UsuarioRepository;