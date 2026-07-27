require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

// Khởi tạo Client với các quyền (intents) cần thiết để đọc tin nhắn
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent // Bắt buộc phải có để bot đọc được nội dung lệnh (như !roll, !farm)
    ]
});

// Database giả lập (lưu tạm trên RAM, thực tế nên dùng MongoDB/MySQL/SQLite)
const userData = new Map();

// Danh sách Tướng/Nhân sự (Gacha Pool)
const ROSTER = [
    { name: "Kỹ Sư Nông Nghiệp", rarity: "SSR", role: "Nông Nghiệp", color: 0x2ecc71 },
    { name: "Bếp Trưởng Sinh Học", rarity: "SR", role: "Chế Biến", color: 0xe67e22 },
    { name: "Chuyên Viên Tài Chính", rarity: "SSR", role: "Tài Chính", color: 0xf1c40f },
    { name: "Thực Tập Sinh IT", rarity: "R", role: "Công Nghệ", color: 0x3498db }
];

// Sự kiện khi bot khởi động thành công
client.once('ready', () => {
    console.log(`✅ Bot đã sẵn sàng hoạt động dưới tên: ${client.user.tag}`);
});

// Hàm xử lý chính khi có tin nhắn tới
client.on('messageCreate', async (message) => {
    // Bỏ qua tin nhắn của bot khác để tránh lặp vô hạn
    if (message.author.bot) return;

    const userId = message.author.id;
    
    // Khởi tạo data cho người chơi mới
    if (!userData.has(userId)) {
        userData.set(userId, { credits: 1000, inventory: [] });
    }
    
    const user = userData.get(userId);
    // Tách tin nhắn thành mảng để lấy lệnh
    const args = message.content.trim().split(/ +/);
    const command = args[0].toLowerCase();

    // ==========================================
    // 1. LỆNH GACHA (!roll)
    // ==========================================
    if (command === '!roll') {
        if (user.credits < 100) {
            return message.reply("❌ Bạn không đủ Tín Dụng Năng Lượng (cần 100) để chiêu mộ!");
        }

        // Trừ tiền và random thẻ
        user.credits -= 100;
        const gachaResult = ROSTER[Math.floor(Math.random() * ROSTER.length)];
        user.inventory.push(gachaResult.name);

        // Tạo Embed hiển thị thẻ bài
        const embed = new EmbedBuilder()
            .setTitle("🌟 CHIÊU MỘ THÀNH CÔNG!")
            .setDescription("Tín hiệu tần số đã kết nối với một nhân sự mới.")
            .setColor(gachaResult.color)
            .addFields(
                { name: "Tên Nhân Sự", value: gachaResult.name, inline: true },
                { name: "Độ Hiếm", value: gachaResult.rarity, inline: true },
                { name: "Chuyên Ngành", value: gachaResult.role, inline: true }
            )
            .setFooter({ text: `Tín dụng còn lại: ${user.credits}` });
            
        // Chèn link ảnh Digital Painting của bạn vào đây (Bỏ comment dòng dưới để dùng)
        // embed.setImage('URL_ẢNH_CỦA_BẠN');

        return message.channel.send({ embeds: [embed] });
    }

    // ==========================================
    // 2. LỆNH NÔNG NGHIỆP (!farm)
    // ==========================================
    if (command === '!farm') {
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

        // Chọn ngẫu nhiên 1 câu hỏi
        const problem = problems[Math.floor(Math.random() * problems.length)];

        const embed = new EmbedBuilder()
            .setTitle("🚨 SỰ CỐ NÔNG NGHIỆP TRANG TRẠI")
            .setColor(0xe74c3c)
            .addFields(
                { name: "Tình trạng", value: problem.desc },
                { name: "Cách xử lý (Gõ A, B hoặc C vào chat)", value: problem.options }
            );

        await message.channel.send({ embeds: [embed] });

        // Bộ lọc: chỉ nhận tin nhắn từ người gõ lệnh và nội dung phải là A, B, hoặc C
        const filter = m => ['A', 'B', 'C'].includes(m.content.toUpperCase()) && m.author.id === message.author.id;
        
        // Chờ phản hồi trong 30 giây
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
            // Nếu sau 30s không ai trả lời
            if (collected.size === 0) {
                message.channel.send(`⌛ <@${userId}> Hết thời gian xử lý sự cố. Cây trồng đã hư hại!`);
            }
        });
    }
});

// Đăng nhập Bot bằng Token (Thay chuỗi bên dưới bằng Token bot của bạn)
client.login(process.env.TOKEN);
