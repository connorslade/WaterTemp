extern crate rand;
extern crate tiny_http;

use std::env;

mod common;
mod config;
mod server;

/// Server Version
pub static VERSION: &str = "0.3";

/// Main entry point
fn main() {
    let args: Vec<String> = env::args().collect();
    let debug = args.iter().any(|i| i == "--debug");

    let mut cfg = config::Config::new(Some("config.ini"));
    cfg.read().ok().unwrap();
    let ip = &cfg.get("ip")[..];
    let port = cfg.get("port").parse::<u32>().unwrap();

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

    println!(
        "{}{}",
        common::color("[*] Serving on: ", 32),
        common::color(&format!("{}:{}", ip, port)[..], 36)
    );

    server::start(server::init(ip, port), debug);
}
