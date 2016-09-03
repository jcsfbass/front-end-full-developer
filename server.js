const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const multiparty = require('connect-multiparty');
const session = require('express-session');
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

const HomeController = require('./controllers/home');

const MONGODB_URI = 'mongodb://localhost:27017/jedi';

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
	secret: 'jedi',
	resave: false,
	saveUninitialized: false
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
	HomeController.home(req, res);
});

app.post('/login', (req, res) => {
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
});

app.get('/logout', (req, res) => {
	delete req.session.user;
	res.redirect('/');
});

app.post('/cadastrar', multiparty(), (req, res) => {
	mongoClient.connect(MONGODB_URI, (err, db) => {
		const usuarios = db.collection('usuarios');

		const usuario = req.body;
		usuario.posts = [];

		usuarios.insertOne(usuario, (err, result) => {
			db.close();

			req.session.user = {id: result.ops[0]._id};

			fs.readFile(req.files.foto.path, (err, data) => {
				fs.writeFile(path.join(__dirname, `public/images/profile/${req.session.user.id}.jpg`), data);
			});

			res.redirect('/');
		});
	});
});

app.post('/postagens', (req, res) => {
	mongoClient.connect(MONGODB_URI, (err, db) => {
		const usuarios = db.collection('usuarios');
		usuarios.find({'_id': new ObjectId(req.session.user.id)}).toArray((err, docs) => {
			const posts = docs[0].posts;
			const post = {
				texto: req.body.texto,
				data: new Date()
			};

			posts.unshift(post);

			usuarios.updateOne({'_id': new ObjectId(docs[0]._id)},
			{$set: {'posts': posts}}, (err, results) => {
				db.close();

				res.json(post);
			});
		});
	});
});

app.get('/postagens', (req, res) => {
	if (req.session.user) {
		mongoClient.connect(MONGODB_URI, (err, db) => {
			const usuarios = db.collection('usuarios');
			usuarios.find({'_id': new ObjectId(req.session.user.id)}).toArray((err, docs) => {
				db.close();

				res.json(docs[0].posts);
			});
		});
	} else {
		res.json([]);
	}
});

app.get('/pessoas', (req, res) => {
	if (req.session.user) {
		mongoClient.connect(MONGODB_URI, (err, db) => {
			const usuarios = db.collection('usuarios');
			usuarios.find({}).toArray((err, docs) => {
				db.close();

				const user = docs.find(doc => {
					return doc._id == req.session.user.id;
				});

				let amigos = user.amigos;
				if (!amigos) amigos = [];

				const known = amigos.concat(req.session.user.id);

				const nonKnown = [];
				docs.forEach(doc => {
					const some = known.some(user => {
						return doc._id == user;
					});

					if (!some) nonKnown.push(doc);
				});

				res.json(nonKnown);
			});
		});
	} else {
		res.json([]);
	}
});

app.get('/solicitar/:id', function(req, res) {
	if (req.session.user) {
		mongoClient.connect(MONGODB_URI, (err, db) => {
			const usuarios = db.collection('usuarios');
			usuarios.find({'_id': new ObjectId(req.params.id)}).toArray((err, docs) => {
				let solicitacoes = docs[0].solicitacoes;
				if (!solicitacoes) solicitacoes = []; 
				solicitacoes.push(req.session.user.id);

				usuarios.updateOne({'_id': new ObjectId(docs[0]._id)},
				{$set: {'solicitacoes': solicitacoes}}, (err, results) => {
					db.close();

					res.json(solicitacoes);
				});
			});
		});	
	} else {
		res.json([]);
	}
});

app.get('/solicitacoes', function(req, res) {
	if (req.session.user) {
		mongoClient.connect(MONGODB_URI, (err, db) => {
			const usuarios = db.collection('usuarios');
			usuarios.find({'_id': new ObjectId(req.session.user.id)}).toArray((err, docs) => {
				let solicitacoes = docs[0].solicitacoes;

				if (!solicitacoes) solicitacoes = [];

				if (solicitacoes.length === 0) {
					res.json([]);
					return;
				}

				const query = solicitacoes.map(solicitacao => {
					return {'_id': new ObjectId(solicitacao)};
				});

				usuarios.find(
					{ $or: query }
				).toArray((err, docs) => {
					res.json(docs);
				});

			});
		});
	} else {
		res.json([]);
	}
});

app.get('/amigos', function(req, res) {
	if (req.session.user) {
		mongoClient.connect(MONGODB_URI, (err, db) => {
			const usuarios = db.collection('usuarios');
			usuarios.find({'_id': new ObjectId(req.session.user.id)}).toArray((err, docs) => {
				let amigos = docs[0].amigos;

				if (!amigos) amigos = [];

				if (amigos.length === 0) {
					res.json([]);
					return;
				}

				const query = amigos.map(amigo => {
					return {'_id': new ObjectId(amigo)};
				});

				usuarios.find(
					{ $or: query }
				).toArray((err, docs) => {
					res.json(docs);
				});

			});
		});
	} else {
		res.json([]);
	}
});

app.get('/aceitar/:id', (req, res) => {
	if (req.session.user) {
		mongoClient.connect(MONGODB_URI, (err, db) => {
			const usuarios = db.collection('usuarios');
			usuarios.find({'_id': new ObjectId(req.session.user.id)}).toArray((err, docs) => {
				let solicitacoes = docs[0].solicitacoes;
				let amigos = docs[0].amigos;
				if (!solicitacoes) solicitacoes = [];
				if (!amigos) amigos = [];

				let index = solicitacoes.indexOf(req.params.id);
				solicitacoes.splice(index, 1);

				amigos.push(req.params.id);

				let valueToUpdate = {'solicitacoes': solicitacoes, 'amigos': amigos};

				usuarios.updateOne({'_id': new ObjectId(docs[0]._id)},
				{$set: valueToUpdate}, (err, results) => {

					usuarios.find({'_id': new ObjectId(req.params.id)}).toArray((err, docs) => {
						let solicitacoes = docs[0].solicitacoes;
						let amigos = docs[0].amigos;
						if (!solicitacoes) solicitacoes = [];
						if (!amigos) amigos = [];

						let index = solicitacoes.indexOf(req.params.id);
						if (index != -1) solicitacoes.splice(index, 1);

						amigos.push(req.session.user.id);

						let valueToUpdate = {'solicitacoes': solicitacoes, 'amigos': amigos};

						usuarios.updateOne({'_id': new ObjectId(req.params.id)},
						{$set: valueToUpdate}, (err, results) => {
							res.json(valueToUpdate);
							db.close();
						});
					});
				});				
			});	
		});
	} else {
		res.json({});
	}
});

app.listen(3000, () => console.log('Aplicação escutando na porta 3000!'));