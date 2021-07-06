use super::super::*;
use super::sensor;

// I wish there was a nice way to do this, but I can't figure it out.

/// Run For All Requests
pub fn all(req: &tiny_http::Request) {
    println!("[*] Path:    {:?}\n[*] Method:  {:?}\n[*] Headers: {:?}",
        req.url(),
        req.method(),
        req.headers()
    );
}

/// Run on GET "/temp"
pub fn get_temp(_req: &tiny_http::Request) -> [String; 2] {
    let temp: i32 = sensor::get_temperature();
    [format!("{{\"temp\": {}}}", temp), "Content-type: application/json".to_string()]
}

/// Run on GET "/test"
/// Make sure everything is working :P
pub fn get_test(_req: &tiny_http::Request) -> [String; 2] {
    [format!("{{\"message\": \"All Systems are a Go!\", \"version\": {}}}", VERSION), "Content-type: application/json".to_string()]
}

/// Run when no specific route is defined
pub fn not_found(_req: &tiny_http::Request) -> [String; 2] {
    ["Error: Path Not Found :/".to_string(), "Content-type: text/plain".to_string()]
}