<?php
class Material {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function getByTag($tag) {
        if ($tag === 'ALL' || empty($tag)) {
            $stmt = $this->db->prepare("SELECT * FROM materials ORDER BY created_at DESC");
            $stmt->execute();
        } else {
            if (!in_array($tag, ['V', 'A', 'K'])) {
                $tag = 'ALL';
            }
            $stmt = $this->db->prepare("SELECT * FROM materials WHERE tag = ? OR tag = 'ALL' ORDER BY created_at DESC");
            $stmt->execute([$tag]);
        }
        return $stmt->fetchAll();
    }
}