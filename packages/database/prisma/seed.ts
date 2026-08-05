import { PrismaClient, BotRuntime, BotLibrary, BotStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { discordId: 'admin_seed' },
    update: {},
    create: {
      discordId: 'admin_seed',
      username: 'Admin',
      discriminator: '0000',
      email: 'admin@bothosting.com',
      accessToken: 'seed_token',
      refreshToken: 'seed_refresh',
      tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isAdmin: true,
      maxBots: 100,
    },
  });
  console.log('Created admin user:', admin.id);

  // Create templates
  const discordjsTemplate = await prisma.template.upsert({
    where: { id: 'discordjs-starter' },
    update: {},
    create: {
      id: 'discordjs-starter',
      name: 'Discord.js Starter',
      description: 'A starter template for Discord.js v14 bots',
      runtime: BotRuntime.NODEJS,
      library: BotLibrary.DISCORDJS,
      version: '14.14.0',
      dockerImage: 'node:20-alpine',
      buildCommand: 'npm install',
      startCommand: 'node index.js',
      files: {
        'package.json': JSON.stringify({
          name: 'discord-bot',
          version: '1.0.0',
          description: 'Discord.js bot',
          main: 'index.js',
          scripts: {
            start: 'node index.js',
          },
          dependencies: {
            'discord.js': '^14.14.0',
          },
        }, null, 2),
        'index.js': `const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(\`Logged in as \${client.user.tag}!\`);
});

client.on('messageCreate', async (message) => {
  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
});

client.login(process.env.DISCORD_TOKEN);`,
        '.env.example': 'DISCORD_TOKEN=your_bot_token_here',
      },
      envVariables: {
        DISCORD_TOKEN: {
          required: true,
          description: 'Your Discord bot token',
          secret: true,
        },
      },
      isPublic: true,
      createdBy: admin.id,
    },
  });
  console.log('Created Discord.js template:', discordjsTemplate.id);

  const discordpyTemplate = await prisma.template.upsert({
    where: { id: 'discordpy-starter' },
    update: {},
    create: {
      id: 'discordpy-starter',
      name: 'discord.py Starter',
      description: 'A starter template for discord.py bots',
      runtime: BotRuntime.PYTHON,
      library: BotLibrary.DISCORDPY,
      version: '2.3.0',
      dockerImage: 'python:3.12-slim',
      buildCommand: 'pip install -r requirements.txt',
      startCommand: 'python bot.py',
      files: {
        'requirements.txt': 'discord.py==2.3.0',
        'bot.py': `import discord
from discord.ext import commands

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    print(f'Logged in as {bot.user}')

@bot.command()
async def ping(ctx):
    await ctx.reply('Pong!')

bot.run(os.getenv('DISCORD_TOKEN'))`,
        '.env.example': 'DISCORD_TOKEN=your_bot_token_here',
      },
      envVariables: {
        DISCORD_TOKEN: {
          required: true,
          description: 'Your Discord bot token',
          secret: true,
        },
      },
      isPublic: true,
      createdBy: admin.id,
    },
  });
  console.log('Created discord.py template:', discordpyTemplate.id);

  const pycordTemplate = await prisma.template.upsert({
    where: { id: 'pycord-starter' },
    update: {},
    create: {
      id: 'pycord-starter',
      name: 'Pycord Starter',
      description: 'A starter template for Pycord bots',
      runtime: BotRuntime.PYTHON,
      library: BotLibrary.PYCORD,
      version: '2.4.0',
      dockerImage: 'python:3.12-slim',
      buildCommand: 'pip install -r requirements.txt',
      startCommand: 'python bot.py',
      files: {
        'requirements.txt': 'py-cord==2.4.0',
        'bot.py': `import discord
from discord.ext import commands

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    print(f'Logged in as {bot.user}')

@bot.command()
async def ping(ctx):
    await ctx.reply('Pong!')

bot.run(os.getenv('DISCORD_TOKEN'))`,
        '.env.example': 'DISCORD_TOKEN=your_bot_token_here',
      },
      envVariables: {
        DISCORD_TOKEN: {
          required: true,
          description: 'Your Discord bot token',
          secret: true,
        },
      },
      isPublic: true,
      createdBy: admin.id,
    },
  });
  console.log('Created Pycord template:', pycordTemplate.id);

  const jdaTemplate = await prisma.template.upsert({
    where: { id: 'jda-starter' },
    update: {},
    create: {
      id: 'jda-starter',
      name: 'JDA Starter',
      description: 'A starter template for JDA (Java) bots',
      runtime: BotRuntime.JAVA,
      library: BotLibrary.JDA,
      version: '5.0.0',
      dockerImage: 'eclipse-temurin:21-jdk-alpine',
      buildCommand: 'mvn package',
      startCommand: 'java -jar target/bot.jar',
      files: {
        'pom.xml': `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>bot</artifactId>
    <version>1.0.0</version>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>net.dv8tion</groupId>
            <artifactId>JDA</artifactId>
            <version>5.0.0</version>
        </dependency>
    </dependencies>
</project>`,
        'src/main/java/com/example/bot/Bot.java': `package com.example.bot;

import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;

public class Bot extends ListenerAdapter {
    public static void main(String[] args) throws Exception {
        JDA jda = JDABuilder.createDefault(System.getenv("DISCORD_TOKEN"))
            .addEventListeners(new Bot())
            .build();
    }

    @Override
    public void onMessageReceived(MessageReceivedEvent event) {
        if (event.getMessage().getContentRaw().equals("!ping")) {
            event.getMessage().reply("Pong!").queue();
        }
    }
}`,
        '.env.example': 'DISCORD_TOKEN=your_bot_token_here',
      },
      envVariables: {
        DISCORD_TOKEN: {
          required: true,
          description: 'Your Discord bot token',
          secret: true,
        },
      },
      isPublic: true,
      createdBy: admin.id,
    },
  });
  console.log('Created JDA template:', jdaTemplate.id);

  const goTemplate = await prisma.template.upsert({
    where: { id: 'go-starter' },
    update: {},
    create: {
      id: 'go-starter',
      name: 'Go Discord Bot Starter',
      description: 'A starter template for Go Discord bots using DiscordGo',
      runtime: BotRuntime.GO,
      library: BotLibrary.BLANK,
      version: '1.0.0',
      dockerImage: 'golang:1.22-alpine',
      buildCommand: 'go mod tidy && go build -o bot',
      startCommand: './bot',
      files: {
        'go.mod': `module bot

go 1.22

require github.com/bwmarrin/discordgo v0.28.0`,
        'main.go': `package main

import (
    "fmt"
    "os"
    "github.com/bwmarrin/discordgo"
)

func main() {
    token := os.Getenv("DISCORD_TOKEN")
    dg, err := discordgo.New("Bot " + token)
    if err != nil {
        fmt.Println("Error creating Discord session:", err)
        return
    }

    dg.AddHandler(messageCreate)
    dg.Identify.Intents = discordgo.IntentsGuildMessages

    err = dg.Open()
    if err != nil {
        fmt.Println("Error opening connection:", err)
        return
    }

    fmt.Println("Bot is running")
    select {}
}

func messageCreate(s *discordgo.Session, m *discordgo.MessageCreate) {
    if m.Content == "!ping" {
        s.ChannelMessageSend(m.ChannelID, "Pong!")
    }
}`,
        '.env.example': 'DISCORD_TOKEN=your_bot_token_here',
      },
      envVariables: {
        DISCORD_TOKEN: {
          required: true,
          description: 'Your Discord bot token',
          secret: true,
        },
      },
      isPublic: true,
      createdBy: admin.id,
    },
  });
  console.log('Created Go template:', goTemplate.id);

  const rustTemplate = await prisma.template.upsert({
    where: { id: 'rust-starter' },
    update: {},
    create: {
      id: 'rust-starter',
      name: 'Rust Discord Bot Starter',
      description: 'A starter template for Rust Discord bots using Serenity',
      runtime: BotRuntime.RUST,
      library: BotLibrary.SERENITY,
      version: '0.12.0',
      dockerImage: 'rust:1.80-alpine',
      buildCommand: 'cargo build --release',
      startCommand: './target/release/bot',
      files: {
        'Cargo.toml': `[package]
name = "bot"
version = "0.1.0"
edition = "2021"

[dependencies]
serenity = "0.12"
tokio = { version = "1.0", features = ["macros", "rt-multi-thread"] }`,
        'src/main.rs': `use serenity::async_trait;
use serenity::model::channel::Message;
use serenity::prelude::*;

struct Handler;

#[async_trait]
impl EventHandler for Handler {
    async fn message(&self, ctx: Context, msg: Message) {
        if msg.content == "!ping" {
            msg.reply(ctx, "Pong!").await.unwrap();
        }
    }
}

#[tokio::main]
async fn main() {
    let token = std::env::var("DISCORD_TOKEN").expect("Expected a token in the environment");
    let intents = GatewayIntents::GUILD_MESSAGES | GatewayIntents::MESSAGE_CONTENT;
    let mut client = Client::builder(&token, intents)
        .event_handler(Handler)
        .await
        .expect("Error creating client");

    if let Err(why) = client.start().await {
        println!("Client error: {:?}", why);
    }
}`,
        '.env.example': 'DISCORD_TOKEN=your_bot_token_here',
      },
      envVariables: {
        DISCORD_TOKEN: {
          required: true,
          description: 'Your Discord bot token',
          secret: true,
        },
      },
      isPublic: true,
      createdBy: admin.id,
    },
  });
  console.log('Created Rust template:', rustTemplate.id);

  const blankNodejsTemplate = await prisma.template.upsert({
    where: { id: 'blank-nodejs' },
    update: {},
    create: {
      id: 'blank-nodejs',
      name: 'Blank Node.js Project',
      description: 'A blank Node.js project for custom bots',
      runtime: BotRuntime.NODEJS,
      library: BotLibrary.BLANK,
      version: '20.0.0',
      dockerImage: 'node:20-alpine',
      buildCommand: 'npm install',
      startCommand: 'node index.js',
      files: {
        'package.json': JSON.stringify({
          name: 'custom-bot',
          version: '1.0.0',
          description: 'Custom Discord bot',
          main: 'index.js',
          scripts: {
            start: 'node index.js',
          },
          dependencies: {},
        }, null, 2),
        'index.js': '// Your bot code here\nconsole.log("Bot starting...");',
        '.env.example': '# Add your environment variables here',
      },
      envVariables: {},
      isPublic: true,
      createdBy: admin.id,
    },
  });
  console.log('Created blank Node.js template:', blankNodejsTemplate.id);

  const blankPythonTemplate = await prisma.template.upsert({
    where: { id: 'blank-python' },
    update: {},
    create: {
      id: 'blank-python',
      name: 'Blank Python Project',
      description: 'A blank Python project for custom bots',
      runtime: BotRuntime.PYTHON,
      library: BotLibrary.BLANK,
      version: '3.12.0',
      dockerImage: 'python:3.12-slim',
      buildCommand: 'pip install -r requirements.txt',
      startCommand: 'python bot.py',
      files: {
        'requirements.txt': '# Add your dependencies here',
        'bot.py': '# Your bot code here\nprint("Bot starting...")',
        '.env.example': '# Add your environment variables here',
      },
      envVariables: {},
      isPublic: true,
      createdBy: admin.id,
    },
  });
  console.log('Created blank Python template:', blankPythonTemplate.id);

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
