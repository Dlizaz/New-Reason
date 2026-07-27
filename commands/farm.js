const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'farm',
    description: 'Xử lý sự cố nông nghiệp để kiếm Tín dụng',
    
    async execute(message, args, userData) {
        const userId = message.author.id;

        // Khởi tạo data nếu người chơi chưa có
        if (!userData.has(userId)) {
            userData.set(userId, { credits: 1000, inventory: {}, pity: 0 });
        }

        const user = userData.get(userId);

        // Danh sách các câu hỏi/sự cố
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
            }
        ];

        // Chọn ngẫu nhiên một sự cố
        const problem = problems[Math.floor(Math.random() * problems.length)];

        // Tạo giao diện thông báo sự cố
        const embed = new EmbedBuilder()
            .setTitle("🚨 SỰ CỐ NÔNG NGHIỆP TRANG TRẠI")
            .setColor(0xe74c3c)
            .addFields(
                { name: "Tình trạng", value: problem.desc },
                { name: "Cách xử lý (Gõ A, B hoặc C vào chat)", value: problem.options }
            );

        await message.channel.send({ embeds: [embed] });

        // Bộ lọc: chỉ nhận câu trả lời A, B hoặc C từ đúng người gõ lệnh !farm
        const filter = m => ['A', 'B', 'C'].includes(m.content.toUpperCase()) && m.author.id === message.author.id;
        
        // Mở bộ thu thập tin nhắn, chờ tối đa 30 giây, chỉ lấy 1 tin nhắn hợp lệ đầu tiên
        const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 });

        collector.on('collect', m => {
            if (m.content.toUpperCase() === problem.answer) {
                user.credits += 200;
                message.channel.send(`✅ Xử lý chính xác! Năng suất tăng vọt. Bạn được thưởng 200 Tín dụng (Hiện có: ${user.credits}).`);
            } else {
                message.channel.send("❌ Sai phương pháp rồi! Cây trồng đã chết héo rũ, trang trại thất thu.");
            }
        });

        // Xử lý khi hết 30 giây mà người chơi không trả lời
        collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send(`⌛ <@${userId}> Hết thời gian xử lý sự cố. Cây trồng đã hư hại!`);
            }
        });
    },
};
