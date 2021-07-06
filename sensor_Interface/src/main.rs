mod common;
mod server;

pub static VERSION: &str = "0.2";

fn main() {
    println!(
        "{} {}",
        common::color_bold("[*] Starting Sensor Interface", 32),
        common::color(&format!("[v{}]", VERSION)[..], 34)
    );
    server::start(server::init("0.0.0.0", 3030));
}
