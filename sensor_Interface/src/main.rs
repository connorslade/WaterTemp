extern crate rand;
extern crate tiny_http;

use simple_config_parser::config::Config;
use std::env;
use std::thread;

mod common;
mod logging;
mod server;

/// Server Version
pub static VERSION: &str = "0.7";

/// Main entry point
fn main() {
    // Check for Run Args
    let args: Vec<String> = env::args().collect();
    let mut debug = args.iter().any(|i| i == "--debug");

    // Load config file
    let mut cfg = Config::new(Some("config.ini"));
    cfg.read().ok().expect("Error reading config file :/");

    // Get some config values
    let ip = &cfg.get("ip").unwrap()[..];
    let port = cfg.get("port").unwrap().parse::<u32>().unwrap();
    let dev_id = cfg.get("dev_id").unwrap();
    let logging = cfg.get_bool("logging").unwrap();
    let log_delay = cfg.get_int("log_delay").unwrap();
    let log_file = cfg.get("log_file").unwrap();
    let calibration = cfg.get_float("calibration").unwrap();
    debug = debug || cfg.get_bool("debug").unwrap();

    let event_log_cfg = logging::LogCfg {
        do_log: cfg.get_bool("event_logging").unwrap(),
        file: cfg.get("event_log_file").unwrap(),
    };

    // Print some info
    logging::log_event(
        &event_log_cfg,
        format!(
            "{} {} {} {}",
            common::color_bold("[*] Starting Sensor Interface", 32),
            common::color(&format!("[v{}]", VERSION)[..], 34),
            common::ret_if(logging, common::color_bold("LOGGING", 36)),
            common::ret_if(debug, common::color_bold("DEBUG", 31))
        ),
    );

    logging::log_event(
        &event_log_cfg,
        format!(
            "{} {}",
            common::color("[*] Device ID:", 32),
            common::color(&dev_id[..], 34)
        ),
    );

    logging::log_event(
        &event_log_cfg,
        format!(
            "{}{}",
            common::color("[*] Serving on: ", 32),
            common::color(&format!("{}:{}", ip, port)[..], 36)
        ),
    );

    // Start Logging thread
    if logging {
        thread::spawn(move || {
            logging::start_data_logging(
                &cfg.get("log_file").unwrap()[..],
                log_delay,
                debug,
                cfg.get("dev_id").unwrap(),
                calibration,
            )
        });
    }

    // Start web server
    server::start(
        server::init(ip, port),
        debug,
        &dev_id[..],
        log_delay,
        &log_file,
        calibration,
        &event_log_cfg,
    );
}
