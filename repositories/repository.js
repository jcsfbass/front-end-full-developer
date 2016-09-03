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

	where(query, callback) {
		this.connect(collection => {
			collection.find(query).toArray((err, docs) => callback(docs));
		});
	}

	findOne(id, callback) {
		this.where({'_id': new ObjectId(id)}, docs => callback(docs[0]));
	}
}

module.exports = Repository;