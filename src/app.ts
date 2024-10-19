import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

const app = express();

// Configurando o CORS
app.use(
	cors({
		origin: ["*"],
	}),
);

// Configurando a leitura dos dados do BODY como JSON
app.use(express.json());

// Inteface do usuário (TypeScript)
interface User {
	id: string;
	name: string;
	email: string;
	password: string;
}

// Banco de dados
const users: User[] = [
	{
		id: "ec79e0af-6cec-4f69-bf4d-540671b48188",
		name: "William Círico",
		email: "william@email.com",
		password: "123456",
	},
];

// Função para remover os dados sensíveis do Usuário
const removeSensitiveDataFromUser = (user: User): Omit<User, "password"> => {
	const { password, ...filteredUser } = user;

	return filteredUser;
};

// Função para verificar se o e-mail é válido
const verifyEmail = (email: string): boolean => {
	// eslint-disable-next-line no-useless-escape
	const emailRegex = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
	return emailRegex.test(email);
};

// Função para criptografar um valor
const hash = (value: string): string => {
	return bcrypt.hashSync(value, 10);
};

// Metodo GET: Rota padrão para verificar se a API está rodando
app.get("/", (_req, res) => {
	res.send("API está rodando...");
});

// Método GET: Rota para obter usuários
app.get("/v1/usuarios", (_req, res) => {
	const filteredUsers = users.map((user) =>
		removeSensitiveDataFromUser(user),
	);

	res.json(filteredUsers);
});

// Método GET: Rota para obter um usuário pelo ID
app.get("/v1/usuarios/:id", (req, res) => {
	const id = req.params.id;

	// Procurando o usúario no BD
	const user = users.find((user) => user.id === id);

	// Verificando se o usuário existe
	if (!user) {
		res.status(404).json({
			message: `O usuário com o ID ${id} não foi encontrado`,
		});

		return;
	}

	// Removendo os dados sensíveis (senha)
	const filteredUser = removeSensitiveDataFromUser(user);

	res.json(filteredUser);
});

// Método POST: Rota para cadastrar um novo usuário
app.post("/v1/usuarios", (req, res) => {
	// Validar que todos os dados necessários foram enviados
	const requiredData = ["name", "email", "password"];
	const notSentData = requiredData.filter((data) => !req.body[data]);

	if (notSentData.length) {
		res.status(400).json({
			message: `Parâmetro(s) faltando: ${notSentData.join(", ")}`,
		});
		return;
	}

	// Validar se o e-mail é válido
	if (!verifyEmail(req.body.email)) {
		res.status(400).json({
			message: "O e-mail precisa ser válido",
		});
		return;
	}

	// Validar se já existe um usuário com aquele e-mail
	const existingUser = users.find((user) => user.email === req.body.email);

	if (existingUser) {
		res.status(409).json({
			message: "Já existe um usuário cadastrado com esse e-mail",
		});
		return;
	}

	// Criptografar a senha
	const encryptedPassword = hash(req.body.password);

	const user: User = {
		id: uuidv4(),
		name: req.body.name,
		email: req.body.email,
		password: encryptedPassword,
	};

	// Criar o registro no BD
	users.push(user);

	res.status(201).json(removeSensitiveDataFromUser(user)); // 201 -> Quando criar um recurso
});

// Método PATCH: Rota para atualizar parcialmente um usuário
app.patch("/v1/usuarios/:id", (req, res) => {
	// Verificar se o usuário existe
	const id = req.params.id;

	const existingUserIndex = users.findIndex((user) => user.id === id);

	if (existingUserIndex === -1) {
		res.status(404).json({
			message: "Usuário não encontrado",
		});
		return;
	}

	// Verificar se o usuário quer atualizar o e-mail
	if (req.body.email) {
		const emailAlreadyRegistered = users.find(
			(user) => user.email === req.body.email,
		);

		if (
			emailAlreadyRegistered &&
			emailAlreadyRegistered.id !== users[existingUserIndex].id
		) {
			res.status(409).json({
				message: "Já existe um usuário cadastrado com esse e-mail",
			});
		}
	}

	let encryptedPassword = users[existingUserIndex].password;
	// Verificar se o usuário quer atualizar a senha
	if (req.body.password) {
		encryptedPassword = hash(req.body.password);
	}

	// Atualizar o registro no BD
	users[existingUserIndex] = {
		...users[existingUserIndex],
		...req.body,
		password: encryptedPassword,
	};

	res.json(removeSensitiveDataFromUser(users[existingUserIndex]));
});

// Método DELETE: Rota para remover um usuário
app.delete("/v1/usuarios/:id", (req, res) => {
	const id = req.params.id;

	const existingUserIndex = users.findIndex((user) => user.id === id);

	if (existingUserIndex === -1) {
		res.status(404).json({
			message: "Usuário não encontrado",
		});
		return;
	}

	// Removendo o usuário do vetor
	users.splice(existingUserIndex, 1);

	res.status(204).end(); // 204 é o retorno padrão para delete
});

export default app;
