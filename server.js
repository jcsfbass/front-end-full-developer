const express = require('express')
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
	res.render('inicial');
});

app.post('/cadastrar', (req, res) => {
	mongoClient.connect('mongodb://localhost:27017/jedi', function(err, db){
		const usuarios = db.collection('usuarios');
		usuarios.insertOne(req.body, function(err, result){
			console.log(result.ops[0]);
			res.send('Cadastrou!');
			db.close();
		});
	});
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});