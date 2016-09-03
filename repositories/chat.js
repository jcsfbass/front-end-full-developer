const Repository = require('./repository');
const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId;

class ChatRepository extends Repository {
	constructor(mongoURI) {
		super(mongoURI);
		this.collectionName = 'chats';
	}

	all(callback) {
		this.where({}, callback);
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

module.exports = ChatRepository;