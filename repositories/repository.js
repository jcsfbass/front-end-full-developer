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

	all(callback) {
		this.where({}, callback);
	}

	findOne(id, callback) {
		this.where({'_id': new ObjectId(id)}, docs => callback(docs[0]));
	}

	create(doc, callback) {
		this.connect(collection => {
			collection.insertOne(doc, (err, results) => {
				callback(results.ops[0]);
			});
		});
	}

	update(id, valueToUpdate, callback) {
		this.connect(collection => {
			collection.updateOne({'_id': new ObjectId(id)},
			{$set: valueToUpdate}, (err, results) => {
				callback();
			});
		});
	}
}

module.exports = Repository;
