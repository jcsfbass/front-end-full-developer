const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
	secret: 'jedi',
	resave: false,
	saveUninitialized: false
}));

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
	if (req.session.user) {
		mongoClient.connect('mongodb://localhost:27017/jedi', (err, db) => {
			const usuarios = db.collection('usuarios');
			usuarios.find({'_id': req.session.user.id}).toArray((err, docs) => {
				console.log(docs);
			});
			/*usuarios.find({'_id': req.session.user.id}, (err, result) => {
				console.log(result);
			});*/
		});
		res.render('home', {id: req.session.user.id});
	} else {
		res.render('cadastro-login');
	}
});

app.post('/cadastrar', (req, res) => {
	mongoClient.connect('mongodb://localhost:27017/jedi', (err, db) => {
		const usuarios = db.collection('usuarios');
		usuarios.insertOne(req.body, (err, result) => {
			db.close();

			req.session.user = {
				id: result.ops[0]._id
			};

			res.redirect('/');
		});
	});
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});