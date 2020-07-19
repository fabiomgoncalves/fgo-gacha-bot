import { Command, CommandMessage, Discord } from '@typeit/discord';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import { Gacha } from '../fgo/gacha';
import { Result } from '../fgo/types';

interface CommandArgs {
    stage: string;
    cards: number
}

@Discord('!!')
export class DiscordApp {
    @Command('gacha :stage :cards')
    async gacha(command: CommandMessage<CommandArgs>): Promise<void> {
        const { stage, cards } = command.args;
        const user = command.author.id;
        const gacha = new Gacha();
        const response = await gacha.gacha(stage, cards, user);

        this.sendResponse(command, response, 'here is your roll:');
    }

    @Command('waifu :stage')
    async waifu(command: CommandMessage<CommandArgs>): Promise<void> {
        const { stage } = command.args;
        const user = command.author.id;
        const gacha = new Gacha();
        const response = await gacha.waifu(stage, user);

        this.sendResponse(command, response, 'here is your waifu, how lucky!');
    }

    async sendResponse(
        command: CommandMessage<CommandArgs>,
        response: Result,
        content: string,
    ): Promise<void> {
        const attachment = new MessageAttachment(response.image, 'result.png');

        const exampleEmbed = new MessageEmbed()
            .setDescription(response.description)
            .attachFiles([attachment])
            .setImage('attachment://result.png');

        command.reply(content, exampleEmbed);
    }
}
