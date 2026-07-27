const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'cokhi',
    description: 'Xử lý sự cố cơ khí để kiếm Tín dụng',

    async execute(message, args, ctx) {
        const { db } = ctx;
        const userId = message.author.id;

        await db.getOrCreateUser(userId);

        const problems = [
            {
                desc: "Động cơ rung lắc mạnh và phát tiếng kêu lạ khi chạy tốc độ cao, nghi ngờ mất cân bằng trục quay!",
                options: "A. Vòng Bi (Bạc Đạn) Chống Rung\nB. Dây Curoa Chịu Nhiệt\nC. Cảm Biến Áp Suất",
                answer: "A"
            },
            {
                desc: "Hệ thống thủy lực rò rỉ dầu tại khớp nối, áp suất tụt giảm liên tục!",
                options: "A. Bơm Chân Không\nB. Gioăng Cao Su Chịu Áp\nC. Bánh Răng Hành Tinh",
                answer: "B"
            }
        ];

        const problem = problems[Math.floor(Math.random() * problems.length)];

        const embed = new EmbedBuilder()
            .setTitle("🚨 SỰ CỐ XƯỞNG CƠ KHÍ")
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
                message.channel.send(`✅ Sửa chữa chính xác! Máy chạy êm trở lại. Bạn được thưởng 200 Tín dụng (Hiện có: ${newCredits}).`);
            } else {
                message.channel.send("❌ Sai kỹ thuật rồi! Máy hỏng nặng hơn, xưởng phải tạm dừng sản xuất.");
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send(`⌛ <@${userId}> Hết thời gian xử lý sự cố. Máy móc đã hư hại!`);
            }
        });
    },
};
