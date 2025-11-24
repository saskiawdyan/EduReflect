<?php
class Badge {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    /**
     * Memberikan lencana ke user jika mereka belum memilikinya.
     *
     * @param int $userId ID pengguna
     * @param string $badgeKey Kunci programatik lencana (cth: 'first_reflection')
     * @return bool True jika lencana baru diberikan, false jika sudah punya atau gagal
     */
    public function awardBadge($userId, $badgeKey) {
        try {
            $stmt = $this->db->prepare("SELECT id FROM badges WHERE badge_key = ?");
            $stmt->execute([$badgeKey]);
            $badge = $stmt->fetch();

            if (!$badge) {
                return false;
            }
            $badgeId = $badge['id'];
            
            $stmt = $this->db->prepare("SELECT 1 FROM user_badges WHERE user_id = ? AND badge_id = ?");
            $stmt->execute([$userId, $badgeId]);
            
            if ($stmt->fetch()) {
                return false;
            }

            $stmt = $this->db->prepare("INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)");
            return $stmt->execute([$userId, $badgeId]);

        } catch (Exception $e) {
            error_log('Badge award error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Mengambil semua lencana yang dimiliki oleh user
     *
     * @param int $userId ID pengguna
     * @return array Daftar lencana
     */
    public function getBadgesByUserId($userId) {
        $stmt = $this->db->prepare(
            "SELECT b.name, b.description, b.icon_emoji, ub.earned_at 
             FROM badges b
             JOIN user_badges ub ON b.id = ub.badge_id
             WHERE ub.user_id = ?
             ORDER BY ub.earned_at DESC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }
}