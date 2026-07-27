// commands/roll.js
// Lệnh !roll — cơ chế "Nghịch lý 95% - 5%":
//   95%: vật phẩm rơi ra thuộc đúng ngành nghề của người chơi
//    5%: vật phẩm "lệch ngành" — rơi vào 1 trong các ngành còn lại
// Trong mỗi lượt, độ hiếm (SSR/SR/R) được random riêng theo tỷ lệ ở
// data/rarityConfig.js, sau đó mới chọn ngẫu nhiên 1 item cùng bậc đó
// trong pool của ngành đã xác định.

const { EmbedBuilder } = require('discord.js');
const { itemsByProfession, availableProfessionIds } = require('../data/items');
const RARITY = require('../data/rarityConfig');
const professions = require('../data/professions');

const ROLL_COST = 100;
const OFF_PROFESSION_CHANCE = 0.05; // 5% "biến số định mệnh"

function professionName(id) {
    const p = professions.find((x) => x.id === id);
    return p ? `${p.emoji} ${p.name}` : id;
}

/** Random 1 bậc độ hiếm theo tỷ lệ % khai báo trong rarityConfig. */
function rollRarity() {
    const rand = Math.random() * 100;
    let acc = 0;
    for (const key of RARITY.ORDER) {
        acc += RARITY[key].chance;
        if (rand < acc) return key;
    }
    return RARITY.ORDER[RARITY.ORDER.length - 1]; // fallback an toàn
}

/**
 * Xác định ngành nghề sẽ lấy vật phẩm (95% ngành của user, 5% ngành khác),
 * chỉ tính trong số các ngành ĐÃ có dữ liệu item.
 */
function pickTargetProfession(userProfessionId) {
    const others = availableProfessionIds.filter((id) => id !== userProfessionId);
    const ownHasData = availableProfessionIds.includes(userProfessionId);

    const rollOffProfession = Math.random() < OFF_PROFESSION_CHANCE;

    if (rollOffProfession && others.length > 0) {
        return others[Math.floor(Math.random() * others.length)];
    }

    if (ownHasData) return userProfessionId;

    // Ngành của user chưa có data nhưng có ngành khác sẵn sàng -> fallback
    if (others.length > 0) {
        return others[Math.floor(Math.random() * others.length)];
    }

    return null; // không có ngành nào có dữ liệu item cả
}

/** Chọn 1 item ngẫu nhiên đúng bậc rarity trong pool; fallback nếu bậc đó trống. */
function pickItem(pool, rarity) {
    let candidates = pool.filter((item) => item.rarity === rarity);
    if (candidates.length === 0) candidates = pool; // fallback: bậc đó chưa có item nào
    return candidates[Math.floor(Math.random() * candidates.length)];
}

module.exports = {
    name: 'roll',
    description: `Quay vật phẩm chuyên ngành (tốn ${ROLL_COST} tín dụng).`,

    async execute(message, args, ctx) {
        const { db } = ctx;
        const userId = message.author.id;
        const user = await db.getOrCreateUser(userId);

        if (!user.profession) {
            return message.reply('❌ Bạn chưa đăng ký ngành nghề. Gõ `!chon` trước đã nhé.');
        }

        if (user.credits < ROLL_COST) {
            return message.reply(
                `❌ Không đủ Tín Dụng Năng Lượng! Cần **${ROLL_COST}**, bạn hiện có **${user.credits}**.`
            );
        }

        if (availableProfessionIds.length === 0) {
            return message.reply('⚠️ Hệ thống chưa có dữ liệu vật phẩm cho bất kỳ ngành nào. Báo admin nhé.');
        }

        const targetProfessionId = pickTargetProfession(user.profession);
        if (!targetProfessionId) {
            return message.reply('⚠️ Không tìm được ngành nào có dữ liệu vật phẩm để quay. Báo admin nhé.');
        }

        // Trừ tiền trước khi random để tránh spam lệnh khi lag/race-condition
        const remainingCredits = await db.addCredits(userId, -ROLL_COST);

        const rarity = rollRarity();
        const pool = itemsByProfession[targetProfessionId];
        const item = pickItem(pool, rarity);

        const { isDuplicate, quantity } = await db.addItemToInventory(userId, item, targetProfessionId);

        const isOffProfession = targetProfessionId !== user.profession;
        const meta = RARITY[item.rarity];

        const embed = new EmbedBuilder()
            .setTitle(`${meta.icon} ${isOffProfession ? 'BIẾN SỐ ĐỊNH MỆNH!' : 'RÚT VẬT PHẨM THÀNH CÔNG!'}`)
            .setDescription(`*${item.desc}*`)
            .setColor(meta.color)
            .addFields(
                { name: 'Vật Phẩm', value: item.name, inline: true },
                { name: 'Độ Hiếm', value: `**[${item.rarity}]**`, inline: true },
                { name: 'Thuộc Ngành', value: professionName(targetProfessionId), inline: true }
            )
            .setFooter({
                text: `${isDuplicate ? `Đã có sẵn — số lượng: ${quantity} | ` : ''}💰 Tín dụng còn lại: ${remainingCredits}`,
            });

        if (isOffProfession) {
            embed.addFields({
                name: '⚡ Lệch ngành',
                value: `Một biến số hiếm gặp — vật phẩm này không thuộc chuyên môn ${professionName(user.profession)} của bạn!`,
            });
        }

        return message.channel.send({ embeds: [embed] });
    },
};
