import { Client, GatewayIntentBits, Partials } from "discord.js";
import { comandos } from "./comandos/index.js";
import { aplicarIdentidade } from "./identidade.js";
import { store } from "./store.js";

const comandoPorNome = new Map(comandos.map((comando) => [comando.data.name, comando]));

// Registra os comandos de barra. Com GUILD_ID eles aparecem na hora; sem, podem demorar.
async function registrarComandos(cliente, servidorId) {
  const corpo = comandos.map((comando) => comando.data.toJSON());
  if (servidorId) {
    const servidor = await cliente.guilds.fetch(servidorId);
    await servidor.commands.set(corpo);
    console.log(`Comandos registrados no servidor ${servidorId}.`);
    return;
  }
  await cliente.application.commands.set(corpo);
  console.log("Comandos registrados globalmente.");
}

async function tratarComando(interaction) {
  if (!interaction.isChatInputCommand()) return;
  const comando = comandoPorNome.get(interaction.commandName);
  if (!comando) return;

  try {
    await comando.executar(interaction);
  } catch (erro) {
    console.error(`Erro ao executar /${interaction.commandName}:`, erro);
    const resposta = { content: "❌ Deu um erro ao executar esse comando.", ephemeral: true };
    if (interaction.deferred || interaction.replied) await interaction.followUp(resposta).catch(() => null);
    else await interaction.reply(resposta).catch(() => null);
  }
}

export async function iniciarBot() {
  const token = process.env.BOT_TOKEN?.trim();
  if (!token) {
    throw new Error("Não achei o BOT_TOKEN. Copie o .env.example para .env e coloque o token do bot.");
  }

  await store.iniciar();

  const cliente = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages],
    partials: [Partials.GuildMember],
  });

  cliente.once("ready", async (pronto) => {
    console.log(`Bot de saldo ${pronto.user.tag} ligado.`);
    console.log(`Usuários com saldo: ${Object.keys(store.saldos).length}`);
    console.log(`Transações no histórico: ${store.historico.length}`);

    await aplicarIdentidade(pronto);
    await registrarComandos(pronto, process.env.GUILD_ID?.trim() || undefined);
  });

  cliente.on("interactionCreate", tratarComando);
  await cliente.login(token);
}
