# Bot de saldo para loja no Discord

Bot que fiz para a minha loja de Blade Ball Tokens. Ele guarda **quanto cada cliente já gastou** (o "saldo"), mostra um ranking dos 5 maiores clientes e dá cargos automáticos conforme o cliente vai chegando em cada faixa de valor.

> **Sobre como foi feito:** a primeira versão foi escrita com ajuda de IA, a partir do que eu pedi e testei na loja. Depois reorganizei e limpei o código para ficar mais simples de entender e manter.

## O que ele faz

- Soma e remove saldo de clientes, com motivo opcional
- Cargos por faixa de saldo, trocados sozinhos quando o saldo muda
- Cargo de **Top 1** que passa automaticamente para quem lidera o ranking
- Ranking dos 5 maiores clientes e consulta do próprio saldo
- Histórico de todas as transações, com backup automático antes de limpar
- Aviso em um canal de log sempre que o saldo muda

## Comandos

| Comando | Quem usa | O que faz |
| --- | --- | --- |
| `/addsaldo member amount [reason]` | Staff | Adiciona saldo (ex: `22` ou `2,20`) |
| `/removesaldo member amount [reason]` | Staff | Remove saldo (nunca deixa ficar negativo) |
| `/saldo [member]` | Todos | Mostra o saldo seu ou de outra pessoa |
| `/saldoboard` | Todos | Mostra o top 5 |
| `/historico [usuario] [limite]` | Todos (geral só staff) | Mostra transações |
| `/limparhistorico confirmacao` | Staff | Limpa o histórico, guardando um backup |

## Como rodar

Precisa do **Node.js 20.12 ou mais novo** e de um bot criado no [Portal de Desenvolvedores do Discord](https://discord.com/developers/applications) (com a opção *Server Members Intent* ligada).

```bash
npm install
```

1. Copie `.env.example` para `.env` e coloque o token do bot.
2. Copie `config.example.json` para `config.json` e troque os IDs de cargos e do canal de log.
3. Ligue o bot:

```bash
npm start
```

Para rodar os testes: `npm test`.

## Estrutura

```
src/
  index.js          liga o bot
  bot.js            conecta no Discord e registra os comandos
  config.js         lê o config.json
  store.js          guarda saldos e histórico em arquivos (pasta dados/)
  comandos/         um arquivo por comando
  utils/            formatação, regras de saldo, logs e visual
```

## Segurança

O token, o `config.json` e a pasta `dados/` (que tem os saldos dos clientes) ficam só no seu computador ou na hospedagem. Eles estão no `.gitignore` e **não devem ir para o GitHub**.
