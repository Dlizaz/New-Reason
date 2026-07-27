const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'it',
    description: 'Xử lý sự cố hệ thống IT để kiếm Tín dụng',

    async execute(message, args, userData) {
        const userId = message.author.id;

        if (!userData.has(userId)) {
            userData.set(userId, { credits: 1000, inventory: {}, pity: 0 });
        }

        const user = userData.get(userId);

        const problems = [
            {
                desc: "Máy chủ web đột ngột báo lỗi 502 Bad Gateway, người dùng không truy cập được!",
                options: "A. Khởi Động Lại Dịch Vụ Backend\nB. Xóa Cache Trình Duyệt\nC. Đổi Font Chữ Giao Diện",
                answer: "A"
            },
            {
                desc: "Hệ thống bị dò mật khẩu liên tục (brute-force) từ một dải IP lạ!",
                options: "A. Tường Lửa Giới Hạn Tốc Độ (Rate Limiting)\nB. Nén Dữ Liệu GZIP\nC. Tối Ưu Truy Vấn SQL",
                answer: "A"
            }
        ];

        const problem = problems[Math.floor(Math.random() * problems.length)];

        const embed = new EmbedBuilder()
            .setTitle("🚨 SỰ CỐ PHÒNG MÁY CHỦ")
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
                message.channel.send(`✅ Khắc phục thành công! Hệ thống hoạt động ổn định trở lại. Bạn được thưởng 200 Tín dụng (Hiện có: ${user.credits}).`);
            } else {
                message.channel.send("❌ Sai phương án rồi! Hệ thống sập, gây thiệt hại lớn.");
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send(`⌛ <@${userId}> Hết thời gian xử lý sự cố. Hệ thống đã downtime!`);
            }
        });
    },
};
