import app from "./app";

const PORT = 8080;

app.listen(PORT, () => {
	console.warn(`A API está rodando em: http://localhost:${PORT}`);
});
