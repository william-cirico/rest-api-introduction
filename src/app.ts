import express from "express";
import cors from "cors";

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
	// Validar se já existe um usuário com aquele e-mail
	// Criptografar a senha
});

export default app;
