const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'farm',
    description: 'Xử lý sự cố nông nghiệp để kiếm Tín dụng',

    async execute(message, args, userData) {
        const userId = message.author.id;

        if (!userData.has(userId)) {
            userData.set(userId, { credits: 1000, inventory: {}, pity: 0 });
        }

        const user = userData.get(userId);

        const problems = [
            {
                desc: "Cây đang bị vàng lá, rễ còi cọc và có dấu hiệu thiếu Đạm trầm trọng!",
                options: "A. Khí Nitơ Đã Kích Hoạt\nB. Đá Quang Phổ\nC. Dịch Nguyên Sinh",
                answer: "A"
            },
            {
                desc: "Đất trồng đang bị chua, pH thấp khiến cây không hút được khoáng chất!",
                options: "A. Khí Nitơ\nB. Đá Vôi Cân Bằng pH\nC. Đá Trọng Lực",
                answer: "B"
            },
            {
                desc: "Ruộng xuất hiện rệp sáp lây lan nhanh, lá non bị quăn queo hàng loạt!",
                options: "A. Bọ Rùa Thiên Địch\nB. Phân Đạm Cao Cấp\nC. Đèn Sưởi Nhiệt",
                answer: "A"
            },
            {
                desc: "Hệ thống tưới nhỏ giọt bị nghẹt, một nửa luống cây đang héo rũ vì thiếu nước!",
                options: "A. Thay Lưới Lọc Đầu Vòi\nB. Tăng Gấp Đôi Lượng Phân Bón\nC. Phủ Bạt Che Nắng",
                answer: "A"
            },
            {
                desc: "Trái cây gần thu hoạch xuất hiện đốm nâu lan rộng, nghi ngờ nấm bệnh trong điều kiện ẩm cao!",
                options: "A. Chế Phẩm Sinh Học Trị Nấm\nB. Tưới Thêm Nước Mỗi Ngày\nC. Bón Thúc Kali",
                answer: "A"
            },
            {
                desc: "Đàn chim và côn trùng gây hại kéo đến phá hoại vườn ươm hạt giống mới gieo!",
                options: "A. Lưới Chắn Vườn Ươm\nB. Máy Bơm Nước Áp Lực Cao\nC. Đèn LED Cực Tím",
                answer: "A"
            }
        ];

        const problem = problems[Math.floor(Math.random() * problems.length)];

        const embed = new EmbedBuilder()
            .setTitle("🚨 SỰ CỐ NÔNG NGHIỆP TRANG TRẠI")
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
                message.channel.send(`✅ Xử lý chính xác! Năng suất tăng vọt. Bạn được thưởng 200 Tín dụng (Hiện có: ${user.credits}).`);
            } else {
                message.channel.send("❌ Sai phương pháp rồi! Cây trồng đã chết héo rũ, trang trại thất thu.");
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send(`⌛ <@${userId}> Hết thời gian xử lý sự cố. Cây trồng đã hư hại!`);
            }
        });
    },
};
