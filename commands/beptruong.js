const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'beptruong',
    description: 'Xử lý sự cố bếp để kiếm Tín dụng',

    async execute(message, args, ctx) {
        const { db } = ctx;
        const userId = message.author.id;

        await db.getOrCreateUser(userId);

        const problems = [
            {
                desc: "Nồi nước dùng bị đục và có vị chua nhẹ bất thường, nghi ngờ nhiệt độ ninh không ổn định!",
                options: "A. Hạ Nhiệt Từ Từ Và Vớt Bọt\nB. Tăng Lửa Lớn Ngay Lập Tức\nC. Thêm Đường Trắng",
                answer: "A"
            },
            {
                desc: "Bột bánh không nở dù đã ủ đúng thời gian, kết cấu bị chai cứng!",
                options: "A. Thêm Muối Gấp Đôi\nB. Kiểm Tra Hạn Men Nở\nC. Chiên Ngập Dầu",
                answer: "B"
            }
        ];

        const problem = problems[Math.floor(Math.random() * problems.length)];

        const embed = new EmbedBuilder()
            .setTitle("🚨 SỰ CỐ GIAN BẾP")
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
                message.channel.send(`✅ Xử lý chính xác! Món ăn ngon trở lại. Bạn được thưởng 200 Tín dụng (Hiện có: ${newCredits}).`);
            } else {
                message.channel.send("❌ Sai phương pháp rồi! Món ăn hỏng, phải bỏ cả nồi.");
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send(`⌛ <@${userId}> Hết thời gian xử lý sự cố. Món ăn đã cháy khét!`);
            }
        });
    },
};
