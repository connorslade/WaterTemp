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

    // let mut cfg = config::Config::new("config.ini");
    // cfg.read().ok().unwrap();

    // println!("MESSAGE: {}", cfg.get("message"))

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
    server::start(server::init("127.0.0.1", 3030), debug);
}
