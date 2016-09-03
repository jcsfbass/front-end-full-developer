const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

const MONGODB_URI = 'mongodb://localhost:27017/jedi';

const HomeController = {
	home: (req, res) => {
		if (req.session.user) {
			mongoClient.connect(MONGODB_URI, (err, db) => {
				const usuarios = db.collection('usuarios');
				usuarios.find({'_id': new ObjectId(req.session.user.id)}).toArray((err, docs) => {
					db.close();
					res.render('home', {
						nome: docs[0].nome,
						imagem: `images/profile/${docs[0]._id}.jpg`
					});
				});
			});
		} else res.render('cadastro-login');
	}
};

module.exports = HomeController;