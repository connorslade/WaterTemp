extern crate rand;
extern crate tiny_http;

use simple_config_parser::config::Config;
use std::env;
use std::thread;

mod common;
mod logging;
mod sensor;
mod server;

/// Server Version
pub static VERSION: &str = "0.8";

/// Main entry point
fn main() {
    // Check for Run Args
    let args: Vec<String> = env::args().collect();
    let mut debug = args.iter().any(|i| i == "--debug");

    // Load config file
    let mut cfg = Config::new(Some("config.ini"));
    cfg.read().ok().expect("[-] Error reading config file :/");

    // Get some config values
    let ip = &cfg.get("ip").unwrap()[..];
    let port = cfg.get("port").unwrap().parse::<u32>().unwrap();
    let logging = cfg.get_bool("logging").unwrap();
    let log_delay = cfg.get_int("log_delay").unwrap();
    let log_file = cfg.get("log_file").unwrap();
    debug = debug || cfg.get_bool("debug").unwrap();

    let event_log_cfg = logging::LogCfg {
        do_log: cfg.get_bool("event_logging").unwrap(),
        file: cfg.get("event_log_file").unwrap(),
    };

    // Get all sensors from config
    let sensors: Vec<sensor::Sensor> = sensor::get_sensors(&cfg.data, debug);

    // If there are no sensors, panic
    if sensors.is_empty() {
        println!("{}", common::color("[-] No Sensors defined :/", 31));
        panic!("No Sensors defined :/");
    }

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

    let mut sensor_names = "".to_string();
    for sensor in &sensors {
        sensor_names.push_str(&format!("{}, ", sensor.name)[..]);
    }
    sensor_names = sensor_names[0..sensor_names.len() - 2].to_string();
    logging::log_event(
        &event_log_cfg,
        format!(
            "{} {} {}",
            common::color("[*] Found Devices:", 32),
            common::color(&sensors.len().to_string(), 34),
            common::color(&format!("[{}]", sensor_names), 34),
        ),
    );

    logging::log_event(
        &event_log_cfg,
        format!(
            "{} {} {}",
            common::color("[*] Main Device ID:", 32),
            common::color(&sensors[0].id[..], 34),
            common::color(&format!("[{}]", &sensors[0].name[..]), 34),
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
    let mut log_sensors: Vec<sensor::Sensor> = Vec::new();
    for i in &sensors {
        log_sensors.push(i.clone());
    }
    if logging {
        thread::spawn(move || {
            logging::start_data_logging(&cfg.get("log_file").unwrap()[..], log_delay, log_sensors)
        });
    }

    // Start web server
    server::start(
        server::init(ip, port),
        debug,
        sensors,
        log_delay,
        &log_file,
        &event_log_cfg,
    );
}
