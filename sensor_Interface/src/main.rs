extern crate tiny_http;
extern crate rand;

use std::env;

mod common;
mod server;

/// Server Version
pub static VERSION: &str = "0.3";

/// Main entry point
fn main() {
    let args: Vec<String> = env::args().collect();
    let mut debug = false;

    if args.iter().any(|i| i == "--debug") {
        debug = true;
    }

    println!(
        "{} {} {}",
        common::color_bold("[*] Starting Sensor Interface", 32),
        common::color(&format!("[v{}]", VERSION)[..], 34),
        if debug {
            common::color_bold("DEBUG", 31)
        } else {
            "".to_string()
        }
    );
    server::start(server::init("0.0.0.0", 3030), debug);
}
