const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

class Repository {
	constructor(mongoURI) {
		this.mongoURI = mongoURI;
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

module.exports = Repository;