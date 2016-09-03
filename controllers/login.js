const mongoClient = require('mongodb').MongoClient;

const MONGODB_URI = 'mongodb://localhost:27017/jedi';

const LoginController = {
	login: (req, res) => {
		const email = req.body.email;
		const senha = req.body.senha;

		mongoClient.connect(MONGODB_URI, (err, db) => {
			const usuarios = db.collection('usuarios');
			usuarios.find({
				'email': email,
				'senha': senha
			}).toArray((err, docs) => {
				if (docs.length === 0) {
					res.render('home', {nome: 'Usuário não cadastrado'});	
				} else {
					req.session.user = {id: docs[0]._id};
					res.redirect('/');				
				}

				db.close();
			});
		});
	},
	logout: (req, res) => {
		delete req.session.user;
		res.redirect('/');
	}
};

module.exports = LoginController;