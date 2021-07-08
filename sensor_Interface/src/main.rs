extern crate rand;
extern crate tiny_http;

use std::env;
use simple_config_parser::config::Config;

mod common;
mod server;

/// Server Version
pub static VERSION: &str = "0.3";

/// Main entry point
fn main() {
    let args: Vec<String> = env::args().collect();
    let mut debug = args.iter().any(|i| i == "--debug");

    let mut cfg = Config::new(Some("config.ini"));
    cfg.read().ok().expect("Error reading config file :/");

    let ip = &cfg.get("ip").unwrap()[..];
    let port = cfg.get("port").unwrap().parse::<u32>().unwrap();
    let dev_id = cfg.get("dev_id").unwrap();
    debug = debug || cfg.get_bool("debug").unwrap();

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

    println!("{} {}",
        common::color("[*] Device ID:", 32),
        common::color(&dev_id.to_string()[..], 34)
    );
    
    println!(
        "{}{}",
        common::color("[*] Serving on: ", 32),
        common::color(&format!("{}:{}", ip, port)[..], 36)
    );

    server::start(server::init(ip, port), debug, dev_id);
}
