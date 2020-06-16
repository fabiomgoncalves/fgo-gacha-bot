import { Command, CommandMessage, Discord } from '@typeit/discord';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import { Gacha } from '../fgo/gacha';
import { IResponse } from '../fgo/types';

interface CommandArgs {
    stage: string;
    howManyCards: number
}

@Discord('!')
export class DiscordApp {
    @Command('gacha :stage :howManyCards')
    async gacha(command: CommandMessage<CommandArgs>): Promise<void> {
        const { stage, howManyCards } = command.args;
        const gacha = new Gacha();
        const response = await gacha.gacha(stage, howManyCards);

        this.sendResponse(command, response, 'here is your roll:');
    }

    @Command('waifu :stage')
    async waifu(command: CommandMessage<CommandArgs>): Promise<void> {
        const { stage } = command.args;
        const gacha = new Gacha();
        const response = await gacha.waifu(stage);

        this.sendResponse(command, response, 'here is your waifu:');
    }

    async sendResponse(
        command: CommandMessage<CommandArgs>,
        response: IResponse,
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
