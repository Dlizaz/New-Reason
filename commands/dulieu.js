const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'dulieu',
    description: 'Xử lý sự cố dữ liệu để kiếm Tín dụng',

    async execute(message, args, ctx) {
        const { db } = ctx;
        const userId = message.author.id;

        await db.getOrCreateUser(userId);

        const problems = [
            {
                desc: "Tập dữ liệu huấn luyện bị lệch nghiêm trọng (skewed), mô hình dự đoán sai lệch một chiều!",
                options: "A. Kỹ Thuật Cân Bằng Mẫu (Resampling)\nB. Chuẩn Hóa Learning Rate\nC. Bộ Lọc Kalman",
                answer: "A"
            },
            {
                desc: "Cơ sở dữ liệu xuất hiện hàng loạt bản ghi trùng lặp làm sai kết quả thống kê!",
                options: "A. Chỉ Mục B-Tree\nB. Câu Lệnh Khử Trùng (Deduplication)\nC. Giao Thức Mã Hóa AES",
                answer: "B"
            }
        ];

        const problem = problems[Math.floor(Math.random() * problems.length)];

        const embed = new EmbedBuilder()
            .setTitle("🚨 SỰ CỐ TRUNG TÂM DỮ LIỆU")
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
                message.channel.send(`✅ Xử lý chính xác! Mô hình chạy chuẩn trở lại. Bạn được thưởng 200 Tín dụng (Hiện có: ${newCredits}).`);
            } else {
                message.channel.send("❌ Sai phương pháp rồi! Dữ liệu bị hỏng, báo cáo phải làm lại từ đầu.");
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send(`⌛ <@${userId}> Hết thời gian xử lý sự cố. Dữ liệu đã bị lỗi!`);
            }
        });
    },
};
