const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'yte',
    description: 'Xử lý sự cố y tế để kiếm Tín dụng',

    async execute(message, args, ctx) {
        const { db } = ctx;
        const userId = message.author.id;

        await db.getOrCreateUser(userId);

        const problems = [
            {
                desc: "Bệnh nhân nhập viện sốt cao đột ngột kèm phát ban, nghi ngờ sốc phản vệ!",
                options: "A. Tiêm Adrenaline Khẩn Cấp\nB. Cho Uống Vitamin C\nC. Chườm Nóng Toàn Thân",
                answer: "A"
            },
            {
                desc: "Kết quả xét nghiệm máu cho thấy đường huyết tăng bất thường ở bệnh nhân tiểu đường!",
                options: "A. Ngưng Toàn Bộ Thuốc Đang Dùng\nB. Điều Chỉnh Liều Insulin Theo Phác Đồ\nC. Tăng Khẩu Phần Đường",
                answer: "B"
            }
        ];

        const problem = problems[Math.floor(Math.random() * problems.length)];

        const embed = new EmbedBuilder()
            .setTitle("🚨 SỰ CỐ PHÒNG CẤP CỨU")
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
                message.channel.send(`✅ Xử lý chính xác! Bệnh nhân qua cơn nguy kịch. Bạn được thưởng 200 Tín dụng (Hiện có: ${newCredits}).`);
            } else {
                message.channel.send("❌ Sai phác đồ rồi! Tình trạng bệnh nhân xấu đi nhanh chóng.");
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send(`⌛ <@${userId}> Hết thời gian xử lý sự cố. Bệnh nhân đã chuyển biến xấu!`);
            }
        });
    },
};
