const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'taichinh',
    description: 'Xử lý sự cố tài chính để kiếm Tín dụng',

    async execute(message, args, userData) {
        const userId = message.author.id;

        if (!userData.has(userId)) {
            userData.set(userId, { credits: 1000, inventory: {}, pity: 0 });
        }

        const user = userData.get(userId);

        const problems = [
            {
                desc: "Báo cáo tài chính quý này mất cân đối, tổng Nợ không khớp với tổng Có!",
                options: "A. Đối Chiếu Lại Bút Toán Kế Toán\nB. Tăng Lãi Suất Ngân Hàng\nC. Phát Hành Cổ Phiếu Mới",
                answer: "A"
            },
            {
                desc: "Danh mục đầu tư biến động mạnh do tập trung quá nhiều vào một mã cổ phiếu!",
                options: "A. Mua Thêm Cổ Phiếu Đó\nB. Đa Dạng Hóa Danh Mục\nC. Rút Toàn Bộ Tiền Mặt",
                answer: "B"
            }
        ];

        const problem = problems[Math.floor(Math.random() * problems.length)];

        const embed = new EmbedBuilder()
            .setTitle("🚨 SỰ CỐ PHÒNG TÀI CHÍNH")
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
                message.channel.send(`✅ Xử lý chính xác! Sổ sách cân đối trở lại. Bạn được thưởng 200 Tín dụng (Hiện có: ${user.credits}).`);
            } else {
                message.channel.send("❌ Sai phương án rồi! Công ty bị phạt do sai lệch báo cáo.");
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send(`⌛ <@${userId}> Hết thời gian xử lý sự cố. Báo cáo đã bị trễ hạn!`);
            }
        });
    },
};
