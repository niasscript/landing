<?php
/**
 * capture_lead.php
 * UPSC Compatibility Assessment - Secure Frappe CRM Lead Capture Proxy
 * 
 * Place this file in the root folder of your live website (upscoaching.in).
 * 
 * Visitors submit lead details to this script, which forwards the request to 
 * crm.upsccoaching.in using cURL. This hides the API keys from public view 
 * and bypasses cross-origin (CORS) restriction locks.
 */

// Enable CORS headers so local testing and live domains can submit
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle OPTIONS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed. Use POST."]);
    exit;
}

// Read raw JSON post input
$input = file_get_contents("php://input");
$leadData = json_decode($input, true);

if (!$leadData || empty($leadData['name']) || empty($leadData['email']) || empty($leadData['phone'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Bad Request. Missing required parameters (name, email, phone)."]);
    exit;
}

// ==========================================
// CONFIGURATION (Update with your credentials)
// ==========================================
$frappeUrl = "https://crm.upsccoaching.in/api/resource/CRM%20Lead";
$apiKey = "YOUR_FRAPPE_API_KEY";         // Replace with your generated CRM API key
$apiSecret = "YOUR_FRAPPE_API_SECRET";   // Replace with your generated CRM API secret

// Map parameters into Frappe CRM field scheme
$payload = [
    "first_name" => $leadData["name"],
    "email_id"   => $leadData["email"],
    "mobile_no"  => $leadData["phone"],
    "source"     => "Website - UPSC Assessment",
    "description"=> "UPSC Compatibility Assessment Result: " . $leadData["quizScore"] . "% Compatibility. Time Taken: " . ($leadData["timeTaken"] ?? "unknown")
];

// Initialize cURL connection
$ch = curl_init($frappeUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Accept: application/json",
    "Authorization: token " . $apiKey . ":" . $apiSecret
]);

// Execute cURL request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    $errorMsg = curl_error($ch);
    curl_close($ch);
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server connection error to CRM", "details" => $errorMsg]);
    exit;
}

curl_close($ch);

// Return response status matching CRM status codes
if ($httpCode >= 200 && $httpCode < 300) {
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "message" => "Lead created successfully in Frappe CRM",
        "crm_response" => json_decode($response, true)
    ]);
} else {
    http_response_code($httpCode);
    echo json_encode([
        "status" => "error",
        "message" => "Frappe CRM rejected lead creation. Status Code: " . $httpCode,
        "details" => json_decode($response, true) ?? $response
    ]);
}
?>
