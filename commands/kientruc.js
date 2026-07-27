const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'kientruc',
    description: 'Xử lý sự cố công trình để kiếm Tín dụng',

    async execute(message, args, ctx) {
        const { db } = ctx;
        const userId = message.author.id;

        await db.getOrCreateUser(userId);

        const problems = [
            {
                desc: "Bản vẽ kết cấu cho thấy dầm chính chịu tải vượt giới hạn an toàn, có nguy cơ sập!",
                options: "A. Thép Gia Cường Chịu Lực\nB. Kính Cường Lực Trang Trí\nC. Sơn Chống Thấm",
                answer: "A"
            },
            {
                desc: "Công trình bị thấm nước nghiêm trọng qua tầng hầm sau mùa mưa!",
                options: "A. Hệ Thống Điều Hòa Trung Tâm\nB. Lớp Chống Thấm Bitum\nC. Đèn LED Âm Trần",
                answer: "B"
            }
        ];

        const problem = problems[Math.floor(Math.random() * problems.length)];

        const embed = new EmbedBuilder()
            .setTitle("🚨 SỰ CỐ CÔNG TRÌNH")
            .setColor(0xe74c3c)
            .addFields(
                { name: "Tình trạng", value: problem.desc },
                { name: "Cách xử lý (Gõ A, B hoặc C vào chat)", value: problem.options }
            );

        await message.channel.send({ embeds: [embed] });

        const filter = m => ['A', 'B', 'C'].includes(m.content.toUpperCase()) && m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 });

        collector.on('collect', async m => {
            if (m.content.toUpperCase() === problem.answer) {
                const newCredits = await db.addCredits(userId, 200);
                message.channel.send(`✅ Xử lý chính xác! Công trình an toàn trở lại. Bạn được thưởng 200 Tín dụng (Hiện có: ${newCredits}).`);
            } else {
                message.channel.send("❌ Sai giải pháp rồi! Công trình xuống cấp nghiêm trọng.");
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send(`⌛ <@${userId}> Hết thời gian xử lý sự cố. Công trình đã hư hại!`);
            }
        });
    },
};
