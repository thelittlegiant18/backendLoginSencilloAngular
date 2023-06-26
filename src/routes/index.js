const { Router } = require('express');
const router = Router();
const bcrypt = require('bcrypt');
const User = require('../models/users');
const jwt = require('jsonwebtoken');

router.get('/', (req, res) => res.send('Hello World'))

router.post('/signup', async (req, res) => {
	const { email, password } = req.body;

	try {
		// Generar un hash de la contraseña utilizando bcrypt
		const hashedPassword = await bcrypt.hash(password, 10);

		// Crear una nueva instancia del modelo de usuario con el correo electrónico y la contraseña cifrada
		const newUser = new User({ email, password: hashedPassword });

		// Guardar el nuevo usuario en la base de datos
		await newUser.save();

		const token = jwt.sign({ _id: newUser._id }, 'secretKey');

		console.log(newUser);

		res.status(200).json({ status: true, token, message: 'Token generado correctamente' });
	} catch (error) {
		// Manejo de errores en caso de que ocurra una excepción
		console.error(error);
		res.status(500).json({ error: 'Error al crear el usuario' });
	}
})

router.post('/signin', async (req, res) => {
	const { email, password } = req.body;

	try {
		// Buscar al usuario por su correo electrónico en la base de datos
		const user = await User.findOne({ email });

		// Verificar si el usuario existe
		if (!user) {
			return res.status(401).send("El correo no existe");
		}

		// Comparar la contraseña proporcionada con el hash almacenado en la base de datos utilizando bcrypt
		const passwordMatch = await bcrypt.compare(password, user.password);

		// Verificar si la contraseña es correcta
		if (!passwordMatch) {
			return res.status(401).send("Contraseña incorrecta");
		}

		const token = jwt.sign({ _id: user._id }, 'secretKey');

		return res.status(200).json({ token, success: true, message: "Logueado correctamente" });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error en el inicio de sesión' });
	}
})

router.get('/tasks', (req, res) => {
	res.json([
		{
			_id: 1,
			name: "Task One",
			description: "Esta es la descripción de la tarea 1"
		},
		{
			_id: 2,
			name: "Task Two",
			description: "Esta es la descripción de la tarea 2"
		},
		{
			_id: 3,
			name: "Task Three",
			description: "Esta es la descripción de la tarea 3"
		}
	])
})

router.get('/private-tasks', verifyToken, (req, res) => {
	res.json([
		{
			_id: 1,
			name: "Task One",
			description: "Esta es la descripción de la tarea 1"
		},
		{
			_id: 2,
			name: "Task Two",
			description: "Esta es la descripción de la tarea 2"
		},
		{
			_id: 3,
			name: "Task Three",
			description: "Esta es la descripción de la tarea 3"
		}
	])
})

router.get('/profile', verifyToken, (req, res) => {
	res.send(req.userId)
})
module.exports = router

function verifyToken(req, res, next) {
	if (!req.headers.authorization) {
		return res.status(401).send("No se encuentra autorizado")
	}

	const token = req.headers.authorization.split(' ')[1]
	if (token === 'null') {
		return res.status(401).send("No se encuentra autorizado")
	}

	const payload = jwt.verify(token, 'secretKey')
	req.userId = payload._id
	next()
	console.log(payload)
}