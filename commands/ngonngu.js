const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ngonngu',
    description: 'Xử lý sự cố biên phiên dịch để kiếm Tín dụng',

    async execute(message, args, userData) {
        const userId = message.author.id;

        if (!userData.has(userId)) {
            userData.set(userId, { credits: 1000, inventory: {}, pity: 0 });
        }

        const user = userData.get(userId);

        const problems = [
            {
                desc: "Bản dịch tài liệu kỹ thuật bị sai ngữ cảnh, ý nghĩa câu hoàn toàn lệch lạc!",
                options: "A. Từ Điển Chuyên Ngành Đối Chiếu\nB. Bộ Gõ Tiếng Việt Telex\nC. Phông Chữ Unicode",
                answer: "A"
            },
            {
                desc: "Bài thuyết trình song ngữ bị lỗi phông chữ, dấu tiếng Việt hiển thị thành ô vuông!",
                options: "A. Ngữ Pháp Đảo Ngữ\nB. Cài Bảng Mã Unicode UTF-8\nC. Tăng Tốc Độ Đọc",
                answer: "B"
            }
        ];

        const problem = problems[Math.floor(Math.random() * problems.length)];

        const embed = new EmbedBuilder()
            .setTitle("🚨 SỰ CỐ PHÒNG BIÊN DỊCH")
            .setColor(0xe74c3c)
            .addFields(
                { name: "Tình trạng", value: problem.desc },
                { name: "Cách xử lý (Gõ A, B hoặc C vào chat)", value: problem.options }
            );

        await message.channel.send({ embeds: [embed] });

        const filter = m => ['A', 'B', 'C'].includes(m.content.toUpperCase()) && m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 });

        collector.on('collect', m => {
            if (m.content.toUpperCase() === problem.answer) {
                user.credits += 200;
                message.channel.send(`✅ Xử lý chính xác! Bản dịch chuẩn trở lại. Bạn được thưởng 200 Tín dụng (Hiện có: ${user.credits}).`);
            } else {
                message.channel.send("❌ Sai phương án rồi! Khách hàng phản hồi bản dịch không đạt.");
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send(`⌛ <@${userId}> Hết thời gian xử lý sự cố. Bản dịch đã bị trả lại!`);
            }
        });
    },
};
