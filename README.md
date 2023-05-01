# Firebase Data

Descrição do pacote e sua funcionalidade.

## Instalação

Para instalar o pacote, execute o seguinte comando:

## Uso

Para usar o pacote, importe a classe `FirestoreData` e crie uma instância informando a coleção em que serão realizadas as operações:

```js
const FirestoreData = require("firebase-data");
const data = new FirestoreData("minha-colecao");
```
## Métodos Disponíveis
```
add(data: any) // adiciona um novo documento à coleção.

get(query: Query) // busca documentos na coleção de acordo com uma query.

getById(id: string) // busca um documento específico pelo ID.

update(id: string, data: any) //atualiza um documento existente.

delete(id: string) //exclui um documento da coleção.
```
## Interface de Query
A interface Query define o formato de uma query para buscar documentos na coleção. Ela é composta pelos seguintes campos:
```js
interface Query {
  field: string;
  value: string;
}
```

O campo field é o nome do campo que será usado na busca e o campo value é o valor que deve ser buscado.

## Dependências

```json

@google-cloud/firestore: "^6.5.0"
@google-cloud/functions-framework": "^3.2.0"
typescript: "^4.4.4"
ts-node: "^10.4.0"
@types/node: "^16.9.0"
rimraf: "^3.0.2"
```

## Licença
MIT License
