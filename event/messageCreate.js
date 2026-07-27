const { EmbedBuilder } = require('discord.js');

// Database giả lập (lưu tạm trên RAM)
const userData = new Map();

// Kho Vật Phẩm (Gacha Item Pool) chia theo độ hiếm
const ITEM_POOL = [
    // --- BẬC SSR (Tỷ lệ 5%) ---
    { name: "Viên Đá Vô Cực", rarity: "SSR", icon: "💎", desc: "Chứa năng lượng nguyên thủy siêu cấp.", color: 0xe74c3c },
    { name: "Trái Tim Tinh Anh", rarity: "SSR", icon: "💖", desc: "Tăng tối đa chỉ số cho toàn bộ trang trại.", color: 0xe91e63 },
    { name: "Chìa Khóa Vàng", rarity: "SSR", icon: "🔑", desc: "Mở khóa các kho báu bí ẩn nhất.", color: 0xf1c40f },

    // --- BẬC SR (Tỷ lệ 25%) ---
    { name: "Mảnh Kim Cương", rarity: "SR", icon: "🔷", desc: "Nguyên liệu chế tạo cao cấp.", color: 0x3498db },
    { name: "Túi Hạt Giống Hiếm", rarity: "SR", icon: "🎒", desc: "Cho ra các loại cây trồng giá trị cao.", color: 0x2ecc71 },
    { name: "Bình Năng Lượng", rarity: "SR", icon: "🧪", desc: "Hồi phục năng lượng trang trại tức thì.", color: 0x9b59b6 },

    // --- BẬC R (Tỷ lệ 70%) ---
    { name: "Đá Cuội Sinh Học", rarity: "R", icon: "🪨", desc: "Nguyên liệu xây dựng cơ bản.", color: 0x95a5a6 },
    { name: "Gói Phân Bón Vi Sinh", rarity: "R", icon: "🌱", desc: "Giúp cây trồng lớn nhanh hơn một chút.", color: 0x1abc9c },
    { name: "Chậu Cây Gỗ", rarity: "R", icon: "🪵", desc: "Dùng để trồng các loại rau củ nhỏ.", color: 0x795548 }
];

// Hàm random vật phẩm theo tỷ lệ độ hiếm (SSR: 5%, SR: 25%, R: 70%)
function rollGachaItem() {
    const rand = Math.random() * 100;
    let targetRarity = "R";

    if (rand < 5) targetRarity = "SSR";
    else if (rand < 30) targetRarity = "SR";
    else targetRarity = "R";

    const pool = ITEM_POOL.filter(item => item.rarity === targetRarity);
    return pool[Math.floor(Math.random() * pool.length)];
}

module.exports = async (client, message) => {
    if (message.author.bot) return;

    const userId = message.author.id;

    if (!userData.has(userId)) {
        userData.set(userId, { credits: 1000, inventory: [] });
    }

    const user = userData.get(userId);
    const args = message.content.trim().split(/ +/);
    const command = args[0].toLowerCase();

    // ==========================================
    // 1. LỆNH GACHA VẬT PHẨM (!roll)
    // ==========================================
    if (command === '!roll') {
        if (user.credits < 100) {
            return message.reply("❌ Bạn không đủ Tín Dụng Năng Lượng (cần 100) để quay!");
        }

        user.credits -= 100;
        const item = rollGachaItem();
        
        // Lưu cả tên và icon vào túi đồ
        user.inventory.push({ name: item.name, icon: item.icon, rarity: item.rarity });

        const embed = new EmbedBuilder()
            .setTitle(`${item.icon} RÚT VẬT PHẨM THÀNH CÔNG!`)
            .setDescription(`*${item.desc}*`)
            .setColor(item.color)
            .addFields(
                { name: "Vật Phẩm", value: `${item.icon} ${item.name}`, inline: true },
                { name: "Độ Hiếm", value: `**[${item.rarity}]**`, inline: true }
            )
            .setFooter({ text: `💰 Tín dụng còn lại: ${user.credits}` });

        return message.channel.send({ embeds: [embed] });
    }

    // ==========================================
    // 2. LỆNH XEM TÚI ĐỒ VẬT PHẨM (!inventory / !bag)
    // ==========================================
    if (command === '!inventory' || command === '!bag') {
        if (user.inventory.length === 0) {
            return message.reply("🎒 Túi đồ của bạn đang trống! Hãy gõ `!roll` để tìm vật phẩm đầu tiên.");
        }

        // Đếm số lượng từng vật phẩm trong túi
        const itemCounts = {};
        user.inventory.forEach(item => {
            const key = `${item.icon} **${item.name}** [${item.rarity}]`;
            itemCounts[key] = (itemCounts[key] || 0) + 1;
        });

        let inventoryList = "";
        for (const [itemText, count] of Object.entries(itemCounts)) {
            inventoryList += `• ${itemText} x${count}\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle(`🎒 TÚI ĐỒ VẬT PHẨM - ${message.author.username.toUpperCase()}`)
            .setColor(0x3498db)
            .addFields(
                { name: "💰 Tín Dụng", value: `${user.credits}`, inline: true },
                { name: "📦 Tổng Vật Phẩm", value: `${user.inventory.length}`, inline: true },
                { name: "📜 Danh Sách Vật Phẩm", value: inventoryList || "Trống" }
            );

        return message.channel.send({ embeds: [embed] });
    }

    // ==========================================
    // 3. LỆNH NÔNG NGHIỆP (!farm)
    // ==========================================
    if (command === '!farm') {
        const problems = [
            {
                desc: "🌿 Cây đang bị vàng lá, rễ còi cọc và thiếu Đạm trầm trọng!",
                options: "A. Khí Nitơ Đã Kích Hoạt\nB. Đá Quang Phổ\nC. Dịch Nguyên Sinh",
                answer: "A"
            },
            {
                desc: "🧪 Đất trồng đang bị chua, pH thấp khiến cây không hút được khoáng chất!",
                options: "A. Khí Nitơ\nB. Đá Vôi Cân Bằng pH\nC. Đá Trọng Lực",
                answer: "B"
            }
        ];

        const problem = problems[Math.floor(Math.random() * problems.length)];

        const embed = new EmbedBuilder()
            .setTitle("🚨 SỰ CỐ TRANG TRẠI")
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
                message.channel.send(`✅ Xử lý chính xác! Năng suất tăng vọt. Bạn nhận được **+200 Tín dụng** (Hiện có: ${user.credits}).`);
            } else {
                message.channel.send("❌ Sai phương pháp rồi! Cây trồng đã chết héo rũ, trang trại thất thu.");
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send(`⌛ <@${userId}> Hết thời gian xử lý sự cố. Cây trồng đã hư hại!`);
            }
        });
    }
};
