<?php
header("Content-Type: application/json");

// Получаем путь из GET-параметра, например: data.php?file=data.json
$file = isset($_GET['file']) ? basename($_GET['file']) : 'data.json';

// Проверяем, существует ли файл в текущей директории
if (file_exists($file)) {
    echo file_get_contents($file);
} else {
    echo json_encode(["error" => "Файл не найден"]);
}
?>