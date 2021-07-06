use super::sensor;

// I wish there was a nice way to do this, but I can't figure it out.

pub fn get_temp(req: &tiny_http::Request) -> String {
    println!("{}", req.url());
    let temp: i32 = sensor::get_temperature();
    return format!("Ello :P - Temp: {}", temp).to_string();
}

pub fn not_found(req: &tiny_http::Request) -> String {
    println!("{}", req.url());
    return "Error: Path Not Found :/".to_string();
}