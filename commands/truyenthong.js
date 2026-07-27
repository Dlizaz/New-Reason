const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'truyenthong',
    description: 'Xử lý sự cố truyền thông để kiếm Tín dụng',

    async execute(message, args, ctx) {
        const { db } = ctx;
        const userId = message.author.id;

        await db.getOrCreateUser(userId);

        const problems = [
            {
                desc: "Bài đăng quảng bá bị phản ứng tiêu cực dữ dội trên mạng xã hội, có nguy cơ khủng hoảng truyền thông!",
                options: "A. Ra Thông Cáo Xin Lỗi Kịp Thời Và Minh Bạch\nB. Xóa Hết Bình Luận Tiêu Cực\nC. Im Lặng Chờ Qua Chuyện",
                answer: "A"
            },
            {
                desc: "Chiến dịch quảng cáo có tỷ lệ tương tác rất thấp dù đã chi ngân sách lớn!",
                options: "A. Tối Ưu Lại Nội Dung Và Đối Tượng Mục Tiêu\nB. Tăng Gấp Đôi Ngân Sách Ngay\nC. Đổi Toàn Bộ Logo Thương Hiệu",
                answer: "A"
            }
        ];

        const problem = problems[Math.floor(Math.random() * problems.length)];

        const embed = new EmbedBuilder()
            .setTitle("🚨 SỰ CỐ PHÒNG TRUYỀN THÔNG")
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
                message.channel.send(`✅ Xử lý chính xác! Hình ảnh thương hiệu ổn định trở lại. Bạn được thưởng 200 Tín dụng (Hiện có: ${newCredits}).`);
            } else {
                message.channel.send("❌ Sai phương án rồi! Khủng hoảng lan rộng, uy tín thương hiệu sụt giảm.");
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send(`⌛ <@${userId}> Hết thời gian xử lý sự cố. Khủng hoảng đã bùng phát!`);
            }
        });
    },
};
