// 1. LỆNH GACHA NÂNG CẤP (!roll)
    if (command === '!roll') {
        const ROLL_COST = 100;
        const PITY_LIMIT = 50; // Roll 50 lần chắc chắn ra SSR

        if (user.credits < ROLL_COST) {
            return message.reply(`Tài khoản ngưng đọng! Bạn cần ${ROLL_COST} Tín dụng (Hiện có: ${user.credits}).`);
        }

        // Trừ tiền và tăng bộ đếm bảo hiểm (Pity)
        user.credits -= ROLL_COST;
        user.pity = (user.pity || 0) + 1;

        // Tính toán tỷ lệ (Rates)
        let rarityRolled = "";
        const rand = Math.random() * 100;

        if (user.pity >= PITY_LIMIT) {
            rarityRolled = "SSR"; // Kích hoạt bảo hiểm
            user.pity = 0; // Reset pity
        } else if (rand <= 5) {
            rarityRolled = "SSR"; // 5% ra SSR
            user.pity = 0; // Ra SSR thì reset pity luôn
        } else if (rand <= 25) {
            rarityRolled = "SR";  // 20% ra SR
        } else {
            rarityRolled = "R";   // 75% ra R
        }

        // Lọc tướng theo độ hiếm vừa quay được
        const availableCharacters = ROSTER.filter(char => char.rarity === rarityRolled);
        const gachaResult = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];

        // Xử lý hệ thống Kho đồ và Tướng trùng (Duplicate / Đột phá)
        // Lưu ý: Đổi inventory từ mảng [] sang Object {} để dễ quản lý dữ liệu nâng cao
        if (Array.isArray(user.inventory)) user.inventory = {}; // Fix lỗi nếu xài data cũ

        let isDuplicate = false;
        let shardsGained = 0;

        if (user.inventory[gachaResult.name]) {
            isDuplicate = true;
            // Nếu đã có tướng, chuyển thành Mảnh (Shards) để nâng cấp
            shardsGained = rarityRolled === "SSR" ? 50 : (rarityRolled === "SR" ? 20 : 5);
            user.inventory[gachaResult.name].shards += shardsGained;
        } else {
            // Thêm tướng mới vào kho
            user.inventory[gachaResult.name] = { level: 1, shards: 0 };
        }

        // Xây dựng giao diện Embed
        const embed = new EmbedBuilder()
            .setTitle(isDuplicate ? "🔄 CHUYỂN HÓA MẢNH KÝ ỨC!" : "🌟 CHIÊU MỘ THÀNH CÔNG!")
            .setDescription(isDuplicate 
                ? `Nhân sự **${gachaResult.name}** đã có trong đội hình. Dữ liệu được chuyển hóa thành **+${shardsGained} Mảnh Đột Phá**.` 
                : `Tín hiệu tần số đã kết nối thành công với một nhân sự mới.`)
            .setColor(gachaResult.color)
            .addFields(
                { name: "Tên Nhân Sự", value: gachaResult.name, inline: true },
                { name: "Độ Hiếm", value: gachaResult.rarity, inline: true },
                { name: "Chuyên Ngành", value: gachaResult.role, inline: true }
            );

        if (!isDuplicate) {
            // Lần đầu roll ra sẽ hiển thị ảnh thẻ bài lung linh
            // embed.setImage('LINK_ẢNH_DIGITAL_PAINTING_CỦA_BẠN');
        }

        embed.setFooter({ text: `Bảo hiểm SSR: ${user.pity}/${PITY_LIMIT} | Tín dụng: ${user.credits}` });

        return message.channel.send({ embeds: [embed] });
    }
