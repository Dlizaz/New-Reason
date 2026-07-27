// commands/chon.js
// Lệnh !chon — mở bảng chọn (Select Menu) để người chơi đăng ký 1 trong
// 10 ngành nghề cố định. Ngành nghề quyết định pool vật phẩm khi !roll
// và minigame nào sẽ chạy khi !lamviec (xem commands/minigames/engine.js).

const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
} = require('discord.js');
const professions = require('../data/professions');

module.exports = {
    name: 'chon',
    description: 'Chọn ngành nghề cho tài khoản của bạn (chỉ chọn 1 lần đầu).',

    async execute(message, args, ctx) {
        const { db } = ctx;
        const userId = message.author.id;
        const user = await db.getOrCreateUser(userId);

        if (user.profession) {
            const current = professions.find((p) => p.id === user.profession);
            return message.reply(
                `⚠️ Bạn đã đăng ký ngành **${current.emoji} ${current.name}** rồi. ` +
                    `Ngành nghề gắn liền với tài khoản và không thể đổi.`
            );
        }

        const menu = new StringSelectMenuBuilder()
            .setCustomId(`chon-nganh-${userId}`)
            .setPlaceholder('Chọn con đường chuyên môn của bạn...')
            .addOptions(
                professions.map((p) => ({
                    label: p.name,
                    description: p.desc.slice(0, 100),
                    value: p.id,
                    emoji: p.emoji,
                }))
            );

        const row = new ActionRowBuilder().addComponents(menu);

        const embed = new EmbedBuilder()
            .setTitle('🌌 HỆ THỐNG XÁC LẬP QUYỀN CÔNG DÂN MILKY GALAXY')
            .setDescription(
                'Phát hiện thực thể ngoại lai chưa đăng ký.\n' +
                    'Để sinh tồn và nhận nguồn cung ứng năng lượng, hãy chọn cho mình ' +
                    'một con đường chuyên môn độc lập bên dưới.'
            )
            .setColor(0x2ecc71)
            .setFooter({ text: 'Lưu ý: ngành nghề không thể đổi sau khi đã chọn.' });

        const sentMessage = await message.channel.send({
            embeds: [embed],
            components: [row],
        });

        const collector = sentMessage.createMessageComponentCollector({
            filter: (i) => i.user.id === userId,
            time: 60_000,
            max: 1,
        });

        collector.on('collect', async (interaction) => {
            const chosen = professions.find((p) => p.id === interaction.values[0]);
            await db.setProfession(userId, chosen.id);

            const confirmEmbed = new EmbedBuilder()
                .setTitle('✅ ĐĂNG KÝ THÀNH CÔNG')
                .setDescription(
                    `Chào mừng, **${chosen.emoji} ${chosen.name}**!\n${chosen.desc}\n\n` +
                        `Gõ \`!roll\` để nhận vật phẩm đầu tiên của bạn.`
                )
                .setColor(0x3498db);

            await interaction.update({ embeds: [confirmEmbed], components: [] });
        });

        collector.on('end', (collected) => {
            if (collected.size === 0) {
                sentMessage.edit({ components: [] }).catch(() => {});
            }
        });
    },
};
