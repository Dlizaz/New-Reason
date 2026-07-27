// data/professions.js
// Danh sách 10 ngành nghề cố định của Milky Galaxy.
// `id` là khóa nội bộ (khớp với tên file trong data/items/<id>.js và
// commands/minigames/<id>.js) — KHÔNG đổi id sau khi người chơi đã chọn ngành,
// vì id được lưu thẳng vào DB.

module.exports = [
    {
        id: 'nong-nghiep',
        name: 'Kỹ Sư Nông Nghiệp',
        emoji: '🌾',
        desc: 'Nuôi dưỡng mầm sống từ đất đá khoáng thạch, làm chủ trang trại vũ trụ.',
    },
    {
        id: 'tai-chinh',
        name: 'Chuyên Viên Tài Chính',
        emoji: '💰',
        desc: 'Điều phối dòng tín dụng năng lượng, làm chủ thị trường khoáng thạch.',
    },
    {
        id: 'kien-truc',
        name: 'Kiến Trúc Sư',
        emoji: '🏛️',
        desc: 'Quy hoạch và kiến tạo không gian sống giữa các vì sao.',
    },
    {
        id: 'bep-truong',
        name: 'Bếp Trưởng Sinh Học',
        emoji: '🍳',
        desc: 'Chế biến nguồn dinh dưỡng từ nguyên liệu ngoài hành tinh.',
    },
    {
        id: 'y-te',
        name: 'Chuyên Gia Y Tế',
        emoji: '⚕️',
        desc: 'Chăm sóc sức khỏe cư dân trong môi trường khắc nghiệt của vũ trụ.',
    },
    {
        id: 'du-lieu',
        name: 'Nhà Phân Tích Dữ Liệu',
        emoji: '📊',
        desc: 'Giải mã luồng dữ liệu khổng lồ từ mạng lưới liên hành tinh.',
    },
    {
        id: 'it',
        name: 'Chuyên Viên IT',
        emoji: '💻',
        desc: 'Vận hành và bảo trì hệ thống mạng, vi mạch quang học toàn hành tinh.',
    },
    {
        id: 'truyen-thong',
        name: 'Chuyên Gia Truyền Thông',
        emoji: '📡',
        desc: 'Kết nối thông tin giữa các trạm không gian và cư dân thiên hà.',
    },
    {
        id: 'co-khi',
        name: 'Kỹ Thuật Viên Cơ Khí',
        emoji: '⚙️',
        desc: 'Chế tạo, sửa chữa máy móc vận hành bằng năng lượng khoáng thạch.',
    },
    {
        id: 'ngon-ngu',
        name: 'Chuyên Gia Ngôn Ngữ Học',
        emoji: '🗣️',
        desc: 'Phiên dịch và giải mã ngôn ngữ của các nền văn minh ngoài hành tinh.',
    },
];
